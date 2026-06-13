import type { TelegramPopupParams, TelegramWebApp } from "tg-mini-app-uikit";
import { fireClicks, makeBigButton, makeSmallButton } from "./mock/buttons";
import { makeBiometricManager } from "./mock/biometrics";
import { makeSensor, syncSensor } from "./mock/sensors";
import { makeSecureStorage, makeStorage } from "./mock/storage";
import { CHROME, CLOUD_PREFIX, CUTOUTS, DEVICE_PREFIX, THEMES, ZERO, resolveMockColors } from "./mock/theme";
import type { MockTelegram, MockTelegramState } from "./mock/types";

export type {
  MockButtonState,
  MockPopupState,
  MockSensorKey,
  MockSensorState,
  MockSensorValues,
  MockTelegram,
  MockTelegramState,
} from "./mock/types";
export { resolveMockColors } from "./mock/theme";

/*
 * In-memory implementation of the Telegram WebApp API. The demo injects it
 * via `<TKTelegramProvider webApp={…}>`, so every kit hook (useMainButton,
 * useViewport, useTelegramPopup, …) runs against it exactly like against
 * the real `window.Telegram.WebApp` — and the Platform Lab renders the
 * "client side" (chrome, buttons, popups) that Telegram would render.
 */

export function createMockTelegram(init?: { colorScheme?: "light" | "dark" }): MockTelegram {
  const collapsedOf = (max: number) => Math.round(max * 0.62);
  const scheme = init?.colorScheme ?? "light";

  let state: MockTelegramState = {
    colorScheme: scheme,
    themeParams: THEMES[scheme],
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

  const buttonCtx = { log, getState: () => state, commit };
  const mainButton = makeBigButton("main", "MainButton", buttonCtx);
  const secondaryButton = makeBigButton("secondary", "SecondaryButton", buttonCtx);
  const backButton = makeSmallButton("back", "BackButton", buttonCtx);
  const settingsButton = makeSmallButton("settings", "SettingsButton", buttonCtx);

  const sensorCtx = { log, getState: () => state, commit };
  const accelerometerSensor = makeSensor("accelerometer", "Accelerometer", sensorCtx);
  const deviceOrientationSensor = makeSensor("deviceOrientation", "DeviceOrientation", sensorCtx);
  const gyroscopeSensor = makeSensor("gyroscope", "Gyroscope", sensorCtx);

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

  const storageCtx = { log, notify };
  const secureStorage = makeSecureStorage(storageCtx);
  const biometricManager = makeBiometricManager({ log, dispatch });

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
    CloudStorage: makeStorage(CLOUD_PREFIX, "CloudStorage", storageCtx),
    DeviceStorage: makeStorage(DEVICE_PREFIX, "DeviceStorage", storageCtx),
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
