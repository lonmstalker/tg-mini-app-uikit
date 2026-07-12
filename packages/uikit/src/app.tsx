import { type CSSProperties, type ReactNode } from "react";
import { TKProvider, type TKThemeKnobs, type TKThemePreset } from "./foundation/theme";
import { TKLocaleProvider, type TKLocale } from "./foundation/i18n";
import { TKTelegramProvider, useTelegramTheme, type TKTelegramProviderProps, type TKTheme } from "./foundation/telegram";
import { TKToastProvider, type TKToastProviderProps } from "./composites/overlays";

export interface TKAppProps extends TKThemeKnobs {
  children?: ReactNode;
  /** Telegram WebApp instance (defaults to `window.Telegram.WebApp`). */
  webApp?: TKTelegramProviderProps["webApp"];
  /** Call `WebApp.ready()` on mount (default true). */
  signalReady?: boolean;
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
 * `TKLocaleProvider` (+ an optional `TKToastProvider`) and auto-syncs the visual
 * theme from the live Telegram scheme, collapsing the ~30-line three-provider
 * ladder into one element (FND-DX-001). The individual providers stay exported for
 * advanced nesting.
 *
 * Pass an already-resolved `webApp` (TKApp does NOT strip a leftover
 * `telegram-web-app.js` browser stub — that bootstrap decision stays with the app).
 * `locale` is reactive: pass a changing dictionary to switch language live.
 */
export function TKApp({ children, webApp, signalReady = true, haptics = true, ...rest }: TKAppProps) {
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
