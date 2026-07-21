import { forwardRef, useEffect, useMemo, useRef, type ReactNode } from "react";
import { TKIcon, tkRenderIcon, type TKIconProp } from "../icons";
import { mergeRefs } from "../../internal/dom";
import { useControllable } from "../../internal/useControllable";

export interface TKSelectableProps {
  label: ReactNode;
  subtitle?: ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  type?: "checkbox" | "radio";
  /** Built-in icon name, or a custom element for glyphs outside the set (REU-004). */
  icon?: TKIconProp;
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
  // Stable merged ref so a parent re-render doesn't detach/reattach the node (INP-006).
  const mergedRef = useMemo(() => mergeRefs(inputRef, ref), [ref]);

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
        ref={mergedRef}
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
          transition: "background var(--tk-t2) var(--tk-ease)", // box-shadow flips instantly (no repaint-per-frame animation)
        }}
      >
        {isChecked ? <TKIcon name="check" size={14} strokeWidth={2.7} /> : tkRenderIcon(icon, { size: 14 })}
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
