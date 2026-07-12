import { act, render, renderHook, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { createMockTelegram } from "@tg-mini-app/telegram/testing";
import { TKTelegramProvider } from "@tg-mini-app/telegram";
import { TKProvider, tkThemeVars, useReducedMotion } from "../src/foundation/theme";
import { wrapperFor } from "./helpers/telegram";

/* M2 foundation: FND-002 motion clamp, FND-003 scoped theme mirror, CC-09 reduce-motion. */

/* ---------------- FND-002 · motionSpeed clamp ---------------- */

describe("FND-002 motionSpeed never emits an invalid calc divisor", () => {
  it("clamps 0 and negatives to a positive floor", () => {
    expect(tkThemeVars({ motionSpeed: 0 })["--tk-ms" as keyof object]).toBe(0.05);
    expect(tkThemeVars({ motionSpeed: -2 })["--tk-ms" as keyof object]).toBe(0.05);
  });

  it("passes through a valid speed and omits the var when unset", () => {
    expect(tkThemeVars({ motionSpeed: 1.15 })["--tk-ms" as keyof object]).toBe(1.15);
    expect("--tk-ms" in tkThemeVars({})).toBe(false);
  });

  it("clamps through the provider knob merge", () => {
    render(
      <TKProvider motionSpeed={0} testId="p">
        <i />
      </TKProvider>,
    );
    const ms = screen.getByTestId("p").style.getPropertyValue("--tk-ms");
    expect(ms).not.toBe("0");
    expect(Number(ms)).toBeGreaterThanOrEqual(0.05);
  });
});

/* ---------------- FND-003 · scoped Telegram theme mirror ---------------- */

describe("FND-003 telegram theme mirror is scoped and reversible", () => {
  it("writes --tg-theme-* on the provider root, not on <html>", () => {
    const mock = createMockTelegram({ colorScheme: "light" });
    render(
      <TKProvider telegram testId="root">
        <i />
      </TKProvider>,
      { wrapper: wrapperFor(mock.webApp) },
    );
    expect(screen.getByTestId("root").style.getPropertyValue("--tg-theme-bg-color")).toBe("#ffffff");
    expect(document.documentElement.style.getPropertyValue("--tg-theme-bg-color")).toBe("");
  });

  it("two providers with different params do not clobber each other", () => {
    const light = createMockTelegram({ colorScheme: "light" });
    const dark = createMockTelegram({ colorScheme: "dark" });
    render(
      <>
        <TKTelegramProvider webApp={light.webApp} signalReady={false}>
          <TKProvider telegram testId="a">
            <i />
          </TKProvider>
        </TKTelegramProvider>
        <TKTelegramProvider webApp={dark.webApp} signalReady={false}>
          <TKProvider telegram testId="b">
            <i />
          </TKProvider>
        </TKTelegramProvider>
      </>,
    );
    expect(screen.getByTestId("a").style.getPropertyValue("--tg-theme-bg-color")).toBe("#ffffff");
    expect(screen.getByTestId("b").style.getPropertyValue("--tg-theme-bg-color")).toBe("#17212b");
    expect(document.documentElement.style.getPropertyValue("--tg-theme-bg-color")).toBe("");
  });

  it("global mode writes on <html> and cleans up on unmount", () => {
    const mock = createMockTelegram({ colorScheme: "light" });
    const { unmount } = render(
      <TKProvider telegram="global" testId="root">
        <i />
      </TKProvider>,
      { wrapper: wrapperFor(mock.webApp) },
    );
    expect(document.documentElement.style.getPropertyValue("--tg-theme-bg-color")).toBe("#ffffff");
    unmount();
    expect(document.documentElement.style.getPropertyValue("--tg-theme-bg-color")).toBe("");
  });

  it("a non-telegram provider writes no --tg-theme-* anywhere", () => {
    render(
      <TKProvider testId="root">
        <i />
      </TKProvider>,
    );
    expect(screen.getByTestId("root").style.getPropertyValue("--tg-theme-bg-color")).toBe("");
    expect(document.documentElement.style.getPropertyValue("--tg-theme-bg-color")).toBe("");
  });
});

/* ---------------- CC-09 · reduce-motion ---------------- */

function installMatchMedia(initial: boolean) {
  const listeners = new Set<(e: { matches: boolean }) => void>();
  let matches = initial;
  const mql = {
    get matches() {
      return matches;
    },
    media: "(prefers-reduced-motion: reduce)",
    addEventListener: (_: string, l: (e: { matches: boolean }) => void) => listeners.add(l),
    removeEventListener: (_: string, l: (e: { matches: boolean }) => void) => listeners.delete(l),
    addListener: (l: (e: { matches: boolean }) => void) => listeners.add(l),
    removeListener: (l: (e: { matches: boolean }) => void) => listeners.delete(l),
    dispatchEvent: () => true,
    onchange: null,
  };
  const original = window.matchMedia;
  window.matchMedia = ((q: string) =>
    q.includes("reduced-motion") ? mql : { matches: false, addEventListener() {}, removeEventListener() {} }) as never;
  return {
    set: (v: boolean) => {
      matches = v;
      act(() => listeners.forEach((l) => l({ matches })));
    },
    restore: () => {
      window.matchMedia = original;
    },
  };
}

describe("CC-09 reduce-motion works via prop and OS, outside the .tk scope", () => {
  afterEach(() => {
    Reflect.deleteProperty(window, "matchMedia");
  });

  it("reduceMotion forces data-tk-motion=off", () => {
    render(
      <TKProvider reduceMotion testId="p">
        <i />
      </TKProvider>,
    );
    expect(screen.getByTestId("p").getAttribute("data-tk-motion")).toBe("off");
  });

  it("auto follows the OS preference and reacts live", () => {
    const mm = installMatchMedia(false);
    try {
      render(
        <TKProvider reduceMotion="auto" testId="p">
          <i />
        </TKProvider>,
      );
      expect(screen.getByTestId("p").getAttribute("data-tk-motion")).toBeNull();
      mm.set(true);
      expect(screen.getByTestId("p").getAttribute("data-tk-motion")).toBe("off");
    } finally {
      mm.restore();
    }
  });

  it("useReducedMotion works with no .tk ancestor and tracks OS changes", () => {
    const mm = installMatchMedia(false);
    try {
      const { result } = renderHook(() => useReducedMotion());
      expect(result.current).toBe(false);
      mm.set(true);
      expect(result.current).toBe(true);
    } finally {
      mm.restore();
    }
  });

  it("falls back to no-reduction when matchMedia is unavailable", () => {
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });
});
