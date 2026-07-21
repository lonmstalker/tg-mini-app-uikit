import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { useTKLocale } from "../../foundation/i18n";

/* ---------------- Linear progress ---------------- */

export interface TKProgressProps extends HTMLAttributes<HTMLDivElement> {
  /** 0-100 */
  value: number;
  /** Accessible name of the progress bar. */
  label?: string;
  /** Bar thickness (default md). */
  size?: "sm" | "md" | "lg";
  /**
   * Fill color (any CSS color/gradient). Defaults to the accent gradient —
   * without this prop the fill lived on an inner node reachable only by
   * overriding the private `--tk-accent-grad` variable (REU-003).
   */
  color?: string;
  testId?: string;
}

const PROGRESS_H = { sm: 4, md: 7, lg: 12 } as const;

export const TKProgress = /* @__PURE__ */ forwardRef<HTMLDivElement, TKProgressProps>(function TKProgress(
  { value, label, size = "md", color, className, style, testId, ...rest },
  ref,
) {
  const locale = useTKLocale();
  const h = PROGRESS_H[size] ?? PROGRESS_H.md;
  // Clamp once and report the SAME value to AT as the visual fill — an out-of-range
  // or NaN `value` no longer leaks an unclamped aria-valuenow (FBK-002).
  const v = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;
  return (
    <div
      ref={ref}
      className={className}
      data-testid={testId}
      {...rest}
      role="progressbar"
      aria-label={label ?? locale.progress}
      aria-valuenow={v}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{ height: h, borderRadius: h / 2, background: "var(--tk-surface-3)", overflow: "hidden", ...style }}
    >
      <div
        // Full-width bar sliding in from the start inside the overflow-hidden
        // track: transform-only progress, radius intact (no width animation).
        style={{
          height: "100%",
          width: "100%",
          borderRadius: h / 2,
          background: color ?? "var(--tk-accent-grad)",
          transform: `translateX(${v - 100}%)`,
          transition: "transform var(--tk-t3) var(--tk-spring)",
        }}
      />
    </div>
  );
});

/* ---------------- Progress ring ---------------- */

export interface TKRingProps extends HTMLAttributes<HTMLDivElement> {
  /** 0-1 */
  value: number;
  size?: number;
  /** Accessible name of the progress ring. */
  label?: string;
  /** Stroke color of the value arc (any CSS color). Defaults to the accent (REU-003). */
  color?: string;
  /** Center content; defaults to the percentage. */
  children?: ReactNode;
  testId?: string;
}

export const TKRing = /* @__PURE__ */ forwardRef<HTMLDivElement, TKRingProps>(function TKRing(
  { value, size = 92, label, color, children, className, style, testId, ...rest },
  ref,
) {
  const locale = useTKLocale();
  const r = (size - 12) / 2;
  const C = 2 * Math.PI * r;
  const clamped = Math.min(1, Math.max(0, value));
  const percent = Math.round(clamped * 100);
  return (
    <div
      ref={ref}
      className={className}
      data-testid={testId}
      {...rest}
      role="progressbar"
      aria-label={label ?? locale.progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      style={{ position: "relative", width: size, height: size, ...style }}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--tk-surface-3)" strokeWidth="9" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color ?? "var(--tk-accent)"}
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
});
