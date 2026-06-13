import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type Ref,
  type RefObject,
} from "react";
import { TKIcon, type TKIconName } from "./icons";
import { TKIconButton } from "./buttons";
import { mergeRefs, tkZ } from "./internal/dom";
import { tkShouldCommit, useDragGesture } from "./internal/useDragGesture";
import { useTKLocale } from "./i18n";
import { useBackIntercept } from "./telegram";

/*
 * Overlays position themselves against the nearest positioned ancestor —
 * normally the `TKProvider` root (it is `position: relative` by default).
 * That keeps them working both full-screen and inside device-frame demos.
 */

/* ---------------- Mini viewport (frame for embedding overlay areas) ---------------- */

export interface TKFrameProps {
  children?: ReactNode;
  height?: number | string;
  testId?: string;
  style?: CSSProperties;
}

export function TKFrame({ children, height = 520, testId, style }: TKFrameProps) {
  return (
    <div
      data-testid={testId}
      style={{
        position: "relative",
        overflow: "hidden",
        height,
        borderRadius: "var(--tk-r-xl)",
        background: "var(--tk-bg)",
        boxShadow: "inset 0 0 0 1px var(--tk-sep)",
        display: "flex",
        flexDirection: "column",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ---------------- Mount/closing transition helper ---------------- */

function useMountTransition(open: boolean, closeMs: number) {
  const [state, setState] = useState<"closed" | "open" | "closing">(open ? "open" : "closed");
  const stateRef = useRef(state);
  stateRef.current = state;
  useEffect(() => {
    if (open) {
      setState("open");
      return;
    }
    if (stateRef.current === "closed") return;
    setState("closing");
    const t = window.setTimeout(() => setState("closed"), closeMs);
    return () => window.clearTimeout(t);
  }, [open, closeMs]);
  return { mounted: state !== "closed", closing: state === "closing" };
}

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Modal keyboard behavior: moves focus into the overlay, traps Tab inside,
 * closes on Escape and returns focus to the previously focused element.
 */
function useOverlayA11y(
  active: boolean,
  ref: RefObject<HTMLDivElement | null>,
  onClose?: () => void,
  onConfirm?: () => void,
) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const confirmRef = useRef(onConfirm);
  confirmRef.current = onConfirm;
  useEffect(() => {
    if (!active) return;
    const node = ref.current;
    const prev = typeof document !== "undefined" ? (document.activeElement as HTMLElement | null) : null;
    const first = node?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? node)?.focus({ preventScroll: true });

    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        closeRef.current?.();
        return;
      }
      if (e.key === "Enter" && confirmRef.current) {
        // Enter confirms the single primary action — unless the user is
        // interacting with a control that consumes Enter itself.
        const tag = (e.target as HTMLElement | null)?.tagName;
        if (tag !== "TEXTAREA" && tag !== "INPUT" && tag !== "SELECT" && tag !== "A" && tag !== "BUTTON") {
          e.preventDefault();
          confirmRef.current();
          return;
        }
      }
      if (e.key !== "Tab" || !node) return;
      const focusables = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!focusables.length) {
        e.preventDefault();
        return;
      }
      const firstEl = focusables[0];
      const lastEl = focusables[focusables.length - 1];
      const current = document.activeElement;
      if (e.shiftKey && (current === firstEl || current === node)) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && current === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      prev?.focus?.({ preventScroll: true });
    };
  }, [active, ref]);
}

function Scrim({ closing, onClick }: { closing: boolean; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        position: "absolute",
        inset: 0,
        background: "var(--tk-scrim)",
        zIndex: tkZ.overlay,
        animation: `${closing ? "tk-fade-out" : "tk-fade-in"} var(--tk-t2) var(--tk-ease) both`,
      }}
    />
  );
}

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

/* ---------------- Dialog ---------------- */

export type TKDialogTone = "accent" | "green" | "red" | "orange";

const DIALOG_TONES: Record<TKDialogTone, [color: string, bg: string]> = {
  accent: ["var(--tk-accent)", "var(--tk-accent-12)"],
  green: ["var(--tk-green)", "var(--tk-green-12)"],
  red: ["var(--tk-red)", "var(--tk-red-12)"],
  orange: ["var(--tk-orange)", "var(--tk-orange-12)"],
};

export interface TKDialogProps {
  open: boolean;
  onClose?: () => void;
  /** Fires on Enter — wire it to the single primary action of the dialog. */
  onConfirm?: () => void;
  icon?: TKIconName;
  tone?: TKDialogTone;
  title?: ReactNode;
  text?: ReactNode;
  children?: ReactNode;
  /** Action buttons, laid out in equal columns. */
  actions?: ReactNode;
  testId?: string;
}

