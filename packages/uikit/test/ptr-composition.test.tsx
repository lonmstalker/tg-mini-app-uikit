import { StrictMode } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TKKeepMountTab, TKKeepMountTabs, TKPage, TKPullToRefresh } from "../src";

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

describe("GES-103 recurrence: shadowed scrollers", () => {
  it("(a) an at-top ANCESTOR must not unlock the gesture while PTR's OWN wrapper is mid-list", async () => {
    const onRefresh = vi.fn(() => Promise.resolve());
    vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <div data-tk-page-scroll data-testid="pageScroller">
        <TKPullToRefresh onRefresh={onRefresh} testId="ptr">
          <div style={{ height: 2000 }}>tall content</div>
        </TKPullToRefresh>
      </div>,
    );
    const wrapper = screen.getByTestId("ptr").querySelector<HTMLElement>(":scope > div:last-child")!;
    Object.defineProperty(wrapper, "scrollHeight", { value: 2000, configurable: true });
    Object.defineProperty(wrapper, "clientHeight", { value: 400, configurable: true });
    setScrollTop(wrapper, 200); // the wrapper is the REAL scroller, mid-list
    setScrollTop(screen.getByTestId("pageScroller"), 0); // ancestor idles at 0
    pull(screen.getByTestId("ptr"), 210);
    expect(onRefresh).not.toHaveBeenCalled();
    // Back at the very top the gesture arms again (not a dead gate).
    setScrollTop(wrapper, 0);
    pull(screen.getByTestId("ptr"), 210);
    expect(onRefresh).toHaveBeenCalledOnce();
    await act(async () => {});
  });

  it("(b) a hidden keep-mount tab (scrollTop pinned at 0) must not shadow the visible tab's scroller", async () => {
    const onRefresh = vi.fn(() => Promise.resolve());
    function Harness({ active }: { active: string }) {
      return (
        <TKPullToRefresh onRefresh={onRefresh} testId="ptr">
          <TKKeepMountTabs active={active}>
            <TKKeepMountTab id="t1">
              <TKPage testId="p1">
                <div style={{ height: 1200 }}>tab one</div>
              </TKPage>
            </TKKeepMountTab>
            <TKKeepMountTab id="t2">
              <TKPage testId="p2">
                <div style={{ height: 1200 }}>tab two</div>
              </TKPage>
            </TKKeepMountTab>
          </TKKeepMountTabs>
        </TKPullToRefresh>
      );
    }
    const { rerender } = render(<Harness active="t1" />);
    rerender(<Harness active="t2" />); // t1 stays mounted, display:none
    const visibleScroller = screen.getByTestId("p2").querySelector<HTMLElement>("[data-tk-page-scroll]")!;
    setScrollTop(visibleScroller, 120); // the user has scrolled the VISIBLE tab
    // The hidden t1 scroller sits first in the DOM with scrollTop 0 — the gate
    // must read the visible tab's position, not the hidden one's.
    pull(screen.getByTestId("ptr"), 210);
    expect(onRefresh).not.toHaveBeenCalled();
    setScrollTop(visibleScroller, 0);
    pull(screen.getByTestId("ptr"), 210);
    expect(onRefresh).toHaveBeenCalledOnce();
    await act(async () => {});
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
    const ptrs = page.querySelectorAll("[data-tk-ptr]");
    expect(ptrs).toHaveLength(1);
    expect(ptrs[0].contains(scroller)).toBe(true);
    expect(page.querySelectorAll("[data-tk-page-scroll]")).toHaveLength(1);
    pull(ptrs[0] as HTMLElement, 210);
    expect(onRefresh).toHaveBeenCalledOnce();
    await act(async () => {});
  });

  it("composes with header AND footer: one wrapper around the scroller, slots outside it", async () => {
    const onRefresh = vi.fn(() => Promise.resolve());
    render(
      <TKPage header={<div data-testid="hdr">H</div>} footer={<div data-testid="ftr">F</div>} onRefresh={onRefresh} testId="page">
        <div style={{ height: 1200 }}>feed</div>
      </TKPage>,
    );
    const page = screen.getByTestId("page");
    const ptrs = page.querySelectorAll("[data-tk-ptr]");
    expect(ptrs).toHaveLength(1);
    const ptr = ptrs[0] as HTMLElement;
    expect(ptr.contains(page.querySelector("[data-tk-page-scroll]"))).toBe(true);
    // The pinned slots stay OUTSIDE the gesture wrapper.
    expect(ptr.contains(screen.getByTestId("hdr"))).toBe(false);
    expect(ptr.contains(screen.getByTestId("ftr"))).toBe(false);
    pull(ptr, 210);
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

describe("GES-005 screen-reader announcement", () => {
  it("announces via role=status with locale.refreshing while refreshing, then clears", async () => {
    let resolve!: () => void;
    const onRefresh = vi.fn(() => new Promise<void>((r) => (resolve = r)));
    render(
      <TKPullToRefresh onRefresh={onRefresh} testId="ptr">
        <div>content</div>
      </TKPullToRefresh>,
    );
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("");
    pull(screen.getByTestId("ptr"), 210);
    expect(status).toHaveTextContent("Refreshing…"); // locale.refreshing default
    await act(async () => {
      resolve();
    });
    expect(status).toHaveTextContent("");
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
