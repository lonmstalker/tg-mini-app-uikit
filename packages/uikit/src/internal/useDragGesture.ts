import { useEffect, useRef, type PointerEvent } from "react";
import { useLatest } from "./useLatest";

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
  // Walk back over samples within the 100ms window. `first` starts at `last`
  // so when every prior sample predates the window there is no in-window pair
  // and dt stays 0 (velocity 0) — instead of silently spanning the whole
  // buffer (the INT-011 off-by-one).
  let first = last;
  for (let i = samples.length - 2; i >= 0; i--) {
    if (last.t - samples[i].t > 100) break;
    first = samples[i];
  }
  const dt = last.t - first.t;
  return dt > 0 ? (last.pos - first.pos) / dt : 0;
}

/**
 * Tunable thresholds for {@link tkShouldCommit}. Lets a sheet, swipe-cell and
 * nav-back each express their own commit feel (INT-DX-004).
 */
export interface TKCommitPolicy {
  /** Fraction of `size` the gesture must travel to commit on distance alone. */
  distanceRatio?: number;
  /** px/ms flick speed that can commit a shorter (but non-trivial) travel. */
  velocity?: number;
  /**
   * Minimum travel before the velocity branch may commit. Defaults to a
   * size-relative floor `min(size * 0.15, 48)` so a micro-flick never lands
   * (INT-001): velocity alone can no longer close a sheet or pop nav.
   */
  minDistance?: number;
}

/**
 * Commit heuristic shared by all swipe gestures: the gesture "lands" when it
 * travels past `distanceRatio` of the size, OR clears a minimum distance AND
 * is flicked faster than the velocity threshold. Negative offsets (moved back)
 * never commit. A bare flick that barely moves can no longer commit — that was
 * the INT-001 micro-flick defect that closed sheets / popped nav from a tap.
 */
export function tkShouldCommit(offset: number, velocity: number, size: number, policy?: TKCommitPolicy): boolean {
  if (offset <= 0) return false;
  const distanceRatio = policy?.distanceRatio ?? 0.5;
  const velocityThreshold = policy?.velocity ?? 0.5;
  const minDistance = policy?.minDistance ?? Math.min(size * 0.15, 48);
  return offset > size * distanceRatio || (offset > minDistance && velocity > velocityThreshold);
}

