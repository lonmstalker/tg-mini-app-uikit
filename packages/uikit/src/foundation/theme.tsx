import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useSafeArea, useTelegramEvent, useWebApp } from "@tg-mini-app/telegram";
import type { TelegramThemeParams, TKTheme } from "@tg-mini-app/telegram";

// `TKTheme` now lives with the platform bridge (colorScheme is a Telegram
// concept); re-export it here so `tg-mini-app-uikit` keeps exposing it.
export type { TKTheme } from "@tg-mini-app/telegram";
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

/**
 * Picks a readable ink color to sit ON a hex accent (relative luminance): a
 * light accent gets dark ink, a dark accent white. Returns undefined for a
 * non-hex accent (var()/rgb()), leaving the CSS default. So a near-white custom
 * accent no longer renders white-on-white through `--tk-on-accent` (M6 review).
 */
export function tkOnAccentInk(accent: string): string | undefined {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(accent.trim());
  if (!m) return undefined;
  const h = m[1].length === 3 ? m[1].replace(/./g, (c) => c + c) : m[1];
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return lum > 0.6 ? "#0b0f14" : "#ffffff";
}

/** Turns theme knobs into the CSS custom properties the kit is driven by. */
export function tkThemeVars(knobs: TKThemeKnobs): CSSProperties {
  const vars: Record<string, string | number> = {};
  if (knobs.accent != null) {
    vars["--tk-accent"] = knobs.accent;
    // Keep on-accent ink readable on a custom (esp. light) accent.
    const ink = tkOnAccentInk(knobs.accent);
    if (ink) vars["--tk-on-accent"] = ink;
  }
  if (knobs.roundness != null) vars["--tk-rx"] = knobs.roundness;
  // Clamp to a positive floor: `--tk-ms` is a DIVISOR in tokens.css
  // (`calc(140ms / var(--tk-ms))`), so 0 or a negative would emit an invalid /
  // negative duration across the whole subtree (FND-002). For a true motion-off
  // path use `reduceMotion`, not `motionSpeed={0}`.
  if (knobs.motionSpeed != null) vars["--tk-ms"] = Math.max(0.05, knobs.motionSpeed);
  if (knobs.fontSize != null) vars["--tk-fz"] = `${knobs.fontSize}px`;
  if (knobs.motion != null) vars["--tk-spring"] = knobs.motion === "smooth" ? TK_SMOOTH : TK_SPRING;
  return vars as CSSProperties;
}

const TKThemeContext = /* @__PURE__ */ createContext<TKThemeValue>({ theme: "light" });

/**
 * Mirrors `WebApp.themeParams` onto `--tg-theme-*` custom properties on a target
 * element (snake_case key → `--tg-theme-<kebab>`), so `tokens.css` fallbacks
 * resolve even behind an injected mock webApp or an old client that does not set
 * them natively. Returns the keys it set so the caller can remove exactly those
 * on cleanup (FND-003 — no global leak, no cross-provider clobber). SSR-safe.
 */
function applyTelegramThemeVars(target: HTMLElement | null, params: TelegramThemeParams | undefined): string[] {
  if (!target || !params) return [];
  const applied: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    if (typeof value !== "string") continue;
    const prop = `--tg-theme-${key.replace(/_/g, "-")}`;
    target.style.setProperty(prop, value);
    applied.push(prop);
  }
  return applied;
}

/**
 * Tracks the OS `prefers-reduced-motion` setting, live. Works anywhere (not
 * gated to the `.tk` scope — CC-09). Returns `false` when `matchMedia` is
 * unavailable (SSR / old WebView).
 */
