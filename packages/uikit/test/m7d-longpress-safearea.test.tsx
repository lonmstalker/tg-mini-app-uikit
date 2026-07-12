import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as kit from "../src/index";

/* M7-D — long-press click-suppress / pointer guard / keyboard (GES-001/002/004),
 * layout safe-area token + left/right insets (LAY-002/003). */

function LP({ onLongPress, onClick, duration = 500 }: { onLongPress: () => void; onClick?: () => void; duration?: number }) {
  const h = kit.useLongPress(onLongPress, { duration });
  return (
    <button type="button" {...h} onClick={onClick}>
      hold
    </button>
  );
}

/* ---------------- GES-001 — suppress the synthetic click ---------------- */

describe("GES-001 long-press swallows the trailing synthetic click", () => {
  afterEach(() => vi.useRealTimers());

  it("[D-API] a fired press suppresses the following click; the element's onClick does not run", () => {
    vi.useFakeTimers();
    const onLongPress = vi.fn();
    const onClick = vi.fn();
    render(<LP onLongPress={onLongPress} onClick={onClick} />);
    const btn = screen.getByRole("button");
    fireEvent.pointerDown(btn, { isPrimary: true, clientX: 0, clientY: 0 });
    act(() => vi.advanceTimersByTime(500));
    expect(onLongPress).toHaveBeenCalledOnce();
    fireEvent.pointerUp(btn);
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("[D-API] a short tap still fires onClick exactly once", () => {
    vi.useFakeTimers();
    const onLongPress = vi.fn();
    const onClick = vi.fn();
    render(<LP onLongPress={onLongPress} onClick={onClick} />);
    const btn = screen.getByRole("button");
    fireEvent.pointerDown(btn, { isPrimary: true, clientX: 0, clientY: 0 });
    act(() => vi.advanceTimersByTime(200));
    fireEvent.pointerUp(btn);
    fireEvent.click(btn);
    expect(onLongPress).not.toHaveBeenCalled();
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("[D-EDGE] an aborted gesture (pointercancel) doesn't latch the click-suppress", () => {
    vi.useFakeTimers();
    const onLongPress = vi.fn();
    const onClick = vi.fn();
    render(<LP onLongPress={onLongPress} onClick={onClick} />);
    const btn = screen.getByRole("button");
    fireEvent.pointerDown(btn, { isPrimary: true, clientX: 0, clientY: 0 });
    act(() => vi.advanceTimersByTime(500)); // press fires
    fireEvent.pointerCancel(btn); // aborted, no trailing click
    // a later, unrelated click (e.g. keyboard activation) must NOT be swallowed
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledOnce();
  });
});

describe("GES-002 a second finger aborts an in-flight hold", () => {
  afterEach(() => vi.useRealTimers());

  it("[D-GESTURE] a non-primary pointerdown during the hold cancels the press", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    render(<LP onLongPress={fn} />);
    const btn = screen.getByRole("button");
    fireEvent.pointerDown(btn, { isPrimary: true, clientX: 0, clientY: 0 });
    act(() => vi.advanceTimersByTime(200));
    fireEvent.pointerDown(btn, { isPrimary: false, clientX: 50, clientY: 50 }); // 2nd finger
    act(() => vi.advanceTimersByTime(400));
    expect(fn).not.toHaveBeenCalled();
  });

  it("[D-EDGE] a 2nd finger AFTER a fired press releases the click-suppress (no latch)", () => {
    vi.useFakeTimers();
    const onLongPress = vi.fn();
    const onClick = vi.fn();
    render(<LP onLongPress={onLongPress} onClick={onClick} />);
    const btn = screen.getByRole("button");
    fireEvent.pointerDown(btn, { isPrimary: true, clientX: 0, clientY: 0 });
    act(() => vi.advanceTimersByTime(500)); // press fires → firedRef true
    fireEvent.pointerDown(btn, { isPrimary: false, clientX: 50, clientY: 50 }); // 2nd finger aborts
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledOnce(); // suppress released, not latched
  });
});

/* ---------------- GES-002 — pointer-type / button guard ---------------- */

describe("GES-002 long-press ignores non-primary / non-left pointers", () => {
  afterEach(() => vi.useRealTimers());

  it("[D-GESTURE] a non-primary pointer does not start the press", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    render(<LP onLongPress={fn} />);
    fireEvent.pointerDown(screen.getByRole("button"), { isPrimary: false, clientX: 0, clientY: 0 });
    act(() => vi.advanceTimersByTime(600));
    expect(fn).not.toHaveBeenCalled();
  });

  it("[D-GESTURE] a right mouse button does not start the press", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    render(<LP onLongPress={fn} />);
    fireEvent.pointerDown(screen.getByRole("button"), { isPrimary: true, pointerType: "mouse", button: 2, clientX: 0, clientY: 0 });
    act(() => vi.advanceTimersByTime(600));
    expect(fn).not.toHaveBeenCalled();
  });

  it("[D-GESTURE] a primary left press does start it", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    render(<LP onLongPress={fn} />);
    fireEvent.pointerDown(screen.getByRole("button"), { isPrimary: true, pointerType: "mouse", button: 0, clientX: 0, clientY: 0 });
    act(() => vi.advanceTimersByTime(600));
    expect(fn).toHaveBeenCalledOnce();
  });
});

/* ---------------- GES-004 — keyboard equivalent ---------------- */

describe("GES-004 long-press has a keyboard trigger", () => {
  it("[D-A11Y] the ContextMenu key invokes the press", () => {
    const fn = vi.fn();
    render(<LP onLongPress={fn} />);
    fireEvent.keyDown(screen.getByRole("button"), { key: "ContextMenu" });
    expect(fn).toHaveBeenCalledOnce();
  });

  it("[D-A11Y] Shift+F10 invokes the press", () => {
    const fn = vi.fn();
    render(<LP onLongPress={fn} />);
    fireEvent.keyDown(screen.getByRole("button"), { key: "F10", shiftKey: true });
    expect(fn).toHaveBeenCalledOnce();
  });
});

/* ---------------- LAY-002 / LAY-003 — safe-area token + side insets ---------------- */

describe("LAY-002 layout reads the --tk-safe-* tokens", () => {
  it("[D-THEME] bottom bar bottom padding references --tk-safe-bottom (overridable token)", () => {
    render(
      <kit.TKProvider>
        <kit.TKBottomBar testId="bb">x</kit.TKBottomBar>
      </kit.TKProvider>,
    );
    expect(screen.getByTestId("bb").style.paddingBottom).toContain("--tk-safe-bottom");
  });
});

describe("LAY-003 layout pads left/right safe-area insets", () => {
  it("[D-RESP] bottom bar pads left & right insets", () => {
    render(
      <kit.TKProvider>
        <kit.TKBottomBar testId="bb">x</kit.TKBottomBar>
      </kit.TKProvider>,
    );
    const bb = screen.getByTestId("bb");
    expect(bb.style.paddingLeft).toContain("--tk-safe-left");
    expect(bb.style.paddingRight).toContain("--tk-safe-right");
  });

  it("[D-RESP] page content pads left & right insets", () => {
    render(
      <kit.TKProvider>
        <kit.TKPage testId="pg">content</kit.TKPage>
      </kit.TKProvider>,
    );
    const content = screen.getByTestId("pg").querySelector("[data-tk-page-scroll]")!.firstElementChild as HTMLElement;
    expect(content.style.paddingLeft).toContain("--tk-safe-left");
    expect(content.style.paddingRight).toContain("--tk-safe-right");
  });
});
