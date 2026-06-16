import { describe, expect, it } from "vitest";
import {
  composerReducer,
  initialComposerState,
  nextContext,
  nextScene,
  type ComposerAction,
} from "./composerReducer";

const rec = { source: "pointer", target: "surface.preview", reaction: "r" } as const;

describe("composerReducer", () => {
  it("appends a deterministic recorder event (id/timestamp from log length)", () => {
    const s1 = composerReducer(initialComposerState, { type: "motion", motionState: "rails", record: rec });
    expect(s1.motionState).toBe("rails");
    expect(s1.recorder).toHaveLength(1);
    expect(s1.recorder[0]).toMatchObject({
      id: "evt-0",
      timestamp: 0,
      motionState: "rails",
      scene: "firstLaunch",
      status: "browser-fallback",
      reaction: "r",
    });
    const s2 = composerReducer(s1, { type: "motion", motionState: "assembling", record: rec });
    expect(s2.recorder[1]).toMatchObject({ id: "evt-1", timestamp: 1, motionState: "assembling" });
  });

  it("is deterministic: identical action sequence → identical recorder log", () => {
    const seq: ComposerAction[] = [
      { type: "motion", motionState: "rails", record: rec },
      { type: "motion", motionState: "assembling", record: rec },
      { type: "remix", businessContext: "booking", motionState: "locked", record: rec },
    ];
    const run = () => seq.reduce(composerReducer, initialComposerState);
    expect(run().recorder).toEqual(run().recorder);
  });

  it("remix events carry the active businessContext", () => {
    const s = composerReducer(initialComposerState, {
      type: "remix",
      businessContext: "wallet",
      motionState: "locked",
      record: rec,
    });
    expect(s.businessContext).toBe("wallet");
    expect(s.recorder[0].businessContext).toBe("wallet");
  });

  it("a transition without a record does not append (no phantom events)", () => {
    const s = composerReducer(initialComposerState, { type: "motion", motionState: "idle" });
    expect(s.recorder).toHaveLength(0);
    expect(s.motionState).toBe("idle");
  });

  it("revealProof flips the buyer-first gate", () => {
    expect(initialComposerState.proofRevealed).toBe(false);
    const s = composerReducer(initialComposerState, { type: "revealProof", record: rec });
    expect(s.proofRevealed).toBe(true);
    expect(s.recorder).toHaveLength(1);
  });

  it("nextScene advances linearly and clamps at the last scene (FR-015)", () => {
    expect(nextScene("firstLaunch")).toBe("rangeRemix");
    expect(nextScene("rangeRemix")).toBe("interactionTrust");
    expect(nextScene("receipt")).toBe("receipt");
  });

  it("nextContext follows the fixed order and wraps community → shop", () => {
    expect(nextContext("shop")).toBe("booking");
    expect(nextContext("support")).toBe("community");
    expect(nextContext("community")).toBe("shop");
  });
});
