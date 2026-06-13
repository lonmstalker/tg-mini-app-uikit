import { render, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createMockTelegram } from "../../../examples/demo/src/telegram/mock";
import { getTelegramWebApp, TKTelegramProvider, useTelegramEvent, useWebApp } from "../src/telegram";
import { wrapperFor } from "./helpers/telegram";

describe("Telegram runtime policy", () => {
  it("TG-RUNTIME-001 returns null when window.Telegram.WebApp is missing", () => {
    Reflect.deleteProperty(window, "Telegram");

    expect(getTelegramWebApp()).toBeNull();
  });

  it("TG-RUNTIME-001 returns null when window is missing", () => {
    const currentWindow = window;
    vi.stubGlobal("window", undefined);

    try {
      expect(getTelegramWebApp()).toBeNull();
    } finally {
      vi.stubGlobal("window", currentWindow);
    }
  });

  it("TG-RUNTIME-001 returns the global WebApp when present", () => {
    const mock = createMockTelegram();
    (window as unknown as { Telegram?: { WebApp?: typeof mock.webApp } }).Telegram = { WebApp: mock.webApp };

    expect(getTelegramWebApp()).toBe(mock.webApp);
  });

  it("TG-RUNTIME-002 does not call native APIs outside Telegram", () => {
    Reflect.deleteProperty(window, "Telegram");

    expect(() => render(<TKTelegramProvider>content</TKTelegramProvider>)).not.toThrow();
  });

  it("TG-RUNTIME-003 calls ready only when a WebApp is provided and signalReady is enabled", () => {
    const ready = vi.fn();
    const { rerender } = render(<TKTelegramProvider signalReady={false} webApp={{ ready }} />);
    expect(ready).not.toHaveBeenCalled();

    rerender(<TKTelegramProvider signalReady webApp={{ ready }} />);
    expect(ready).toHaveBeenCalledOnce();
  });

  it("TG-RUNTIME-004 unsubscribes event handlers and avoids stale callbacks after rerender", () => {
    const handlers = new Set<(...args: unknown[]) => void>();
    const onEvent = vi.fn((_event: string, handler: (...args: unknown[]) => void) => {
      handlers.add(handler);
    });
    const offEvent = vi.fn((_event: string, handler: (...args: unknown[]) => void) => {
      handlers.delete(handler);
    });
    const first = vi.fn();
    const second = vi.fn();

    const { rerender, unmount } = renderHook((handler: () => void) => useTelegramEvent("themeChanged", handler), {
      wrapper: wrapperFor({ onEvent, offEvent }),
      initialProps: first,
    });

    rerender(second);
    handlers.forEach((handler) => handler());
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledOnce();

    unmount();
    expect(offEvent).toHaveBeenCalledWith("themeChanged", onEvent.mock.calls[0][1]);
    expect(handlers.size).toBe(0);
  });

  it("TG-RUNTIME-002 exposes undefined from useWebApp outside Telegram for hook consumers", () => {
    Reflect.deleteProperty(window, "Telegram");

    const { result } = renderHook(() => useWebApp());
    expect(result.current).toBeUndefined();
  });
});
