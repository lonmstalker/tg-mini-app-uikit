/*
 * US2 remix choreography (D6, FR-004): one object morphing, not navigation.
 * remix-start → separating → rotating → locked → continuity. The business
 * context changes inside the rotating hold so new content inherits the old
 * bounds (FLIP shared-element morph via motion/flip.ts); CSS keeps it as a
 * per-slot reflow, not a page flip. The same sequence runs for all three
 * triggers and emits the REMIX_STEP_SEQUENCE fixture plus the preservation
 * marks required by the recorder contract.
 *
 * Continuity (T041): the timeline only ever changes `businessContext` + content
 * — the frame, theme, safe-area, origin, runtime mark, and primary-action slot
 * position are untouched, so they stay anchored across every remix.
 *
 * Reduced motion: the SAME events fire in the SAME order (FR-010); the reflow is
 * swapped for a stepped opacity change in CSS and the FLIP is skipped. All
 * timing is deferred so StrictMode's double-mount stays clean.
 */
import type { Dispatch } from "react";
import type { BusinessContext, ComposerAction } from "../../app/composerReducer";
import type { RecorderSource } from "../../recorder/recorderTypes";
import { holdFor, SC_DURATION } from "../../motion/easing";
import { playFlip, recordRects, type RectMap } from "../../motion/flip";

export interface RemixOptions {
  to: BusinessContext;
  reducedMotion: boolean;
  source: RecorderSource;
  surface: HTMLElement | null;
}

export interface RemixControls {
  cancel: () => void;
}

function slotEntries(surface: HTMLElement | null): Array<readonly [string, HTMLElement]> {
  if (!surface) return [];
  return Array.from(surface.querySelectorAll<HTMLElement>(".sc-slot")).map(
    (el) => [el.dataset.flipId ?? "", el] as const,
  );
}

export function runRemix(dispatch: Dispatch<ComposerAction>, opts: RemixOptions): RemixControls {
  const { to, reducedMotion, source, surface } = opts;
  const timers: number[] = [];
  let prevRects: RectMap | null = null;

  const steps: Array<{ run: () => void; hold: number }> = [
    {
      run: () =>
        dispatch({ type: "motion", motionState: "remix-start", record: { source, target: "surface.remix", reaction: "remix-start" } }),
      hold: SC_DURATION.remix * 0.18,
    },
    {
      run: () =>
        dispatch({ type: "motion", motionState: "separating", record: { source, target: "surface.remix", reaction: "remix-separating" } }),
      hold: SC_DURATION.remix * 0.22,
    },
    {
      run: () => {
        prevRects = recordRects(slotEntries(surface)); // capture before content rebinds
        dispatch({ type: "motion", motionState: "rotating", record: { source, target: "surface.remix", reaction: "remix-rotating" } });
      },
      hold: SC_DURATION.remix * 0.3,
    },
    {
      run: () => {
        dispatch({
          type: "remix",
          businessContext: to,
          motionState: "rotating",
          record: { source, target: `surface.remix.${to}`, reaction: "templateChanged" },
        });
        dispatch({ type: "record", record: { source, target: "surface.tokens", reaction: "tokensPreserved" } });
        dispatch({ type: "record", record: { source, target: "surface.safe-area", reaction: "safeAreaPreserved" } });
        dispatch({ type: "record", record: { source, target: "surface.runtime", reaction: "runtimePreserved" } });
        if (!reducedMotion && prevRects) {
          const captured = prevRects;
          requestAnimationFrame(() => playFlip(slotEntries(surface), captured, { duration: SC_DURATION.remix }));
        }
      },
      hold: SC_DURATION.remix * 0.3,
    },
    {
      run: () =>
        dispatch({ type: "remix", businessContext: to, motionState: "locked", record: { source, target: "surface.remix", reaction: "remix-locked" } }),
      hold: SC_DURATION.remix * 0.18,
    },
    {
      run: () =>
        dispatch({ type: "remix", businessContext: to, motionState: "continuity", record: { source, target: "surface.remix", reaction: "remix-continuity" } }),
      hold: 0,
    },
  ];

  let i = 0;
  const tick = () => {
    if (i >= steps.length) return;
    const step = steps[i++];
    step.run();
    if (i < steps.length) timers.push(window.setTimeout(tick, holdFor(step.hold, reducedMotion)));
  };
  timers.push(window.setTimeout(tick, 0));
  return {
    cancel: () => {
      for (const t of timers) clearTimeout(t);
    },
  };
}
