import { forwardRef, useCallback, useEffect, useId, useImperativeHandle, useRef, useState, type ReactNode, type Ref } from "react";
import { TKIconButton } from "../../atoms/buttons";
import { mergeRefs } from "../../internal/dom";
import { tkShouldCommit, useDragGesture } from "../../internal/useDragGesture";
import { useScrollLock } from "../../internal/useScrollLock";
import { useOverlayLayer } from "../../internal/useOverlayLayer";
import { useVerticalSwipeGuard } from "../../internal/useVerticalSwipeGuard";
import { useTKLocale } from "../../foundation/i18n";
import { useBackIntercept } from "../../foundation/telegram";
import { Scrim, useMountTransition, useOverlayA11y } from "./shared";

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
    sheetRef,
    testId,
  },
  forwardedRef,
) {
  const locale = useTKLocale();
  const { mounted, closing } = useMountTransition(open, 380);
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const [snap, setSnap] = useState(() =>
    snapPoints ? Math.min(Math.max(defaultSnap, 0), snapPoints.length - 1) : 0,
  );
  const snapRef = useRef(snap);
  snapRef.current = snap;
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  // True once the entrance keyframes have played, so a partial drag-and-release
  // (or any later re-render) never re-runs the full `translateY(104%)→0` slide.
  const [settled, setSettled] = useState(false);

  const closeRequest = useRef(onClose);
  closeRequest.current = onClose;
  const requestClose = useCallback(() => {
    closeRequest.current?.();
  }, []);

  useOverlayA11y(mounted && !closing, ref, dismissible ? requestClose : undefined);
  // lock page scroll while the sheet is mounted (covers the closing animation)
  useScrollLock(mounted);
  // disable Telegram's swipe-down-to-minimize so a downward drag / overscroll
  // here steps snap points or closes the sheet instead of collapsing the app
  useVerticalSwipeGuard(mounted);
  // stack above any overlay opened before this one (scrim covers it too)
  const layer = useOverlayLayer(mounted);
  // an open sheet handles the Telegram Back button before the nav stack
  useBackIntercept(mounted && !closing && dismissible, requestClose);

  const openChangeRef = useRef(onOpenChange);
  openChangeRef.current = onOpenChange;
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
    onStart: () => setDragging(true),
    onMove: (state) => setDragY(snapPoints ? state.delta : Math.max(0, state.delta)),
    onEnd: (state) => {
      setDragging(false);
      setDragY(0);
      // The sheet is settled by this interaction — never replay the entrance.
      setSettled(true);
      const height = ref.current?.clientHeight ?? 400;
      if (state.delta > 0 && tkShouldCommit(state.delta, state.velocity, height)) {
        // swiping down: step down a snap point, close from the lowest
        if (snapPoints && snapRef.current > 0) setSnap(snapRef.current - 1);
        else if (dismissible) requestClose();
      } else if (state.delta < 0 && snapPoints && snapRef.current < snapPoints.length - 1) {
        if (tkShouldCommit(-state.delta, -state.velocity, height)) setSnap(snapRef.current + 1);
      }
    },
  });

  if (!mounted) return null;
  // ----- drag-driven geometry -----
  const dragOffset = dragging || dragY !== 0;
  // Snap mode drives the HEIGHT live: a downward drag shrinks the sheet, an
  // upward drag GROWS it (the old `Math.max(0, dragY)` clamp froze upward
  // drags), clamped between fully closed and the tallest snap point. The sign
  // is baked into the calc because CSS rejects `calc(40% - -50px)`.
  const baseSnapPct = snapPoints ? (snapPoints[snap] ?? snapPoints[0]) * 100 : 0;
  const maxSnapPct = snapPoints ? (snapPoints[snapPoints.length - 1] ?? baseSnapPct / 100) * 100 : 0;
  const dragPx = -dragY; // > 0 grows, < 0 shrinks
  const dragSign = dragPx >= 0 ? "+" : "-";
  const height = snapPoints
    ? dragOffset
      ? `clamp(0px, calc(${baseSnapPct}% ${dragSign} ${Math.abs(dragPx)}px), ${maxSnapPct}%)`
      : `${baseSnapPct}%`
    : undefined;
  // Content mode: size to content but cap it so a long sheet can't grow past
  // the top safe area, and let the body scroll instead of pushing its header
  // (and the close button) off-screen.
  const maxHeight = snapPoints ? undefined : "calc(100% - var(--tk-safe-top) - 24px)";
  const transform = !snapPoints && dragY > 0 ? `translateY(${dragY}px)` : undefined;
  const animation = closing
    ? "tk-sheet-down var(--tk-t3) var(--tk-ease) both"
    : settled || dragOffset
      ? "none"
      : "tk-sheet-up var(--tk-t3) var(--tk-spring) both";
  return (
    <>
      <Scrim closing={closing} onClick={dismissible ? requestClose : undefined} z={layer.scrimZ} />
      <div
        ref={mergeRefs(ref, forwardedRef)}
        data-testid={testId}
        role="dialog"
        aria-modal="true"
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
          zIndex: layer.panelZ,
          height,
          maxHeight,
          display: "flex",
          flexDirection: "column",
          background: "var(--tk-surface)",
          borderRadius: "var(--tk-r-xl) var(--tk-r-xl) 0 0",
          boxShadow: "var(--tk-shadow-lg)",
          padding: "8px 16px calc(16px + var(--tk-safe-bottom))",
          transform,
          transition: dragging
            ? "none"
            : "height var(--tk-t3) var(--tk-spring), transform var(--tk-t2) var(--tk-ease)",
          // Entrance keyframes only on the first open (until `settled`); during
          // a drag the inline transform/height drive the sheet instead, so the
          // finger tracks it and a partial drag returns without re-sliding in.
          animation,
        }}
      >
        <div {...grabDrag} style={{ flexShrink: 0, touchAction: "none", margin: "-8px -16px 0", padding: "8px 16px 0" }}>
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
    </>
  );
});
