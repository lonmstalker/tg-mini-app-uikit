import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createMockTelegram } from "../../../examples/demo/src/telegram/mock";
import {
  useActivity,
  useBiometrics,
  useChatRequest,
  useClipboard,
  useClosingConfirmation,
  useCloudStorage,
  useContactRequest,
  useDataTransport,
  useDeviceStorage,
  useDownloadFile,
  useEmojiStatus,
  useFullscreen,
  useHaptics,
  useHideKeyboard,
  useHomeScreen,
  useInitData,
  useInvoice,
  useKeyboard,
  useLocation,
  useMainButton,
  useMotionSensors,
  useOrientationLock,
  useQrScanner,
  useSecondaryButton,
  useSecureStorage,
  useShare,
  useTelegramColors,
  useTelegramLinks,
  useTelegramPopup,
  useVerticalSwipes,
  useWebApp,
  useWriteAccess,
  type TelegramWebApp,
} from "../src/telegram";
import { wrapperFor } from "./helpers/telegram";

/* ---------------- Capability gates ---------------- */

describe("isSupported gates on a bare WebApp", () => {
  const bare = wrapperFor({});

  it("useFullscreen does nothing and returns false", () => {
    const { result } = renderHook(() => useFullscreen(), { wrapper: bare });
    expect(result.current.isSupported).toBe(false);
    expect(result.current.request()).toBe(false);
    expect(result.current.exit()).toBe(false);
  });

  it("useTelegramColors returns false for every setter", () => {
    const { result } = renderHook(() => useTelegramColors(), { wrapper: bare });
    expect(result.current.isSupported).toBe(false);
    expect(result.current.setHeaderColor("#fff")).toBe(false);
    expect(result.current.setBackgroundColor("#fff")).toBe(false);
    expect(result.current.setBottomBarColor("#fff")).toBe(false);
  });

  it("useInvoice resolves to 'unsupported'", async () => {
    const { result } = renderHook(() => useInvoice(), { wrapper: bare });
    expect(result.current.isSupported).toBe(false);
    await expect(result.current.open("https://t.me/invoice")).resolves.toBe("unsupported");
  });

  it("useDataTransport returns false", () => {
    const { result } = renderHook(() => useDataTransport(), { wrapper: bare });
    expect(result.current.isSupported).toBe(false);
    expect(result.current.sendData("x")).toBe(false);
    expect(result.current.switchInlineQuery("q")).toBe(false);
  });

  it("permission, clipboard, QR and identity-related hooks degrade explicitly", async () => {
    const { result } = renderHook(
      () => ({
        contact: useContactRequest(),
        write: useWriteAccess(),
        clipboard: useClipboard(),
        qr: useQrScanner(),
        home: useHomeScreen(),
        emoji: useEmojiStatus(),
        download: useDownloadFile(),
        chat: useChatRequest(),
        location: useLocation(),
      }),
      { wrapper: bare },
    );

    await act(async () => {
      await expect(result.current.contact.request()).resolves.toBe(false);
      await expect(result.current.write.request()).resolves.toBe(false);
      await expect(result.current.clipboard.readText()).resolves.toBe(null);
      await expect(result.current.qr.open()).resolves.toBe(null);
      await expect(result.current.home.check()).resolves.toBe("unsupported");
      await expect(result.current.emoji.set("emoji")).resolves.toBe(false);
      await expect(result.current.emoji.requestAccess()).resolves.toBe(false);
      await expect(result.current.download.download({ url: "https://example.com/file.txt" })).resolves.toBe(true);
      await expect(result.current.chat.request("req")).resolves.toBe(false);
      await expect(result.current.location.init()).resolves.toBe(false);
      await expect(result.current.location.getLocation()).resolves.toBe(null);
    });

    expect(result.current.qr.close()).toBe(false);
    expect(result.current.location.openSettings()).toBe(false);
  });

  it("useBiometrics resolves to a failure and reports UNSUPPORTED", async () => {
    const { result } = renderHook(() => useBiometrics(), { wrapper: bare });
    expect(result.current.isSupported).toBe(false);
    expect(result.current.status).toBe("unsupported");
    let res: { ok: boolean; token?: string } | undefined;
    await act(async () => {
      res = await result.current.authenticate();
    });
    expect(res).toEqual({ ok: false });
    expect(result.current.error).toBe("UNSUPPORTED");
  });
});

