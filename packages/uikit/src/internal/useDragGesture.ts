import { useRef, type PointerEvent } from "react";

/*
 * Internal drag-gesture plumbing (NOT exported from the package until the
 * API stabilizes — see plans.md M3.1). Powers TKSheet swipe-to-close,
 * TKPullToRefresh, TKSwipeCell and the M6 nav-stack swipe-back.
 */

export interface TKDragSample {
  pos: number;
  t: number;
}

/** Velocity in px/ms over the most recent ~100ms window of samples. */
export function tkDragVelocity(samples: TKDragSample[]): number {
  if (samples.length < 2) return 0;
  const last = samples[samples.length - 1];
  // walk back to the oldest sample within the window
  let first = samples[0];
  for (let i = samples.length - 2; i >= 0; i--) {
    if (last.t - samples[i].t > 100) break;
    first = samples[i];
  }
  const dt = last.t - first.t;
  return dt > 0 ? (last.pos - first.pos) / dt : 0;
}

/**
 * Commit heuristic shared by all swipe gestures: the gesture "lands" when it
 * traveled past half the size OR was flicked faster than 0.5 px/ms in the
 * positive direction. Negative offsets (moved back) never commit.
 */
export function tkShouldCommit(offset: number, velocity: number, size: number): boolean {
  if (offset <= 0) return false;
  return offset > size * 0.5 || velocity > 0.5;
}

export interface TKDragState {
  /** Offset from the start position along the tracked axis, px. */
  delta: number;
  /** Current velocity, px/ms (sign matches delta). */
  velocity: number;
}

export interface TKDragOptions {
  axis: "x" | "y";
  /** Movement needed before the drag activates (lets taps and scrolls through). */
  threshold?: number;
  /** Cancel the drag when the cross-axis wins (the user is scrolling). */
  cancelOnCrossAxis?: boolean;
  enabled?: boolean;
  onStart?: () => void;
  onMove?: (state: TKDragState) => void;
  onEnd?: (state: TKDragState) => void;
}

export interface TKDragHandlers {
  onPointerDown: (e: PointerEvent<HTMLElement>) => void;
  onPointerMove: (e: PointerEvent<HTMLElement>) => void;
  onPointerUp: (e: PointerEvent<HTMLElement>) => void;
  onPointerCancel: (e: PointerEvent<HTMLElement>) => void;
}

/**
 * Pointer-events drag tracker with rAF-throttled move callbacks, an
 * activation threshold and velocity tracking.
 */
export function useDragGesture({
  axis,
  threshold = 6,
  cancelOnCrossAxis = true,
  enabled = true,
  onStart,
  onMove,
  onEnd,
}: TKDragOptions): TKDragHandlers {
  const drag = useRef<{
    startMain: number;
    startCross: number;
    active: boolean;
    canceled: boolean;
    samples: TKDragSample[];
    raf: number;
    pending: TKDragState | null;
  } | null>(null);

  const read = (e: PointerEvent<HTMLElement>) => ({
    main: axis === "x" ? e.clientX : e.clientY,
    cross: axis === "x" ? e.clientY : e.clientX,
  });

  const flush = () => {
    const d = drag.current;
    if (!d) return;
    d.raf = 0;
    if (d.pending) {
      onMove?.(d.pending);
      d.pending = null;
    }
  };

  return {
    onPointerDown(e) {
      if (!enabled) return;
      const { main, cross } = read(e);
      drag.current = {
        startMain: main,
        startCross: cross,
        active: false,
        canceled: false,
        samples: [{ pos: main, t: e.timeStamp }],
        raf: 0,
        pending: null,
      };
    },
    onPointerMove(e) {
      const d = drag.current;
      if (!d || d.canceled) return;
      const { main, cross } = read(e);
      const delta = main - d.startMain;
      const crossDelta = cross - d.startCross;
      if (!d.active) {
        if (cancelOnCrossAxis && Math.abs(crossDelta) > threshold && Math.abs(crossDelta) > Math.abs(delta)) {
          d.canceled = true; // the user is scrolling the other way
          return;
        }
        if (Math.abs(delta) < threshold) return;
        d.active = true;
        e.currentTarget.setPointerCapture?.(e.pointerId);
        onStart?.();
      }
      d.samples.push({ pos: main, t: e.timeStamp });
      if (d.samples.length > 24) d.samples.shift();
      d.pending = { delta, velocity: tkDragVelocity(d.samples) };
      if (typeof requestAnimationFrame === "function" && typeof window !== "undefined") {
        if (!d.raf) d.raf = requestAnimationFrame(flush);
      } else {
        flush();
      }
    },
    onPointerUp(e) {
      const d = drag.current;
      drag.current = null;
      if (!d || !d.active) return;
      if (d.raf) cancelAnimationFrame(d.raf);
      const main = axis === "x" ? e.clientX : e.clientY;
      d.samples.push({ pos: main, t: e.timeStamp });
      onEnd?.({ delta: main - d.startMain, velocity: tkDragVelocity(d.samples) });
    },
    onPointerCancel() {
      const d = drag.current;
      drag.current = null;
      if (!d || !d.active) return;
      if (d.raf) cancelAnimationFrame(d.raf);
      onEnd?.({ delta: 0, velocity: 0 });
    },
  };
}
