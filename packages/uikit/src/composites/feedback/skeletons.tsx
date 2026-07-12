import { forwardRef, type HTMLAttributes } from "react";

/* ---------------- Skeletons ---------------- */

export interface TKSkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  testId?: string;
}

export const TKSkeleton = /* @__PURE__ */ forwardRef<HTMLDivElement, TKSkeletonProps>(function TKSkeleton(
  { width, height = 13, radius, className, style, testId, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={["tk-skel", className ?? ""].filter(Boolean).join(" ")}
      data-testid={testId}
      {...rest}
      style={{ width, height, borderRadius: radius, ...style }}
    />
  );
});

export interface TKSkeletonCardProps extends HTMLAttributes<HTMLDivElement> {
  testId?: string;
}

export const TKSkeletonCard = /* @__PURE__ */ forwardRef<HTMLDivElement, TKSkeletonCardProps>(function TKSkeletonCard(
  { className, style, testId, ...rest } = {},
  ref,
) {
  return (
    <div
      ref={ref}
      className={className}
      data-testid={testId}
      {...rest}
      style={{
        background: "var(--tk-surface)",
        borderRadius: "var(--tk-r-lg)",
        padding: 10,
        boxShadow: "var(--tk-shadow-sm)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        ...style,
      }}
    >
      <div className="tk-skel" style={{ aspectRatio: "1.4 / 1", borderRadius: "var(--tk-r-md)" }} />
      <div className="tk-skel" style={{ height: 13, width: "72%" }} />
      <div className="tk-skel" style={{ height: 13, width: "45%" }} />
    </div>
  );
});

export interface TKSkeletonListProps extends HTMLAttributes<HTMLDivElement> {
  rows?: number;
  testId?: string;
}

export const TKSkeletonList = /* @__PURE__ */ forwardRef<HTMLDivElement, TKSkeletonListProps>(function TKSkeletonList(
  { rows = 3, className, style, testId, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={className}
      data-testid={testId}
      {...rest}
      style={{
        width: "100%",
        boxSizing: "border-box",
        background: "var(--tk-surface)",
        borderRadius: "var(--tk-r-md)",
        boxShadow: "var(--tk-shadow-sm)",
        overflow: "hidden",
        ...style,
      }}
    >
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 14px",
            borderTop: i ? "0.5px solid var(--tk-sep)" : "none",
          }}
        >
          <div className="tk-skel" style={{ width: 38, height: 38, borderRadius: "50%", flexShrink: 0 }} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
            <div className="tk-skel" style={{ height: 12, width: `${68 - (i % 3) * 12}%` }} />
            <div className="tk-skel" style={{ height: 10, width: `${40 + (i % 3) * 10}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
});

export interface TKSkeletonTableProps extends HTMLAttributes<HTMLDivElement> {
  /** Body rows (default 4). */
  rows?: number;
  /** Columns per row (default 3). */
  columns?: number;
  /** Render a stronger header row (default true). */
  header?: boolean;
  testId?: string;
}

/** Placeholder for a loading data table: a header row plus body rows of cells. */
export const TKSkeletonTable = /* @__PURE__ */ forwardRef<HTMLDivElement, TKSkeletonTableProps>(function TKSkeletonTable(
  { rows = 4, columns = 3, header = true, className, style, testId, ...rest },
  ref,
) {
  const cols = Math.max(1, columns);
  // The first column is wider (label-like), the rest share the remaining space.
  const template = `minmax(0, 1.6fr) ${Array.from({ length: cols - 1 }, () => "minmax(0, 1fr)").join(" ")}`.trim();
  return (
    <div
      ref={ref}
      className={className}
      data-testid={testId}
      {...rest}
      style={{
        background: "var(--tk-surface)",
        borderRadius: "var(--tk-r-md)",
        boxShadow: "var(--tk-shadow-sm)",
        overflow: "hidden",
        ...style,
      }}
    >
      {header ? (
        <div style={{ display: "grid", gridTemplateColumns: template, gap: 12, padding: "12px 14px", background: "var(--tk-surface-2)" }}>
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="tk-skel" style={{ height: 11, width: c === 0 ? "60%" : "44%" }} />
          ))}
        </div>
      ) : null}
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          style={{
            display: "grid",
            gridTemplateColumns: template,
            gap: 12,
            alignItems: "center",
            padding: "13px 14px",
            borderTop: r || header ? "0.5px solid var(--tk-sep)" : "none",
          }}
        >
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="tk-skel" style={{ height: 12, width: `${[82, 56, 68, 48][(r + c) % 4]}%` }} />
          ))}
        </div>
      ))}
    </div>
  );
});

export interface TKSkeletonTextProps extends HTMLAttributes<HTMLDivElement> {
  /** Number of text lines (default 3); the last one renders shorter. */
  lines?: number;
  testId?: string;
}

export const TKSkeletonText = /* @__PURE__ */ forwardRef<HTMLDivElement, TKSkeletonTextProps>(function TKSkeletonText(
  { lines = 3, className, style, testId, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={className}
      data-testid={testId}
      {...rest}
      style={{ display: "flex", flexDirection: "column", gap: 8, ...style }}
    >
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="tk-skel" style={{ height: 12, width: i === lines - 1 ? "62%" : "100%" }} />
      ))}
    </div>
  );
});
