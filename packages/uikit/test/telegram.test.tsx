import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createMockTelegram } from "../../../examples/demo/src/telegram/mock";
import {
  TKTelegramProvider,
  useBackButton,
  useBiometrics,
  useCloudStorage,
  useClosingConfirmation,
  useDataTransport,
  useFullscreen,
  useHaptics,
  useInitData,
  useInvoice,
  useMainButton,
  useMotionSensors,
  useOrientationLock,
  useSecondaryButton,
  useShare,
  useTelegramColors,
  useTelegramEvent,
  useTelegramLinks,
  useTelegramPopup,
  useTelegramTheme,
  useVerticalSwipes,
  useViewport,
  useWebApp,
  type TelegramWebApp,
  type TKNativeButtonParams,
} from "../src/telegram";

function wrapperFor(webApp: TelegramWebApp | undefined) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <TKTelegramProvider webApp={webApp} signalReady={false}>
        {children}
      </TKTelegramProvider>
    );
  };
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  Reflect.deleteProperty(window, "Telegram");
  Reflect.deleteProperty(navigator, "share");
});

/* ---------------- useMainButton / useSecondaryButton mapping ---------------- */

describe("useMainButton", () => {
  it("maps declarative params onto MainButton.setParams / progress", () => {
    const mock = createMockTelegram();
    const { rerender, unmount } = renderHook((props: TKNativeButtonParams) => useMainButton(props), {
      wrapper: wrapperFor(mock.webApp),
      initialProps: { text: "Pay $10", color: "#ff0000", textColor: "#ffffff" } as TKNativeButtonParams,
    });

    expect(mock.getState().main).toMatchObject({
      text: "Pay $10",
      color: "#ff0000",
      textColor: "#ffffff",
      visible: true,
      active: true,
      progress: false,
    });

    rerender({ text: "Pay $12", loading: true });
    expect(mock.getState().main).toMatchObject({ text: "Pay $12", active: false, progress: true });

    rerender({ text: "Pay $12", disabled: true });
    expect(mock.getState().main).toMatchObject({ active: false, progress: false });

    rerender({ text: "Pay $12", visible: false });
    expect(mock.getState().main.visible).toBe(false);

    rerender({ text: "Pay $12", loading: true });
    unmount();
    // unmount hides the button and the spinner
    expect(mock.getState().main).toMatchObject({ visible: false, progress: false });
  });

  it("subscribes to clicks and unsubscribes on unmount", () => {
    const mock = createMockTelegram();
    const onClick = vi.fn();
    const { unmount } = renderHook(() => useMainButton({ text: "Go", onClick }), {
      wrapper: wrapperFor(mock.webApp),
    });

    act(() => mock.clickMain());
    expect(onClick).toHaveBeenCalledTimes(1);

    unmount();
    act(() => mock.clickMain());
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("reports isSupported=false without a MainButton", () => {
    const { result } = renderHook(() => useMainButton({ text: "Go" }), { wrapper: wrapperFor({}) });
    expect(result.current.isSupported).toBe(false);
  });

  it("drives the SecondaryButton independently", () => {
    const mock = createMockTelegram();
    renderHook(() => useSecondaryButton({ text: "Cancel order", visible: true }), {
      wrapper: wrapperFor(mock.webApp),
    });
    expect(mock.getState().secondary).toMatchObject({ text: "Cancel order", visible: true });
    expect(mock.getState().main.visible).toBe(false);
  });
});

describe("useBackButton", () => {
  it("shows while mounted, fires clicks and hides on unmount", () => {
    const mock = createMockTelegram();
    const onBack = vi.fn();
    const { unmount } = renderHook(() => useBackButton(onBack), { wrapper: wrapperFor(mock.webApp) });

    expect(mock.getState().back.visible).toBe(true);
    act(() => mock.clickBack());
    expect(onBack).toHaveBeenCalledTimes(1);

    unmount();
    expect(mock.getState().back.visible).toBe(false);
    act(() => mock.clickBack());
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});

/* ---------------- Event subscription lifecycle ---------------- */

describe("useTelegramEvent", () => {
  it("subscribes on mount and unsubscribes the same handler on unmount", () => {
    const onEvent = vi.fn();
    const offEvent = vi.fn();
    const { unmount } = renderHook(() => useTelegramEvent("themeChanged", () => {}), {
      wrapper: wrapperFor({ onEvent, offEvent }),
    });

    expect(onEvent).toHaveBeenCalledTimes(1);
    expect(onEvent).toHaveBeenCalledWith("themeChanged", expect.any(Function));
    expect(offEvent).not.toHaveBeenCalled();

    unmount();
    expect(offEvent).toHaveBeenCalledTimes(1);
    expect(offEvent).toHaveBeenCalledWith("themeChanged", onEvent.mock.calls[0][1]);
  });

  it("keeps the theme in sync via themeChanged", () => {
    const mock = createMockTelegram();
    const { result } = renderHook(() => useTelegramTheme(), { wrapper: wrapperFor(mock.webApp) });
    expect(result.current).toBe("light");

    act(() => mock.setColorScheme("dark"));
    expect(result.current).toBe("dark");
  });

  it("keeps the viewport in sync via viewportChanged", () => {
    const mock = createMockTelegram();
    const { result } = renderHook(() => useViewport(), { wrapper: wrapperFor(mock.webApp) });
    expect(result.current.isExpanded).toBe(false);

    act(() => result.current.expand());
    expect(result.current.isExpanded).toBe(true);
    expect(result.current.height).toBe(740);
  });
});

/* ---------------- Browser fallbacks (no Telegram at all) ---------------- */

describe("fallbacks outside Telegram", () => {
  it("openLink falls back to window.open", () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    const { result } = renderHook(() => useTelegramLinks());

    expect(result.current.isSupported).toBe(false);
    expect(result.current.openLink("https://example.com")).toBe(true);
    expect(open).toHaveBeenCalledWith("https://example.com", "_blank", "noopener,noreferrer");
  });

  it("openLink prefers WebApp.openLink when present", () => {
    const openLink = vi.fn();
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    const { result } = renderHook(() => useTelegramLinks(), { wrapper: wrapperFor({ openLink }) });

    result.current.openLink("https://example.com", { tryInstantView: true });
    expect(openLink).toHaveBeenCalledWith("https://example.com", { try_instant_view: true });
    expect(open).not.toHaveBeenCalled();
    expect(result.current.isSupported).toBe(true);
  });

  it("shareToStory falls back to navigator.share", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", { value: share, configurable: true });
    const { result } = renderHook(() => useShare());

    expect(result.current.isSupported).toBe(true);
    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.shareToStory("https://example.com/pic.png", { text: "look" });
    });

    expect(ok).toBe(true);
    expect(share).toHaveBeenCalledWith({ url: "https://example.com/pic.png", text: "look" });
    expect(result.current.status).toBe("success");
  });

  it("shareToStory reports the navigator.share rejection", async () => {
    const share = vi.fn().mockRejectedValue(Object.assign(new Error("nope"), { name: "AbortError" }));
    Object.defineProperty(navigator, "share", { value: share, configurable: true });
    const { result } = renderHook(() => useShare());

    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.shareToStory("https://example.com/pic.png");
    });

    expect(ok).toBe(false);
    expect(result.current.status).toBe("error");
    expect(result.current.error).toBe("AbortError");
  });

  it("cloud storage falls back to prefixed localStorage", async () => {
    const { result } = renderHook(() => useCloudStorage());
    expect(result.current.isSupported).toBe(false);

    await result.current.set("draft", "hello");
    expect(window.localStorage.getItem("tk-cloud:draft")).toBe("hello");
    expect(await result.current.get("draft")).toBe("hello");
    expect(await result.current.getMany(["draft", "missing"])).toEqual({ draft: "hello", missing: null });
    expect(await result.current.keys()).toEqual(["draft"]);

    await result.current.remove("draft");
    expect(await result.current.get("draft")).toBe(null);
  });

  it("haptics are safe no-ops", () => {
    const { result } = renderHook(() => useHaptics());
    expect(result.current.isSupported).toBe(false);
    expect(() => {
      result.current.impact("heavy");
      result.current.notification("success");
      result.current.selection();
    }).not.toThrow();
  });

  it("popup alert/confirm fall back to window.alert/confirm", async () => {
    const alert = vi.spyOn(window, "alert").mockImplementation(() => {});
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    const { result } = renderHook(() => useTelegramPopup());

    expect(result.current.isSupported).toBe(false);
    await expect(result.current.alert("hi")).resolves.toBeUndefined();
    expect(alert).toHaveBeenCalledWith("hi");
    await expect(result.current.confirm("sure?")).resolves.toBe(true);
    expect(confirm).toHaveBeenCalledWith("sure?");
  });
});

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
