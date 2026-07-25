import { forwardRef, type BlockquoteHTMLAttributes, type ReactNode } from "react";
import { tkRenderIcon, type TKIconProp } from "../icons";

export interface TKBlockquoteProps extends BlockquoteHTMLAttributes<HTMLQuoteElement> {
  author?: ReactNode;
  /** Built-in icon name, or a custom element for glyphs outside the set (REU-004). */
  icon?: TKIconProp;
  testId?: string;
}

/** Quote block with the Telegram-style vertical accent bar. */
export const TKBlockquote = /* @__PURE__ */ forwardRef<HTMLQuoteElement, TKBlockquoteProps>(function TKBlockquote(
  { children, author, icon, className, style, testId, ...rest },
  ref,
) {
  return (
    <blockquote
      ref={ref}
      className={className}
      data-testid={testId}
      {...rest}
      style={{
        margin: 0,
        padding: "8px 12px",
        borderLeft: "3px solid var(--tk-accent)",
        borderRadius: "var(--tk-r-xs)",
        background: "var(--tk-accent-06)",
        display: "flex",
        flexDirection: "column",
        gap: 3,
        ...style,
      }}
    >
      {author ? (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--tk-accent-ink)", fontWeight: 700, fontSize: "var(--tk-fz-sub)" }}>
          {tkRenderIcon(icon, { size: 15 })}
          {author}
        </span>
      ) : null}
      <span style={{ fontSize: "var(--tk-fz-sub)", lineHeight: 1.4, color: "var(--tk-text)" }}>{children}</span>
    </blockquote>
  );
});
