import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { TKIcon, type TKIconName } from "../../atoms/icons";
import { useOptionalHaptics } from "../../foundation/telegram";
import { tkShouldCommit, useDragGesture } from "../../internal/useDragGesture";

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
