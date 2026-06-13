import { forwardRef, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { TKIcon } from "../icons";
import { mergeRefs } from "../../internal/dom";
import { useControllable } from "../../internal/useControllable";
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
    testId,
    style,
  },
  forwardedRef,
) {
  const locale = useTKLocale();
  const [v, setV] = useControllable(value, defaultValue, onChange);
  const [focus, setFocus] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const done = v.length === length;

  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;
  useEffect(() => {
    if (done) completeRef.current?.(v);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  return (
    <div data-testid={testId} onClick={() => ref.current?.focus()} style={{ cursor: "text", position: "relative", ...style }}>
      <input
        ref={mergeRefs(ref, forwardedRef)}
        value={v}
        onChange={(e) => setV(e.target.value.replace(/\D/g, "").slice(0, length))}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        inputMode="numeric"
        aria-label={locale.oneTimeCode}
        style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 1, height: 1 }}
      />
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        {Array.from({ length }).map((_, i) => {
          const filled = i < v.length;
          const active = focus && i === v.length && !done;
          return (
            <div
              key={i}
              style={{
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
                boxShadow: done
                  ? "inset 0 0 0 1.5px var(--tk-green)"
                  : active
                    ? "inset 0 0 0 1.5px var(--tk-accent), var(--tk-ring)"
                    : "inset 0 0 0 1px var(--tk-sep)",
                transition: "box-shadow var(--tk-t2) var(--tk-ease), color var(--tk-t2) var(--tk-ease)",
              }}
            >
              {filled ? (
                <span className="tk-pop" style={{ display: "inline-block" }}>
                  {v[i]}
                </span>
              ) : active ? (
                <span
                  style={{
                    width: 2,
                    height: 24,
                    background: "var(--tk-accent)",
                    borderRadius: 1,
                    animation: "tk-fade-in calc(900ms / var(--tk-ms)) ease-in-out infinite alternate",
                  }}
                />
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
