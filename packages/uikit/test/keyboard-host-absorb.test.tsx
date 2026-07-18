import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useKeyboard } from "@tg-mini-app/telegram";

/* KB-3 · host-managed keyboard. Telegram iOS RESIZES the webview for the
   keyboard, so `innerHeight − vv.height` reads ≈0 while the keyboard is
   physically open. The tell is the focused .tk root shrinking by ~a keyboard
   since focusin. While that holds: the settle scroll must NOT fire (it yanked
   the focused composer and the client's interactive-dismiss closed the
   keyboard), and the mode is remembered so the next session's pre-shrink
   steps aside instead of flashing a lift the host is about to make itself. */

interface FakeVV {
  height: number;
  offsetTop: number;
  addEventListener: (e: string, cb: () => void) => void;
  removeEventListener: (e: string, cb: () => void) => void;
}

function installVV(innerHeight = 800) {
  const listeners = new Map<string, Set<() => void>>();
  const vv: FakeVV = {
    height: innerHeight,
    offsetTop: 0,
    addEventListener: (e, cb) => {
      if (!listeners.has(e)) listeners.set(e, new Set());
      listeners.get(e)!.add(cb);
    },
    removeEventListener: (e, cb) => listeners.get(e)?.delete(cb),
  };
  Object.defineProperty(window, "innerHeight", { value: innerHeight, configurable: true });
  Object.defineProperty(window, "visualViewport", { value: vv, configurable: true });
  const fire = (e: string) => listeners.get(e)?.forEach((cb) => cb());
  return { vv, fire, innerHeight };
}

