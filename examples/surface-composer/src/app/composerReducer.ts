/*
 * The single source of truth for the Surface Composer demo (data-model.md).
 * A pure `useReducer` tree: scene/motion machine + append-only recorder. No
 * wall-clock, no randomness — every recorder id/timestamp derives from the log
 * length, so a fixed fixture replays an identical sequence (FR-005, FR-010).
 */
import type { RecorderEvent, RecorderInput } from "../recorder/recorderTypes";

/** Six linear scenes; only firstLaunch/rangeRemix render this increment (D10). */
export type SceneId =
  | "firstLaunch"
  | "rangeRemix"
  | "interactionTrust"
  | "runtimePressure"
  | "buildProof"
  | "receipt";

export const SCENE_ORDER: readonly SceneId[] = [
  "firstLaunch",
  "rangeRemix",
  "interactionTrust",
  "runtimePressure",
  "buildProof",
  "receipt",
];

/** Five remixable contexts; the switcher shows four, community arrives via remix (D7). */
export type BusinessContext = "shop" | "booking" | "wallet" | "support" | "community";

export const REMIX_ORDER: readonly BusinessContext[] = [
  "shop",
  "booking",
  "wallet",
  "support",
  "community",
];

/** US1 birth states + US2 remix states; every value is mirrored on `data-motion-state`. */
export type MotionState =
  // US1 — first launch
  | "seed"
  | "rails"
  | "assembling"
  | "light-sweep"
  | "idle"
  | "first-touch"
  | "inspector-open"
  // US2 — range remix
  | "remix-start"
  | "separating"
  | "rotating"
  | "recomposing"
  | "locked"
  | "continuity";

/** Honest runtime label — a mock is never reported as native (FR-014, Principle V). */
export type RuntimeMode = "native-mirror" | "mock" | "browser-fallback";

export interface ComposerState {
  scene: SceneId;
  businessContext: BusinessContext;
  motionState: MotionState;
  runtimeMode: RuntimeMode;
  reducedMotion: boolean;
  recorder: RecorderEvent[];
  proofRevealed: boolean;
}

export const initialComposerState: ComposerState = {
  scene: "firstLaunch",
  businessContext: "shop",
  motionState: "seed",
  runtimeMode: "browser-fallback",
  reducedMotion: false,
  recorder: [],
  proofRevealed: false,
};

export type ComposerAction =
  | { type: "motion"; motionState: MotionState; record?: RecorderInput }
  | { type: "scene"; scene: SceneId; record?: RecorderInput }
  | { type: "remix"; businessContext: BusinessContext; motionState: MotionState; record?: RecorderInput }
  | { type: "runtimeMode"; runtimeMode: RuntimeMode }
  | { type: "reducedMotion"; reducedMotion: boolean }
  | { type: "revealProof"; record?: RecorderInput }
  | { type: "record"; record: RecorderInput };

/*
 * Append one recorder event to a draft next-state. The visible-effect fields
 * (source/target/reaction) come from the caller; everything provable from state
 * (scene, runtime status, the resulting motion state, the active context) is
 * filled here so the recorder vocabulary always matches the DOM (FR-005 ↔ FR-019).
 */
function appendEvent(next: ComposerState, input: RecorderInput, withContext = false): RecorderEvent[] {
  const event: RecorderEvent = {
    id: `evt-${next.recorder.length}`,
    timestamp: next.recorder.length,
    scene: next.scene,
    source: input.source,
    target: input.target,
    reaction: input.reaction,
    status: next.runtimeMode,
    motionState: next.motionState,
    ...(withContext ? { businessContext: next.businessContext } : {}),
  };
  return [...next.recorder, event];
}

export function composerReducer(state: ComposerState, action: ComposerAction): ComposerState {
  switch (action.type) {
    case "motion": {
      const next = { ...state, motionState: action.motionState };
      return action.record ? { ...next, recorder: appendEvent(next, action.record) } : next;
    }
    case "scene": {
      const next = { ...state, scene: action.scene };
      return action.record ? { ...next, recorder: appendEvent(next, action.record) } : next;
    }
    case "remix": {
      const next = { ...state, businessContext: action.businessContext, motionState: action.motionState };
      return action.record ? { ...next, recorder: appendEvent(next, action.record, true) } : next;
    }
    case "runtimeMode":
      return state.runtimeMode === action.runtimeMode ? state : { ...state, runtimeMode: action.runtimeMode };
    case "reducedMotion":
      return state.reducedMotion === action.reducedMotion ? state : { ...state, reducedMotion: action.reducedMotion };
    case "revealProof": {
      const next = { ...state, proofRevealed: true };
      return action.record ? { ...next, recorder: appendEvent(next, action.record) } : next;
    }
    case "record":
      return { ...state, recorder: appendEvent(state, action.record) };
    default:
      return state;
  }
}

/** The next scene in fixed keynote order; clamps at the last scene (FR-015). */
export function nextScene(scene: SceneId): SceneId {
  const i = SCENE_ORDER.indexOf(scene);
  return SCENE_ORDER[Math.min(i + 1, SCENE_ORDER.length - 1)];
}

/** The next remix context in fixed order; wraps community → shop. */
export function nextContext(context: BusinessContext): BusinessContext {
  const i = REMIX_ORDER.indexOf(context);
  return REMIX_ORDER[(i + 1) % REMIX_ORDER.length];
}
