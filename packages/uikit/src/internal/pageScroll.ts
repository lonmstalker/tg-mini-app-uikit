import { createContext, useContext } from "react";

/**
 * Scroll position of the nearest `TKPage` content area, px. Powers the
 * collapsing `TKHeader` (M5.9) and the M6 ScrollSaver.
 */
export const TKPageScrollContext = /* @__PURE__ */ createContext(0);

export function usePageScrollTop(): number {
  return useContext(TKPageScrollContext);
}