/** A .tk root whose measured height can change mid-test (the host capping it). */
function measurableRoot() {
  const root = document.createElement("div");
  root.className = "tk";
  let height = 0;
  root.getBoundingClientRect = () =>
    ({ top: 0, left: 0, right: 390, width: 390, bottom: height, height, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect;
  document.body.append(root);
  return { root, setHeight: (h: number) => void (height = h) };
}

let input: HTMLInputElement;

function focusInput() {
  act(() => {
    input.focus();
    document.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  input = document.createElement("input");
  Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});

afterEach(() => {
  input.remove();
  document.querySelectorAll(".tk").forEach((el) => el.remove());
  Reflect.deleteProperty(window, "visualViewport");
  Reflect.deleteProperty(window, "Telegram");
  window.localStorage.removeItem("tk:kbHeight");
  window.localStorage.removeItem("tk:kbHostAbsorbs");
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("KB-3 host-managed keyboard (webview resized by the client)", () => {
  it("never fires the settle scroll while the host absorbs the keyboard; settles again after close", () => {
    const { fire, innerHeight } = installVV();
    const { root, setHeight } = measurableRoot();
    setHeight(innerHeight - 20);
    root.append(input);
    renderHook(() => useKeyboard(80));
    focusInput();

    // Keyboard opens: the HOST shrinks the root (vv untouched → covered stays
    // 0) and WebKit leaves a pan-scroll toward the composer.
    setHeight(innerHeight - 320);
    Object.defineProperty(window, "scrollY", { value: 120, configurable: true });
    act(() => {
      fire("scroll");
      vi.advanceTimersByTime(400);
    });
    expect(window.scrollTo).not.toHaveBeenCalled();
    // The mode is remembered for the next session's pre-shrink gate.
    expect(window.localStorage.getItem("tk:kbHostAbsorbs")).toBe("1");

    // Chevron-close (no focus events): the host restores the root; the same
    // leftover scroll is now a genuinely stuck pan and settles on geometry.
    setHeight(innerHeight - 20);
    act(() => {
      fire("scroll");
      vi.advanceTimersByTime(400);
    });
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it("remembered host-absorb skips the pre-shrink (no lift flash on focus)", () => {
    window.localStorage.setItem("tk:kbHeight", "300");
    window.localStorage.setItem("tk:kbHostAbsorbs", "1");
    const { innerHeight } = installVV();
    const { root, setHeight } = measurableRoot();
    setHeight(innerHeight);
    root.append(input);
    const { result } = renderHook(() => useKeyboard(80));
    focusInput();
    // Contrast with KB-1.5(b): without the flag this focusin pre-shrinks to 300.
    expect(root.style.getPropertyValue("--tk-kb-height")).toBe("");
    expect(result.current.visible).toBe(false);
  });

  it("a geometry-confirmed keyboard clears the remembered mode", () => {
    window.localStorage.setItem("tk:kbHostAbsorbs", "1");
    const { vv, fire, innerHeight } = installVV();
    const { root, setHeight } = measurableRoot();
    setHeight(innerHeight);
    root.append(input);
    renderHook(() => useKeyboard(80));
    focusInput();
    act(() => {
      vv.height = innerHeight - 300; // classic WebKit keyboard: covered = 300
      fire("resize");
    });
    expect(window.localStorage.getItem("tk:kbHostAbsorbs")).toBe(null);
  });
});

/* KB-4 · bridge-managed viewport, pinned from an on-device timeline: the
   client reports viewportStableHeight = keyboard-reduced height ~400ms before
   any visualViewport event, vv then shrinks while innerHeight is still full
   (a ~20ms window where covered reads a whole keyboard), and only AFTER that
   the client resizes the WKWebView. The kit's transient 345px lift-and-snap
   in that window double-moved the composer and the client dropped focus. */

describe("KB-4 bridge-managed viewport (client resizes the webview itself)", () => {
  function installBridge(stable: number) {
    (window as unknown as { Telegram?: { WebApp?: { viewportStableHeight: number } } }).Telegram = {
      WebApp: { viewportStableHeight: stable },
    };
    return (window as unknown as { Telegram: { WebApp: { viewportStableHeight: number } } }).Telegram.WebApp;
  }

  it("applies no lift in the window between the vv shrink and the client's webview resize", () => {
    const { vv, fire } = installVV(824);
    const bridge = installBridge(824);
    const { root, setHeight } = measurableRoot();
    setHeight(824);
    root.append(input);
    const { result } = renderHook(() => useKeyboard(80));
    focusInput();

    // The bridge reports the keyboard-reduced viewport first (tg.vp).
    bridge.viewportStableHeight = 479;
    // vv shrinks while innerHeight is still 824 — the historical formula read
    // covered=345 here and lifted the page.
    act(() => {
      vv.height = 479;
      fire("resize");
    });
    expect(root.style.getPropertyValue("--tk-kb-height")).toBe("");
    expect(result.current.visible).toBe(false);
    // The transient is not learned as the device's keyboard height, and the
    // host-managed mode is remembered.
    expect(window.localStorage.getItem("tk:kbHeight")).toBe(null);
    expect(window.localStorage.getItem("tk:kbHostAbsorbs")).toBe("1");

    // The client resizes the webview (the stable-height cap shrinks the root
    // with it — rt479 in the device log); WebKit leaves a pan. No settle scroll.
    Object.defineProperty(window, "innerHeight", { value: 479, configurable: true });
    setHeight(479);
    Object.defineProperty(window, "scrollY", { value: 68, configurable: true });
    act(() => {
      fire("scroll");
      vi.advanceTimersByTime(400);
    });
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it("a keyboard height stored on another device never pre-shrinks under a reduced bridge viewport", () => {
    window.localStorage.setItem("tk:kbHeight", "300");
    installBridge(479); // keyboard already open, focus hops to another field
    const { innerHeight } = installVV(824);
    const { root, setHeight } = measurableRoot();
    setHeight(innerHeight);
    root.append(input);
    renderHook(() => useKeyboard(80));
    focusInput();
    expect(root.style.getPropertyValue("--tk-kb-height")).toBe("");
  });

  it("a bridge whose stable height matches the layout viewport keeps the classic lift", () => {
    const { vv, fire, innerHeight } = installVV(824);
    installBridge(824); // e.g. Android: the webview keeps its size, vv shrinks
    const { root, setHeight } = measurableRoot();
    setHeight(innerHeight);
    root.append(input);
    const { result } = renderHook(() => useKeyboard(80));
    focusInput();
    act(() => {
      vv.height = innerHeight - 300;
      fire("resize");
    });
    expect(result.current).toEqual({ visible: true, height: 300 });
    expect(root.style.getPropertyValue("--tk-kb-height")).toBe("300px");
  });
});
