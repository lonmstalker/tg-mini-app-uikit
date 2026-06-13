import { useRef, type CSSProperties } from "react";
import { tkOptionItem, type TKOption } from "../../foundation/options";
import { useControllable } from "../../internal/useControllable";
import { tkRovingNext, tkTabbableIndex } from "../../internal/roving";

export interface TKCategoryTabsProps {
  tabs: TKOption[];
  value?: number;
  defaultValue?: number;
  onChange?: (index: number) => void;
  style?: CSSProperties;
  testId?: string;
}

export function TKCategoryTabs({ tabs, value, defaultValue = 0, onChange, style, testId }: TKCategoryTabsProps) {
  const [active, setActive] = useControllable(value, defaultValue, onChange);
  const items = tabs.map(tkOptionItem);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const disabledAt = (index: number) => !!items[index]?.disabled;
  const tabbable = tkTabbableIndex(active, items.length, disabledAt);

  return (
    <div
      data-testid={testId}
      style={{ display: "flex", gap: 4, overflowX: "auto", scrollbarWidth: "none", padding: "0 12px", ...style }}
    >
      {items.map((item, index) => {
        const on = index === active;
        return (
          <button
            type="button"
            key={item.value}
            ref={(el) => {
              refs.current[index] = el;
            }}
            tabIndex={index === tabbable ? 0 : -1}
            disabled={item.disabled}
            onClick={() => setActive(index)}
            onKeyDown={(event) => {
              const next = tkRovingNext(event.key, index, items.length, disabledAt, "horizontal");
              if (next == null) return;
              event.preventDefault();
              setActive(next);
              refs.current[next]?.focus();
            }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              padding: "8px 10px 6px",
              border: "none",
              background: "transparent",
              fontSize: "var(--tk-fz-sub)",
              fontWeight: on ? 700 : 500,
              fontFamily: "inherit",
              color: on ? "var(--tk-text)" : "var(--tk-text-2)",
              cursor: item.disabled ? "default" : "pointer",
              opacity: item.disabled ? 0.45 : 1,
              whiteSpace: "nowrap",
              transition: "color var(--tk-t2) var(--tk-ease)",
            }}
          >
            {item.label}
            <span
              style={{
                width: 18,
                height: 3,
                borderRadius: 2,
                background: "var(--tk-accent)",
                transform: on ? "scaleX(1)" : "scaleX(0)",
                transition: "transform var(--tk-t2) var(--tk-spring)",
              }}
            />
          </button>
        );
      })}
    </div>
  );
}
