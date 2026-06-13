import { forwardRef, useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { TKIcon } from "../icons";
import { tkZ } from "../../internal/dom";
import { useControllable } from "../../internal/useControllable";
import { useTKLocale } from "../../foundation/i18n";
import { tkFlattenOptions, type TKOption, type TKOptionGroup } from "../../foundation/options";

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
}

export const TKSelect = /* @__PURE__ */ forwardRef<HTMLButtonElement, TKSelectProps>(function TKSelect(
  { label, options, value, defaultValue, onChange, placeholder, searchable, disabled, testId },
  forwardedRef,
) {
  const locale = useTKLocale();
  const allItems = tkFlattenOptions(options);
  const [query, setQuery] = useState("");
  const items = query
    ? allItems.filter((item) => String(typeof item.label === "string" ? item.label : item.value).toLowerCase().includes(query.toLowerCase()))
    : allItems;
  const firstEnabled = allItems.find((item) => !item.disabled);
  const [val, setVal] = useControllable(value, defaultValue ?? firstEnabled?.value ?? "", onChange);
  const [open, setOpenRaw] = useState(false);
  const [active, setActive] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    if (!open) return;
    const close = (e: globalThis.PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpenRaw(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

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
      const enabled = items.map((item, i) => (item.disabled ? -1 : i)).filter((i) => i >= 0);
      if (enabled.length) setActive(e.key === "Home" ? enabled[0] : enabled[enabled.length - 1]);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      choose(active);
    }
  };

  return (
    <div ref={ref} data-testid={testId} style={{ position: "relative", opacity: disabled ? 0.55 : 1 }}>
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
        ref={forwardedRef}
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
          boxShadow: open ? "inset 0 0 0 1.5px var(--tk-accent), var(--tk-ring)" : "none",
          transition: "box-shadow var(--tk-t2) var(--tk-ease)",
        }}
      >
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
      <div
        role="listbox"
        id={listId}
        aria-labelledby={labelId}
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
          transformOrigin: "top center",
          transform: open ? "scale(1) translateY(0)" : "scale(.92) translateY(-6px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "transform var(--tk-t2) var(--tk-spring), opacity var(--tk-t2) var(--tk-ease)",
          maxHeight: 280,
          overflowY: "auto",
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
              value={query}
              placeholder={locale.search}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(-1);
              }}
              onKeyDown={(e) => {
                // arrows/enter fall through to the combobox contract
                if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === "Escape") return;
                e.stopPropagation();
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
                {item.icon ? <TKIcon name={item.icon} size={17} /> : null}
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
    </div>
  );
});
