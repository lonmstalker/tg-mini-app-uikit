import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createMockTelegram } from "./support/telegram/mock";
import {
  useBackButton,
  useCloudStorage,
  useHaptics,
  useMainButton,
  useSecondaryButton,
  useShare,
  useTelegramEvent,
  useTelegramLinks,
  useTelegramPopup,
  useTelegramTheme,
  useViewport,
  type TKNativeButtonParams,
} from "../src/foundation/telegram";
import { wrapperFor } from "./helpers/telegram";

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
