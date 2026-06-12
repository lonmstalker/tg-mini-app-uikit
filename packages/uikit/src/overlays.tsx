import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { TKIcon, type TKIconName } from "./icons";
import { TKIconButton } from "./buttons";

/*
 * Overlays position themselves against the nearest positioned ancestor —
 * normally the `TKProvider` root (it is `position: relative` by default).
 * That keeps them working both full-screen and inside device-frame demos.
 */

/* ---------------- Mini viewport (frame for embedding overlay areas) ---------------- */

export interface TKFrameProps {
  children?: ReactNode;
  height?: number | string;
  style?: CSSProperties;
}

export function TKFrame({ children, height = 520, style }: TKFrameProps) {
  return (
    <div
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
function useOverlayA11y(active: boolean, ref: RefObject<HTMLDivElement | null>, onClose?: () => void) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
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
        zIndex: 10,
        animation: `${closing ? "tk-fade-out" : "tk-fade-in"} var(--tk-t2) var(--tk-ease) both`,
      }}
    />
  );
}

/* ---------------- Bottom sheet ---------------- */

export interface TKSheetProps {
  open: boolean;
  onClose?: () => void;
  title?: ReactNode;
  children?: ReactNode;
  /** Hide the grabber handle. */
  noGrabber?: boolean;
}

export function TKSheet({ open, onClose, title, children, noGrabber }: TKSheetProps) {
  const { mounted, closing } = useMountTransition(open, 380);
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useOverlayA11y(mounted && !closing, ref, onClose);
  if (!mounted) return null;
  return (
    <>
      <Scrim closing={closing} onClick={onClose} />
      <div
        ref={ref}
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
          zIndex: 11,
          background: "var(--tk-surface)",
          borderRadius: "var(--tk-r-xl) var(--tk-r-xl) 0 0",
          boxShadow: "var(--tk-shadow-lg)",
          padding: "8px 16px 16px",
          animation: `${closing ? "tk-sheet-down" : "tk-sheet-up"} var(--tk-t3) ${closing ? "var(--tk-ease)" : "var(--tk-spring)"} both`,
        }}
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
              label="Close"
              onClick={onClose}
              style={{ background: "var(--tk-surface-2)", boxShadow: "none", color: "var(--tk-text-2)" }}
            />
          </div>
        ) : null}
        {children}
      </div>
    </>
  );
}

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
  icon?: TKIconName;
  tone?: TKDialogTone;
  title?: ReactNode;
  text?: ReactNode;
  children?: ReactNode;
  /** Action buttons, laid out in equal columns. */
  actions?: ReactNode;
}

export function TKDialog({ open, onClose, icon, tone = "accent", title, text, children, actions }: TKDialogProps) {
  const { mounted, closing } = useMountTransition(open, 260);
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useOverlayA11y(mounted && !closing, ref, onClose);
  if (!mounted) return null;
  const [color, bg] = DIALOG_TONES[tone] ?? DIALOG_TONES.accent;
  return (
    <>
      <Scrim closing={closing} onClick={onClose} />
      <div
        style={{ position: "absolute", left: 24, right: 24, top: "50%", zIndex: 11, transform: "translateY(-50%)" }}
      >
        <div
          ref={ref}
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
}

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
}

export function TKActionSheet({ open, onClose, items, cancelLabel = "Cancel" }: TKActionSheetProps) {
  const { mounted, closing } = useMountTransition(open, 360);
  const ref = useRef<HTMLDivElement>(null);
  useOverlayA11y(mounted && !closing, ref, onClose);
  if (!mounted) return null;
  return (
    <>
      <Scrim closing={closing} onClick={onClose} />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        style={{
          outline: "none",
          position: "absolute",
          left: 10,
          right: 10,
          bottom: 10,
          zIndex: 11,
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
            color: "var(--tk-accent)",
          }}
        >
          {cancelLabel}
        </button>
      </div>
    </>
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
  /** Distance from the bottom of the positioned ancestor, px. */
  offset?: number;
  duration?: number;
  /** Max toasts visible at once. */
  max?: number;
}

export function TKToastProvider({ children, offset = 14, duration = 2400, max = 3 }: TKToastProviderProps) {
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
        style={{
          position: "absolute",
          left: 14,
          right: 14,
          bottom: offset,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          zIndex: 12,
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
                style={{ fontSize: "var(--tk-fz-sub)", fontWeight: 700, color: "var(--tk-accent)", cursor: "pointer" }}
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
