import { readFileSync } from "node:fs";
import { act, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TKTelegramProvider } from "@tg-mini-app/telegram";
import { tkDragVelocity, tkShouldCommit, useDragGesture, type TKDragOptions } from "../src/internal/useDragGesture";
import { tkRovingNext, tkTabbableIndex } from "../src/internal/roving";
import { tkZ, tkZIndex } from "../src/internal/dom";
import { useControllable } from "../src/internal/useControllable";
import { useOverlayLayer } from "../src/internal/useOverlayLayer";
import { useScrollLock } from "../src/internal/useScrollLock";
import { useVerticalSwipeGuard } from "../src/internal/useVerticalSwipeGuard";
import { __tkResetSharedState, tkSharedState } from "../src/internal/registry";

/*
 * INT family — pure-helper unit suite (INT-011) plus the INT-001 / INT-DX-004
 * commit policy and the INT-010 / INT-DX-006 z-index typing.
 * Dimensions: D-GESTURE, D-A11Y, D-TYPES (test-kind: logic + dx).
 */

/* ---------------- INT-001 · tkShouldCommit distance-gated commit ---------------- */

describe("INT-001 tkShouldCommit requires travel before a velocity-only commit", () => {
  it("rejects a micro-flick and accepts a real drag (the documented Done-when)", () => {
    // floor for size 400 = min(400*0.15, 48) = 48
    expect(tkShouldCommit(4, 0.6, 400)).toBe(false); // 4px twitch, fast release -> NO commit
    expect(tkShouldCommit(120, 0.6, 400)).toBe(true); // travelled well past the floor
  });

  it("commits a flick once it clears the floor", () => {
    expect(tkShouldCommit(80, 0.6, 400)).toBe(true); // 80 > 48 and v > 0.5
  });

  it("scales the floor with element size (40px cell vs 600px sheet parity)", () => {
    // size 60 -> floor min(9,48)=9
    expect(tkShouldCommit(30, 0.9, 60)).toBe(true); // 30 > 9
    expect(tkShouldCommit(5, 0.9, 60)).toBe(false); // 5 < 9
  });

  it("keeps the pure distance branch unaffected", () => {
    expect(tkShouldCommit(120, 0, 200)).toBe(true); // 60% of size
    expect(tkShouldCommit(80, 0, 200)).toBe(false); // 40% of size, no velocity
  });

  it("never commits a back-swipe (offset <= 0)", () => {
    expect(tkShouldCommit(-20, 1.5, 200)).toBe(false);
  });

  it("treats the floor as a strict boundary (> not >=)", () => {
    expect(tkShouldCommit(48, 0.6, 400)).toBe(false); // exactly at the floor
    expect(tkShouldCommit(49, 0.6, 400)).toBe(true); // one past it
  });
});

/* ---------------- INT-DX-004 · overridable commit policy ---------------- */

describe("INT-DX-004 tkShouldCommit accepts an overridable policy", () => {
  it("honors the default policy when given an explicit object", () => {
    expect(tkShouldCommit(80, 0.6, 400, { distanceRatio: 0.5, velocity: 0.5, minDistance: 24 })).toBe(true);
  });

  it("raises the flick floor to opt out of micro-flick commits", () => {
    expect(tkShouldCommit(80, 0.6, 400, { minDistance: 120 })).toBe(false); // 80 < 120 and < 200
  });

  it("overrides the distance ratio", () => {
    expect(tkShouldCommit(150, 0, 400, { distanceRatio: 0.3 })).toBe(true); // 150 > 120
    expect(tkShouldCommit(150, 0, 400)).toBe(false); // default 0.5 -> 150 < 200
  });

  it("overrides the velocity threshold", () => {
    expect(tkShouldCommit(80, 0.4, 400, { velocity: 0.3, minDistance: 24 })).toBe(true);
    expect(tkShouldCommit(80, 0.4, 400, { velocity: 0.5, minDistance: 24 })).toBe(false);
  });
});

