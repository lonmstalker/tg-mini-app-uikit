import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { TKTheme } from "./theme";

/*
 * Telegram WebApp platform layer.
 *
 * All types below are structural and every field is optional, so the kit
 * works with any Telegram client version, degrades gracefully in a plain
 * browser and accepts mock implementations in demos and tests.
 */

/* ---------------- WebApp API types ---------------- */

export interface TelegramThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
  header_bg_color?: string;
  bottom_bar_bg_color?: string;
  accent_text_color?: string;
  section_bg_color?: string;
  section_header_text_color?: string;
  section_separator_color?: string;
  subtitle_text_color?: string;
  destructive_text_color?: string;
}

export interface TelegramSafeAreaInset {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface TelegramInitDataUnsafe {
  user?: TelegramUser;
  receiver?: TelegramUser;
  start_param?: string;
  auth_date?: number | string;
  query_id?: string;
  hash?: string;
  [key: string]: unknown;
}

export interface TelegramMainButton {
  text?: string;
  color?: string;
  textColor?: string;
  isVisible?: boolean;
  isActive?: boolean;
  isProgressVisible?: boolean;
  setText?: (text: string) => unknown;
  onClick?: (handler: () => void) => unknown;
  offClick?: (handler: () => void) => unknown;
  show?: () => unknown;
  hide?: () => unknown;
  enable?: () => unknown;
  disable?: () => unknown;
  showProgress?: (leaveActive?: boolean) => unknown;
  hideProgress?: () => unknown;
  setParams?: (params: {
    text?: string;
    color?: string;
    text_color?: string;
    has_shine_effect?: boolean;
    position?: "left" | "right" | "top" | "bottom";
    is_active?: boolean;
    is_visible?: boolean;
  }) => unknown;
}

export interface TelegramSimpleButton {
  isVisible?: boolean;
  show?: () => unknown;
  hide?: () => unknown;
  onClick?: (handler: () => void) => unknown;
  offClick?: (handler: () => void) => unknown;
}

export type TKImpactStyle = "light" | "medium" | "heavy" | "rigid" | "soft";
export type TKNotificationType = "success" | "error" | "warning";

export interface TelegramHapticFeedback {
  impactOccurred?: (style: TKImpactStyle) => unknown;
  notificationOccurred?: (type: TKNotificationType) => unknown;
  selectionChanged?: () => unknown;
}

export interface TelegramCloudStorage {
  setItem?: (key: string, value: string, callback?: (error: Error | null, ok?: boolean) => void) => unknown;
  getItem?: (key: string, callback: (error: Error | null, value?: string | null) => void) => unknown;
  removeItem?: (key: string, callback?: (error: Error | null, ok?: boolean) => void) => unknown;
  getKeys?: (callback: (error: Error | null, keys?: string[]) => void) => unknown;
}

export interface TelegramPopupButton {
  id?: string;
  type?: "default" | "ok" | "close" | "cancel" | "destructive";
  text?: string;
}

export interface TelegramPopupParams {
  title?: string;
  message: string;
  buttons?: TelegramPopupButton[];
}

export interface TelegramWebApp {
  version?: string;
  platform?: string;
  colorScheme?: TKTheme;
  themeParams?: TelegramThemeParams;
  initData?: string;
  initDataUnsafe?: TelegramInitDataUnsafe;
  isExpanded?: boolean;
  viewportHeight?: number;
  viewportStableHeight?: number;
  isFullscreen?: boolean;
  isActive?: boolean;
  safeAreaInset?: TelegramSafeAreaInset;
  contentSafeAreaInset?: TelegramSafeAreaInset;
  MainButton?: TelegramMainButton;
  SecondaryButton?: TelegramMainButton;
  BackButton?: TelegramSimpleButton;
  SettingsButton?: TelegramSimpleButton;
  HapticFeedback?: TelegramHapticFeedback;
  CloudStorage?: TelegramCloudStorage;
  onEvent?: (event: string, handler: (...args: unknown[]) => void) => unknown;
  offEvent?: (event: string, handler: (...args: unknown[]) => void) => unknown;
  ready?: () => unknown;
  expand?: () => unknown;
  close?: () => unknown;
  requestFullscreen?: () => unknown;
  exitFullscreen?: () => unknown;
  enableClosingConfirmation?: () => unknown;
  disableClosingConfirmation?: () => unknown;
  setHeaderColor?: (color: string) => unknown;
  setBackgroundColor?: (color: string) => unknown;
  setBottomBarColor?: (color: string) => unknown;
  showPopup?: (params: TelegramPopupParams, callback?: (buttonId?: string) => void) => unknown;
  showAlert?: (message: string, callback?: () => void) => unknown;
  showConfirm?: (message: string, callback?: (ok: boolean) => void) => unknown;
  openLink?: (url: string, options?: { try_instant_view?: boolean }) => unknown;
  openTelegramLink?: (url: string) => unknown;
  openInvoice?: (url: string, callback?: (status: string) => void) => unknown;
  shareMessage?: (msgId: string, callback?: (ok: boolean) => void) => unknown;
  sendData?: (data: string) => unknown;
  switchInlineQuery?: (query: string, chatTypes?: string[]) => unknown;
  requestContact?: (callback?: (shared: boolean) => void) => unknown;
  isVersionAtLeast?: (version: string) => boolean;
}

/* ---------------- Provider & access ---------------- */

/** The real `window.Telegram.WebApp`, when running inside Telegram. */
export function getTelegramWebApp(): TelegramWebApp | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as { Telegram?: { WebApp?: TelegramWebApp } }).Telegram?.WebApp;
}

