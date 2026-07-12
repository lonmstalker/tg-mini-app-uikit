import {
  forwardRef,
  type CSSProperties,
  type ElementType,
  type ForwardedRef,
  type HTMLAttributes,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type ReactElement,
  type ReactNode,
} from "react";
import type { TKPolymorphicProps, TKPolymorphicRef } from "../internal/polymorphic";
import { tkMinTargetStyle } from "../internal/dom";

export interface TKVisuallyHiddenProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
  as?: "span" | "div";
  /** Reveal the content when it (or a descendant) gets keyboard focus — e.g. a skip link (SVC-002). */
  focusable?: boolean;
  /**
   * Merged over the `tk-sr-only` class. Note: an inline `position`/`overflow`/`clip`
   * here will override the class and can un-hide the content — only pass cosmetic style.
   */
  style?: CSSProperties;
  testId?: string;
}

export function TKVisuallyHidden({
  children,
  as: Tag = "span",
  focusable,
  className,
  testId,
  ...rest
}: TKVisuallyHiddenProps) {
  return (
    <Tag
      {...rest}
      data-testid={testId}
      className={["tk-sr-only", focusable ? "tk-sr-only-focusable" : "", className].filter(Boolean).join(" ")}
    >
      {children}
    </Tag>
  );
}

export interface TKTappableOwnProps {
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLElement>;
  disabled?: boolean;
  pressed?: boolean;
  label?: string;
  /** Minimum touch-target size in px (CC-03), default 44. `false` opts out. */
  minTarget?: number | false;
  /** Omit the `tk-press` press-scale class entirely (default true) (SVC-005). */
  pressEffect?: boolean;
  testId?: string;
  className?: string;
  style?: CSSProperties;
}

export type TKTappableProps<T extends ElementType = "button"> = TKPolymorphicProps<T, TKTappableOwnProps>;

function TKTappableImpl(
  {
    as,
    children,
    onClick,
    disabled,
    pressed,
    label,
    minTarget = 44,
    pressEffect = true,
    testId,
    className,
    style,
    ...rest
  }: TKPolymorphicProps<ElementType, TKTappableOwnProps>,
  ref: ForwardedRef<HTMLElement>,
) {
  const Tag = as ?? "button";
  const isButton = Tag === "button";
  // A disabled non-button (e.g. `as="a"`) is not inert by default: drop href,
  // pull it out of the tab order, swallow activation, and mark it aria-disabled
  // so it can't navigate or fire (CC-07 / SVC-001).
  const inertAnchor = !isButton && disabled;
  const { href: _href, onKeyDown: userKeyDown, ...restProps } = rest as { href?: string; onKeyDown?: KeyboardEventHandler<HTMLElement> };
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
        ? { type: "button", disabled }
        : { "aria-disabled": disabled || undefined, ...(inertAnchor ? { tabIndex: -1 } : { href: _href }) })}
      {...restProps}
      ref={ref}
      data-testid={testId}
      aria-label={label}
      aria-pressed={pressed}
      onClick={inertAnchor ? undefined : onClick}
      onKeyDown={handleKeyDown}
      className={[pressEffect ? "tk-press" : "", className].filter(Boolean).join(" ") || undefined}
      style={{
        appearance: "none",
        WebkitAppearance: "none",
        border: "none",
        background: "transparent",
        color: "inherit",
        font: "inherit",
        padding: 0,
        margin: 0,
        cursor: disabled ? "default" : "pointer",
        textAlign: "inherit",
        textDecoration: "none",
        opacity: disabled ? 0.55 : 1,
        touchAction: "manipulation",
        ...(inertAnchor ? { pointerEvents: "none" } : null),
        ...tkMinTargetStyle(minTarget),
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}

/** Unstyled press surface; `<TKTappable as="a" href="...">` renders a link. */
export const TKTappable = /* @__PURE__ */ forwardRef(TKTappableImpl) as <T extends ElementType = "button">(
  props: TKTappableProps<T> & { ref?: TKPolymorphicRef<T> },
) => ReactElement;
