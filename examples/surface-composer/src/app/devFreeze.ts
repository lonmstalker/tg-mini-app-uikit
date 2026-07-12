/*
 * Dev/test-only choreography freeze. `?motion=<state>` starts the surface in a
 * fixed motion state and disables auto-advance, so the visual-snapshot gate
 * (SC-011) can capture transient birth/remix frames deterministically. It is
 * honest — it pauses the timeline, it never fakes a runtime or proof.
 */
import type { BusinessContext, MotionState, SceneId } from "./composerReducer";

const MOTION_STATES: readonly MotionState[] = [
  "seed",
  "rails",
  "assembling",
  "idle",
  "first-touch",
  "remix-start",
  "separating",
  "rotating",
  "locked",
  "continuity",
];

function read(): MotionState | null {
  if (typeof window === "undefined") return null;
  const v = new URLSearchParams(window.location.search).get("motion");
  return v && (MOTION_STATES as readonly string[]).includes(v) ? (v as MotionState) : null;
}

function readParam(name: string): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(name);
}

/** The frozen motion state, or null when the timeline should play normally. */
export const FROZEN_MOTION = read();
export const IS_FROZEN = FROZEN_MOTION !== null;
/** Proof must be revealed for the frozen first-touch frame to render. */
export const FROZEN_PROOF = FROZEN_MOTION === "first-touch";

const SCENES: readonly SceneId[] = ["firstLaunch", "rangeRemix"];
const CONTEXTS: readonly BusinessContext[] = ["shop", "booking", "wallet", "support", "community"];

/** `?scene=rangeRemix` lets snapshots freeze a remix frame; defaults to firstLaunch. */
export const FROZEN_SCENE: SceneId | null = (() => {
  const v = readParam("scene");
  return v && (SCENES as readonly string[]).includes(v) ? (v as SceneId) : null;
})();

/** `?context=booking` seeds the active remix context for a frozen frame. */
export const FROZEN_CONTEXT: BusinessContext | null = (() => {
  const v = readParam("context");
  return v && (CONTEXTS as readonly string[]).includes(v) ? (v as BusinessContext) : null;
})();
