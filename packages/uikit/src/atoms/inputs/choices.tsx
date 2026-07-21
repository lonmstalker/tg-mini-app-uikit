import { forwardRef, useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { TKIcon, tkRenderIcon } from "../icons";
import { tkOptionItem, type TKOption } from "../../foundation/options";
import { useControllable } from "../../internal/useControllable";
import { tkZ } from "../../internal/dom";
import { useTKLocale } from "../../foundation/i18n";
import { TKFormField } from "./form-field";

/* ---------------- Multiselect ---------------- */

export interface TKMultiselectProps {
  label?: ReactNode;
  options: TKOption[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: ReactNode;
  /** Adds a "select all" row on top of the list. */
  selectAll?: boolean;
  /** Custom label of the "select all" row (defaults to the locale). */
  selectAllLabel?: ReactNode;
  disabled?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
  testId?: string;
}

export const TKMultiselect = /* @__PURE__ */ forwardRef<HTMLButtonElement, TKMultiselectProps>(function TKMultiselect(
  {
    label,
    options,
    value,
    defaultValue = [],
    onChange,
    placeholder,
    selectAll,
    selectAllLabel,
    disabled,
    hint,
    error,
    testId,
  },
  forwardedRef,
) {
  const locale = useTKLocale();
  const items = options.map(tkOptionItem);
  const [selected, setSelected] = useControllable(value, defaultValue, onChange);
  const [open, setOpenRaw] = useState(false);
  const [active, setActive] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const listId = `${id}-list`;
  // Selection checks run per item per render (and renders ride every hover) — Set, not includes.
  const selectedSet = new Set(selected);
  const chosen = items.filter((item) => selectedSet.has(item.value));
  const setOpen = (next: boolean) => {
    setOpenRaw(next);
    setActive(next ? items.findIndex((item) => !item.disabled) : -1);
  };
  const moveActive = (dir: 1 | -1) => {
    if (!items.some((item) => !item.disabled)) return;
    let i = active < 0 ? (dir === 1 ? -1 : items.length) : active;
    do {
      i = (i + dir + items.length) % items.length;
    } while (items[i].disabled);
    setActive(i);
  };

  useEffect(() => {
    if (!open) return;
    const close = (e: globalThis.PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpenRaw(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  const toggle = (itemValue: string) => {
    setSelected(selected.includes(itemValue) ? selected.filter((v) => v !== itemValue) : [...selected, itemValue]);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === "Escape" || e.key === "Tab") {
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      moveActive(e.key === "ArrowDown" ? 1 : -1);
    } else if (e.key === "Enter" || e.key === " ") {
      // toggling keeps the listbox open — it is a multi-select
      e.preventDefault();
      const item = items[active];
      if (item && !item.disabled) toggle(item.value);
    }
  };

  return (
    <TKFormField label={label} hint={hint} error={error} disabled={disabled} testId={testId}>
      <div ref={ref} style={{ position: "relative" }}>
        <button
          ref={forwardedRef}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={listId}
          aria-activedescendant={open && active >= 0 ? `${id}-opt-${active}` : undefined}
          aria-label={typeof label === "string" ? label : undefined}
          disabled={disabled}
          className="tk-press-soft tk-press"
          onClick={() => setOpen(!open)}
          onKeyDown={onKeyDown}
          style={{
            width: "100%",
            minHeight: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            padding: "8px 14px",
            border: "none",
            borderRadius: "var(--tk-r-md)",
            background: "var(--tk-surface)",
            color: chosen.length ? "var(--tk-text)" : "var(--tk-text-3)",
            fontFamily: "inherit",
            fontSize: "var(--tk-fz-body)",
            boxShadow: error
              ? "inset 0 0 0 1.5px var(--tk-red)"
              : open
                ? "inset 0 0 0 1.5px var(--tk-accent), var(--tk-ring)"
                : "none",
          }}
        >
          <span style={{ display: "flex", flexWrap: "wrap", gap: 6, minWidth: 0 }}>
            {chosen.length ? (
              chosen.slice(0, 3).map((item) => (
                <span
                  key={item.value}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "4px 8px",
                    borderRadius: "var(--tk-r-pill)",
                    background: "var(--tk-accent-12)",
                    color: "var(--tk-accent-ink)",
                    fontSize: "var(--tk-fz-caption)",
                    fontWeight: 700,
                  }}
                >
                  {tkRenderIcon(item.icon, { size: 13 })}
                  {item.label}
                </span>
              ))
            ) : (
              <span>{placeholder ?? locale.selectOptions}</span>
            )}
            {chosen.length > 3 ? (
              <span style={{ color: "var(--tk-text-2)", fontSize: "var(--tk-fz-caption)", alignSelf: "center" }}>
                +{chosen.length - 3}
              </span>
            ) : null}
          </span>
          <span
            style={{
              display: "inline-flex",
              color: "var(--tk-text-3)",
              transform: open ? "rotate(180deg)" : "none",
              transition: "transform var(--tk-t2) var(--tk-spring)",
              flexShrink: 0,
            }}
          >
            <TKIcon name="chevronDown" size={17} />
          </span>
        </button>
        <div
          id={listId}
          role="listbox"
          aria-multiselectable="true"
          aria-hidden={!open}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "calc(100% + 6px)",
            zIndex: tkZ.dropdown,
            background: "var(--tk-surface)",
            borderRadius: "var(--tk-r-md)",
            boxShadow: "var(--tk-shadow-md)",
            padding: 6,
            maxHeight: 250,
            overflowY: "auto",
            transformOrigin: "top center",
            transform: open ? "scale(1) translateY(0)" : "scale(.92) translateY(-6px)",
            opacity: open ? 1 : 0,
            pointerEvents: open ? "auto" : "none",
            // visibility keeps the closed list (and its buttons) out of the
            // focus order; the delay preserves the closing animation
            visibility: open ? "visible" : "hidden",
            transition: `transform var(--tk-t2) var(--tk-spring), opacity var(--tk-t2) var(--tk-ease), visibility 0s linear ${open ? "0s" : "var(--tk-t2)"}`,
          }}
        >
          {selectAll ? (
            <button
              type="button"
              role="option"
              aria-selected={items.filter((i) => !i.disabled).every((i) => selectedSet.has(i.value))}
              tabIndex={-1}
              onClick={() => {
                const enabled = items.flatMap((i) => (i.disabled ? [] : [i.value]));
                const allOn = enabled.every((v) => selectedSet.has(v));
                setSelected(allOn ? [] : enabled);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: "10px",
                border: "none",
                borderBottom: "0.5px solid var(--tk-sep)",
                borderRadius: "var(--tk-r-sm) var(--tk-r-sm) 0 0",
                background: "transparent",
                color: "var(--tk-accent-ink)",
                fontSize: "var(--tk-fz-sub)",
                fontWeight: 700,
                fontFamily: "inherit",
                cursor: "pointer",
              }}
            >
              {selectAllLabel ?? locale.selectAll}
            </button>
          ) : null}
          {items.map((item, i) => {
            const isSelected = selectedSet.has(item.value);
            return (
              <button
                type="button"
                key={item.value}
                id={`${id}-opt-${i}`}
                role="option"
                aria-selected={isSelected}
                disabled={item.disabled}
                tabIndex={-1}
                onClick={() => !item.disabled && toggle(item.value)}
                onMouseEnter={() => !item.disabled && setActive(i)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  padding: "10px",
                  border: "none",
                  borderRadius: "var(--tk-r-sm)",
                  background: i === active ? "var(--tk-surface-2)" : isSelected ? "var(--tk-accent-06)" : "transparent",
                  color: item.disabled ? "var(--tk-text-3)" : "var(--tk-text)",
                  fontSize: "var(--tk-fz-body)",
                  fontFamily: "inherit",
                  cursor: item.disabled ? "default" : "pointer",
                }}
              >
                <span
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "var(--tk-r-xs)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: isSelected ? "var(--tk-accent)" : "var(--tk-surface-2)",
                    color: "var(--tk-on-accent)",
                    boxShadow: isSelected ? "none" : "inset 0 0 0 1px var(--tk-sep)",
                    flexShrink: 0,
                  }}
                >
                  {isSelected ? <TKIcon name="check" size={12} strokeWidth={2.7} /> : null}
                </span>
                {tkRenderIcon(item.icon, { size: 17 })}
                <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </TKFormField>
  );
});
