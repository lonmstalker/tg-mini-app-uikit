import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { TKIcon, type TKIconName } from "./icons";
import { tkOptionItem, type TKOption } from "./options";
import { useControllable } from "./internal/useControllable";

/* ---------------- Text input ---------------- */

export interface TKInputProps {
  label?: ReactNode;
  placeholder?: string;
  type?: string;
  icon?: TKIconName;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  hint?: ReactNode;
  error?: ReactNode;
  clearable?: boolean;
  disabled?: boolean;
  name?: string;
  autoFocus?: boolean;
}

export function TKInput({
  label,
  placeholder,
  type = "text",
  icon,
  value,
  defaultValue = "",
  onChange,
  hint,
  error,
  clearable = true,
  disabled,
  name,
  autoFocus,
}: TKInputProps) {
  const [val, setVal] = useControllable(value, defaultValue, onChange);
  const [focus, setFocus] = useState(false);
  const borderColor = error ? "var(--tk-red)" : focus ? "var(--tk-accent)" : "transparent";
  return (
    <label style={{ display: "block", opacity: disabled ? 0.55 : 1 }}>
      {label ? (
        <div
          style={{
            fontSize: "var(--tk-fz-caption)",
            fontWeight: 600,
            letterSpacing: ".04em",
            textTransform: "uppercase",
            color: focus ? "var(--tk-accent)" : "var(--tk-text-2)",
            margin: "0 14px 6px",
            transition: "color var(--tk-t2) var(--tk-ease)",
          }}
        >
          {label}
        </div>
      ) : null}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "var(--tk-surface)",
          borderRadius: "var(--tk-r-md)",
          padding: "0 14px",
          height: 48,
          boxShadow: `inset 0 0 0 1.5px ${borderColor}${focus && !error ? ", var(--tk-ring)" : ""}`,
          transition: "box-shadow var(--tk-t2) var(--tk-ease)",
        }}
      >
        {icon ? (
          <span
            style={{
              color: focus ? "var(--tk-accent)" : "var(--tk-text-3)",
              display: "inline-flex",
              transition: "color var(--tk-t2) var(--tk-ease)",
            }}
          >
            <TKIcon name={icon} size={19} />
          </span>
        ) : null}
        <input
          type={type}
          name={name}
          value={val}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          onChange={(e) => setVal(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: "var(--tk-fz-body)",
            fontFamily: "inherit",
            color: "var(--tk-text)",
            minWidth: 0,
            boxShadow: "none",
          }}
        />
        {clearable && val ? (
          <button
            type="button"
            className="tk-pop"
            onClick={(e) => {
              e.preventDefault();
              setVal("");
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 20,
              height: 20,
              border: "none",
              borderRadius: "50%",
              background: "var(--tk-surface-3)",
              color: "var(--tk-text-2)",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <TKIcon name="close" size={11} strokeWidth={2.6} />
          </button>
        ) : null}
      </div>
      {hint || error ? (
        <div
          style={{
            fontSize: "var(--tk-fz-caption)",
            color: error ? "var(--tk-red)" : "var(--tk-text-2)",
            margin: "6px 14px 0",
          }}
        >
          {error || hint}
        </div>
      ) : null}
    </label>
  );
}

/* ---------------- Search ---------------- */

export interface TKSearchProps {
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onCancel?: () => void;
  cancelLabel?: string;
}

export function TKSearch({
  placeholder = "Search",
  value,
  defaultValue = "",
  onChange,
  onCancel,
  cancelLabel = "Cancel",
}: TKSearchProps) {
  const [val, setVal] = useControllable(value, defaultValue, onChange);
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flex: 1,
          height: 40,
          padding: "0 12px",
          borderRadius: "var(--tk-r-sm)",
          background: "var(--tk-surface-2)",
          boxShadow: focus ? "var(--tk-ring)" : "none",
          transition: "box-shadow var(--tk-t2) var(--tk-ease)",
        }}
      >
        <span style={{ color: "var(--tk-text-3)", display: "inline-flex" }}>
          <TKIcon name="search" size={17} />
        </span>
        <input
          value={val}
          placeholder={placeholder}
          onChange={(e) => setVal(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: "var(--tk-fz-body)",
            fontFamily: "inherit",
            color: "var(--tk-text)",
            minWidth: 0,
            boxShadow: "none",
          }}
        />
      </div>
      <button
        type="button"
        onClick={() => {
          setVal("");
          setFocus(false);
          onCancel?.();
        }}
        style={{
          border: "none",
          background: "transparent",
          color: "var(--tk-accent)",
          fontSize: "var(--tk-fz-body)",
          fontFamily: "inherit",
          cursor: "pointer",
          padding: 0,
          maxWidth: focus || val ? 70 : 0,
          opacity: focus || val ? 1 : 0,
          overflow: "hidden",
          transition: "max-width var(--tk-t3) var(--tk-ease), opacity var(--tk-t2) var(--tk-ease)",
          whiteSpace: "nowrap",
        }}
      >
        {cancelLabel}
      </button>
    </div>
  );
}

