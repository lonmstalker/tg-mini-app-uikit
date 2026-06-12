import type {
  TelegramMainButton,
  TelegramPopupParams,
  TelegramSafeAreaInset,
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
}

export interface MockPopupState {
  params: TelegramPopupParams;
  callback?: (buttonId?: string) => void;
}

export interface MockTelegramState {
  colorScheme: "light" | "dark";
  themeParams: TelegramThemeParams;
  isExpanded: boolean;
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
    hint_color: "#5d6c7b",
    link_color: "#3390ec",
    accent_text_color: "#3390ec",
    button_color: "#3390ec",
    button_text_color: "#ffffff",
    destructive_text_color: "#ff6166",
  },
};

const CLOUD_PREFIX = "tg-demo-cloud:";

export function createMockTelegram(): MockTelegram {
  const collapsedOf = (max: number) => Math.round(max * 0.62);

  let state: MockTelegramState = {
    colorScheme: "light",
    themeParams: THEMES.light,
    isExpanded: false,
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
    webApp.isExpanded = state.isExpanded;
    webApp.viewportHeight = state.viewportHeight;
    webApp.viewportStableHeight = state.viewportStableHeight;
    webApp.safeAreaInset = state.safeAreaInset;
    webApp.contentSafeAreaInset = state.contentSafeAreaInset;
    mainButton.text = state.main.text;
    mainButton.isVisible = state.main.visible;
    mainButton.isActive = state.main.active;
    mainButton.isProgressVisible = state.main.progress;
    secondaryButton.text = state.secondary.text;
    secondaryButton.isVisible = state.secondary.visible;
    secondaryButton.isActive = state.secondary.active;
    secondaryButton.isProgressVisible = state.secondary.progress;
    backButton.isVisible = state.back.visible;
    settingsButton.isVisible = state.settings.visible;
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
      setParams: (params) =>
        patch(
          {
            ...(params.text != null ? { text: params.text } : {}),
            ...(params.color != null ? { color: params.color } : {}),
            ...(params.text_color != null ? { textColor: params.text_color } : {}),
            ...(params.is_visible != null ? { visible: params.is_visible } : {}),
            ...(params.is_active != null ? { active: params.is_active } : {}),
          },
          "setParams(…)",
        ),
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

  const webApp: TelegramWebApp = {
    version: "8.0",
    platform: "ios",
    colorScheme: state.colorScheme,
    themeParams: state.themeParams,
    initData: "query_id=AADemo&user=%7B%22id%22%3A99281932%7D&auth_date=1718000000&hash=demo-not-valid",
    initDataUnsafe: {
      user: { id: 99281932, first_name: "Anna", last_name: "Karlova", username: "annak", language_code: "en", is_premium: true },
      start_param: "platform_lab",
      auth_date: 1718000000,
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
    CloudStorage: {
      setItem: (key, value, cb) => {
        localStorage.setItem(CLOUD_PREFIX + key, value);
        log(`CloudStorage.setItem("${key}")`);
        notify();
        cb?.(null, true);
      },
      getItem: (key, cb) => {
        log(`CloudStorage.getItem("${key}")`);
        notify();
        cb(null, localStorage.getItem(CLOUD_PREFIX + key));
      },
      removeItem: (key, cb) => {
        localStorage.removeItem(CLOUD_PREFIX + key);
        log(`CloudStorage.removeItem("${key}")`);
        notify();
        cb?.(null, true);
      },
      getKeys: (cb) => {
        const keys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k?.startsWith(CLOUD_PREFIX)) keys.push(k.slice(CLOUD_PREFIX.length));
        }
        cb(null, keys);
      },
    },
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
    openLink: (url) => log(`openLink("${url}")`),
    openTelegramLink: (url) => log(`openTelegramLink("${url}")`),
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
