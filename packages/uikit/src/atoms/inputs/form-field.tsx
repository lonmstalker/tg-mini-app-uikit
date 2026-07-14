import { useState, type CSSProperties, type ReactNode } from "react";

export interface TKFormFieldProps {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  htmlFor?: string;
  /** id on the rendered label, so a group control can wire `aria-labelledby` (CTL-DX-003). */
  labelId?: string;
  describedBy?: string;
  required?: boolean;
  disabled?: boolean;
  children?: ReactNode;
  testId?: string;
  style?: CSSProperties;
}

export function TKFormField({ label, hint, error, htmlFor, labelId, describedBy, required, disabled, children, testId, style }: TKFormFieldProps) {
  // Native-feeling validation feedback: a NEW error rises in (tk-rise — an
  // animation, because a transition on a freshly-mounted node never runs); an
  // error REPLACING one already showing shakes instead. Errors compare by a
  // primitive key — JSX errors get a fresh element identity every parent
  // render and would shake-spam if compared by reference. Adjust-state-during-
  // render so a discarded concurrent render can't double-count.
  const errKey = error == null || error === false ? "" : typeof error === "string" || typeof error === "number" ? `v:${error}` : "node";
  const [prevKey, setPrevKey] = useState(errKey);
  const [anim, setAnim] = useState<{ kind: "rise" | "shake"; n: number }>({ kind: "rise", n: 0 });
  if (prevKey !== errKey) {
    setPrevKey(errKey);
    if (errKey) setAnim((a) => ({ kind: prevKey ? "shake" : "rise", n: a.n + 1 }));
  }
  return (
    <div data-testid={testId} style={{ display: "flex", flexDirection: "column", gap: 6, opacity: disabled ? 0.55 : 1, ...style }}>
      {label ? (
        <label
          id={labelId}
          htmlFor={htmlFor}
          style={{
            fontSize: "var(--tk-fz-caption)",
            fontWeight: 600,
            letterSpacing: ".04em",
            textTransform: "uppercase",
            color: error ? "var(--tk-red)" : "var(--tk-text-2)",
            margin: "0 14px",
          }}
        >
          {label}
          {required ? <span style={{ color: "var(--tk-red)", marginLeft: 3 }}>*</span> : null}
        </label>
      ) : null}
      {children}
      {hint || error ? (
        <div
          id={describedBy}
          // Remount on every error change so the entrance animation replays.
          key={error ? `${anim.kind}-${anim.n}` : "hint"}
          className={error ? (anim.kind === "shake" ? "tk-shake" : "tk-rise") : undefined}
          // Announce a validation error to AT (INP-008 / CC-05); a plain hint stays silent.
          role={error ? "alert" : undefined}
          style={{
            fontSize: "var(--tk-fz-caption)",
            color: error ? "var(--tk-red)" : "var(--tk-text-2)",
            margin: "0 14px",
          }}
        >
          {error || hint}
        </div>
      ) : null}
    </div>
  );
}