export const TKDialog = /* @__PURE__ */ forwardRef<HTMLDivElement, TKDialogProps>(function TKDialog(
  { open, onClose, onConfirm, icon, tone = "accent", title, text, children, actions, testId },
  forwardedRef,
) {
  const { mounted, closing } = useMountTransition(open, 260);
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useOverlayA11y(mounted && !closing, ref, onClose, onConfirm);
  useBackIntercept(mounted && !closing && !!onClose, () => onClose?.());
  if (!mounted) return null;
  const [color, bg] = DIALOG_TONES[tone] ?? DIALOG_TONES.accent;
  return (
    <>
      <Scrim closing={closing} onClick={onClose} />
      <div
        style={{ position: "absolute", left: 24, right: 24, top: "50%", zIndex: tkZ.dialog, transform: "translateY(-50%)" }}
      >
        <div
          ref={mergeRefs(ref, forwardedRef)}
          data-testid={testId}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          tabIndex={-1}
          style={{
            outline: "none",
            background: "var(--tk-surface)",
            borderRadius: "var(--tk-r-lg)",
            boxShadow: "var(--tk-shadow-lg)",
            padding: "20px 18px 14px",
            textAlign: "center",
            animation: `${closing ? "tk-fade-out" : "tk-modal-in"} var(--tk-t2) ${closing ? "var(--tk-ease)" : "var(--tk-spring)"} both`,
          }}
        >
          {icon ? (
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                margin: "0 auto 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: bg,
                color,
              }}
            >
              <TKIcon name={icon} size={24} />
            </div>
          ) : null}
          {title ? (
            <div id={titleId} style={{ fontSize: "var(--tk-fz-title3)", fontWeight: 700, marginBottom: 4 }}>{title}</div>
          ) : null}
          {text ? (
            <div style={{ fontSize: "var(--tk-fz-sub)", color: "var(--tk-text-2)", marginBottom: 16 }}>{text}</div>
          ) : null}
          {children}
          {actions ? (
            <div style={{ display: "grid", gridAutoColumns: "1fr", gridAutoFlow: "column", gap: 8 }}>{actions}</div>
          ) : null}
        </div>
      </div>
    </>
  );
});

/* ---------------- Action sheet ---------------- */

export interface TKActionItem {
  icon?: TKIconName;
  label: ReactNode;
  danger?: boolean;
  onSelect?: () => void;
}

export interface TKActionSheetProps {
  open: boolean;
  onClose?: () => void;
  items: TKActionItem[];
  cancelLabel?: ReactNode;
  testId?: string;
}

