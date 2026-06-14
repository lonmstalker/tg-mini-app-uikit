import { useCallback, useEffect, useRef, type PointerEvent, type SyntheticEvent } from "react";

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
  /** Suppresses the native long-press context menu / selection callout. */
  onContextMenu: (e: SyntheticEvent<HTMLElement>) => void;
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

  const cancel = useCallback(() => {
    window.clearTimeout(timer.current);
    timer.current = undefined;
    origin.current = null;
  }, []);

  // Cancel a pending press when the surface scrolls away or loses focus, and
  // always clear the timer on unmount.
  useEffect(() => {
    if (typeof window === "undefined") return () => window.clearTimeout(timer.current);
    window.addEventListener("scroll", cancel, true);
    window.addEventListener("blur", cancel);
    document.addEventListener("visibilitychange", cancel);
    return () => {
      window.clearTimeout(timer.current);
      window.removeEventListener("scroll", cancel, true);
      window.removeEventListener("blur", cancel);
      document.removeEventListener("visibilitychange", cancel);
    };
  }, [cancel]);

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
    onContextMenu(e) {
      // Stop the native long-press menu/selection from racing our timer.
      e.preventDefault();
    },
  };
}
