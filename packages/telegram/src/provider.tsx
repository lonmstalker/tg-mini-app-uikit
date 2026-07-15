import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useInsertionEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { TelegramEventMap, TelegramEventName, TelegramWebApp } from "./types";
import { tkBackState } from "./back-registry";

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
// Queue / want-count / listeners live on a globalThis singleton (back-registry)
// so a duplicated package copy can't desync them (FND-004).
function notifyBackButton(): void {
  for (const listener of tkBackState().listeners) listener();
}

/** True while at least one active interceptor wants the native Back button shown. */
function backButtonWanted(): boolean {
  return tkBackState().want > 0;
}

/** Subscribe to changes in `backButtonWanted()`; returns an unsubscribe. */
function subscribeBackButton(listener: () => void): () => void {
  const { listeners } = tkBackState();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Registers `handler` as the top back interceptor while `active` is true.
 * `showNativeButton` (default true) also asks the provider to reveal the native
 * Telegram Back button while active, so the back press routes here instead of
 * closing the app — pass false for consumers that own button visibility some
 * other way (e.g. a nav stack honoring its own `backButton` prop).
 */
export function useBackIntercept(active: boolean, handler: BackHandler, showNativeButton = true): void {
  const ref = useRef(handler);
  useInsertionEffect(() => {
    ref.current = handler;
  });
  useEffect(() => {
    if (!active) return;
    const state = tkBackState();
    const entry: BackHandler = () => ref.current();
    state.queue.push(entry);
    if (showNativeButton) {
      state.want += 1;
      notifyBackButton();
    }
    return () => {
      const i = state.queue.indexOf(entry);
      if (i >= 0) state.queue.splice(i, 1);
      if (showNativeButton) {
        state.want = Math.max(0, state.want - 1);
        notifyBackButton();
      }
    };
  }, [active, showNativeButton]);
}

/**
 * Returns a stable dispatcher that runs the top back interceptor (if any).
 * Wire it to `useBackButton` or call it from custom chrome.
 */
export function useBackDispatcher(): () => boolean {
  return useCallback(() => {
    const { queue } = tkBackState();
    const top = queue[queue.length - 1];
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
      const { queue } = tkBackState();
      queue[queue.length - 1]?.();
    };
    btn.onClick(handler);
    return () => {
      btn.offClick?.(handler);
    };
  }, [wa]);
  // Drive the native Back button's visibility from the queue: show it whenever
  // an interceptor (overlay or nav stack) is listening, hide it otherwise, so
  // the Back press/edge-swipe reaches the queue rather than closing the app.
  const [backVisible, setBackVisible] = useState(backButtonWanted);
  useEffect(() => {
    const sync = () => setBackVisible(backButtonWanted());
    sync();
    return subscribeBackButton(sync);
  }, []);
  useEffect(() => {
    const btn = wa?.BackButton;
    if (!btn) return;
    if (backVisible) btn.show?.();
    else btn.hide?.();
  }, [wa, backVisible]);
  // Hide the native button when the provider itself unmounts (or the WebApp
  // swaps). Kept separate from the show/hide effect above so it fires only on
  // teardown, never flickering the button on a visibility toggle. This is why
  // `useBackButton` can safely defer all visibility to the provider.
  useEffect(() => {
    const btn = wa?.BackButton;
    return () => {
      btn?.hide?.();
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
  useInsertionEffect(() => {
    ref.current = handler;
  });
  useEffect(() => {
    if (!wa?.onEvent) return;
    const h = (...args: unknown[]) => ref.current?.(...args);
    wa.onEvent(event, h);
    return () => {
      wa.offEvent?.(event, h);
    };
  }, [wa, event]);
}
