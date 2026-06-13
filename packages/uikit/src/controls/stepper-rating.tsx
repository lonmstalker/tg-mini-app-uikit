import { useEffect, useRef, useState } from "react";
import { TKIcon, type TKIconName } from "../icons";
import { useControllable } from "../internal/useControllable";
import { tkFormat, useTKLocale } from "../i18n";

/* ---------------- Quantity stepper ---------------- */

export interface TKStepperProps {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  onChange?: (value: number) => void;
  /** Allows typing the value directly. */
  editable?: boolean;
  testId?: string;
}

export function TKStepper({ value, defaultValue = 1, min = 0, max = 99, onChange, editable, testId }: TKStepperProps) {
  const locale = useTKLocale();
  const [v, setV] = useControllable(value, defaultValue, onChange);
  const [draft, setDraft] = useState<string | null>(null);
  const vRef = useRef(v);
  vRef.current = v;
  const repeat = useRef<{ t?: number; i?: number }>({});

  const stopRepeat = () => {
    window.clearTimeout(repeat.current.t);
    window.clearInterval(repeat.current.i);
    repeat.current = {};
  };
  useEffect(() => stopRepeat, []);

  const stepBy = (dir: 1 | -1) => setV(Math.min(max, Math.max(min, vRef.current + dir)));

  const btn = (icon: TKIconName, name: string, dir: 1 | -1, disabled: boolean) => (
    <button
      type="button"
      className="tk-press"
      aria-label={name}
      disabled={disabled}
      // pointer presses step immediately and autorepeat while held;
      // keyboard activation arrives as click with detail === 0
      onPointerDown={() => {
        stepBy(dir);
        repeat.current.t = window.setTimeout(() => {
          repeat.current.i = window.setInterval(() => stepBy(dir), 120);
        }, 400);
      }}
      onPointerUp={stopRepeat}
      onPointerLeave={stopRepeat}
      onPointerCancel={stopRepeat}
      onClick={(e) => {
        if (e.detail === 0) stepBy(dir);
      }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 34,
        height: 34,
        border: "none",
        borderRadius: "var(--tk-r-sm)",
        background: "var(--tk-surface)",
        color: disabled ? "var(--tk-text-3)" : "var(--tk-accent)",
        boxShadow: "var(--tk-shadow-sm)",
      }}
    >
      <TKIcon name={icon} size={16} strokeWidth={2.5} />
    </button>
  );
  return (
    <div
      data-testid={testId}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: 4,
        borderRadius: "var(--tk-r-md)",
        background: "var(--tk-surface-2)",
      }}
    >
      {btn("minus", locale.decrease, -1, v <= min)}
      {editable ? (
        <input
          type="number"
          role="spinbutton"
          aria-label={locale.quantity}
          value={draft ?? String(v)}
          min={min}
          max={max}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => {
            if (draft != null) {
              const parsed = Number(draft);
              if (Number.isFinite(parsed)) setV(Math.min(max, Math.max(min, Math.round(parsed))));
            }
            setDraft(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
          style={{
            width: 48,
            textAlign: "center",
            fontWeight: 700,
            fontSize: "var(--tk-fz-body)",
            fontFamily: "inherit",
            border: "none",
            outline: "none",
            background: "transparent",
            color: "var(--tk-text)",
            boxShadow: "none",
            MozAppearance: "textfield",
          }}
        />
      ) : (
        <span
          key={v}
          className="tk-pop"
          style={{ minWidth: 36, textAlign: "center", fontWeight: 700, fontSize: "var(--tk-fz-body)" }}
        >
          {v}
        </span>
      )}
      {btn("plus", locale.increase, 1, v >= max)}
    </div>
  );
}

/* ---------------- Rating ---------------- */

export interface TKRatingProps {
  max?: number;
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  /** Display-only: no hover, clicks do nothing. */
  readonly?: boolean;
  /** Render and accept half-star values (e.g. 3.5). */
  allowHalf?: boolean;
  testId?: string;
}

export function TKRating({ max = 5, value, defaultValue = 0, onChange, readonly, allowHalf, testId }: TKRatingProps) {
  const locale = useTKLocale();
  const [v, setV] = useControllable(value, defaultValue, onChange);
  const [hov, setHov] = useState(0);
  const shown = hov || v;
  return (
    <div role="group" aria-label={locale.rating} data-testid={testId} style={{ display: "flex", gap: 4 }}>
      {Array.from({ length: max }).map((_, i) => {
        const fill = Math.min(Math.max(shown - i, 0), 1); // 0 | 0.5 | 1 per star
        const on = fill > 0;
        const half = allowHalf && fill > 0 && fill < 1;
        return (
          <button
            type="button"
            key={i}
            aria-label={tkFormat(locale.ratingValue, { value: i + 1, max })}
            aria-pressed={!readonly && v >= i + 1}
            aria-disabled={readonly || undefined}
            tabIndex={readonly ? -1 : 0}
            onClick={
              readonly
                ? undefined
                : (e) => {
                    if (!allowHalf) return setV(i + 1);
                    const r = e.currentTarget.getBoundingClientRect();
                    setV(e.clientX - r.left < r.width / 2 && e.clientX > 0 ? i + 0.5 : i + 1);
                  }
            }
            onMouseEnter={readonly ? undefined : () => setHov(i + 1)}
            onMouseLeave={readonly ? undefined : () => setHov(0)}
            className={readonly ? undefined : "tk-press"}
            style={{
              border: "none",
              background: "transparent",
              padding: 2,
              color: on ? "var(--tk-orange)" : "var(--tk-text-3)",
              transition: "color var(--tk-t1) var(--tk-ease)",
              display: "inline-flex",
              position: "relative",
              cursor: readonly ? "default" : "pointer",
            }}
          >
            <span key={`${i}-${on}`} className={on && !readonly ? "tk-pop" : undefined} style={{ display: "inline-flex" }}>
              {half ? (
                <span style={{ position: "relative", display: "inline-flex" }}>
                  <TKIcon name="star" size={26} />
                  <span style={{ position: "absolute", inset: 0, width: "50%", overflow: "hidden", display: "inline-flex" }} data-tk-half-star>
                    <TKIcon name="star" size={26} filled />
                  </span>
                </span>
              ) : (
                <TKIcon name="star" size={26} filled={fill === 1} />
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
