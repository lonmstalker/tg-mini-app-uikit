import { forwardRef, useRef, type ReactNode } from "react";
import { TKIcon } from "../icons";
import { tkOptionItem, type TKOption } from "../options";
import { useControllable } from "../internal/useControllable";
import { tkRovingNext, tkTabbableIndex } from "../internal/roving";
import { useOptionalHaptics } from "../telegram";
import { tkDomProps, type TKDomProps } from "../internal/dom";

/* ---------------- Checkbox / Radio / Switch ---------------- */

export interface TKCheckboxProps extends TKDomProps<HTMLButtonElement> {
  label?: ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  /** Mixed state (e.g. a parent of partially checked children). */
  indeterminate?: boolean;
  disabled?: boolean;
}

export const TKCheckbox = /* @__PURE__ */ forwardRef<HTMLButtonElement, TKCheckboxProps>(function TKCheckbox(
  { label, checked, defaultChecked, onChange, indeterminate, disabled, ...dom },
  ref,
) {
  const [on, setOn] = useControllable(checked, !!defaultChecked, onChange);
  const haptics = useOptionalHaptics();
  const boxOn = on || indeterminate;
  return (
    <button
      type="button"
      ref={ref}
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : on}
      disabled={disabled}
      onClick={() => {
        haptics.selection();
        setOn(!on);
      }}
      {...tkDomProps(dom)}
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
        opacity: disabled ? 0.45 : 1,
        pointerEvents: disabled ? "none" : undefined,
      }}
    >
      <span
        className="tk-press"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 24,
          height: 24,
          borderRadius: "var(--tk-r-xs)",
          background: boxOn ? "var(--tk-accent)" : "transparent",
          boxShadow: boxOn ? "0 3px 8px -2px var(--tk-accent-35)" : "inset 0 0 0 2px var(--tk-text-3)",
          color: "var(--tk-on-accent)",
          transition: "background var(--tk-t2) var(--tk-ease), box-shadow var(--tk-t2) var(--tk-ease)",
        }}
      >
        {indeterminate ? (
          <span className="tk-pop" style={{ display: "inline-flex" }}>
            <TKIcon name="minus" size={15} strokeWidth={3} />
          </span>
        ) : on ? (
          <span className="tk-pop" style={{ display: "inline-flex" }}>
            <TKIcon name="check" size={15} strokeWidth={3} />
          </span>
        ) : null}
      </span>
      {label}
    </button>
  );
});

export interface TKRadioGroupProps {
  options: TKOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  testId?: string;
}

export function TKRadioGroup({ options, value, defaultValue, onChange, disabled, testId }: TKRadioGroupProps) {
  const items = options.map(tkOptionItem);
  const firstEnabled = items.find((item) => !item.disabled);
  const [val, setVal] = useControllable(value, defaultValue ?? firstEnabled?.value ?? "", onChange);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const haptics = useOptionalHaptics();
  const disabledAt = (i: number) => disabled || !!items[i]?.disabled;
  const tabbable = tkTabbableIndex(items.findIndex((item) => item.value === val), items.length, disabledAt);
  return (
    <div role="radiogroup" data-testid={testId} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
    </div>
  );
}

export interface TKSwitchProps extends TKDomProps<HTMLButtonElement> {
  label?: ReactNode;
  /** Accessible name for the label-less (standalone) variant. */
  ariaLabel?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  small?: boolean;
  disabled?: boolean;
}

export const TKSwitch = /* @__PURE__ */ forwardRef<HTMLButtonElement, TKSwitchProps>(function TKSwitch(
  { label, ariaLabel, checked, defaultChecked, onChange, small, disabled, ...dom },
  ref,
) {
  const [on, setOn] = useControllable(checked, !!defaultChecked, onChange);
  const haptics = useOptionalHaptics();
  const toggle = () => {
    haptics.selection();
    setOn(!on);
  };
  const W = small ? 42 : 51;
  const H = small ? 26 : 31;
  const K = H - 4;
  const node = (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        width: W,
        height: H,
        padding: 2,
        borderRadius: "var(--tk-r-pill)",
        background: on ? "var(--tk-green)" : "var(--tk-surface-3)",
        transition: "background var(--tk-t2) var(--tk-ease)",
        cursor: "pointer",
        flexShrink: 0,
        opacity: disabled ? 0.45 : 1,
      }}
    >
      <span
        style={{
          width: K,
          height: K,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 2px 6px rgba(0,0,0,.22)",
          transform: on ? `translateX(${W - K - 4}px)` : "translateX(0)",
          transition: "transform var(--tk-t2) var(--tk-spring)",
        }}
      />
    </span>
  );
  if (!label)
    return (
      <button
        type="button"
        ref={ref}
        role="switch"
        aria-checked={on}
        disabled={disabled}
        onClick={() => setOn(!on)}
        {...tkDomProps(dom)}
        aria-label={dom["aria-label"] ?? ariaLabel}
        style={{
          display: "inline-flex",
          padding: 0,
          border: "none",
          background: "transparent",
          cursor: disabled ? "default" : "pointer",
        }}
      >
        {node}
      </button>
    );
  return (
    <button
      type="button"
      ref={ref}
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={toggle}
      {...tkDomProps(dom)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        width: "100%",
        border: "none",
        background: "transparent",
        padding: 0,
        fontFamily: "inherit",
        fontSize: "var(--tk-fz-body)",
        color: "var(--tk-text)",
        cursor: "pointer",
        opacity: disabled ? 0.45 : 1,
        pointerEvents: disabled ? "none" : undefined,
      }}
    >
      {label}
      {node}
    </button>
  );
});