/* ---------------- Promisification of callback APIs ---------------- */

describe("promisified callback APIs", () => {
  it("CloudStorage roundtrip resolves through the mock", async () => {
    const mock = createMockTelegram();
    const { result } = renderHook(() => useCloudStorage(), { wrapper: wrapperFor(mock.webApp) });

    expect(result.current.isSupported).toBe(true);
    await result.current.set("k", "v");
    expect(await result.current.get("k")).toBe("v");
    expect(await result.current.getMany(["k", "nope"])).toEqual({ k: "v", nope: null });
    expect(await result.current.keys()).toEqual(["k"]);
    await result.current.remove("k");
    expect(await result.current.get("k")).toBe(null);
  });

  it("CloudStorage rejects when the callback reports an error", async () => {
    const failing: TelegramWebApp = {
      CloudStorage: {
        setItem: (_k, _v, cb) => cb?.(new Error("set boom"), false),
        getItem: (_k, cb) => cb(new Error("get boom")),
      },
    };
    const { result } = renderHook(() => useCloudStorage(), { wrapper: wrapperFor(failing) });

    expect(result.current.isSupported).toBe(true);
    await expect(result.current.get("k")).rejects.toThrow("get boom");
    await expect(result.current.set("k", "v")).rejects.toThrow("set boom");
  });

  it("DeviceStorage and SecureStorage expose namespaced storage helpers", async () => {
    const mock = createMockTelegram();
    const { result } = renderHook(
      () => ({
        device: useDeviceStorage(),
        secure: useSecureStorage(),
      }),
      { wrapper: wrapperFor(mock.webApp) },
    );

    await act(async () => {
      await result.current.device.set("theme", "dark");
      await result.current.secure.set("token", "secret");
    });

    await expect(result.current.device.get("theme")).resolves.toBe("dark");
    await expect(result.current.secure.get("token")).resolves.toBe("secret");
    await expect(result.current.secure.restore?.("token")).resolves.toBe("secret");
    await act(async () => {
      await result.current.device.clear?.();
      await result.current.secure.clear?.();
    });
    await expect(result.current.device.keys()).resolves.toEqual([]);
  });

  it("invoice callback resolves the promise with the status", async () => {
    vi.useFakeTimers();
    const mock = createMockTelegram();
    const { result } = renderHook(() => useInvoice(), { wrapper: wrapperFor(mock.webApp) });

    expect(result.current.isSupported).toBe(true);
    const status = result.current.open("https://t.me/$invoice");
    await vi.advanceTimersByTimeAsync(300);
    await expect(status).resolves.toBe("paid");
  });

  it("biometrics authenticate resolves with the token", async () => {
    const mock = createMockTelegram();
    const { result } = renderHook(() => useBiometrics(), { wrapper: wrapperFor(mock.webApp) });

    let res: { ok: boolean; token?: string } | undefined;
    await act(async () => {
      res = await result.current.authenticate("login");
    });
    expect(res).toEqual({ ok: true, token: "demo-token" });
    expect(result.current.status).toBe("success");
  });

  it("biometrics init, access, token update and settings map status", async () => {
    const mock = createMockTelegram();
    const { result } = renderHook(() => useBiometrics(), { wrapper: wrapperFor(mock.webApp) });

    await act(async () => {
      await expect(result.current.init()).resolves.toBe(true);
      await expect(result.current.requestAccess("unlock")).resolves.toBe(true);
      await expect(result.current.updateToken("next-token")).resolves.toBe(true);
    });
    expect(result.current.openSettings()).toBe(true);
    expect(result.current.status).toBe("success");
  });

  it("biometrics failure maps to AUTH_FAILED", async () => {
    const webApp: TelegramWebApp = {
      BiometricManager: { authenticate: (_params, cb) => cb?.(false) },
    };
    const { result } = renderHook(() => useBiometrics(), { wrapper: wrapperFor(webApp) });

    let res: { ok: boolean; token?: string } | undefined;
    await act(async () => {
      res = await result.current.authenticate();
    });
    expect(res).toEqual({ ok: false, token: undefined });
    expect(result.current.status).toBe("error");
    expect(result.current.error).toBe("AUTH_FAILED");
  });

  it("native confirm popup resolves when the client answers", async () => {
    const mock = createMockTelegram();
    const { result } = renderHook(() => useTelegramPopup(), { wrapper: wrapperFor(mock.webApp) });

    expect(result.current.isSupported).toBe(true);
    const answer = result.current.confirm("Delete everything?");
    expect(mock.getState().popup?.params.message).toBe("Delete everything?");

    act(() => mock.resolvePopup("ok"));
    await expect(answer).resolves.toBe(true);

    const declined = result.current.confirm("Again?");
    act(() => mock.resolvePopup("cancel"));
    await expect(declined).resolves.toBe(false);
  });
});

