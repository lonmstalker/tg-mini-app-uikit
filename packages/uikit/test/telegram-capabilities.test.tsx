import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createMockTelegram } from "../../../examples/demo/src/telegram/mock";
import {
  useBiometrics,
  useClosingConfirmation,
  useCloudStorage,
  useDataTransport,
  useFullscreen,
  useHaptics,
  useInitData,
  useInvoice,
  useMainButton,
  useMotionSensors,
  useOrientationLock,
  useSecondaryButton,
  useTelegramColors,
  useTelegramPopup,
  useVerticalSwipes,
  useWebApp,
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
