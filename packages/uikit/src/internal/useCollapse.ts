import { useRef, type CSSProperties, type RefObject } from "react";
import { useReducedMotion } from "../foundation/theme";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

/*
 * Collapses/expands an in-flow block by animating its MEASURED height through
 * a transient WAAPI player, while React renders only the final state (height
 * 0 or auto). No layout property ever sits in a CSS transition/keyframes list
 * (the check-animatable-props gate); the layout cost is bounded to the toggle
 * itself and never rides a scroll or drag frame. Powers the accordion panel
 * and the collapsing large-header title.
 */
export function useCollapse<T extends HTMLElement = HTMLDivElement>(
  open: boolean,
  duration = 260,
): { ref: RefObject<T | null>; style: CSSProperties } {
  const ref = useRef<T>(null);
  const prev = useRef(open);
  const osReduced = useReducedMotion();
  useIsomorphicLayoutEffect(() => {
    if (prev.current === open) return;
    prev.current = open;
    const el = ref.current;
    if (!el || typeof el.animate !== "function") return;
    // Honor both the OS setting and the provider's reduceMotion toggle.
    if (osReduced || el.closest('.tk[data-tk-motion="off"]')) return;
    // scrollHeight reads the content height regardless of the clamped height.
    const h = el.scrollHeight;
    if (!h) return;
    el.animate(
      open ? [{ height: "0px" }, { height: `${h}px` }] : [{ height: `${h}px` }, { height: "0px" }],
      // ponytail: fixed duration/easing (--tk-ease default) — WAAPI can't take
      // CSS var() tokens; wire real token reads if a theme ever needs it.
      { duration, easing: "cubic-bezier(.22,.61,.36,1)" },
    );
  }, [open, osReduced, duration]);
  return { ref, style: { height: open ? undefined : 0, overflow: "hidden" } };
}
