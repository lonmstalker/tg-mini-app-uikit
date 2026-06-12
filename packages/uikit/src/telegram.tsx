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
  is_bot?: boolean;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  added_to_attachment_menu?: boolean;
  allows_write_to_pm?: boolean;
  photo_url?: string;
}

export interface TelegramChat {
  id: number;
  type?: "group" | "supergroup" | "channel" | string;
  title?: string;
  username?: string;
  photo_url?: string;
}

export interface TelegramInitDataUnsafe {
  query_id?: string;
  user?: TelegramUser;
  receiver?: TelegramUser;
  chat?: TelegramChat;
  chat_type?: "sender" | "private" | "group" | "supergroup" | "channel" | string;
  chat_instance?: string;
  start_param?: string;
  can_send_after?: number;
  auth_date?: number | string;
  hash?: string;
  signature?: string;
  [key: string]: unknown;
}

export interface TelegramMainButton {
  type?: "main" | "secondary" | string;
  iconCustomEmojiId?: string;
  text?: string;
  color?: string;
  textColor?: string;
  isVisible?: boolean;
  isActive?: boolean;
  hasShineEffect?: boolean;
  position?: "left" | "right" | "top" | "bottom";
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
    textColor?: string;
    has_shine_effect?: boolean;
    hasShineEffect?: boolean;
    position?: "left" | "right" | "top" | "bottom";
    is_active?: boolean;
    isActive?: boolean;
    is_visible?: boolean;
    isVisible?: boolean;
    icon_custom_emoji_id?: string;
    iconCustomEmojiId?: string;
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
  getItems?: (keys: string[], callback: (error: Error | null, values?: Record<string, string | null>) => void) => unknown;
  removeItem?: (key: string, callback?: (error: Error | null, ok?: boolean) => void) => unknown;
  removeItems?: (keys: string[], callback?: (error: Error | null, ok?: boolean) => void) => unknown;
  getKeys?: (callback: (error: Error | null, keys?: string[]) => void) => unknown;
}

export interface TelegramDeviceStorage {
  setItem?: (key: string, value: string, callback?: (error: Error | null, ok?: boolean) => void) => unknown;
  getItem?: (key: string, callback: (error: Error | null, value?: string | null) => void) => unknown;
  removeItem?: (key: string, callback?: (error: Error | null, ok?: boolean) => void) => unknown;
  clear?: (callback?: (error: Error | null, ok?: boolean) => void) => unknown;
}

export interface TelegramSecureStorage {
  setItem?: (key: string, value: string, callback?: (error: Error | null, ok?: boolean) => void) => unknown;
  getItem?: (key: string, callback: (error: Error | null, value?: string | null, canRestore?: boolean) => void) => unknown;
  restoreItem?: (key: string, callback?: (error: Error | null, value?: string | null) => void) => unknown;
  removeItem?: (key: string, callback?: (error: Error | null, ok?: boolean) => void) => unknown;
  clear?: (callback?: (error: Error | null, ok?: boolean) => void) => unknown;
}

