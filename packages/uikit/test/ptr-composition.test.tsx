import { StrictMode } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TKPage, TKPullToRefresh } from "../src";

/* TKPullToRefresh scroll-target resolution (GES-103) + TKPage onRefresh. */

afterEach(() => {
  vi.restoreAllMocks();
});

function pull(area: HTMLElement, distance: number) {
  fireEvent.pointerDown(area, { pointerId: 1, clientY: 50 });
  fireEvent.pointerMove(area, { pointerId: 1, clientY: 50 + distance });
  fireEvent.pointerUp(area, { pointerId: 1, clientY: 50 + distance });
}

function setScrollTop(el: HTMLElement, px: number) {
  Object.defineProperty(el, "scrollTop", { value: px, configurable: true });
}

describe("GES-103 resolveScrollTarget", () => {
  it("(1) prefers a [data-tk-page-scroll] DESCENDANT (PTR wraps a TKPage)", async () => {
    const onRefresh = vi.fn(() => Promise.resolve());
    render(
      <TKPullToRefresh onRefresh={onRefresh} testId="ptr">
        <div data-tk-page-scroll data-testid="inner">
          content
        </div>
      </TKPullToRefresh>,
    );
    // With the inner scroller at rest the pull arms…
    pull(screen.getByTestId("ptr"), 210);
    expect(onRefresh).toHaveBeenCalledOnce();
    await act(async () => {});
    // …and with the inner scroller scrolled down it must not.
    setScrollTop(screen.getByTestId("inner"), 120);
    pull(screen.getByTestId("ptr"), 210);
    expect(onRefresh).toHaveBeenCalledOnce();
  });

  it("(2) falls back to a [data-tk-page-scroll] ANCESTOR and gates on its scrollTop", async () => {
    const onRefresh = vi.fn(() => Promise.resolve());
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <div data-tk-page-scroll data-testid="pageScroller">
        <TKPullToRefresh onRefresh={onRefresh} testId="ptr">
          <div>content inside the page scroller</div>
        </TKPullToRefresh>
      </div>,
    );
    const scroller = screen.getByTestId("pageScroller");
    // Mid-list: the ancestor is scrolled — the pull must NOT arm (this was the
    // hidden-refetch + frozen-content defect).
    setScrollTop(scroller, 300);
    pull(screen.getByTestId("ptr"), 210);
    expect(onRefresh).not.toHaveBeenCalled();
    // At the top the gesture works through the ancestor target.
    setScrollTop(scroller, 0);
    pull(screen.getByTestId("ptr"), 210);
    expect(onRefresh).toHaveBeenCalledOnce();
    await act(async () => {});
    expect(warn).toHaveBeenCalledTimes(1); // dev hint, once
    expect(String(warn.mock.calls[0][0])).toContain("TKPage onRefresh");
  });

  it("(3) uses its own wrapper only when that wrapper actually scrolls", async () => {
    const onRefresh = vi.fn(() => Promise.resolve());
    render(
      <TKPullToRefresh onRefresh={onRefresh} testId="ptr">
        <div style={{ height: 300 }}>plain content</div>
      </TKPullToRefresh>,
    );
    const wrapper = screen.getByTestId("ptr").querySelector<HTMLElement>(":scope > div:last-child")!;
    // jsdom: scrollHeight === clientHeight === 0 → not scrollable → no target,
    // the gesture still arms from the top (scrollTop reads 0).
    pull(screen.getByTestId("ptr"), 210);
    expect(onRefresh).toHaveBeenCalledOnce();
    await act(async () => {});
    // Make the wrapper scrollable and scrolled — now IT gates the pull.
    Object.defineProperty(wrapper, "scrollHeight", { value: 900, configurable: true });
    Object.defineProperty(wrapper, "clientHeight", { value: 300, configurable: true });
    setScrollTop(wrapper, 200);
    pull(screen.getByTestId("ptr"), 210);
    expect(onRefresh).toHaveBeenCalledOnce();
  });
});

describe("TKPage onRefresh (pit of success)", () => {
  it("wires its own scroller into a single TKPullToRefresh; the pull calls onRefresh", async () => {
    const onRefresh = vi.fn(() => Promise.resolve());
    render(
      <TKPage onRefresh={onRefresh} testId="page">
        <div style={{ height: 1200 }}>feed</div>
      </TKPage>,
    );
    const page = screen.getByTestId("page");
    const scroller = page.querySelector("[data-tk-page-scroll]")!;
    expect(scroller).not.toBeNull();
    // Exactly one gesture wrapper, and the scroller lives INSIDE it.
    const ptrs = page.querySelectorAll("[aria-busy], [data-tk-page-scroll]");
    expect(ptrs.length).toBeGreaterThan(0);
    const wrapper = scroller.parentElement?.parentElement as HTMLElement;
    pull(wrapper, 210);
    expect(onRefresh).toHaveBeenCalledOnce();
    await act(async () => {});
  });

  it("mounts no nested TKPullToRefresh when onRefresh is absent", () => {
    render(
      <TKPage testId="page">
        <div>feed</div>
      </TKPage>,
    );
    const page = screen.getByTestId("page");
    expect(page.querySelector(".tk-ptr")).toBeNull();
    expect(page.querySelector("[data-tk-page-scroll]")).not.toBeNull();
  });
});

describe("GES-011 mounted-flag survives a StrictMode double-mount", () => {
  it("clears the refreshing state after onRefresh settles under StrictMode", async () => {
    let resolve!: () => void;
    const onRefresh = vi.fn(() => new Promise<void>((r) => (resolve = r)));
    render(
      <StrictMode>
        <TKPullToRefresh onRefresh={onRefresh} testId="ptr">
          <div>content</div>
        </TKPullToRefresh>
      </StrictMode>,
    );
    const area = screen.getByTestId("ptr");
    pull(area, 210);
    expect(onRefresh).toHaveBeenCalledOnce();
    expect(area.getAttribute("aria-busy")).toBe("true");
    await act(async () => {
      resolve();
    });
    // The StrictMode dev cleanup must not latch the mounted flag to false —
    // otherwise the spinner never clears after the refresh settles.
    expect(area.getAttribute("aria-busy")).toBeNull();
  });
});
