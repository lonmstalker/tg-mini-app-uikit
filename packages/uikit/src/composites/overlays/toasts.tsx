import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { TKIcon, type TKIconName } from "../../atoms/icons";
import { tkZ } from "../../internal/dom";

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

const TKToastContext = /* @__PURE__ */ createContext<TKToastApi | null>(null);

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