/* ---------------- INT-011 · tkDragVelocity windowing ---------------- */

describe("INT-011 tkDragVelocity windows the most recent ~100ms", () => {
  it("computes a clean ramp", () => {
    expect(tkDragVelocity([{ pos: 0, t: 0 }, { pos: 50, t: 50 }, { pos: 100, t: 100 }])).toBeCloseTo(1, 5);
  });

  it("returns 0 with fewer than two samples", () => {
    expect(tkDragVelocity([{ pos: 0, t: 0 }])).toBe(0);
  });

  it("returns 0 when timestamps collapse (no divide-by-zero)", () => {
    expect(tkDragVelocity([{ pos: 0, t: 5 }, { pos: 100, t: 5 }])).toBe(0);
  });

  it("returns 0 when every prior sample predates the 100ms window (off-by-one)", () => {
    // last=500; the only other samples are >100ms older -> no in-window pair -> 0
    expect(tkDragVelocity([{ pos: 0, t: 0 }, { pos: 10, t: 5 }, { pos: 1000, t: 500 }])).toBe(0);
  });

  it("excludes a leading out-of-window sample but keeps the in-window one", () => {
    expect(tkDragVelocity([{ pos: 0, t: 0 }, { pos: 0, t: 450 }, { pos: 50, t: 500 }])).toBeCloseTo(1, 5);
  });
});

/* ---------------- INT-011 · roving index math ---------------- */

describe("INT-011 tkRovingNext / tkTabbableIndex", () => {
  it("moves and wraps", () => {
    expect(tkRovingNext("ArrowRight", 0, 3)).toBe(1);
    expect(tkRovingNext("ArrowRight", 2, 3)).toBe(0);
    expect(tkRovingNext("ArrowLeft", 0, 3)).toBe(2);
  });

  it("skips disabled items", () => {
    expect(tkRovingNext("ArrowRight", 0, 3, (i) => i === 1)).toBe(2);
  });

  it("returns null when all items are disabled (no infinite loop)", () => {
    expect(tkRovingNext("ArrowRight", 0, 3, () => true)).toBeNull();
  });

  it("handles Home/End with disabled edges", () => {
    expect(tkRovingNext("Home", 2, 3)).toBe(0);
    expect(tkRovingNext("End", 0, 3)).toBe(2);
    expect(tkRovingNext("Home", 2, 3, (i) => i === 0)).toBe(1);
    expect(tkRovingNext("End", 0, 3, (i) => i === 2)).toBe(1);
  });

  it("respects orientation", () => {
    expect(tkRovingNext("ArrowDown", 0, 3, undefined, "horizontal")).toBeNull();
    expect(tkRovingNext("ArrowRight", 0, 3, undefined, "vertical")).toBeNull();
  });

  it("ignores non-navigation keys and empty groups", () => {
    expect(tkRovingNext("a", 0, 3)).toBeNull();
    expect(tkRovingNext("ArrowRight", 0, 0)).toBeNull();
  });

  it("picks the tabbable index", () => {
    expect(tkTabbableIndex(1, 3)).toBe(1);
    expect(tkTabbableIndex(1, 3, (i) => i === 1)).toBe(0);
    expect(tkTabbableIndex(-1, 3)).toBe(0);
    expect(tkTabbableIndex(5, 3)).toBe(0);
    expect(tkTabbableIndex(0, 3, () => true)).toBe(0);
  });
});

/* ---------------- INT-010 / INT-DX-006 · honest z-index typing ---------------- */

describe("INT-010 tkZ holds CSS-var strings, tkZIndex resolves numbers", () => {
  it("keeps the runtime CSS-var values unchanged", () => {
    expect(tkZ.overlay).toBe("var(--tk-z-overlay)");
    expect(tkZ.popper).toBe("var(--tk-z-popper)");
  });

  it("resolves the numeric scale for the rare arithmetic case", () => {
    expect(tkZIndex("overlay")).toBe(10);
    expect(tkZIndex("overlay", 1)).toBe(11);
    expect(tkZIndex("popper")).toBe(1030);
  });

  it("no longer force-casts CSS-var strings to number", () => {
    const src = readFileSync("src/internal/dom.ts", "utf8");
    expect(src).not.toMatch(/as unknown as/);
  });
});

