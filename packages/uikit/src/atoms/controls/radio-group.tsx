import { forwardRef, useId, useRef, type CSSProperties } from "react";
import { tkRovingNext, tkTabbableIndex } from "../../internal/roving";
import { useControllable } from "../../internal/useControllable";
import { tkOptionItem, type TKOption } from "../../foundation/options";
import { useOptionalHaptics } from "../../foundation/telegram";
import { TKFormField } from "../inputs/form-field";
import type { TKFieldProps } from "../inputs/base";

export interface TKRadioGroupProps extends TKFieldProps<string> {
  options: TKOption[];
  /** Name the group directly when there's no visible field `label` (CTL-010). */
  "aria-label"?: string;
  "aria-labelledby"?: string;
  className?: string;
  /** Merged onto the root LAST — consumer values win (REU-007). */
  style?: CSSProperties;
}

export const TKRadioGroup = /* @__PURE__ */ forwardRef<HTMLDivElement, TKRadioGroupProps>(function TKRadioGroup(
  {
    options,
    value,
    defaultValue,
    onChange,
    disabled,
    label,
    hint,
    error,
    required,
    name,
    id,
    testId,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    className,
    style,
  },
  ref,
) {
  const items = options.map(tkOptionItem);
  // Default to "" (no selection) so an optional question can start blank and the
  // parent state matches the UI (CTL-002). Pass defaultValue to pre-select.
  const [val, setVal] = useControllable(value, defaultValue ?? "", onChange);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const haptics = useOptionalHaptics();
  const disabledAt = (i: number) => disabled || !!items[i]?.disabled;
  const tabbable = tkTabbableIndex(items.findIndex((item) => item.value === val), items.length, disabledAt);
  // Field chrome: label/hint/error wired by id so the radiogroup is named and the
  // error announced (CTL-DX-001/003); `name` plumbs the value into a form (FRM-DX-001).
  const reactId = useId();
  const labelId = label != null ? `${reactId}-label` : undefined;
  const descId = hint != null || error != null ? `${reactId}-desc` : undefined;
  // The rendered root differs by shape: with field chrome TKFormField is the
  // root, without it the radiogroup itself is (REU-007).
  const wrapped = label != null || hint != null || error != null;
  const group = (
    <div
      ref={ref}
      role="radiogroup"
      id={id}
      aria-label={ariaLabel}
      // Combine IDREFs so a consumer `aria-labelledby` augments the visible field
      // label rather than silently replacing it (the name would otherwise diverge).
      aria-labelledby={[labelId, ariaLabelledby].filter(Boolean).join(" ") || undefined}
      aria-describedby={descId}
      aria-required={required || undefined}
      aria-invalid={error != null ? true : undefined}
      data-testid={testId}
      className={wrapped ? undefined : className}
      style={{ display: "flex", flexDirection: "column", gap: 12, ...(wrapped ? null : style) }}
    >
      {items.map((item, i) => {
        const on = item.value === val;
        const off = disabled || item.disabled;
        return (
          <button
            type="button"
            role="radio"
            aria-checked={on}
            key={item.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            tabIndex={i === tabbable ? 0 : -1}
            disabled={off}
            onClick={() => {
              haptics.selection();
              setVal(item.value);
            }}
            onKeyDown={(e) => {
              // WAI-ARIA radio: arrows move both focus and selection
              const next = tkRovingNext(e.key, i, items.length, disabledAt);
              if (next == null) return;
              e.preventDefault();
              setVal(items[next].value);
              refs.current[next]?.focus();
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              border: "none",
              background: "transparent",
              padding: 0,
              fontFamily: "inherit",
              fontSize: "var(--tk-fz-body)",
              color: "var(--tk-text)",
              cursor: "pointer",
              opacity: off ? 0.45 : 1,
              pointerEvents: off ? "none" : undefined,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 24,
                height: 24,
                borderRadius: "50%",
                boxShadow: on ? "inset 0 0 0 2px var(--tk-accent)" : "inset 0 0 0 2px var(--tk-text-3)",
                transition: "box-shadow var(--tk-t2) var(--tk-ease)",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: "var(--tk-accent)",
                  transform: on ? "scale(1)" : "scale(0)",
                  transition: "transform var(--tk-t2) var(--tk-spring)",
                }}
              />
            </span>
            <span style={{ textAlign: "left" }}>{item.label}</span>
          </button>
        );
      })}
      {/* form-associated value so the group is visible to FormData (FRM-DX-001) */}
      {name != null ? <input type="hidden" name={name} value={val} /> : null}
    </div>
  );
  if (wrapped) {
    return (
      <TKFormField label={label} hint={hint} error={error} required={required} disabled={disabled} labelId={labelId} describedBy={descId} className={className} style={style}>
        {group}
      </TKFormField>
    );
  }
  return group;
});
