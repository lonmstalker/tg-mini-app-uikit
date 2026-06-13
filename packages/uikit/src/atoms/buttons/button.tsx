import {
  forwardRef,
  type CSSProperties,
  type ElementType,
  type ForwardedRef,
  type ReactElement,
  type ReactNode,
} from "react";
import { TKIcon, type TKIconName } from "../icons";
import type { TKPolymorphicProps } from "../../internal/polymorphic";
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
  icon?: TKIconName;
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
  }: TKButtonOwnProps & { as?: ElementType } & Record<string, unknown>,
  ref: ForwardedRef<HTMLElement>,
) {
  const Tag = as ?? "button";
  const s = BTN_SIZES[size] ?? BTN_SIZES.md;
  const blocked = disabled || loading;
  return (
    <Tag
      {...(Tag === "button" ? { type: "button", disabled: blocked } : { "aria-disabled": blocked || undefined })}
      {...rest}
      ref={ref as never}
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
            {icon ? <TKIcon name={icon} size={Math.round(s.h * 0.42)} /> : null}
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
          {icon ? <TKIcon name={icon} size={Math.round(s.h * 0.42)} /> : null}
          {children}
        </>
      )}
    </Tag>
  );
}

/** Polymorphic action button: `<TKButton as="a" href="...">` renders a styled link. */
export const TKButton = /* @__PURE__ */ forwardRef(TKButtonImpl) as <T extends ElementType = "button">(
  props: TKButtonProps<T> & { ref?: ForwardedRef<HTMLElement> },
) => ReactElement;
