/*
 * The recorder event shape (data-model.md §RecorderEvent). Every visible effect
 * produces exactly one event carrying the same state vocabulary exposed on the
 * DOM (FR-005 ↔ FR-019). Ids/timestamps are derived from log position, never
 * Date.now(), so a fixed fixture replays byte-identical (FR-010).
 */
import type { BusinessContext, MotionState, RuntimeMode, SceneId } from "../app/composerReducer";

export type RecorderSource = "pointer" | "keyboard" | "runtime" | "system";

export interface RecorderEvent {
  id: string;
  scene: SceneId;
  context: BusinessContext;
  source: RecorderSource;
  /** e.g. 'surface.preview.media' */
  target: string;
  /** visible reaction, e.g. 'contact-highlight+inspector-open' */
  reaction: string;
  /** = runtime mode at emit time */
  status: RuntimeMode;
  motionState: MotionState;
  /** deterministic (= log index), not wall-clock */
  timestamp: number;
}

/** The visible-effect fields a dispatch supplies; the reducer fills the rest. */
export interface RecorderInput {
  source: RecorderSource;
  target: string;
  reaction: string;
}
