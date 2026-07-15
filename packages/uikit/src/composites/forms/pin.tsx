import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { TKIcon } from "../../atoms/icons";
import { tkFormat, useTKLocale } from "../../foundation/i18n";
import { useOptionalHaptics } from "../../foundation/telegram";
import { useLatest } from "../../internal/useLatest";

/* ---------------- Pin input ---------------- */

export interface TKPinInputProps {
  /** Fixed PIN length, or minimum length when `maxLength` is larger. */
  length?: number;
  /** Enables variable-length entry when larger than `length`. */
  maxLength?: number;
  onComplete?: (pin: string) => void;
  /** Shows the error shake and clears the entered digits. */
  error?: boolean;
  /** Pops the dots green (success haptic, `codeVerified` announced to AT). */
  success?: boolean;
  /** Adds a biometrics key to the pad. */
  onBiometricRequest?: () => void;
  title?: ReactNode;
  testId?: string;
  style?: CSSProperties;
}

/** PIN screen: dot indicators + on-screen 3×4 keypad, optional biometrics key. */
export function TKPinInput({
  length = 4,
  maxLength,
  onComplete,
  error,
  success,
  onBiometricRequest,
  title,
  testId,
  style,
}: TKPinInputProps) {
  const locale = useTKLocale();
  const haptics = useOptionalHaptics();
  const [pin, setPin] = useState("");
  // Bumped every time error feedback fires, so the shake/haptic re-trigger even
  // when `error` stays `true` across repeated wrong entries (a one-shot CSS
  // animation only restarts when the element is keyed afresh).
  const [shakeKey, setShakeKey] = useState(0);
  const completeRef = useLatest(onComplete);
  // Holds the post-complete clear so the filled dots paint for a beat first.
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(resetTimer.current), []);
  const maxDigits = maxLength || length;

  useEffect(() => {
    if (error) {
      clearTimeout(resetTimer.current);
      setPin("");
      setShakeKey((k) => k + 1);
      haptics.notification("error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  useEffect(() => {
    if (success) {
      clearTimeout(resetTimer.current);
      setPin("");
      haptics.notification("success");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [success]);

  const complete = (next: string) => {
    completeRef.current?.(next);
    // Paint the FULL set of dots first, then clear on a later tick. Clearing
    // in the same commit meant the last dot never lit — it read as "the last
    // tap didn't count" even on a correct code. An `error` clears immediately.
    clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setPin(""), PIN_FILL_HOLD_MS);
  };

  // Commit raw digits coming from the hidden field (hardware keyboard, SMS
  // autofill) or the on-screen pad through a single path, so both stay in sync.
  const setDigits = (raw: string) => {
    const next = raw.replace(/\D/g, "").slice(0, maxDigits);
    setPin(next);
    if (!maxLength && next.length === length) complete(next);
  };

  // Reconcile when `length`/`maxLength` change after digits were entered: truncate
  // to the new capacity and re-evaluate auto-complete for the fixed-length path, so
  // shrinking the length doesn't leave a too-long code or a missed complete (FRM-005).
  useEffect(() => {
    if (error) return; // the error effect owns clearing the pin — don't fight it / re-complete a rejected code
    const truncated = pin.slice(0, maxDigits);
    if (truncated !== pin) setPin(truncated);
    if (!maxLength && truncated.length === length && truncated.length > 0) complete(truncated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxDigits, length, maxLength]);

  const push = (digit: string) => {
    if (pin.length >= maxDigits) return;
    setDigits(pin + digit);
  };

  return (
    <div data-testid={testId} style={{ display: "flex", flexDirection: "column", gap: 18, ...style }}>
      {title}
      {/* Real, visually-hidden input over the dots: enables SMS one-time-code
          autofill, password managers, and hardware keyboards while the on-screen
          pad mirrors the same value. Kept outside the keyed shake wrapper below
          so an error re-trigger never drops the input's focus. */}
      <input
        value={pin}
        // `inputMode="none"` keeps the field usable for SMS one-time-code
        // autofill and a hardware keyboard (it stays focusable) WITHOUT raising
        // the OS soft keyboard over the custom pad's lower rows.
        inputMode="none"
        autoComplete="one-time-code"
        aria-label={locale.oneTimeCode}
        onChange={(e) => setDigits(e.target.value)}
        style={SR_ONLY}
      />
      {/* Announce entry progress (polite) and rejection (assertive) to AT, which
          a visual-only dot+shake leaves silent (FRM-004 / CC-05). */}
      <span role="status" aria-live="polite" style={SR_ONLY}>
        {pin.length > 0 ? tkFormat(locale.pinProgress, { n: pin.length, length: maxDigits }) : ""}
      </span>
      {error ? (
        <span role="alert" style={SR_ONLY}>
          {locale.error}
        </span>
      ) : null}
      {success ? (
        <span role="status" style={SR_ONLY}>
          {locale.codeVerified}
        </span>
      ) : null}
      {/* `key={shakeKey}` remounts this block on every error so the one-shot
          `tk-shake` animation re-plays even when `error` stays `true`. */}
      <div
        key={shakeKey}
        className={error ? "tk-shake" : undefined}
        style={{ display: "flex", flexDirection: "column", gap: 18 }}
      >
        {/* The dots are a decorative progress readout, not a text field — tapping
            them no longer focuses the hidden input (which would raise the OS
            keyboard over the pad). Entry goes through the on-screen pad. */}
        <div style={{ display: "flex", gap: 14, justifyContent: "center", minHeight: 14 }}>
          {/* Success feedback: the full row of dots pops back in green (the
              entered digits were already cleared by the post-complete reset). */}
          {Array.from({ length: success ? length : pin.length }).map((_, i) => (
            <span
              key={success ? `s${i}` : i}
              data-dot
              className={success ? "tk-pop" : undefined}
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: success ? "var(--tk-green)" : "var(--tk-accent)",
              }}
            />
          ))}
        </div>
        <div role="group" aria-label={locale.oneTimeCode} style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
            <button key={d} type="button" className="tk-press" style={KEY_STYLE} onClick={() => push(d)}>
              {d}
            </button>
          ))}
          {onBiometricRequest ? (
            <button
              type="button"
              className="tk-press"
              aria-label={locale.biometrics}
              style={{ ...KEY_STYLE, color: "var(--tk-accent-ink)" }}
              onClick={onBiometricRequest}
            >
              <TKIcon name="fingerprint" size={24} />
            </button>
          ) : (
            <span />
          )}
          <button type="button" className="tk-press" style={KEY_STYLE} onClick={() => push("0")}>
            0
          </button>
          <button
            type="button"
            className="tk-press"
            aria-label={locale.backspace}
            style={{ ...KEY_STYLE, color: "var(--tk-text-2)" }}
            onClick={() => setPin((p) => p.slice(0, -1))}
          >
            <TKIcon name="backspace" size={22} />
          </button>
        </div>
        {maxLength ? (
          <button
            type="button"
            className="tk-press"
            disabled={pin.length < length}
            onClick={() => complete(pin)}
            style={KEY_STYLE}
          >
            {locale.done}
          </button>
        ) : null}
      </div>
    </div>
  );
}

// How long the fully-entered dots stay lit before the field resets on success.
const PIN_FILL_HOLD_MS = 180;

const KEY_STYLE: CSSProperties = {
  minWidth: 44,
  height: 56,
  border: "none",
  borderRadius: "var(--tk-r-md)",
  background: "var(--tk-surface)",
  boxShadow: "var(--tk-shadow-sm)",
  fontFamily: "inherit",
  fontSize: "var(--tk-fz-title3)",
  fontWeight: 600,
  color: "var(--tk-text)",
  cursor: "pointer",
  // Centre the contents: digit glyphs *and* the block-level icon keys
  // (biometrics, backspace), which otherwise hug the left edge.
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

// Visually hidden but readable by assistive tech.
const SR_ONLY: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
};
