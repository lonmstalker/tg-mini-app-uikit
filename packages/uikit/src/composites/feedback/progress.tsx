import { type CSSProperties, type ReactNode } from "react";
import { useTKLocale } from "../../foundation/i18n";

/* ---------------- Linear progress ---------------- */

export interface TKProgressProps {
  /** 0-100 */
  value: number;
  /** Accessible name of the progress bar. */
  label?: string;
  /** Bar thickness (default md). */
  size?: "sm" | "md" | "lg";
  style?: CSSProperties;
  testId?: string;
}

const PROGRESS_H = { sm: 4, md: 7, lg: 12 } as const;

export function TKProgress({ value, label, size = "md", style, testId }: TKProgressProps) {
  const locale = useTKLocale();
  const h = PROGRESS_H[size] ?? PROGRESS_H.md;
  return (
    <div
      data-testid={testId}
      role="progressbar"
      aria-label={label ?? locale.progress}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{ height: h, borderRadius: h / 2, background: "var(--tk-surface-3)", overflow: "hidden", ...style }}
    >
      <div
        style={{
          height: "100%",
          width: `${Math.min(100, Math.max(0, value))}%`,
          borderRadius: h / 2,
          background: "var(--tk-accent-grad)",
          transition: "width var(--tk-t3) var(--tk-spring)",
        }}
      />
    </div>
  );
}

/* ---------------- Progress ring ---------------- */

export interface TKRingProps {
  /** 0-1 */
  value: number;
  size?: number;
  /** Accessible name of the progress ring. */
  label?: string;
  /** Center content; defaults to the percentage. */
  children?: ReactNode;
  testId?: string;
}

export function TKRing({ value, size = 92, label, children, testId }: TKRingProps) {
  const locale = useTKLocale();
  const r = (size - 12) / 2;
  const C = 2 * Math.PI * r;
  const clamped = Math.min(1, Math.max(0, value));
  const percent = Math.round(clamped * 100);
  return (
    <div
      data-testid={testId}
      role="progressbar"
      aria-label={label ?? locale.progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      style={{ position: "relative", width: size, height: size }}
    >
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
        {children ?? percent}
      </div>
    </div>
  );
}