export interface TelegramQrPopupParams {
  text?: string;
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

export type TelegramInvoiceStatus = "paid" | "cancelled" | "failed" | "pending" | string;
export type TelegramPermissionStatus = "allowed" | "cancelled" | string;
export type TelegramContactStatus = "sent" | "cancelled" | string;
export type TelegramHomeScreenStatus = "unsupported" | "unknown" | "added" | "missed" | string;
export type TelegramShareError =
  | "UNSUPPORTED"
  | "MESSAGE_EXPIRED"
  | "MESSAGE_SEND_FAILED"
  | "USER_DECLINED"
  | "UNKNOWN_ERROR"
  | string;
export type TelegramFullscreenError = "UNSUPPORTED" | "ALREADY_FULLSCREEN" | string;
export type TelegramDownloadStatus = "downloading" | "cancelled" | string;
export type TKTelegramAsyncStatus = "idle" | "pending" | "success" | "error" | "unsupported";

export interface TKTelegramAsyncState<E extends string = string> {
  status: TKTelegramAsyncStatus;
  error?: E;
}

export type TelegramGenericHookError = "UNSUPPORTED" | "USER_DECLINED" | "UNKNOWN_ERROR" | string;
export type TelegramClipboardError = "UNSUPPORTED" | "READ_FAILED";
export type TelegramQrScannerError = "UNSUPPORTED" | "CLOSED" | string;
export type TelegramEmojiStatusError =
  | "UNSUPPORTED"
  | "SUGGESTED_EMOJI_INVALID"
  | "DURATION_INVALID"
  | "USER_DECLINED"
  | "SERVER_ERROR"
  | "UNKNOWN_ERROR"
  | string;
export type TelegramDownloadError = "UNSUPPORTED" | "DOWNLOAD_FAILED" | string;
export type TelegramBiometricError = "UNSUPPORTED" | "ACCESS_DENIED" | "AUTH_FAILED" | "TOKEN_UPDATE_FAILED" | string;
export type TelegramLocationError = "UNSUPPORTED" | "LOCATION_UNAVAILABLE" | string;
export type TelegramMotionSensorError = "UNSUPPORTED" | "START_FAILED" | "STOP_FAILED" | string;

export interface TelegramLocationData {
  latitude?: number;
  longitude?: number;
  altitude?: number;
  course?: number;
  speed?: number;
  horizontal_accuracy?: number;
  vertical_accuracy?: number;
  course_accuracy?: number;
  speed_accuracy?: number;
}

export interface TelegramBiometricManager {
  isInited?: boolean;
  isBiometricAvailable?: boolean;
  biometricType?: string;
  isAccessRequested?: boolean;
  isAccessGranted?: boolean;
  isBiometricTokenSaved?: boolean;
  deviceId?: string;
  init?: (callback?: () => void) => unknown;
  requestAccess?: (params?: { reason?: string }, callback?: (ok: boolean) => void) => unknown;
  authenticate?: (params?: { reason?: string }, callback?: (ok: boolean, token?: string) => void) => unknown;
  updateBiometricToken?: (token: string, callback?: (ok: boolean) => void) => unknown;
  openSettings?: () => unknown;
}

export interface TelegramLocationManager {
  isInited?: boolean;
  isLocationAvailable?: boolean;
  isAccessRequested?: boolean;
  isAccessGranted?: boolean;
  init?: (callback?: () => void) => unknown;
  getLocation?: (callback?: (locationData?: TelegramLocationData | null) => void) => unknown;
  openSettings?: () => unknown;
}

export interface TelegramMotionSensor {
  isStarted?: boolean;
  x?: number;
  y?: number;
  z?: number;
  alpha?: number;
  beta?: number;
  gamma?: number;
  start?: (params?: { refresh_rate?: number }, callback?: (ok: boolean) => void) => unknown;
  stop?: (callback?: (ok: boolean) => void) => unknown;
}

/** `WebApp.DeviceOrientation` — the shared sensor shape plus absolute-orientation tracking (Bot API 8.0+). */
export interface TelegramDeviceOrientation extends TelegramMotionSensor {
  absolute?: boolean;
  start?: (
    params?: { refresh_rate?: number; need_absolute?: boolean },
    callback?: (ok: boolean) => void,
  ) => unknown;
}

export interface TelegramEventMap {
  activated: [];
  deactivated: [];
  themeChanged: [];
  viewportChanged: [{ isStateStable?: boolean }?];
  safeAreaChanged: [];
  contentSafeAreaChanged: [];
  mainButtonClicked: [];
  secondaryButtonClicked: [];
  backButtonClicked: [];
  settingsButtonClicked: [];
  invoiceClosed: [{ url?: string; status: TelegramInvoiceStatus }];
  popupClosed: [{ button_id?: string | null }];
  qrTextReceived: [{ data?: string }];
  scanQrPopupClosed: [];
  clipboardTextReceived: [{ data?: string | null }];
  writeAccessRequested: [{ status: TelegramPermissionStatus }];
  contactRequested: [{ status: TelegramContactStatus }];
  biometricManagerUpdated: [];
  biometricAuthRequested: [{ isAuthenticated?: boolean; biometricToken?: string }];
  biometricTokenUpdated: [{ isUpdated?: boolean }];
  fullscreenChanged: [];
  fullscreenFailed: [{ error: TelegramFullscreenError }];
  homeScreenAdded: [];
  homeScreenChecked: [{ status: TelegramHomeScreenStatus }];
  accelerometerStarted: [];
  accelerometerStopped: [];
  accelerometerChanged: [];
  accelerometerFailed: [{ error?: string }];
  deviceOrientationStarted: [];
  deviceOrientationStopped: [];
  deviceOrientationChanged: [];
  deviceOrientationFailed: [{ error?: string }];
  gyroscopeStarted: [];
  gyroscopeStopped: [];
  gyroscopeChanged: [];
  gyroscopeFailed: [{ error?: string }];
  locationManagerUpdated: [];
  locationRequested: [{ locationData?: TelegramLocationData | null }];
  shareMessageSent: [];
  shareMessageFailed: [{ error: TelegramShareError }];
  emojiStatusSet: [];
  emojiStatusFailed: [{ error?: string }];
  emojiStatusAccessRequested: [{ status: TelegramPermissionStatus }];
  fileDownloadRequested: [{ status: TelegramDownloadStatus }];
}

export type TelegramEventName = keyof TelegramEventMap;

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
  headerColor?: string;
  backgroundColor?: string;
  bottomBarColor?: string;
  isClosingConfirmationEnabled?: boolean;
  isVerticalSwipesEnabled?: boolean;
  isOrientationLocked?: boolean;
  safeAreaInset?: TelegramSafeAreaInset;
  contentSafeAreaInset?: TelegramSafeAreaInset;
  MainButton?: TelegramMainButton;
  SecondaryButton?: TelegramMainButton;
  BackButton?: TelegramSimpleButton;
  SettingsButton?: TelegramSimpleButton;
  HapticFeedback?: TelegramHapticFeedback;
  CloudStorage?: TelegramCloudStorage;
  DeviceStorage?: TelegramDeviceStorage;
  SecureStorage?: TelegramSecureStorage;
  BiometricManager?: TelegramBiometricManager;
  LocationManager?: TelegramLocationManager;
  Accelerometer?: TelegramMotionSensor;
  DeviceOrientation?: TelegramDeviceOrientation;
  Gyroscope?: TelegramMotionSensor;
  onEvent?: (event: string, handler: (...args: unknown[]) => void) => unknown;
  offEvent?: (event: string, handler: (...args: unknown[]) => void) => unknown;
  ready?: () => unknown;
  expand?: () => unknown;
  close?: () => unknown;
  requestFullscreen?: () => unknown;
  exitFullscreen?: () => unknown;
  lockOrientation?: () => unknown;
  unlockOrientation?: () => unknown;
  enableVerticalSwipes?: () => unknown;
  disableVerticalSwipes?: () => unknown;
  hideKeyboard?: () => unknown;
  enableClosingConfirmation?: () => unknown;
  disableClosingConfirmation?: () => unknown;
  setHeaderColor?: (color: string) => unknown;
  setBackgroundColor?: (color: string) => unknown;
  setBottomBarColor?: (color: string) => unknown;
  showPopup?: (params: TelegramPopupParams, callback?: (buttonId?: string) => void) => unknown;
  showAlert?: (message: string, callback?: () => void) => unknown;
  showConfirm?: (message: string, callback?: (ok: boolean) => void) => unknown;
  showScanQrPopup?: (params: TelegramQrPopupParams, callback?: (data: string) => boolean | void) => unknown;
  closeScanQrPopup?: () => unknown;
  readTextFromClipboard?: (callback?: (text?: string | null) => void) => unknown;
  openLink?: (url: string, options?: { try_instant_view?: boolean }) => unknown;
  openTelegramLink?: (url: string) => unknown;
  openInvoice?: (url: string, callback?: (status: TelegramInvoiceStatus) => void) => unknown;
  shareMessage?: (msgId: string, callback?: (ok: boolean) => void) => unknown;
  shareToStory?: (mediaUrl: string, params?: { text?: string; widget_link?: { url: string; name?: string } }) => unknown;
  downloadFile?: (params: { url: string; file_name?: string }, callback?: (ok: boolean) => void) => unknown;
  sendData?: (data: string) => unknown;
  switchInlineQuery?: (query: string, chatTypes?: string[]) => unknown;
  requestContact?: (callback?: (shared: boolean) => void) => unknown;
  requestWriteAccess?: (callback?: (allowed: boolean) => void) => unknown;
  addToHomeScreen?: () => unknown;
  checkHomeScreenStatus?: (callback?: (status: TelegramHomeScreenStatus) => void) => unknown;
  setEmojiStatus?: (customEmojiId: string, params?: { duration?: number }, callback?: (ok: boolean) => void) => unknown;
  requestEmojiStatusAccess?: (callback?: (allowed: boolean) => void) => unknown;
  requestChat?: (reqId: string, callback?: (ok: boolean) => void) => unknown;
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
  shine?: boolean;
  position?: "left" | "right" | "top" | "bottom";
  iconCustomEmojiId?: string;
  onClick?: () => void;
}

