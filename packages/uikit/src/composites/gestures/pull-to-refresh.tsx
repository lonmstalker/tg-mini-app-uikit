import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { TKSpinner } from "../../atoms/buttons";
import { TKVisuallyHidden } from "../../atoms/service";
import { useTKLocale } from "../../foundation/i18n";
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
  /** SR announcement while refreshing (default `locale.refreshing`). */
  refreshingLabel?: ReactNode;
  testId?: string;
  style?: CSSProperties;
}

const resistPull = (delta: number) => Math.max(0, delta) * 0.5;

/**
 * Wraps a scroll area with the pull-to-refresh gesture: a resisted pull from
 * the very top, a spinner while `onRefresh` runs, auto-hide afterwards.
 */
export function TKPullToRefresh({ children, onRefresh, threshold = 72, disabled, refreshingLabel, testId, style }: TKPullToRefreshProps) {
  const locale = useTKLocale();
  const [guarding, setGuarding] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollTargetRef = useRef<HTMLElement | null>(null);
  const pullRef = useRef(0);
  const armedRef = useRef(false);
  const guardingRef = useRef(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  // Skip the post-refresh setState if the host unmounted mid-flight (GES-011).
  const mountedRef = useRef(true);
  useEffect(() => () => void (mountedRef.current = false), []);
  const haptics = useOptionalHaptics();
  // The pull is a top-edge swipe-down — exactly Telegram's minimize gesture. Mute
  // it while pulling/refreshing so the gesture refreshes instead of collapsing
  // the app.
  useVerticalSwipeGuard(guarding || refreshing);

  const setGuardingActive = (active: boolean) => {
    if (guardingRef.current === active) return;
    guardingRef.current = active;
    setGuarding(active);
  };
  const warnedAncestorRef = useRef(false);
  const resolveScrollTarget = () => {
    if (scrollTargetRef.current?.isConnected) return scrollTargetRef.current;
    // (1) The intended composition: PTR wraps the scroller (a TKPage inside).
    const inner = scrollRef.current?.querySelector<HTMLElement>("[data-tk-page-scroll]");
    // (2) PTR misplaced INSIDE a page scroller: the gate must read the ANCESTOR's
    // scrollTop, or a mid-list pull hijacks the scroll (preventDefault) and
    // fires hidden refreshes (GES-103).
    const outer = inner ? null : rootRef.current?.parentElement?.closest<HTMLElement>("[data-tk-page-scroll]") ?? null;
    if (outer && process.env.NODE_ENV !== "production" && !warnedAncestorRef.current) {
      warnedAncestorRef.current = true;
      // eslint-disable-next-line no-console
      console.warn(
        "TKPullToRefresh: the page scroller is an ANCESTOR of the gesture area. Wrap the scroller itself, or prefer TKPage onRefresh which wires this correctly.",
      );
    }
    // (3) Otherwise PTR's own wrapper — only when it actually scrolls.
    const own =
      scrollRef.current && scrollRef.current.scrollHeight > scrollRef.current.clientHeight ? scrollRef.current : null;
    const target = inner ?? outer ?? own;
    scrollTargetRef.current = target;
    return target;
  };
  const getScrollTop = () => {
    return resolveScrollTarget()?.scrollTop ?? 0;
  };
  const applyPull = (nextPull: number) => {
    const next = Math.max(0, nextPull);
    pullRef.current = next;
    if (indicatorRef.current) indicatorRef.current.style.height = next > 2 ? `${Math.max(next, 48)}px` : "0px";
    if (scrollRef.current) {
      scrollRef.current.style.transform = next ? `translateY(${next}px)` : "";
      scrollRef.current.style.transition = next ? "none" : "transform var(--tk-t2) var(--tk-ease)";
    }
  };
  const renderedPull = pullRef.current;
  const showIndicator = renderedPull > 2 || refreshing;

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
      if (touchStart.current) resolveScrollTarget();
    };
    const onMove = (e: TouchEvent) => {
      const s = touchStart.current;
      if (!s || disabled || refreshing || e.touches.length !== 1) return;
      const dy = e.touches[0].clientY - s.y;
      const dx = e.touches[0].clientX - s.x;
      if (dy > 0 && dy > Math.abs(dx) && getScrollTop() <= 0) e.preventDefault();
    };
    const clear = () => {
      touchStart.current = null;
      scrollTargetRef.current = null;
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
        if (pullRef.current !== 0) applyPull(0);
        setGuardingActive(false);
        return;
      }
      const next = resistPull(state.delta);
      const armed = next >= threshold;
      if (armed && !armedRef.current) haptics.impact("light");
      armedRef.current = armed;
      applyPull(Math.min(next, threshold * 1.6));
      setGuardingActive(true);
    },
    onEnd(state) {
      const committed = getScrollTop() <= 0 && state.delta > 0 && resistPull(state.delta) >= threshold;
      scrollTargetRef.current = null;
      armedRef.current = false;
      if (!committed) {
        applyPull(0);
        setGuardingActive(false);
        return;
      }
      applyPull(threshold * 0.75);
      setRefreshing(true);
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
          if (!mountedRef.current) return; // host unmounted mid-refresh (GES-011)
          applyPull(0);
          setRefreshing(false);
          setGuardingActive(false);
        });
    },
  });

  return (
    <div
      ref={rootRef}
      data-testid={testId}
      aria-busy={refreshing || undefined}
      {...drag.bind()}
      // axis:"y" defaults to pan-x, but PTR deliberately keeps pan-y: its own
      // non-passive touchmove listener does the top-edge arbitration (INT-DX-002).
      style={{ position: "relative", overflow: "hidden", height: "100%", ...drag.style, touchAction: "pan-y", ...style }}
    >
      {/* Announce refresh start/finish to AT; the spinner stays decorative (GES-005 / CC-05). */}
      <span role="status" aria-live="polite">
        {refreshing ? <TKVisuallyHidden>{refreshingLabel ?? locale.refreshing}</TKVisuallyHidden> : null}
      </span>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: showIndicator ? Math.max(renderedPull, 48) : 0,
          overflow: "hidden",
          zIndex: 2,
        }}
        ref={indicatorRef}
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
          transform: renderedPull ? `translateY(${renderedPull}px)` : undefined,
          transition: renderedPull ? "none" : "transform var(--tk-t2) var(--tk-ease)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
