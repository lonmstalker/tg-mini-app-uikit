import { forwardRef, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { TKIcon, type TKIconName } from "../../atoms/icons";
import { TKFormField } from "../../atoms/inputs";
import { mergeRefs } from "../../internal/dom";

/** Open the OS-native date/time picker, where the browser supports it. */
function openNativePicker(el: HTMLInputElement | null) {
  if (!el || el.disabled) return;
  try {
    // showPicker() is the only way to force the OS popup on desktop browsers,
    // where the field otherwise just exposes arrow steppers.
    (el as HTMLInputElement & { showPicker?: () => void }).showPicker?.();
  } catch {
    /* not allowed (e.g. cross-origin) — fall back to the inline control */
  }
}

/*
 * Thin wrapper around a native `<input type="date|time">` so the OS-native
 * picker (and on-screen keyboard) is available with the kit's field chrome.
 * Used by TKDateInput / TKTimeInput in their `native` mode.
 */

export interface TKNativeFieldProps {
  type: "date" | "time" | "datetime-local" | "month";
  value: string;
  onChange: (value: string) => void;
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  icon?: TKIconName;
  disabled?: boolean;
  min?: string;
  max?: string;
  step?: number;
  name?: string;
  id?: string;
  testId?: string;
  style?: CSSProperties;
}

export const TKNativeField = /* @__PURE__ */ forwardRef<HTMLInputElement, TKNativeFieldProps>(function TKNativeField(
  { type, value, onChange, label, hint, error, icon, disabled, min, max, step, name, id, testId, style },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const [focus, setFocus] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const describedBy = hint || error ? `${inputId}-description` : undefined;
  const borderColor = error ? "var(--tk-red)" : focus ? "var(--tk-accent)" : "transparent";
  return (
    <TKFormField label={label} hint={hint} error={error} htmlFor={inputId} describedBy={describedBy} disabled={disabled} testId={testId} style={style}>
      {/* Clicking anywhere in the field opens the OS picker (not just the tiny indicator). */}
      <div
        onClick={() => openNativePicker(inputRef.current)}
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
          opacity: disabled ? 0.55 : 1,
          cursor: disabled ? "default" : "pointer",
        }}
      >
        {icon ? (
          <span style={{ color: focus ? "var(--tk-accent)" : "var(--tk-text-3)", display: "inline-flex" }}>
            <TKIcon name={icon} size={19} />
          </span>
        ) : null}
        <input
          ref={mergeRefs(inputRef, ref)}
          id={inputId}
          type={type}
          name={name}
          value={value}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          aria-describedby={describedBy}
          aria-invalid={!!error}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            flex: 1,
            minWidth: 0,
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: "var(--tk-fz-body)",
            fontFamily: "inherit",
            color: "var(--tk-text)",
            cursor: disabled ? "default" : "pointer",
            // Let the native calendar/clock indicator follow the active theme.
            colorScheme: "light dark",
            boxShadow: "none",
          }}
        />
      </div>
    </TKFormField>
  );
});
