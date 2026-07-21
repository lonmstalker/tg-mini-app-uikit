import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { tkRenderIcon, type TKIconProp } from "../../atoms/icons";
import { tkZ } from "../../internal/dom";

/* ---------------- Toasts ---------------- */

export interface TKToastOptions {
  text: ReactNode;
  /** Built-in icon name, or a custom element (spinner, own SVG) for the chip (REU-004). */
  icon?: TKIconProp;
  /** CSS color of the icon chip. */
  color?: string;
  action?: ReactNode;
  onAction?: () => void;
  duration?: number;
  /** Announce with `assertive` urgency (`role="alert"`) instead of polite. Set by `error()`. */
  assertive?: boolean;
}

/** Messages for `TKToastApi.promise` — strings or functions of the settled value/error. */
export interface TKToastPromiseMessages<T> {
  loading: ReactNode;
  success: ReactNode | ((value: T) => ReactNode);
  error: ReactNode | ((error: unknown) => ReactNode);
}

export interface TKToastApi {
  /** Show a toast; returns its id so it can be dismissed early. A non-finite `duration` makes it sticky (no auto-dismiss). */
  show: (toast: TKToastOptions) => number;
  /** Dismiss a specific toast by id. */
  dismiss: (id: number) => void;
  success: (text: ReactNode, opts?: Partial<TKToastOptions>) => number;
  error: (text: ReactNode, opts?: Partial<TKToastOptions>) => number;
  /** Neutral/info toast (accent, polite). */
  info: (text: ReactNode, opts?: Partial<TKToastOptions>) => number;
  /** Warning toast (orange, polite). */
  warning: (text: ReactNode, opts?: Partial<TKToastOptions>) => number;
  /** Sticky loading toast that swaps to success/error when the promise settles (OVL-DX-002). The returned promise mirrors the input — it REJECTS on failure, so handle it (`.catch`/`await try`). */
  promise: <T>(p: Promise<T> | T, messages: TKToastPromiseMessages<T>) => Promise<T>;
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
  // Per-toast auto-dismiss timers, keyed by id, so dismiss() can cancel the
  // pending one instead of leaking a second removal (OVL-009).
  const autoTimers = useRef(new Map<number, number>());
  const removalTimers = useRef<number[]>([]);
  const dismissingRef = useRef(new Set<number>());
  // A late-settling `promise()` (or any deferred caller) must not setState or queue
  // a timer after the provider unmounts (OVL-DX-002).
  const mountedRef = useRef(true);
  useEffect(() => {
    // Re-arm on mount: StrictMode runs the cleanup once during its dev
    // double-invoke, and a ref initializer alone would leave this false forever
    // (every toast silently dropped in dev).
    mountedRef.current = true;
    const timers = { auto: autoTimers.current, removal: removalTimers.current };
    return () => {
      mountedRef.current = false;
      timers.auto.forEach((t) => window.clearTimeout(t));
      timers.removal.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const dismiss = useCallback((id: number) => {
    if (!mountedRef.current) return;
    // Idempotent: an action tap and the auto-dismiss timeout must not both
    // schedule a removal (OVL-009).
    if (dismissingRef.current.has(id)) return;
    dismissingRef.current.add(id);
    const auto = autoTimers.current.get(id);
    if (auto != null) {
      window.clearTimeout(auto);
      autoTimers.current.delete(id);
    }
    setToasts((t) => t.map((x) => (x.id === id ? { ...x, out: true } : x)));
    removalTimers.current.push(
      window.setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id));
        dismissingRef.current.delete(id);
      }, 350),
    );
  }, []);

  const show = useCallback(
    (toast: TKToastOptions) => {
      if (!mountedRef.current) return -1;
      const id = ++idRef.current;
      // Cap the WHOLE stack at `max`; `slice(-(max-1))` was `slice(-0)`=keep-all
      // for max=1, so the bound never applied (OVL-001).
      setToasts((t) => [...t, { ...toast, id, out: false }].slice(-Math.max(1, max)));
      // A non-finite duration (used by `promise`) is sticky — no auto-dismiss timer.
      const d = toast.duration ?? duration;
      if (Number.isFinite(d)) autoTimers.current.set(id, window.setTimeout(() => dismiss(id), d));
      return id;
    },
    [dismiss, duration, max],
  );

  // Clear the auto-dismiss timer of any toast that left the stack WITHOUT going
  // through dismiss() — i.e. one evicted by the `max` cap above — so it can't
  // later fire a no-op dismiss + stray removal timer (OVL-009). An effect on the
  // committed list, not inside the setToasts updater: updaters must stay pure
  // (StrictMode replays them), and only committed evictions matter. dismiss()
  // clears its own toast's timer, so this is a no-op for normal removals.
  useEffect(() => {
    const timers = autoTimers.current;
    for (const [id, timer] of timers) {
      if (toasts.some((x) => x.id === id)) continue;
      window.clearTimeout(timer);
      timers.delete(id);
    }
  }, [toasts]);

  const api = useMemo<TKToastApi>(
    () => ({
      show,
      dismiss,
      success: (text, opts) => show({ text, icon: "check", color: "var(--tk-green)", ...opts }),
      error: (text, opts) => show({ text, icon: "close", color: "var(--tk-red)", assertive: true, ...opts }),
      info: (text, opts) => show({ text, color: "var(--tk-accent)", ...opts }),
      warning: (text, opts) => show({ text, color: "var(--tk-orange)", ...opts }),
      promise: <T,>(p: Promise<T> | T, messages: TKToastPromiseMessages<T>) => {
        // Sticky loading toast (Infinity = no auto-dismiss), swapped on settle.
        const id = show({ text: messages.loading, duration: Infinity });
        return Promise.resolve(p).then(
          (value) => {
            dismiss(id);
            show({ text: typeof messages.success === "function" ? messages.success(value) : messages.success, icon: "check", color: "var(--tk-green)" });
            return value;
          },
          (err) => {
            dismiss(id);
            show({ text: typeof messages.error === "function" ? messages.error(err) : messages.error, icon: "close", color: "var(--tk-red)", assertive: true });
            throw err;
          },
        );
      },
    }),
    [show, dismiss],
  );

  // Portal the stack to the nearest `.tk` root (or body) so a transformed /
  // positioned ancestor between the provider and the root can't re-anchor the
  // toasts mid-screen or clip them (OVL-010). A hidden marker locates the host.
  const [host, setHost] = useState<HTMLElement | null>(null);
  const markerRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    // Nearest token scope OR an explicit portal root (e.g. TKFrame in demos), so
    // framed showcases keep their toasts inside the frame instead of escaping to
    // the page root (OVL-010).
    setHost(
      markerRef.current?.closest<HTMLElement>(".tk, [data-tk-portal-root]") ??
        (typeof document !== "undefined" ? document.body : null),
    );
  }, []);

  // FLIP the surviving toasts when the stack reflows (a toast above them left):
  // the position jump becomes a transform glide. WAAPI composes ABOVE the CSS
  // enter/exit keyframes, and both are transform/opacity-only.
  const stackRef = useRef<HTMLDivElement>(null);
  const toastTopsRef = useRef(new Map<string, number>());
  useLayoutEffect(() => {
    const el = stackRef.current;
    const prev = toastTopsRef.current;
    const next = new Map<string, number>();
    if (el) {
      const reduced =
        !!el.closest('.tk[data-tk-motion="off"]') ||
        (typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches);
      for (const child of Array.from(el.children) as HTMLElement[]) {
        const id = child.dataset.tkToastId;
        if (!id) continue;
        const top = child.getBoundingClientRect().top;
        next.set(id, top);
        const before = prev.get(id);
        if (!reduced && before != null && Math.abs(before - top) > 1 && typeof child.animate === "function") {
          child.animate(
            [{ transform: `translateY(${before - top}px)` }, { transform: "translateY(0)" }],
            { duration: 260, easing: "cubic-bezier(.22,.61,.36,1)" },
          );
        }
      }
    }
    toastTopsRef.current = next;
  }, [toasts]);

  const stack = (
    <div
      ref={stackRef}
      data-testid={testId}
      // Marks the stack as a live region that stays above modals — an open
      // dialog/sheet must NOT inert it, or a toast over a dialog goes mute and
      // unclickable (OVL-006 × OVL-010).
      data-tk-live
      style={{
        position: "absolute",
        left: 14,
        right: 14,
          top: position === "top" ? `calc(${offset}px + var(--tk-safe-top))` : undefined,
          bottom: position === "bottom" ? `calc(${offset}px + var(--tk-safe-bottom))` : undefined,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          zIndex: tkZ.toast,
          pointerEvents: "none",
        }}
      >
        {toasts.map((t) => (
          // Two layers: the OUTER one animates (transform/opacity keyframes,
          // promoted only while entering/leaving), the INNER one carries the
          // backdrop blur — animating a blurring element re-filters it every
          // frame. Exit is faster than enter (t1 vs t2), like native toasts.
          <div
            key={t.id}
            role={t.assertive ? "alert" : "status"}
            aria-live={t.assertive ? "assertive" : "polite"}
            aria-atomic="true"
            data-tk-toast={t.out ? "out" : "in"}
            data-tk-toast-id={String(t.id)}
            onAnimationEnd={(e) => {
              if (e.animationName === "tk-toast-in") (e.currentTarget as HTMLElement).style.willChange = "";
            }}
            style={{
              animation: t.out
                ? "tk-toast-out var(--tk-t1) var(--tk-ease) both"
                : "tk-toast-in var(--tk-t2) var(--tk-spring) both",
              willChange: "transform, opacity",
              pointerEvents: "auto",
            }}
          >
          <div
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
                {tkRenderIcon(t.icon, { size: 14, strokeWidth: 2.6 })}
              </span>
            ) : null}
            <span style={{ flex: 1, fontSize: "var(--tk-fz-sub)", fontWeight: 500, color: "var(--tk-text)" }}>
              {t.text}
            </span>
            {t.action ? (
              <button
                type="button"
                onClick={() => {
                  t.onAction?.();
                  dismiss(t.id);
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 44, // CC-03 / OVL-008 touch target
                  marginTop: -12, // absorb the hit-slop vertically so the row keeps its height
                  marginBottom: -12,
                  border: "none",
                  padding: 0,
                  background: "none",
                  font: "inherit",
                  fontSize: "var(--tk-fz-sub)",
                  fontWeight: 700,
                  color: "var(--tk-accent-ink)",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                {t.action}
              </button>
            ) : null}
          </div>
          </div>
        ))}
    </div>
  );

  return (
    <TKToastContext.Provider value={api}>
      {children}
      {/* hidden marker locates the nearest `.tk` host for the portal (OVL-010) */}
      <span ref={markerRef} aria-hidden style={{ display: "none" }} />
      {host ? createPortal(stack, host) : null}
    </TKToastContext.Provider>
  );
}

export function useTKToast(): TKToastApi {
  const api = useContext(TKToastContext);
  if (!api) throw new Error("useTKToast must be used inside <TKToastProvider>");
  return api;
}
