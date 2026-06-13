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

export function TKPopper({ open, anchorRef, children, placement: preferred = "bottom", offset = 8, onClose, arrow, autoFlip = true, testId, style }: TKPopperProps) {
  const [layout, setLayout] = useState<PopperLayout | null>(null);
  const [popperSize, setPopperSize] = useState({ width: 220, height: 80 });
  const ref = useRef<HTMLDivElement>(null);
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
    window.addEventListener("resize", sync);
    window.addEventListener("scroll", sync, true);
    return () => {
      window.removeEventListener("resize", sync);
      window.removeEventListener("scroll", sync, true);
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
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, open]);
  if (!open || !layout) return null;
  const room: Record<TKPopperPlacement, number> = {
    top: layout.anchorY,
    bottom: layout.rootHeight - (layout.anchorY + layout.anchorHeight),
    left: layout.anchorX,
    right: layout.rootWidth - (layout.anchorX + layout.anchorWidth),
  };
  const placement =
    autoFlip && room[preferred] < FLIP_MIN && room[FLIP[preferred]] > room[preferred] ? FLIP[preferred] : preferred;
  const anchorCenterX = layout.anchorX + layout.anchorWidth / 2;
  const anchorCenterY = layout.anchorY + layout.anchorHeight / 2;
  const margin = 8;
  const maxLeft = layout.rootWidth - popperSize.width - margin;
  const maxTop = layout.rootHeight - popperSize.height - margin;
  const left =
    placement === "left"
      ? clamp(layout.anchorX - popperSize.width - offset, margin, maxLeft)
      : placement === "right"
        ? clamp(layout.anchorX + layout.anchorWidth + offset, margin, maxLeft)
        : clamp(anchorCenterX - popperSize.width / 2, margin, maxLeft);
  const top =
    placement === "top"
      ? clamp(layout.anchorY - popperSize.height - offset, margin, maxTop)
      : placement === "bottom"
        ? clamp(layout.anchorY + layout.anchorHeight + offset, margin, maxTop)
        : clamp(anchorCenterY - popperSize.height / 2, margin, maxTop);
  const arrowLeft = clamp(anchorCenterX - left - 6, 10, popperSize.width - 22);
  const arrowTop = clamp(anchorCenterY - top - 6, 10, popperSize.height - 22);
  const node = (
    <div
      ref={ref}
      data-testid={testId}
      role="dialog"
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
  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const describedChildren = isValidElement(children)
    ? cloneElement(children as ReactElement<{ "aria-describedby"?: string }>, {
        "aria-describedby":
          open && !disabled
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
      data-testid={testId}
      onMouseEnter={() => !disabled && setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => !disabled && setOpen(true)}
      onBlur={() => setOpen(false)}
      style={{ position: "relative", display: "inline-flex", ...style }}
    >
      {describedChildren}
      <span
        id={id}
        role="tooltip"
        aria-hidden={!open}
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
