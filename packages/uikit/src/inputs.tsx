import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { TKIcon, type TKIconName } from "./icons";
import { tkOptionItem, type TKOption } from "./options";
import { useControllable } from "./internal/useControllable";
import { mergeRefs, tkZ } from "./internal/dom";
import { useTKLocale } from "./i18n";

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
  /** Forwarded to the `<input>` element. */
  id?: string;
  onFocus?: (e: FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  testId?: string;
}

export const TKInput = /* @__PURE__ */ forwardRef<HTMLInputElement, TKInputProps>(function TKInput(
  {
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
    id,
    onFocus,
    onBlur,
    testId,
  },
  ref,
) {
  const [val, setVal] = useControllable(value, defaultValue, onChange);
  const [focus, setFocus] = useState(false);
  const borderColor = error ? "var(--tk-red)" : focus ? "var(--tk-accent)" : "transparent";
  return (
    <label data-testid={testId} style={{ display: "block", opacity: disabled ? 0.55 : 1 }}>
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
          ref={ref}
          id={id}
          type={type}
          name={name}
          value={val}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          onChange={(e) => setVal(e.target.value)}
          onFocus={(e) => {
            setFocus(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocus(false);
            onBlur?.(e);
          }}
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
});

/* ---------------- Form field wrapper ---------------- */

export interface TKFormFieldProps {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  htmlFor?: string;
  describedBy?: string;
  required?: boolean;
  disabled?: boolean;
  children?: ReactNode;
  testId?: string;
  style?: CSSProperties;
}

export function TKFormField({ label, hint, error, htmlFor, describedBy, required, disabled, children, testId, style }: TKFormFieldProps) {
  return (
    <div data-testid={testId} style={{ display: "flex", flexDirection: "column", gap: 6, opacity: disabled ? 0.55 : 1, ...style }}>
      {label ? (
        <label
          htmlFor={htmlFor}
          style={{
            fontSize: "var(--tk-fz-caption)",
            fontWeight: 600,
            letterSpacing: ".04em",
            textTransform: "uppercase",
            color: error ? "var(--tk-red)" : "var(--tk-text-2)",
            margin: "0 14px",
          }}
        >
          {label}
          {required ? <span style={{ color: "var(--tk-red)", marginLeft: 3 }}>*</span> : null}
        </label>
      ) : null}
      {children}
      {hint || error ? (
        <div
          id={describedBy}
          style={{
            fontSize: "var(--tk-fz-caption)",
            color: error ? "var(--tk-red)" : "var(--tk-text-2)",
            margin: "0 14px",
          }}
        >
          {error || hint}
        </div>
      ) : null}
    </div>
  );
}

export type TKFormInputProps = TKInputProps;

export const TKFormInput = /* @__PURE__ */ forwardRef<HTMLInputElement, TKFormInputProps>(function TKFormInput(props, ref) {
  return <TKInput {...props} ref={ref} />;
});

/* ---------------- Textarea ---------------- */

export interface TKTextareaProps {
  id?: string;
  label?: ReactNode;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  hint?: ReactNode;
  error?: ReactNode;
  disabled?: boolean;
  name?: string;
  rows?: number;
  maxLength?: number;
  autoFocus?: boolean;
  resize?: CSSProperties["resize"];
  testId?: string;
}

export const TKTextarea = /* @__PURE__ */ forwardRef<HTMLTextAreaElement, TKTextareaProps>(function TKTextarea(
  {
    id,
    label,
    placeholder,
    value,
    defaultValue = "",
    onChange,
    hint,
    error,
    disabled,
    name,
    rows = 4,
    maxLength,
    autoFocus,
    resize = "vertical",
    testId,
  },
  ref,
) {
  const [val, setVal] = useControllable(value, defaultValue, onChange);
  const [focus, setFocus] = useState(false);
  const autoId = useId();
  const inputId = id ?? autoId;
  const describedBy = hint || error ? `${inputId}-description` : undefined;
  const borderColor = error ? "var(--tk-red)" : focus ? "var(--tk-accent)" : "transparent";
  return (
    <TKFormField label={label} hint={hint} error={error} htmlFor={inputId} describedBy={describedBy} disabled={disabled} testId={testId}>
      <div
        style={{
          background: "var(--tk-surface)",
          borderRadius: "var(--tk-r-md)",
          padding: "12px 14px",
          boxShadow: `inset 0 0 0 1.5px ${borderColor}${focus && !error ? ", var(--tk-ring)" : ""}`,
          transition: "box-shadow var(--tk-t2) var(--tk-ease)",
        }}
      >
        <textarea
          ref={ref}
          id={inputId}
          name={name}
          value={val}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          maxLength={maxLength}
          autoFocus={autoFocus}
          aria-describedby={describedBy}
          aria-invalid={!!error}
          onChange={(e) => setVal(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            width: "100%",
            minHeight: rows * 22,
            border: "none",
            outline: "none",
            background: "transparent",
            color: "var(--tk-text)",
            fontFamily: "inherit",
            fontSize: "var(--tk-fz-body)",
            lineHeight: 1.35,
            resize,
            boxShadow: "none",
          }}
        />
        {maxLength ? (
          <div style={{ textAlign: "right", fontSize: "var(--tk-fz-caption)", color: "var(--tk-text-3)", marginTop: 4 }}>
            {val.length}/{maxLength}
          </div>
        ) : null}
      </div>
    </TKFormField>
  );
});

/* ---------------- Selectable row ---------------- */

export interface TKSelectableProps {
  label: ReactNode;
  subtitle?: ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  type?: "checkbox" | "radio";
  icon?: TKIconName;
  after?: ReactNode;
  name?: string;
  value?: string;
  testId?: string;
}

export const TKSelectable = /* @__PURE__ */ forwardRef<HTMLInputElement, TKSelectableProps>(function TKSelectable(
  {
    label,
    subtitle,
    checked,
    defaultChecked = false,
    onChange,
    disabled,
    type = "checkbox",
    icon,
    after,
    name,
    value,
    testId,
  },
  ref,
) {
  const [isChecked, setChecked] = useControllable(checked, defaultChecked, onChange);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (type !== "radio" || !name || checked !== undefined) return;
    const syncGroup = (event: Event) => {
      const target = event.target as HTMLInputElement | null;
      if (target?.type === "radio" && target.name === name && inputRef.current) {
        setChecked(inputRef.current.checked);
      }
    };
    document.addEventListener("change", syncGroup, true);
    return () => document.removeEventListener("change", syncGroup, true);
  }, [checked, name, setChecked, type]);

  return (
    <label
      data-testid={testId}
      className="tk-press tk-press-soft"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "11px 14px",
        borderRadius: "var(--tk-r-md)",
        background: isChecked ? "var(--tk-accent-06)" : "transparent",
        opacity: disabled ? 0.55 : 1,
        cursor: disabled ? "default" : "pointer",
      }}
    >
      <input
        ref={mergeRefs(inputRef, ref)}
        type={type}
        name={name}
        value={value}
        checked={isChecked}
        disabled={disabled}
        onChange={(e) => setChecked(e.target.checked)}
        style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
      />
      <span
        aria-hidden="true"
        style={{
          width: 24,
          height: 24,
          borderRadius: type === "radio" ? "50%" : "var(--tk-r-xs)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: isChecked ? "var(--tk-accent)" : "var(--tk-surface-2)",
          color: "var(--tk-on-accent)",
          boxShadow: isChecked ? "none" : "inset 0 0 0 1px var(--tk-sep)",
          flexShrink: 0,
          transition: "background var(--tk-t2) var(--tk-ease), box-shadow var(--tk-t2) var(--tk-ease)",
        }}
      >
        {isChecked ? <TKIcon name="check" size={14} strokeWidth={2.7} /> : icon ? <TKIcon name={icon} size={14} /> : null}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", color: "var(--tk-text)", fontSize: "var(--tk-fz-body)", fontWeight: 600 }}>
          {label}
        </span>
        {subtitle ? (
          <span style={{ display: "block", color: "var(--tk-text-2)", fontSize: "var(--tk-fz-caption)", marginTop: 1 }}>
            {subtitle}
          </span>
        ) : null}
      </span>
      {after}
    </label>
  );
});