/* ---------------- INT-004 / INT-DX-007 · useControllable contract ---------------- */

describe("INT-004 useControllable warns on a controlled<->uncontrolled flip", () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => errorSpy.mockRestore());

  function setup(initial: { controlled: string | undefined; defaultValue: string }) {
    return renderHook(({ controlled, defaultValue }) => useControllable(controlled, defaultValue), {
      initialProps: initial,
    });
  }

  it("warns once when going controlled -> uncontrolled", () => {
    const { rerender } = setup({ controlled: "c", defaultValue: "d" });
    expect(errorSpy).not.toHaveBeenCalled();
    rerender({ controlled: undefined, defaultValue: "d" });
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(String(errorSpy.mock.calls[0]?.[0])).toMatch(/controlled to uncontrolled/);
  });

  it("warns once when going uncontrolled -> controlled", () => {
    const { rerender } = setup({ controlled: undefined, defaultValue: "d" });
    rerender({ controlled: "c", defaultValue: "d" });
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(String(errorSpy.mock.calls[0]?.[0])).toMatch(/uncontrolled to controlled/);
  });

  it("stays silent when the mode is stable", () => {
    const { rerender } = setup({ controlled: "a", defaultValue: "d" });
    rerender({ controlled: "b", defaultValue: "d" });
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("treats defaultValue as initial-only (changing it after mount is a no-op)", () => {
    const { result, rerender } = setup({ controlled: undefined, defaultValue: "a" });
    rerender({ controlled: undefined, defaultValue: "b" });
    expect(result.current[0]).toBe("a");
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("is silent in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    const { rerender } = setup({ controlled: "c", defaultValue: "d" });
    rerender({ controlled: undefined, defaultValue: "d" });
    expect(errorSpy).not.toHaveBeenCalled();
    vi.unstubAllEnvs();
  });
});

describe("INT-DX-007 useControllable options-object overload", () => {
  it("works uncontrolled with a setter", () => {
    const { result } = renderHook(() => useControllable({ value: undefined, defaultValue: "a" }));
    expect(result.current[0]).toBe("a");
    act(() => result.current[1]("b"));
    expect(result.current[0]).toBe("b");
  });

  it("mirrors a controlled value and reports onChange", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useControllable({ value: "c", defaultValue: "d", onChange }));
    expect(result.current[0]).toBe("c");
    act(() => result.current[1]("e"));
    expect(result.current[0]).toBe("c");
    expect(onChange).toHaveBeenCalledWith("e");
  });

  it("includes the supplied name in the flip warning", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { rerender } = renderHook(({ value }: { value: string | undefined }) => useControllable({ value, defaultValue: "d", name: "TKSwitch.checked" }), {
      initialProps: { value: "c" as string | undefined },
    });
    rerender({ value: undefined });
    expect(String(errorSpy.mock.calls[0]?.[0])).toMatch(/TKSwitch\.checked/);
    errorSpy.mockRestore();
  });
});

/* ---------------- INT-002 / INT-008 / INT-009 · useDragGesture lifecycle ---------------- */

let rafQueue: Array<{ id: number; cb: FrameRequestCallback }> = [];
let rafSeq = 0;
let releaseSpy: ReturnType<typeof vi.fn>;
let captureSpy: ReturnType<typeof vi.fn>;

function flushRaf() {
  const q = rafQueue;
  rafQueue = [];
  act(() => q.forEach((r) => r.cb(0)));
}

function DragProbe(props: Partial<TKDragOptions>) {
  const drag = useDragGesture({ axis: "y", ...props });
  return <div data-testid="drag" {...drag.bind()} style={drag.style} />;
}