/* ---------------- window.Telegram.WebApp discovery ---------------- */

describe("window.Telegram.WebApp", () => {
  it("hooks pick up the global WebApp without a provider", () => {
    const mock = createMockTelegram();
    (window as unknown as { Telegram?: { WebApp?: TelegramWebApp } }).Telegram = { WebApp: mock.webApp };

    const { result } = renderHook(() => useWebApp());
    expect(result.current).toBe(mock.webApp);

    const { result: init } = renderHook(() => useInitData());
    expect(init.current.user?.first_name).toBe("Anna");
    expect(init.current.startParam).toBe("platform_lab");
  });

  it("haptics map onto HapticFeedback", () => {
    const mock = createMockTelegram();
    const { result } = renderHook(() => useHaptics(), { wrapper: wrapperFor(mock.webApp) });

    expect(result.current.isSupported).toBe(true);
    act(() => result.current.impact("heavy"));
    expect(mock.getState().haptic?.kind).toBe("impact · heavy");
    act(() => result.current.notification("error"));
    expect(mock.getState().haptic?.kind).toBe("notification · error");
  });

  it("activity follows activated/deactivated events", () => {
    const handlers = new Map<string, () => void>();
    const webApp: TelegramWebApp = {
      isActive: true,
      onEvent: (event, handler) => {
        handlers.set(event, handler as () => void);
      },
      offEvent: (event) => {
        handlers.delete(event);
      },
    };
    const { result } = renderHook(() => useActivity(), { wrapper: wrapperFor(webApp) });

    expect(result.current.isActive).toBe(true);
    act(() => handlers.get("deactivated")?.());
    expect(result.current.isActive).toBe(false);
    act(() => handlers.get("activated")?.());
    expect(result.current.isActive).toBe(true);
  });
});

/* ---------------- WebApp state fields (colors, flags, sensors) ---------------- */

describe("useTelegramColors state", () => {
  it("reflects the WebApp color fields and updates after each setter", () => {
    const mock = createMockTelegram();
    const { result } = renderHook(() => useTelegramColors(), { wrapper: wrapperFor(mock.webApp) });

    expect(result.current.headerColor).toBe("#ffffff");
    expect(result.current.bottomBarColor).toBe("#f2f4f8");

    let ok = false;
    act(() => {
      ok = result.current.setHeaderColor("#112233");
    });
    expect(ok).toBe(true);
    expect(result.current.headerColor).toBe("#112233");
    expect(mock.webApp.headerColor).toBe("#112233");

    act(() => {
      result.current.setBackgroundColor("secondary_bg_color");
    });
    expect(result.current.backgroundColor).toBe("#eef1f6"); // keyword resolved against the light theme
  });

  it("keyword colors follow themeChanged", () => {
    const mock = createMockTelegram();
    const { result } = renderHook(() => useTelegramColors(), { wrapper: wrapperFor(mock.webApp) });

    act(() => {
      result.current.setHeaderColor("bg_color");
    });
    expect(result.current.headerColor).toBe("#ffffff");

    act(() => mock.setColorScheme("dark"));
    expect(result.current.headerColor).toBe("#17212b");
  });
});