const TKTelegramContext = createContext<TelegramWebApp | undefined>(undefined);

export interface TKTelegramProviderProps {
  /** WebApp implementation; defaults to `window.Telegram.WebApp`. Inject a mock here in demos and tests. */
  webApp?: TelegramWebApp;
  /** Call `webApp.ready()` on mount (default true). */
  signalReady?: boolean;
  children?: ReactNode;
}

/**
 * Makes a `TelegramWebApp` instance available to every `use*` hook below.
 * Optional outside of tests and demos — without it the hooks fall back to
 * `window.Telegram.WebApp` and degrade to no-ops in a plain browser.
 */
export function TKTelegramProvider({ webApp, signalReady = true, children }: TKTelegramProviderProps) {
  const wa = webApp ?? getTelegramWebApp();
  useEffect(() => {
    if (signalReady) wa?.ready?.();
  }, [wa, signalReady]);
  return <TKTelegramContext.Provider value={wa}>{children}</TKTelegramContext.Provider>;
}

/** The active WebApp: the injected one, or `window.Telegram.WebApp`, or `undefined`. */
export function useWebApp(): TelegramWebApp | undefined {
  return useContext(TKTelegramContext) ?? getTelegramWebApp();
}

/** Subscribes to a WebApp event (`themeChanged`, `viewportChanged`, …) for the component's lifetime. */
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

function useSimpleButton(
  button: TelegramSimpleButton | undefined,
  onClick: (() => void) | undefined,
  visible: boolean,
): { isSupported: boolean } {
  const ref = useRef(onClick);
  ref.current = onClick;
  useEffect(() => {
    if (!button?.onClick) return;
    const h = () => ref.current?.();
    button.onClick(h);
    return () => {
      button.offClick?.(h);
    };
  }, [button]);
  useEffect(() => {
    if (!button) return;
    if (visible) button.show?.();
    else button.hide?.();
  }, [button, visible]);
  useEffect(() => {
    if (!button) return;
    return () => {
      button.hide?.();
    };
  }, [button]);
  return { isSupported: !!button };
}

/**
 * Native Telegram Back button. Shown while the component is mounted and
 * `visible` is true; hidden again on unmount.
 */
export function useBackButton(onBack?: () => void, visible: boolean = !!onBack): { isSupported: boolean } {
  return useSimpleButton(useWebApp()?.BackButton, onBack, visible);
}

/** Native Settings button (the ⋯ menu item). Same lifecycle as `useBackButton`. */
export function useSettingsButton(onClick?: () => void, visible: boolean = !!onClick): { isSupported: boolean } {
  return useSimpleButton(useWebApp()?.SettingsButton, onClick, visible);
}

export interface TKNativeButtonParams {
  text?: string;
  visible?: boolean;
  disabled?: boolean;
  /** Show the native progress spinner and disable clicks. */
  loading?: boolean;
  color?: string;
  textColor?: string;
  onClick?: () => void;
}

