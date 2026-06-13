import type {
  TelegramPopupParams,
  TelegramSafeAreaInset,
  TelegramThemeParams,
  TelegramWebApp,
} from "tg-mini-app-uikit";

export interface MockButtonState {
  visible: boolean;
  text: string;
  active: boolean;
  progress: boolean;
  color?: string;
  textColor?: string;
  hasShineEffect?: boolean;
  position?: "left" | "right" | "top" | "bottom";
  iconCustomEmojiId?: string;
}

export interface MockSensorValues {
  x?: number;
  y?: number;
  z?: number;
  alpha?: number;
  beta?: number;
  gamma?: number;
}

export interface MockSensorState {
  isStarted: boolean;
  refreshRate: number | null;
  /** DeviceOrientation only - whether absolute tracking was requested. */
  absolute?: boolean;
  values: MockSensorValues;
}

export type MockSensorKey = "accelerometer" | "deviceOrientation" | "gyroscope";

export interface MockPopupState {
  params: TelegramPopupParams;
  callback?: (buttonId?: string) => void;
}

export interface MockTelegramState {
  colorScheme: "light" | "dark";
  themeParams: TelegramThemeParams;
  /** Raw values passed to `set*Color` (keyword or #hex); null = client default. */
  headerColor: string | null;
  backgroundColor: string | null;
  bottomBarColor: string | null;
  isExpanded: boolean;
  isFullscreen: boolean;
  isActive: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  maxHeight: number;
  safeAreaInset: TelegramSafeAreaInset;
  contentSafeAreaInset: TelegramSafeAreaInset;
  main: MockButtonState;
  secondary: MockButtonState;
  back: { visible: boolean };
  settings: { visible: boolean };
  haptic: { kind: string; seq: number } | null;
  popup: MockPopupState | null;
  closingConfirmation: boolean;
  verticalSwipes: boolean;
  orientationLocked: boolean;
  sensors: Record<MockSensorKey, MockSensorState>;
  homeScreenStatus: string;
  closed: boolean;
  log: { id: number; text: string }[];
}

export interface MockTelegram {
  webApp: TelegramWebApp;
  getState: () => MockTelegramState;
  subscribe: (listener: () => void) => () => void;
  /** Host controls - what the Telegram client itself would do. */
  setColorScheme: (scheme: "light" | "dark") => void;
  setDeviceCutouts: (on: boolean) => void;
  setChromeInset: (on: boolean) => void;
  setViewportBounds: (maxHeight: number) => void;
  collapse: () => void;
  /** Live height while the user drags the grabber; `viewportStableHeight` stays put. */
  dragViewport: (height: number) => void;
  /** Snap to expanded/collapsed when the drag ends. */
  endViewportDrag: () => void;
  clickMain: () => void;
  clickSecondary: () => void;
  clickBack: () => void;
  clickSettings: () => void;
  resolvePopup: (buttonId?: string) => void;
  relaunch: () => void;
}
