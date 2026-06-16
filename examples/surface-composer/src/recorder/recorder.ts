/*
 * Deterministic read accessor for the recorder log (dom-contract §2). The store
 * provider publishes the latest log here; e2e reads it via
 * `window.__composerRecorder()`. Dev/test builds only — never production.
 */
import type { RecorderEvent } from "./recorderTypes";

let snapshot: readonly RecorderEvent[] = [];

/** Called by the store provider whenever the recorder log changes. */
export function publishRecorder(events: readonly RecorderEvent[]): void {
  snapshot = events;
}

declare global {
  interface Window {
    __composerRecorder?: () => readonly RecorderEvent[];
  }
}

/** Install the `window.__composerRecorder` read accessor (dev/test only). */
export function installRecorderAccessor(): void {
  if (typeof window === "undefined" || !import.meta.env.DEV) return;
  window.__composerRecorder = () => snapshot;
}
