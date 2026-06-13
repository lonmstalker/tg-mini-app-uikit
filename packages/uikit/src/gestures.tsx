import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from "react";
import { TKIcon, type TKIconName } from "./icons";
import { TKSpinner } from "./buttons";
import { useDragGesture, tkShouldCommit } from "./internal/useDragGesture";
import { useOptionalHaptics } from "./telegram";

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

  const resist = (delta: number) => Math.max(0, delta) * 0.5;

  const drag = useDragGesture({
    axis: "y",
    enabled: !disabled && !refreshing,
    onMove(state) {
      if ((scrollRef.current?.scrollTop ?? 0) > 0) return; // only from the very top
      const next = resist(state.delta);
      const armed = next >= threshold;
      if (armed && !armedRef.current) haptics.impact("light"); // threshold crossed
      armedRef.current = armed;
      setPull(Math.min(next, threshold * 1.6));
    },
    onEnd(state) {
      const committed = (scrollRef.current?.scrollTop ?? 0) <= 0 && resist(state.delta) >= threshold;
      armedRef.current = false;
      if (!committed) {
        setPull(0);
        return;
      }
      setRefreshing(true);
      setPull(threshold * 0.75);
      Promise.resolve(onRefresh()).finally(() => {
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

/* ---------------- Swipe cell ---------------- */

export interface TKSwipeAction {
  label: string;
  icon?: TKIconName;
  tone?: "accent" | "red" | "green" | "orange" | "gray";
  onAction: () => void;
}

export interface TKSwipeCellProps {
  children?: ReactNode;
  /** Actions revealed by swiping right (start side). */
  leading?: TKSwipeAction[];
  /** Actions revealed by swiping left (end side). */
  trailing?: TKSwipeAction[];
  /** A swipe across most of the row fires the first action of that side. */
  fullSwipe?: boolean;
  testId?: string;
  style?: CSSProperties;
}

const SWIPE_TONES: Record<NonNullable<TKSwipeAction["tone"]>, string> = {
  accent: "var(--tk-accent)",
  red: "var(--tk-red)",
  green: "var(--tk-green)",
  orange: "var(--tk-orange)",
  gray: "var(--tk-text-2)",
};

const ACTION_W = 76;
const OPEN_EVENT = "tk-swipecell-open";

/**
 * iOS-style swipeable row: wrap a `TKCell` (or any row) to reveal leading /
 * trailing actions. Opening one row closes its siblings; a full swipe fires
 * the first action. The buttons stay keyboard-reachable without gestures.
 */
export function TKSwipeCell({ children, leading = [], trailing = [], fullSwipe = true, testId, style }: TKSwipeCellProps) {
  const haptics = useOptionalHaptics();
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(Symbol("swipecell"));

  // opening any row closes the others
  useEffect(() => {
    const close = (e: Event) => {
      if ((e as CustomEvent).detail !== idRef.current) setOffset(0);
    };
    document.addEventListener(OPEN_EVENT, close);
    return () => document.removeEventListener(OPEN_EVENT, close);
  }, []);

  const announceOpen = () => document.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: idRef.current }));

  const startOffset = useRef(0);
  const drag = useDragGesture({
    axis: "x",
    onStart() {
      startOffset.current = offset;
      setDragging(true);
    },
    onMove(state) {
      const maxLeft = trailing.length * ACTION_W;
      const maxRight = leading.length * ACTION_W;
      const width = rootRef.current?.clientWidth ?? 320;
      const raw = startOffset.current + state.delta;
      const limit = fullSwipe ? width : Math.max(maxLeft, maxRight);
      setOffset(Math.max(-Math.min(limit, width), Math.min(Math.min(limit, width), raw)));
    },
    onEnd(state) {
      setDragging(false);
      const width = rootRef.current?.clientWidth ?? 320;
      const raw = startOffset.current + state.delta;
      const side = raw < 0 ? trailing : leading;
      const max = side.length * ACTION_W;
      if (fullSwipe && side.length && Math.abs(raw) > width * 0.6) {
        haptics.impact("medium");
        setOffset(0);
        side[0].onAction();
        return;
      }
      const open = tkShouldCommit(Math.abs(raw) - max / 2, Math.abs(state.velocity), max) || Math.abs(raw) > max / 2;
      if (open && side.length) {
        setOffset(raw < 0 ? -max : max);
        announceOpen();
      } else {
        setOffset(0);
      }
    },
  });

  const renderActions = (actions: TKSwipeAction[], side: "leading" | "trailing") =>
    actions.length ? (
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          [side === "leading" ? "left" : "right"]: 0,
          display: "flex",
          // keyboard users reach the buttons without any gesture
          ...(offset === 0 ? { opacity: 0 } : null),
        }}
      >
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() => {
              setOffset(0);
              action.onAction();
            }}
            onFocus={(e) => (e.currentTarget.parentElement!.style.opacity = "1")}
            onBlur={(e) => {
              if (offset === 0) e.currentTarget.parentElement!.style.opacity = "0";
            }}
            style={{
              width: ACTION_W,
              border: "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              background: SWIPE_TONES[action.tone ?? "accent"],
              color: "#fff",
              fontFamily: "inherit",
              fontSize: "var(--tk-fz-caption)",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {action.icon ? <TKIcon name={action.icon} size={18} /> : null}
            {action.label}
          </button>
        ))}
      </div>
    ) : null;

  return (
    <div
      ref={rootRef}
      data-testid={testId}
      {...drag}
      style={{
        position: "relative",
        overflow: "hidden",
        touchAction: "pan-y",
        // the horizontal gesture must never start a text selection / native drag
        userSelect: "none",
        WebkitUserSelect: "none",
        ...style,
      }}
    >
      {renderActions(leading, "leading")}
      {renderActions(trailing, "trailing")}
      <div
        style={{
          position: "relative",
          background: "var(--tk-surface)",
          transform: offset ? `translateX(${offset}px)` : undefined,
          transition: dragging ? "none" : "transform var(--tk-t2) var(--tk-ease)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