function useNativeButton(
  button: TelegramMainButton | undefined,
  { text, visible = true, disabled = false, loading = false, color, textColor, onClick }: TKNativeButtonParams,
): { isSupported: boolean } {
  const clickRef = useRef(onClick);
  clickRef.current = onClick;
  useEffect(() => {
    if (!button?.onClick) return;
    const h = () => clickRef.current?.();
    button.onClick(h);
    return () => {
      button.offClick?.(h);
    };
  }, [button]);
  useEffect(() => {
    if (!button) return;
    const active = !disabled && !loading;
    if (button.setParams) {
      const params: Parameters<NonNullable<TelegramMainButton["setParams"]>>[0] = {
        is_visible: visible,
        is_active: active,
      };
      if (text != null) params.text = text;
      if (color != null) params.color = color;
      if (textColor != null) params.text_color = textColor;
      button.setParams(params);
    } else {
      if (text != null) button.setText?.(text);
      if (visible) button.show?.();
      else button.hide?.();
      if (active) button.enable?.();
      else button.disable?.();
    }
    if (loading) button.showProgress?.(false);
    else button.hideProgress?.();
  }, [button, text, visible, disabled, loading, color, textColor]);
  useEffect(() => {
    if (!button) return;
    return () => {
      button.hideProgress?.();
      button.hide?.();
    };
  }, [button]);
  return { isSupported: !!button };
}

/**
 * Adapter for the native Telegram Main button. Declarative: pass the state
 * on every render and the hook keeps the native button in sync, hiding it
 * on unmount. Use `TKMainButton` as the in-DOM fallback outside Telegram.
 *
 * ```tsx
 * useMainButton({ text: `Pay ${total}`, loading: paying, onClick: pay });
 * ```
 */
export function useMainButton(params: TKNativeButtonParams): { isSupported: boolean } {
  return useNativeButton(useWebApp()?.MainButton, params);
}

/** Adapter for the native Secondary button (Bot API 7.10+). Same contract as `useMainButton`. */
export function useSecondaryButton(params: TKNativeButtonParams): { isSupported: boolean } {
  return useNativeButton(useWebApp()?.SecondaryButton, params);
}

/* ---------------- Haptics ---------------- */

export interface TKHaptics {
  impact: (style?: TKImpactStyle) => void;
  notification: (type: TKNotificationType) => void;
  selection: () => void;
  isSupported: boolean;
}

/** Haptic feedback that no-ops outside Telegram, so it is always safe to call. */
export function useHaptics(): TKHaptics {
  const wa = useWebApp();
  return useMemo(() => {
    const h = wa?.HapticFeedback;
    const safe = (fn?: () => unknown) => {
      try {
        fn?.();
      } catch {
        /* old clients throw on unknown styles — feedback is best-effort */
      }
    };
    return {
      impact: (style: TKImpactStyle = "light") => safe(() => h?.impactOccurred?.(style)),
      notification: (type: TKNotificationType) => safe(() => h?.notificationOccurred?.(type)),
      selection: () => safe(() => h?.selectionChanged?.()),
      isSupported: !!h?.impactOccurred,
    };
  }, [wa]);
}

/* ---------------- Native popups ---------------- */

export interface TKPopup {
  alert: (message: string) => Promise<void>;
  confirm: (message: string) => Promise<boolean>;
  /** Native popup with up to 3 buttons; resolves with the pressed button id. */
  show: (params: TelegramPopupParams) => Promise<string | undefined>;
  isSupported: boolean;
}

/**
 * Promisified native popups with browser fallbacks (`window.alert`/`confirm`),
 * so flows keep working when the app runs outside Telegram.
 */
