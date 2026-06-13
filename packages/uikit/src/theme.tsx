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

export type TKThemePreset = "ios" | "material";

/** Preset = a named bundle of knobs (see plans.md Decision Log — no per-platform component forks). */
const PRESET_KNOBS: Record<TKThemePreset, TKThemeKnobs> = {
  ios: {},
  material: { roundness: 0.5, motion: "smooth", motionSpeed: 1.15 },
};

export interface TKProviderProps extends TKThemeKnobs {
  theme?: TKTheme;
  /** Style preset applied under any explicit knobs. */
  preset?: TKThemePreset;
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
  preset,
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
  const presetKnobs = preset ? PRESET_KNOBS[preset] : undefined;
  const vars = tkThemeVars({
    ...presetKnobs,
    ...(accent != null ? { accent } : null),
    ...(roundness != null ? { roundness } : null),
    ...(motionSpeed != null ? { motionSpeed } : null),
    ...(motion != null ? { motion } : null),
    ...(fontSize != null ? { fontSize } : null),
  });
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
