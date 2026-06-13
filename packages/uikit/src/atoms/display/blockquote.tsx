import type { CSSProperties, ReactNode } from "react";

export interface TKBlockquoteProps {
  children?: ReactNode;
  author?: ReactNode;
  /** Optional leading icon name shown next to the author line. */
  icon?: ReactNode;
  testId?: string;
  style?: CSSProperties;
}

/** Quote block with the Telegram-style vertical accent bar. */
export function TKBlockquote({ children, author, icon, testId, style }: TKBlockquoteProps) {
  return (
    <blockquote
      data-testid={testId}
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
          {icon}
          {author}
        </span>
      ) : null}
      <span style={{ fontSize: "var(--tk-fz-sub)", lineHeight: 1.4, color: "var(--tk-text)" }}>{children}</span>
    </blockquote>
  );
}
