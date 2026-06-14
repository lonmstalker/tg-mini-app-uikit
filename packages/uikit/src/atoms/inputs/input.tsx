import { forwardRef, useId, useRef, useState, type ChangeEvent, type FocusEvent, type ReactNode } from "react";
import { TKIcon, type TKIconName } from "../icons";
import { mergeRefs } from "../../internal/dom";
import { useControllable } from "../../internal/useControllable";
import { useTKLocale } from "../../foundation/i18n";
import { TKFormField } from "./form-field";

export interface TKInputProps {
  label?: ReactNode;
  placeholder?: string;
  type?: string;
  icon?: TKIconName;
  value?: string;
  defaultValue?: string;
  /**
   * Receives the new value. The native change event is passed as a second
   * argument too, so callers that need DOM details (caret position via
   * `event.target.selectionStart`, etc.) can read them without an extra ref.
   */
  onChange?: (value: string, event?: ChangeEvent<HTMLInputElement>) => void;
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
  /**
   * Validates the value when the field loses focus (and live afterwards).
   * Return a message to show it as an error, or `undefined`/`null` when valid.
   * `type="email"` gets a built-in format check unless you pass your own.
   */
  validate?: (value: string) => ReactNode;
  testId?: string;
}

// Pragmatic UI-level email shape: a local part, an @, and a dotted domain.
const TK_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    validate,
    testId,
  },
  ref,
) {
  const locale = useTKLocale();
  // `onChange` is invoked directly (below) so it can forward the native event;
  // `useControllable` handles only the controlled/uncontrolled mirroring here.
  const [val, setVal] = useControllable(value, defaultValue);
  const [focus, setFocus] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [touched, setTouched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const autoId = useId();
  const inputId = id ?? autoId;
  const isPassword = type === "password";
  const validator =
    validate ?? (type === "email" ? (v: string) => (v && !TK_EMAIL_RE.test(v) ? locale.invalidEmail : undefined) : undefined);
  // Validate only once the field has been touched, so a pristine field never shows red.
  const validationError = touched && validator ? validator(val) : undefined;
  const shownError = error ?? validationError;
  const resolvedInputMode = inputMode ?? (type === "email" ? "email" : undefined);
  const describedBy = hint || shownError ? `${inputId}-description` : undefined;
  const clearLabel = typeof label === "string" ? `${locale.clear} ${label}` : locale.clear;
  const borderColor = shownError ? "var(--tk-red)" : focus ? "var(--tk-accent)" : "transparent";
  return (
    <TKFormField label={label} hint={hint} error={shownError} htmlFor={inputId} describedBy={describedBy} disabled={disabled} testId={testId}>
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
          inputMode={resolvedInputMode}
          aria-describedby={describedBy}
          aria-invalid={!!shownError}
          onChange={(e) => {
            setVal(e.target.value);
            onChange?.(e.target.value, e);
          }}
          onFocus={(e) => {
            setFocus(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocus(false);
            setTouched(true);
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
              onChange?.("");
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

export type TKFormInputProps = TKInputProps;

export const TKFormInput = /* @__PURE__ */ forwardRef<HTMLInputElement, TKFormInputProps>(function TKFormInput(props, ref) {
  return <TKInput {...props} ref={ref} />;
});
