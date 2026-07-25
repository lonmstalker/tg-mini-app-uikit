import { forwardRef, useEffect, useId, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { TKIcon, tkRenderIcon } from "../icons";
import { mergeRefs } from "../../internal/dom";
import { TKFocusRing } from "../../internal/FocusRing";
import { useControllable } from "../../internal/useControllable";
import { useTKLocale } from "../../foundation/i18n";
import { tkFlattenOptions, type TKOption, type TKOptionGroup } from "../../foundation/options";
import { useDropdownPortal } from "./dropdown-portal";

export interface TKSelectProps {
  label?: ReactNode;
  /** Flat options or labeled groups (`TKOptionGroup`). */
  options: Array<TKOption | TKOptionGroup>;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: ReactNode;
  /** Adds a filter input on top of the option list. */
  searchable?: boolean;
  disabled?: boolean;
  testId?: string;
  className?: string;
  /** Merged onto the root LAST — consumer values win (REU-007). */
  style?: CSSProperties;
}

export const TKSelect = /* @__PURE__ */ forwardRef<HTMLButtonElement, TKSelectProps>(function TKSelect(
  { label, options, value, defaultValue, onChange, placeholder, searchable, disabled, testId, className, style },
  forwardedRef,
) {
  const locale = useTKLocale();
  const allItems = tkFlattenOptions(options);
  const [query, setQuery] = useState("");
  const items = query
    ? allItems.filter((item) => String(typeof item.label === "string" ? item.label : item.value).toLowerCase().includes(query.toLowerCase()))
    : allItems;
  // Default to "" (not the first option) so the placeholder shows and the
  // parent's state isn't silently out of sync (INP-001). Auto-first would also
  // never fire onChange. Pass defaultValue to pre-select intentionally.
  const [val, setVal] = useControllable(value, defaultValue ?? "", onChange);
  const [open, setOpenRaw] = useState(false);
  const [active, setActive] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  // Stable merged ref so a parent re-render doesn't detach/reattach the trigger (INP-006).
  const mergedRef = useMemo(() => mergeRefs(buttonRef, forwardedRef), [forwardedRef]);
  const searchRef = useRef<HTMLInputElement>(null);
  const id = useId();
  const listId = `${id}-list`;
  const labelId = label ? `${id}-label` : undefined;

  const selectedIndex = items.findIndex((item) => item.value === val);
  const selected = allItems.find((item) => item.value === val);

  const setOpen = (next: boolean) => {
    setOpenRaw(next);
    setQuery("");
    setActive(next ? (selectedIndex >= 0 ? selectedIndex : items.findIndex((item) => !item.disabled)) : -1);
  };

  // The option list portals to the shared overlay host so an `overflow` or
  // `transform` ancestor can't clip or displace it (REU-010).
  const dropdown = useDropdownPortal("TKSelect", open, ref);

  useEffect(() => {
    if (!open) return;
    const close = (e: globalThis.PointerEvent) => {
      const target = e.target as Node;
      // The popup lives in the portal, outside the wrapper — check both.
      if (ref.current && !ref.current.contains(target) && !dropdown.contains(target)) setOpenRaw(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  // Searchable: move focus into the filter when the popup opens. The trigger
  // keeps DOM focus otherwise, so the field was keyboard-dead — you could not
  // type to filter without a mouse click.
  useEffect(() => {
    if (open && searchable) searchRef.current?.focus({ preventScroll: true });
  }, [open, searchable]);

  const move = (dir: 1 | -1) => {
    if (!items.some((item) => !item.disabled)) return;
    let i = active < 0 ? (dir === 1 ? -1 : items.length) : active;
    do {
      i = (i + dir + items.length) % items.length;
    } while (items[i].disabled);
    setActive(i);
  };

  const choose = (index: number) => {
    const item = items[index];
    if (!item || item.disabled) return;
    setVal(item.value);
    setOpen(false);
    // Return focus to the trigger so it never lands on the now-hidden filter.
    buttonRef.current?.focus({ preventScroll: true });
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
      move(e.key === "ArrowDown" ? 1 : -1);
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      const enabled = items.flatMap((item, i) => (item.disabled ? [] : [i]));
      if (enabled.length) setActive(e.key === "Home" ? enabled[0] : enabled[enabled.length - 1]);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      choose(active);
    }
  };

  return (
    <div ref={ref} data-testid={testId} className={className} style={{ position: "relative", opacity: disabled ? 0.55 : 1, ...style }}>
      {label ? (
        <div
          id={labelId}
          style={{
            fontSize: "var(--tk-fz-caption)",
            fontWeight: 600,
            letterSpacing: ".04em",
            textTransform: "uppercase",
            color: "var(--tk-text-2)",
            margin: "0 14px 6px",
          }}
        >
          {label}
        </div>
      ) : null}
      <button
        ref={mergedRef}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
        aria-labelledby={labelId}
        aria-activedescendant={open && active >= 0 ? `${id}-opt-${active}` : undefined}
        disabled={disabled}
        className="tk-press-soft tk-press"
        onClick={() => setOpen(!open)}
        onKeyDown={onKeyDown}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          width: "100%",
          height: 48,
          padding: "0 14px",
          border: "none",
          borderRadius: "var(--tk-r-md)",
          background: "var(--tk-surface)",
          color: selected ? "var(--tk-text)" : "var(--tk-text-3)",
          fontSize: "var(--tk-fz-body)",
          fontFamily: "inherit",
          pointerEvents: disabled ? "none" : undefined,
          position: "relative",
          // Static inset border; the open ring fades on its own layer
          // (TKFocusRing) — box-shadow never animates.
          boxShadow: open ? "inset 0 0 0 1.5px var(--tk-accent)" : "none",
        }}
      >
        <TKFocusRing show={open} />
        <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selected?.label ?? placeholder ?? ""}
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
      {/* Popup shell: the filter combobox lives here, OUTSIDE role=listbox, so the
          listbox holds only option/group children (valid combobox/listbox — INP-004).
          Portaled to the shared overlay host and glued to the trigger (REU-010). */}
      {dropdown.render(
      <div
        ref={dropdown.popupRef}
        // inert (not aria-hidden) when closed: removes the focusable tabIndex=-1
        // option buttons from focus + the a11y tree without the aria-hidden-on-
        // focusable violation that aria-hidden would trigger here.
        inert={!open || undefined}
        style={{
          ...dropdown.style,
          background: "var(--tk-surface)",
          borderRadius: "var(--tk-r-md)",
          boxShadow: "var(--tk-shadow-md)",
          padding: 6,
          transformOrigin: "top center",
          transform: open ? "scale(1) translateY(0)" : "scale(.92) translateY(-6px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "transform var(--tk-t2) var(--tk-spring), opacity var(--tk-t2) var(--tk-ease)",
        }}
      >
        {searchable && open ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "7px 9px",
              marginBottom: 4,
              borderRadius: "var(--tk-r-sm)",
              background: "var(--tk-surface-2)",
            }}
          >
            <span style={{ display: "inline-flex", color: "var(--tk-text-3)" }}>
              <TKIcon name="search" size={15} />
            </span>
            <input
              ref={searchRef}
              value={query}
              placeholder={locale.search}
              // A filter textbox that drives the listbox — NOT a second combobox (the
              // trigger button is the combobox); aria-controls + aria-activedescendant
              // link it to the options it filters (INP-004).
              aria-label={locale.search}
              aria-controls={listId}
              aria-activedescendant={active >= 0 ? `${id}-opt-${active}` : undefined}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(-1);
              }}
              onKeyDown={(e) => {
                // The filter owns DOM focus while open, so it must drive option
                // navigation/selection itself (the trigger's handler can't fire).
                // Printable keys (incl. Space) fall through to filter the list.
                if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                  e.preventDefault();
                  move(e.key === "ArrowDown" ? 1 : -1);
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  choose(active);
                } else if (e.key === "Escape" || e.key === "Tab") {
                  setOpen(false);
                  buttonRef.current?.focus({ preventScroll: true });
                }
              }}
              style={{
                flex: 1,
                minWidth: 0,
                border: "none",
                outline: "none",
                background: "transparent",
                font: "inherit",
                fontSize: "var(--tk-fz-sub)",
                color: "var(--tk-text)",
                boxShadow: "none",
              }}
            />
          </div>
        ) : null}
        {items.length === 0 ? (
          // No empty role=listbox (that breaks aria-required-children): announce
          // "nothing found" as a status instead (A11Y-202).
          <div
            id={listId}
            role="status"
            style={{ padding: "12px", textAlign: "center", color: "var(--tk-text-3)", fontSize: "var(--tk-fz-sub)" }}
          >
            {locale.noResults}
          </div>
        ) : (
          <div role="listbox" id={listId} aria-labelledby={labelId} style={{ maxHeight: 280, overflowY: "auto" }}>
            {items.map((item, i) => (
          <span key={item.value} style={{ display: "contents" }}>
            {item.group != null && (i === 0 || items[i - 1].group !== item.group) ? (
              <div
                style={{
                  padding: "7px 10px 3px",
                  fontSize: "var(--tk-fz-caption2)",
                  fontWeight: 700,
                  letterSpacing: ".05em",
                  textTransform: "uppercase",
                  color: "var(--tk-text-3)",
                }}
              >
                {item.group}
              </div>
            ) : null}
            <button
              type="button"
              id={`${id}-opt-${i}`}
              role="option"
              aria-selected={item.value === val}
              aria-disabled={item.disabled || undefined}
              disabled={item.disabled}
              tabIndex={-1}
              onClick={() => choose(i)}
              onMouseEnter={() => !item.disabled && setActive(i)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
                width: "100%",
                padding: "10px 10px",
                border: "none",
                borderRadius: "var(--tk-r-sm)",
                background: i === active ? "var(--tk-surface-2)" : "transparent",
                color: item.disabled ? "var(--tk-text-3)" : "var(--tk-text)",
                fontSize: "var(--tk-fz-body)",
                fontFamily: "inherit",
                cursor: item.disabled ? "default" : "pointer",
                transition: "background var(--tk-t1) var(--tk-ease)",
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                {tkRenderIcon(item.icon, { size: 17 })}
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</span>
              </span>
              {item.value === val ? (
                <span className="tk-pop" style={{ display: "inline-flex", color: "var(--tk-accent)", flexShrink: 0 }}>
                  <TKIcon name="check" size={16} strokeWidth={2.5} />
                </span>
              ) : null}
            </button>
              </span>
            ))}
          </div>
        )}
      </div>,
      )}
    </div>
  );
});
