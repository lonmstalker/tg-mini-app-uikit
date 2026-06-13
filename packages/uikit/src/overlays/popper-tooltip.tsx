import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { tkZ } from "../internal/dom";

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
