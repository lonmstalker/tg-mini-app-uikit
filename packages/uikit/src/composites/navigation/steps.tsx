import { useRef, type CSSProperties, type KeyboardEvent } from "react";
import { TKIcon } from "../../atoms/icons";
import { tkRovingNext, tkTabbableIndex } from "../../internal/roving";

export interface TKStepsProps {
  steps: string[];
  current: number;
  /** Makes step circles clickable (e.g. to navigate back). */
  onStepClick?: (index: number) => void;
  testId?: string;
}

const CIRCLE = 28;

export function TKSteps({ steps, current, onStepClick, testId }: TKStepsProps) {
  // Roving tabindex over the clickable step circles: one tab stop (the current
  // step), arrows move focus; Enter/Space activates via the native button.
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabbable = tkTabbableIndex(current, steps.length);
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const next = tkRovingNext(e.key, index, steps.length, undefined, "horizontal");
    if (next == null) return;
    e.preventDefault();
    btnRefs.current[next]?.focus();
  };
  return (
    <div data-testid={testId} style={{ display: "flex", alignItems: "flex-start" }}>
      {steps.map((step, index) => {
        const done = index < current;
        const active = index === current;
        const innerStyle: CSSProperties = {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          width: "100%",
          border: "none",
          background: "transparent",
          padding: 0,
          cursor: onStepClick ? "pointer" : "default",
          fontFamily: "inherit",
        };
        const circle = (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: CIRCLE,
              height: CIRCLE,
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
        );
        const label = (
          <span
            aria-current={active ? "step" : undefined}
            style={{
              fontSize: "var(--tk-fz-caption)",
              fontWeight: active ? 600 : 500,
              color: active ? "var(--tk-text)" : "var(--tk-text-2)",
              textAlign: "center",
            }}
          >
            {step}
          </span>
        );
        return (
          // Equal-width column with the circle centered, so the connector can be
          // pinned to the row of circle CENTERS instead of the label-column
          // edges — wide labels no longer leave the rail hanging in the air.
          <div key={`${index}-${step}`} style={{ flex: 1, minWidth: 0, position: "relative" }}>
            {index > 0 ? (
              // Fill the gap between the previous circle's right edge and this
              // circle's left edge (centers are one column-width apart, each
              // circle inset CIRCLE/2 from its column center).
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: 13,
                  left: `calc(-50% + ${CIRCLE / 2}px)`,
                  right: `calc(50% + ${CIRCLE / 2}px)`,
                  height: 3,
                  borderRadius: 2,
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
              <button
                type="button"
                ref={(el) => {
                  btnRefs.current[index] = el;
                }}
                tabIndex={index === tabbable ? 0 : -1}
                onKeyDown={(e) => onKeyDown(e, index)}
                onClick={() => onStepClick(index)}
                style={innerStyle}
              >
                {circle}
                {label}
              </button>
            ) : (
              <span style={innerStyle}>
                {circle}
                {label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