function useNativeButton(
  button: TelegramMainButton | undefined,
  {
    text,
    visible = true,
    disabled = false,
    loading = false,
    color,
    textColor,
    shine,
    position,
    iconCustomEmojiId,
    onClick,
  }: TKNativeButtonParams,
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
      if (shine != null) params.has_shine_effect = shine;
      if (position != null) params.position = position;
      if (iconCustomEmojiId != null) params.icon_custom_emoji_id = iconCustomEmojiId;
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
  }, [button, text, visible, disabled, loading, color, textColor, shine, position, iconCustomEmojiId]);
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
  getMany: (keys: string[]) => Promise<Record<string, string | null>>;
  set: (key: string, value: string) => Promise<void>;
  remove: (key: string) => Promise<void>;
  removeMany: (keys: string[]) => Promise<void>;
  keys: () => Promise<string[]>;
  clear?: () => Promise<void>;
  restore?: (key: string) => Promise<string | null>;
  /** True when backed by Telegram CloudStorage rather than localStorage. */
  isSupported: boolean;
}

const LOCAL_PREFIX = "tk-cloud:";

interface TelegramStorageApi {
  setItem?: (key: string, value: string, callback?: (error: Error | null, ok?: boolean) => void) => unknown;
  getItem?: (key: string, callback: (error: Error | null, value?: string | null, canRestore?: boolean) => void) => unknown;
  getItems?: (keys: string[], callback: (error: Error | null, values?: Record<string, string | null>) => void) => unknown;
  removeItem?: (key: string, callback?: (error: Error | null, ok?: boolean) => void) => unknown;
  removeItems?: (keys: string[], callback?: (error: Error | null, ok?: boolean) => void) => unknown;
  getKeys?: (callback: (error: Error | null, keys?: string[]) => void) => unknown;
  clear?: (callback?: (error: Error | null, ok?: boolean) => void) => unknown;
  restoreItem?: (key: string, callback?: (error: Error | null, value?: string | null) => void) => unknown;
}

function createStorageApi(storageApi: TelegramStorageApi | undefined, localPrefix: string): TKCloudStorage {
  if (storageApi?.getItem && storageApi.setItem) {
    return {
      get: (key: string) =>
        new Promise<string | null>((resolve, reject) =>
          storageApi.getItem!(key, (err, value) => (err ? reject(err) : resolve(value ?? null))),
        ),
      getMany: (keys: string[]) =>
        new Promise<Record<string, string | null>>((resolve, reject) => {
          if (storageApi.getItems) {
            storageApi.getItems(keys, (err, values) => (err ? reject(err) : resolve(values ?? {})));
            return;
          }
          Promise.all(keys.map((key) => new Promise<[string, string | null]>((res, rej) =>
            storageApi.getItem!(key, (err, value) => (err ? rej(err) : res([key, value ?? null]))),
          )))
            .then((entries) => resolve(Object.fromEntries(entries)))
            .catch(reject);
        }),
      set: (key: string, value: string) =>
        new Promise<void>((resolve, reject) =>
          storageApi.setItem!(key, value, (err) => (err ? reject(err) : resolve())),
        ),
      remove: (key: string) =>
        new Promise<void>((resolve, reject) =>
          storageApi.removeItem ? storageApi.removeItem(key, (err) => (err ? reject(err) : resolve())) : resolve(),
        ),
      removeMany: (keys: string[]) =>
        new Promise<void>((resolve, reject) => {
          if (storageApi.removeItems) {
            storageApi.removeItems(keys, (err) => (err ? reject(err) : resolve()));
            return;
          }
          Promise.all(keys.map((key) => new Promise<void>((res, rej) =>
            storageApi.removeItem ? storageApi.removeItem(key, (err) => (err ? rej(err) : res())) : res(),
          )))
            .then(() => resolve())
            .catch(reject);
        }),
      keys: () =>
        new Promise<string[]>((resolve, reject) =>
          storageApi.getKeys ? storageApi.getKeys((err, keys) => (err ? reject(err) : resolve(keys ?? []))) : resolve([]),
        ),
      clear: storageApi.clear
        ? () => new Promise<void>((resolve, reject) => storageApi.clear!((err) => (err ? reject(err) : resolve())))
        : undefined,
      restore: storageApi.restoreItem
        ? (key: string) =>
            new Promise<string | null>((resolve, reject) =>
              storageApi.restoreItem!(key, (err, value) => (err ? reject(err) : resolve(value ?? null))),
            )
        : undefined,
      isSupported: true,
    };
  }
  const storage = typeof window !== "undefined" ? window.localStorage : undefined;
  return {
    get: async (key: string) => storage?.getItem(localPrefix + key) ?? null,
    getMany: async (keys: string[]) => Object.fromEntries(keys.map((key) => [key, storage?.getItem(localPrefix + key) ?? null])),
    set: async (key: string, value: string) => {
      storage?.setItem(localPrefix + key, value);
    },
    remove: async (key: string) => {
      storage?.removeItem(localPrefix + key);
    },
    removeMany: async (keys: string[]) => {
      keys.forEach((key) => storage?.removeItem(localPrefix + key));
    },
    keys: async () => {
      if (!storage) return [];
      const out: string[] = [];
      for (let i = 0; i < storage.length; i++) {
        const k = storage.key(i);
        if (k?.startsWith(localPrefix)) out.push(k.slice(localPrefix.length));
      }
      return out;
    },
    clear: async () => {
      if (!storage) return;
      const keys = Object.keys(storage).filter((key) => key.startsWith(localPrefix));
      keys.forEach((key) => storage.removeItem(key));
    },
    isSupported: false,
  };
}

