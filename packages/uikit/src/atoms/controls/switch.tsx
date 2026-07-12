import { forwardRef, type ReactNode } from "react";
import { tkDomProps, type TKDomProps } from "../../internal/dom";
import { useControllable } from "../../internal/useControllable";
import { useOptionalHaptics } from "../../foundation/telegram";

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
          background: "var(--tk-knob, #fff)",
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
        onClick={toggle}
        {...tkDomProps(dom)}
        aria-label={dom["aria-label"] ?? ariaLabel}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: 44, // CC-03 / CTL-004 touch target
          minHeight: 44,
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
