export interface TKSpinnerProps {
  color?: string;
  size?: number;
  /** Accessible busy label. Omitted → the spinner is decorative `aria-hidden` (BTN-009). */
  label?: string;
  testId?: string;
}

export function TKSpinner({ color = "var(--tk-accent)", size = 20, label, testId }: TKSpinnerProps) {
  return (
    <span
      data-testid={testId}
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: `2.5px solid color-mix(in srgb, ${color} 25%, transparent)`,
        borderTopColor: color,
        display: "inline-block",
        animation: "tk-spin calc(700ms / var(--tk-ms)) linear infinite",
      }}
    />
  );
}
