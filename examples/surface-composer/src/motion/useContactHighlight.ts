/*
 * The first meaningful touch on the live surface gives <100ms tactile feedback
 * at the contact point and opens the inspector (state remains first-touch,
 * FR-017/SC-014). A tap on empty space is recognized — ring + faint rail glow —
 * with NO state change (FR-006). Interactive controls handle their own
 * activation and are skipped.
 *
 * The CSS-var write is synchronous in the handler, so the ring appears on the
 * same frame as the press (the <100ms guarantee).
 */
import { useCallback, type PointerEvent as ReactPointerEvent } from "react";
import { useHaptics } from "@tg-mini-app/telegram";
import { useComposer, useComposerDispatch } from "../app/composerStore";
import { useSurfaceElement } from "../surface/surfaceContext";
import { useOriginPulse } from "./useOriginPulse";

export interface ContactHighlightHandlers {
  onPointerDown: (e: ReactPointerEvent) => void;
  onPointerMove: (e: ReactPointerEvent) => void;
  onPointerUp: () => void;
  onPointerCancel: () => void;
}

function writeContact(surface: HTMLElement, e: ReactPointerEvent): void {
  const rect = surface.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / Math.max(rect.width, 1)) * 100;
  const y = ((e.clientY - rect.top) / Math.max(rect.height, 1)) * 100;
  surface.style.setProperty("--sc-contact-x", `${x.toFixed(2)}%`);
  surface.style.setProperty("--sc-contact-y", `${y.toFixed(2)}%`);
}

export function useContactHighlight(): ContactHighlightHandlers {
  const surface = useSurfaceElement();
  const dispatch = useComposerDispatch();
  const { proofRevealed, motionState } = useComposer();
  const pulse = useOriginPulse();
  const haptics = useHaptics();

  const clearContact = useCallback(() => {
    surface?.removeAttribute("data-contact");
  }, [surface]);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent) => {
      if (!surface) return;
      const target = e.target as HTMLElement;
      // Controls own their activation — don't treat their press as a surface touch.
      if (target.closest("button, a, input, [role='button']")) return;

      writeContact(surface, e);
      surface.removeAttribute("data-contact");
      void surface.offsetWidth; // restart the contact animation for every touch
      surface.setAttribute("data-contact", "true");
      haptics.impact("light");
      dispatch({ type: "record", record: { source: "pointer", target: "surface.contact", reaction: "contact-highlight" } });
      dispatch({ type: "record", record: { source: "runtime", target: "surface.haptic", reaction: "haptic-feedback" } });

      const meaningful = !!target.closest("[data-meaningful]");
      if (meaningful && !proofRevealed && motionState === "idle") {
        surface.removeAttribute("data-recognized");
        pulse();
        dispatch({ type: "record", record: { source: "pointer", target: "surface.origin", reaction: "origin-pulse" } });
        dispatch({
          type: "motion",
          motionState: "first-touch",
          record: { source: "pointer", target: "surface.preview", reaction: "first-touch" },
        });
        dispatch({
          type: "revealProof",
          record: { source: "pointer", target: "surface.inspector", reaction: "inspector-open" },
        });
      } else if (!meaningful) {
        surface.removeAttribute("data-recognized");
        void surface.offsetWidth; // restart the recognition animation
        surface.setAttribute("data-recognized", "true");
        dispatch({ type: "record", record: { source: "pointer", target: "surface.empty", reaction: "empty-recognized" } });
      }
    },
    [surface, haptics, dispatch, proofRevealed, motionState, pulse],
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent) => {
      if (!surface || surface.getAttribute("data-contact") !== "true") return;
      writeContact(surface, e);
    },
    [surface],
  );

  return { onPointerDown, onPointerMove, onPointerUp: clearContact, onPointerCancel: clearContact };
}
