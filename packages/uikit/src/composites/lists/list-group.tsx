import { Children, type ReactNode } from "react";

/* ---------------- List group ---------------- */

export interface TKListGroupProps {
  children?: ReactNode;
  title?: ReactNode;
  footer?: ReactNode;
  inset?: boolean;
  testId?: string;
}

export function TKListGroup({ children, title, footer, inset = true, testId }: TKListGroupProps) {
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
        {Children.toArray(children).map((c, i) => (
          <div key={i}>
            {i > 0 ? <div style={{ height: 0.5, background: "var(--tk-sep)", marginLeft: 54 }} /> : null}
            {c}
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