export const TKActionSheet = /* @__PURE__ */ forwardRef<HTMLDivElement, TKActionSheetProps>(function TKActionSheet(
  { open, onClose, items, cancelLabel, testId },
  forwardedRef,
) {
  const locale = useTKLocale();
  const { mounted, closing } = useMountTransition(open, 360);
  const ref = useRef<HTMLDivElement>(null);
  useOverlayA11y(mounted && !closing, ref, onClose);
  useBackIntercept(mounted && !closing && !!onClose, () => onClose?.());
  if (!mounted) return null;
  return (
    <>
      <Scrim closing={closing} onClick={onClose} />
      <div
        ref={mergeRefs(ref, forwardedRef)}
        data-testid={testId}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        style={{
          outline: "none",
          position: "absolute",
          left: 10,
          right: 10,
          bottom: 10,
          zIndex: tkZ.sheet,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          animation: `${closing ? "tk-sheet-down" : "tk-sheet-up"} var(--tk-t3) ${closing ? "var(--tk-ease)" : "var(--tk-spring)"} both`,
        }}
      >
        <div
          style={{
            background: "var(--tk-surface)",
            borderRadius: "var(--tk-r-lg)",
            overflow: "hidden",
            boxShadow: "var(--tk-shadow-lg)",
          }}
        >
          {items.map((item, i) => (
            <button
              type="button"
              key={i}
              onClick={() => {
                item.onSelect?.();
                onClose?.();
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                width: "100%",
                padding: "14px 16px",
                border: "none",
                borderTop: i > 0 ? "0.5px solid var(--tk-sep)" : "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: "var(--tk-fz-body)",
                fontWeight: 500,
                fontFamily: "inherit",
                color: item.danger ? "var(--tk-red)" : "var(--tk-text)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--tk-surface-2)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {item.icon ? <TKIcon name={item.icon} size={19} /> : null}
              {item.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="tk-press"
          style={{
            width: "100%",
            padding: "14px 16px",
            border: "none",
            borderRadius: "var(--tk-r-lg)",
            background: "var(--tk-surface)",
            boxShadow: "var(--tk-shadow-lg)",
            fontSize: "var(--tk-fz-body)",
            fontWeight: 700,
            fontFamily: "inherit",
            color: "var(--tk-accent-ink)",
          }}
        >
          {cancelLabel ?? locale.cancel}
        </button>
      </div>
    </>
  );
});

/* ---------------- Anchored popper / tooltip ---------------- */

export type TKPopperPlacement = "top" | "bottom" | "left" | "right";

export interface TKPopperProps {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  children?: ReactNode;
  placement?: TKPopperPlacement;
  offset?: number;
  onClose?: () => void;
  /** Pointer arrow toward the anchor. */
  arrow?: boolean;
  /** Flip to the opposite side when the preferred one has no room (default true). */
  autoFlip?: boolean;
  testId?: string;
  style?: CSSProperties;
}

const FLIP: Record<TKPopperPlacement, TKPopperPlacement> = { top: "bottom", bottom: "top", left: "right", right: "left" };

/** Minimum room a popper needs on its side before auto-flip kicks in, px. */
const FLIP_MIN = 140;

export function TKPopper({ open, anchorRef, children, placement: preferred = "bottom", offset = 8, onClose, arrow, autoFlip = true, testId, style }: TKPopperProps) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const sync = () => setRect(anchorRef.current?.getBoundingClientRect() ?? null);
    sync();
    window.addEventListener("resize", sync);
    window.addEventListener("scroll", sync, true);
    return () => {
      window.removeEventListener("resize", sync);
      window.removeEventListener("scroll", sync, true);
    };
  }, [anchorRef, open]);
  useEffect(() => {
    if (!open) return;
    const close = (e: globalThis.PointerEvent) => {
      const target = e.target as Node;
      if (ref.current?.contains(target) || anchorRef.current?.contains(target)) return;
      onClose?.();
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [anchorRef, onClose, open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, open]);
  if (!open || !rect) return null;
  const room: Record<TKPopperPlacement, number> = {
    top: rect.top,
    bottom: (typeof window !== "undefined" ? window.innerHeight : 0) - rect.bottom,
    left: rect.left,
    right: (typeof window !== "undefined" ? window.innerWidth : 0) - rect.right,
  };
  const placement =
    autoFlip && room[preferred] < FLIP_MIN && room[FLIP[preferred]] > room[preferred] ? FLIP[preferred] : preferred;
  const x = placement === "left" ? rect.left : placement === "right" ? rect.right : rect.left + rect.width / 2;
  const y = placement === "top" ? rect.top : placement === "bottom" ? rect.bottom : rect.top + rect.height / 2;
  const transform =
    placement === "top"
      ? "translate(-50%, calc(-100% - var(--tk-popper-offset)))"
      : placement === "bottom"
        ? "translate(-50%, var(--tk-popper-offset))"
        : placement === "left"
          ? "translate(calc(-100% - var(--tk-popper-offset)), -50%)"
          : "translate(var(--tk-popper-offset), -50%)";
  return (
    <div
      ref={ref}
      data-testid={testId}
      role="dialog"
      style={
        {
          "--tk-popper-offset": `${offset}px`,
          position: "fixed",
          left: x,
          top: y,
          zIndex: tkZ.popper,
          maxWidth: "min(320px, calc(100vw - 28px))",
          transform,
          background: "var(--tk-surface)",
          borderRadius: "var(--tk-r-md)",
          boxShadow: "var(--tk-shadow-lg)",
          padding: 8,
          color: "var(--tk-text)",
          animation: "tk-modal-in var(--tk-t2) var(--tk-spring) both",
          ...style,
        } as CSSProperties
      }
    >
      {arrow ? (
        <span
          data-tk-popper-arrow
          style={{
            position: "absolute",
            width: 12,
            height: 12,
            background: "var(--tk-surface)",
            transform: "rotate(45deg)",
            ...(placement === "top"
              ? { bottom: -5, left: "50%", marginLeft: -6, boxShadow: "3px 3px 6px -3px rgba(0,0,0,.18)" }
              : placement === "bottom"
                ? { top: -5, left: "50%", marginLeft: -6 }
                : placement === "left"
                  ? { right: -5, top: "50%", marginTop: -6 }
                  : { left: -5, top: "50%", marginTop: -6 }),
          }}
        />
      ) : null}
      {children}
    </div>
  );
}

export interface TKTooltipProps {
  children: ReactNode;
  content: ReactNode;
  placement?: "top" | "bottom";
  disabled?: boolean;
  testId?: string;
  style?: CSSProperties;
}

export function TKTooltip({ children, content, placement = "top", disabled, testId, style }: TKTooltipProps) {
  const [open, setOpen] = useState(false);
  return (
    <span
      data-testid={testId}
      onMouseEnter={() => !disabled && setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => !disabled && setOpen(true)}
      onBlur={() => setOpen(false)}
      style={{ position: "relative", display: "inline-flex", ...style }}
    >
      {children}
      <span
        role="tooltip"
        style={{
          position: "absolute",
          left: "50%",
          top: placement === "bottom" ? "calc(100% + 7px)" : undefined,
          bottom: placement === "top" ? "calc(100% + 7px)" : undefined,
          zIndex: tkZ.tooltip,
          transform: open ? "translateX(-50%) scale(1)" : "translateX(-50%) scale(.96)",
          transformOrigin: placement === "top" ? "bottom center" : "top center",
          minWidth: "max-content",
          maxWidth: 220,
          padding: "7px 9px",
          borderRadius: "var(--tk-r-sm)",
          background: "var(--tk-glass)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          boxShadow: "var(--tk-shadow-md)",
          color: "var(--tk-text)",
          fontSize: "var(--tk-fz-caption)",
          fontWeight: 600,
          pointerEvents: "none",
          opacity: open ? 1 : 0,
          transition: "opacity var(--tk-t2) var(--tk-ease), transform var(--tk-t2) var(--tk-spring)",
        }}
      >
        {content}
      </span>
    </span>
  );
}

/* ---------------- Toasts ---------------- */

export interface TKToastOptions {
  text: ReactNode;
  icon?: TKIconName;
  /** CSS color of the icon chip. */
  color?: string;
  action?: ReactNode;
  onAction?: () => void;
  duration?: number;
}

export interface TKToastApi {
  show: (toast: TKToastOptions) => void;
  success: (text: ReactNode) => void;
  error: (text: ReactNode) => void;
}

interface ToastItem extends TKToastOptions {
  id: number;
  out: boolean;
}

const TKToastContext = createContext<TKToastApi | null>(null);

export interface TKToastProviderProps {
  children?: ReactNode;
  /** Distance from the chosen edge of the positioned ancestor, px. */
  offset?: number;
  duration?: number;
  /** Max toasts visible at once. */
  max?: number;
  /** Stack edge (default bottom). */
  position?: "top" | "bottom";
  testId?: string;
}

export function TKToastProvider({ children, offset = 14, duration = 2400, max = 3, position = "bottom", testId }: TKToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);
  const timersRef = useRef<number[]>([]);
  useEffect(() => () => timersRef.current.forEach((t) => window.clearTimeout(t)), []);

  const dismiss = useCallback((id: number) => {
    setToasts((t) => t.map((x) => (x.id === id ? { ...x, out: true } : x)));
    timersRef.current.push(window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 350));
  }, []);

  const show = useCallback(
    (toast: TKToastOptions) => {
      const id = ++idRef.current;
      setToasts((t) => [...t.slice(-(max - 1)), { ...toast, id, out: false }]);
      timersRef.current.push(window.setTimeout(() => dismiss(id), toast.duration ?? duration));
    },
    [dismiss, duration, max],
  );

  const api = useMemo<TKToastApi>(
    () => ({
      show,
      success: (text) => show({ text, icon: "check", color: "var(--tk-green)" }),
      error: (text) => show({ text, icon: "close", color: "var(--tk-red)" }),
    }),
    [show],
  );

  return (
    <TKToastContext.Provider value={api}>
      {children}
      <div
        role="status"
        aria-live="polite"
        data-testid={testId}
        style={{
          position: "absolute",
          left: 14,
          right: 14,
          top: position === "top" ? offset : undefined,
          bottom: position === "bottom" ? offset : undefined,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          zIndex: tkZ.toast,
          pointerEvents: "none",
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "11px 14px",
              borderRadius: "var(--tk-r-md)",
              background: "var(--tk-glass)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              boxShadow: "var(--tk-shadow-md)",
              animation: `${t.out ? "tk-toast-out" : "tk-toast-in"} var(--tk-t2) ${t.out ? "var(--tk-ease)" : "var(--tk-spring)"} both`,
              pointerEvents: "auto",
            }}
          >
            {t.icon ? (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: `color-mix(in srgb, ${t.color ?? "var(--tk-text-2)"} 14%, transparent)`,
                  color: t.color ?? "var(--tk-text-2)",
                  flexShrink: 0,
                }}
              >
                <TKIcon name={t.icon} size={14} strokeWidth={2.6} />
              </span>
            ) : null}
            <span style={{ flex: 1, fontSize: "var(--tk-fz-sub)", fontWeight: 500, color: "var(--tk-text)" }}>
              {t.text}
            </span>
            {t.action ? (
              <span
                onClick={() => {
                  t.onAction?.();
                  dismiss(t.id);
                }}
                style={{ fontSize: "var(--tk-fz-sub)", fontWeight: 700, color: "var(--tk-accent-ink)", cursor: "pointer" }}
              >
                {t.action}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </TKToastContext.Provider>
  );
}

export function useTKToast(): TKToastApi {
  const api = useContext(TKToastContext);
  if (!api) throw new Error("useTKToast must be used inside <TKToastProvider>");
  return api;
}
