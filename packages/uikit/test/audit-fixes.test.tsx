import { act, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as kit from "../src/index";
import { createMockTelegram } from "./support/telegram/mock";

/*
 * Regression tests for the June-2026 Mini App audit fixes. Each block pins one
 * confirmed defect so it cannot silently come back.
 */

describe("audit · safe-area JS insets bridged to --tk-safe-* (#1/#7)", () => {
  it("TKProvider writes the Telegram bottom inset into --tk-safe-bottom", () => {
    const mock = createMockTelegram();
    render(
      <kit.TKTelegramProvider webApp={mock.webApp} signalReady={false}>
        <kit.TKProvider testId="prov" />
      </kit.TKTelegramProvider>,
    );
    const root = screen.getByTestId("prov");
    // Before any inset is reported the bridge still resolves to env() (max with 0).
    expect(root.style.getPropertyValue("--tk-safe-bottom")).toContain("env(safe-area-inset-bottom");

    act(() => mock.setDeviceCutouts(true)); // CUTOUTS.bottom === 34
    expect(root.style.getPropertyValue("--tk-safe-bottom")).toBe(
      "max(env(safe-area-inset-bottom, 0px), 34px)",
    );
    act(() => mock.setChromeInset(true)); // CHROME.top === 46, CUTOUTS.top === 59
    expect(root.style.getPropertyValue("--tk-safe-top")).toBe(
      "max(env(safe-area-inset-top, 0px), 105px)",
    );
  });
});

describe("audit · overlays reveal the native Back button (#5)", () => {
  it("an open TKSheet on a root screen shows the Telegram Back button, hidden again on close", () => {
    const mock = createMockTelegram();
    function Host({ open }: { open: boolean }) {
      return (
        <kit.TKTelegramProvider webApp={mock.webApp} signalReady={false}>
          <kit.TKSheet open={open} onClose={() => {}} title="S" />
        </kit.TKTelegramProvider>
      );
    }
    const { rerender } = render(<Host open={false} />);
    expect(mock.getState().back.visible).toBe(false);

    rerender(<Host open />);
    expect(mock.getState().back.visible).toBe(true);
    // and the back press is routed to the sheet (it does not close the app)
    expect(mock.getState().closed).not.toBe(true);

    rerender(<Host open={false} />);
    expect(mock.getState().back.visible).toBe(false);
  });
});

describe("audit · useKeyboard clears .tk-kb-open on unmount-while-open (#6)", () => {
  let root: HTMLDivElement;
  beforeEach(() => {
    root = document.createElement("div");
    root.className = "tk";
    document.body.append(root);
  });
  afterEach(() => {
    root.remove();
    Reflect.deleteProperty(window, "visualViewport");
  });

  it("removes the class even when the screen unmounts with the keyboard still up", () => {
    const listeners = new Map<string, () => void>();
    const vv = {
      height: window.innerHeight,
      offsetTop: 0,
      addEventListener: (e: string, cb: () => void) => listeners.set(e, cb),
      removeEventListener: vi.fn(),
    };
    Object.defineProperty(window, "visualViewport", { value: vv, configurable: true });

    const { unmount } = renderHook(() => kit.useKeyboard(80));
    const input = document.createElement("input");
    document.body.append(input);
    input.focus();
    act(() => {
      vv.height = window.innerHeight - 300;
      listeners.get("resize")?.();
    });
    expect(root.classList.contains("tk-kb-open")).toBe(true);

    // Unmount WITHOUT first closing the keyboard — the class must not linger.
    unmount();
    expect(root.classList.contains("tk-kb-open")).toBe(false);
  });
});

describe("audit · TKChipsInput splits pasted comma lists (#13)", () => {
  it("turns 'react, vue, svelte' into three separate chips", () => {
    const onChange = vi.fn();
    render(<kit.TKChipsInput label="Skills" onChange={onChange} testId="chips" />);
    const input = screen.getByLabelText("Skills") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "react, vue, svelte" } });
    // The two complete segments commit; the trailing one stays as the draft.
    expect(onChange).toHaveBeenLastCalledWith(["react", "vue"]);
    expect(screen.getByRole("button", { name: "Remove react" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove vue" })).toBeInTheDocument();
    expect(input.value).toBe("svelte");
  });
});

describe("audit · TKPhoneInput keeps a same-dial country pick in controlled mode (#14)", () => {
  it("selecting a second +7 country does not revert to the first", () => {
    function Controlled() {
      const [v, setV] = useState("+7");
      return <kit.TKPhoneInput countrySelect value={v} onChange={(formatted) => setV(formatted)} testId="phone" />;
    }
    const { container } = render(<Controlled />);
    const select = container.querySelector("select") as HTMLSelectElement;
    const sevens = Array.from(select.options).filter((o) => (o.textContent ?? "").trim().endsWith("+7"));
    expect(sevens.length).toBeGreaterThanOrEqual(2);

    const other = sevens.find((o) => o.value !== select.value);
    expect(other).toBeDefined();
    fireEvent.change(select, { target: { value: other!.value } });
    // Without the fix the controlled re-render re-derives the first +7 country
    // from the dial prefix and the pick snaps back.
    expect(select.value).toBe(other!.value);
  });
});

describe("audit · TKInfiniteList re-arms when content grows without a loading prop (#12)", () => {
  it("loads the next page after a short page append keeps the sentinel visible", () => {
    const original = globalThis.IntersectionObserver;
    const instances: Array<{ disconnected: boolean; trigger: (v?: boolean) => void }> = [];
    class MockIO {
      disconnected = false;
      observe = vi.fn();
      disconnect = vi.fn(() => {
        this.disconnected = true;
      });
      constructor(private readonly cb: IntersectionObserverCallback) {
        instances.push(this);
      }
      trigger(isIntersecting = true) {
        if (!this.disconnected) this.cb([{ isIntersecting } as IntersectionObserverEntry], this as never);
      }
    }
    Object.defineProperty(globalThis, "IntersectionObserver", { value: MockIO, configurable: true });
    const onLoadMore = vi.fn();
    try {
      function Host({ count }: { count: number }) {
        return (
          <kit.TKInfiniteList hasMore onLoadMore={onLoadMore} testId="inf">
            {Array.from({ length: count }, (_, i) => (
              <div key={i}>item {i}</div>
            ))}
          </kit.TKInfiniteList>
        );
      }
      const { rerender } = render(<Host count={1} />);
      // First page loads once.
      act(() => instances[0].trigger(true));
      expect(onLoadMore).toHaveBeenCalledTimes(1);

      // Append a short page; the sentinel is still on screen. The re-check
      // observer must re-arm off the children change (loading was never wired).
      rerender(<Host count={2} />);
      act(() => instances[instances.length - 1].trigger(true));
      expect(onLoadMore).toHaveBeenCalledTimes(2);
    } finally {
      if (original) Object.defineProperty(globalThis, "IntersectionObserver", { value: original, configurable: true });
      else Reflect.deleteProperty(globalThis, "IntersectionObserver");
    }
  });
});

describe("audit · TKNavStack back navigation slides from the correct side (#8)", () => {
  function Panels() {
    const nav = kit.useNav();
    return (
      <>
        <button type="button" onClick={() => nav.push("details")}>
          go details
        </button>
        <button type="button" onClick={() => nav.push("deep")}>
          go deep
        </button>
        <button type="button" onClick={() => nav.pop()}>
          back
        </button>
      </>
    );
  }
  it("a forward push enters from the right, a pop does not replay that animation", () => {
    render(
      <kit.TKNavStack initial="home" testId="stack">
        <kit.TKNavPanel id="home">
          <Panels />
        </kit.TKNavPanel>
        <kit.TKNavPanel id="details">
          <Panels />
        </kit.TKNavPanel>
        <kit.TKNavPanel id="deep">
          <Panels />
        </kit.TKNavPanel>
      </kit.TKNavStack>,
    );
    const stack = screen.getByTestId("stack");
    const panel = (id: string) => stack.querySelector<HTMLElement>(`[data-tk-nav-panel="${id}"]`)!;

    fireEvent.click(screen.getAllByRole("button", { name: "go details" })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: "go deep" })[0]);
    // Forward push: the new top panel enters from the right.
    expect(panel("deep").style.animation).toContain("tk-nav-in");

    fireEvent.click(screen.getAllByRole("button", { name: "back" })[0]);
    // Pop back to details: it must NOT use the push (slide-from-right) animation.
    expect(panel("details").style.animation).not.toContain("tk-nav-in");
  });
});

describe("audit · TKGallery does not re-emit when re-tapping the active dot (#4)", () => {
  it("tapping the already-active page dot leaves onPageChange untouched", () => {
    const onPageChange = vi.fn();
    render(
      <kit.TKGallery onPageChange={onPageChange} testId="gallery" height={120}>
        <div>one</div>
        <div>two</div>
        <div>three</div>
      </kit.TKGallery>,
    );
    const track = screen.getByTestId("gallery").querySelector("[tabindex='0']") as HTMLDivElement;
    Object.defineProperty(track, "clientWidth", { value: 100, configurable: true });
    Object.defineProperty(track, "scrollTo", { value: vi.fn(), configurable: true });

    fireEvent.click(screen.getByRole("button", { name: "Page 1" })); // page 0 is already active
    expect(onPageChange).not.toHaveBeenCalled();
  });
});
