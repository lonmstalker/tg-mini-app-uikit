/*
 * `prefers-reduced-motion` as React state — feeds the reducer's `reducedMotion`
 * field and the `data-reduced-motion` DOM hook (dom-contract §1). Reduced motion
 * is a designed static path, not "animations off" (FR-010).
 */
import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia(QUERY).matches
    : false;
}

function subscribe(onChange: () => void): () => void {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return () => {};
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

export function useReducedMotion(): boolean {
  // External mutable OS setting → useSyncExternalStore: correct first paint,
  // no mount-effect re-render.
  return useSyncExternalStore(subscribe, prefersReducedMotion, () => false);
}
