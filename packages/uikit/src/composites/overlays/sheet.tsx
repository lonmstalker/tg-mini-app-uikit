import { forwardRef, useCallback, useEffect, useId, useImperativeHandle, useRef, useState, type ReactNode, type Ref } from "react";
import { TKIconButton } from "../../atoms/buttons";
import { mergeRefs } from "../../internal/dom";
import { tkShouldCommit, useDragGesture } from "../../internal/useDragGesture";
import { useLatest } from "../../internal/useLatest";
import { useTKLocale } from "../../foundation/i18n";
import { Scrim, useModalOverlay, useMountTransition } from "./shared";

/* ---------------- Bottom sheet ---------------- */

export interface TKSheetHandle {
  /** Requests closing (calls `onClose`; the consumer owns the `open` state). */
  close: () => void;
  /** Animates to the given snap point index. */
  snapTo: (index: number) => void;
  /** Current snap point index. */
  readonly snapIndex: number;
}

export interface TKSheetProps {
  open: boolean;
  onClose?: () => void;
  /** Fires with the requested open state (mount, close request, swipe-close). */
  onOpenChange?: (open: boolean) => void;
  title?: ReactNode;
  children?: ReactNode;
  /** Hide the grabber handle. */
  noGrabber?: boolean;
  /**
   * Snap points as fractions of the positioned ancestor height (ascending),
   * e.g. `[0.4, 0.9]`. Without them the sheet sizes to its content.
   */
  snapPoints?: number[];
  /** Initial snap point index (default 0). */
  defaultSnap?: number;
  /** Set to false to disable closing via scrim, Escape and swipe. */
  dismissible?: boolean;
  /**
   * Whether the sheet is modal (default true). `false` renders no scrim and
   * skips background inerting, focus move/trap/restore, page scroll lock,
   * Escape/Telegram Back interception, and Telegram's vertical-swipe guard.
   * The close button and drag gestures remain available when dismissible.
   */
  modal?: boolean;
  /** Imperative API: `close()`, `snapTo(i)`, `snapIndex`. */
  sheetRef?: Ref<TKSheetHandle>;
  testId?: string;
}

