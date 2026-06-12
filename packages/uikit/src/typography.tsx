import type { CSSProperties, ReactNode } from "react";

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

export interface TKTextProps {
  children?: ReactNode;
  as?: "span" | "p" | "div";
  tone?: TKTextTone;
  size?: "caption2" | "caption" | "footnote" | "sub" | "body" | "title3";
  weight?: TKTextWeight;
  align?: CSSProperties["textAlign"];
  truncate?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function TKText({
  children,
  as: Tag = "span",
  tone = "primary",
  size = "body",
  weight = 400,
  align,
  truncate,
  className,
  style,
}: TKTextProps) {
  return (
    <Tag
      className={className}
      style={{
        display: Tag === "span" ? "inline" : "block",
        margin: Tag === "p" ? 0 : undefined,
        color: toneColor[tone],
        fontSize: `var(--tk-fz-${size})`,
        fontWeight: weight,
        lineHeight: size.startsWith("caption") ? 1.25 : 1.35,
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
}

export interface TKTitleProps {
  children?: ReactNode;
  level?: 1 | 2 | 3 | "large";
  as?: "h1" | "h2" | "h3" | "div";
  tone?: TKTextTone;
  align?: CSSProperties["textAlign"];
  truncate?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function TKTitle({
  children,
  level = 2,
  as,
  tone = "primary",
  align,
  truncate,
  className,
  style,
}: TKTitleProps) {
  const Tag = as ?? (level === 1 || level === "large" ? "h1" : level === 2 ? "h2" : "h3");
  const size = level === "large" ? "large" : level === 1 ? "title1" : level === 2 ? "title2" : "title3";
  return (
    <Tag
      className={className}
      style={{
        margin: 0,
        color: toneColor[tone],
        fontSize: `var(--tk-fz-${size})`,
        fontWeight: 700,
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
}

export interface TKCaptionProps {
  children?: ReactNode;
  tone?: TKTextTone;
  uppercase?: boolean;
  weight?: TKTextWeight;
  className?: string;
  style?: CSSProperties;
}

export function TKCaption({
  children,
  tone = "secondary",
  uppercase,
  weight = 600,
  className,
  style,
}: TKCaptionProps) {
  return (
    <span
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
}