/**
 * Telegram CloudStorage promisified, with a localStorage fallback outside
 * Telegram — the persistence pattern stays identical in both environments.
 */
export function useCloudStorage(): TKCloudStorage {
  const wa = useWebApp();
  return useMemo(() => createStorageApi(wa?.CloudStorage, LOCAL_PREFIX), [wa]);
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

/* ---------------- Expanded WebApp capabilities ---------------- */

export interface TKActivity {
  isActive: boolean;
  isSupported: boolean;
}

export function useActivity(): TKActivity {
  const wa = useWebApp();
  const [isActive, setIsActive] = useState(wa?.isActive ?? true);
  useEffect(() => setIsActive(wa?.isActive ?? true), [wa]);
  useTelegramEvent("activated", () => setIsActive(true));
  useTelegramEvent("deactivated", () => setIsActive(false));
  return { isActive, isSupported: wa?.isActive != null };
}

export interface TKFullscreen {
  isFullscreen: boolean;
  lastError: TelegramFullscreenError | undefined;
  request: () => boolean;
  exit: () => boolean;
  isSupported: boolean;
}

export function useFullscreen(): TKFullscreen {
  const wa = useWebApp();
  const [isFullscreen, setIsFullscreen] = useState(wa?.isFullscreen ?? false);
  const [lastError, setLastError] = useState<TelegramFullscreenError | undefined>();
  const read = useCallback(() => setIsFullscreen(wa?.isFullscreen ?? false), [wa]);
  useEffect(() => read(), [read]);
  useTelegramEvent("fullscreenChanged", read);
  useTelegramEvent("fullscreenFailed", (payload) => setLastError(payload?.error));
  return useMemo(
    () => ({
      isFullscreen,
      lastError,
      request: () => {
        if (!wa?.requestFullscreen) return false;
        setLastError(undefined);
        wa.requestFullscreen();
        return true;
      },
      exit: () => {
        if (!wa?.exitFullscreen) return false;
        wa.exitFullscreen();
        return true;
      },
      isSupported: !!wa?.requestFullscreen,
    }),
    [isFullscreen, lastError, wa],
  );
}

export interface TKTelegramLinks {
  openLink: (url: string, options?: { tryInstantView?: boolean }) => boolean;
  openTelegramLink: (url: string) => boolean;
  isSupported: boolean;
}

export function useTelegramLinks(): TKTelegramLinks {
  const wa = useWebApp();
  return useMemo(
    () => ({
      openLink: (url, options) => {
        if (wa?.openLink) {
          wa.openLink(url, options?.tryInstantView ? { try_instant_view: true } : undefined);
          return true;
        }
        if (typeof window === "undefined") return false;
        window.open(url, "_blank", "noopener,noreferrer");
        return true;
      },
      openTelegramLink: (url) => {
        if (wa?.openTelegramLink) {
          wa.openTelegramLink(url);
          return true;
        }
        if (typeof window === "undefined") return false;
        window.location.href = url;
        return true;
      },
      isSupported: !!(wa?.openLink || wa?.openTelegramLink),
    }),
    [wa],
  );
}

export interface TKTelegramColors {
  /** Current values of `WebApp.headerColor` / `backgroundColor` / `bottomBarColor`. */
  headerColor?: string;
  backgroundColor?: string;
  bottomBarColor?: string;
  setHeaderColor: (color: string) => boolean;
  setBackgroundColor: (color: string) => boolean;
  setBottomBarColor: (color: string) => boolean;
  isSupported: boolean;
}

export function useTelegramColors(): TKTelegramColors {
  const wa = useWebApp();
  const read = useCallback(
    () => ({
      headerColor: wa?.headerColor,
      backgroundColor: wa?.backgroundColor,
      bottomBarColor: wa?.bottomBarColor,
    }),
    [wa],
  );
  const [colors, setColors] = useState(read);
  useEffect(() => setColors(read()), [read]);
  // Keyword colors ("bg_color", …) follow the theme, so re-read on theme flips.
  useTelegramEvent("themeChanged", () => setColors(read()));
  return useMemo(
    () => ({
      ...colors,
      setHeaderColor: (color) => {
        if (!wa?.setHeaderColor) return false;
        wa.setHeaderColor(color);
        setColors(read());
        return true;
      },
      setBackgroundColor: (color) => {
        if (!wa?.setBackgroundColor) return false;
        wa.setBackgroundColor(color);
        setColors(read());
        return true;
      },
      setBottomBarColor: (color) => {
        if (!wa?.setBottomBarColor) return false;
        wa.setBottomBarColor(color);
        setColors(read());
        return true;
      },
      isSupported: !!(wa?.setHeaderColor || wa?.setBackgroundColor || wa?.setBottomBarColor),
    }),
    [colors, read, wa],
  );
}

export interface TKInvoice {
  open: (url: string) => Promise<TelegramInvoiceStatus>;
  isSupported: boolean;
}

export function useInvoice(): TKInvoice {
  const wa = useWebApp();
  return useMemo(
    () => ({
      open: (url) =>
        new Promise<TelegramInvoiceStatus>((resolve) => {
          if (!wa?.openInvoice) {
            resolve("unsupported");
            return;
          }
          wa.openInvoice(url, (status) => resolve(status));
        }),
      isSupported: !!wa?.openInvoice,
    }),
    [wa],
  );
}

export interface TKShare extends TKTelegramAsyncState<TelegramShareError> {
  shareMessage: (messageId: string) => Promise<boolean>;
  shareToStory: (mediaUrl: string, params?: { text?: string; widgetLink?: { url: string; name?: string } }) => Promise<boolean>;
  isSupported: boolean;
}

export function useShare(): TKShare {
  const wa = useWebApp();
  const [state, setState] = useState<TKTelegramAsyncState<TelegramShareError>>({ status: "idle" });
  const isSupported =
    !!(wa?.shareMessage || wa?.shareToStory) || (typeof navigator !== "undefined" && "share" in navigator);
  return useMemo(
    () => ({
      shareMessage: (messageId) => {
        setState({ status: "pending" });
        return new Promise<boolean>((resolve) => {
          if (!wa?.shareMessage) {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve(false);
            return;
          }
          wa.shareMessage(messageId, (ok) => {
            setState(ok ? { status: "success" } : { status: "error", error: "MESSAGE_SEND_FAILED" });
            resolve(!!ok);
          });
        });
      },
      shareToStory: async (mediaUrl, params) => {
        setState({ status: "pending" });
        if (wa?.shareToStory) {
          wa.shareToStory(mediaUrl, params?.widgetLink ? { text: params.text, widget_link: params.widgetLink } : { text: params?.text });
          setState({ status: "success" });
          return true;
        }
        if (typeof navigator !== "undefined" && "share" in navigator) {
          try {
            await navigator.share({ url: mediaUrl, text: params?.text });
            setState({ status: "success" });
            return true;
          } catch (error) {
            setState({ status: "error", error: error instanceof Error ? error.name : "USER_DECLINED" });
            return false;
          }
        }
        setState({ status: "error", error: "UNSUPPORTED" });
        return false;
      },
      status: isSupported ? state.status : "unsupported",
      error: isSupported ? state.error : "UNSUPPORTED",
      isSupported,
    }),
    [isSupported, state.error, state.status, wa],
  );
}

export interface TKDataTransport {
  sendData: (data: string) => boolean;
  switchInlineQuery: (query: string, chatTypes?: string[]) => boolean;
  isSupported: boolean;
}

export function useDataTransport(): TKDataTransport {
  const wa = useWebApp();
  return useMemo(
    () => ({
      sendData: (data) => {
        if (!wa?.sendData) return false;
        wa.sendData(data);
        return true;
      },
      switchInlineQuery: (query, chatTypes) => {
        if (!wa?.switchInlineQuery) return false;
        wa.switchInlineQuery(query, chatTypes);
        return true;
      },
      isSupported: !!(wa?.sendData || wa?.switchInlineQuery),
    }),
    [wa],
  );
}

export function useContactRequest(): {
  request: () => Promise<boolean>;
  isSupported: boolean;
} & TKTelegramAsyncState<TelegramContactStatus | "UNSUPPORTED"> {
  const wa = useWebApp();
  const [state, setState] = useState<TKTelegramAsyncState<TelegramContactStatus | "UNSUPPORTED">>({ status: "idle" });
  const isSupported = !!wa?.requestContact;
  return useMemo(
    () => ({
      request: () => {
        setState({ status: "pending" });
        return new Promise<boolean>((resolve) => {
          if (!wa?.requestContact) {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve(false);
            return;
          }
          wa.requestContact((shared) => {
            setState(shared ? { status: "success" } : { status: "error", error: "cancelled" });
            resolve(!!shared);
          });
        });
      },
      status: isSupported ? state.status : "unsupported",
      error: isSupported ? state.error : "UNSUPPORTED",
      isSupported,
    }),
    [isSupported, state.error, state.status, wa],
  );
}

export function useWriteAccess(): {
  request: () => Promise<boolean>;
  isSupported: boolean;
} & TKTelegramAsyncState<TelegramPermissionStatus | "UNSUPPORTED"> {
  const wa = useWebApp();
  const [state, setState] = useState<TKTelegramAsyncState<TelegramPermissionStatus | "UNSUPPORTED">>({ status: "idle" });
  const isSupported = !!wa?.requestWriteAccess;
  return useMemo(
    () => ({
      request: () => {
        setState({ status: "pending" });
        return new Promise<boolean>((resolve) => {
          if (!wa?.requestWriteAccess) {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve(false);
            return;
          }
          wa.requestWriteAccess((allowed) => {
            setState(allowed ? { status: "success" } : { status: "error", error: "cancelled" });
            resolve(!!allowed);
          });
        });
      },
      status: isSupported ? state.status : "unsupported",
      error: isSupported ? state.error : "UNSUPPORTED",
      isSupported,
    }),
    [isSupported, state.error, state.status, wa],
  );
}

export interface TKClipboard extends TKTelegramAsyncState<TelegramClipboardError> {
  readText: () => Promise<string | null>;
  isSupported: boolean;
}

export function useClipboard(): TKClipboard {
  const wa = useWebApp();
  const [state, setState] = useState<TKTelegramAsyncState<TelegramClipboardError>>({ status: "idle" });
  const isSupported = !!wa?.readTextFromClipboard || (typeof navigator !== "undefined" && !!navigator.clipboard?.readText);
  return useMemo(
    () => ({
      readText: () => {
        setState({ status: "pending" });
        return new Promise<string | null>((resolve) => {
          if (wa?.readTextFromClipboard) {
            wa.readTextFromClipboard((text) => {
              setState({ status: "success" });
              resolve(text ?? null);
            });
            return;
          }
          if (typeof navigator !== "undefined" && navigator.clipboard?.readText) {
            navigator.clipboard.readText()
              .then((text) => {
                setState({ status: "success" });
                resolve(text);
              })
              .catch(() => {
                setState({ status: "error", error: "READ_FAILED" });
                resolve(null);
              });
            return;
          }
          setState({ status: "error", error: "UNSUPPORTED" });
          resolve(null);
        });
      },
      status: isSupported ? state.status : "unsupported",
      error: isSupported ? state.error : "UNSUPPORTED",
      isSupported,
    }),
    [isSupported, state.error, state.status, wa],
  );
}

export interface TKQrScanner extends TKTelegramAsyncState<TelegramQrScannerError> {
  open: (params?: TelegramQrPopupParams, onText?: (data: string) => boolean | void) => Promise<string | null>;
  close: () => boolean;
  isSupported: boolean;
}

export function useQrScanner(): TKQrScanner {
  const wa = useWebApp();
  const [state, setState] = useState<TKTelegramAsyncState<TelegramQrScannerError>>({ status: "idle" });
  const isSupported = !!wa?.showScanQrPopup;
  useEffect(() => {
    return () => {
      wa?.closeScanQrPopup?.();
    };
  }, [wa]);
  return useMemo(
    () => ({
      open: (params = {}, onText) => {
        setState({ status: "pending" });
        return new Promise<string | null>((resolve) => {
          if (!wa?.showScanQrPopup) {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve(null);
            return;
          }
          wa.showScanQrPopup(params, (data) => {
            const shouldClose = onText?.(data);
            setState({ status: "success" });
            resolve(data);
            return shouldClose;
          });
        });
      },
      close: () => {
        if (!wa?.closeScanQrPopup) {
          setState({ status: "error", error: "UNSUPPORTED" });
          return false;
        }
        wa.closeScanQrPopup();
        setState({ status: "idle" });
        return true;
      },
      status: isSupported ? state.status : "unsupported",
      error: isSupported ? state.error : "UNSUPPORTED",
      isSupported,
    }),
    [isSupported, state.error, state.status, wa],
  );
}

export function useDeviceStorage(): TKCloudStorage {
  const wa = useWebApp();
  return useMemo(() => createStorageApi(wa?.DeviceStorage, "tk-device:"), [wa]);
}

export function useSecureStorage(): TKCloudStorage {
  const wa = useWebApp();
  return useMemo(() => createStorageApi(wa?.SecureStorage, "tk-secure:"), [wa]);
}

export interface TKHomeScreen {
  add: () => boolean;
  check: () => Promise<TelegramHomeScreenStatus>;
  status: TelegramHomeScreenStatus | undefined;
  isSupported: boolean;
}

export function useHomeScreen(): TKHomeScreen {
  const wa = useWebApp();
  const [status, setStatus] = useState<TelegramHomeScreenStatus | undefined>();
  useTelegramEvent("homeScreenChecked", (payload) => setStatus(payload?.status));
  useTelegramEvent("homeScreenAdded", () => setStatus("added"));
  return useMemo(
    () => ({
      add: () => {
        if (!wa?.addToHomeScreen) return false;
        wa.addToHomeScreen();
        return true;
      },
      check: () =>
        new Promise<TelegramHomeScreenStatus>((resolve) => {
          if (!wa?.checkHomeScreenStatus) {
            resolve("unsupported");
            return;
          }
          wa.checkHomeScreenStatus((next) => {
            setStatus(next);
            resolve(next);
          });
        }),
      status,
      isSupported: !!(wa?.addToHomeScreen || wa?.checkHomeScreenStatus),
    }),
    [status, wa],
  );
}

export interface TKEmojiStatus extends TKTelegramAsyncState<TelegramEmojiStatusError> {
  set: (customEmojiId: string, params?: { duration?: number }) => Promise<boolean>;
  requestAccess: () => Promise<boolean>;
  isSupported: boolean;
}

export function useEmojiStatus(): TKEmojiStatus {
  const wa = useWebApp();
  const [state, setState] = useState<TKTelegramAsyncState<TelegramEmojiStatusError>>({ status: "idle" });
  const isSupported = !!(wa?.setEmojiStatus || wa?.requestEmojiStatusAccess);
  return useMemo(
    () => ({
      set: (customEmojiId, params) => {
        setState({ status: "pending" });
        return new Promise<boolean>((resolve) => {
          if (!wa?.setEmojiStatus) {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve(false);
            return;
          }
          wa.setEmojiStatus(customEmojiId, params, (ok) => {
            setState(ok ? { status: "success" } : { status: "error", error: "UNKNOWN_ERROR" });
            resolve(!!ok);
          });
        });
      },
      requestAccess: () => {
        setState({ status: "pending" });
        return new Promise<boolean>((resolve) => {
          if (!wa?.requestEmojiStatusAccess) {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve(false);
            return;
          }
          wa.requestEmojiStatusAccess((allowed) => {
            setState(allowed ? { status: "success" } : { status: "error", error: "USER_DECLINED" });
            resolve(!!allowed);
          });
        });
      },
      status: isSupported ? state.status : "unsupported",
      error: isSupported ? state.error : "UNSUPPORTED",
      isSupported,
    }),
    [isSupported, state.error, state.status, wa],
  );
}

export function useDownloadFile(): {
  download: (params: { url: string; fileName?: string }) => Promise<boolean>;
  isSupported: boolean;
} & TKTelegramAsyncState<TelegramDownloadError> {
  const wa = useWebApp();
  const [state, setState] = useState<TKTelegramAsyncState<TelegramDownloadError>>({ status: "idle" });
  const isSupported = !!wa?.downloadFile;
  return useMemo(
    () => ({
      download: (params) => {
        setState({ status: "pending" });
        return new Promise<boolean>((resolve) => {
          if (wa?.downloadFile) {
            wa.downloadFile({ url: params.url, file_name: params.fileName }, (ok) => {
              setState(ok ? { status: "success" } : { status: "error", error: "DOWNLOAD_FAILED" });
              resolve(!!ok);
            });
            return;
          }
          if (typeof document === "undefined") {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve(false);
            return;
          }
          const a = document.createElement("a");
          a.href = params.url;
          if (params.fileName) a.download = params.fileName;
          a.rel = "noopener noreferrer";
          a.click();
          setState({ status: "success" });
          resolve(true);
        });
      },
      status: isSupported ? state.status : "unsupported",
      error: isSupported ? state.error : "UNSUPPORTED",
      isSupported,
    }),
    [isSupported, state.error, state.status, wa],
  );
}

export function useChatRequest(): {
  request: (reqId: string) => Promise<boolean>;
  isSupported: boolean;
} & TKTelegramAsyncState<TelegramGenericHookError> {
  const wa = useWebApp();
  const [state, setState] = useState<TKTelegramAsyncState<TelegramGenericHookError>>({ status: "idle" });
  const isSupported = !!wa?.requestChat;
  return useMemo(
    () => ({
      request: (reqId) => {
        setState({ status: "pending" });
        return new Promise<boolean>((resolve) => {
          if (!wa?.requestChat) {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve(false);
            return;
          }
          wa.requestChat(reqId, (ok) => {
            setState(ok ? { status: "success" } : { status: "error", error: "USER_DECLINED" });
            resolve(!!ok);
          });
        });
      },
      status: isSupported ? state.status : "unsupported",
      error: isSupported ? state.error : "UNSUPPORTED",
      isSupported,
    }),
    [isSupported, state.error, state.status, wa],
  );
}

export function useHideKeyboard(): { hide: () => boolean; isSupported: boolean } {
  const wa = useWebApp();
  return useMemo(
    () => ({
      hide: () => {
        if (wa?.hideKeyboard) {
          wa.hideKeyboard();
          return true;
        }
        if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
          return true;
        }
        return false;
      },
      isSupported: !!wa?.hideKeyboard,
    }),
    [wa],
  );
}

