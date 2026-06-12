import { useState, type CSSProperties, type ReactNode } from "react";
import { TKIcon, type TKIconName } from "./icons";
import { TKButton } from "./buttons";

/* ---------------- Skeletons ---------------- */

export interface TKSkeletonProps {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  style?: CSSProperties;
  testId?: string;
}

export function TKSkeleton({ width, height = 13, radius, style, testId }: TKSkeletonProps) {
  return <div className="tk-skel" data-testid={testId} style={{ width, height, borderRadius: radius, ...style }} />;
}

export interface TKSkeletonCardProps {
  testId?: string;
}

export function TKSkeletonCard({ testId }: TKSkeletonCardProps = {}) {
  return (
    <div
      data-testid={testId}
      style={{
        background: "var(--tk-surface)",
        borderRadius: "var(--tk-r-lg)",
        padding: 10,
        boxShadow: "var(--tk-shadow-sm)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div className="tk-skel" style={{ aspectRatio: "1.4 / 1", borderRadius: "var(--tk-r-md)" }} />
      <div className="tk-skel" style={{ height: 13, width: "72%" }} />
      <div className="tk-skel" style={{ height: 13, width: "45%" }} />
    </div>
  );
}

export function TKSkeletonList({ rows = 3, testId }: { rows?: number; testId?: string }) {
  return (
    <div
      data-testid={testId}
      style={{
        background: "var(--tk-surface)",
        borderRadius: "var(--tk-r-md)",
        boxShadow: "var(--tk-shadow-sm)",
        overflow: "hidden",
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
}

/* ---------------- Linear progress ---------------- */

export interface TKProgressProps {
  /** 0–100 */
  value: number;
  /** Accessible name of the progress bar. */
  label?: string;
  style?: CSSProperties;
  testId?: string;
}

export function TKProgress({ value, label = "Progress", style, testId }: TKProgressProps) {
  return (
    <div
      data-testid={testId}
      role="progressbar"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{ height: 7, borderRadius: 4, background: "var(--tk-surface-3)", overflow: "hidden", ...style }}
    >
      <div
        style={{
          height: "100%",
          width: `${Math.min(100, Math.max(0, value))}%`,
          borderRadius: 4,
          background: "var(--tk-accent-grad)",
          transition: "width var(--tk-t3) var(--tk-spring)",
        }}
      />
    </div>
  );
}

/* ---------------- Progress ring ---------------- */

export interface TKRingProps {
  /** 0–1 */
  value: number;
  size?: number;
  /** Center content; defaults to the percentage. */
  children?: ReactNode;
  testId?: string;
}

export function TKRing({ value, size = 92, children, testId }: TKRingProps) {
  const r = (size - 12) / 2;
  const C = 2 * Math.PI * r;
  const clamped = Math.min(1, Math.max(0, value));
  return (
    <div data-testid={testId} style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--tk-surface-3)" strokeWidth="9" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--tk-accent)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - clamped)}
          style={{ transition: "stroke-dashoffset var(--tk-t3) var(--tk-spring)" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: "var(--tk-fz-title3)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {children ?? Math.round(clamped * 100)}
      </div>
    </div>
  );
}

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
      {data.map((b, i) => (
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
          <div
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(-1)}
            onClick={onBarClick ? () => onBarClick(i) : undefined}
            style={{
              width: "100%",
              borderRadius: "var(--tk-r-xs)",
              height: `${(b / max) * 100}%`,
              background: hover === i ? "var(--tk-accent)" : "var(--tk-accent-20)",
              transition: "height var(--tk-t3) var(--tk-spring), background var(--tk-t1) var(--tk-ease)",
              cursor: "pointer",
            }}
          />
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
      ))}
    </div>
  );
}

/* ---------------- Empty / error states ---------------- */

export interface TKEmptyStateProps {
  icon?: TKIconName;
  title?: ReactNode;
  text?: ReactNode;
  cta?: ReactNode;
  onCta?: () => void;
  tone?: "accent" | "red";
  testId?: string;
}

export function TKEmptyState({ icon = "cart", title, text, cta, onCta, tone = "accent", testId }: TKEmptyStateProps) {
  const color = tone === "red" ? "var(--tk-red)" : "var(--tk-accent)";
  const bg = tone === "red" ? "var(--tk-red-12)" : "var(--tk-accent-12)";
  return (
    <div
      data-testid={testId}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 6,
        padding: "10px 12px",
      }}
    >
      <div
        style={{
          width: 68,
          height: 68,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: bg,
          color,
          marginBottom: 6,
        }}
      >
        <TKIcon name={icon} size={30} />
      </div>
      <div style={{ fontSize: "var(--tk-fz-title3)", fontWeight: 700 }}>{title}</div>
      {text ? (
        <div style={{ fontSize: "var(--tk-fz-sub)", color: "var(--tk-text-2)", maxWidth: 240 }}>{text}</div>
      ) : null}
      {cta ? (
        <div style={{ marginTop: 10 }}>
          <TKButton variant={tone === "red" ? "destructive" : "tonal"} pill size="sm" onClick={onCta}>
            {cta}
          </TKButton>
        </div>
      ) : null}
    </div>
  );
}

/* ---------------- Timeline ---------------- */

export type TKTimelineStatus = "done" | "active" | "pending";

export interface TKTimelineStep {
  label: ReactNode;
  time?: ReactNode;
  status: TKTimelineStatus;
}

export interface TKTimelineProps {
  steps: TKTimelineStep[];
  testId?: string;
}

export function TKTimeline({ steps, testId }: TKTimelineProps) {
  return (
    <div data-testid={testId} style={{ display: "flex", flexDirection: "column" }}>
      {steps.map((step, i) => (
        <div key={i} style={{ display: "flex", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 22 }}>
            <span
              className={step.status === "active" ? "tk-pulse" : undefined}
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  step.status === "done"
                    ? "var(--tk-green)"
                    : step.status === "active"
                      ? "var(--tk-accent)"
                      : "var(--tk-surface-3)",
                color: "#fff",
                ...(step.status === "active" ? ({ "--tk-pulse-scale": 1.4 } as CSSProperties) : null),
              }}
            >
              {step.status === "done" ? <TKIcon name="check" size={12} strokeWidth={3.2} /> : null}
            </span>
            {i < steps.length - 1 ? (
              <span
                style={{
                  width: 2.5,
                  flex: 1,
                  minHeight: 26,
                  borderRadius: 2,
                  background: step.status === "done" ? "var(--tk-green)" : "var(--tk-surface-3)",
                  margin: "3px 0",
                }}
              />
            ) : null}
          </div>
          <div style={{ paddingBottom: i < steps.length - 1 ? 18 : 0, marginTop: 1 }}>
            <div
              style={{
                fontSize: "var(--tk-fz-sub)",
                fontWeight: step.status === "active" ? 700 : 500,
                color: step.status === "pending" ? "var(--tk-text-2)" : "var(--tk-text)",
              }}
            >
              {step.label}
            </div>
            {step.time != null ? (
              <div style={{ fontSize: "var(--tk-fz-caption)", color: "var(--tk-text-3)" }}>{step.time}</div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
