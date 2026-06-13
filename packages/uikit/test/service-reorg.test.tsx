import { describe, expect, it } from "vitest";
import { TKTappable as AtomTKTappable, TKVisuallyHidden as AtomTKVisuallyHidden } from "../src/atoms/service";
import { TKTappable as RootTKTappable, TKVisuallyHidden as RootTKVisuallyHidden } from "../src";

describe("service atom reorganization", () => {
  it("exports service atoms from the atom category and root package", () => {
    expect(AtomTKTappable).toBeDefined();
    expect(AtomTKVisuallyHidden).toBeDefined();
    expect(RootTKTappable).toBe(AtomTKTappable);
    expect(RootTKVisuallyHidden).toBe(AtomTKVisuallyHidden);
  });
});
