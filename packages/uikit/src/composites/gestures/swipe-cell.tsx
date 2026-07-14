import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { TKIcon, type TKIconName } from "../../atoms/icons";
import { useOptionalHaptics } from "../../foundation/telegram";
import { useTKLocale } from "../../foundation/i18n";
import { tkShouldCommit, useDragGesture } from "../../internal/useDragGesture";

/* ---------------- Swipe cell ---------------- */

export interface TKSwipeAction {
  label: string;
  icon?: TKIconName;
  tone?: "accent" | "red" | "green" | "orange" | "gray";
  /**
   * Marks the action as destructive (delete, etc.). A destructive first action
   * never auto-fires on `fullSwipe` over-swipe — it opens the row for a tap
   * instead (GES-007/CC-01). Defaults to `true` for `tone:"red"`, so colour
   * alone still guards; set it explicitly when the destructive action isn't red.
   */
  destructive?: boolean;
  onAction: () => void;
}

export interface TKSwipeCellProps {
  children?: ReactNode;
  /** Actions revealed by swiping right (start side). */
  leading?: TKSwipeAction[];
  /** Actions revealed by swiping left (end side). */
  trailing?: TKSwipeAction[];
  /**
   * A swipe across most of the row fires the first action of that side. Default
   * `false` so a micro/over-swipe can't auto-fire a destructive action without a
   * deliberate tap (GES-007/CC-01). When enabled, a `tone:"red"` (destructive)
   * first action still does NOT auto-fire — it opens the row so the user confirms
   * by tapping the revealed button.
   */
  fullSwipe?: boolean;
  /**
   * Corner radius of the row. The cell clips with `overflow:hidden` to mask the
   * sliding actions, so wrapping a rounded card needs this to match — otherwise
   * the card's corners are clipped square. Default 0 (flat list cells).
   */
  radius?: string | number;
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
export function TKSwipeCell({ children, leading = [], trailing = [], fullSwipe = false, radius, testId, style }: TKSwipeCellProps) {
  const haptics = useOptionalHaptics();
  const locale = useTKLocale();
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [focused, setFocused] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(Symbol("swipecell"));

  useEffect(() => {
    const close = (e: Event) => {
      if ((e as CustomEvent).detail !== idRef.current) setOffset(0);
    };
    document.addEventListener(OPEN_EVENT, close);
    return () => document.removeEventListener(OPEN_EVENT, close);
  }, []);

  // Tap anywhere outside an open row to close it (mirrors iOS Mail).
  useEffect(() => {
    if (offset === 0 || typeof document === "undefined") return;
    const onDown = (e: PointerEvent) => {
      const root = rootRef.current;
      if (root && !root.contains(e.target as Node)) setOffset(0);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [offset]);

  const announceOpen = () => document.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: idRef.current }));

  const startOffset = useRef(0);
  // Cached once per gesture — the finger then moves the row through imperative
  // transform writes (no setState, no clientWidth reads per frame).
  const widthRef = useRef(320);
  const contentRef = useRef<HTMLDivElement>(null);
  const drag = useDragGesture({
    axis: "x",
    onStart() {
      startOffset.current = offset;
      widthRef.current = rootRef.current?.clientWidth ?? 320;
      // Kill the transition before the first move — React's `dragging` commit
      // lands a beat later, and the finger must never be eased after.
      if (contentRef.current) contentRef.current.style.transitionDuration = "0s";
      setDragging(true);
    },
    onMove(state) {
      const el = contentRef.current;
      if (!el) return;
      const maxLeft = trailing.length * ACTION_W;
      const maxRight = leading.length * ACTION_W;
      const width = widthRef.current;
      const raw = startOffset.current + state.delta;
      const limit = fullSwipe ? width : Math.max(maxLeft, maxRight);
      const next = Math.max(-Math.min(limit, width), Math.min(Math.min(limit, width), raw));
      el.style.transform = `translateX(${next}px)`;
    },
    onEnd(state) {
      setDragging(false);
      const width = widthRef.current;
      const raw = startOffset.current + state.delta;
      const side = raw < 0 ? trailing : leading;
      const max = side.length * ACTION_W;
      // The rest position is also written imperatively: when the offset state
      // doesn't change (release below the commit point), React skips the style
      // write and this glide back is the only one the user gets.
      const settle = (next: number) => {
        const el = contentRef.current;
        if (el) {
          el.style.transitionDuration = "";
          el.style.transform = `translateX(${next}px)`;
        }
        setOffset(next);
      };
      // Full-swipe auto-fire — but never for a destructive first action; that one
      // opens the row so the user confirms with a tap (GES-007/CC-01). `tone:"red"`
      // implies destructive unless overridden via `destructive:false`.
      const destructive = side[0]?.destructive ?? side[0]?.tone === "red";
      if (fullSwipe && side.length && Math.abs(raw) > width * 0.6 && !destructive) {
        haptics.impact("medium");
        settle(0);
        side[0].onAction();
        return;
      }
      const open = tkShouldCommit(Math.abs(raw) - max / 2, Math.abs(state.velocity), max) || Math.abs(raw) > max / 2;
      if (open && side.length) {
        settle(raw < 0 ? -max : max);
        announceOpen();
      } else {
        settle(0);
      }
    },
  });

  const renderActions = (actions: TKSwipeAction[], side: "leading" | "trailing") =>
    actions.length ? (
      <div
        // Group the rail's actions so AT announces them as a set, not loose buttons (GES-006).
        role="group"
        aria-label={side === "leading" ? locale.leadingActions : locale.trailingActions}
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          [side === "leading" ? "left" : "right"]: 0,
          display: "flex",
          // Hidden until the row is opened, dragged or a button is keyboard-focused.
          opacity: offset === 0 && !dragging && !focused ? 0 : 1,
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
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
              width: ACTION_W,
              border: "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              background: SWIPE_TONES[action.tone ?? "accent"],
              color: "var(--tk-on-accent, #fff)",
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
      {...drag.bind()}
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: radius,
        // axis:"x" → drag.style gives touch-action: pan-y (release native vertical scroll)
        ...drag.style,
        userSelect: "none",
        WebkitUserSelect: "none",
        ...style,
      }}
    >
      {renderActions(leading, "leading")}
      {renderActions(trailing, "trailing")}
      <div
        ref={contentRef}
        style={{
          position: "relative",
          background: "var(--tk-surface)",
          // Always-set transform + constant transition list; a drag only zeroes
          // the duration and moves the row imperatively (drag onMove).
          transform: `translateX(${offset}px)`,
          transition: "transform var(--tk-t2) var(--tk-ease)",
          transitionDuration: dragging ? "0s" : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
}
