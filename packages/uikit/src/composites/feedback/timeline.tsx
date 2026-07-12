import { forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import { TKIcon } from "../../atoms/icons";

/* ---------------- Timeline ---------------- */

export type TKTimelineStatus = "done" | "active" | "pending";

export interface TKTimelineStep {
  label: ReactNode;
  time?: ReactNode;
  status: TKTimelineStatus;
}

export interface TKTimelineProps extends HTMLAttributes<HTMLDivElement> {
  steps: TKTimelineStep[];
  testId?: string;
}

export const TKTimeline = /* @__PURE__ */ forwardRef<HTMLDivElement, TKTimelineProps>(function TKTimeline(
  { steps, className, style, testId, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={className} data-testid={testId} {...rest} style={{ display: "flex", flexDirection: "column", ...style }}>
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
                color: "var(--tk-on-accent, #fff)",
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
});
