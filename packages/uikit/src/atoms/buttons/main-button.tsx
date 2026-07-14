import { forwardRef, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { TKIcon } from "../icons";
import { useTKLocale } from "../../foundation/i18n";
import { useOptionalHaptics } from "../../foundation/telegram";
import { TKSpinner } from "./spinner";

export type TKMainButtonStatus = "idle" | "loading" | "success";

export interface TKMainButtonProps {
  label: ReactNode;
  successLabel?: ReactNode;
  /** Controlled status. Omit it and return a promise from `onClick` to get the idle -> loading -> success cycle for free. */
  status?: TKMainButtonStatus;
  onClick?: () => void | Promise<unknown>;
  /** How long the success state is shown in auto mode, ms. */
  successDuration?: number;
  disabled?: boolean;
  testId?: string;
  style?: CSSProperties;
}

/** Telegram-style bottom action button with a built-in state machine. */
export const TKMainButton = /* @__PURE__ */ forwardRef<HTMLButtonElement, TKMainButtonProps>(function TKMainButton(
  { label, successLabel, status, onClick, successDuration = 1600, disabled, testId, style },
  ref,
) {
  const locale = useTKLocale();
  const haptics = useOptionalHaptics();
  const successText = successLabel ?? locale.done;
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
    if (status !== undefined) return;
    if (result && typeof (result as Promise<unknown>).then === "function") {
      setAuto("loading");
      (result as Promise<unknown>).then(
        () => {
          if (!mounted.current) return;
          haptics.notification("success");
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
      ref={ref}
      className="tk-press-soft tk-press"
      onClick={run}
      disabled={disabled}
      data-testid={testId}
      aria-busy={state === "loading" || undefined}
      aria-label={state === "loading" && typeof label === "string" ? label : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        position: "relative",
        overflow: "hidden",
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
        background: "var(--tk-accent-grad)",
        // Static glow per state: gradients don't interpolate, so the success
        // flip used to jump discretely mid-"transition" anyway; the visible
        // crossfade is the opacity of the success layer below.
        boxShadow: isSuccess ? "0 6px 16px -6px var(--tk-green)" : "0 6px 16px -6px var(--tk-accent-35)",
        ...style,
      }}
    >
      {/* Success gradient on its own layer: gradient→gradient can't animate,
          opacity can — the state change is a real crossfade now. */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, color-mix(in srgb, var(--tk-green) 88%, #fff), var(--tk-green))",
          opacity: isSuccess ? 1 : 0,
          transition: "opacity var(--tk-t2) var(--tk-ease)",
          pointerEvents: "none",
        }}
      />
      <span style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 10 }}>
        {state === "loading" ? (
          <TKSpinner color="var(--tk-on-accent)" />
        ) : isSuccess ? (
          <span key="ok" className="tk-pop" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <TKIcon name="check" size={20} strokeWidth={2.6} /> {successText}
          </span>
        ) : (
          label
        )}
      </span>
    </button>
  );
});