/* ---------------- Multiselect ---------------- */

export interface TKMultiselectProps {
  label?: ReactNode;
  options: TKOption[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: ReactNode;
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
  const chosen = items.filter((item) => selected.includes(item.value));
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
                  {item.icon ? <TKIcon name={item.icon} size={13} /> : null}
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
          {items.map((item, i) => {
            const isSelected = selected.includes(item.value);
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
                {item.icon ? <TKIcon name={item.icon} size={17} /> : null}
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

/* ---------------- File input ---------------- */

export interface TKFileInputProps {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  disabled?: boolean;
  accept?: string;
  multiple?: boolean;
  buttonLabel?: ReactNode;
  emptyLabel?: ReactNode;
  onFilesChange?: (files: File[]) => void;
  testId?: string;
}

export const TKFileInput = /* @__PURE__ */ forwardRef<HTMLInputElement, TKFileInputProps>(function TKFileInput(
  {
    label,
    hint,
    error,
    disabled,
    accept,
    multiple,
    buttonLabel,
    emptyLabel,
    onFilesChange,
    testId,
  },
  forwardedRef,
) {
  const locale = useTKLocale();
  const ref = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const commit = (next: File[]) => {
    setFiles(next);
    onFilesChange?.(next);
  };
  return (
    <TKFormField label={label} hint={hint} error={error} disabled={disabled} testId={testId}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        className="tk-press tk-press-soft"
        onClick={() => !disabled && ref.current?.click()}
        onKeyDown={(event) => {
          if (disabled) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            ref.current?.click();
          }
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          minHeight: 58,
          padding: "10px 14px",
          borderRadius: "var(--tk-r-md)",
          background: "var(--tk-surface)",
          boxShadow: error ? "inset 0 0 0 1.5px var(--tk-red)" : "var(--tk-shadow-sm)",
          cursor: disabled ? "default" : "pointer",
        }}
      >
        <input
          ref={mergeRefs(ref, forwardedRef)}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={(e) => commit(Array.from(e.target.files ?? []))}
          // display:none keeps it clickable programmatically while staying out
          // of the focus order and accessibility tree (the row is the control)
          style={{ display: "none" }}
        />
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
            borderRadius: "var(--tk-r-sm)",
            background: "var(--tk-accent-12)",
            color: "var(--tk-accent)",
            flexShrink: 0,
          }}
        >
          <TKIcon name="share" size={18} />
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: "var(--tk-fz-body)", fontWeight: 600, color: "var(--tk-text)" }}>
            {buttonLabel ?? locale.chooseFile}
          </span>
          <span
            style={{
              display: "block",
              fontSize: "var(--tk-fz-caption)",
              color: files.length ? "var(--tk-text-2)" : "var(--tk-text-3)",
              marginTop: 1,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {files.length ? files.map((file) => file.name).join(", ") : (emptyLabel ?? locale.noFileSelected)}
          </span>
        </span>
      </div>
    </TKFormField>
  );
});

/* ---------------- Search ---------------- */

export interface TKSearchProps {
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onCancel?: () => void;
  cancelLabel?: string;
  testId?: string;
}

export const TKSearch = /* @__PURE__ */ forwardRef<HTMLInputElement, TKSearchProps>(function TKSearch(
  { placeholder, value, defaultValue = "", onChange, onCancel, cancelLabel, testId },
  ref,
) {
  const locale = useTKLocale();
  const [val, setVal] = useControllable(value, defaultValue, onChange);
  const [focus, setFocus] = useState(false);
  return (
    <div data-testid={testId} style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
          ref={ref}
          value={val}
          placeholder={placeholder ?? locale.search}
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
          color: "var(--tk-accent-ink)",
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
        {cancelLabel ?? locale.cancel}
      </button>
    </div>
  );
});

/* ---------------- Select (custom dropdown) ---------------- */

export interface TKSelectProps {
  label?: ReactNode;
  options: TKOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: ReactNode;
  disabled?: boolean;
  testId?: string;
}

export const TKSelect = /* @__PURE__ */ forwardRef<HTMLButtonElement, TKSelectProps>(function TKSelect(
  { label, options, value, defaultValue, onChange, placeholder, disabled, testId },
  forwardedRef,
) {
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
});

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
  testId?: string;
  style?: CSSProperties;
}

export const TKOTP = /* @__PURE__ */ forwardRef<HTMLInputElement, TKOTPProps>(function TKOTP(
  {
    length = 5,
    value,
    defaultValue = "",
    onChange,
    onComplete,
    onResend,
    successText,
    resendPrompt,
    resendLabel,
    testId,
    style,
  },
  forwardedRef,
) {
  const locale = useTKLocale();
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
    <div data-testid={testId} onClick={() => ref.current?.focus()} style={{ cursor: "text", position: "relative", ...style }}>
      <input
        ref={mergeRefs(ref, forwardedRef)}
        value={v}
        onChange={(e) => setV(e.target.value.replace(/\D/g, "").slice(0, length))}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        inputMode="numeric"
        aria-label={locale.oneTimeCode}
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
            <TKIcon name="check" size={13} strokeWidth={3} /> {successText ?? locale.codeVerified}
          </span>
        ) : (
          <>
            {resendPrompt ?? locale.didntGetCode}{" "}
            <span
              onClick={(e) => {
                e.stopPropagation();
                onResend?.();
              }}
              style={{ color: "var(--tk-accent-ink)", fontWeight: 600, cursor: "pointer" }}
            >
              {resendLabel ?? locale.resend}
            </span>
          </>
        )}
      </div>
    </div>
  );
});
