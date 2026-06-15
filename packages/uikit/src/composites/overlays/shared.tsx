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
  /**
   * Inner padding so embedded content clears the frame's rounded border
   * instead of being clipped by `overflow: hidden`. `true` applies a 16px
   * gutter; pass a number for a custom one. Leave unset for edge-to-edge
   * overlay/page demos that fill the frame themselves.
   */
  pad?: number | boolean;
  testId?: string;
  style?: CSSProperties;
}

export function TKFrame({ children, height = 520, pad, testId, style }: TKFrameProps) {
  const padding = pad === true ? 16 : pad || undefined;
  return (
    <div
      data-testid={testId}
      style={{
        position: "relative",
        overflow: "hidden",
        height,
        padding,
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

// LIFO stack of mounted modal overlays. Each `useOverlayA11y` adds its own
// document-capture keydown listener; without coordination one Escape would fire
// every listener and collapse the whole stack. Only the top overlay handles
// Escape (and stops the rest), so a nested sheet closes before its parent.
const overlayEscapeStack: object[] = [];

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
  // captured once on false->true so re-running the effect (e.g. ref change)
  // never overwrites the element we should hand focus back to
  const restoreRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!active) {
      restoreRef.current = null;
      return;
    }
    const node = ref.current;
    if (!restoreRef.current && typeof document !== "undefined") {
      restoreRef.current = document.activeElement as HTMLElement | null;
    }
    const first = node?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? node)?.focus({ preventScroll: true });

    // Register this overlay as the new top of the Escape stack.
    const token = {};
    overlayEscapeStack.push(token);

    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        // Only the topmost overlay closes; `stopImmediatePropagation` also
        // prevents the other overlays' (and any app) document listeners from
        // firing, so one Escape closes exactly one layer.
        if (overlayEscapeStack[overlayEscapeStack.length - 1] !== token) return;
        e.stopImmediatePropagation();
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
      const i = overlayEscapeStack.indexOf(token);
      if (i !== -1) overlayEscapeStack.splice(i, 1);
      // Only restore on the real teardown (active -> false), and only if the
      // captured element is still in the document and not inside another live
      // overlay that is taking over focus.
      const prev = restoreRef.current;
      if (!prev || typeof document === "undefined") return;
      restoreRef.current = null;
      if (!document.contains(prev)) return;
      if (prev.closest?.('[aria-modal="true"]')) return;
      prev.focus?.({ preventScroll: true });
    };
  }, [active, ref]);
}

export function Scrim({ closing, onClick, z }: { closing: boolean; onClick?: () => void; z?: number }) {
  return (
    <div
      onClick={onClick}
      style={{
        position: "absolute",
        inset: 0,
        background: "var(--tk-scrim)",
        zIndex: z ?? tkZ.overlay,
        animation: `${closing ? "tk-fade-out" : "tk-fade-in"} var(--tk-t2) var(--tk-ease) both`,
      }}
    />
  );
}