export const TKSheet = /* @__PURE__ */ forwardRef<HTMLDivElement, TKSheetProps>(function TKSheet(
  {
    open,
    onClose,
    onOpenChange,
    title,
    children,
    noGrabber,
    snapPoints,
    defaultSnap = 0,
    dismissible = true,
    modal = true,
    sheetRef,
    testId,
  },
  forwardedRef,
) {
  const locale = useTKLocale();
  const ref = useRef<HTMLDivElement>(null);
  const { mounted, closing } = useMountTransition(open, 380, ref);
  const titleId = useId();
  // Dev guard: the swipe/snap math needs snapPoints to be ascending fractions in
  // (0,1]; descending/out-of-range values are silently clamped and misbehave, so
  // warn once instead of leaving the misconfig invisible (OVL-012).
  const snapWarnedRef = useRef(false);
  useEffect(() => {
    if (process.env.NODE_ENV === "production" || !snapPoints || snapWarnedRef.current) return;
    const bad = snapPoints.some((p, i) => p <= 0 || p > 1 || (i > 0 && p <= snapPoints[i - 1]));
    if (bad) {
      snapWarnedRef.current = true;
      console.warn(`TKSheet: snapPoints must be ascending fractions within (0,1]; got [${snapPoints.join(", ")}]`);
    }
  }, [snapPoints]);
  const [snap, setSnap] = useState(() =>
    snapPoints ? Math.min(Math.max(defaultSnap, 0), snapPoints.length - 1) : 0,
  );
  const snapRef = useLatest(snap);
  const [dragging, setDragging] = useState(false);
  // Per-gesture geometry, measured once at drag start: the finger then moves
  // the sheet through imperative transform writes — zero layout, zero React
  // commits per frame.
  const dragGeom = useRef<{ maxH: number; startY: number } | null>(null);
  // True once the entrance keyframes have played, so a partial drag-and-release
  // (or any later re-render) never re-runs the full `translateY(104%)→0` slide.
  const [settled, setSettled] = useState(false);

  const closeRequest = useLatest(onClose);
  const requestClose = useCallback(() => {
    closeRequest.current?.();
  }, []);

  // Five modal hooks (focus-trap, scroll-lock, swipe-guard, z-stack, Back) in one
  // ordered call; `onClose` is gated by `dismissible` so the a11y Escape and the
  // Back button both no-op when the sheet is non-dismissible (INT-DX-001).
  const { scrimZ, panelZ } = useModalOverlay({
    mounted,
    active: modal && mounted && !closing,
    ref,
    onClose: dismissible ? requestClose : undefined,
    scrollLock: modal,
    swipeGuard: modal,
    inertBackground: modal,
  });

  const openChangeRef = useLatest(onOpenChange);
  useEffect(() => {
    openChangeRef.current?.(open);
    // Each fresh open replays the entrance keyframes once; `settled` then pins
    // the sheet so a drag-release returns via the inline transform/transition.
    if (open) setSettled(false);
  }, [open]);

  useImperativeHandle(
    sheetRef,
    () => ({
      close: requestClose,
      snapTo: (index: number) => {
        if (!snapPoints) return;
        setSnap(Math.min(Math.max(index, 0), snapPoints.length - 1));
      },
      get snapIndex() {
        return snapRef.current;
      },
    }),
    [requestClose, snapPoints],
  );

  const grabDrag = useDragGesture({
    axis: "y",
    enabled: dismissible || !!snapPoints,
    cancelOnCrossAxis: false,
    onStart: () => {
      setDragging(true);
      const el = ref.current;
      const maxH = el?.clientHeight ?? 400;
      const fMax = snapPoints?.[snapPoints.length - 1] ?? 1;
      const f = snapPoints?.[snapRef.current] ?? fMax;
      dragGeom.current = { maxH, startY: snapPoints && fMax > 0 ? maxH * (1 - f / fMax) : 0 };
      // Kill the transition before the first move — React's `dragging` commit
      // lands a beat later, and the finger must never be eased after.
      if (el) el.style.transitionDuration = "0s";
    },
    onMove: (state) => {
      const el = ref.current;
      const g = dragGeom.current;
      if (!el || !g) return;
      // 1:1 behind the finger, compositor-only: no setState, no layout.
      const y = snapPoints ? Math.min(Math.max(g.startY + state.delta, 0), g.maxH) : Math.max(0, state.delta);
      el.style.transform = `translateY(${y}px)`;
    },
    onEnd: (state) => {
      const el = ref.current;
      const g = dragGeom.current;
      dragGeom.current = null;
      setDragging(false);
      // The sheet is settled by this interaction — never replay the entrance.
      setSettled(true);
      const maxH = g?.maxH ?? el?.clientHeight ?? 400;
      const fMax = snapPoints?.[snapPoints.length - 1] ?? 1;
      // Commit thresholds are relative to the VISIBLE height at gesture start
      // (the current snap), not the pinned max-snap height.
      const size = maxH - (g?.startY ?? 0);
      let nextSnap = snapRef.current;
      let close = false;
      if (state.delta > 0 && tkShouldCommit(state.delta, state.velocity, size)) {
        // swiping down: step down a snap point, close from the lowest
        if (snapPoints && snapRef.current > 0) nextSnap = snapRef.current - 1;
        else if (dismissible) close = true;
      } else if (
        state.delta < 0 &&
        snapPoints &&
        snapRef.current < snapPoints.length - 1 &&
        tkShouldCommit(-state.delta, -state.velocity, size)
      ) {
        nextSnap = snapRef.current + 1;
      }
      if (el) {
        el.style.transitionDuration = "";
        // On close the exit keyframes pick the slide up from under the finger
        // (tk-sheet-down has no `from`). Otherwise glide to the resting offset
        // of the (possibly unchanged) snap — React skips the style write when
        // its rendered value didn't change, so this write drives the return.
        if (!close) {
          const f = snapPoints?.[nextSnap] ?? fMax;
          el.style.transform = `translateY(${snapPoints && fMax > 0 ? maxH * (1 - f / fMax) : 0}px)`;
        }
      }
      if (close) requestClose();
      else if (nextSnap !== snapRef.current) setSnap(nextSnap);
    },
  });

  if (!mounted) return null;
  // ----- resting geometry -----
  // The height is pinned to the TALLEST snap point; the current snap is a
  // translateY offset and the visible box (header + content) is clipped by an
  // inner wrapper sized to the current snap. Drags and snap transitions are
  // transform-only — the layout never changes per frame.
  const fMax = snapPoints ? (snapPoints[snapPoints.length - 1] ?? 1) : 1;
  const fBase = snapPoints ? (snapPoints[snap] ?? snapPoints[0] ?? fMax) : fMax;
  const restPct = snapPoints && fMax > 0 ? (1 - fBase / fMax) * 100 : 0;
  const height = snapPoints ? `${fMax * 100}%` : undefined;
  // Content mode: size to content but cap it so a long sheet can't grow past
  // the top safe area, and let the body scroll instead of pushing its header
  // (and the close button) off-screen.
  const maxHeight = snapPoints ? undefined : "calc(100% - var(--tk-safe-top) - 24px)";
  const animation = closing
    ? "tk-sheet-down var(--tk-t3) var(--tk-ease) both"
    : settled || dragging
      ? "none"
      : "tk-sheet-up var(--tk-t3) var(--tk-spring) both";
  return (
    <>
      {modal ? <Scrim closing={closing} onClick={dismissible ? requestClose : undefined} z={scrimZ} /> : null}
      <div
        ref={mergeRefs(ref, forwardedRef)}
        data-testid={testId}
        role="dialog"
        aria-modal={modal || undefined}
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        onAnimationEnd={(e) => {
          if (e.animationName === "tk-sheet-up") setSettled(true);
        }}
        style={{
          outline: "none",
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: panelZ,
          height,
          maxHeight,
          display: "flex",
          flexDirection: "column",
          background: "var(--tk-surface)",
          borderRadius: "var(--tk-r-xl) var(--tk-r-xl) 0 0",
          boxShadow: "var(--tk-shadow-lg)",
          // Transform is ALWAYS set (translateY(0%) at full height) and the
          // transition list is constant — a drag only zeroes the duration, so
          // the compositor never re-parses a property-list flip mid-gesture.
          transform: `translateY(${restPct}%)`,
          transition: "transform var(--tk-t3) var(--tk-spring)",
          transitionDuration: dragging ? "0s" : undefined,
          // Promote to a compositor layer for the entrance/exit/drag window
          // only — a permanent will-change leaks a layer per sheet.
          willChange: settled && !closing && !dragging ? undefined : "transform",
          // Entrance keyframes only on the first open (until `settled`); during
          // a drag the imperative transform drives the sheet instead, so the
          // finger tracks it and a partial drag returns without re-sliding in.
          animation,
        }}
      >
        {/* The visible box: sized to the CURRENT snap (the sheet itself stays at
            the tallest snap), so the content clips where the user sees the
            sheet end. Resizes once per snap commit — never during a drag. */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            padding: "8px 16px calc(16px + var(--tk-safe-bottom))",
            ...(snapPoints
              ? {
                  position: "absolute" as const,
                  top: 0,
                  left: 0,
                  right: 0,
                  height: `${fMax > 0 ? (fBase / fMax) * 100 : 100}%`,
                }
              : { flex: "0 1 auto" as const }),
          }}
        >
          {/* Full-claim surface: override drag.style's pan-x with touch-action:none. */}
          <div
            {...grabDrag.bind()}
            data-tk-sheet-grab=""
            style={{ flexShrink: 0, touchAction: "none", margin: "-8px -16px 0", padding: "8px 16px 0" }}
          >
            {!noGrabber ? (
              <div
                style={{
                  width: 36,
                  height: 4.5,
                  borderRadius: 3,
                  background: "var(--tk-surface-3)",
                  margin: "4px auto 14px",
                }}
              />
            ) : null}
            {title ? (
              <div
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}
              >
                <div id={titleId} style={{ fontSize: "var(--tk-fz-title3)", fontWeight: 700 }}>{title}</div>
                <TKIconButton
                  icon="close"
                  size={30}
                  variant="surface"
                  label={locale.close}
                  onClick={requestClose}
                  style={{ background: "var(--tk-surface-2)", boxShadow: "none", color: "var(--tk-text-2)" }}
                />
              </div>
            ) : null}
          </div>
          <div
            style={{
              flex: snapPoints ? 1 : "0 1 auto",
              minHeight: 0,
              overflowY: "auto",
              overscrollBehavior: "contain",
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </>
  );
});
