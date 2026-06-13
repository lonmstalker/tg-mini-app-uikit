import { useCallback, useEffect, useRef, type PointerEvent } from "react";

/* ---------------- useLongPress ---------------- */

export interface TKLongPressOptions {
  /** Hold duration before the press fires, ms. */
  duration?: number;
  /** Movement tolerance before the press cancels, px. */
  moveTolerance?: number;
}

export interface TKLongPressHandlers {
  onPointerDown: (e: PointerEvent<HTMLElement>) => void;
  onPointerMove: (e: PointerEvent<HTMLElement>) => void;
  onPointerUp: (e: PointerEvent<HTMLElement>) => void;
  onPointerCancel: (e: PointerEvent<HTMLElement>) => void;
}

/**
 * Long-press gesture: fires after `duration` ms of holding still. Releasing
 * earlier produces a normal click; moving past the tolerance cancels.
 */
export function useLongPress(
  onLongPress: () => void,
  { duration = 500, moveTolerance = 10 }: TKLongPressOptions = {},
): TKLongPressHandlers {
  const timer = useRef<number | undefined>(undefined);
  const origin = useRef<{ x: number; y: number } | null>(null);
  const fnRef = useRef(onLongPress);
  fnRef.current = onLongPress;

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const cancel = useCallback(() => {
    window.clearTimeout(timer.current);
    timer.current = undefined;
    origin.current = null;
  }, []);

  return {
    onPointerDown(e) {
      origin.current = { x: e.clientX, y: e.clientY };
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        origin.current = null;
        fnRef.current();
      }, duration);
    },
    onPointerMove(e) {
      const o = origin.current;
      if (!o) return;
      if (Math.hypot(e.clientX - o.x, e.clientY - o.y) > moveTolerance) cancel();
    },
    onPointerUp: cancel,
    onPointerCancel: cancel,
  };
}
