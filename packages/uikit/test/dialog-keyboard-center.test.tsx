import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TKDialog } from "../src";

/* KB-3/KB-4 · TKDialog viewport centering. The dialog re-centers into the
   VISUAL viewport only when the kit's keyboard controller says a keyboard is
   open. Raw `innerHeight − vv.height` is not a keyboard signal: it reads a
   full keyboard in the KB-4 transient window and ≈0 under a host-managed
   viewport, where plain CSS centering is already correct. */

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

beforeEach(() => {
  vi.useFakeTimers();
  Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});

afterEach(() => {
  Reflect.deleteProperty(window, "visualViewport");
  Reflect.deleteProperty(window as unknown as Record<string, unknown>, "Telegram");
  window.localStorage.removeItem("tk:kbHeight");
  window.localStorage.removeItem("tk:kbHostAbsorbs");
  vi.useRealTimers();
  vi.restoreAllMocks();
});

/** The positioned wrapper that owns `top` — the alertdialog card's parent. */
function wrapperTop(): string {
  return (screen.getByRole("alertdialog").parentElement as HTMLElement).style.top;
}

describe("KB-4 TKDialog centers via the keyboard controller, not raw geometry", () => {
  it("recenters into the visual viewport while the keyboard is open, releases on close", () => {
    const { vv, fire } = installVV(800);
    render(
      <TKDialog open title="Name" text="Enter it">
        <input data-testid="field" />
      </TKDialog>,
    );
    expect(wrapperTop()).toBe("50%");

    screen.getByTestId("field").focus();
    act(() => {
      vv.height = 500; // covered = 300 → geometry-owned keyboard
      fire("resize");
    });
    // Visual-viewport center: offsetTop 0 + 500 / 2.
    expect(wrapperTop()).toBe("250px");

    act(() => {
      vv.height = 800; // keyboard closed
      fire("resize");
    });
    expect(wrapperTop()).toBe("50%");
  });

  it("keeps CSS centering under a host-managed viewport (KB-4: host resizes the webview)", () => {
    const { vv, fire } = installVV(800);
    // The bridge reports a keyboard-reduced stable height: the HOST manages the
    // keyboard — the kit must apply no lift and the dialog no px override.
    (window as unknown as { Telegram?: { WebApp?: { viewportStableHeight: number } } }).Telegram = {
      WebApp: { viewportStableHeight: 500 },
    };
    render(
      <TKDialog open title="Name" text="Enter it">
        <input data-testid="field" />
      </TKDialog>,
    );
    screen.getByTestId("field").focus();
    act(() => {
      vv.height = 500;
      fire("resize");
    });
    expect(wrapperTop()).toBe("50%");
  });
});
