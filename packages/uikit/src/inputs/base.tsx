import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type ReactNode,
} from "react";
import { TKIcon, type TKIconName } from "../icons";
import { useControllable } from "../internal/useControllable";
import { mergeRefs } from "../internal/dom";
import { useTKLocale } from "../i18n";

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
  /** Shows a `n/maxLength` counter under the field. */
  maxLength?: number;
  /** Leading slot inside the field (before the input). */
  prefix?: ReactNode;
  /** Trailing slot inside the field (after the clear button). */
  suffix?: ReactNode;
  inputMode?: "none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search";
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
    maxLength,
    prefix,
    suffix,
    inputMode,
    testId,
  },
  ref,
) {
  const locale = useTKLocale();
  const [val, setVal] = useControllable(value, defaultValue, onChange);
  const [focus, setFocus] = useState(false);
  const [reveal, setReveal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const autoId = useId();
  const inputId = id ?? autoId;
  const describedBy = hint || error ? `${inputId}-description` : undefined;
  const clearLabel = typeof label === "string" ? `${locale.clear} ${label}` : locale.clear;
  const isPassword = type === "password";
  const borderColor = error ? "var(--tk-red)" : focus ? "var(--tk-accent)" : "transparent";
  return (
    <TKFormField label={label} hint={hint} error={error} htmlFor={inputId} describedBy={describedBy} disabled={disabled} testId={testId}>
      <div
        onMouseDown={(event) => {
          if (disabled) return;
          const target = event.target as HTMLElement;
          if (target === inputRef.current || target.closest("button,a,input,textarea,select,[role='button'],[role='switch']")) return;
          event.preventDefault();
          inputRef.current?.focus();
        }}
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
        {prefix}
        <input
          ref={mergeRefs(inputRef, ref)}
          id={inputId}
          type={isPassword && reveal ? "text" : type}
          name={name}
          value={val}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          maxLength={maxLength}
          inputMode={inputMode}
          aria-describedby={describedBy}
          aria-invalid={!!error}
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
            aria-label={clearLabel}
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
        {isPassword ? (
          <button
            type="button"
            aria-label={reveal ? locale.hidePassword : locale.showPassword}
            onClick={(e) => {
              e.preventDefault();
              setReveal(!reveal);
            }}
            style={{
              display: "inline-flex",
              border: "none",
              background: "transparent",
              color: "var(--tk-text-2)",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <TKIcon name={reveal ? "eyeOff" : "eye"} size={18} />
          </button>
        ) : null}
        {suffix}
      </div>
      {maxLength ? (
        <div style={{ textAlign: "right", fontSize: "var(--tk-fz-caption)", color: "var(--tk-text-3)", margin: "4px 14px 0" }}>
          {val.length}/{maxLength}
        </div>
      ) : null}
    </TKFormField>
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
