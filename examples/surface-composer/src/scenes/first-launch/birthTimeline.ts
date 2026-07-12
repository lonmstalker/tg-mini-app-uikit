/*
 * US1 birth choreography (animation-brief §6, FR-003): a chained scheduler that
 * walks the surface through seed → rails → assembling → idle,
 * dispatching one recorder event per step (the BIRTH_SEQUENCE fixture). All
 * timing is deferred via timers so React StrictMode's mount/unmount/mount cycle
 * cancels the first run cleanly — the recorder log stays byte-deterministic.
 *
 * Visual motion is CSS keyed off [data-motion-state] (transform/opacity only,
 * FR-013). Under reduced motion the holds collapse to ~0 but the SAME events
 * fire in the SAME order (FR-010).
 */
import type { Dispatch } from "react";
import type { ComposerAction, MotionState } from "../../app/composerReducer";
import { holdFor, SC_DURATION } from "../../motion/easing";

interface BirthStep {
  motionState: MotionState;
  reaction: string;
  hold: number;
}

const STEPS: readonly BirthStep[] = [
  { motionState: "seed", reaction: "birth-seed", hold: SC_DURATION.seed },
  { motionState: "rails", reaction: "birth-rails", hold: SC_DURATION.rails },
  { motionState: "assembling", reaction: "birth-assembling", hold: SC_DURATION.assemble },
  { motionState: "idle", reaction: "birth-idle", hold: 0 },
];

export interface BirthControls {
  cancel: () => void;
}

export function runBirth(dispatch: Dispatch<ComposerAction>, reducedMotion: boolean): BirthControls {
  const timers: number[] = [];
  let i = 0;
  const tick = () => {
    if (i >= STEPS.length) return;
    const step = STEPS[i++];
    dispatch({
      type: "motion",
      motionState: step.motionState,
      record: { source: "system", target: "surface.birth", reaction: step.reaction },
    });
    if (i < STEPS.length) timers.push(window.setTimeout(tick, holdFor(step.hold, reducedMotion)));
  };
  timers.push(window.setTimeout(tick, 0));
  return {
    cancel: () => {
      for (const t of timers) clearTimeout(t);
    },
  };
}
