export interface TKSpinnerProps {
  color?: string;
  size?: number;
  testId?: string;
}

export function TKSpinner({ color = "var(--tk-accent)", size = 20, testId }: TKSpinnerProps) {
  return (
    <span
      data-testid={testId}
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
