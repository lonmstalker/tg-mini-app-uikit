import { createContext, useContext } from "react";

/**
 * Whether the nearest `TKPage` content area has scrolled past the header
 * collapse point (with hysteresis applied at the scroll handler). A single
 * boolean commit per direction change — never a per-frame (or per-quantum)
 * scroll position — so scrolling re-renders nothing (LAY-001).
 */
export const TKPageScrollContext = /* @__PURE__ */ createContext(false);

export function usePageHeaderCollapsed(): boolean {
  return useContext(TKPageScrollContext);
}
