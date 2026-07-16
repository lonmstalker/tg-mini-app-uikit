import { useCallback, useEffect, useRef, type KeyboardEvent, type MouseEvent, type PointerEvent, type SyntheticEvent } from "react";
import { useOptionalHaptics } from "../../foundation/telegram";
import { useLatest } from "../../internal/useLatest";

/* ---------------- useLongPress ---------------- */

export interface TKLongPressOptions {
  /** Hold duration before the press fires, ms. */
  duration?: number;
  /** Movement tolerance before the press cancels, px. */
  moveTolerance?: number;
  /** Fire a Telegram impact haptic when the press lands (default true; GES-009). */
  haptic?: boolean;
}

export interface TKLongPressHandlers {
  onPointerDown: (e: PointerEvent<HTMLElement>) => void;
  onPointerMove: (e: PointerEvent<HTMLElement>) => void;
  onPointerUp: (e: PointerEvent<HTMLElement>) => void;
  onPointerCancel: (e: PointerEvent<HTMLElement>) => void;
  /** Swallows the synthetic click that follows a fired press so the element's onClick doesn't also run (GES-001). */
  onClickCapture: (e: MouseEvent<HTMLElement>) => void;
  /** Keyboard equivalent: ContextMenu key or Shift+F10 invoke the press (GES-004). */
  onKeyDown: (e: KeyboardEvent<HTMLElement>) => void;
  /** Suppresses the native long-press context menu / selection callout. */
  onContextMenu: (e: SyntheticEvent<HTMLElement>) => void;
}

/**
 * Long-press gesture: fires after `duration` ms of holding still. Releasing
 * earlier produces a normal click; moving past the tolerance cancels.
 *
 * Spread the whole result LAST onto the element (`<el {...useLongPress(fn)} />`):
 * it already swallows the post-hold synthetic click (GES-001) and ignores
 * non-primary pointers / right-middle mouse buttons (GES-002). Do NOT re-declare
 * `onClickCapture`, `onPointerDown` or `onKeyDown` after the spread — that silently
 * drops the suppress / keyboard handlers; merge them by hand if you need your own.
 *
 * A11y (GES-004): `onKeyDown` adds a DESKTOP-keyboard trigger only (ContextMenu key
 * / Shift+F10). Mobile screen readers (VoiceOver/TalkBack) and switch control have
 * no such key and activate via click/Enter, so long-press is an ENHANCEMENT — you
 * MUST also expose the same action through a visible, AT-reachable control (an
 * overflow `⋯` button, `aria-haspopup` menu, etc.). Don't make long-press the only
 * path to a destructive/context action.
 */
export function useLongPress(
  onLongPress: () => void,
  { duration = 500, moveTolerance = 10, haptic = true }: TKLongPressOptions = {},
): TKLongPressHandlers {
  const haptics = useOptionalHaptics();
  const timer = useRef<number | undefined>(undefined);
  const origin = useRef<{ x: number; y: number } | null>(null);
  // True once a press fired in the current gesture, so the trailing synthetic
  // click is swallowed exactly once (GES-001).
  const firedRef = useRef(false);
  const fnRef = useLatest(onLongPress);

  const cancel = useCallback(() => {
    window.clearTimeout(timer.current);
    timer.current = undefined;
    origin.current = null;
  }, []);

  // An ABORTED gesture (pointercancel, scroll-away, tab blur) produces no trailing
  // click, so also drop the click-suppress flag — otherwise it could latch and
  // swallow a later unrelated click. A normal pointerUp keeps the flag so the
  // synthetic click that DOES follow the hold is swallowed (GES-001).
  const abort = useCallback(() => {
    cancel();
    firedRef.current = false;
  }, [cancel]);

  // Cancel a pending press when the surface scrolls away or loses focus, and
  // always clear the timer on unmount.
  useEffect(() => {
    if (typeof window === "undefined") return () => window.clearTimeout(timer.current);
    window.addEventListener("scroll", abort, true);
    window.addEventListener("blur", abort);
    document.addEventListener("visibilitychange", abort);
    return () => {
      window.clearTimeout(timer.current);
      window.removeEventListener("scroll", abort, true);
      window.removeEventListener("blur", abort);
      document.removeEventListener("visibilitychange", abort);
    };
  }, [abort]);

  return {
    onPointerDown(e) {
      // Ignore non-primary pointers (a steadying / pinch 2nd finger) and right/
      // middle mouse buttons or a stylus barrel press, so only a deliberate primary
      // press arms the hold (GES-002). A 2nd finger landing during an active hold
      // means a multi-touch gesture — abort the pending press so it can't fire over
      // a pinch.
      if (!e.isPrimary || (e.pointerType === "mouse" && e.button !== 0)) {
        // A 2nd finger / non-primary during a press means a multi-touch gesture —
        // abort (also drops the click-suppress flag so it can't latch).
        abort();
        return;
      }
      firedRef.current = false;
      origin.current = { x: e.clientX, y: e.clientY };
      // Capture the pointer so move/up/cancel reach THIS element even if the finger
      // drifts off it — otherwise a stray off-element move can't cancel the press
      // and a stale long-press fires (GES-010; mirrors useDragGesture).
      e.currentTarget.setPointerCapture?.(e.pointerId);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        origin.current = null;
        firedRef.current = true;
        if (haptic) haptics.impact("medium"); // tactile confirm on a landed press (GES-009)
        fnRef.current();
      }, duration);
    },
    onPointerMove(e) {
      const o = origin.current;
      if (!o) return;
      if (Math.hypot(e.clientX - o.x, e.clientY - o.y) > moveTolerance) cancel();
    },
    onPointerUp(e) {
      // releasePointerCapture throws NotFoundError when this id was never captured
      // (e.g. a secondary pointer that early-returned before capture) — swallow it.
      try {
        e.currentTarget.releasePointerCapture?.(e.pointerId);
      } catch {
        /* not captured */
      }
      cancel();
    },
    onPointerCancel(e) {
      try {
        e.currentTarget.releasePointerCapture?.(e.pointerId);
      } catch {
        /* not captured */
      }
      abort();
    },
    onClickCapture(e) {
      // The browser still dispatches a click after a touch hold; swallow it once so
      // the element's own onClick (navigate/open) doesn't fire too (GES-001).
      if (firedRef.current) {
        firedRef.current = false;
        e.preventDefault();
        e.stopPropagation();
      }
    },
    onKeyDown(e) {
      // Keyboard / switch users reach the action via the ContextMenu key or
      // Shift+F10 (GES-004).
      if (e.key === "ContextMenu" || (e.shiftKey && e.key === "F10")) {
        e.preventDefault();
        fnRef.current();
      }
    },
    onContextMenu(e) {
      // Only stop the native menu while OUR press is in flight (origin set) or just
      // fired-but-not-released (timer.current still truthy until cancel) — a plain
      // right-click with no prior pointerdown keeps its context menu (GES-003). Not
      // gated on firedRef: that flag can outlive the gesture (fire without a trailing
      // click) and would latch the suppression onto unrelated later right-clicks.
      if (origin.current || timer.current) e.preventDefault();
    },
  };
}
