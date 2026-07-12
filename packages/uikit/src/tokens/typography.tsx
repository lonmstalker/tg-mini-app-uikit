import { forwardRef, type CSSProperties, type ElementType, type HTMLAttributes, type ReactNode } from "react";

/** HTML passthrough shared by the typography primitives (id, aria-*, lang, dir,
 *  role, title…) so a heading can be labelled/described/marked-up (TYP-004). */
type TKTextHTMLProps = Omit<HTMLAttributes<HTMLElement>, "color" | "children" | "className" | "style">;

export type TKTextTone = "primary" | "secondary" | "tertiary" | "accent" | "green" | "red" | "orange";
export type TKTextWeight = 400 | 500 | 600 | 700;

const toneColor: Record<TKTextTone, string> = {
  primary: "var(--tk-text)",
  secondary: "var(--tk-text-2)",
  tertiary: "var(--tk-text-3)",
  accent: "var(--tk-accent)",
  green: "var(--tk-green)",
  red: "var(--tk-red)",
  orange: "var(--tk-orange)",
};

export interface TKTextProps extends TKTextHTMLProps {
  children?: ReactNode;
  as?: "span" | "p" | "div";
  tone?: TKTextTone;
  size?: "caption2" | "caption" | "footnote" | "sub" | "body" | "title3";
  weight?: TKTextWeight;
  align?: CSSProperties["textAlign"];
  /** Truncate with an ellipsis. Single-line by default; pair with `lines` to clamp
   *  to N lines instead (TYP-003). */
  truncate?: boolean;
  /** Clamp `truncate` to this many lines (>1 → multi-line ellipsis). */
  lines?: number;
  /** Override the default line-height without an inline-style hack (TYP-007). */
  leading?: CSSProperties["lineHeight"];
  className?: string;
  style?: CSSProperties;
  /** Rendered as `data-testid`. */
  testId?: string;
}

export const TKText = /* @__PURE__ */ forwardRef<HTMLElement, TKTextProps>(function TKText(
  {
    children,
    as: Tag = "span",
    tone = "primary",
    size = "body",
    weight = 400,
    align,
    truncate,
    lines,
    leading,
    className,
    style,
    testId,
    ...rest
  },
  ref,
) {
  // Multi-line clamp when truncating to >1 line; otherwise the single-line ellipsis.
  const clamp = truncate && lines && lines > 1;
  // ElementType so a single HTMLElement ref fits the span/p/div union (TYP-005).
  const Cmp = Tag as ElementType;
  return (
    <Cmp
      ref={ref}
      {...rest}
      data-testid={testId}
      className={className}
      style={{
        display: clamp ? "-webkit-box" : Tag === "span" ? "inline" : "block",
        margin: Tag === "p" ? 0 : undefined,
        color: toneColor[tone],
        fontSize: `var(--tk-fz-${size})`,
        fontWeight: weight,
        lineHeight: leading ?? (size.startsWith("caption") ? 1.25 : 1.35),
        textAlign: align,
        overflow: truncate ? "hidden" : undefined,
        textOverflow: truncate && !clamp ? "ellipsis" : undefined,
        whiteSpace: clamp ? "normal" : truncate ? "nowrap" : undefined,
        WebkitBoxOrient: clamp ? "vertical" : undefined,
        WebkitLineClamp: clamp ? lines : undefined,
        ...style,
      }}
    >
      {children}
    </Cmp>
  );
});

export interface TKTitleProps extends TKTextHTMLProps {
  children?: ReactNode;
  /** Visual + semantic heading level. `"large"` is a bigger visual than `1` but maps
   *  to the same `aria-level` (1) — pick a distinct numeric `level` if you need a
   *  distinct a11y level under a non-heading `as` (TYP-006). */
  level?: 1 | 2 | 3 | "large";
  as?: "h1" | "h2" | "h3" | "div";
  tone?: TKTextTone;
  align?: CSSProperties["textAlign"];
  truncate?: boolean;
  /** Override the hard-coded bold weight (TYP-007). */
  weight?: TKTextWeight;
  className?: string;
  style?: CSSProperties;
  testId?: string;
}

export const TKTitle = /* @__PURE__ */ forwardRef<HTMLElement, TKTitleProps>(function TKTitle(
  { children, level = 2, as, tone = "primary", align, truncate, weight = 700, className, style, testId, ...rest },
  ref,
) {
  // ElementType so a single HTMLElement ref fits the h1/h2/h3/div union (TYP-005).
  const Tag = (as ?? (level === 1 || level === "large" ? "h1" : level === 2 ? "h2" : "h3")) as ElementType;
  const size = level === "large" ? "large" : level === 1 ? "title1" : level === 2 ? "title2" : "title3";
  // A non-heading `as` (e.g. "div") loses heading semantics silently — keep them via
  // role/aria-level driven by `level`, so heading order isn't broken (TYP-006).
  const ariaLevel = level === "large" ? 1 : level;
  const isNativeHeading = Tag === "h1" || Tag === "h2" || Tag === "h3";
  return (
    <Tag
      ref={ref}
      {...rest}
      data-testid={testId}
      role={isNativeHeading ? undefined : "heading"}
      aria-level={isNativeHeading ? undefined : ariaLevel}
      className={className}
      style={{
        margin: 0,
        color: toneColor[tone],
        fontSize: `var(--tk-fz-${size})`,
        fontWeight: weight,
        lineHeight: 1.12,
        textAlign: align,
        overflow: truncate ? "hidden" : undefined,
        textOverflow: truncate ? "ellipsis" : undefined,
        whiteSpace: truncate ? "nowrap" : undefined,
        ...style,
      }}
    >
      {children}
    </Tag>
  );
});

export interface TKCaptionProps extends TKTextHTMLProps {
  children?: ReactNode;
  tone?: TKTextTone;
  uppercase?: boolean;
  weight?: TKTextWeight;
  className?: string;
  style?: CSSProperties;
  testId?: string;
}

export const TKCaption = /* @__PURE__ */ forwardRef<HTMLSpanElement, TKCaptionProps>(function TKCaption(
  { children, tone = "secondary", uppercase, weight = 600, className, style, testId, ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      {...rest}
      data-testid={testId}
      className={className}
      style={{
        color: toneColor[tone],
        fontSize: "var(--tk-fz-caption)",
        fontWeight: weight,
        letterSpacing: uppercase ? ".05em" : 0,
        textTransform: uppercase ? "uppercase" : undefined,
        lineHeight: 1.25,
        ...style,
      }}
    >
      {children}
    </span>
  );
});