export interface TKDragState {
  /** Offset from the start position along the tracked axis, px. */
  delta: number;
  /** Current velocity, px/ms (sign matches delta). */
  velocity: number;
  /**
   * True when the browser stole the gesture (pointercancel, common on iOS
   * Telegram) or it was disabled mid-drag. `delta`/`velocity` are zeroed so a
   * consumer that ignores the flag never auto-commits a stolen gesture; the
   * last good values are preserved in `lastDelta`/`lastVelocity` for a consumer
   * that DOES want to commit despite the cancel (INT-008).
   */
  canceled?: boolean;
  /** Last delta seen before a cancel/disable — only set when `canceled`. */
  lastDelta?: number;
  /** Last velocity seen before a cancel/disable — only set when `canceled`. */
  lastVelocity?: number;
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

const POINTER_KEYS = ["onPointerDown", "onPointerMove", "onPointerUp", "onPointerCancel"] as const;

export interface TKDragBinding {
  /**
   * Pointer handlers for the dragged element. Pass consumer props to merge them:
   * the consumer's pointer handler runs FIRST and the drag handler is then skipped
   * if the consumer called `preventDefault()` — a veto that only matters BEFORE the
   * drag activates (it gates `pointerdown`). Non-pointer props (e.g. `onClick`)
   * pass through untouched; a consumer handler that throws skips the drag handler.
   * For "run my handler AFTER the drag", wrap the returned handler yourself. Set
   * `ref` directly on the element — the hook tracks via `e.currentTarget`, not a
   * ref (INT-DX-005). Spread: `<div {...bind()} />`.
   */
  bind: (userProps?: Partial<TKDragHandlers> & Record<string, unknown>) => TKDragHandlers;
  /**
   * Axis-correct `touch-action` so the common case is right with zero per-call
   * thought (INT-DX-002): `pan-y` for `axis:'x'` and `pan-x` for `axis:'y'` —
   * claims the cross-axis, releases the drag axis to native scroll. For a
   * full-claim surface (a sheet) override with `touchAction:'none'`.
   */
  style: { touchAction: "pan-x" | "pan-y" };
}

/**
 * Pointer-events drag tracker with frame-deduplicated move callbacks (the
 * first move of a frame fires synchronously; extra same-frame moves collapse
 * into one trailing rAF flush), an activation threshold and velocity tracking.
 *
 * Returns `{ bind, style }`: spread `bind()` for the pointer handlers and `style`
 * for the axis-correct `touch-action`, so a swipe never fights native scroll /
 * Telegram's swipe-to-minimize by default (INT-DX-002, was the INT-003 footgun).
 * `bind(userProps)` composes consumer pointer handlers cleanly (INT-DX-005).
 */
export function useDragGesture({
  axis,
  threshold = 6,
  cancelOnCrossAxis = true,
  enabled = true,
  onStart,
  onMove,
  onEnd,
}: TKDragOptions): TKDragBinding {
  const drag = useRef<{
    startMain: number;
    startCross: number;
    pointerId: number;
    active: boolean;
    canceled: boolean;
    samples: TKDragSample[];
    raf: number;
    pending: TKDragState | null;
    /** Last good delta/velocity, preserved for the canceled-end payload. */
    last: { delta: number; velocity: number };
  } | null>(null);

  // `enabled` is snapshotted into a ref so a mid-gesture flip is honored — not
  // just read once at pointerdown (INT-002).
  const enabledRef = useLatest(enabled);

  const read = (e: PointerEvent<HTMLElement>) => ({
    main: axis === "x" ? e.clientX : e.clientY,
    cross: axis === "x" ? e.clientY : e.clientX,
  });

  // Trailing edge of the per-frame dedup: flush the freshest move that arrived
  // while this frame was already served by the synchronous call below.
  const flush = () => {
    const d = drag.current;
    if (!d) return;
    d.raf = 0;
    if (d.pending) {
      onMove?.(d.pending);
      d.pending = null;
    }
  };

  // Cancel any queued frame and drop in-flight state on unmount so a pending
  // rAF never fires onMove against a dead render (INT-009).
  useEffect(
    () => () => {
      const d = drag.current;
      if (d?.raf) cancelAnimationFrame(d.raf);
      drag.current = null;
    },
    [],
  );

  const handlers: TKDragHandlers = {
    onPointerDown(e) {
      if (!enabledRef.current) return;
      // Flush+drop any in-flight drag (multi-touch / synthetic re-fire) so its
      // pending rAF can't leak onto the new gesture (INT-008).
      const prev = drag.current;
      if (prev?.raf) cancelAnimationFrame(prev.raf);
      const { main, cross } = read(e);
      drag.current = {
        startMain: main,
        startCross: cross,
        pointerId: e.pointerId,
        active: false,
        canceled: false,
        samples: [{ pos: main, t: e.timeStamp }],
        raf: 0,
        pending: null,
        last: { delta: 0, velocity: 0 },
      };
    },
    onPointerMove(e) {
      const d = drag.current;
      if (!d || d.canceled) return;
      // Disabled mid-drag: cancel cleanly, never commit, release capture (INT-002).
      if (!enabledRef.current) {
        if (d.raf) cancelAnimationFrame(d.raf);
        drag.current = null;
        if (d.active) {
          e.currentTarget.releasePointerCapture?.(d.pointerId);
          onEnd?.({ delta: 0, velocity: 0, canceled: true, lastDelta: d.last.delta, lastVelocity: d.last.velocity });
        }
        return;
      }
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
      d.last = { delta, velocity: tkDragVelocity(d.samples) };
      // The finger is the law: the FIRST move of a frame fires onMove
      // synchronously (zero added latency); rAF only dedups extra moves that
      // land inside the same frame, flushing the freshest one at the boundary.
      if (typeof requestAnimationFrame === "function" && typeof window !== "undefined") {
        if (!d.raf) {
          d.raf = requestAnimationFrame(flush);
          onMove?.(d.last);
        } else {
          d.pending = d.last;
        }
      } else {
        onMove?.(d.last);
      }
    },
    onPointerUp(e) {
      const d = drag.current;
      drag.current = null;
      if (!d || !d.active) return;
      if (d.raf) cancelAnimationFrame(d.raf);
      e.currentTarget.releasePointerCapture?.(d.pointerId);
      // Disabled before the finger lifted (e.g. nav stack dropped to one panel
      // mid-swipe): never commit (INT-002).
      if (!enabledRef.current) {
        onEnd?.({ delta: 0, velocity: 0, canceled: true, lastDelta: d.last.delta, lastVelocity: d.last.velocity });
        return;
      }
      const main = axis === "x" ? e.clientX : e.clientY;
      d.samples.push({ pos: main, t: e.timeStamp });
      onEnd?.({ delta: main - d.startMain, velocity: tkDragVelocity(d.samples) });
    },
    onPointerCancel(e) {
      const d = drag.current;
      drag.current = null;
      if (!d || !d.active) return;
      if (d.raf) cancelAnimationFrame(d.raf);
      e.currentTarget.releasePointerCapture?.(d.pointerId);
      // Reset to origin (delta 0 → no commit) so a browser-stolen gesture is
      // never auto-committed, but flag it `canceled` and preserve the last good
      // delta/velocity so a consumer CAN opt into committing (INT-008).
      onEnd?.({ delta: 0, velocity: 0, canceled: true, lastDelta: d.last.delta, lastVelocity: d.last.velocity });
    },
  };

  const bind = (userProps?: Partial<TKDragHandlers> & Record<string, unknown>): TKDragHandlers => {
    if (!userProps) return handlers;
    // Non-pointer props (onClick, data-*, etc.) pass through; pointer handlers are
    // chained user-first below.
    const out = { ...userProps } as TKDragHandlers;
    for (const key of POINTER_KEYS) {
      const own = handlers[key];
      const user = userProps[key];
      out[key] = user
        ? (e) => {
            user(e);
            // Respect a consumer veto (e.g. nav's edge-zone gate) — skip the drag
            // handler when the consumer handled/blocked the event (INT-DX-005).
            if (!e.defaultPrevented) own(e);
          }
        : own;
    }
    return out;
  };

  return { bind, style: { touchAction: axis === "x" ? "pan-y" : "pan-x" } };
}