describe("INT-002/008/009 useDragGesture lifecycle", () => {
  beforeEach(() => {
    rafQueue = [];
    rafSeq = 0;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb: FrameRequestCallback) => {
      const id = ++rafSeq;
      rafQueue.push({ id, cb });
      return id;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation((id: number) => {
      rafQueue = rafQueue.filter((r) => r.id !== id);
    });
    captureSpy = vi.fn();
    releaseSpy = vi.fn();
    (HTMLElement.prototype as unknown as { setPointerCapture: unknown }).setPointerCapture = captureSpy;
    (HTMLElement.prototype as unknown as { releasePointerCapture: unknown }).releasePointerCapture = releaseSpy;
  });
  afterEach(() => vi.restoreAllMocks());

  function activate(el: HTMLElement) {
    fireEvent.pointerDown(el, { pointerId: 1, clientX: 0, clientY: 0 });
    fireEvent.pointerMove(el, { pointerId: 1, clientX: 0, clientY: 20 }); // > 6px threshold
  }

  it("INT-002 honors a mid-drag disable: no further onMove, onEnd is a canceled no-commit", () => {
    const onMove = vi.fn();
    const onEnd = vi.fn();
    const { rerender } = render(<DragProbe onMove={onMove} onEnd={onEnd} enabled />);
    const el = screen.getByTestId("drag");
    activate(el);
    flushRaf();
    expect(onMove).toHaveBeenCalledTimes(1);

    rerender(<DragProbe onMove={onMove} onEnd={onEnd} enabled={false} />);
    fireEvent.pointerMove(el, { pointerId: 1, clientX: 0, clientY: 40 });
    flushRaf();
    expect(onMove).toHaveBeenCalledTimes(1); // frozen — no post-disable move
    expect(onEnd).toHaveBeenCalledWith(expect.objectContaining({ delta: 0, canceled: true }));
    expect(releaseSpy).toHaveBeenCalledWith(1);
  });

  it("INT-002 a finger-lift after a mid-drag disable does not commit", () => {
    const onEnd = vi.fn();
    const { rerender } = render(<DragProbe onEnd={onEnd} enabled />);
    const el = screen.getByTestId("drag");
    activate(el); // delta 20
    flushRaf();
    rerender(<DragProbe onEnd={onEnd} enabled={false} />);
    fireEvent.pointerUp(el, { pointerId: 1, clientX: 0, clientY: 20 }); // lift, no intervening move
    expect(onEnd).toHaveBeenCalledWith(expect.objectContaining({ delta: 0, canceled: true }));
    expect(releaseSpy).toHaveBeenCalledWith(1);
  });

  it("INT-002 releases pointer capture on pointerup", () => {
    const onEnd = vi.fn();
    render(<DragProbe onEnd={onEnd} />);
    const el = screen.getByTestId("drag");
    activate(el);
    flushRaf();
    fireEvent.pointerUp(el, { pointerId: 1, clientX: 0, clientY: 20 });
    expect(captureSpy).toHaveBeenCalledWith(1);
    expect(releaseSpy).toHaveBeenCalledWith(1);
  });

  it("INT-002 never releases a capture it never took (sub-threshold tap)", () => {
    const onEnd = vi.fn();
    render(<DragProbe onEnd={onEnd} />);
    const el = screen.getByTestId("drag");
    fireEvent.pointerDown(el, { pointerId: 1, clientX: 0, clientY: 0 });
    fireEvent.pointerUp(el, { pointerId: 1, clientX: 0, clientY: 2 });
    expect(releaseSpy).not.toHaveBeenCalled();
    expect(onEnd).not.toHaveBeenCalled();
  });

  it("INT-008 pointercancel reports a canceled flag with zeroed delta but preserved last values", () => {
    const onEnd = vi.fn();
    render(<DragProbe onEnd={onEnd} />);
    const el = screen.getByTestId("drag");
    activate(el); // last delta = 20
    flushRaf();
    fireEvent.pointerCancel(el, { pointerId: 1 });
    // delta zeroed so a consumer ignoring the flag never auto-commits a stolen
    // gesture; lastDelta preserved so one that WANTS to commit still can.
    expect(onEnd).toHaveBeenCalledWith(expect.objectContaining({ delta: 0, canceled: true, lastDelta: 20 }));
    expect(releaseSpy).toHaveBeenCalledWith(1);
  });

  it("INT-008 a second pointerdown does not leak the first gesture's queued frame", () => {
    const onMove = vi.fn();
    render(<DragProbe onMove={onMove} />);
    const el = screen.getByTestId("drag");
    fireEvent.pointerDown(el, { pointerId: 1, clientX: 0, clientY: 0 });
    fireEvent.pointerMove(el, { pointerId: 1, clientX: 0, clientY: 20 }); // schedules rAF, not flushed
    fireEvent.pointerDown(el, { pointerId: 2, clientX: 0, clientY: 0 }); // second down cancels prior frame
    flushRaf();
    expect(onMove).not.toHaveBeenCalled();
  });

  it("INT-009 unmount cancels a queued frame (no onMove on a dead tree)", () => {
    const onMove = vi.fn();
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { unmount } = render(<DragProbe onMove={onMove} />);
    const el = screen.getByTestId("drag");
    fireEvent.pointerDown(el, { pointerId: 1, clientX: 0, clientY: 0 });
    fireEvent.pointerMove(el, { pointerId: 1, clientX: 0, clientY: 20 }); // schedules rAF
    unmount();
    flushRaf();
    expect(onMove).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});

/* ---------------- INT-005/006 · overlay layer + scroll lock (shared registry) ---------------- */

function LayerProbe({ active, id }: { active: boolean; id: string }) {
  const { scrimZ, panelZ } = useOverlayLayer(active);
  return <div data-testid={id} data-scrim={scrimZ} data-panel={panelZ} />;
}

describe("INT-006 useOverlayLayer assigns z synchronously (no one-frame flash)", () => {
  beforeEach(() => __tkResetSharedState());

  it("a lone overlay keeps the historical 10/11 pair", () => {
    render(<LayerProbe active id="solo" />);
    const el = screen.getByTestId("solo");
    expect(el.dataset.scrim).toBe("10");
    expect(el.dataset.panel).toBe("11");
  });

  it("a stacked overlay paints above the one below it (final committed state)", () => {
    render(
      <>
        <LayerProbe active id="a" />
        <LayerProbe active id="b" />
      </>,
    );
    const a = screen.getByTestId("a");
    const b = screen.getByTestId("b");
    expect(b.dataset.scrim).toBe("12");
    expect(b.dataset.panel).toBe("13");
    expect(Number(b.dataset.scrim)).toBeGreaterThan(Number(a.dataset.panel)); // B fully above A
  });

  it("assigns the slot in a layout effect so the first paint is correct (no flash)", () => {
    // jsdom has no paint, so the flash itself is unobservable here — guard the
    // MECHANISM instead: a regression to a post-paint useEffect would reintroduce
    // the one-frame flash even though the final z is identical.
    const src = readFileSync("src/internal/useOverlayLayer.ts", "utf8");
    expect(src).toMatch(/useIsomorphicLayoutEffect/);
    expect(src).not.toMatch(/\buseEffect\(/);
  });

  it("resets to the base pair once every overlay has closed", () => {
    const { unmount } = render(
      <>
        <LayerProbe active id="a" />
        <LayerProbe active id="b" />
      </>,
    );
    unmount();
    render(<LayerProbe active id="c" />);
    expect(screen.getByTestId("c").dataset.scrim).toBe("10");
  });
});

function LockProbe({ active }: { active: boolean }) {
  useScrollLock(active);
  return null;
}

describe("INT-005 useScrollLock shares a reference-counted registry", () => {
  beforeEach(() => __tkResetSharedState());
  afterEach(() => {
    document.body.removeAttribute("style");
  });

  it("pins the body while locked and restores it on release", () => {
    const { unmount } = render(<LockProbe active />);
    expect(document.body.style.position).toBe("fixed");
    unmount();
    expect(document.body.style.position).toBe("");
  });

  it("parks its counter on the shared globalThis registry (not a module local)", () => {
    render(<LockProbe active />);
    // Init shape matches the hook's so a stray test-first run can't seed a malformed slot.
    const shared = tkSharedState<{ count: number }>("scrollLock", () => ({ count: 0, scrollY: 0, prevBody: null }));
    expect(shared.count).toBe(1);
  });

  it("keeps the lock until the LAST overlay releases (reference counting)", () => {
    const { rerender } = render(
      <>
        <LockProbe active />
        <LockProbe active />
      </>,
    );
    expect(document.body.style.position).toBe("fixed");
    rerender(
      <>
        <LockProbe active />
        <LockProbe active={false} />
      </>,
    );
    expect(document.body.style.position).toBe("fixed"); // one still open
    rerender(
      <>
        <LockProbe active={false} />
        <LockProbe active={false} />
      </>,
    );
    expect(document.body.style.position).toBe(""); // last released
  });

  it("re-locks correctly after a full release (count never drifts negative)", () => {
    const first = render(<LockProbe active />);
    first.unmount();
    const second = render(<LockProbe active />);
    expect(document.body.style.position).toBe("fixed");
    // Init shape matches the hook's so a stray test-first run can't seed a malformed slot.
    const shared = tkSharedState<{ count: number }>("scrollLock", () => ({ count: 0, scrollY: 0, prevBody: null }));
    expect(shared.count).toBe(1);
    second.unmount();
    expect(shared.count).toBe(0);
  });
});

/* ---------------- INT-007 · vertical-swipe-guard ignores wa identity churn ---------------- */

function GuardProbe({ active }: { active: boolean }) {
  useVerticalSwipeGuard(active);
  return null;
}

describe("INT-007 useVerticalSwipeGuard does not thrash on a changing WebApp identity", () => {
  beforeEach(() => __tkResetSharedState());

  const enable = vi.fn();
  const disable = vi.fn();
  function Harness({ active }: { active: boolean }) {
    // A FRESH webApp object each render, sharing the spy fns.
    const wa = { isVerticalSwipesEnabled: true, enableVerticalSwipes: enable, disableVerticalSwipes: disable };
    return (
      <TKTelegramProvider webApp={wa as never} signalReady={false}>
        <GuardProbe active={active} />
      </TKTelegramProvider>
    );
  }

  it("disables once and never re-acquires while active stays true", () => {
    enable.mockClear();
    disable.mockClear();
    const { rerender } = render(<Harness active />);
    expect(disable).toHaveBeenCalledTimes(1);
    rerender(<Harness active />); // new wa identity
    rerender(<Harness active />); // new wa identity
    expect(disable).toHaveBeenCalledTimes(1);
    expect(enable).not.toHaveBeenCalled();
    rerender(<Harness active={false} />);
    expect(enable).toHaveBeenCalledTimes(1);
  });

  it("engages once the WebApp resolves AFTER the overlay opened (startup race)", () => {
    const enableLate = vi.fn();
    const disableLate = vi.fn();
    function LateHarness({ active, hasWa }: { active: boolean; hasWa: boolean }) {
      const wa = hasWa
        ? { isVerticalSwipesEnabled: true, enableVerticalSwipes: enableLate, disableVerticalSwipes: disableLate }
        : undefined;
      return (
        <TKTelegramProvider webApp={wa as never} signalReady={false}>
          <GuardProbe active={active} />
        </TKTelegramProvider>
      );
    }
    // Overlay opens before the WebApp is available -> nothing to disable yet.
    const { rerender } = render(<LateHarness active hasWa={false} />);
    expect(disableLate).not.toHaveBeenCalled();
    // WebApp resolves a tick later, overlay still open -> guard engages.
    rerender(<LateHarness active hasWa />);
    expect(disableLate).toHaveBeenCalledTimes(1);
  });
});
