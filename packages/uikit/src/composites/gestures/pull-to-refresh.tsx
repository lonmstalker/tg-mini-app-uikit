import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { TKSpinner } from "../../atoms/buttons";
import { useOptionalHaptics } from "../../foundation/telegram";
import { useDragGesture } from "../../internal/useDragGesture";
import { useVerticalSwipeGuard } from "../../internal/useVerticalSwipeGuard";

/* ---------------- Pull to refresh ---------------- */

export interface TKPullToRefreshProps {
  children?: ReactNode;
  /** Refresh action; the spinner stays until the promise settles. */
  onRefresh: () => Promise<unknown> | void;
  /** Resisted pull distance that arms the refresh, px. */
  threshold?: number;
  disabled?: boolean;
  testId?: string;
  style?: CSSProperties;
}

const resistPull = (delta: number) => Math.max(0, delta) * 0.5;

/**
 * Wraps a scroll area with the pull-to-refresh gesture: a resisted pull from
 * the very top, a spinner while `onRefresh` runs, auto-hide afterwards.
 */
export function TKPullToRefresh({ children, onRefresh, threshold = 72, disabled, testId, style }: TKPullToRefreshProps) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const armedRef = useRef(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const haptics = useOptionalHaptics();
  // The pull is a top-edge swipe-down — exactly Telegram's minimize gesture. Mute
  // it while pulling/refreshing so the gesture refreshes instead of collapsing
  // the app.
  useVerticalSwipeGuard(pull > 0 || refreshing);

  const showIndicator = pull > 2 || refreshing;
  const getScrollTop = () => {
    const innerPageScroll = scrollRef.current?.querySelector<HTMLElement>("[data-tk-page-scroll]");
    return innerPageScroll?.scrollTop ?? scrollRef.current?.scrollTop ?? 0;
  };

  // The drag below is pointer-events based, but on a real touch device the
  // browser claims the vertical pan (touch-action: pan-y, needed for native
  // list scrolling) and fires pointercancel before the pull can arm — so the
  // gesture is dead on touch while desktop mouse works (which is why the unit
  // and e2e tests miss it). A non-passive touchmove listener preventDefaults
  // ONLY the top-edge downward overscroll, which keeps the browser from
  // hijacking the gesture (no pointercancel) so the pointer drag runs. Scrolling
  // anywhere but the very top, pulling up, or horizontal swipes are untouched.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onStart = (e: TouchEvent) => {
      touchStart.current = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null;
    };
    const onMove = (e: TouchEvent) => {
      const s = touchStart.current;
      if (!s || disabled || refreshing) return;
      const dy = e.touches[0].clientY - s.y;
      const dx = e.touches[0].clientX - s.x;
      if (dy > 0 && dy > Math.abs(dx) && getScrollTop() <= 0) e.preventDefault();
    };
    const clear = () => {
      touchStart.current = null;
    };
    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", clear, { passive: true });
    el.addEventListener("touchcancel", clear, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", clear);
      el.removeEventListener("touchcancel", clear);
    };
  }, [disabled, refreshing]);

  const drag = useDragGesture({
    axis: "y",
    // Higher activation distance so a fingertip nudge at the top doesn't grab
    // the gesture; the native top-of-list scroll keeps working until the user
    // clearly drags downward past this distance.
    threshold: 14,
    enabled: !disabled && !refreshing,
    onMove(state) {
      // Only pull when starting from the very top AND moving downward — an
      // upward or mid-list drag is a scroll and must not be hijacked.
      if (getScrollTop() > 0 || state.delta <= 0) {
        if (armedRef.current) armedRef.current = false;
        if (pull !== 0) setPull(0);
        return;
      }
      const next = resistPull(state.delta);
      const armed = next >= threshold;
      if (armed && !armedRef.current) haptics.impact("light");
      armedRef.current = armed;
      setPull(Math.min(next, threshold * 1.6));
    },
    onEnd(state) {
      const committed = getScrollTop() <= 0 && state.delta > 0 && resistPull(state.delta) >= threshold;
      armedRef.current = false;
      if (!committed) {
        setPull(0);
        return;
      }
      setRefreshing(true);
      setPull(threshold * 0.75);
      // Call onRefresh synchronously, but turn a synchronous throw into a
      // handled rejection so it never crashes the pointerup handler or leaks an
      // unhandled rejection; the spinner is always cleared in `finally`.
      let result: Promise<unknown> | unknown;
      try {
        result = onRefresh();
      } catch (err) {
        result = Promise.reject(err);
      }
      Promise.resolve(result)
        .catch(() => {})
        .finally(() => {
          setRefreshing(false);
          setPull(0);
        });
    },
  });

  return (
    <div
      ref={rootRef}
      data-testid={testId}
      {...drag}
      style={{ position: "relative", overflow: "hidden", height: "100%", touchAction: "pan-y", ...style }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: showIndicator ? Math.max(pull, 48) : 0,
          overflow: "hidden",
          zIndex: 2,
        }}
      >
        <span className="tk-ptr">
          <TKSpinner size={20} />
        </span>
      </div>
      <div
        ref={scrollRef}
        style={{
          height: "100%",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          transform: pull ? `translateY(${pull}px)` : undefined,
          transition: pull ? "none" : "transform var(--tk-t2) var(--tk-ease)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