export function useReducedMotion(): boolean {
  const query = "(prefers-reduced-motion: reduce)";
  const get = () => typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia(query).matches;
  const [reduced, setReduced] = useState(get);
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mql = window.matchMedia(query);
    const onChange = () => setReduced(mql.matches);
    onChange();
    mql.addEventListener?.("change", onChange);
    return () => mql.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}

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
   * resolves from `--tg-theme-*` variables when running inside Telegram. The
   * `--tg-theme-*` mirror is `'scoped'` to this provider's root by default
   * (`true` ≡ `'scoped'`); `'global'` writes them on `<html>` for the rare app
   * that needs page-level vars. Either way they are removed on unmount (FND-003).
   */
  telegram?: boolean | "scoped" | "global";
  /**
   * Honor reduced-motion. `'auto'` (default) follows the OS
   * `prefers-reduced-motion` live; `true`/`false` force it. When reduced, the
   * root gets `data-tk-motion="off"` so motion quiets down without invalid
   * `calc()` (CC-09 / FND-DX-002).
   */
  reduceMotion?: boolean | "auto";
  /**
   * Frosted-glass bars (tabbar, header, bottom/write bars) use a constant
   * `backdrop-filter: blur()` — an ongoing GPU cost on hot surfaces. Set
   * `false` to downgrade them to the opaque `--tk-bg` surface (the same look
   * as the no-backdrop-filter fallback). Default `true`. The kit never
   * device-sniffs — the host decides.
   */
  glassBars?: boolean;
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
  reduceMotion = "auto",
  glassBars = true,
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
  const rootRef = useRef<HTMLDivElement>(null);
  const osReduced = useReducedMotion();
  const reduced = reduceMotion === "auto" ? osReduced : reduceMotion;
  // When inheriting the Telegram theme, mirror its themeParams onto `--tg-theme-*`.
  // Scoped to this root by default so two providers don't clobber each other and
  // nothing leaks onto <html> after unmount; `'global'` opts into page-level vars.
  // Applied keys are tracked so cleanup removes exactly what we set (FND-003).
  const wa = useWebApp();
  const appliedKeysRef = useRef<string[]>([]);
  const mirrorTarget = (): HTMLElement | null =>
    !telegram ? null : telegram === "global" ? document.documentElement : rootRef.current;
  const syncTelegramTheme = () => {
    const target = mirrorTarget();
    // remove the previous set first so a target/param change never leaves stragglers
    for (const key of appliedKeysRef.current) target?.style.removeProperty(key);
    appliedKeysRef.current = applyTelegramThemeVars(target, wa?.themeParams);
  };
  useEffect(() => {
    syncTelegramTheme();
    return () => {
      const target = mirrorTarget();
      for (const key of appliedKeysRef.current) target?.style.removeProperty(key);
      appliedKeysRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [telegram, wa]);
  useTelegramEvent("themeChanged", telegram ? syncTelegramTheme : undefined);
  // Bridge Telegram's JS safe-area insets onto the `--tk-safe-*` vars on this
  // root. The tokens default them to `env(safe-area-inset-*)`, but inside the
  // Telegram webview `env()` is frequently 0 while the real inset is exposed
  // only via JS (safeAreaInset / contentSafeAreaInset). `max(env, jsPx)` keeps
  // whichever is larger, so bottom overlays (sheet, action sheet, toast) clear
  // the home indicator / header even when `env()` reports nothing — matching
  // what TKHeader/TKTabbar/tkSafePad already do per-component.
  const { inset, contentInset } = useSafeArea();
  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const px = (edge: "top" | "bottom" | "left" | "right") =>
      (inset[edge] ?? 0) + (contentInset[edge] ?? 0);
    for (const edge of ["top", "bottom", "left", "right"] as const) {
      node.style.setProperty(`--tk-safe-${edge}`, `max(env(safe-area-inset-${edge}, 0px), ${px(edge)}px)`);
    }
  }, [inset, contentInset]);
  return (
    <TKThemeContext.Provider value={{ theme, accent, roundness, motionSpeed, motion, fontSize }}>
      <div
        ref={rootRef}
        className={["tk", telegram ? "tk-tg" : "", className ?? ""].filter(Boolean).join(" ")}
        data-theme={theme}
        data-tk-motion={reduced ? "off" : undefined}
        data-tk-glass={glassBars ? undefined : "off"}
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
