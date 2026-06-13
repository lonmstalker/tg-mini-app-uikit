import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { tkZ } from "../../internal/dom";

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

export function useMountTransition(open: boolean, closeMs: number) {
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
export function useOverlayA11y(
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

export function Scrim({ closing, onClick }: { closing: boolean; onClick?: () => void }) {
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
