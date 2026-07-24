import { Children, isValidElement, type CSSProperties, type ReactNode } from "react";

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
  /** Merged onto the root, consumer values win (REU-007). */
  style?: CSSProperties;
  className?: string;
  testId?: string;
}

export function TKListGroup({
  children,
  title,
  footer,
  inset = true,
  separatorInset = 54,
  style,
  className,
  testId,
}: TKListGroupProps) {
  return (
    <div data-testid={testId} className={className} style={style}>
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
        {/* Drop conditional null/false children FIRST (so `cond ? <Cell/> : null` doesn't
            leave an empty wrapper or shift the separator count), then key each wrapper by
            the child's own key — a keyed child is moved, not remounted, on reorder (LST-009).
            One pass (reduce), not filter().map(): the filtered index IS acc.length. */}
        {Children.toArray(children).reduce<ReactNode[]>((acc, child) => {
          if (!isValidElement(child)) return acc;
          const i = acc.length;
          acc.push(
            <div key={child.key ?? i}>
              {i > 0 ? (
                <div style={{ height: 0.5, background: "var(--tk-sep)", marginLeft: separatorInset }} />
              ) : null}
              {child}
            </div>,
          );
          return acc;
        }, [])}
      </div>
      {footer ? (
        <div style={{ fontSize: "var(--tk-fz-caption)", color: "var(--tk-text-2)", margin: "7px 16px 0" }}>
          {footer}
        </div>
      ) : null}
    </div>
  );
}
