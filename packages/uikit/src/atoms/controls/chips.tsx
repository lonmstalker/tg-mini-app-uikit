import {
  forwardRef,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { TKIcon, tkRenderIcon, type TKIconProp } from "../icons";
import { tkOptionItem, type TKOption } from "../../foundation/options";
import { useControllable } from "../../internal/useControllable";
import { tkDomProps, type TKDomProps } from "../../internal/dom";
import { tkRovingNext, tkTabbableIndex } from "../../internal/roving";

/* ---------------- Chips ---------------- */

export interface TKChipProps extends TKDomProps<HTMLButtonElement> {
  children?: ReactNode;
  selected?: boolean;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLButtonElement>) => void;
  tabIndex?: number;
  /** Built-in icon name, or a custom element for glyphs outside the set (REU-004). */
  icon?: TKIconProp;
  removable?: boolean;
  onRemove?: () => void;
  disabled?: boolean;
  style?: CSSProperties;
}

export const TKChip = /* @__PURE__ */ forwardRef<HTMLButtonElement, TKChipProps>(function TKChip(
  { children, selected, onClick, onKeyDown, tabIndex, icon, removable, onRemove, disabled, style, ...dom },
  ref,
) {
  const domProps = tkDomProps(dom);
  const labelText = typeof children === "string" ? children : undefined;
  const removeLabel = labelText ? `Remove ${labelText}` : "Remove chip";
  const remove = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    if (!disabled) onRemove?.();
  };
  const content = (
    <>
      {selected ? (
        <span className="tk-pop" style={{ display: "inline-flex" }}>
          <TKIcon name="check" size={15} strokeWidth={2.6} />
        </span>
      ) : (
        tkRenderIcon(icon, { size: 15 })
      )}
      {children}
    </>
  );
  const rootStyle: CSSProperties = {
    opacity: disabled ? 0.45 : 1,
    pointerEvents: disabled ? "none" : undefined,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    height: 34,
    // A pill of fixed height must never be squeezed or wrap its label — in a
    // non-wrapping flex row (filter scroller) long labels used to compress and
    // break onto a second line inside the 34px pill (REU-001).
    flexShrink: 0,
    whiteSpace: "nowrap",
    padding: "0 14px",
    border: "none",
    borderRadius: "var(--tk-r-pill)",
    fontSize: "var(--tk-fz-sub)",
    fontWeight: 500,
    fontFamily: "inherit",
    background: selected ? "var(--tk-accent)" : "var(--tk-surface)",
    color: selected ? "var(--tk-on-accent)" : "var(--tk-text)",
    boxShadow: selected ? "0 4px 12px -4px var(--tk-accent-35)" : "var(--tk-shadow-sm)",
    transition:
      "background var(--tk-t2) var(--tk-ease), color var(--tk-t2) var(--tk-ease), box-shadow var(--tk-t2) var(--tk-ease)",
    ...style,
  };

  if (removable) {
    return (
      <span
        style={{
          ...rootStyle,
          padding: "0 8px 0 14px",
        }}
      >
        <button
          type="button"
          ref={ref}
          className="tk-press"
          onClick={onClick}
          onKeyDown={onKeyDown}
          tabIndex={tabIndex}
          disabled={disabled}
          {...domProps}
          aria-label={domProps["aria-label"] ?? labelText}
          aria-pressed={selected == null ? undefined : selected}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            height: "100%",
            padding: 0,
            border: "none",
            background: "transparent",
            color: "inherit",
            font: "inherit",
          }}
        >
          {content}
        </button>
        <button
          type="button"
          className="tk-press"
          aria-label={removeLabel}
          disabled={disabled}
          onClick={remove}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 22,
            height: 22,
            minWidth: 44, // CC-03 / CTL-004 touch target (hit area > visual glyph)
            minHeight: 44,
            margin: "-11px -11px -11px 0", // absorb the extra hit area so the chip keeps its height
            padding: 0,
            border: "none",
            borderRadius: "50%",
            background: "transparent",
            color: "inherit",
            opacity: 0.65,
            font: "inherit",
          }}
        >
          <TKIcon name="close" size={14} />
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      ref={ref}
      className="tk-press"
      onClick={onClick}
      onKeyDown={onKeyDown}
      tabIndex={tabIndex}
      disabled={disabled}
      {...domProps}
      aria-pressed={selected == null ? undefined : selected}
      style={rootStyle}
    >
      {content}
    </button>
  );
});

export interface TKChipGroupProps {
  items: TKOption[];
  /** Allow several selected items; `value` becomes `string[]`. */
  multi?: boolean;
  value?: string | string[];
  defaultValue?: string | string[];
  onChange?: (value: string | string[]) => void;
  /** Accessible name for the chip group landmark (CTL-010). */
  "aria-label"?: string;
  "aria-labelledby"?: string;
  testId?: string;
}

export const TKChipGroup = /* @__PURE__ */ forwardRef<HTMLDivElement, TKChipGroupProps>(function TKChipGroup(
  { items, multi, value, defaultValue, onChange, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledby, testId },
  ref,
) {
  const [sel, setSel] = useControllable<string | string[]>(
    value,
    defaultValue ?? (multi ? [] : ""),
    onChange,
  );
  const normalized = items.map(tkOptionItem);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const disabledAt = (i: number) => !!normalized[i]?.disabled;
  // toolbar pattern: focus roves with the arrows, selection stays put
  const [focusIdx, setFocusIdx] = useState(() => tkTabbableIndex(0, normalized.length, disabledAt));
  const isSel = (item: string) => (multi ? (sel as string[]).includes(item) : sel === item);
  const toggle = (item: string) => {
    if (!multi) return setSel(item);
    const list = sel as string[];
    setSel(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  };
  return (
    <div
      ref={ref}
      // A toolbar of toggle chips: horizontal focus roving without changing selection
      // (each chip carries its own aria-pressed). `role="toolbar"` (not generic group)
      // reliably announces the accessible name on entry (CTL-010).
      role="toolbar"
      aria-orientation="horizontal"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      data-testid={testId}
      style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
    >
      {normalized.map((item, i) => (
        <TKChip
          key={item.value}
          ref={(el) => {
            refs.current[i] = el;
          }}
          tabIndex={i === focusIdx ? 0 : -1}
          selected={isSel(item.value)}
          icon={item.icon}
          disabled={item.disabled}
          onClick={() => toggle(item.value)}
          onFocus={() => setFocusIdx(i)}
          onKeyDown={(e) => {
            const next = tkRovingNext(e.key, i, normalized.length, disabledAt, "horizontal");
            if (next == null) return;
            e.preventDefault();
            setFocusIdx(next);
            refs.current[next]?.focus();
          }}
        >
          {item.label}
        </TKChip>
      ))}
    </div>
  );
});
