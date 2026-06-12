import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
import { TKIcon, type TKIconName } from "./icons";

export type TKButtonVariant = "filled" | "tonal" | "plain" | "outline" | "destructive" | "surface";
export type TKButtonSize = "sm" | "md" | "lg";

const BTN_SIZES: Record<TKButtonSize, { h: number; px: number; fz: string }> = {
  sm: { h: 34, px: 14, fz: "var(--tk-fz-sub)" },
  md: { h: 44, px: 20, fz: "var(--tk-fz-body)" },
  lg: { h: 52, px: 24, fz: "var(--tk-fz-body)" },
};

export function tkButtonVariantStyle(variant: TKButtonVariant): CSSProperties {
  switch (variant) {
    case "filled":
      return { background: "var(--tk-accent-grad)", color: "var(--tk-on-accent)", boxShadow: "0 6px 16px -6px var(--tk-accent-35)" };
    case "tonal":
      return { background: "var(--tk-accent-12)", color: "var(--tk-accent)" };
    case "plain":
      return { background: "transparent", color: "var(--tk-accent)" };
    case "outline":
      return { background: "transparent", color: "var(--tk-accent)", boxShadow: "inset 0 0 0 1.5px var(--tk-accent-35)" };
    case "destructive":
      return { background: "var(--tk-red-12)", color: "var(--tk-red)" };
    case "surface":
      return { background: "var(--tk-surface)", color: "var(--tk-text)", boxShadow: "var(--tk-shadow-sm)" };
  }
}

export interface TKButtonProps {
  children?: ReactNode;
  variant?: TKButtonVariant;
  size?: TKButtonSize;
  pill?: boolean;
  full?: boolean;
  icon?: TKIconName;
  disabled?: boolean;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  style?: CSSProperties;
  className?: string;
  type?: "button" | "submit" | "reset";
}

export function TKButton({
  children,
  variant = "filled",
  size = "md",
  pill,
  full,
  icon,
  disabled,
  onClick,
  style,
  className,
  type = "button",
}: TKButtonProps) {
  const s = BTN_SIZES[size] ?? BTN_SIZES.md;
  return (
    <button
      type={type}
      className={["tk-press", className ?? ""].filter(Boolean).join(" ")}
      disabled={disabled}
      onClick={onClick}
      style={{
        display: full ? "flex" : "inline-flex",
        width: full ? "100%" : undefined,
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        height: s.h,
        padding: `0 ${s.px}px`,
        border: "none",
        borderRadius: pill ? "var(--tk-r-pill)" : "var(--tk-r-md)",
        fontSize: s.fz,
        fontWeight: 600,
        fontFamily: "inherit",
        letterSpacing: ".01em",
        opacity: disabled ? 0.45 : 1,
        pointerEvents: disabled ? "none" : undefined,
        ...tkButtonVariantStyle(variant),
        ...style,
      }}
    >
      {icon ? <TKIcon name={icon} size={Math.round(s.h * 0.42)} /> : null}
      {children}
    </button>
  );
}

export interface TKIconButtonProps {
  icon: TKIconName;
  variant?: TKButtonVariant;
  size?: number;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  style?: CSSProperties;
  active?: boolean;
  disabled?: boolean;
  /** Accessible label — icon buttons have no visible text. */
  label?: string;
}

export function TKIconButton({ icon, variant = "tonal", size = 40, onClick, style, active, disabled, label }: TKIconButtonProps) {
  return (
    <button
      type="button"
      className="tk-press"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        border: "none",
        borderRadius: "var(--tk-r-pill)",
        opacity: disabled ? 0.45 : 1,
        pointerEvents: disabled ? "none" : undefined,
        ...tkButtonVariantStyle(variant),
        ...(active ? { background: "var(--tk-accent)", color: "var(--tk-on-accent)" } : {}),
        ...style,
      }}
    >
      <TKIcon name={icon} size={Math.round(size * 0.52)} />
    </button>
  );
}

export interface TKSpinnerProps {
  color?: string;
  size?: number;
}

export function TKSpinner({ color = "var(--tk-accent)", size = 20 }: TKSpinnerProps) {
  return (
    <span
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

export type TKMainButtonStatus = "idle" | "loading" | "success";

export interface TKMainButtonProps {
  label: ReactNode;
  successLabel?: ReactNode;
  /** Controlled status. Omit it and return a promise from `onClick` to get the idle → loading → success cycle for free. */
  status?: TKMainButtonStatus;
  onClick?: () => void | Promise<unknown>;
  /** How long the success state is shown in auto mode, ms. */
  successDuration?: number;
  disabled?: boolean;
  style?: CSSProperties;
}

/** Telegram-style bottom action button with a built-in state machine. */
export function TKMainButton({
  label,
  successLabel = "Done",
  status,
  onClick,
  successDuration = 1600,
  disabled,
  style,
}: TKMainButtonProps) {
  const [auto, setAuto] = useState<TKMainButtonStatus>("idle");
  const timer = useRef<number | undefined>(undefined);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      window.clearTimeout(timer.current);
    };
  }, []);

  const state = status ?? auto;
  const isSuccess = state === "success";

  const run = () => {
    if (disabled || state !== "idle") return;
    const result = onClick?.();
    if (status !== undefined) return; // controlled — the consumer drives the status
    if (result && typeof (result as Promise<unknown>).then === "function") {
      setAuto("loading");
      (result as Promise<unknown>).then(
        () => {
          if (!mounted.current) return;
          setAuto("success");
          timer.current = window.setTimeout(() => mounted.current && setAuto("idle"), successDuration);
        },
        () => mounted.current && setAuto("idle"),
      );
    }
  };

  return (
    <button
      type="button"
      className="tk-press-soft tk-press"
      onClick={run}
      disabled={disabled}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        width: "100%",
        height: 52,
        border: "none",
        borderRadius: "var(--tk-r-md)",
        fontSize: "var(--tk-fz-body)",
        fontWeight: 600,
        fontFamily: "inherit",
        color: "var(--tk-on-accent)",
        opacity: disabled ? 0.45 : 1,
        pointerEvents: disabled ? "none" : undefined,
        background: isSuccess
          ? "linear-gradient(180deg, color-mix(in srgb, var(--tk-green) 88%, #fff), var(--tk-green))"
          : "var(--tk-accent-grad)",
        boxShadow: isSuccess ? "0 6px 16px -6px var(--tk-green)" : "0 6px 16px -6px var(--tk-accent-35)",
        transition: "background var(--tk-t2) var(--tk-ease), box-shadow var(--tk-t2) var(--tk-ease)",
        ...style,
      }}
    >
      {state === "loading" ? (
        <TKSpinner color="var(--tk-on-accent)" />
      ) : isSuccess ? (
        <span key="ok" className="tk-pop" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <TKIcon name="check" size={20} strokeWidth={2.6} /> {successLabel}
        </span>
      ) : (
        label
      )}
    </button>
  );
}
