import type { CSSProperties, ReactNode } from "react";

export interface TKFormFieldProps {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  htmlFor?: string;
  describedBy?: string;
  required?: boolean;
  disabled?: boolean;
  children?: ReactNode;
  testId?: string;
  style?: CSSProperties;
}

export function TKFormField({ label, hint, error, htmlFor, describedBy, required, disabled, children, testId, style }: TKFormFieldProps) {
  return (
    <div data-testid={testId} style={{ display: "flex", flexDirection: "column", gap: 6, opacity: disabled ? 0.55 : 1, ...style }}>
      {label ? (
        <label
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
