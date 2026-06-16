/*
 * One-shot pulse of the origin/seed. Toggling `data-origin-pulse` with a forced
 * reflow restarts the CSS animation, so the seed can re-pulse on each meaningful
 * touch. Transform/opacity only (FR-013).
 */
import { useCallback } from "react";
import { useSurfaceElement } from "../surface/surfaceContext";

export function useOriginPulse(): () => void {
  const surface = useSurfaceElement();
  return useCallback(() => {
    if (!surface) return;
    surface.removeAttribute("data-origin-pulse");
    void surface.offsetWidth; // reflow so the animation can restart
    surface.setAttribute("data-origin-pulse", "true");
  }, [surface]);
}
