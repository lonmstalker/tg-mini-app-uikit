import { forwardRef, useState, type CSSProperties, type HTMLAttributes } from "react";

/* ---------------- Bar chart ---------------- */

export interface TKBarsProps extends HTMLAttributes<HTMLDivElement> {
  data: number[];
  labels?: string[];
  height?: number;
  onBarClick?: (index: number) => void;
  /**
   * Marks one bar as selected with real `aria-pressed` toggle semantics. Omit for
   * a plain action bar (no `aria-pressed` at all — `onBarClick` is one-shot select,
   * not a toggle) (FBK-004).
   */
  selectedIndex?: number;
  testId?: string;
}

export const TKBars = /* @__PURE__ */ forwardRef<HTMLDivElement, TKBarsProps>(function TKBars(
  { data, labels, height = 110, onBarClick, selectedIndex, className, style, testId, ...rest },
  ref,
) {
  const [hover, setHover] = useState(-1);
  // reduce (not spread) so a huge series can't RangeError, and non-finite values
  // are ignored instead of poisoning every bar to NaN% (FBK-006). Floor the
  // divisor at 1 only when the peak is non-positive, preserving fractional series.
  const peak = data.reduce((m, v) => (Number.isFinite(v) && v > m ? v : m), Number.NEGATIVE_INFINITY);
  const max = peak > 0 ? peak : 1;
  const interactive = typeof onBarClick === "function";
  // Non-interactive bars used to be aria-hidden, hiding the data from AT. Expose
  // the whole chart as one labelled image summarizing the series (FBK-003). When
  // interactive, the per-bar buttons carry the a11y instead. Non-finite values are
  // normalized to 0 so the announced summary matches the (clamped) visual (FBK-006).
  const summary = data.map((b, i) => `${labels?.[i] ?? `Bar ${i + 1}`}: ${Number.isFinite(b) ? b : 0}`).join(", ");
  // No img role for an empty chart — that would announce a nameless image.
  const labelled = !interactive && data.length > 0;
  return (
    <div
      ref={ref}
      className={className}
      data-testid={testId}
      {...rest}
      role={labelled ? "img" : undefined}
      aria-label={labelled ? summary : undefined}
      style={{ display: "flex", alignItems: "flex-end", gap: 8, height, ...style }}
    >
      {data.map((b, i) => {
        const label = labels?.[i] ?? `Bar ${i + 1}`;
        const barStyle: CSSProperties = {
          width: "100%",
          borderRadius: "var(--tk-r-xs)",
          height: `${(b / max) * 100}%`,
          background: hover === i ? "var(--tk-accent)" : "var(--tk-accent-20)",
          transition: "height var(--tk-t3) var(--tk-spring), background var(--tk-t1) var(--tk-ease)",
          cursor: interactive ? "pointer" : "default",
        };
        return (
          <div
            key={i}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              height: "100%",
              justifyContent: "flex-end",
            }}
          >
            {interactive ? (
              <button
                type="button"
                aria-label={label}
                aria-pressed={selectedIndex == null ? undefined : i === selectedIndex}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(-1)}
                onClick={() => onBarClick(i)}
                style={{
                  ...barStyle,
                  appearance: "none",
                  border: "none",
                  padding: 0,
                  font: "inherit",
                }}
              />
            ) : (
              <div
                aria-hidden="true"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(-1)}
                style={barStyle}
              />
            )}
            {labels?.[i] != null ? (
              <span
                style={{
                  fontSize: "var(--tk-fz-caption2)",
                  color: hover === i ? "var(--tk-accent)" : "var(--tk-text-3)",
                  fontWeight: 600,
                }}
              >
                {labels[i]}
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
});
