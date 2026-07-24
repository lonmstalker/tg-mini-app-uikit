import { forwardRef, type CSSProperties, type ReactNode } from "react";
import { TKIcon } from "../icons";
import { useControllable } from "../../internal/useControllable";
import { tkDomProps, type TKDomProps } from "../../internal/dom";
import { useOptionalHaptics } from "../../foundation/telegram";

export interface TKCheckboxProps extends TKDomProps<HTMLButtonElement> {
  label?: ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  /** Mixed state (e.g. a parent of partially checked children). */
  indeterminate?: boolean;
  disabled?: boolean;
  /** Checked-box fill (any CSS color). Defaults to the accent (REU-003). */
  color?: string;
  /** Merged onto the root, consumer values win (REU-007). */
  style?: CSSProperties;
  className?: string;
}

export const TKCheckbox = /* @__PURE__ */ forwardRef<HTMLButtonElement, TKCheckboxProps>(function TKCheckbox(
  { label, checked, defaultChecked, onChange, indeterminate, disabled, color, style, className, ...dom },
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
      className={className}
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
        ...style,
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
          // The box must never be squeezed into an oval by a long wrapping
          // label — every sibling control guards this (REU-008).
          flexShrink: 0,
          borderRadius: "var(--tk-r-xs)",
          background: boxOn ? (color ?? "var(--tk-accent)") : "transparent",
          boxShadow: boxOn
            ? color
              ? "none"
              : "0 3px 8px -2px var(--tk-accent-35)"
            : "inset 0 0 0 2px var(--tk-text-3)",
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
