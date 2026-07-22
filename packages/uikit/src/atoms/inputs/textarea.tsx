import { forwardRef, useId, useState, type CSSProperties, type ReactNode } from "react";
import { TKFocusRing } from "../../internal/FocusRing";
import { useControllable } from "../../internal/useControllable";
import { TKFormField } from "./form-field";

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
          position: "relative",
          background: "var(--tk-surface)",
          borderRadius: "var(--tk-r-md)",
          padding: "12px 14px",
          // Static shadow; the focus ring fades on its own layer (TKFocusRing).
          boxShadow: `inset 0 0 0 1.5px ${borderColor}`,
        }}
      >
        <TKFocusRing show={focus && !error} />
        <textarea
          ref={ref}
          id={inputId}
          name={name}
          value={val}
          // Fallback name when no visible label (FRM-002): the placeholder
          // leaves the accname computation as soon as the field has a value.
          aria-label={label ? undefined : placeholder}
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
