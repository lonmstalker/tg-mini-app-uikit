import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { tkZ } from "../../internal/dom";
import { useSafeArea } from "../../foundation/telegram";
import { useOverlayA11y } from "./shared";

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
  /**
   * ARIA role for the popper surface. Default `"tooltip"` (non-modal anchored
   * content). Pass `"menu"` for an actionable list, or `"dialog"` for a modal
   * popover: focus moves in on open, Tab is trapped, Escape closes and restores
   * focus to the anchor, and the background is inert (OVL-002).
   */
  role?: "tooltip" | "menu" | "dialog";
  /** Forwarded to the popper surface so an anchor can `aria-describedby` it. */
  id?: string;
  /** Accessible name for the surface — useful with `role="dialog"`/`"menu"`. */
  ariaLabel?: string;
  testId?: string;
  style?: CSSProperties;
}

const FLIP: Record<TKPopperPlacement, TKPopperPlacement> = { top: "bottom", bottom: "top", left: "right", right: "left" };

/** Minimum room a popper needs on its side before auto-flip kicks in, px. */
const FLIP_MIN = 140;

interface PopperLayout {
  root: HTMLElement;
  useFixed: boolean;
  rootWidth: number;
  rootHeight: number;
  anchorX: number;
  anchorY: number;
  anchorWidth: number;
  anchorHeight: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), Math.max(min, max));