describe("useVerticalSwipes / useOrientationLock state", () => {
  it("mirrors isVerticalSwipesEnabled through enable/disable", () => {
    const mock = createMockTelegram();
    const { result } = renderHook(() => useVerticalSwipes(), { wrapper: wrapperFor(mock.webApp) });

    expect(result.current.isEnabled).toBe(true);
    act(() => {
      expect(result.current.disable()).toBe(true);
    });
    expect(result.current.isEnabled).toBe(false);
    expect(mock.webApp.isVerticalSwipesEnabled).toBe(false);

    act(() => {
      result.current.enable();
    });
    expect(result.current.isEnabled).toBe(true);
    expect(mock.webApp.isVerticalSwipesEnabled).toBe(true);
  });

  it("mirrors isOrientationLocked through lock/unlock", () => {
    const mock = createMockTelegram();
    const { result } = renderHook(() => useOrientationLock(), { wrapper: wrapperFor(mock.webApp) });

    expect(result.current.isLocked).toBe(false);
    act(() => {
      expect(result.current.lock()).toBe(true);
    });
    expect(result.current.isLocked).toBe(true);
    expect(mock.getState().orientationLocked).toBe(true);

    act(() => {
      result.current.unlock();
    });
    expect(result.current.isLocked).toBe(false);
    expect(mock.webApp.isOrientationLocked).toBe(false);
  });
});

describe("useClosingConfirmation", () => {
  it("drives isClosingConfirmationEnabled and resets on unmount", () => {
    const mock = createMockTelegram();
    const { unmount } = renderHook(() => useClosingConfirmation(true), { wrapper: wrapperFor(mock.webApp) });

    expect(mock.webApp.isClosingConfirmationEnabled).toBe(true);
    unmount();
    expect(mock.webApp.isClosingConfirmationEnabled).toBe(false);
  });
});

describe("motion sensors", () => {
  it("device orientation honours needAbsolute and mirrors readings", async () => {
    const mock = createMockTelegram();
    const { result } = renderHook(() => useMotionSensors(), { wrapper: wrapperFor(mock.webApp) });

    let ok = false;
    await act(async () => {
      ok = await result.current.deviceOrientation.start(60, { needAbsolute: true });
    });
    expect(ok).toBe(true);
    expect(mock.getState().sensors.deviceOrientation).toMatchObject({
      isStarted: true,
      refreshRate: 60,
      absolute: true,
    });
    expect(mock.webApp.DeviceOrientation).toMatchObject({ isStarted: true, absolute: true, alpha: 0.66 });

    await act(async () => {
      await result.current.deviceOrientation.stop();
    });
    expect(mock.getState().sensors.deviceOrientation.isStarted).toBe(false);
    expect(mock.webApp.DeviceOrientation?.isStarted).toBe(false);
  });

  it("accelerometer exposes fixed readings while started", async () => {
    const mock = createMockTelegram();
    const { result } = renderHook(() => useMotionSensors(), { wrapper: wrapperFor(mock.webApp) });

    await act(async () => {
      await result.current.accelerometer.start(30);
    });
    expect(mock.webApp.Accelerometer).toMatchObject({ isStarted: true, x: 0.12, y: 9.77, z: 0.34 });
  });

  it("gyroscope starts and every sensor stops on unmount", async () => {
    const mock = createMockTelegram();
    const { result, unmount } = renderHook(() => useMotionSensors(), { wrapper: wrapperFor(mock.webApp) });

    await act(async () => {
      await expect(result.current.gyroscope.start()).resolves.toBe(true);
    });
    expect(mock.webApp.Gyroscope?.isStarted).toBe(true);

    unmount();
    expect(mock.webApp.Gyroscope?.isStarted).toBe(false);
  });
});

