import type { FocusEventHandler, MutableRefObject, PointerEventHandler, Ref, RefCallback } from "react";

/** Single ref callback that feeds several refs (internal + forwarded). */
export function mergeRefs<T>(...refs: Array<Ref<T> | undefined | null>): RefCallback<T> {
  return (value) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") ref(value);
      else (ref as MutableRefObject<T | null>).current = value;
    }
  };
}

/**
 * z-index scale, mirrors `--tk-z-*` in tokens.css. Inline styles read the CSS
 * variables so userland overrides of the tokens keep working; the cast keeps
 * `CSSProperties.zIndex` (typed as number) happy.
 */
export const tkZ = {
  base: "var(--tk-z-base)",
  sticky: "var(--tk-z-sticky)",
  header: "var(--tk-z-header)",
  overlay: "var(--tk-z-overlay)",
  sheet: "var(--tk-z-sheet)",
  dialog: "var(--tk-z-dialog)",
  toast: "var(--tk-z-toast)",
  tooltip: "var(--tk-z-tooltip)",
  dropdown: "var(--tk-z-dropdown)",
  popper: "var(--tk-z-popper)",
} as unknown as Record<
  "base" | "sticky" | "header" | "overlay" | "sheet" | "dialog" | "toast" | "tooltip" | "dropdown" | "popper",
  number
>;

/**
 * Point-passthrough of native DOM handlers and attributes shared by the
 * interactive components (no blind rest-spread; see the plan's Decision Log).
 */
export interface TKDomProps<E extends Element = HTMLElement> {
  id?: string;
  /** Rendered as `data-testid` on the component root. */
  testId?: string;
  onPointerDown?: PointerEventHandler<E>;
  onPointerUp?: PointerEventHandler<E>;
  onPointerCancel?: PointerEventHandler<E>;
  onFocus?: FocusEventHandler<E>;
  onBlur?: FocusEventHandler<E>;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
}

/** Picks the `TKDomProps` out of a props object as a spreadable DOM attribute bag. */
export function tkDomProps<E extends Element>(p: TKDomProps<E>) {
  return {
    id: p.id,
    "data-testid": p.testId,
    onPointerDown: p.onPointerDown,
    onPointerUp: p.onPointerUp,
    onPointerCancel: p.onPointerCancel,
    onFocus: p.onFocus,
    onBlur: p.onBlur,
    "aria-label": p["aria-label"],
    "aria-labelledby": p["aria-labelledby"],
    "aria-describedby": p["aria-describedby"],
  };
}
