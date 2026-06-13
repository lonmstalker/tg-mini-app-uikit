import { useRef } from "react";
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
  testId?: string;
}

export function TKSegmented({ options, value, defaultValue, onChange, full, testId }: TKSegmentedProps) {
  const items = options.map(tkOptionItem);
  const firstEnabled = items.find((item) => !item.disabled);
  const [val, setVal] = useControllable(value, defaultValue ?? firstEnabled?.value ?? "", onChange);
  const idx = Math.max(0, items.findIndex((item) => item.value === val));
  const n = items.length;
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const haptics = useOptionalHaptics();
  const disabledAt = (index: number) => !!items[index]?.disabled;
  const tabbable = tkTabbableIndex(idx, n, disabledAt);

  return (
    <div
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
          left: 3,
          width: `calc((100% - 6px) / ${n})`,
          transform: `translateX(${idx * 100}%)`,
          transition: "transform var(--tk-t2) var(--tk-spring)",
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
          tabIndex={index === tabbable ? 0 : -1}
          disabled={item.disabled}
          aria-pressed={item.value === val}
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
