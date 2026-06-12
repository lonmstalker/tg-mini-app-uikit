import type {
  TelegramBiometricManager,
  TelegramCloudStorage,
  TelegramDeviceOrientation,
  TelegramDeviceStorage,
  TelegramMainButton,
  TelegramPopupParams,
  TelegramSafeAreaInset,
  TelegramSecureStorage,
  TelegramSimpleButton,
  TelegramThemeParams,
  TelegramWebApp,
} from "tg-mini-app-uikit";

/*
 * In-memory implementation of the Telegram WebApp API. The demo injects it
 * via `<TKTelegramProvider webApp={…}>`, so every kit hook (useMainButton,
 * useViewport, useTelegramPopup, …) runs against it exactly like against
 * the real `window.Telegram.WebApp` — and the Platform Lab renders the
 * "client side" (chrome, buttons, popups) that Telegram would render.
 */

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
  /** DeviceOrientation only — whether absolute tracking was requested. */
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
  /** Host controls — what the Telegram client itself would do. */
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

const ZERO: TelegramSafeAreaInset = { top: 0, bottom: 0, left: 0, right: 0 };
const CUTOUTS: TelegramSafeAreaInset = { top: 59, bottom: 34, left: 0, right: 0 };
const CHROME: TelegramSafeAreaInset = { top: 46, bottom: 0, left: 0, right: 0 };

const THEMES: Record<"light" | "dark", TelegramThemeParams> = {
  light: {
    bg_color: "#ffffff",
    secondary_bg_color: "#eef1f6",
    section_bg_color: "#ffffff",
    section_separator_color: "#e3e7ee",
    header_bg_color: "#ffffff",
    bottom_bar_bg_color: "#f2f4f8",
    text_color: "#131c26",
    subtitle_text_color: "#7b8794",
    section_header_text_color: "#707579",
    hint_color: "#a8b2bd",
    link_color: "#3390ec",
    accent_text_color: "#3390ec",
    button_color: "#3390ec",
    button_text_color: "#ffffff",
    destructive_text_color: "#e5484d",
  },
  dark: {
    bg_color: "#17212b",
    secondary_bg_color: "#0e1621",
    section_bg_color: "#17212b",
    section_separator_color: "#202c39",
    header_bg_color: "#17212b",
    bottom_bar_bg_color: "#202c39",
    text_color: "#f3f6f9",
    subtitle_text_color: "#8a99a8",
    section_header_text_color: "#788797",
    hint_color: "#5d6c7b",
    link_color: "#3390ec",
    accent_text_color: "#3390ec",
    button_color: "#3390ec",
    button_text_color: "#ffffff",
    destructive_text_color: "#ff6166",
  },
};

const CLOUD_PREFIX = "tg-demo-cloud:";
const DEVICE_PREFIX = "tg-demo-device:";
const SECURE_PREFIX = "tg-demo-secure:";

/** Deterministic sensor readings — static so e2e assertions never race a ticker. */
const SENSOR_READINGS: Record<MockSensorKey, MockSensorValues> = {
  accelerometer: { x: 0.12, y: 9.77, z: 0.34 }, // m/s², gravity on y
  deviceOrientation: { alpha: 0.66, beta: 0.18, gamma: -0.05 }, // radians
  gyroscope: { x: 0.01, y: 0.02, z: 0 }, // rad/s
};

/** Resolves the stored `set*Color` values (keyword, #hex or client default) against the theme. */
export function resolveMockColors(
  state: Pick<MockTelegramState, "themeParams" | "headerColor" | "backgroundColor" | "bottomBarColor">,
): { header: string; background: string; bottomBar: string } {
  const tp = state.themeParams;
  const resolve = (raw: string | null, fallback?: string): string => {
    if (raw === null) return fallback ?? "#ffffff";
    if (raw === "bg_color") return tp.bg_color ?? fallback ?? "#ffffff";
    if (raw === "secondary_bg_color") return tp.secondary_bg_color ?? fallback ?? "#ffffff";
    if (raw === "bottom_bar_bg_color") return tp.bottom_bar_bg_color ?? fallback ?? "#ffffff";
    return raw;
  };
  return {
    header: resolve(state.headerColor, tp.header_bg_color),
    background: resolve(state.backgroundColor, tp.bg_color),
    bottomBar: resolve(state.bottomBarColor, tp.bottom_bar_bg_color),
  };
}

