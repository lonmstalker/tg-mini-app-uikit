import type { CSSProperties } from "react";
import { TKIcon } from "../../atoms/icons";

export interface TKStepsProps {
  steps: string[];
  current: number;
  /** Makes step circles clickable (e.g. to navigate back). */
  onStepClick?: (index: number) => void;
  testId?: string;
}

export function TKSteps({ steps, current, onStepClick, testId }: TKStepsProps) {
  return (
    <div data-testid={testId} style={{ display: "flex", alignItems: "flex-start" }}>
      {steps.map((step, index) => {
        const done = index < current;
        const active = index === current;
        const stepStyle: CSSProperties = {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          border: "none",
          background: "transparent",
          padding: 0,
          cursor: onStepClick ? "pointer" : "default",
          fontFamily: "inherit",
        };
        const stepContent = (
          <>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 28,
                height: 28,
                borderRadius: "50%",
                fontSize: "var(--tk-fz-caption)",
                fontWeight: 700,
                background: done || active ? "var(--tk-accent)" : "var(--tk-surface-3)",
                color: done || active ? "var(--tk-on-accent)" : "var(--tk-text-2)",
                boxShadow: active ? "var(--tk-ring)" : "none",
                transition: "background var(--tk-t2) var(--tk-ease), box-shadow var(--tk-t2) var(--tk-ease)",
              }}
            >
              {done ? <TKIcon name="check" size={14} strokeWidth={3} /> : index + 1}
            </span>
            <span
              aria-current={active ? "step" : undefined}
              style={{
                fontSize: "var(--tk-fz-caption)",
                fontWeight: active ? 600 : 500,
                color: active ? "var(--tk-text)" : "var(--tk-text-2)",
                whiteSpace: "nowrap",
              }}
            >
              {step}
            </span>
          </>
        );

        return (
          <span key={step} style={{ display: "contents" }}>
            {index > 0 ? (
              <div
                style={{
                  flex: 1,
                  height: 3,
                  borderRadius: 2,
                  margin: "13px 6px 0",
                  background: "var(--tk-surface-3)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    borderRadius: 2,
                    background: "var(--tk-accent)",
                    width: index <= current ? "100%" : "0%",
                    transition: "width var(--tk-t3) var(--tk-ease)",
                  }}
                />
              </div>
            ) : null}
            {onStepClick ? (
              <button type="button" onClick={() => onStepClick(index)} style={stepStyle}>
                {stepContent}
              </button>
            ) : (
              <span style={stepStyle}>{stepContent}</span>
            )}
          </span>
        );
      })}
    </div>
  );
}