export interface TKBiometrics extends TKTelegramAsyncState<TelegramBiometricError> {
  manager: TelegramBiometricManager | undefined;
  init: () => Promise<boolean>;
  requestAccess: (reason?: string) => Promise<boolean>;
  authenticate: (reason?: string) => Promise<{ ok: boolean; token?: string }>;
  updateToken: (token: string) => Promise<boolean>;
  openSettings: () => boolean;
  isSupported: boolean;
}

export function useBiometrics(): TKBiometrics {
  const wa = useWebApp();
  const manager = wa?.BiometricManager;
  const [state, setState] = useState<TKTelegramAsyncState<TelegramBiometricError>>({ status: "idle" });
  const isSupported = !!manager;
  return useMemo(
    () => ({
      manager,
      init: () => {
        setState({ status: "pending" });
        return new Promise<boolean>((resolve) => {
          if (!manager?.init) {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve(false);
            return;
          }
          manager.init(() => {
            setState({ status: "success" });
            resolve(true);
          });
        });
      },
      requestAccess: (reason) => {
        setState({ status: "pending" });
        return new Promise<boolean>((resolve) => {
          if (!manager?.requestAccess) {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve(false);
            return;
          }
          manager.requestAccess(reason ? { reason } : undefined, (ok) => {
            setState(ok ? { status: "success" } : { status: "error", error: "ACCESS_DENIED" });
            resolve(!!ok);
          });
        });
      },
      authenticate: (reason) => {
        setState({ status: "pending" });
        return new Promise<{ ok: boolean; token?: string }>((resolve) => {
          if (!manager?.authenticate) {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve({ ok: false });
            return;
          }
          manager.authenticate(reason ? { reason } : undefined, (ok, token) => {
            setState(ok ? { status: "success" } : { status: "error", error: "AUTH_FAILED" });
            resolve({ ok: !!ok, token });
          });
        });
      },
      updateToken: (token) => {
        setState({ status: "pending" });
        return new Promise<boolean>((resolve) => {
          if (!manager?.updateBiometricToken) {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve(false);
            return;
          }
          manager.updateBiometricToken(token, (ok) => {
            setState(ok ? { status: "success" } : { status: "error", error: "TOKEN_UPDATE_FAILED" });
            resolve(!!ok);
          });
        });
      },
      openSettings: () => {
        if (!manager?.openSettings) {
          setState({ status: "error", error: "UNSUPPORTED" });
          return false;
        }
        manager.openSettings();
        return true;
      },
      status: isSupported ? state.status : "unsupported",
      error: isSupported ? state.error : "UNSUPPORTED",
      isSupported,
    }),
    [isSupported, manager, state.error, state.status],
  );
}

