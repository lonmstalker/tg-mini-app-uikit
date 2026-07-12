import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

export type TKTone = "accent" | "green" | "red" | "orange" | "gray";

const BADGE_TONES: Record<TKTone, [solid: string, soft: string, ink: string]> = {
  accent: ["var(--tk-accent)", "var(--tk-accent-12)", "var(--tk-accent-ink)"],
  green: ["var(--tk-green)", "var(--tk-green-12)", "var(--tk-green-ink)"],
  red: ["var(--tk-red)", "var(--tk-red-12)", "var(--tk-red-ink)"],
  orange: ["var(--tk-orange)", "var(--tk-orange-12)", "var(--tk-orange-ink)"],
  gray: ["var(--tk-text-2)", "var(--tk-surface-3)", "var(--tk-text-2)"],
};

export interface TKBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: TKTone;
  soft?: boolean;
  /** Rendered as `data-testid`. */
  testId?: string;
}

// forwardRef + className + native-prop passthrough so a consumer can attach a
// tooltip ref, utility class, data-attr or title without a wrapper span (DSP-008/CC-13).
export const TKBadge = /* @__PURE__ */ forwardRef<HTMLSpanElement, TKBadgeProps>(function TKBadge(
  { children, tone = "accent", soft, style, className, testId, ...rest },
  ref,
) {
  const [solid, softBg, ink] = BADGE_TONES[tone] ?? BADGE_TONES.accent;
  return (
    <span
      ref={ref}
      className={className}
      data-testid={testId}
      {...rest}
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
        // Never overflow the container; a long label ellipsizes (DSP-010). Consumer
        // `style.maxWidth` overrides via the spread above.
        maxWidth: "100%",
        minWidth: 0,
        overflow: "hidden",
        ...style,
      }}
    >
      {/* display:block so text-overflow:ellipsis actually renders the "…" (it's a
          no-op on the default inline box) — DSP-010-A. */}
      <span
        style={{
          display: "block",
          minWidth: 0,
          maxWidth: "100%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </span>
    </span>
  );
});

export interface TKDotProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: TKTone;
  pulse?: boolean;
  testId?: string;
}

export const TKDot = /* @__PURE__ */ forwardRef<HTMLSpanElement, TKDotProps>(function TKDot(
  { tone = "green", pulse, className, style, testId, ...rest },
  ref,
) {
  const map: Record<TKTone, string> = {
    green: "var(--tk-green)",
    red: "var(--tk-red)",
    orange: "var(--tk-orange)",
    accent: "var(--tk-accent)",
    gray: "var(--tk-text-3)",
  };
  return (
    <span
      ref={ref}
      data-testid={testId}
      className={[pulse ? "tk-pulse" : "", className ?? ""].filter(Boolean).join(" ") || undefined}
      {...rest}
      style={{
        width: 9,
        height: 9,
        borderRadius: "50%",
        background: map[tone],
        display: "inline-block",
        ...style,
      }}
    />
  );
});

export interface TKCounterProps extends HTMLAttributes<HTMLSpanElement> {
  value: ReactNode;
  tone?: "red" | "accent" | "gray";
  /** Numeric values above this render as `max+` (e.g. `99+`). */
  max?: number;
  testId?: string;
}

export const TKCounter = /* @__PURE__ */ forwardRef<HTMLSpanElement, TKCounterProps>(function TKCounter(
  { value, tone = "red", max, className, style, testId, ...rest },
  ref,
) {
  const map = { red: "var(--tk-red)", accent: "var(--tk-accent)", gray: "var(--tk-text-3)" };
  // Coerce numeric strings, clamp negatives to 0, and apply `max+` consistently
  // (DSP-006) — a non-numeric ReactNode falls through unchanged.
  const numeric = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
  const shown = Number.isFinite(numeric)
    ? max != null && numeric > max
      ? `${max}+`
      : Math.max(0, numeric)
    : value;
  return (
    <span
      key={String(shown)}
      ref={ref}
      data-testid={testId}
      className={["tk-pop", className ?? ""].filter(Boolean).join(" ")}
      {...rest}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 21,
        height: 21,
        padding: "0 6px",
        borderRadius: "var(--tk-r-pill)",
        background: map[tone],
        color: "var(--tk-on-accent, #fff)",
        fontSize: "var(--tk-fz-caption2)",
        fontWeight: 700,
        ...style,
      }}
    >
      {shown}
    </span>
  );
});
