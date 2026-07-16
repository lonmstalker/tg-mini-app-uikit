import { forwardRef, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { TKIcon } from "../icons";
import { mergeRefs } from "../../internal/dom";
import { TKFocusRing } from "../../internal/FocusRing";
import { useControllable } from "../../internal/useControllable";
import { useLatest } from "../../internal/useLatest";
import { useTKLocale } from "../../foundation/i18n";

export interface TKOTPProps {
  length?: number;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Fires once the code is fully typed. */
  onComplete?: (value: string) => void;
  onResend?: () => void;
  successText?: ReactNode;
  resendPrompt?: ReactNode;
  resendLabel?: ReactNode;
  /** Name for form submission of the assembled code. */
  name?: string;
  testId?: string;
  style?: CSSProperties;
}

export const TKOTP = /* @__PURE__ */ forwardRef<HTMLInputElement, TKOTPProps>(function TKOTP(
  {
    length = 5,
    value,
    defaultValue = "",
    onChange,
    onComplete,
    onResend,
    successText,
    resendPrompt,
    resendLabel,
    name,
    testId,
    style,
  },
  forwardedRef,
) {
  const locale = useTKLocale();
  const [v, setV] = useControllable(value, defaultValue, onChange);
  const [focus, setFocus] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  // Stable merged ref so a parent re-render doesn't remount/refocus the hidden input (INP-006).
  const mergedRef = useMemo(() => mergeRefs(ref, forwardedRef), [forwardedRef]);
  const done = v.length === length;

  const completeRef = useLatest(onComplete);
  useEffect(() => {
    if (done) completeRef.current?.(v);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  return (
    // Mouse-only convenience: the real control is the full-cover hidden <input>
    // below (focusable, aria-labelled); this click just re-focuses it from the
    // caption area, so the wrapper stays presentational.
    <div role="presentation" data-testid={testId} onClick={() => ref.current?.focus()} style={{ cursor: "text", position: "relative", ...style }}>
      <input
        ref={mergedRef}
        value={v}
        onChange={(e) => setV(e.target.value.replace(/\D/g, "").slice(0, length))}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        inputMode="numeric"
        // Let the OS surface the SMS one-time-code suggestion and let it autofill —
        // so the field stays focusable/autofillable, just visually hidden (INP-003).
        autoComplete="one-time-code"
        name={name}
        aria-label={locale.oneTimeCode}
        // Cover the whole row (transparent), not a 1×1px speck: WebKit shows its
        // SMS one-time-code chip more reliably for a real-sized field, and a tap
        // anywhere lands on the input directly (INP-003).
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0 }}
      />
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        {Array.from({ length }).map((_, i) => {
          const filled = i < v.length;
          const active = focus && i === v.length && !done;
          return (
            <div
              key={i}
              style={{
                position: "relative",
                width: 46,
                height: 56,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "var(--tk-r-md)",
                background: "var(--tk-surface)",
                fontSize: "var(--tk-fz-title2)",
                fontWeight: 700,
                fontVariantNumeric: "tabular-nums",
                color: done ? "var(--tk-green)" : "var(--tk-text)",
                // Static inset border per state; the active ring fades on its
                // own layer (TKFocusRing) — box-shadow never animates.
                boxShadow: done
                  ? "inset 0 0 0 1.5px var(--tk-green)"
                  : active
                    ? "inset 0 0 0 1.5px var(--tk-accent)"
                    : "inset 0 0 0 1px var(--tk-sep)",
                transition: "color var(--tk-t2) var(--tk-ease)",
              }}
            >
              <TKFocusRing show={active} />
              {filled ? (
                <span className="tk-pop" style={{ display: "inline-block" }}>
                  {v[i]}
                </span>
              ) : active ? (
                <span className="tk-otp-caret" />
              ) : null}
            </div>
          );
        })}
      </div>
      <div
        style={{
          textAlign: "center",
          marginTop: 12,
          fontSize: "var(--tk-fz-caption)",
          color: done ? "var(--tk-green)" : "var(--tk-text-2)",
          fontWeight: done ? 600 : 400,
          transition: "color var(--tk-t2) var(--tk-ease)",
        }}
      >
        {done ? (
          <span className="tk-pop" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <TKIcon name="check" size={13} strokeWidth={3} /> {successText ?? locale.codeVerified}
          </span>
        ) : (
          <>
            {resendPrompt ?? locale.didntGetCode}{" "}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onResend?.();
              }}
              style={{
                border: "none",
                background: "transparent",
                padding: 0,
                color: "var(--tk-accent-ink)",
                font: "inherit",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {resendLabel ?? locale.resend}
            </button>
          </>
        )}
      </div>
    </div>
  );
});