export interface TKLocation extends TKTelegramAsyncState<TelegramLocationError> {
  manager: TelegramLocationManager | undefined;
  init: () => Promise<boolean>;
  getLocation: () => Promise<TelegramLocationData | null>;
  openSettings: () => boolean;
  isSupported: boolean;
}

export function useLocation(): TKLocation {
  const wa = useWebApp();
  const manager = wa?.LocationManager;
  const [state, setState] = useState<TKTelegramAsyncState<TelegramLocationError>>({ status: "idle" });
  const isSupported = !!manager;
  return useMemo(
    () => ({
      manager,
      init: () => {
        setState({ status: "pending" });
        return new Promise<boolean>((resolve) => {
          if (!manager?.init) {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve(false);
            return;
          }
          manager.init(() => {
            setState({ status: "success" });
            resolve(true);
          });
        });
      },
      getLocation: () => {
        setState({ status: "pending" });
        return new Promise<TelegramLocationData | null>((resolve) => {
          if (!manager?.getLocation) {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve(null);
            return;
          }
          manager.getLocation((locationData) => {
            setState(locationData ? { status: "success" } : { status: "error", error: "LOCATION_UNAVAILABLE" });
            resolve(locationData ?? null);
          });
        });
      },
      openSettings: () => {
        if (!manager?.openSettings) {
          setState({ status: "error", error: "UNSUPPORTED" });
          return false;
        }
        manager.openSettings();
        return true;
      },
      status: isSupported ? state.status : "unsupported",
      error: isSupported ? state.error : "UNSUPPORTED",
      isSupported,
    }),
    [isSupported, manager, state.error, state.status],
  );
}

