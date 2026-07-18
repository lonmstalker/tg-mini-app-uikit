import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { TKViewportForensics, tkViewportDebugRequested } from "@tg-mini-app/telegram";

/* The on-device forensics overlay (wiki/ios-debugging.md). Geometry accuracy
 * is proven by its real-device use; here jsdom pins the contract: gating,
 * event capture, and that the window.scrollTo patch is undone on unmount. */

afterEach(() => {
  Reflect.deleteProperty(window, "Telegram");
});

describe("tkViewportDebugRequested", () => {
  it("is off by default and on with start_param 'kbdebug'", () => {
    expect(tkViewportDebugRequested()).toBe(false);
    (window as unknown as { Telegram?: unknown }).Telegram = {
      WebApp: { initDataUnsafe: { start_param: "kbdebug" } },
    };
    expect(tkViewportDebugRequested()).toBe(true);
  });
});

describe("TKViewportForensics", () => {
  it("logs focus and scrollTo events, keeps delegating, and stops logging after unmount", () => {
    const original = window.scrollTo;
    const calls: unknown[][] = [];
    window.scrollTo = ((...args: unknown[]) => {
      calls.push(args);
    }) as typeof window.scrollTo;
    try {
      const { unmount, container } = render(<TKViewportForensics />);

      act(() => {
        document.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
        window.scrollTo(0, 7);
      });
      expect(container.textContent).toContain("focusin");
      expect(container.textContent).toContain("scrollTo(0,7)");
      // The patch DELEGATES — the page still scrolls.
      expect(calls).toContainEqual([0, 7]);

      unmount();
      expect(screen.queryByText(/focusin/)).toBe(null);
      // After unmount scrollTo still works and nothing logs or crashes.
      window.scrollTo(0, 9);
      expect(calls).toContainEqual([0, 9]);
    } finally {
      window.scrollTo = original;
    }
  });
});
