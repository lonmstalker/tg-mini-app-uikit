import { useEffect, type CSSProperties, type ReactNode } from "react";
import { TKProvider, type TKThemeKnobs, type TKThemePreset } from "./foundation/theme";
import { TKLocaleProvider, type TKLocale } from "./foundation/i18n";
import {
  TKTelegramProvider,
  getTelegramWebApp,
  useKeyboard,
  useWebApp,
  type TKTelegramProviderProps,
  type TKTheme,
  useTelegramTheme,
} from "./foundation/telegram";
import { TKToastProvider, type TKToastProviderProps } from "./composites/overlays";

export interface TKAppProps extends TKThemeKnobs {
  children?: ReactNode;
  /** Telegram WebApp instance (defaults to `window.Telegram.WebApp`). */
  webApp?: TKTelegramProviderProps["webApp"];
  /** Call `WebApp.ready()` on mount (default true). */
  signalReady?: boolean;
  /** Call `WebApp.expand()` right after `ready()` on mount (default true). */
  expand?: boolean;
  /** Enable Telegram haptics for the kit's interactive components (default true). */
  haptics?: boolean;
  /** Partial locale dictionary (English fallback per key). */
  locale?: Partial<TKLocale>;
  /**
   * Visual theme. `"auto"` (default) mirrors the live Telegram light/dark scheme;
   * pass a `TKTheme` to own it (e.g. a mock Platform Lab). When you own the theme
   * AND run inside real Telegram, also pass `telegram={false}` so the host's
   * `--tg-theme-*` mirror doesn't override your chosen palette.
   */
  theme?: TKTheme | "auto";
  /** Theme used when `theme="auto"` but no Telegram scheme is available (browser launch). Default `"light"`. */
  fallbackTheme?: TKTheme;
  /** Style preset applied under any explicit knobs (e.g. `"ios"`). */
  preset?: TKThemePreset;
  /** Honor reduced-motion (default `"auto"`). */
  reduceMotion?: boolean | "auto";
  /** How to mirror `--tg-theme-*` (default `"scoped"`); see `TKProvider.telegram`. */
  telegram?: boolean | "scoped" | "global";
  /** Class on the `.tk` root. */
  className?: string;
  /** Inline style on the `.tk` root. */
  style?: CSSProperties;
  /** Wrap children in a `TKToastProvider` so `useTKToast()` works anywhere (default true). */
  toasts?: boolean;
  /** Props forwarded to the bundled `TKToastProvider`. */
  toastProps?: Omit<TKToastProviderProps, "children">;
  testId?: string;
}

/**
 * Batteries-included mini-app root: composes `TKTelegramProvider` + `TKProvider` +
 * `TKLocaleProvider` (+ an optional `TKToastProvider`), auto-syncs the visual
 * theme from the live Telegram scheme (FND-DX-001), and bootstraps the WebView:
 * `ready()` → `expand()`, the theme-colored `html`/`body` underlay (black
 * WKWebView flashes otherwise), `overscroll-behavior: none` (rubber-band feeds
 * Telegram's swipe-to-minimize), the native background color and the keyboard
 * controller (one per app). The individual providers stay exported for
 * advanced nesting. Everything degrades to a no-op outside Telegram.
 *
 * Underlay contract: the `html`/`body` background prefers the host's global
 * `--tg-theme-*` variables — those exist only where the external
 * `telegram-web-app.js` script ran (real Telegram). Outside it the fallback
 * follows the kit's resolved theme (light/dark), so a browser launch with
 * `theme="dark"` / `fallbackTheme="dark"` never flashes a light page.
 *
 * Minimal `main.tsx`:
 * ```tsx
 * createRoot(document.getElementById("root")!).render(
 *   <TKApp><MyMiniApp /></TKApp>,
 * );
 * ```
 *
 * Pass an already-resolved `webApp` (TKApp does NOT strip a leftover
 * `telegram-web-app.js` browser stub — that bootstrap decision stays with the app).
 * `locale` is reactive: pass a changing dictionary to switch language live.
 */