describe("expanded Telegram capabilities", () => {
  it("native share paths map failed messages and story widget links", async () => {
    const shareMessage = vi.fn((_messageId: string, cb?: (ok: boolean) => void) => cb?.(false));
    const shareToStory = vi.fn();
    const { result } = renderHook(() => useShare(), {
      wrapper: wrapperFor({ shareMessage, shareToStory }),
    });

    await act(async () => {
      await expect(result.current.shareMessage("msg-1")).resolves.toBe(false);
    });
    expect(result.current.status).toBe("error");
    expect(result.current.error).toBe("MESSAGE_SEND_FAILED");

    await act(async () => {
      await expect(
        result.current.shareToStory("https://example.com/story.png", {
          text: "Story",
          widgetLink: { url: "https://example.com", name: "Open" },
        }),
      ).resolves.toBe(true);
    });
    expect(shareToStory).toHaveBeenCalledWith("https://example.com/story.png", {
      text: "Story",
      widget_link: { url: "https://example.com", name: "Open" },
    });
    expect(result.current.status).toBe("success");
  });

  it("fullscreen request/exit and failure events update state", () => {
    const handlers = new Map<string, (payload?: { error?: "UNSUPPORTED" }) => void>();
    const webApp: TelegramWebApp = {
      isFullscreen: false,
      requestFullscreen: vi.fn(function (this: TelegramWebApp) {
        this.isFullscreen = true;
        handlers.get("fullscreenChanged")?.();
      }),
      exitFullscreen: vi.fn(function (this: TelegramWebApp) {
        this.isFullscreen = false;
        handlers.get("fullscreenChanged")?.();
      }),
      onEvent: (event, handler) => {
        handlers.set(event, handler as (payload?: { error?: "UNSUPPORTED" }) => void);
      },
      offEvent: (event) => {
        handlers.delete(event);
      },
    };
    const { result } = renderHook(() => useFullscreen(), { wrapper: wrapperFor(webApp) });

    act(() => {
      expect(result.current.request()).toBe(true);
    });
    expect(result.current.isFullscreen).toBe(true);
    act(() => handlers.get("fullscreenFailed")?.({ error: "UNSUPPORTED" }));
    expect(result.current.lastError).toBe("UNSUPPORTED");
    act(() => {
      expect(result.current.exit()).toBe(true);
    });
    expect(result.current.isFullscreen).toBe(false);
  });

  it("data transport uses native sendData and switchInlineQuery when present", () => {
    const sendData = vi.fn();
    const switchInlineQuery = vi.fn();
    const { result } = renderHook(() => useDataTransport(), {
      wrapper: wrapperFor({ sendData, switchInlineQuery }),
    });

    expect(result.current.isSupported).toBe(true);
    expect(result.current.sendData("payload")).toBe(true);
    expect(result.current.switchInlineQuery("query", ["users", "bots"])).toBe(true);
    expect(sendData).toHaveBeenCalledWith("payload");
    expect(switchInlineQuery).toHaveBeenCalledWith("query", ["users", "bots"]);
  });

  it("keyboard helpers mirror visualViewport overlap and blur active elements", () => {
    const listeners = new Map<string, () => void>();
    const visualViewport = {
      height: 600,
      offsetTop: 0,
      addEventListener: vi.fn((event: string, handler: () => void) => listeners.set(event, handler)),
      removeEventListener: vi.fn((event: string) => listeners.delete(event)),
    };
    Object.defineProperty(window, "innerHeight", { value: 800, configurable: true });
    Object.defineProperty(window, "visualViewport", { value: visualViewport, configurable: true });
    const root = document.createElement("div");
    root.className = "tk";
    document.body.append(root);

    const { result, unmount } = renderHook(() => useKeyboard(80));
    expect(result.current).toEqual({ visible: true, height: 200 });
    expect(root.classList.contains("tk-kb-open")).toBe(true);

    act(() => {
      visualViewport.height = 760;
      listeners.get("resize")?.();
    });
    expect(result.current).toEqual({ visible: false, height: 0 });
    expect(root.classList.contains("tk-kb-open")).toBe(false);
    unmount();
    expect(visualViewport.removeEventListener).toHaveBeenCalledWith("resize", expect.any(Function));

    const input = document.createElement("input");
    document.body.append(input);
    input.focus();
    const { result: hide } = renderHook(() => useHideKeyboard());
    expect(hide.current.isSupported).toBe(false);
    expect(hide.current.hide()).toBe(true);
    expect(document.activeElement).not.toBe(input);
  });

  it("requests contact and write access through the client callbacks", async () => {
    const mock = createMockTelegram();
    const { result } = renderHook(
      () => ({
        contact: useContactRequest(),
        write: useWriteAccess(),
      }),
      { wrapper: wrapperFor(mock.webApp) },
    );

    await act(async () => {
      await expect(result.current.contact.request()).resolves.toBe(true);
      await expect(result.current.write.request()).resolves.toBe(true);
    });
    expect(result.current.contact.status).toBe("success");
    expect(result.current.write.status).toBe("success");
  });

  it("clipboard and QR scanner resolve native callback payloads", async () => {
    vi.useFakeTimers();
    const mock = createMockTelegram();
    const onText = vi.fn().mockReturnValue(true);
    const { result, unmount } = renderHook(
      () => ({
        clipboard: useClipboard(),
        qr: useQrScanner(),
      }),
      { wrapper: wrapperFor(mock.webApp) },
    );

    await act(async () => {
      await expect(result.current.clipboard.readText()).resolves.toBe("demo clipboard text");
    });
    const qr = result.current.qr.open({ text: "Scan code" }, onText);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(250);
    });
    await expect(qr).resolves.toBe("tg://demo/qr-result");
    expect(onText).toHaveBeenCalledWith("tg://demo/qr-result");
    expect(result.current.qr.close()).toBe(true);
    unmount();
  });

  it("home screen, emoji status, download and chat requests map callbacks", async () => {
    const mock = createMockTelegram();
    const { result } = renderHook(
      () => ({
        home: useHomeScreen(),
        emoji: useEmojiStatus(),
        download: useDownloadFile(),
        chat: useChatRequest(),
      }),
      { wrapper: wrapperFor(mock.webApp) },
    );

    act(() => {
      expect(result.current.home.add()).toBe(true);
    });
    await act(async () => {
      await expect(result.current.home.check()).resolves.toBe("added");
      await expect(result.current.emoji.requestAccess()).resolves.toBe(true);
      await expect(result.current.emoji.set("5368324170671202286", { duration: 60 })).resolves.toBe(true);
      await expect(result.current.download.download({ url: "https://example.com/report.pdf", fileName: "report.pdf" })).resolves.toBe(true);
      await expect(result.current.chat.request("req-1")).resolves.toBe(true);
    });

    expect(result.current.home.status).toBe("added");
    expect(result.current.emoji.status).toBe("success");
    expect(result.current.download.status).toBe("success");
    expect(result.current.chat.status).toBe("success");
  });

  it("location init/getLocation/openSettings map LocationManager", async () => {
    const mock = createMockTelegram();
    const { result } = renderHook(() => useLocation(), { wrapper: wrapperFor(mock.webApp) });

    await act(async () => {
      await expect(result.current.init()).resolves.toBe(true);
      await expect(result.current.getLocation()).resolves.toMatchObject({ latitude: 55.751244, longitude: 37.618423 });
    });
    expect(result.current.openSettings()).toBe(true);
    expect(result.current.status).toBe("success");
  });

  it("Telegram links prefer native openers", () => {
    const mock = createMockTelegram();
    const { result } = renderHook(() => useTelegramLinks(), { wrapper: wrapperFor(mock.webApp) });

    expect(result.current.openLink("https://example.com", { tryInstantView: true })).toBe(true);
    expect(result.current.openTelegramLink("https://t.me/demo")).toBe(true);
    expect(mock.getState().log.map((entry) => entry.text).join("\n")).toContain('openTelegramLink("https://t.me/demo")');
  });
});

describe("BottomButton params (Bot API 9.5+)", () => {
  it("forwards shine and the custom emoji icon to MainButton", () => {
    const mock = createMockTelegram();
    renderHook(() => useMainButton({ text: "Pay", shine: true, iconCustomEmojiId: "5368324170671202286" }), {
      wrapper: wrapperFor(mock.webApp),
    });

    expect(mock.getState().main).toMatchObject({ hasShineEffect: true, iconCustomEmojiId: "5368324170671202286" });
    expect(mock.webApp.MainButton).toMatchObject({ hasShineEffect: true, iconCustomEmojiId: "5368324170671202286" });
  });

  it("positions the SecondaryButton", () => {
    const mock = createMockTelegram();
    renderHook(() => useSecondaryButton({ text: "Cancel", visible: true, position: "left" }), {
      wrapper: wrapperFor(mock.webApp),
    });

    expect(mock.getState().secondary.position).toBe("left");
    expect(mock.webApp.SecondaryButton?.position).toBe("left");
  });
});