export function useTelegramPopup(): TKPopup {
  const wa = useWebApp();
  return useMemo(
    () => ({
      alert: (message: string) =>
        new Promise<void>((resolve) => {
          if (wa?.showAlert) {
            try {
              wa.showAlert(message, () => resolve());
              return;
            } catch {
              /* popup already open — fall through */
            }
          }
          if (typeof window !== "undefined") window.alert(message);
          resolve();
        }),
      confirm: (message: string) =>
        new Promise<boolean>((resolve) => {
          if (wa?.showConfirm) {
            try {
              wa.showConfirm(message, (ok) => resolve(!!ok));
              return;
            } catch {
              /* fall through */
            }
          }
          resolve(typeof window !== "undefined" ? window.confirm(message) : false);
        }),
      show: (params: TelegramPopupParams) =>
        new Promise<string | undefined>((resolve) => {
          if (wa?.showPopup) {
            try {
              wa.showPopup(params, (id) => resolve(id));
              return;
            } catch {
              /* fall through */
            }
          }
          const buttons = params.buttons ?? [];
          const okButton = buttons.find((b) => b.type !== "cancel" && b.type !== "close") ?? buttons[0];
          const cancelButton = buttons.find((b) => b.type === "cancel" || b.type === "close");
          const ok =
            typeof window !== "undefined"
              ? window.confirm([params.title, params.message].filter(Boolean).join("\n\n"))
              : false;
          resolve(ok ? okButton?.id : cancelButton?.id);
        }),
      isSupported: !!wa?.showPopup,
    }),
    [wa],
  );
}

/* ---------------- Cloud storage ---------------- */

export interface TKCloudStorage {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string) => Promise<void>;
  remove: (key: string) => Promise<void>;
  keys: () => Promise<string[]>;
  /** True when backed by Telegram CloudStorage rather than localStorage. */
  isSupported: boolean;
}

const LOCAL_PREFIX = "tk-cloud:";

/**
 * Telegram CloudStorage promisified, with a localStorage fallback outside
 * Telegram — the persistence pattern stays identical in both environments.
 */
export function useCloudStorage(): TKCloudStorage {
  const wa = useWebApp();
  return useMemo(() => {
    const cs = wa?.CloudStorage;
    if (cs?.getItem && cs.setItem) {
      return {
        get: (key: string) =>
          new Promise<string | null>((resolve, reject) =>
            cs.getItem!(key, (err, value) => (err ? reject(err) : resolve(value ?? null))),
          ),
        set: (key: string, value: string) =>
          new Promise<void>((resolve, reject) =>
            cs.setItem!(key, value, (err) => (err ? reject(err) : resolve())),
          ),
        remove: (key: string) =>
          new Promise<void>((resolve, reject) =>
            cs.removeItem
              ? cs.removeItem(key, (err) => (err ? reject(err) : resolve()))
              : resolve(),
          ),
        keys: () =>
          new Promise<string[]>((resolve, reject) =>
            cs.getKeys ? cs.getKeys((err, keys) => (err ? reject(err) : resolve(keys ?? []))) : resolve([]),
          ),
        isSupported: true,
      };
    }
    const storage = typeof window !== "undefined" ? window.localStorage : undefined;
    return {
      get: async (key: string) => storage?.getItem(LOCAL_PREFIX + key) ?? null,
      set: async (key: string, value: string) => {
        storage?.setItem(LOCAL_PREFIX + key, value);
      },
      remove: async (key: string) => {
        storage?.removeItem(LOCAL_PREFIX + key);
      },
      keys: async () => {
        if (!storage) return [];
        const out: string[] = [];
        for (let i = 0; i < storage.length; i++) {
          const k = storage.key(i);
          if (k?.startsWith(LOCAL_PREFIX)) out.push(k.slice(LOCAL_PREFIX.length));
        }
        return out;
      },
      isSupported: false,
    };
  }, [wa]);
}

/* ---------------- Init data & misc ---------------- */

export interface TKInitData {
  /** Raw query string — the only thing your backend should trust (after validating the hash). */
  raw: string | undefined;
  user: TelegramUser | undefined;
  startParam: string | undefined;
  unsafe: TelegramInitDataUnsafe | undefined;
}

/** Launch parameters of the mini app (user, start_param). Display-only — validate `raw` server-side. */
export function useInitData(): TKInitData {
  const wa = useWebApp();
  return useMemo(
    () => ({
      raw: wa?.initData,
      user: wa?.initDataUnsafe?.user,
      startParam: wa?.initDataUnsafe?.start_param,
      unsafe: wa?.initDataUnsafe,
    }),
    [wa],
  );
}

/** Asks Telegram to confirm before the user closes the app, while `enabled`. */
export function useClosingConfirmation(enabled: boolean): void {
  const wa = useWebApp();
  useEffect(() => {
    if (!wa || !enabled) return;
    wa.enableClosingConfirmation?.();
    return () => {
      wa.disableClosingConfirmation?.();
    };
  }, [wa, enabled]);
}
