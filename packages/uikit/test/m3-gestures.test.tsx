import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as kit from "../src/index";
import { tkDragVelocity, tkShouldCommit } from "../src/internal/useDragGesture";

/* ---------------- M3.1 drag math ---------------- */

describe("M3.1 useDragGesture math", () => {
  it("computes velocity from the most recent samples (px/ms)", () => {
    // 100px over 100ms = 1 px/ms
    const samples = [
      { pos: 0, t: 0 },
      { pos: 50, t: 50 },
      { pos: 100, t: 100 },
    ];
    expect(tkDragVelocity(samples)).toBeCloseTo(1, 1);
    expect(tkDragVelocity([{ pos: 0, t: 0 }])).toBe(0);
  });

  it("commits past the distance threshold regardless of speed", () => {
    expect(tkShouldCommit(120, 0, 200)).toBe(true); // 60% of size
    expect(tkShouldCommit(80, 0, 200)).toBe(false); // 40%
  });

  it("commits on a fast flick once it clears the INT-001 floor", () => {
    // floor for size 200 = min(200*0.15, 48) = 30; a flick must travel past it.
    expect(tkShouldCommit(60, 0.9, 200)).toBe(true);
    expect(tkShouldCommit(20, 0.9, 200)).toBe(false); // micro-flick under the floor
    expect(tkShouldCommit(60, 0.1, 200)).toBe(false); // far enough but too slow
  });

  it("never commits when the gesture moved back past zero", () => {
    expect(tkShouldCommit(-20, 1.5, 200)).toBe(false);
  });
});

/* ---------------- M3.6 useLongPress ---------------- */

function LongPressProbe({ onLongPress }: { onLongPress: () => void }) {
  const handlers = kit.useLongPress(onLongPress);
  return (
    <button type="button" {...handlers}>
      hold me
    </button>
  );
}

describe("M3.6 useLongPress", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("fires after 500ms of holding", () => {
    const fn = vi.fn();
    render(<LongPressProbe onLongPress={fn} />);
    const btn = screen.getByRole("button");
    fireEvent.pointerDown(btn, { clientX: 10, clientY: 10, isPrimary: true });
    act(() => vi.advanceTimersByTime(499));
    expect(fn).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(2));
    expect(fn).toHaveBeenCalledOnce();
  });

  it("cancels on release before the threshold", () => {
    const fn = vi.fn();
    render(<LongPressProbe onLongPress={fn} />);
    const btn = screen.getByRole("button");
    fireEvent.pointerDown(btn, { clientX: 10, clientY: 10, isPrimary: true });
    act(() => vi.advanceTimersByTime(300));
    fireEvent.pointerUp(btn);
    act(() => vi.advanceTimersByTime(500));
    expect(fn).not.toHaveBeenCalled();
  });

  it("cancels when the pointer moves away", () => {
    const fn = vi.fn();
    render(<LongPressProbe onLongPress={fn} />);
    const btn = screen.getByRole("button");
    fireEvent.pointerDown(btn, { clientX: 10, clientY: 10, isPrimary: true });
    fireEvent.pointerMove(btn, { clientX: 40, clientY: 10 });
    act(() => vi.advanceTimersByTime(600));
    expect(fn).not.toHaveBeenCalled();
  });
});

/* ---------------- M3.2 TKSheet 2.0 ---------------- */

