import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";
import type { TelegramEventMap, TelegramEventName, TelegramWebApp } from "./types";

/* ---------------- Provider & access ---------------- */

/** The real `window.Telegram.WebApp`, when running inside Telegram. */
export function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window === "undefined") return null;
  return (window as { Telegram?: { WebApp?: TelegramWebApp } }).Telegram?.WebApp ?? null;
}

const TKTelegramContext = /* @__PURE__ */ createContext<TelegramWebApp | undefined>(undefined);

/*
 * Back-handler queue: overlays and nav stacks register LIFO interceptors;
 * the Telegram Back button (or anything calling the dispatcher) runs the
 * most recently registered active handler — so an open sheet closes before
 * the nav stack pops (M6.3).
 */
type BackHandler = () => void;
const backQueue: BackHandler[] = [];

/** Registers `handler` as the top back interceptor while `active` is true. */
export function useBackIntercept(active: boolean, handler: BackHandler): void {
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    if (!active) return;
    const entry: BackHandler = () => ref.current();
    backQueue.push(entry);
    return () => {
      const i = backQueue.indexOf(entry);
      if (i >= 0) backQueue.splice(i, 1);
    };
  }, [active]);
}

/**
 * Returns a stable dispatcher that runs the top back interceptor (if any).
 * Wire it to `useBackButton` or call it from custom chrome.
 */
export function useBackDispatcher(): () => boolean {
  return useCallback(() => {
    const top = backQueue[backQueue.length - 1];
    if (!top) return false;
    top();
    return true;
  }, []);
}

export interface TKTelegramProviderProps {
  /** WebApp implementation; defaults to `window.Telegram.WebApp`. Inject a mock here in demos and tests. */
  webApp?: TelegramWebApp;
  /** Call `webApp.ready()` on mount (default true). */
  signalReady?: boolean;
  /**
   * Opt-in haptic feedback on kit interactions (switches, tabs, sliders,
   * pull-to-refresh, pin errors, …). Default false.
   */
  haptics?: boolean;
  children?: ReactNode;
}

const TKHapticsContext = /* @__PURE__ */ createContext(false);

export interface TKOptionalHaptics {
  selection: () => void;
  impact: (style?: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
  notification: (type?: "error" | "success" | "warning") => void;
}

/**
 * Haptics that fire only when the provider enables them (`haptics` prop) and
 * a real `HapticFeedback` is available — safe to call unconditionally.
 */
export function useOptionalHaptics(): TKOptionalHaptics {
  const enabled = useContext(TKHapticsContext);
  const wa = useWebApp();
  return useMemo(
    () => ({
      selection: () => {
        if (enabled) wa?.HapticFeedback?.selectionChanged?.();
      },
      impact: (style = "light") => {
        if (enabled) wa?.HapticFeedback?.impactOccurred?.(style);
      },
      notification: (type = "success") => {
        if (enabled) wa?.HapticFeedback?.notificationOccurred?.(type);
      },
    }),
    [enabled, wa],
  );
}

/**
 * Makes a `TelegramWebApp` instance available to every `use*` hook below.
 * Optional outside of tests and demos — without it the hooks fall back to
 * `window.Telegram.WebApp` and degrade to no-ops in a plain browser.
 */
export function TKTelegramProvider({ webApp, signalReady = true, haptics = false, children }: TKTelegramProviderProps) {
  const wa = webApp ?? getTelegramWebApp() ?? undefined;
  useEffect(() => {
    if (signalReady) wa?.ready?.();
  }, [wa, signalReady]);
  // route native Back presses through the back-handler queue (M6.3)
  useEffect(() => {
    const btn = wa?.BackButton;
    if (!btn?.onClick) return;
    const handler = () => {
      backQueue[backQueue.length - 1]?.();
    };
    btn.onClick(handler);
    return () => {
      btn.offClick?.(handler);
    };
  }, [wa]);
  return (
    <TKTelegramContext.Provider value={wa}>
      <TKHapticsContext.Provider value={haptics}>{children}</TKHapticsContext.Provider>
    </TKTelegramContext.Provider>
  );
}

/** The active WebApp: the injected one, or `window.Telegram.WebApp`, or `undefined`. */
export function useWebApp(): TelegramWebApp | undefined {
  return useContext(TKTelegramContext) ?? getTelegramWebApp() ?? undefined;
}

/** Subscribes to a typed WebApp event for the component's lifetime. */
export function useTelegramEvent<E extends TelegramEventName>(
  event: E,
  handler?: (...args: TelegramEventMap[E]) => void,
): void;
/** Subscribes to a WebApp event (`themeChanged`, `viewportChanged`, …) for the component's lifetime. */
export function useTelegramEvent(event: string, handler?: (...args: unknown[]) => void): void;
export function useTelegramEvent(event: string, handler?: (...args: unknown[]) => void): void {
  const wa = useWebApp();
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    if (!wa?.onEvent) return;
    const h = (...args: unknown[]) => ref.current?.(...args);
    wa.onEvent(event, h);
    return () => {
      wa.offEvent?.(event, h);
    };
  }, [wa, event]);
}
