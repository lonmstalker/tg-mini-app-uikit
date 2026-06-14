import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { TKSpinner } from "../../atoms/buttons";
import { TKIcon } from "../../atoms/icons";
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

/**
 * Wraps a scroll area with the pull-to-refresh gesture: a resisted pull from
 * the very top, a spinner while `onRefresh` runs, auto-hide afterwards.
 */
export function TKPullToRefresh({ children, onRefresh, threshold = 72, disabled, testId, style }: TKPullToRefreshProps) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const armedRef = useRef(false);
  const haptics = useOptionalHaptics();
  // The pull is a top-edge swipe-down — exactly Telegram's minimize gesture. Mute
  // it while pulling/refreshing so the gesture refreshes instead of collapsing
  // the app.
  useVerticalSwipeGuard(pull > 0 || refreshing);

  const resist = (delta: number) => Math.max(0, delta) * 0.5;

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
      if ((scrollRef.current?.scrollTop ?? 0) > 0 || state.delta <= 0) {
        if (armedRef.current) armedRef.current = false;
        if (pull !== 0) setPull(0);
        return;
      }
      const next = resist(state.delta);
      const armed = next >= threshold;
      if (armed && !armedRef.current) haptics.impact("light");
      armedRef.current = armed;
      setPull(Math.min(next, threshold * 1.6));
    },
    onEnd(state) {
      const committed =
        (scrollRef.current?.scrollTop ?? 0) <= 0 && state.delta > 0 && resist(state.delta) >= threshold;
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
      data-testid={testId}
      {...drag}
      style={{ position: "relative", overflow: "hidden", height: "100%", touchAction: "pan-y", ...style }}
    >
      <div
        aria-hidden={!refreshing}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: pull,
          overflow: "hidden",
          opacity: pull > 8 ? 1 : 0,
        }}
      >
        {refreshing ? (
          <TKSpinner size={22} />
        ) : (
          <span
            style={{
              display: "inline-flex",
              color: "var(--tk-text-3)",
              transform: `rotate(${armedRef.current ? 180 : 0}deg)`,
              transition: "transform var(--tk-t2) var(--tk-spring)",
            }}
          >
            <TKIcon name="chevronDown" size={20} />
          </span>
        )}
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
