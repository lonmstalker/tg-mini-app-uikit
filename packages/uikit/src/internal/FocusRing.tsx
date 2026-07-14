import type { CSSProperties } from "react";

/**
 * Absolutely-positioned focus ring: the `box-shadow` itself is STATIC and only
 * this layer's opacity transitions — a `box-shadow` transition repaints the
 * whole control on every frame (2026-07-14 smoothness plan, phase 3). The host
 * element must be positioned (`position: relative`).
 */
export function TKFocusRing({ show, radius }: { show: boolean; radius?: string | number }) {
  return (
    <span
      aria-hidden="true"
      style={
        {
          position: "absolute",
          inset: 0,
          borderRadius: radius ?? "inherit",
          boxShadow: "var(--tk-ring)",
          opacity: show ? 1 : 0,
          transition: "opacity var(--tk-t2) var(--tk-ease)",
          pointerEvents: "none",
        } as CSSProperties
      }
    />
  );
}
