import { Children, isValidElement, type ReactNode } from "react";

/* ---------------- List group ---------------- */

export interface TKListGroupProps {
  children?: ReactNode;
  title?: ReactNode;
  footer?: ReactNode;
  inset?: boolean;
  /**
   * Left indent of the row separators, px. Defaults to `54` (aligns under the
   * text of icon rows); pass `0` for full-bleed separators on icon-less lists.
   */
  separatorInset?: number;
  testId?: string;
}

export function TKListGroup({ children, title, footer, inset = true, separatorInset = 54, testId }: TKListGroupProps) {
  return (
    <div data-testid={testId}>
      {title ? (
        <div
          style={{
            fontSize: "var(--tk-fz-caption)",
            fontWeight: 600,
            letterSpacing: ".05em",
            textTransform: "uppercase",
            color: "var(--tk-text-2)",
            margin: "0 16px 7px",
          }}
        >
          {title}
        </div>
      ) : null}
      <div
        style={{
          background: "var(--tk-surface)",
          borderRadius: inset ? "var(--tk-r-md)" : 0,
          overflow: "hidden",
          boxShadow: inset ? "var(--tk-shadow-sm)" : "none",
        }}
      >
        {Children.toArray(children).map((child, i) => (
          <div key={isValidElement(child) && child.key != null ? child.key : i}>
            {i > 0 ? (
              <div style={{ height: 0.5, background: "var(--tk-sep)", marginLeft: separatorInset }} />
            ) : null}
            {child}
          </div>
        ))}
      </div>
      {footer ? (
        <div style={{ fontSize: "var(--tk-fz-caption)", color: "var(--tk-text-2)", margin: "7px 16px 0" }}>
          {footer}
        </div>
      ) : null}
    </div>
  );
}
