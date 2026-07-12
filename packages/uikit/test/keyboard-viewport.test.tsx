import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useKeyboard } from "@tg-mini-app/telegram";

/* Keyboard/viewport controller (KB-1.x): covered formula, open/close
   hysteresis, geometry-driven pan settle, deferred focusout. */

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

let input: HTMLInputElement;

beforeEach(() => {
  input = document.createElement("input");
  document.body.append(input);
  Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});

afterEach(() => {
  input.remove();
  Reflect.deleteProperty(window, "visualViewport");
  vi.useRealTimers();
  vi.restoreAllMocks();
});

/* ---------------- KB-1.1 · covered formula + hysteresis ---------------- */

describe("KB-1.1 covered ignores offsetTop and open/close use split thresholds", () => {
  it("stays open through a WebKit pan (offsetTop ~ keyboard height)", () => {
    const { vv, fire, innerHeight } = installVV();
    const { result } = renderHook(() => useKeyboard(80));
    input.focus();
    act(() => {
      vv.height = innerHeight - 300;
      fire("resize");
    });
    expect(result.current).toEqual({ visible: true, height: 300 });
    // WebKit pans to a bottom field: offsetTop grows to ~keyboard height. The
    // old formula subtracted it, zeroing covered and flipping visible=false.
    act(() => {
      vv.offsetTop = 290;
      fire("scroll");
    });
    expect(result.current.visible).toBe(true);
  });

  it("does not flip while covered oscillates between the two thresholds", () => {
    const { vv, fire, innerHeight } = installVV();
    const { result } = renderHook(() => useKeyboard(80));
    input.focus();
    act(() => {
      vv.height = innerHeight - 85; // covered 85 > 80 → opens
      fire("resize");
    });
    expect(result.current.visible).toBe(true);
    for (const covered of [75, 45, 60, 72, 41]) {
      act(() => {
        vv.height = innerHeight - covered; // 40 < covered < 80: hold open
        fire("resize");
      });
      expect(result.current.visible).toBe(true);
    }
    act(() => {
      vv.height = innerHeight - 35; // covered 35 < 40 → closes
      fire("resize");
    });
    expect(result.current.visible).toBe(false);
    act(() => {
      vv.height = innerHeight - 75; // 75 < 80: not enough to re-open
      fire("resize");
    });
    expect(result.current.visible).toBe(false);
  });
});
