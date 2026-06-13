import { useState, type CSSProperties } from "react";

/* ---------------- Bar chart ---------------- */

export interface TKBarsProps {
  data: number[];
  labels?: string[];
  height?: number;
  onBarClick?: (index: number) => void;
  testId?: string;
}

export function TKBars({ data, labels, height = 110, onBarClick, testId }: TKBarsProps) {
  const [hover, setHover] = useState(-1);
  const max = Math.max(...data, 1);
  return (
    <div data-testid={testId} style={{ display: "flex", alignItems: "flex-end", gap: 8, height }}>
      {data.map((b, i) => {
        const interactive = typeof onBarClick === "function";
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
                aria-pressed={false}
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
}
