import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { TKIcon } from "../icons";
import { useTKLocale } from "../i18n";
import { useOptionalHaptics } from "../telegram";

/* ---------------- Pin input ---------------- */

export interface TKPinInputProps {
  length?: number;
  onComplete?: (pin: string) => void;
  /** Shows the error shake and clears the entered digits. */
  error?: boolean;
  /** Adds a biometrics key to the pad. */
  onBiometricRequest?: () => void;
  title?: ReactNode;
  testId?: string;
  style?: CSSProperties;
}

/** PIN screen: dot indicators + on-screen 3×4 keypad, optional biometrics key. */
export function TKPinInput({ length = 4, onComplete, error, onBiometricRequest, title, testId, style }: TKPinInputProps) {
  const locale = useTKLocale();
  const haptics = useOptionalHaptics();
  const [pin, setPin] = useState("");
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;

  useEffect(() => {
    if (error) {
      setPin("");
      haptics.notification("error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const push = (digit: string) => {
    setPin((p) => {
      if (p.length >= length) return p;
      const next = p + digit;
      if (next.length === length) {
        completeRef.current?.(next);
        return "";
      }
      return next;
    });
  };

  const keyStyle: CSSProperties = {
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
  };

  return (
    <div data-testid={testId} className={error ? "tk-shake" : undefined} style={{ display: "flex", flexDirection: "column", gap: 18, ...style }}>
      {title}
      <div aria-live="polite" style={{ display: "flex", gap: 14, justifyContent: "center" }}>
        {Array.from({ length }).map((_, i) => (
          <span
            key={i}
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: i < pin.length ? "var(--tk-accent)" : "var(--tk-surface-3)",
              boxShadow: error ? "0 0 0 2px var(--tk-red-12)" : "none",
              transition: "background var(--tk-t1) var(--tk-ease)",
            }}
          />
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <button key={d} type="button" className="tk-press" style={keyStyle} onClick={() => push(d)}>
            {d}
          </button>
        ))}
        {onBiometricRequest ? (
          <button
            type="button"
            className="tk-press"
            aria-label={locale.biometrics}
            style={{ ...keyStyle, color: "var(--tk-accent-ink)" }}
            onClick={onBiometricRequest}
          >
            <TKIcon name="fingerprint" size={24} />
          </button>
        ) : (
          <span />
        )}
        <button type="button" className="tk-press" style={keyStyle} onClick={() => push("0")}>
          0
        </button>
        <button
          type="button"
          className="tk-press"
          aria-label={locale.backspace}
          style={{ ...keyStyle, color: "var(--tk-text-2)" }}
          onClick={() => setPin((p) => p.slice(0, -1))}
        >
          <TKIcon name="backspace" size={22} />
        </button>
      </div>
    </div>
  );
}
