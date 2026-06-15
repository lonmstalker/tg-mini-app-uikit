import { useCallback, useEffect, useState } from "react";
import type { TelegramSafeAreaInset, TKTheme } from "./types";
import { useTelegramEvent, useWebApp } from "./provider";

/* ---------------- Theme ---------------- */

/**
 * Light/dark scheme of the surrounding Telegram client, kept in sync with
 * its `themeChanged` event. Falls back to `fallback` outside Telegram.
 *
 * ```tsx
 * const theme = useTelegramTheme();
 * return <TKProvider theme={theme} telegram>…</TKProvider>;
 * ```
 */
export function useTelegramTheme(fallback: TKTheme = "light"): TKTheme {
  const wa = useWebApp();
  const [theme, setTheme] = useState<TKTheme>(() => wa?.colorScheme ?? fallback);
  useEffect(() => {
    setTheme(wa?.colorScheme ?? fallback);
  }, [wa, fallback]);
  useTelegramEvent("themeChanged", () => setTheme(wa?.colorScheme ?? fallback));
  return theme;
}

/* ---------------- Viewport ---------------- */

export interface TKViewport {
  /** Current visible height of the mini app, px. `undefined` outside Telegram. */
  height: number | undefined;
  /** Height the app will settle at once the resize animation ends, px. */
  stableHeight: number | undefined;
  isExpanded: boolean;
  isFullscreen: boolean;
  /** Expand the app to its maximum height (no-op outside Telegram). */
  expand: () => void;
  isSupported: boolean;
}

/** Live viewport of the mini app, synced with `viewportChanged`/`fullscreenChanged`. */
export function useViewport(): TKViewport {
  const wa = useWebApp();
  const read = useCallback(
    () => ({
      height: wa?.viewportHeight,
      stableHeight: wa?.viewportStableHeight,
      isExpanded: wa?.isExpanded ?? true,
      isFullscreen: wa?.isFullscreen ?? false,
    }),
    [wa],
  );
  const [state, setState] = useState(read);
  useEffect(() => setState(read()), [read]);
  useTelegramEvent("viewportChanged", () => setState(read()));
  useTelegramEvent("fullscreenChanged", () => setState(read()));
  const expand = useCallback(() => {
    wa?.expand?.();
  }, [wa]);
  return { ...state, expand, isSupported: !!wa?.expand };
}

/* ---------------- Safe area ---------------- */

const ZERO_INSET: TelegramSafeAreaInset = { top: 0, bottom: 0, left: 0, right: 0 };

export interface TKSafeAreaInsets {
  /** Device cutouts: notch, rounded corners, home indicator. */
  inset: TelegramSafeAreaInset;
  /** Extra space covered by the Telegram UI (header controls in fullscreen). */
  contentInset: TelegramSafeAreaInset;
}

/** Telegram safe-area insets, synced with `safeAreaChanged`/`contentSafeAreaChanged`. Zeroes outside Telegram. */
export function useSafeArea(): TKSafeAreaInsets {
  const wa = useWebApp();
  const read = useCallback(
    (): TKSafeAreaInsets => ({
      inset: wa?.safeAreaInset ?? ZERO_INSET,
      contentInset: wa?.contentSafeAreaInset ?? ZERO_INSET,
    }),
    [wa],
  );
  const [state, setState] = useState(read);
  useEffect(() => setState(read()), [read]);
  useTelegramEvent("safeAreaChanged", () => setState(read()));
  useTelegramEvent("contentSafeAreaChanged", () => setState(read()));
  return state;
}

/* ---------------- Native buttons ---------------- */
