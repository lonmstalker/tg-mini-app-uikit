import { useLayoutEffect, useRef, useState } from "react";
import { tkOptionItem, type TKOption } from "../../foundation/options";
import { useOptionalHaptics } from "../../foundation/telegram";
import { useControllable } from "../../internal/useControllable";
import { tkRovingNext, tkTabbableIndex } from "../../internal/roving";

export interface TKSegmentedProps {
  options: TKOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  full?: boolean;
  /** Accessible name for the radiogroup (CC-04 / NAV-002). */
  ariaLabel?: string;
  testId?: string;
}

export function TKSegmented({ options, value, defaultValue, onChange, full, ariaLabel, testId }: TKSegmentedProps) {
  const items = options.map(tkOptionItem);
  const firstEnabled = items.find((item) => !item.disabled);
  const [val, setVal] = useControllable(value, defaultValue ?? firstEnabled?.value ?? "", onChange);
  const idx = Math.max(0, items.findIndex((item) => item.value === val));
  const n = items.length;
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const haptics = useOptionalHaptics();
  const disabledAt = (index: number) => !!items[index]?.disabled;
  const tabbable = tkTabbableIndex(idx, n, disabledAt);
  if (process.env.NODE_ENV !== "production" && !ariaLabel) {
    // eslint-disable-next-line no-console
    console.warn("TKSegmented: pass `ariaLabel` so the radiogroup has an accessible name (CC-04).");
  }
  // Measured geometry of the active button. `null` until the first layout pass
  // (and during SSR) — we fall back to the even-grid translate so there is no
  // flash. Measuring offsetLeft/offsetWidth keeps the indicator aligned for any
  // n and fractional 1fr columns where translateX(idx*100%) drifts.
  const [rect, setRect] = useState<{ left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    const measure = () => {
      const btn = refs.current[idx];
      if (!btn) return;
      setRect({ left: btn.offsetLeft, width: btn.offsetWidth });
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    const parent = refs.current[idx]?.parentElement;
    if (parent) ro.observe(parent);
    return () => ro.disconnect();
  }, [idx, n, full]);

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      data-testid={testId}
      style={{
        position: "relative",
        display: full ? "grid" : "inline-grid",
        gridTemplateColumns: `repeat(${n}, 1fr)`,
        width: full ? "100%" : undefined,
        padding: 3,
        borderRadius: "var(--tk-r-sm)",
        background: "var(--tk-surface-3)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 3,
          bottom: 3,
          ...(rect
            ? { left: rect.left, width: rect.width, transform: "none" }
            : { left: 3, width: `calc((100% - 6px) / ${n})`, transform: `translateX(${idx * 100}%)` }),
          transition: "transform var(--tk-t2) var(--tk-spring), left var(--tk-t2) var(--tk-spring), width var(--tk-t2) var(--tk-spring)",
          background: "var(--tk-surface)",
          borderRadius: "calc(var(--tk-r-sm) - 3px)",
          boxShadow: "var(--tk-shadow-sm)",
        }}
      />
      {items.map((item, index) => (
        <button
          type="button"
          key={item.value}
          ref={(el) => {
            refs.current[index] = el;
          }}
          role="radio"
          tabIndex={index === tabbable ? 0 : -1}
          disabled={item.disabled}
          aria-checked={item.value === val}
          onClick={() => {
            haptics.selection();
            setVal(item.value);
          }}
          onKeyDown={(event) => {
            const next = tkRovingNext(event.key, index, n, disabledAt, "horizontal");
            if (next == null) return;
            event.preventDefault();
            setVal(items[next].value);
            refs.current[next]?.focus();
          }}
          style={{
            position: "relative",
            zIndex: 1,
            minHeight: 44, // CC-03 / CTL-004 touch target
            border: "none",
            background: "transparent",
            padding: "7px 16px",
            fontSize: "var(--tk-fz-sub)",
            fontWeight: item.value === val ? 600 : 500,
            fontFamily: "inherit",
            color: item.disabled ? "var(--tk-text-3)" : item.value === val ? "var(--tk-text)" : "var(--tk-text-2)",
            cursor: item.disabled ? "default" : "pointer",
            opacity: item.disabled ? 0.45 : 1,
            transition: "color var(--tk-t2) var(--tk-ease)",
            whiteSpace: "nowrap",
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