describe("M3.2 TKSheet imperative API and callbacks", () => {
  it("exposes close() through the handle and reports onOpenChange", () => {
    const onClose = vi.fn();
    const onOpenChange = vi.fn();
    const ref = createRef<kit.TKSheetHandle>();
    render(<kit.TKSheet open onClose={onClose} onOpenChange={onOpenChange} sheetRef={ref} title="T" />);
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    act(() => ref.current!.close());
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("snapTo() drives the snap position via transform over a pinned max-snap height", () => {
    const ref = createRef<kit.TKSheetHandle>();
    render(
      <kit.TKSheet open snapPoints={[0.4, 0.9]} sheetRef={ref} title="T" testId="sheet" />,
    );
    const panel = screen.getByTestId("sheet");
    // The height is pinned to the tallest snap; the current snap is a
    // translateY offset (drags and snap changes never animate layout).
    expect(panel.style.height).toBe("90%");
    expect(panel.style.transform).toBe(`translateY(${(1 - 0.4 / 0.9) * 100}%)`);
    act(() => ref.current!.snapTo(1));
    expect(panel.style.height).toBe("90%");
    expect(panel.style.transform).toBe("translateY(0%)");
    expect(ref.current!.snapIndex).toBe(1);
  });

  it("dismissible={false} keeps the scrim from closing the sheet", () => {
    const onClose = vi.fn();
    render(<kit.TKSheet open onClose={onClose} dismissible={false} title="T" />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
  });
});

/* ---------------- M3.4 TKPullToRefresh ---------------- */

describe("M3.4 TKPullToRefresh", () => {
  it("triggers onRefresh exactly once when pulled past the threshold", async () => {
    let resolve!: () => void;
    const onRefresh = vi.fn(() => new Promise<void>((r) => (resolve = r)));
    render(
      <kit.TKPullToRefresh onRefresh={onRefresh} testId="ptr">
        <div style={{ height: 300 }}>content</div>
      </kit.TKPullToRefresh>,
    );
    const area = screen.getByTestId("ptr");
    fireEvent.pointerDown(area, { pointerId: 1, clientY: 50 });
    fireEvent.pointerMove(area, { pointerId: 1, clientY: 260 });
    fireEvent.pointerUp(area, { pointerId: 1, clientY: 260 });
    expect(onRefresh).toHaveBeenCalledOnce();
    await act(async () => {
      resolve();
    });
  });

  it("does not trigger below the threshold", () => {
    const onRefresh = vi.fn(() => Promise.resolve());
    render(
      <kit.TKPullToRefresh onRefresh={onRefresh} testId="ptr">
        <div>content</div>
      </kit.TKPullToRefresh>,
    );
    const area = screen.getByTestId("ptr");
    fireEvent.pointerDown(area, { pointerId: 1, clientY: 50 });
    fireEvent.pointerMove(area, { pointerId: 1, clientY: 80 });
    fireEvent.pointerUp(area, { pointerId: 1, clientY: 80 });
    expect(onRefresh).not.toHaveBeenCalled();
  });

  it("shows a visible pull indicator as soon as the pull starts", async () => {
    render(
      <kit.TKPullToRefresh onRefresh={() => Promise.resolve()} testId="ptr">
        <div>content</div>
      </kit.TKPullToRefresh>,
    );
    const area = screen.getByTestId("ptr");
    fireEvent.pointerDown(area, { pointerId: 1, clientY: 50 });
    fireEvent.pointerMove(area, { pointerId: 1, clientY: 100 });
    await waitFor(() => {
      const indicator = area.querySelector<HTMLElement>(".tk-ptr");
      if (!indicator) throw new Error("Pull indicator is missing");
      expect(indicator).toHaveClass("tk-ptr");
      expect(indicator.parentElement).toHaveStyle({ height: "48px" });
    });
  });

  it("caches the scroll target instead of querying it on every blocking touchmove", () => {
    const querySelector = vi.spyOn(HTMLElement.prototype, "querySelector");
    render(
      <kit.TKPullToRefresh onRefresh={() => Promise.resolve()} testId="ptr">
        <div data-tk-page-scroll style={{ height: 300 }}>
          content
        </div>
      </kit.TKPullToRefresh>,
    );
    const area = screen.getByTestId("ptr");
    querySelector.mockClear();

    fireEvent.touchStart(area, { touches: [{ clientX: 160, clientY: 50 }] });
    for (const y of [90, 130, 170, 210]) {
      fireEvent.touchMove(area, { touches: [{ clientX: 160, clientY: y }] });
    }

    const scrollLookups = querySelector.mock.calls.filter(([selector]) => selector === "[data-tk-page-scroll]");
    expect(scrollLookups.length).toBeLessThanOrEqual(1);
    querySelector.mockRestore();
  });
});

/* ---------------- M3.5 TKSwipeCell ---------------- */

describe("M3.5 TKSwipeCell", () => {
  const actions = (onDelete: () => void) => [
    { label: "Delete", icon: "trash" as const, tone: "red" as const, onAction: onDelete },
  ];

  it("GES-007: a full swipe on a destructive action OPENS the row, never auto-fires", () => {
    const onDelete = vi.fn();
    render(
      // fullSwipe explicitly enabled — a red (destructive) action must still NOT
      // auto-fire on over-swipe; it opens so the user confirms with a tap (CC-01).
      <kit.TKSwipeCell trailing={actions(onDelete)} fullSwipe testId="swipe">
        <kit.TKCell title="Row" />
      </kit.TKSwipeCell>,
    );
    const cell = screen.getByTestId("swipe");
    Object.defineProperty(cell, "clientWidth", { value: 320, configurable: true });
    fireEvent.pointerDown(cell, { pointerId: 1, clientX: 300, clientY: 10 });
    fireEvent.pointerMove(cell, { pointerId: 1, clientX: 20, clientY: 10 });
    fireEvent.pointerUp(cell, { pointerId: 1, clientX: 20, clientY: 10 });
    expect(onDelete).not.toHaveBeenCalled();
    // the revealed button fires it on a deliberate tap
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(onDelete).toHaveBeenCalledOnce();
  });

  it("GES-007: fullSwipe auto-fires a NON-destructive first action", () => {
    const onArchive = vi.fn();
    render(
      <kit.TKSwipeCell
        trailing={[{ label: "Archive", icon: "check" as const, tone: "green" as const, onAction: onArchive }]}
        fullSwipe
        testId="swipe"
      >
        <kit.TKCell title="Row" />
      </kit.TKSwipeCell>,
    );
    const cell = screen.getByTestId("swipe");
    Object.defineProperty(cell, "clientWidth", { value: 320, configurable: true });
    fireEvent.pointerDown(cell, { pointerId: 1, clientX: 300, clientY: 10 });
    fireEvent.pointerMove(cell, { pointerId: 1, clientX: 20, clientY: 10 });
    fireEvent.pointerUp(cell, { pointerId: 1, clientX: 20, clientY: 10 });
    expect(onArchive).toHaveBeenCalledOnce();
  });

  it("GES-007: destructive:true guards a non-red first action from auto-fire", () => {
    const onPurge = vi.fn();
    render(
      // Orange, not red — colour alone wouldn't guard it; `destructive:true` must.
      <kit.TKSwipeCell
        trailing={[{ label: "Purge", icon: "trash" as const, tone: "orange" as const, destructive: true, onAction: onPurge }]}
        fullSwipe
        testId="swipe"
      >
        <kit.TKCell title="Row" />
      </kit.TKSwipeCell>,
    );
    const cell = screen.getByTestId("swipe");
    Object.defineProperty(cell, "clientWidth", { value: 320, configurable: true });
    fireEvent.pointerDown(cell, { pointerId: 1, clientX: 300, clientY: 10 });
    fireEvent.pointerMove(cell, { pointerId: 1, clientX: 20, clientY: 10 });
    fireEvent.pointerUp(cell, { pointerId: 1, clientX: 20, clientY: 10 });
    expect(onPurge).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Purge" }));
    expect(onPurge).toHaveBeenCalledOnce();
  });

  it("keyboard alternative: action buttons are reachable without gestures", () => {
    const onDelete = vi.fn();
    render(
      <kit.TKSwipeCell trailing={actions(onDelete)}>
        <kit.TKCell title="Row" />
      </kit.TKSwipeCell>,
    );
    const btn = screen.getByRole("button", { name: "Delete" });
    fireEvent.click(btn);
    expect(onDelete).toHaveBeenCalledOnce();
  });
});

/* ---------------- M3.7 toast queue & position ---------------- */

describe("M3.7 TKToast position and overflow", () => {
  let toastId = 0;
  function Trigger() {
    const toast = kit.useTKToast();
    return (
      <button type="button" onClick={() => toast.show({ text: `t${++toastId}` })}>
        fire
      </button>
    );
  }

  it("renders the stack at the top with position='top'", () => {
    render(
      <kit.TKToastProvider position="top" testId="stack">
        <Trigger />
      </kit.TKToastProvider>,
    );
    // The stack container is presentational (each toast is its own live region
    // so an error can be assertive while a success stays polite), so locate it
    // by testId rather than role="status".
    const region = screen.getByTestId("stack");
    expect(region.style.top).not.toBe("");
    expect(region.style.bottom).toBe("");
  });

  it("keeps at most `max` toasts visible", () => {
    vi.useFakeTimers();
    function Burst() {
      const toast = kit.useTKToast();
      return (
        <button type="button" onClick={() => ["a", "b", "c", "d"].forEach((t) => toast.show({ text: t }))}>
          burst
        </button>
      );
    }
    render(
      <kit.TKToastProvider max={2}>
        <Burst />
      </kit.TKToastProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "burst" }));
    expect(screen.queryByText("a")).not.toBeInTheDocument();
    expect(screen.queryByText("b")).not.toBeInTheDocument();
    expect(screen.getByText("c")).toBeInTheDocument();
    expect(screen.getByText("d")).toBeInTheDocument();
    vi.useRealTimers();
  });
});

/* ---------------- M3.8 popper arrow & auto-flip ---------------- */

describe("M3.8 TKPopper arrow and auto-flip", () => {
  const anchorAt = (top: number): { current: HTMLElement } => {
    const el = document.createElement("div");
    el.getBoundingClientRect = () =>
      ({ top, bottom: top + 20, left: 100, right: 140, width: 40, height: 20, x: 100, y: top, toJSON() {} }) as DOMRect;
    document.body.appendChild(el);
    return { current: el };
  };

  it("renders an arrow when arrow is set", () => {
    render(
      <kit.TKPopper open anchorRef={anchorAt(100)} arrow testId="pop">
        Hi
      </kit.TKPopper>,
    );
    expect(screen.getByTestId("pop").querySelector("[data-tk-popper-arrow]")).not.toBeNull();
  });

  it("flips placement=bottom to top near the viewport bottom edge", () => {
    render(
      <kit.TKPopper open anchorRef={anchorAt(window.innerHeight - 30)} placement="bottom" testId="pop">
        Hi
      </kit.TKPopper>,
    );
    // flipped: positioned above the anchor rather than below it
    expect(Number.parseFloat(screen.getByTestId("pop").style.top)).toBeLessThan(window.innerHeight - 30);
  });

  it("attaches one listener set while open and removes it on unmount", () => {
    const anchorRef = anchorAt(100);
    const onClose = vi.fn();
    const windowAdd = vi.spyOn(window, "addEventListener");
    const windowRemove = vi.spyOn(window, "removeEventListener");
    const documentAdd = vi.spyOn(document, "addEventListener");
    const documentRemove = vi.spyOn(document, "removeEventListener");

    const { rerender, unmount } = render(
      <kit.TKPopper open anchorRef={anchorRef} onClose={onClose} testId="pop">
        One
      </kit.TKPopper>,
    );
    rerender(
      <kit.TKPopper open anchorRef={anchorRef} onClose={onClose} testId="pop">
        Two
      </kit.TKPopper>,
    );

    expect(windowAdd.mock.calls.filter(([event]) => event === "resize")).toHaveLength(1);
    expect(windowAdd.mock.calls.filter(([event]) => event === "scroll")).toHaveLength(1);
    expect(documentAdd.mock.calls.filter(([event]) => event === "pointerdown")).toHaveLength(1);
    expect(documentAdd.mock.calls.filter(([event]) => event === "keydown")).toHaveLength(1);

    unmount();

    expect(windowRemove.mock.calls.filter(([event]) => event === "resize")).toHaveLength(1);
    expect(windowRemove.mock.calls.filter(([event]) => event === "scroll")).toHaveLength(1);
    expect(documentRemove.mock.calls.filter(([event]) => event === "pointerdown")).toHaveLength(1);
    expect(documentRemove.mock.calls.filter(([event]) => event === "keydown")).toHaveLength(1);
  });
});
