import { forwardRef, type CSSProperties, type MouseEvent } from "react";
import { TKIcon, type TKIconName } from "../icons";
import { tkDomProps, type TKDomProps } from "../../internal/dom";
import { ICON_BTN_SIZES, tkButtonVariantStyle, type TKButtonVariant, type TKIconButtonSize } from "./shared";

export type { TKIconButtonSize };

export interface TKIconButtonProps extends TKDomProps<HTMLButtonElement> {
  icon: TKIconName;
  variant?: TKButtonVariant;
  /**
   * Visual size. Prefer the `"sm" | "md" | "lg"` variants;
   * a raw pixel number remains accepted by the current API.
   * @deprecated numbers - use the size variants instead.
   */
  size?: TKIconButtonSize | number;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  style?: CSSProperties;
  active?: boolean;
  disabled?: boolean;
  /** Accessible label - icon buttons have no visible text. */
  label?: string;
  /** Corner badge: a number renders a counter, `true` renders a dot. */
  badge?: number | boolean;
}

export const TKIconButton = /* @__PURE__ */ forwardRef<HTMLButtonElement, TKIconButtonProps>(function TKIconButton(
  { icon, variant = "tonal", size = "md", onClick, style, active, disabled, label, badge, ...dom },
  ref,
) {
  const px = typeof size === "number" ? size : (ICON_BTN_SIZES[size] ?? ICON_BTN_SIZES.md);
  return (
    <button
      type="button"
      ref={ref}
      className="tk-press"
      onClick={onClick}
      disabled={disabled}
      {...tkDomProps(dom)}
      aria-label={dom["aria-label"] ?? label}
      style={{
        position: badge != null && badge !== false ? "relative" : undefined,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: px,
        height: px,
        border: "none",
        borderRadius: "var(--tk-r-pill)",
        opacity: disabled ? 0.45 : 1,
        pointerEvents: disabled ? "none" : undefined,
        ...tkButtonVariantStyle(variant),
        ...(active ? { background: "var(--tk-accent)", color: "var(--tk-on-accent)" } : {}),
        ...style,
      }}
    >
      <TKIcon name={icon} size={Math.round(px * 0.52)} />
      {typeof badge === "number" ? (
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
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 0 2px var(--tk-surface)",
          }}
        >
          {badge}
        </span>
      ) : badge ? (
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
