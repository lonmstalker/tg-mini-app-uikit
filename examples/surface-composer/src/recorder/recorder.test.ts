import { describe, expect, it } from "vitest";
import { installRecorderAccessor, publishRecorder } from "./recorder";
import type { RecorderEvent } from "./recorderTypes";

describe("recorder accessor", () => {
  it("exposes the published snapshot via window.__composerRecorder (dom-contract §2)", () => {
    installRecorderAccessor();
    const events: RecorderEvent[] = [
      {
        id: "evt-0",
        scene: "firstLaunch",
        context: "shop",
        source: "pointer",
        target: "surface.preview.media",
        reaction: "inspector-open",
        status: "mock",
        motionState: "first-touch",
        timestamp: 0,
      },
    ];
    publishRecorder(events);
    expect(window.__composerRecorder?.()).toEqual(events);

    // Publishing again replaces the snapshot (append-only log is re-published whole).
    publishRecorder([...events, { ...events[0], id: "evt-1", timestamp: 1 }]);
    expect(window.__composerRecorder?.()).toHaveLength(2);
  });
});
