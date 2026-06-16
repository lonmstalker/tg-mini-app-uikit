/*
 * The first meaningful touch on the live surface gives <100ms tactile feedback
 * at the contact point and opens the inspector (first-touch → inspector-open,
 * FR-017/SC-014). A tap on empty space is recognized — ring + faint rail glow —
 * with NO state change (FR-006). Interactive controls handle their own
 * activation and are skipped.
 *
 * The CSS-var write is synchronous in the handler, so the ring appears on the
 * same frame as the press (the <100ms guarantee).
 */
import { useCallback, type PointerEvent as ReactPointerEvent } from "react";
import { useComposer, useComposerDispatch } from "../app/composerStore";
import { useSurfaceElement } from "../surface/surfaceContext";
import { useOriginPulse } from "./useOriginPulse";

export function useContactHighlight(): (e: ReactPointerEvent) => void {
  const surface = useSurfaceElement();
  const dispatch = useComposerDispatch();
  const { proofRevealed, motionState } = useComposer();
  const pulse = useOriginPulse();

  return useCallback(
    (e: ReactPointerEvent) => {
      if (!surface) return;
      const target = e.target as HTMLElement;
      // Controls own their activation — don't treat their press as a surface touch.
      if (target.closest("button, a, input, [role='button']")) return;

      const rect = surface.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / Math.max(rect.width, 1)) * 100;
      const y = ((e.clientY - rect.top) / Math.max(rect.height, 1)) * 100;
      surface.style.setProperty("--sc-contact-x", `${x.toFixed(2)}%`);
      surface.style.setProperty("--sc-contact-y", `${y.toFixed(2)}%`);

      const meaningful = !!target.closest("[data-meaningful]");
      if (meaningful && !proofRevealed && motionState === "idle") {
        surface.removeAttribute("data-recognized");
        surface.setAttribute("data-contact", "true");
        pulse();
        dispatch({
          type: "motion",
          motionState: "first-touch",
          record: { source: "pointer", target: "surface.preview", reaction: "first-touch" },
        });
        dispatch({ type: "revealProof" });
        dispatch({
          type: "motion",
          motionState: "inspector-open",
          record: { source: "pointer", target: "surface.inspector", reaction: "inspector-open" },
        });
      } else if (!meaningful) {
        surface.removeAttribute("data-recognized");
        void surface.offsetWidth; // restart the recognition animation
        surface.setAttribute("data-recognized", "true");
        dispatch({ type: "record", record: { source: "pointer", target: "surface.empty", reaction: "empty-recognized" } });
      }
    },
    [surface, dispatch, proofRevealed, motionState, pulse],
  );
}
