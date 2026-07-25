import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { tkRenderIcon, type TKIconProp } from "../icons";
import { tkRovingNext, tkTabbableIndex } from "../../internal/roving";
import { useControllable } from "../../internal/useControllable";

export interface TKInlineButtonItem {
  id: string;
  label: ReactNode;
  /** Built-in icon name, or a custom element for glyphs outside the set (REU-004). */
  icon?: TKIconProp;
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
  /** Accessible name for the group/tablist (CC-04). */
  ariaLabel?: string;
  /**
   * Independent multi-toggle instead of a single-select switcher. Single-select
   * (default) exposes a `radiogroup`/`radio` + `aria-checked` (it switches a
   * value, not tab panels); `multiple` keeps the `group` + `aria-pressed` toggle
   * semantics (BTN-002).
   */
  multiple?: boolean;
  testId?: string;
  className?: string;
  /** Merged onto the root LAST — consumer values win (REU-007). */
  style?: CSSProperties;
}

export function TKInlineButtons({
  items,
  value,
  defaultValue = "",
  onChange,
  equal = true,
  size = "md",
  ariaLabel,
  multiple = false,
  testId,
  className,
  style,
}: TKInlineButtonsProps) {
  const [active, setActive] = useControllable({ value, defaultValue, onChange, name: "TKInlineButtons" });
  const height = size === "sm" ? 34 : 40;
  const fontSize = size === "sm" ? "var(--tk-fz-caption)" : "var(--tk-fz-sub)";
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const disabledAt = (i: number) => !!items[i]?.disabled;
  // Seed the roving tab-stop on the SELECTED item (WAI-ARIA: the checked radio is
  // the tab-stop), not always item 0 (BTN-003).
  const [focusIdx, setFocusIdx] = useState(() => {
    const initialActive = value ?? defaultValue;
    const sel = items.findIndex((it) => it.selected ?? it.id === initialActive);
    return tkTabbableIndex(sel >= 0 ? sel : 0, items.length, disabledAt);
  });
  // Keep the tab-stop valid as items shrink / get disabled (BTN-003). Stale refs
  // self-heal: React nulls a removed item's callback ref, and the clamped index
  // below never targets an out-of-range slot — so no manual ref truncation needed.
  const safeFocus = focusIdx < items.length && !disabledAt(focusIdx) ? focusIdx : tkTabbableIndex(0, items.length, disabledAt);
  if (process.env.NODE_ENV !== "production" && !multiple && !ariaLabel) {
    // eslint-disable-next-line no-console
    console.warn("TKInlineButtons: pass `ariaLabel` so the radiogroup has an accessible name (CC-04).");
  }
  const select = (id: string) => setActive(id);

  return (
    <div
      role={multiple ? "group" : "radiogroup"}
      aria-label={ariaLabel}
      data-testid={testId}
      className={className}
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
            tabIndex={i === safeFocus ? 0 : -1}
            onFocus={() => setFocusIdx(i)}
            onKeyDown={(e) => {
              const next = tkRovingNext(e.key, i, items.length, disabledAt, "horizontal");
              if (next == null) return;
              e.preventDefault();
              setFocusIdx(next);
              refs.current[next]?.focus();
              // radiogroup: selection follows focus (WAI-ARIA), multi-toggle does not
              if (!multiple) select(items[next].id);
            }}
            role={multiple ? undefined : "radio"}
            aria-pressed={multiple ? selected : undefined}
            aria-checked={multiple ? undefined : selected}
            disabled={item.disabled}
            className="tk-press"
            onClick={() => {
              if (item.disabled) return;
              select(item.id);
              item.onClick?.();
            }}
            style={{
              flex: equal ? 1 : "0 0 auto",
              minWidth: 0,
              height,
              minHeight: 44, // CC-03 / BTN-004 touch target
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
                "background var(--tk-t2) var(--tk-ease), color var(--tk-t2) var(--tk-ease)",
            }}
          >
            {tkRenderIcon(item.icon, { size: size === "sm" ? 15 : 17 })}
            <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
