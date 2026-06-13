import type { CSSProperties, ReactNode } from "react";

export type TKTone = "accent" | "green" | "red" | "orange" | "gray";

const BADGE_TONES: Record<TKTone, [solid: string, soft: string, ink: string]> = {
  accent: ["var(--tk-accent)", "var(--tk-accent-12)", "var(--tk-accent-ink)"],
  green: ["var(--tk-green)", "var(--tk-green-12)", "var(--tk-green-ink)"],
  red: ["var(--tk-red)", "var(--tk-red-12)", "var(--tk-red-ink)"],
  orange: ["var(--tk-orange)", "var(--tk-orange-12)", "var(--tk-orange-ink)"],
  gray: ["var(--tk-text-2)", "var(--tk-surface-3)", "var(--tk-text-2)"],
};

export interface TKBadgeProps {
  children?: ReactNode;
  tone?: TKTone;
  soft?: boolean;
  style?: CSSProperties;
  /** Rendered as `data-testid`. */
  testId?: string;
}

export function TKBadge({ children, tone = "accent", soft, style, testId }: TKBadgeProps) {
  const [solid, softBg, ink] = BADGE_TONES[tone] ?? BADGE_TONES.accent;
  return (
    <span
      data-testid={testId}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 9px",
        borderRadius: "var(--tk-r-pill)",
        fontSize: "var(--tk-fz-caption)",
        fontWeight: 600,
        letterSpacing: ".01em",
        background: soft ? softBg : solid,
        color: soft ? ink : "var(--tk-on-accent)",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export interface TKDotProps {
  tone?: TKTone;
  pulse?: boolean;
  testId?: string;
}

export function TKDot({ tone = "green", pulse, testId }: TKDotProps) {
  const map: Record<TKTone, string> = {
    green: "var(--tk-green)",
    red: "var(--tk-red)",
    orange: "var(--tk-orange)",
    accent: "var(--tk-accent)",
    gray: "var(--tk-text-3)",
  };
  return (
    <span
      data-testid={testId}
      className={pulse ? "tk-pulse" : undefined}
      style={{
        width: 9,
        height: 9,
        borderRadius: "50%",
        background: map[tone],
        display: "inline-block",
      }}
    />
  );
}

export interface TKCounterProps {
  value: ReactNode;
  tone?: "red" | "accent" | "gray";
  /** Numeric values above this render as `max+` (e.g. `99+`). */
  max?: number;
  testId?: string;
}

export function TKCounter({ value, tone = "red", max, testId }: TKCounterProps) {
  const map = { red: "var(--tk-red)", accent: "var(--tk-accent)", gray: "var(--tk-text-3)" };
  const shown = typeof value === "number" && max != null && value > max ? `${max}+` : value;
  return (
    <span
      key={String(shown)}
      data-testid={testId}
      className="tk-pop"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 21,
        height: 21,
        padding: "0 6px",
        borderRadius: "var(--tk-r-pill)",
        background: map[tone],
        color: "#fff",
        fontSize: "var(--tk-fz-caption2)",
        fontWeight: 700,
      }}
    >
      {shown}
    </span>
  );
}
