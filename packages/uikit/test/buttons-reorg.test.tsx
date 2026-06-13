import { describe, expect, it } from "vitest";
import {
  TKButton as AtomTKButton,
  TKIconButton as AtomTKIconButton,
  TKInlineButtons as AtomTKInlineButtons,
  TKMainButton as AtomTKMainButton,
  TKSpinner as AtomTKSpinner,
  tkButtonVariantStyle as atomTkButtonVariantStyle,
} from "../src/atoms/buttons";
import {
  TKButton as AtomFileTKButton,
  tkButtonVariantStyle as atomFileTkButtonVariantStyle,
} from "../src/atoms/buttons/button";
import { TKIconButton as AtomFileTKIconButton } from "../src/atoms/buttons/icon-button";
import { TKInlineButtons as AtomFileTKInlineButtons } from "../src/atoms/buttons/inline-buttons";
import { TKSpinner as AtomFileTKSpinner } from "../src/atoms/buttons/spinner";
import { TKMainButton as AtomFileTKMainButton } from "../src/atoms/buttons/main-button";
import {
  TKButton as RootTKButton,
  TKIconButton as RootTKIconButton,
  TKInlineButtons as RootTKInlineButtons,
  TKMainButton as RootTKMainButton,
  TKSpinner as RootTKSpinner,
  tkButtonVariantStyle as rootTkButtonVariantStyle,
} from "../src";

describe("buttons atom reorganization", () => {
  it("exports buttons from the atom category and root package", () => {
    expect(AtomTKButton).toBeDefined();
    expect(AtomTKIconButton).toBeDefined();
    expect(AtomTKInlineButtons).toBeDefined();
    expect(AtomTKSpinner).toBeDefined();
    expect(AtomTKMainButton).toBeDefined();
    expect(atomTkButtonVariantStyle).toBeDefined();

    expect(RootTKButton).toBe(AtomTKButton);
    expect(RootTKIconButton).toBe(AtomTKIconButton);
    expect(RootTKInlineButtons).toBe(AtomTKInlineButtons);
    expect(RootTKSpinner).toBe(AtomTKSpinner);
    expect(RootTKMainButton).toBe(AtomTKMainButton);
    expect(rootTkButtonVariantStyle).toBe(atomTkButtonVariantStyle);
  });

  it("splits button atoms into focused modules", () => {
    expect(AtomFileTKButton).toBe(AtomTKButton);
    expect(atomFileTkButtonVariantStyle).toBe(atomTkButtonVariantStyle);
    expect(AtomFileTKIconButton).toBe(AtomTKIconButton);
    expect(AtomFileTKInlineButtons).toBe(AtomTKInlineButtons);
    expect(AtomFileTKSpinner).toBe(AtomTKSpinner);
    expect(AtomFileTKMainButton).toBe(AtomTKMainButton);
  });
});
