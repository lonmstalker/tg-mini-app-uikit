import {
  createContext,
  useContext,
  type CSSProperties,
  type ReactNode,
} from "react";

export type TKTheme = "light" | "dark";
export type TKMotion = "springy" | "smooth";

export const TK_SPRING = "cubic-bezier(.34, 1.45, .58, 1)";
export const TK_SMOOTH = "cubic-bezier(.25, .6, .3, 1)";

export interface TKThemeKnobs {
  /** Accent color, defaults to Telegram blue `#3390ec`. */
  accent?: string;
  /** Radius scale multiplier (0.4–1.6 feels right), default 1. */
  roundness?: number;
  /** Motion speed multiplier, default 1. Higher = faster. */
  motionSpeed?: number;
  /** Movement character: bouncy spring or plain ease-out. */
  motion?: TKMotion;
  /** Base font size in px, default 16. The whole type scale derives from it. */
  fontSize?: number;
}

export interface TKThemeValue extends TKThemeKnobs {
  theme: TKTheme;
}

/** Turns theme knobs into the CSS custom properties the kit is driven by. */
export function tkThemeVars(knobs: TKThemeKnobs): CSSProperties {
  const vars: Record<string, string | number> = {};
  if (knobs.accent != null) vars["--tk-accent"] = knobs.accent;
  if (knobs.roundness != null) vars["--tk-rx"] = knobs.roundness;
  if (knobs.motionSpeed != null) vars["--tk-ms"] = knobs.motionSpeed;
  if (knobs.fontSize != null) vars["--tk-fz"] = `${knobs.fontSize}px`;
  if (knobs.motion != null) vars["--tk-spring"] = knobs.motion === "smooth" ? TK_SMOOTH : TK_SPRING;
  return vars as CSSProperties;
}

const TKThemeContext = createContext<TKThemeValue>({ theme: "light" });

export interface TKProviderProps extends TKThemeKnobs {
  theme?: TKTheme;
  /**
   * Inherit the live Telegram theme: adds the `tk-tg` class so every token
   * resolves from `--tg-theme-*` variables when running inside Telegram.
   */
  telegram?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  testId?: string;
}

/**
 * Root container of a mini app (or any kit subtree). Renders the `.tk`
 * element, applies the theme and knobs as CSS variables and anchors kit
 * overlays (sheets, dialogs, toasts), which position against it.
 */
export function TKProvider({
  theme = "light",
  accent,
  roundness,
  motionSpeed,
  motion,
  fontSize,
  telegram,
  className,
  style,
  children,
  testId,
}: TKProviderProps) {
  const vars = tkThemeVars({ accent, roundness, motionSpeed, motion, fontSize });
  return (
    <TKThemeContext.Provider value={{ theme, accent, roundness, motionSpeed, motion, fontSize }}>
      <div
        className={["tk", telegram ? "tk-tg" : "", className ?? ""].filter(Boolean).join(" ")}
        data-theme={theme}
        data-testid={testId}
        style={{ position: "relative", ...vars, ...style }}
      >
        {children}
      </div>
    </TKThemeContext.Provider>
  );
}

export function useTKTheme(): TKThemeValue {
  return useContext(TKThemeContext);
}
