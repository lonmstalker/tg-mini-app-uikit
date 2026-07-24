import {
  forwardRef,
  type CSSProperties,
  type ElementType,
  type ForwardedRef,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type ReactElement,
  type ReactNode,
} from "react";
import { tkRenderIcon, type TKIconProp } from "../icons";
import type { TKPolymorphicProps, TKPolymorphicRef } from "../../internal/polymorphic";
import { useTKLocale } from "../../foundation/i18n";
import { TKSpinner } from "./spinner";
import { BTN_SIZES, tkButtonVariantStyle, type TKButtonSize, type TKButtonVariant } from "./shared";

export type { TKButtonSize, TKButtonVariant };
export { tkButtonVariantStyle };

export interface TKButtonOwnProps {
  children?: ReactNode;
  variant?: TKButtonVariant;
  size?: TKButtonSize;
  pill?: boolean;
  full?: boolean;
  /** Built-in icon name, or a custom element for glyphs outside the set (REU-004). */
  icon?: TKIconProp;
  disabled?: boolean;
  /** Shows a spinner, sets `aria-busy` and blocks clicks; the width stays stable. */
  loading?: boolean;
  /** Rendered as `data-testid`. */
  testId?: string;
  style?: CSSProperties;
  className?: string;
}

export type TKButtonProps<T extends ElementType = "button"> = TKPolymorphicProps<T, TKButtonOwnProps>;

function TKButtonImpl(
  {
    as,
    children,
    variant = "filled",
    size = "md",
    pill,
    full,
    icon,
    disabled,
    loading,
    testId,
    style,
    className,
    ...rest
  }: TKPolymorphicProps<ElementType, TKButtonOwnProps>,
  ref: ForwardedRef<HTMLElement>,
) {
  const locale = useTKLocale();
  const Tag = as ?? "button";
  const s = BTN_SIZES[size] ?? BTN_SIZES.md;
  const blocked = disabled || loading;
  const isButton = Tag === "button";
  // A blocked non-button (`as="a"`) must be truly inert: no href, out of tab
  // order, no activation — not just visually dimmed (BTN-001 / CC-07).
  const inertAnchor = !isButton && blocked;
  const { href: _href, onClick: userClick, onKeyDown: userKeyDown, ...restProps } = rest as {
    href?: string;
    onClick?: MouseEventHandler<HTMLElement>;
    onKeyDown?: KeyboardEventHandler<HTMLElement>;
  };
  const handleKeyDown: KeyboardEventHandler<HTMLElement> = (e) => {
    if (inertAnchor && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      return;
    }
    userKeyDown?.(e);
  };
  return (
    <Tag
      {...(isButton
        ? { type: "button", disabled: blocked }
        : { "aria-disabled": blocked || undefined, ...(inertAnchor ? { tabIndex: -1 } : { href: _href }) })}
      {...restProps}
      onClick={inertAnchor ? undefined : userClick}
      onKeyDown={handleKeyDown}
      ref={ref}
      data-testid={testId}
      className={["tk-press", className ?? ""].filter(Boolean).join(" ")}
      aria-busy={loading || undefined}
      style={{
        position: loading ? "relative" : undefined,
        display: full ? "flex" : "inline-flex",
        width: full ? "100%" : undefined,
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        height: s.h,
        padding: `0 ${s.px}px`,
        border: "none",
        borderRadius: pill ? "var(--tk-r-pill)" : "var(--tk-r-md)",
        fontSize: s.fz,
        fontWeight: 600,
        fontFamily: "inherit",
        letterSpacing: ".01em",
        textDecoration: "none",
        opacity: disabled ? 0.45 : 1,
        pointerEvents: blocked ? "none" : undefined,
        cursor: blocked ? "default" : "pointer",
        ...tkButtonVariantStyle(variant),
        ...style,
      }}
    >
      {loading ? (
        <>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              visibility: "hidden",
            }}
          >
            {tkRenderIcon(icon, { size: Math.round(s.h * 0.42) })}
            {children}
          </span>
          <span
            style={{
              position: "absolute",
              inset: 0,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TKSpinner color="currentColor" size={Math.round(s.h * 0.4)} />
          </span>
        </>
      ) : (
        <>
          {tkRenderIcon(icon, { size: Math.round(s.h * 0.42) })}
          {children}
        </>
      )}
      {/* Polite announcement of the busy state; the spinner itself is decorative
          (aria-hidden) and aria-busy alone isn't announced by most SRs (BTN-009).
          Mounted only while loading — matching AsyncBoundary, so a non-loading button
          never carries a stray empty live region. */}
      {loading ? (
        <span
          role="status"
          aria-live="polite"
          style={{
            position: "absolute",
            width: 1,
            height: 1,
            margin: -1,
            padding: 0,
            overflow: "hidden",
            clip: "rect(0,0,0,0)",
            whiteSpace: "nowrap",
            border: 0,
          }}
        >
          {locale.loading}
        </span>
      ) : null}
    </Tag>
  );
}

/** Polymorphic action button: `<TKButton as="a" href="...">` renders a styled link. */
export const TKButton = /* @__PURE__ */ forwardRef(TKButtonImpl) as <T extends ElementType = "button">(
  props: TKButtonProps<T> & { ref?: TKPolymorphicRef<T> },
) => ReactElement;
