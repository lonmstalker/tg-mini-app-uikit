import { useEffect, useRef, useState } from "react";
import { TKIcon, type TKIconName } from "../icons";
import { useControllable } from "../../internal/useControllable";
import { useLatest } from "../../internal/useLatest";
import { useTKLocale } from "../../foundation/i18n";

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
  const vRef = useLatest(v);
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
        minWidth: 44, // CC-03 / CTL-004 touch target
        minHeight: 44,
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
          inputMode="numeric"
          enterKeyHint="done"
          role="spinbutton"
          aria-label={locale.quantity}
          value={draft ?? String(v)}
          min={min}
          max={max}
          // Clamp + commit on every change so live consumers never read a stale or
          // out-of-range draft; keep only a transient empty/invalid draft visible (CTL-006).
          onChange={(e) => {
            const raw = e.target.value;
            const parsed = Number(raw);
            if (raw !== "" && Number.isFinite(parsed)) {
              setV(Math.min(max, Math.max(min, Math.round(parsed))));
              setDraft(null);
            } else {
              setDraft(raw);
            }
          }}
          // An empty/invalid field reverts to the last committed value on blur — never
          // clobber a valid quantity with `min` just because the field was cleared (CTL-006).
          onBlur={() => setDraft(null)}
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