export function TKPopper({ open, anchorRef, children, placement: preferred = "bottom", offset = 8, onClose, arrow, autoFlip = true, role = "tooltip", id, ariaLabel, testId, style }: TKPopperProps) {
  const [layout, setLayout] = useState<PopperLayout | null>(null);
  const [popperSize, setPopperSize] = useState({ width: 220, height: 80 });
  const ref = useRef<HTMLDivElement>(null);
  // Telegram's chrome inset lives in JS state (not just `env()`), so read it
  // here to keep the popper out from under the header / home indicator.
  const { inset, contentInset } = useSafeArea();
  useEffect(() => {
    if (!open) return;
    const sync = () => {
      const anchor = anchorRef.current;
      if (!anchor || typeof document === "undefined") {
        setLayout(null);
        return;
      }
      const root = anchor.closest<HTMLElement>(".tk") ?? document.body;
      const anchorRect = anchor.getBoundingClientRect();
      const useFixed = root === document.body;
      const rootRect = useFixed
        ? ({ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight } as DOMRect)
        : root.getBoundingClientRect();
      const rootWidth = useFixed ? window.innerWidth : root.offsetWidth;
      const rootHeight = useFixed ? window.innerHeight : root.offsetHeight;
      const scaleX = useFixed ? 1 : rootRect.width / rootWidth || 1;
      const scaleY = useFixed ? 1 : rootRect.height / rootHeight || 1;

      setLayout({
        root,
        useFixed,
        rootWidth,
        rootHeight,
        anchorX: (anchorRect.left - rootRect.left) / scaleX,
        anchorY: (anchorRect.top - rootRect.top) / scaleY,
        anchorWidth: anchorRect.width / scaleX,
        anchorHeight: anchorRect.height / scaleY,
      });
    };
    sync();
    // throttle reflow to one sync per frame; resize/scroll fire in bursts
    let pending = false;
    const onReflow = () => {
      if (pending) return;
      pending = true;
      if (typeof requestAnimationFrame === "function") {
        requestAnimationFrame(() => {
          pending = false;
          sync();
        });
      } else {
        pending = false;
        sync();
      }
    };
    window.addEventListener("resize", onReflow, { passive: true });
    window.addEventListener("scroll", onReflow, { passive: true, capture: true });
    return () => {
      window.removeEventListener("resize", onReflow);
      window.removeEventListener("scroll", onReflow, true);
    };
  }, [anchorRef, open]);
  useLayoutEffect(() => {
    if (!open || !ref.current) return;
    const next = { width: ref.current.offsetWidth, height: ref.current.offsetHeight };
    if (next.width > 0 && next.height > 0 && (next.width !== popperSize.width || next.height !== popperSize.height)) {
      setPopperSize(next);
    }
  }, [children, layout, open, popperSize.height, popperSize.width]);
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
    // role="dialog" runs the full modal a11y (focus move + Tab trap + Escape +
    // background inert) below, so skip this non-modal Escape-only path for it.
    if (!open || role === "dialog") return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, open, role]);
  // A role="dialog" popper traps focus, moves focus in and restores it on close
  // (OVL-002). It does NOT inert the background: an anchored popover has no scrim,
  // so click-outside-to-close and the anchor itself must stay reachable. Gated on
  // `layout` so the trap engages only once the node is mounted. tooltip/menu stay
  // non-modal.
  useOverlayA11y(open && role === "dialog" && !!layout, ref, onClose, undefined, false);
  if (!open || !layout) return null;
  // Safe-area insets (device cutouts + Telegram chrome) carve the usable box in
  // from each edge so a flipped/clamped popper never lands under the header,
  // the home indicator or a side notch.
  const safeTop = inset.top + contentInset.top;
  const safeBottom = inset.bottom + contentInset.bottom;
  const safeLeft = inset.left + contentInset.left;
  const safeRight = inset.right + contentInset.right;
  const room: Record<TKPopperPlacement, number> = {
    top: layout.anchorY - safeTop,
    bottom: layout.rootHeight - (layout.anchorY + layout.anchorHeight) - safeBottom,
    left: layout.anchorX - safeLeft,
    right: layout.rootWidth - (layout.anchorX + layout.anchorWidth) - safeRight,
  };
  const placement =
    autoFlip && room[preferred] < FLIP_MIN && room[FLIP[preferred]] > room[preferred] ? FLIP[preferred] : preferred;
  const anchorCenterX = layout.anchorX + layout.anchorWidth / 2;
  const anchorCenterY = layout.anchorY + layout.anchorHeight / 2;
  const margin = 8;
  const minLeft = margin + safeLeft;
  const minTop = margin + safeTop;
  const maxLeft = layout.rootWidth - popperSize.width - margin - safeRight;
  const maxTop = layout.rootHeight - popperSize.height - margin - safeBottom;
  const left =
    placement === "left"
      ? clamp(layout.anchorX - popperSize.width - offset, minLeft, maxLeft)
      : placement === "right"
        ? clamp(layout.anchorX + layout.anchorWidth + offset, minLeft, maxLeft)
        : clamp(anchorCenterX - popperSize.width / 2, minLeft, maxLeft);
  const top =
    placement === "top"
      ? clamp(layout.anchorY - popperSize.height - offset, minTop, maxTop)
      : placement === "bottom"
        ? clamp(layout.anchorY + layout.anchorHeight + offset, minTop, maxTop)
        : clamp(anchorCenterY - popperSize.height / 2, minTop, maxTop);
  const arrowLeft = clamp(anchorCenterX - left - 6, 10, popperSize.width - 22);
  const arrowTop = clamp(anchorCenterY - top - 6, 10, popperSize.height - 22);
  const node = (
    <div
      ref={ref}
      id={id}
      data-testid={testId}
      role={role}
      aria-label={ariaLabel}
      aria-modal={role === "dialog" ? true : undefined}
      tabIndex={role === "dialog" ? -1 : undefined}
      style={
        {
          "--tk-popper-offset": `${offset}px`,
          position: layout.useFixed ? "fixed" : "absolute",
          left,
          top,
          zIndex: tkZ.popper,
          maxWidth: `min(320px, calc(100% - ${margin * 2}px))`,
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
              ? { bottom: -5, left: arrowLeft, boxShadow: "3px 3px 6px -3px rgba(0,0,0,.18)" }
              : placement === "bottom"
                ? { top: -5, left: arrowLeft }
                : placement === "left"
                  ? { right: -5, top: arrowTop }
                  : { left: -5, top: arrowTop }),
          }}
        />
      ) : null}
      {children}
    </div>
  );
  return createPortal(node, layout.root);
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
  const id = useId();
  const wrapRef = useRef<HTMLSpanElement>(null);
  const longPressRef = useRef<number>(0);
  const clearLongPress = () => {
    if (longPressRef.current) {
      window.clearTimeout(longPressRef.current);
      longPressRef.current = 0;
    }
  };
  useEffect(() => clearLongPress, []);

  const shown = open && !disabled;
  const describedChildren = isValidElement(children)
    ? cloneElement(children as ReactElement<{ "aria-describedby"?: string }>, {
        "aria-describedby":
          shown
            ? [
                (children.props as { "aria-describedby"?: string })["aria-describedby"],
                id,
              ]
                .filter(Boolean)
                .join(" ")
            : (children.props as { "aria-describedby"?: string })["aria-describedby"],
      })
    : children;

  return (
    <span
      ref={wrapRef}
      data-testid={testId}
      onMouseEnter={() => !disabled && setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => !disabled && setOpen(true)}
      onBlur={() => setOpen(false)}
      onPointerDown={(e) => {
        // touch can't hover — open on a long-press instead
        if (disabled || e.pointerType === "mouse") return;
        clearLongPress();
        longPressRef.current = window.setTimeout(() => setOpen(true), 350);
      }}
      onPointerUp={(e) => {
        if (e.pointerType === "mouse") return;
        clearLongPress();
      }}
      onPointerCancel={(e) => {
        if (e.pointerType === "mouse") return;
        clearLongPress();
      }}
      style={{ display: "inline-flex", ...style }}
    >
      {describedChildren}
      {/* Portaled through TKPopper so the label escapes any `overflow:hidden`
          ancestor (cards, list rows, TKFrame) and stays inside the safe area,
          instead of being clipped like an absolutely-positioned child would. */}
      <TKPopper
        open={shown}
        anchorRef={wrapRef}
        placement={placement}
        offset={7}
        role="tooltip"
        id={id}
        onClose={() => setOpen(false)}
        style={{
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
        }}
      >
        {content}
      </TKPopper>
    </span>
  );
}