/* ---------------- Select (custom dropdown) ---------------- */

export interface TKSelectProps {
  label?: ReactNode;
  options: TKOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: ReactNode;
  disabled?: boolean;
}

export function TKSelect({ label, options, value, defaultValue, onChange, placeholder, disabled }: TKSelectProps) {
  const items = options.map(tkOptionItem);
  const firstEnabled = items.find((item) => !item.disabled);
  const [val, setVal] = useControllable(value, defaultValue ?? firstEnabled?.value ?? "", onChange);
  const [open, setOpenRaw] = useState(false);
  const [active, setActive] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const listId = `${id}-list`;
  const labelId = label ? `${id}-label` : undefined;

  const selectedIndex = items.findIndex((item) => item.value === val);
  const selected = items[selectedIndex];

  const setOpen = (next: boolean) => {
    setOpenRaw(next);
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
    <div ref={ref} style={{ position: "relative", opacity: disabled ? 0.55 : 1 }}>
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
          zIndex: 30,
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
        {items.map((item, i) => (
          <button
            type="button"
            key={item.value}
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
        ))}
      </div>
    </div>
  );
}

/* ---------------- OTP input ---------------- */

export interface TKOTPProps {
  length?: number;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Fires once the code is fully typed. */
  onComplete?: (value: string) => void;
  onResend?: () => void;
  successText?: ReactNode;
  resendPrompt?: ReactNode;
  resendLabel?: ReactNode;
  style?: CSSProperties;
}

export function TKOTP({
  length = 5,
  value,
  defaultValue = "",
  onChange,
  onComplete,
  onResend,
  successText = "Code verified",
  resendPrompt = "Didn't get the code?",
  resendLabel = "Resend",
  style,
}: TKOTPProps) {
  const [v, setV] = useControllable(value, defaultValue, onChange);
  const [focus, setFocus] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const done = v.length === length;

  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;
  useEffect(() => {
    if (done) completeRef.current?.(v);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  return (
    <div onClick={() => ref.current?.focus()} style={{ cursor: "text", position: "relative", ...style }}>
      <input
        ref={ref}
        value={v}
        onChange={(e) => setV(e.target.value.replace(/\D/g, "").slice(0, length))}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        inputMode="numeric"
        style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 1, height: 1 }}
      />
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        {Array.from({ length }).map((_, i) => {
          const filled = i < v.length;
          const active = focus && i === v.length && !done;
          return (
            <div
              key={i}
              style={{
                width: 46,
                height: 56,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "var(--tk-r-md)",
                background: "var(--tk-surface)",
                fontSize: "var(--tk-fz-title2)",
                fontWeight: 700,
                fontVariantNumeric: "tabular-nums",
                color: done ? "var(--tk-green)" : "var(--tk-text)",
                boxShadow: done
                  ? "inset 0 0 0 1.5px var(--tk-green)"
                  : active
                    ? "inset 0 0 0 1.5px var(--tk-accent), var(--tk-ring)"
                    : "inset 0 0 0 1px var(--tk-sep)",
                transition: "box-shadow var(--tk-t2) var(--tk-ease), color var(--tk-t2) var(--tk-ease)",
              }}
            >
              {filled ? (
                <span className="tk-pop" style={{ display: "inline-block" }}>
                  {v[i]}
                </span>
              ) : active ? (
                <span
                  style={{
                    width: 2,
                    height: 24,
                    background: "var(--tk-accent)",
                    borderRadius: 1,
                    animation: "tk-fade-in calc(900ms / var(--tk-ms)) ease-in-out infinite alternate",
                  }}
                />
              ) : null}
            </div>
          );
        })}
      </div>
      <div
        style={{
          textAlign: "center",
          marginTop: 12,
          fontSize: "var(--tk-fz-caption)",
          color: done ? "var(--tk-green)" : "var(--tk-text-2)",
          fontWeight: done ? 600 : 400,
          transition: "color var(--tk-t2) var(--tk-ease)",
        }}
      >
        {done ? (
          <span className="tk-pop" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <TKIcon name="check" size={13} strokeWidth={3} /> {successText}
          </span>
        ) : (
          <>
            {resendPrompt}{" "}
            <span
              onClick={(e) => {
                e.stopPropagation();
                onResend?.();
              }}
              style={{ color: "var(--tk-accent)", fontWeight: 600, cursor: "pointer" }}
            >
              {resendLabel}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
