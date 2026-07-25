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
      const { unmount, baseElement } = render(<TKViewportForensics />);

      act(() => {
        document.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
        window.scrollTo(0, 7);
      });
      expect(baseElement.textContent).toContain("focusin");
      expect(baseElement.textContent).toContain("scrollTo(0,7)");
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

  // B1: the panel portals into the nearest `.tk` / [data-tk-portal-root] host and
  // stays `absolute` there — `fixed` is unreliable in the Telegram iOS webview
  // exactly while the keyboard animates, which is what this panel observes
  // (REU-009/010, OVL-010).
  it("portals into the .tk host and positions absolute against it", () => {
    const { baseElement, unmount } = render(
      <div className="tk" data-testid="host">
        <TKViewportForensics testId="forensics" />
      </div>,
    );
    const panel = screen.getByTestId("forensics");
    expect(panel.closest("[data-testid='host']")).not.toBe(null);
    expect(panel.style.position).toBe("absolute");
    expect(baseElement.querySelector("body > div > [data-testid='forensics']")).toBe(null);
    unmount();
  });

  it("falls back to fixed on the bare body", () => {
    render(<TKViewportForensics testId="bare" />);
    expect(screen.getByTestId("bare").style.position).toBe("fixed");
  });
});