export function createMockTelegram(): MockTelegram {
  const collapsedOf = (max: number) => Math.round(max * 0.62);

  let state: MockTelegramState = {
    colorScheme: "light",
    themeParams: THEMES.light,
    headerColor: null,
    backgroundColor: null,
    bottomBarColor: null,
    isExpanded: false,
    isFullscreen: false,
    isActive: true,
    maxHeight: 740,
    viewportHeight: collapsedOf(740),
    viewportStableHeight: collapsedOf(740),
    safeAreaInset: ZERO,
    contentSafeAreaInset: ZERO,
    main: { visible: false, text: "CONTINUE", active: true, progress: false },
    secondary: { visible: false, text: "Cancel", active: true, progress: false },
    back: { visible: false },
    settings: { visible: false },
    haptic: null,
    popup: null,
    closingConfirmation: false,
    verticalSwipes: true,
    orientationLocked: false,
    sensors: {
      accelerometer: { isStarted: false, refreshRate: null, values: {} },
      deviceOrientation: { isStarted: false, refreshRate: null, absolute: false, values: {} },
      gyroscope: { isStarted: false, refreshRate: null, values: {} },
    },
    homeScreenStatus: "missed",
    closed: false,
    log: [],
  };

  const listeners = new Set<() => void>();
  const handlers = new Map<string, Set<(...args: unknown[]) => void>>();
  let logId = 0;
  let hapticSeq = 0;

  const notify = () => listeners.forEach((l) => l());

  const log = (text: string) => {
    state = { ...state, log: [{ id: ++logId, text }, ...state.log].slice(0, 30) };
  };

  const dispatch = (event: string, payload?: unknown, quiet = false) => {
    if (!quiet) log(`event · ${event}`);
    handlers.get(event)?.forEach((h) => h(payload));
  };

  const syncSensor = (target: TelegramDeviceOrientation, s: MockSensorState) => {
    target.isStarted = s.isStarted;
    target.x = s.values.x;
    target.y = s.values.y;
    target.z = s.values.z;
    target.alpha = s.values.alpha;
    target.beta = s.values.beta;
    target.gamma = s.values.gamma;
    if (s.absolute != null) target.absolute = s.absolute;
  };

  /* Mirrors the mutable state into the flat WebApp fields the hooks read. */
  const syncWebApp = () => {
    webApp.colorScheme = state.colorScheme;
    webApp.themeParams = state.themeParams;
    const colors = resolveMockColors(state);
    webApp.headerColor = colors.header;
    webApp.backgroundColor = colors.background;
    webApp.bottomBarColor = colors.bottomBar;
    webApp.isExpanded = state.isExpanded;
    webApp.isFullscreen = state.isFullscreen;
    webApp.isActive = state.isActive;
    webApp.isClosingConfirmationEnabled = state.closingConfirmation;
    webApp.isVerticalSwipesEnabled = state.verticalSwipes;
    webApp.isOrientationLocked = state.orientationLocked;
    webApp.viewportHeight = state.viewportHeight;
    webApp.viewportStableHeight = state.viewportStableHeight;
    webApp.safeAreaInset = state.safeAreaInset;
    webApp.contentSafeAreaInset = state.contentSafeAreaInset;
    mainButton.text = state.main.text;
    mainButton.isVisible = state.main.visible;
    mainButton.isActive = state.main.active;
    mainButton.isProgressVisible = state.main.progress;
    mainButton.hasShineEffect = state.main.hasShineEffect;
    mainButton.iconCustomEmojiId = state.main.iconCustomEmojiId;
    secondaryButton.text = state.secondary.text;
    secondaryButton.isVisible = state.secondary.visible;
    secondaryButton.isActive = state.secondary.active;
    secondaryButton.isProgressVisible = state.secondary.progress;
    secondaryButton.hasShineEffect = state.secondary.hasShineEffect;
    secondaryButton.position = state.secondary.position;
    secondaryButton.iconCustomEmojiId = state.secondary.iconCustomEmojiId;
    backButton.isVisible = state.back.visible;
    settingsButton.isVisible = state.settings.visible;
    syncSensor(accelerometerSensor, state.sensors.accelerometer);
    syncSensor(deviceOrientationSensor, state.sensors.deviceOrientation);
    syncSensor(gyroscopeSensor, state.sensors.gyroscope);
  };

  const commit = (next: Partial<MockTelegramState>, events: string[] = []) => {
    state = { ...state, ...next };
    syncWebApp();
    events.forEach((e) => dispatch(e));
    notify();
  };

  const makeBigButton = (key: "main" | "secondary", label: string): TelegramMainButton => {
    const clicks = new Set<() => void>();
    const patch = (p: Partial<MockButtonState>, what: string) => {
      log(`${label}.${what}`);
      commit({ [key]: { ...state[key], ...p } } as Partial<MockTelegramState>);
    };
    const button: TelegramMainButton = {
      setText: (text) => patch({ text }, `setText("${text}")`),
      show: () => patch({ visible: true }, "show()"),
      hide: () => patch({ visible: false }, "hide()"),
      enable: () => patch({ active: true }, "enable()"),
      disable: () => patch({ active: false }, "disable()"),
      showProgress: () => patch({ progress: true }, "showProgress()"),
      hideProgress: () => patch({ progress: false }, "hideProgress()"),
      setParams: (params) => {
        const shine = params.has_shine_effect ?? params.hasShineEffect;
        const icon = params.icon_custom_emoji_id ?? params.iconCustomEmojiId;
        patch(
          {
            ...(params.text != null ? { text: params.text } : {}),
            ...(params.color != null ? { color: params.color } : {}),
            ...(params.text_color != null ? { textColor: params.text_color } : {}),
            ...(params.is_visible != null ? { visible: params.is_visible } : {}),
            ...(params.is_active != null ? { active: params.is_active } : {}),
            ...(shine != null ? { hasShineEffect: shine } : {}),
            ...(params.position != null ? { position: params.position } : {}),
            ...(icon != null ? { iconCustomEmojiId: icon } : {}),
          },
          "setParams(…)",
        );
      },
      onClick: (h) => clicks.add(h),
      offClick: (h) => clicks.delete(h),
    };
    return Object.assign(button, { __clicks: clicks });
  };

  const makeSmallButton = (key: "back" | "settings", label: string): TelegramSimpleButton => {
    const clicks = new Set<() => void>();
    const button: TelegramSimpleButton = {
      show: () => {
        log(`${label}.show()`);
        commit({ [key]: { visible: true } } as Partial<MockTelegramState>);
      },
      hide: () => {
        log(`${label}.hide()`);
        commit({ [key]: { visible: false } } as Partial<MockTelegramState>);
      },
      onClick: (h) => clicks.add(h),
      offClick: (h) => clicks.delete(h),
    };
    return Object.assign(button, { __clicks: clicks });
  };

  const mainButton = makeBigButton("main", "MainButton");
  const secondaryButton = makeBigButton("secondary", "SecondaryButton");
  const backButton = makeSmallButton("back", "BackButton");
  const settingsButton = makeSmallButton("settings", "SettingsButton");

  const fireClicks = (button: object) => {
    (button as { __clicks: Set<() => void> }).__clicks.forEach((h) => h());
  };

  /* One factory for all three motion sensors; `need_absolute` matters only
   * for DeviceOrientation, exactly like in the real client. */
  const makeSensor = (key: MockSensorKey, label: string): TelegramDeviceOrientation => ({
    start: (params, cb) => {
      const absolute = key === "deviceOrientation" && !!params?.need_absolute;
      log(`${label}.start(${params?.refresh_rate ?? "default"}${absolute ? ", absolute" : ""})`);
      commit(
        {
          sensors: {
            ...state.sensors,
            [key]: {
              isStarted: true,
              refreshRate: params?.refresh_rate ?? null,
              ...(key === "deviceOrientation" ? { absolute } : {}),
              values: SENSOR_READINGS[key],
            },
          },
        },
        [`${key}Started`, `${key}Changed`],
      );
      cb?.(true);
    },
    stop: (cb) => {
      log(`${label}.stop()`);
      commit(
        { sensors: { ...state.sensors, [key]: { ...state.sensors[key], isStarted: false } } },
        [`${key}Stopped`],
      );
      cb?.(true);
    },
  });

  const accelerometerSensor = makeSensor("accelerometer", "Accelerometer");
  const deviceOrientationSensor = makeSensor("deviceOrientation", "DeviceOrientation");
  const gyroscopeSensor = makeSensor("gyroscope", "Gyroscope");

  const haptic = (kind: string) => {
    log(`haptic · ${kind}`);
    commit({ haptic: { kind, seq: ++hapticSeq } });
  };

  const showPopup = (params: TelegramPopupParams, callback?: (buttonId?: string) => void) => {
    if (state.popup) throw new Error("WebAppPopupOpened"); // matches the real client
    log(`showPopup("${params.title ?? params.message}")`);
    commit({ popup: { params, callback } });
  };

  const doClose = () => {
    log("close()");
    commit({ closed: true });
  };

  const makeStorage = (prefix: string, label: string): TelegramCloudStorage & TelegramDeviceStorage => ({
    setItem: (key, value, cb) => {
      localStorage.setItem(prefix + key, value);
      log(`${label}.setItem("${key}")`);
      notify();
      cb?.(null, true);
    },
    getItem: (key, cb) => {
      log(`${label}.getItem("${key}")`);
      notify();
      cb(null, localStorage.getItem(prefix + key));
    },
    getItems: (keys, cb) => {
      log(`${label}.getItems(${keys.length})`);
      cb(null, Object.fromEntries(keys.map((key) => [key, localStorage.getItem(prefix + key)])));
    },
    removeItem: (key, cb) => {
      localStorage.removeItem(prefix + key);
      log(`${label}.removeItem("${key}")`);
      notify();
      cb?.(null, true);
    },
    removeItems: (keys, cb) => {
      keys.forEach((key) => localStorage.removeItem(prefix + key));
      log(`${label}.removeItems(${keys.length})`);
      notify();
      cb?.(null, true);
    },
    getKeys: (cb) => {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k?.startsWith(prefix)) keys.push(k.slice(prefix.length));
      }
      cb(null, keys);
    },
    clear: (cb) => {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k?.startsWith(prefix)) keys.push(k);
      }
      keys.forEach((key) => localStorage.removeItem(key));
      log(`${label}.clear()`);
      notify();
      cb?.(null, true);
    },
  });

  const secureStorage: TelegramSecureStorage = {
    ...makeStorage(SECURE_PREFIX, "SecureStorage"),
    restoreItem: (key, cb) => {
      log(`SecureStorage.restoreItem("${key}")`);
      cb?.(null, localStorage.getItem(SECURE_PREFIX + key));
    },
  };

  const biometricManager: TelegramBiometricManager = {
    isInited: true,
    isBiometricAvailable: true,
    biometricType: "face",
    isAccessRequested: true,
    isAccessGranted: true,
    isBiometricTokenSaved: false,
    deviceId: "demo-device-01",
    init: (cb) => {
      log("BiometricManager.init()");
      dispatch("biometricManagerUpdated");
      cb?.();
    },
    requestAccess: (_params, cb) => {
      log("BiometricManager.requestAccess()");
      cb?.(true);
    },
    authenticate: (_params, cb) => {
      log("BiometricManager.authenticate()");
      dispatch("biometricAuthRequested", { isAuthenticated: true, biometricToken: "demo-token" });
      cb?.(true, "demo-token");
    },
    updateBiometricToken: (token, cb) => {
      log("BiometricManager.updateBiometricToken()");
      biometricManager.isBiometricTokenSaved = !!token;
      dispatch("biometricTokenUpdated", { isUpdated: true });
      cb?.(true);
    },
    openSettings: () => log("BiometricManager.openSettings()"),
  };

  const webApp: TelegramWebApp = {
    version: "9.6",
    platform: "ios",
    colorScheme: state.colorScheme,
    themeParams: state.themeParams,
    initData: "query_id=AADemo&user=%7B%22id%22%3A99281932%7D&auth_date=1718000000&hash=demo-not-valid",
    initDataUnsafe: {
      query_id: "AADemo",
      user: {
        id: 99281932,
        is_bot: false,
        first_name: "Anna",
        last_name: "Karlova",
        username: "annak",
        language_code: "en",
        is_premium: true,
        allows_write_to_pm: true,
      },
      chat: { id: -10023456, type: "supergroup", title: "UIKit builders" },
      chat_type: "supergroup",
      chat_instance: "demo-chat-instance",
      start_param: "platform_lab",
      can_send_after: 0,
      auth_date: 1718000000,
      hash: "demo-not-valid",
      signature: "demo-signature-not-valid",
    },
    MainButton: mainButton,
    SecondaryButton: secondaryButton,
    BackButton: backButton,
    SettingsButton: settingsButton,
    HapticFeedback: {
      impactOccurred: (style) => haptic(`impact · ${style}`),
      notificationOccurred: (type) => haptic(`notification · ${type}`),
      selectionChanged: () => haptic("selection"),
    },
    CloudStorage: makeStorage(CLOUD_PREFIX, "CloudStorage"),
    DeviceStorage: makeStorage(DEVICE_PREFIX, "DeviceStorage"),
    SecureStorage: secureStorage,
    BiometricManager: biometricManager,
    LocationManager: {
      isInited: true,
      isLocationAvailable: true,
      isAccessGranted: true,
      init: (cb) => {
        log("LocationManager.init()");
        dispatch("locationManagerUpdated");
        cb?.();
      },
      getLocation: (cb) => {
        const locationData = {
          latitude: 55.751244,
          longitude: 37.618423,
          altitude: 144,
          course: 90,
          speed: 0,
          horizontal_accuracy: 12,
          vertical_accuracy: 6,
          course_accuracy: 15,
          speed_accuracy: 1,
        };
        log("LocationManager.getLocation()");
        dispatch("locationRequested", { locationData });
        cb?.(locationData);
      },
      openSettings: () => log("LocationManager.openSettings()"),
    },
    Accelerometer: accelerometerSensor,
    DeviceOrientation: deviceOrientationSensor,
    Gyroscope: gyroscopeSensor,
    onEvent: (event, handler) => {
      if (!handlers.has(event)) handlers.set(event, new Set());
      handlers.get(event)!.add(handler);
    },
    offEvent: (event, handler) => {
      handlers.get(event)?.delete(handler);
    },
    ready: () => log("ready()"),
    expand: () => {
      if (state.isExpanded) return;
      log("expand()");
      commit(
        { isExpanded: true, viewportHeight: state.maxHeight, viewportStableHeight: state.maxHeight },
        ["viewportChanged"],
      );
    },
    close: () => {
      if (state.closingConfirmation) {
        showPopup(
          {
            title: "Close the app?",
            message: "Changes that you made may not be saved.",
            buttons: [
              { id: "close", type: "destructive", text: "Close anyway" },
              { id: "cancel", type: "cancel", text: "Cancel" },
            ],
          },
          (id) => {
            if (id === "close") doClose();
          },
        );
      } else {
        doClose();
      }
    },
    requestFullscreen: () => {
      if (state.isFullscreen) return;
      log("requestFullscreen()");
      commit(
        {
          isFullscreen: true,
          isExpanded: true,
          viewportHeight: state.maxHeight,
          viewportStableHeight: state.maxHeight,
          contentSafeAreaInset: CHROME,
        },
        ["fullscreenChanged", "viewportChanged", "contentSafeAreaChanged"],
      );
    },
    exitFullscreen: () => {
      if (!state.isFullscreen) return;
      log("exitFullscreen()");
      commit({ isFullscreen: false, contentSafeAreaInset: ZERO }, ["fullscreenChanged", "contentSafeAreaChanged"]);
    },
    lockOrientation: () => {
      log("lockOrientation()");
      commit({ orientationLocked: true });
    },
    unlockOrientation: () => {
      log("unlockOrientation()");
      commit({ orientationLocked: false });
    },
    enableVerticalSwipes: () => {
      log("enableVerticalSwipes()");
      commit({ verticalSwipes: true });
    },
    disableVerticalSwipes: () => {
      log("disableVerticalSwipes()");
      commit({ verticalSwipes: false });
    },
    setHeaderColor: (color) => {
      log(`setHeaderColor("${color}")`);
      commit({ headerColor: color });
    },
    setBackgroundColor: (color) => {
      log(`setBackgroundColor("${color}")`);
      commit({ backgroundColor: color });
    },
    setBottomBarColor: (color) => {
      log(`setBottomBarColor("${color}")`);
      commit({ bottomBarColor: color });
    },
    hideKeyboard: () => log("hideKeyboard()"),
    enableClosingConfirmation: () => {
      log("enableClosingConfirmation()");
      commit({ closingConfirmation: true });
    },
    disableClosingConfirmation: () => {
      log("disableClosingConfirmation()");
      commit({ closingConfirmation: false });
    },
    showPopup,
    showAlert: (message, cb) =>
      showPopup({ message, buttons: [{ id: "ok", type: "close", text: "Close" }] }, () => cb?.()),
    showConfirm: (message, cb) =>
      showPopup(
        {
          message,
          buttons: [
            { id: "ok", type: "ok", text: "OK" },
            { id: "cancel", type: "cancel", text: "Cancel" },
          ],
        },
        (id) => cb?.(id === "ok"),
      ),
    showScanQrPopup: (params, cb) => {
      log(`showScanQrPopup("${params.text ?? ""}")`);
      window.setTimeout(() => {
        const data = "tg://demo/qr-result";
        dispatch("qrTextReceived", { data });
        cb?.(data);
      }, 250);
    },
    closeScanQrPopup: () => {
      log("closeScanQrPopup()");
      dispatch("scanQrPopupClosed");
    },
    readTextFromClipboard: (cb) => {
      log("readTextFromClipboard()");
      const data = "demo clipboard text";
      dispatch("clipboardTextReceived", { data });
      cb?.(data);
    },
    openLink: (url) => log(`openLink("${url}")`),
    openTelegramLink: (url) => log(`openTelegramLink("${url}")`),
    openInvoice: (url, cb) => {
      log(`openInvoice("${url}")`);
      window.setTimeout(() => {
        dispatch("invoiceClosed", { url, status: "paid" });
        cb?.("paid");
      }, 300);
    },
    shareMessage: (msgId, cb) => {
      log(`shareMessage("${msgId}")`);
      dispatch("shareMessageSent");
      cb?.(true);
    },
    shareToStory: (mediaUrl) => log(`shareToStory("${mediaUrl}")`),
    downloadFile: (params, cb) => {
      log(`downloadFile("${params.file_name ?? params.url}")`);
      dispatch("fileDownloadRequested", { status: "downloading" });
      cb?.(true);
    },
    sendData: (data) => log(`sendData("${data}")`),
    switchInlineQuery: (query) => log(`switchInlineQuery("${query}")`),
    requestContact: (cb) => {
      log("requestContact()");
      dispatch("contactRequested", { status: "sent" });
      cb?.(true);
    },
    requestWriteAccess: (cb) => {
      log("requestWriteAccess()");
      dispatch("writeAccessRequested", { status: "allowed" });
      cb?.(true);
    },
    addToHomeScreen: () => {
      log("addToHomeScreen()");
      commit({ homeScreenStatus: "added" }, ["homeScreenAdded"]);
    },
    checkHomeScreenStatus: (cb) => {
      log("checkHomeScreenStatus()");
      dispatch("homeScreenChecked", { status: state.homeScreenStatus });
      cb?.(state.homeScreenStatus);
    },
    setEmojiStatus: (_customEmojiId, _params, cb) => {
      log("setEmojiStatus()");
      dispatch("emojiStatusSet");
      cb?.(true);
    },
    requestEmojiStatusAccess: (cb) => {
      log("requestEmojiStatusAccess()");
      dispatch("emojiStatusAccessRequested", { status: "allowed" });
      cb?.(true);
    },
    requestChat: (reqId, cb) => {
      log(`requestChat("${reqId}")`);
      cb?.(true);
    },
    isVersionAtLeast: () => true,
  };

  syncWebApp();

  return {
    webApp,
    getState: () => state,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setColorScheme: (scheme) => {
      if (scheme === state.colorScheme) return;
      commit({ colorScheme: scheme, themeParams: THEMES[scheme] }, ["themeChanged"]);
    },
    setDeviceCutouts: (on) => {
      commit({ safeAreaInset: on ? CUTOUTS : ZERO }, ["safeAreaChanged"]);
    },
    setChromeInset: (on) => {
      commit({ contentSafeAreaInset: on ? CHROME : ZERO }, ["contentSafeAreaChanged"]);
    },
    setViewportBounds: (maxHeight) => {
      if (maxHeight <= 0 || maxHeight === state.maxHeight) return;
      const height = state.isExpanded ? maxHeight : collapsedOf(maxHeight);
      commit(
        { maxHeight, viewportHeight: height, viewportStableHeight: height },
        state.viewportHeight === height ? [] : ["viewportChanged"],
      );
    },
    collapse: () => {
      if (!state.isExpanded) return;
      const height = collapsedOf(state.maxHeight);
      commit({ isExpanded: false, viewportHeight: height, viewportStableHeight: height }, ["viewportChanged"]);
    },
    dragViewport: (height) => {
      const clamped = Math.round(Math.min(state.maxHeight, Math.max(collapsedOf(state.maxHeight), height)));
      if (clamped === state.viewportHeight) return;
      // The real client fires viewportChanged on every frame of the gesture
      // (isStateStable=false) — keep them out of the log to avoid the spam.
      state = { ...state, viewportHeight: clamped };
      syncWebApp();
      dispatch("viewportChanged", undefined, true);
      notify();
    },
    endViewportDrag: () => {
      const min = collapsedOf(state.maxHeight);
      const expanded = state.viewportHeight >= (min + state.maxHeight) / 2;
      const height = expanded ? state.maxHeight : min;
      log(`user · drag → ${expanded ? "expanded" : "compact"}`);
      commit({ isExpanded: expanded, viewportHeight: height, viewportStableHeight: height }, ["viewportChanged"]);
    },
    clickMain: () => {
      if (!state.main.active || state.main.progress) return;
      log("user · tap MainButton");
      fireClicks(mainButton);
      notify();
    },
    clickSecondary: () => {
      if (!state.secondary.active || state.secondary.progress) return;
      log("user · tap SecondaryButton");
      fireClicks(secondaryButton);
      notify();
    },
    clickBack: () => {
      log("user · tap BackButton");
      fireClicks(backButton);
      notify();
    },
    clickSettings: () => {
      log("user · tap SettingsButton");
      fireClicks(settingsButton);
      notify();
    },
    resolvePopup: (buttonId) => {
      const popup = state.popup;
      if (!popup) return;
      log(`popup → "${buttonId ?? "dismissed"}"`);
      commit({ popup: null });
      popup.callback?.(buttonId);
    },
    relaunch: () => {
      log("user · relaunch");
      commit({ closed: false });
    },
  };
}
