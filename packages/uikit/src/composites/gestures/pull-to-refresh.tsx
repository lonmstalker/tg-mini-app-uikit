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
  className?: string;
  /** Merged onto the root LAST — consumer values win (REU-007). */
  style?: CSSProperties;
}

const resistPull = (delta: number) => Math.max(0, delta) * 0.5;

// The indicator is a FIXED 48px box that slides in via transform — the pull
// never writes layout properties, so a pull frame is compositor-only (the
// old `height` write + scrollTop read pair forced a reflow every frame).
const indicatorTransform = (pull: number, resting: boolean) =>
  pull > 2 || resting ? `translateY(${(Math.max(pull, 48) - 48) / 2}px)` : "translateY(-56px)";

// A hidden scroller (display:none keep-mount tab) pins scrollTop at 0 forever
// and must not vote in the pull gate. checkVisibility where available (also
// covers visibility/content-visibility); otherwise walk for display:none —
// older WebKit and jsdom lack checkVisibility, and offsetParent is useless in
// jsdom (always null).
function tkIsVisible(el: HTMLElement): boolean {
  if (typeof el.checkVisibility === "function") return el.checkVisibility();
  for (let node: HTMLElement | null = el; node; node = node.parentElement) {
    if (getComputedStyle(node).display === "none") return false;
  }
  return true;
}

/**
 * Wraps a scroll area with the pull-to-refresh gesture: a resisted pull from
 * the very top, a spinner while `onRefresh` runs, auto-hide afterwards.
 */
