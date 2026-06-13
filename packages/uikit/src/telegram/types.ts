import type { TKTheme } from "../theme";

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
