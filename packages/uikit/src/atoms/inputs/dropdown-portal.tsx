import { useEffect, useRef, useState, type CSSProperties, type ReactElement, type ReactNode, type RefObject } from "react";
import { tkZ } from "../../internal/dom";
import { useIsomorphicLayoutEffect } from "../../internal/useIsomorphicLayoutEffect";
import { useOverlayPortal } from "../../composites/overlays/shared";

interface DropdownPos {
  left: number;
  top: number;
  width: number;
}

/** Gap between the anchor's bottom edge and the dropdown, px (the old `calc(100% + 6px)`). */
const GAP = 6;

/**
 * Portals a select-style dropdown into the shared overlay host (`.tk` /
 * `[data-tk-portal-root]`, body fallback — REU-010) so an `overflow` or
 * `transform` ancestor can't clip or displace it, and keeps it glued to the
 * anchor: positioned absolute against the host (scale-corrected like TKPopper)
 * or viewport-fixed when the host is `document.body`. Re-measures synchronously
 * when `open` flips and follows scroll/resize while open (rAF-throttled).
 *
 * The popup stays mounted while closed (hidden by the caller's own styles) so
 * the open/close transitions keep playing exactly as before the portal.
 */
export function useDropdownPortal(name: string, open: boolean, anchorRef: RefObject<HTMLElement | null>) {
  const portal = useOverlayPortal();
  const popupRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<DropdownPos | null>(null);
  const warnedRef = useRef(false);
  const { host, fixed } = portal;

  const measureRef = useRef<() => void>(() => {});
  measureRef.current = () => {
    const anchor = anchorRef.current;
    if (!anchor || !host) return;
    const anchorRect = anchor.getBoundingClientRect();
    if (fixed) {
      setPos({ left: anchorRect.left, top: anchorRect.bottom, width: anchorRect.width });
      return;
    }
    // Dev guard: absolute coordinates only work against a positioned host — a
    // consumer restyling the `.tk` root to `position: static` would strand the
    // portaled dropdown at the page origin (REU-010).
    if (process.env.NODE_ENV !== "production" && !warnedRef.current && typeof getComputedStyle === "function") {
      if (getComputedStyle(host).position === "static") {
        warnedRef.current = true;
        // eslint-disable-next-line no-console
        console.warn(
          `${name}: the overlay portal host is not positioned, so the portaled dropdown cannot be placed reliably. ` +
            "Keep the `.tk` root (or [data-tk-portal-root] host) `position: relative` (REU-010).",
        );
      }
    }
    const hostRect = host.getBoundingClientRect();
    // Scale correction for transformed hosts (device-frame demos scale `.tk`).
    const scaleX = hostRect.width / (host.offsetWidth || hostRect.width) || 1;
    const scaleY = hostRect.height / (host.offsetHeight || hostRect.height) || 1;
    setPos({
      left: (anchorRect.left - hostRect.left) / scaleX,
      top: (anchorRect.bottom - hostRect.top) / scaleY,
      width: anchorRect.width / scaleX,
    });
  };

  // Measure before paint on host-resolve and on every open flip, so the first
  // open frame is already placed and the enter transition plays in position.
  useIsomorphicLayoutEffect(() => {
    measureRef.current();
  }, [open, host]);

  // Follow the anchor while open: scroll (capture, any ancestor) + resize.
  useEffect(() => {
    if (!open || !host || typeof window === "undefined") return;
    let pending = false;
    const onReflow = () => {
      if (pending) return;
      pending = true;
      if (typeof requestAnimationFrame === "function") {
        requestAnimationFrame(() => {
          pending = false;
          measureRef.current();
        });
      } else {
        pending = false;
        measureRef.current();
      }
    };
    window.addEventListener("resize", onReflow, { passive: true });
    window.addEventListener("scroll", onReflow, { passive: true, capture: true });
    return () => {
      window.removeEventListener("resize", onReflow);
      window.removeEventListener("scroll", onReflow, true);
    };
  }, [open, host]);

  return {
    /** Attach to the popup root so outside-close checks can see the portaled node. */
    popupRef,
    /** True when `target` sits inside the portaled popup. */
    contains: (target: Node | null) => (target ? (popupRef.current?.contains(target) ?? false) : false),
    /** Positioning styles for the popup root — spread FIRST, own styles after. */
    style: {
      position: fixed ? "fixed" : "absolute",
      left: pos?.left ?? 0,
      top: (pos?.top ?? 0) + GAP,
      width: pos?.width,
      zIndex: tkZ.dropdown,
    } as CSSProperties,
    /** Portals the popup into the host (marker included); marker only until placed. */
    render: (popup: ReactNode): ReactElement => (pos ? portal.render(popup) : portal.marker),
  };
}