interface TKMotionSensorApi<S extends TelegramMotionSensor = TelegramMotionSensor>
  extends TKTelegramAsyncState<TelegramMotionSensorError> {
  sensor: S | undefined;
  /** `needAbsolute` maps to `need_absolute` and is honoured by `DeviceOrientation` only. */
  start: (refreshRate?: number, options?: { needAbsolute?: boolean }) => Promise<boolean>;
  stop: () => Promise<boolean>;
  isSupported: boolean;
}

function sensorApi<S extends TelegramMotionSensor>(
  sensor: S | undefined,
  state: TKTelegramAsyncState<TelegramMotionSensorError>,
  setState: (state: TKTelegramAsyncState<TelegramMotionSensorError>) => void,
): TKMotionSensorApi<S> {
  const isSupported = !!sensor;
  return {
    sensor,
    start: (refreshRate?: number, options?: { needAbsolute?: boolean }) => {
      setState({ status: "pending" });
      return new Promise<boolean>((resolve) => {
        if (!sensor?.start) {
          setState({ status: "error", error: "UNSUPPORTED" });
          resolve(false);
          return;
        }
        const params: { refresh_rate?: number; need_absolute?: boolean } = {};
        if (refreshRate) params.refresh_rate = refreshRate;
        if (options?.needAbsolute != null) params.need_absolute = options.needAbsolute;
        sensor.start(Object.keys(params).length > 0 ? params : undefined, (ok) => {
          setState(ok ? { status: "success" } : { status: "error", error: "START_FAILED" });
          resolve(!!ok);
        });
      });
    },
    stop: () => {
      setState({ status: "pending" });
      return new Promise<boolean>((resolve) => {
        if (!sensor?.stop) {
          setState({ status: "error", error: "UNSUPPORTED" });
          resolve(false);
          return;
        }
        sensor.stop((ok) => {
          setState(ok ? { status: "success" } : { status: "error", error: "STOP_FAILED" });
          resolve(!!ok);
        });
      });
    },
    status: isSupported ? state.status : "unsupported",
    error: isSupported ? state.error : "UNSUPPORTED",
    isSupported,
  };
}

