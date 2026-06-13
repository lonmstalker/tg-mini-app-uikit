import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { TKIcon, type TKIconName } from "../icons";
import { tkRovingNext, tkTabbableIndex } from "../../internal/roving";

export interface TKInlineButtonItem {
  id: string;
  label: ReactNode;
  icon?: TKIconName;
  disabled?: boolean;
  danger?: boolean;
  selected?: boolean;
  onClick?: () => void;
}

export interface TKInlineButtonsProps {
  items: TKInlineButtonItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
  equal?: boolean;
  size?: "sm" | "md";
  testId?: string;
  style?: CSSProperties;
}

export function TKInlineButtons({
  items,
  value,
  defaultValue = "",
  onChange,
  equal = true,
  size = "md",
  testId,
  style,
}: TKInlineButtonsProps) {
  const [inner, setInner] = useState(defaultValue);
  const active = value ?? inner;
  const height = size === "sm" ? 34 : 40;
  const fontSize = size === "sm" ? "var(--tk-fz-caption)" : "var(--tk-fz-sub)";
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const disabledAt = (i: number) => !!items[i]?.disabled;
  const [focusIdx, setFocusIdx] = useState(() => tkTabbableIndex(0, items.length, disabledAt));

  return (
    <div
      role="group"
      data-testid={testId}
      style={{
        display: "flex",
        gap: 6,
        padding: 4,
        borderRadius: "var(--tk-r-lg)",
        background: "var(--tk-surface-2)",
        ...style,
      }}
    >
      {items.map((item, i) => {
        const selected = item.selected ?? active === item.id;
        const color = item.danger ? "var(--tk-red)" : selected ? "var(--tk-on-accent)" : "var(--tk-text)";
        return (
          <button
            key={item.id}
            type="button"
            ref={(el) => {
              refs.current[i] = el;
            }}
            tabIndex={i === focusIdx ? 0 : -1}
            onFocus={() => setFocusIdx(i)}
            onKeyDown={(e) => {
              const next = tkRovingNext(e.key, i, items.length, disabledAt, "horizontal");
              if (next == null) return;
              e.preventDefault();
              setFocusIdx(next);
              refs.current[next]?.focus();
            }}
            aria-pressed={selected}
            disabled={item.disabled}
            className="tk-press"
            onClick={() => {
              if (item.disabled) return;
              if (value === undefined) setInner(item.id);
              onChange?.(item.id);
              item.onClick?.();
            }}
            style={{
              flex: equal ? 1 : "0 0 auto",
              minWidth: 0,
              height,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              padding: size === "sm" ? "0 10px" : "0 13px",
              border: "none",
              borderRadius: "var(--tk-r-md)",
              background: selected ? (item.danger ? "var(--tk-red)" : "var(--tk-accent)") : "transparent",
              color,
              opacity: item.disabled ? 0.45 : 1,
              pointerEvents: item.disabled ? "none" : undefined,
              fontFamily: "inherit",
              fontSize,
              fontWeight: 700,
              letterSpacing: 0,
              cursor: item.disabled ? "default" : "pointer",
              boxShadow: selected ? "var(--tk-shadow-sm)" : "none",
              transition:
                "background var(--tk-t2) var(--tk-ease), color var(--tk-t2) var(--tk-ease), box-shadow var(--tk-t2) var(--tk-ease)",
            }}
          >
            {item.icon ? <TKIcon name={item.icon} size={size === "sm" ? 15 : 17} /> : null}
            <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
