/*
 * Horizontal drag → remix (D6, dom-contract §4). Displacement maps to context
 * proximity: a horizontal swipe past the threshold locks the NEAREST neighbour
 * (one step), it is NOT a free carousel. On release the scene's `remixTo` runs
 * the same state machine the chip and primary action use, with recorder
 * source 'pointer'. Vertical drags are left to the surface scroll.
 *
 * ponytail: no live finger-follow preview — the swipe-then-lock gesture carries
 * the meaning; a preview transform would fight the idle/breathe transforms for
 * no real gain. Add one later if the feel needs it.
 */
import { useCallback, useRef, type PointerEvent as ReactPointerEvent } from "react";
import { REMIX_ORDER, type BusinessContext } from "../app/composerReducer";
import type { RecorderSource } from "../recorder/recorderTypes";

const THRESHOLD = 48;

function step(current: BusinessContext, dir: 1 | -1): BusinessContext {
  const i = REMIX_ORDER.indexOf(current);
  return REMIX_ORDER[(i + dir + REMIX_ORDER.length) % REMIX_ORDER.length];
}

export interface RemixDragApi {
  onPointerDown: (e: ReactPointerEvent) => void;
  onPointerUp: (e: ReactPointerEvent) => void;
}

export function useRemixDrag(opts: {
  current: BusinessContext;
  /** Only start a drag from a settled state (not mid-remix). */
  settled: boolean;
  remixTo: (to: BusinessContext, source: RecorderSource) => void;
}): RemixDragApi {
  const { current, settled, remixTo } = opts;
  const start = useRef<{ x: number; y: number } | null>(null);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent) => {
      start.current = settled ? { x: e.clientX, y: e.clientY } : null;
    },
    [settled],
  );

  const onPointerUp = useCallback(
    (e: ReactPointerEvent) => {
      const s = start.current;
      start.current = null;
      if (!s) return;
      const dx = e.clientX - s.x;
      const dy = e.clientY - s.y;
      // Horizontal-dominant swipe past the threshold → lock the nearest neighbour.
      if (Math.abs(dx) > THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
        remixTo(step(current, dx < 0 ? 1 : -1), "pointer");
      }
    },
    [current, remixTo],
  );

  return { onPointerDown, onPointerUp };
}
