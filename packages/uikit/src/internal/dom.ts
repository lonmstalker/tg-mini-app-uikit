import type { CSSProperties, FocusEventHandler, MutableRefObject, PointerEventHandler, Ref, RefCallback } from "react";

/**
 * Style for a ≥44px touch target (the Telegram/iOS minimum, CC-03). Expands the
 * hit area with min-width/height and centers the (often small) content so the
 * glyph stays visually small inside the larger tappable box. `false` opts out
 * (e.g. an inline text link). Apply alongside a component's own styles.
 */
export function tkMinTargetStyle(minTarget: number | false = 44): CSSProperties {
  if (minTarget === false) return {};
  return {
    minWidth: minTarget,
    minHeight: minTarget,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  };
}

/**
 * Single ref callback that feeds several refs (internal + forwarded). Returns a
 * React-19 cleanup that nulls exactly the refs it set — so if the callback's
 * identity changes (e.g. a new forwarded ref), the OLD forwarded ref is cleared
 * instead of being left holding a stale node (INP-006).
 */
export function mergeRefs<T>(...refs: Array<Ref<T> | undefined | null>): RefCallback<T> {
  return (value) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") ref(value);
      else (ref as MutableRefObject<T | null>).current = value;
    }
    return () => {
      for (const ref of refs) {
        if (!ref) continue;
        if (typeof ref === "function") ref(null);
        else (ref as MutableRefObject<T | null>).current = null;
      }
    };
  };
}

/** Layer names of the z-index scale. */
export type TKZLayer =
  | "base"
  | "sticky"
  | "header"
  | "overlay"
  | "sheet"
  | "dialog"
  | "toast"
  | "tooltip"
  | "dropdown"
  | "popper";

/**
 * z-index scale as CSS-var STRINGS (mirrors `--tk-z-*` in tokens.css). Inline
 * styles read the variables so userland token overrides keep working;
 * `CSSProperties.zIndex` accepts strings, so no cast is needed. The values are
 * strings, not numbers — for the rare arithmetic case use {@link tkZIndex},
 * which returns a real number (INT-010 / INT-DX-006).
 */
export const tkZ: Record<TKZLayer, string> = {
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
};

// Numeric mirror of the `--tk-z-*` tokens for the rare layering math (e.g.
// useOverlayLayer's slot base). Keep in sync with tokens.css.
const TK_Z_SCALE: Record<TKZLayer, number> = {
  base: 0,
  sticky: 1,
  header: 2,
  overlay: 10,
  sheet: 11,
  dialog: 11,
  toast: 1000,
  tooltip: 1010,
  dropdown: 1020,
  popper: 1030,
};

/** Numeric z-index for a layer (+ optional offset) — for layering arithmetic. */
export function tkZIndex(layer: TKZLayer, offset = 0): number {
  return TK_Z_SCALE[layer] + offset;
}

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