export function TKApp({ children, webApp, signalReady = true, expand = true, haptics = true, ...rest }: TKAppProps) {
  // Effects of children run first, so this always fires AFTER the provider's
  // ready() — the ready→expand order Telegram clients expect.
  useEffect(() => {
    if (!expand) return;
    const wa = webApp ?? getTelegramWebApp() ?? undefined;
    try {
      wa?.expand?.();
    } catch {
      /* older clients throw on unsupported calls */
    }
  }, [expand, webApp]);
  return (
    <TKTelegramProvider webApp={webApp} signalReady={signalReady} haptics={haptics}>
      <TKAppRoot {...rest}>{children}</TKAppRoot>
    </TKTelegramProvider>
  );
}

/** Inner half — runs inside `TKTelegramProvider` so it can read the live theme. */
function TKAppRoot({
  children,
  locale,
  theme = "auto",
  fallbackTheme = "light",
  preset,
  reduceMotion = "auto",
  telegram = true,
  toasts = true,
  toastProps,
  className,
  style,
  testId,
  accent,
  roundness,
  motionSpeed,
  motion,
  fontSize,
}: Omit<TKAppProps, "webApp" | "signalReady" | "haptics">) {
  const liveTheme = useTelegramTheme(fallbackTheme);
  const resolved = theme === "auto" ? liveTheme : theme;
  // One keyboard controller per app: maintains --tk-kb-height / .tk-kb-open on
  // the .tk roots (ref-counted, nested useKeyboard consumers share it).
  useKeyboard();
  const wa = useWebApp();
  useEffect(() => {
    if (typeof document === "undefined") return;
    const html = document.documentElement;
    const body = document.body;
    // The WKWebView underlay is black: an iOS pan or a viewport-height jump
    // exposed it as black flashes — paint it in the theme background. Rubber-
    // band overscroll on the body feeds Telegram's swipe-to-minimize gesture.
    // The --tg-theme-* globals exist only when the host telegram-web-app.js
    // script ran; outside real Telegram the fallback must follow the kit's
    // RESOLVED theme, or a dark app sits on a light-flashing page.
    // #0e1621/#eef1f6 mirror --tk-bg in tokens.css (pinned by tokens-contract);
    // --tk-bg itself is scoped to .tk and cannot be read from html/body.
    const fallback = resolved === "dark" ? "#0e1621" : "#eef1f6";
    const bg = `var(--tg-theme-secondary-bg-color, var(--tg-theme-bg-color, ${fallback}))`;
    const previous = [html.style.background, html.style.overscrollBehavior, body.style.background, body.style.overscrollBehavior] as const;
    html.style.background = bg;
    body.style.background = bg;
    html.style.overscrollBehavior = "none";
    body.style.overscrollBehavior = "none";
    try {
      // Keep the native chrome behind the app in the same color family.
      wa?.setBackgroundColor?.("secondary_bg_color");
    } catch {
      /* older clients throw on unsupported calls */
    }
    return () => {
      html.style.background = previous[0];
      html.style.overscrollBehavior = previous[1];
      body.style.background = previous[2];
      body.style.overscrollBehavior = previous[3];
    };
  }, [wa, resolved]);
  return (
    <TKProvider
      theme={resolved}
      preset={preset}
      telegram={telegram}
      reduceMotion={reduceMotion}
      accent={accent}
      roundness={roundness}
      motionSpeed={motionSpeed}
      motion={motion}
      fontSize={fontSize}
      className={className}
      style={style}
      testId={testId}
    >
      <TKLocaleProvider locale={locale}>
        {toasts ? <TKToastProvider {...toastProps}>{children}</TKToastProvider> : children}
      </TKLocaleProvider>
    </TKProvider>
  );
}
