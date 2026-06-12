import type { CSSProperties, MouseEventHandler, ReactNode } from "react";

export interface TKVisuallyHiddenProps {
  children?: ReactNode;
  as?: "span" | "div";
}

export function TKVisuallyHidden({ children, as: Tag = "span" }: TKVisuallyHiddenProps) {
  return (
    <Tag
      style={{
        position: "absolute",
        width: 1,
        height: 1,
        padding: 0,
        margin: -1,
        overflow: "hidden",
        clip: "rect(0, 0, 0, 0)",
        whiteSpace: "nowrap",
        border: 0,
      }}
    >
      {children}
    </Tag>
  );
}

export interface TKTappableProps {
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  pressed?: boolean;
  label?: string;
  className?: string;
  style?: CSSProperties;
}

export function TKTappable({ children, onClick, disabled, pressed, label, className, style }: TKTappableProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      className={["tk-press", className].filter(Boolean).join(" ")}
      style={{
        appearance: "none",
        WebkitAppearance: "none",
        border: "none",
        background: "transparent",
        color: "inherit",
        font: "inherit",
        padding: 0,
        margin: 0,
        cursor: disabled ? "default" : "pointer",
        textAlign: "inherit",
        opacity: disabled ? 0.55 : 1,
        touchAction: "manipulation",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
