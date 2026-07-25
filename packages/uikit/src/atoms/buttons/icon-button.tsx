import {
  forwardRef,
  type CSSProperties,
  type KeyboardEventHandler,
  type MouseEvent,
  type MouseEventHandler,
} from "react";
import { tkRenderIcon, type TKIconProp } from "../icons";
import { tkDomProps, type TKDomProps } from "../../internal/dom";
import { ICON_BTN_SIZES, tkButtonVariantStyle, type TKButtonVariant, type TKIconButtonSize } from "./shared";

export type { TKIconButtonSize };

export interface TKIconButtonProps extends TKDomProps<HTMLButtonElement> {
  /** Built-in icon name, or a custom element for glyphs outside the set (REU-004). */
  icon: TKIconProp;
  variant?: TKButtonVariant;
  /**
   * Visual size. Prefer the `"sm" | "md" | "lg"` variants;
   * a raw pixel number remains accepted by the current API.
   * @deprecated numbers - use the size variants instead.
   */
  size?: TKIconButtonSize | number;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  /** Merged onto the root LAST — consumer values win (REU-007). */
  style?: CSSProperties;
  active?: boolean;
  disabled?: boolean;
  /** Accessible label - icon buttons have no visible text. */
  label?: string;
  /** Corner badge: a number renders a counter, `true` renders a dot. */
  badge?: number | boolean;
  // Native button props the vetted TKDomProps set doesn't cover (BTN-005).
  type?: "button" | "submit" | "reset";
  name?: string;
  value?: string;
  form?: string;
  title?: string;
  onKeyDown?: KeyboardEventHandler<HTMLButtonElement>;
  onMouseEnter?: MouseEventHandler<HTMLButtonElement>;
  onMouseLeave?: MouseEventHandler<HTMLButtonElement>;
}

export const TKIconButton = /* @__PURE__ */ forwardRef<HTMLButtonElement, TKIconButtonProps>(function TKIconButton(
  {
    icon,
    variant = "tonal",
    size = "md",
    onClick,
    className,
    style,
    active,
    disabled,
    label,
    badge,
    type = "button",
    name,
    value,
    form,
    title,
    onKeyDown,
    onMouseEnter,
    onMouseLeave,
    ...dom
  },
  ref,
) {
  const px = typeof size === "number" ? size : (ICON_BTN_SIZES[size] ?? ICON_BTN_SIZES.md);
  // A counter only shows when > 0; a dot shows for any truthy non-number (BTN-006).
  const hasBadge = typeof badge === "number" ? badge > 0 : !!badge;
  return (
    <button
      type={type}
      ref={ref}
      className={["tk-press", className].filter(Boolean).join(" ")}
      onClick={onClick}
      onKeyDown={onKeyDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      name={name}
      value={value}
      form={form}
      title={title}
      disabled={disabled}
      {...tkDomProps(dom)}
      aria-label={dom["aria-label"] ?? label}
      style={{
        position: hasBadge ? "relative" : undefined,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: px,
        height: px,
        minWidth: 44, // CC-03 / BTN-004 touch target
        minHeight: 44,
        border: "none",
        borderRadius: "var(--tk-r-pill)",
        opacity: disabled ? 0.45 : 1,
        pointerEvents: disabled ? "none" : undefined,
        ...tkButtonVariantStyle(variant),
        ...(active ? { background: "var(--tk-accent)", color: "var(--tk-on-accent)" } : {}),
        ...style,
      }}
    >
      {tkRenderIcon(icon, { size: Math.round(px * 0.52) })}
      {/* Clamp to "99+" and hide the bubble for 0/negative counts (BTN-006). */}
      {typeof badge === "number" && badge > 0 ? (
        <span
          style={{
            position: "absolute",
            top: -4,
            right: -4,
            minWidth: 17,
            height: 17,
            padding: "0 4px",
            borderRadius: "var(--tk-r-pill)",
            background: "var(--tk-red)",
            color: "#fff",
            fontSize: "var(--tk-fz-caption2)",
            fontWeight: 700,
            lineHeight: 1,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 0 2px var(--tk-surface)",
          }}
        >
          {badge > 99 ? "99+" : badge}
        </span>
      ) : typeof badge !== "number" && badge ? (
        <span
          data-tk-badge-dot
          style={{
            position: "absolute",
            top: -1,
            right: -1,
            width: 9,
            height: 9,
            borderRadius: "50%",
            background: "var(--tk-red)",
            boxShadow: "0 0 0 2px var(--tk-surface)",
          }}
        />
      ) : null}
    </button>
  );
});
