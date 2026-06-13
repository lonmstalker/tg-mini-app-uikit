import { forwardRef, useCallback, useEffect, useId, useImperativeHandle, useRef, useState, type ReactNode, type Ref } from "react";
import { TKIconButton } from "../buttons";
import { mergeRefs, tkZ } from "../internal/dom";
import { tkShouldCommit, useDragGesture } from "../internal/useDragGesture";
import { useTKLocale } from "../i18n";
import { useBackIntercept } from "../telegram";
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

  const closeRequest = useRef(onClose);
  closeRequest.current = onClose;
  const requestClose = useCallback(() => {
    closeRequest.current?.();
  }, []);

  useOverlayA11y(mounted && !closing, ref, dismissible ? requestClose : undefined);
  // an open sheet handles the Telegram Back button before the nav stack
  useBackIntercept(mounted && !closing && dismissible, requestClose);

  const openChangeRef = useRef(onOpenChange);
  openChangeRef.current = onOpenChange;
  useEffect(() => {
    openChangeRef.current?.(open);
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
  return (
    <>
      <Scrim closing={closing} onClick={dismissible ? requestClose : undefined} />
      <div
        ref={mergeRefs(ref, forwardedRef)}
        data-testid={testId}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        style={{
          outline: "none",
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: tkZ.sheet,
          height: snapPoints ? `${(snapPoints[snap] ?? snapPoints[0]) * 100}%` : undefined,
          display: "flex",
          flexDirection: "column",
          background: "var(--tk-surface)",
          borderRadius: "var(--tk-r-xl) var(--tk-r-xl) 0 0",
          boxShadow: "var(--tk-shadow-lg)",
          padding: "8px 16px 16px",
          transform: dragY > 0 || (dragging && dragY !== 0) ? `translateY(${Math.max(0, dragY)}px)` : undefined,
          transition: dragging
            ? "none"
            : "height var(--tk-t3) var(--tk-spring), transform var(--tk-t2) var(--tk-ease)",
          animation: `${closing ? "tk-sheet-down" : "tk-sheet-up"} var(--tk-t3) ${closing ? "var(--tk-ease)" : "var(--tk-spring)"} both`,
        }}
      >
        <div {...grabDrag} style={{ touchAction: "none", margin: "-8px -16px 0", padding: "8px 16px 0" }}>
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
        <div style={{ flex: snapPoints ? 1 : undefined, minHeight: 0, overflowY: snapPoints ? "auto" : undefined }}>
          {children}
        </div>
      </div>
    </>
  );
});