export function useMotionSensors() {
  const wa = useWebApp();
  const [state, setState] = useState<TKTelegramAsyncState<TelegramMotionSensorError>>({ status: "idle" });
  useEffect(() => {
    return () => {
      wa?.Accelerometer?.stop?.();
      wa?.DeviceOrientation?.stop?.();
      wa?.Gyroscope?.stop?.();
    };
  }, [wa]);
  return useMemo(
    () => ({
      accelerometer: sensorApi(wa?.Accelerometer, state, setState),
      deviceOrientation: sensorApi(wa?.DeviceOrientation, state, setState),
      gyroscope: sensorApi(wa?.Gyroscope, state, setState),
    }),
    [state, wa],
  );
}

export function useVerticalSwipes(): {
  /** Mirrors `WebApp.isVerticalSwipesEnabled` (swipes are enabled by default). */
  isEnabled: boolean;
  enable: () => boolean;
  disable: () => boolean;
  isSupported: boolean;
} {
  const wa = useWebApp();
  const [isEnabled, setIsEnabled] = useState(() => wa?.isVerticalSwipesEnabled ?? true);
  useEffect(() => setIsEnabled(wa?.isVerticalSwipesEnabled ?? true), [wa]);
  return useMemo(
    () => ({
      isEnabled,
      enable: () => {
        if (!wa?.enableVerticalSwipes) return false;
        wa.enableVerticalSwipes();
        setIsEnabled(wa.isVerticalSwipesEnabled ?? true);
        return true;
      },
      disable: () => {
        if (!wa?.disableVerticalSwipes) return false;
        wa.disableVerticalSwipes();
        setIsEnabled(wa.isVerticalSwipesEnabled ?? false);
        return true;
      },
      isSupported: !!(wa?.enableVerticalSwipes || wa?.disableVerticalSwipes),
    }),
    [isEnabled, wa],
  );
}

export function useOrientationLock(): {
  /** Mirrors `WebApp.isOrientationLocked`. */
  isLocked: boolean;
  lock: () => boolean;
  unlock: () => boolean;
  isSupported: boolean;
} {
  const wa = useWebApp();
  const [isLocked, setIsLocked] = useState(() => wa?.isOrientationLocked ?? false);
  useEffect(() => setIsLocked(wa?.isOrientationLocked ?? false), [wa]);
  return useMemo(
    () => ({
      isLocked,
      lock: () => {
        if (!wa?.lockOrientation) return false;
        wa.lockOrientation();
        setIsLocked(wa.isOrientationLocked ?? true);
        return true;
      },
      unlock: () => {
        if (!wa?.unlockOrientation) return false;
        wa.unlockOrientation();
        setIsLocked(wa.isOrientationLocked ?? false);
        return true;
      },
      isSupported: !!(wa?.lockOrientation || wa?.unlockOrientation),
    }),
    [isLocked, wa],
  );
}