export function TKPullToRefresh({ children, onRefresh, threshold = 72, disabled, refreshingLabel, testId, className, style }: TKPullToRefreshProps) {
  const locale = useTKLocale();
  const [guarding, setGuarding] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const spinnerRef = useRef<HTMLSpanElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollTargetsRef = useRef<HTMLElement[] | null>(null);
  const pullRef = useRef(0);
  const armedRef = useRef(false);
  const guardingRef = useRef(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  // Skip the post-refresh setState if the host unmounted mid-flight (GES-011).
  // Re-armed on mount: StrictMode runs the cleanup once during its dev
  // double-invoke, and a ref initializer alone would leave this false forever.
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => void (mountedRef.current = false);
  }, []);
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
  // The gate reads ALL plausible scrollers and takes the max scrollTop — a
  // single "winner" target shadowed the real one twice (GES-103 recurrence):
  // an at-top ancestor hid PTR's own mid-list wrapper, and a display:none
  // keep-mount tab (scrollTop pinned at 0) hid the visible tab's scroller.
  const resolveScrollTargets = () => {
    if (scrollTargetsRef.current?.every((el) => el.isConnected)) return scrollTargetsRef.current;
    const targets: HTMLElement[] = [];
    // (1) The intended composition: PTR wraps the scroller (a TKPage inside) —
    // every VISIBLE one; hidden keep-mount tabs are not scrolling anywhere.
    const inner = [...(scrollRef.current?.querySelectorAll<HTMLElement>("[data-tk-page-scroll]") ?? [])].filter(
      tkIsVisible,
    );
    targets.push(...inner);
    // (2) PTR misplaced INSIDE a page scroller: the gate must read the ANCESTOR's
    // scrollTop, or a mid-list pull hijacks the scroll (preventDefault) and
    // fires hidden refreshes (GES-103).
    if (inner.length === 0) {
      const outer = rootRef.current?.parentElement?.closest<HTMLElement>("[data-tk-page-scroll]") ?? null;
      if (outer) {
        targets.push(outer);
        if (process.env.NODE_ENV !== "production" && !warnedAncestorRef.current) {
          warnedAncestorRef.current = true;
          // eslint-disable-next-line no-console
          console.warn(
            "TKPullToRefresh: the page scroller is an ANCESTOR of the gesture area. Wrap the scroller itself, or prefer TKPage onRefresh which wires this correctly.",
          );
        }
      }
    }
    // (3) PTR's own wrapper participates whenever it actually scrolls — it can
    // out-scroll the page candidates, so it must never be shadowed by them.
    if (scrollRef.current && scrollRef.current.scrollHeight > scrollRef.current.clientHeight) {
      targets.push(scrollRef.current);
    }
    scrollTargetsRef.current = targets;
    return targets;
  };
  const getScrollTop = () => {
    let top = 0;
    for (const el of resolveScrollTargets()) top = Math.max(top, el.scrollTop);
    return top;
  };
  const applyPull = (nextPull: number) => {
    const next = Math.max(0, nextPull);
    pullRef.current = next;
    if (indicatorRef.current) {
      indicatorRef.current.style.transform = indicatorTransform(next, false);
      indicatorRef.current.style.transition = next ? "none" : "transform var(--tk-t2) var(--tk-ease)";
    }
    if (spinnerRef.current) {
      // iOS UIRefreshControl feel: the spinner turns and grows with the pull
      // distance (transform only), then TKSpinner's own rotation takes over
      // while refreshing.
      const p = Math.min(1, next / threshold);
      spinnerRef.current.style.transform = next ? `rotate(${p * 270}deg) scale(${0.6 + 0.4 * p})` : "";
      spinnerRef.current.style.transition = next ? "none" : "transform var(--tk-t2) var(--tk-ease)";
    }
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
  // hijacking the gesture (no pointercancel) so the pointer drag runs.
  //
  // Perf contract: scrollTop is read ONCE per touch (at touchstart) and the
  // non-passive listener is attached only when that read said "at top" — a
  // mid-list scroll never runs a blocking touchmove handler and never reads
  // layout per frame. While a pull holds preventDefault the list cannot
  // scroll, so the sample stays valid for the whole gesture.
  // ponytail: a scroll-away-then-pull-back inside ONE touch can pull from a
  // non-zero scrollTop; re-sample on direction flips if it ever matters.
  const atTopRef = useRef(false);
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onMove = (e: TouchEvent) => {
      const s = touchStart.current;
      if (!s || disabled || refreshing || e.touches.length !== 1) return;
      const dy = e.touches[0].clientY - s.y;
      const dx = e.touches[0].clientX - s.x;
      if (dy > 0 && dy > Math.abs(dx) && atTopRef.current) e.preventDefault();
    };
    const onStart = (e: TouchEvent) => {
      touchStart.current = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null;
      if (!touchStart.current) return;
      resolveScrollTargets();
      atTopRef.current = getScrollTop() <= 0;
      if (atTopRef.current && !disabled && !refreshing) {
        el.addEventListener("touchmove", onMove, { passive: false });
        // Telegram's swipe-to-minimize is muted from the touchstart, not from
        // the 14px activation threshold — the first frames of a fast pull must
        // not race the app-collapse gesture.
        setGuardingActive(true);
      }
    };
    const clear = () => {
      touchStart.current = null;
      scrollTargetsRef.current = null;
      atTopRef.current = false;
      el.removeEventListener("touchmove", onMove);
      // `refreshing` keeps the swipe guard up on its own (guarding || refreshing).
      setGuardingActive(false);
    };
    el.addEventListener("touchstart", onStart, { passive: true });
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
    onStart() {
      // Pointer-only environments (desktop, tests) have no touchstart to sample
      // the top-of-list gate — take the one read here instead.
      if (touchStart.current === null) {
        resolveScrollTargets();
        atTopRef.current = getScrollTop() <= 0;
      }
    },
    onMove(state) {
      // Only pull when the touch started at the very top AND moves downward —
      // an upward or mid-list drag is a scroll and must not be hijacked. The
      // gate was sampled at gesture start: no layout reads per frame.
      if (!atTopRef.current || state.delta <= 0) {
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
      const committed = atTopRef.current && state.delta > 0 && resistPull(state.delta) >= threshold;
      scrollTargetsRef.current = null;
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
      data-tk-ptr=""
      data-testid={testId}
      className={className}
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
          // Fixed-size box, revealed by transform (the root's overflow:hidden
          // clips it away at rest) — pulls never write layout properties.
          height: 48,
          transform: indicatorTransform(renderedPull, showIndicator),
          transition: renderedPull ? "none" : "transform var(--tk-t2) var(--tk-ease)",
          zIndex: 2,
        }}
        ref={indicatorRef}
      >
        <span
          ref={spinnerRef}
          className="tk-ptr"
          style={{
            transform: renderedPull ? `rotate(${Math.min(1, renderedPull / threshold) * 270}deg) scale(${0.6 + 0.4 * Math.min(1, renderedPull / threshold)})` : undefined,
          }}
        >
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
