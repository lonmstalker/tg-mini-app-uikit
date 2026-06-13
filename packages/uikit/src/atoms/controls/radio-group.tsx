import { useRef } from "react";
import { tkRovingNext, tkTabbableIndex } from "../../internal/roving";
import { useControllable } from "../../internal/useControllable";
import { tkOptionItem, type TKOption } from "../../foundation/options";
import { useOptionalHaptics } from "../../foundation/telegram";

export interface TKRadioGroupProps {
  options: TKOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  testId?: string;
}

export function TKRadioGroup({ options, value, defaultValue, onChange, disabled, testId }: TKRadioGroupProps) {
  const items = options.map(tkOptionItem);
  const firstEnabled = items.find((item) => !item.disabled);
  const [val, setVal] = useControllable(value, defaultValue ?? firstEnabled?.value ?? "", onChange);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const haptics = useOptionalHaptics();
  const disabledAt = (i: number) => disabled || !!items[i]?.disabled;
  const tabbable = tkTabbableIndex(items.findIndex((item) => item.value === val), items.length, disabledAt);
  return (
    <div role="radiogroup" data-testid={testId} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {items.map((item, i) => {
        const on = item.value === val;
        const off = disabled || item.disabled;
        return (
          <button
            type="button"
            role="radio"
            aria-checked={on}
            key={item.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            tabIndex={i === tabbable ? 0 : -1}
            disabled={off}
            onClick={() => {
              haptics.selection();
              setVal(item.value);
            }}
            onKeyDown={(e) => {
              // WAI-ARIA radio: arrows move both focus and selection
              const next = tkRovingNext(e.key, i, items.length, disabledAt);
              if (next == null) return;
              e.preventDefault();
              setVal(items[next].value);
              refs.current[next]?.focus();
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              border: "none",
              background: "transparent",
              padding: 0,
              fontFamily: "inherit",
              fontSize: "var(--tk-fz-body)",
              color: "var(--tk-text)",
              cursor: "pointer",
              opacity: off ? 0.45 : 1,
              pointerEvents: off ? "none" : undefined,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 24,
                height: 24,
                borderRadius: "50%",
                boxShadow: on ? "inset 0 0 0 2px var(--tk-accent)" : "inset 0 0 0 2px var(--tk-text-3)",
                transition: "box-shadow var(--tk-t2) var(--tk-ease)",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: "var(--tk-accent)",
                  transform: on ? "scale(1)" : "scale(0)",
                  transition: "transform var(--tk-t2) var(--tk-spring)",
                }}
              />
            </span>
            <span style={{ textAlign: "left" }}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
