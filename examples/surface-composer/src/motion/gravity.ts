/*
 * CTA gravity (FR-020, US1 sc.4): on the primary commitment, the first-viewport
 * fragments align toward the CTA. The surface flips `data-gravity` and CSS does
 * the alignment with transform/opacity only — no confetti, no layout animation.
 * Reduced motion resolves to the same aligned end-state (collapsed durations),
 * emitting the identical recorder event.
 */
import type { Dispatch } from "react";
import type { ComposerAction } from "../app/composerReducer";

export function triggerGravity(surface: HTMLElement | null, dispatch: Dispatch<ComposerAction>): void {
  dispatch({ type: "record", record: { source: "pointer", target: "surface.cta", reaction: "cta-gravity" } });
  surface?.setAttribute("data-gravity", "active");
}
