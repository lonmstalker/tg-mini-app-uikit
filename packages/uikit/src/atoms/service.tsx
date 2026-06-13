import {
  forwardRef,
  type CSSProperties,
  type ElementType,
  type ForwardedRef,
  type MouseEventHandler,
  type ReactElement,
  type ReactNode,
} from "react";
import type { TKPolymorphicProps } from "../internal/polymorphic";

export interface TKVisuallyHiddenProps {
  children?: ReactNode;
  as?: "span" | "div";
  testId?: string;
}

export function TKVisuallyHidden({ children, as: Tag = "span", testId }: TKVisuallyHiddenProps) {
  return (
    <Tag
      data-testid={testId}
      style={{
        position: "absolute",
        width: 1,
        height: 1,
        padding: 0,
        margin: -1,
        overflow: "hidden",
        clip: "rect(0, 0, 0, 0)",
        whiteSpace: "nowrap",
        border: 0,
      }}
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
    testId,
    className,
    style,
    ...rest
  }: TKTappableOwnProps & { as?: ElementType } & Record<string, unknown>,
  ref: ForwardedRef<HTMLElement>,
) {
  const Tag = as ?? "button";
  return (
    <Tag
      {...(Tag === "button" ? { type: "button", disabled } : { "aria-disabled": disabled || undefined })}
      {...rest}
      ref={ref as never}
      data-testid={testId}
      aria-label={label}
      aria-pressed={pressed}
      onClick={onClick}
      className={["tk-press", className].filter(Boolean).join(" ")}
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
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}

/** Unstyled press surface; `<TKTappable as="a" href="...">` renders a link. */
export const TKTappable = /* @__PURE__ */ forwardRef(TKTappableImpl) as <T extends ElementType = "button">(
  props: TKTappableProps<T> & { ref?: ForwardedRef<HTMLElement> },
) => ReactElement;
