import { describe, expect, it } from "vitest";
import {
  TKCheckbox as AtomTKCheckbox,
  TKChip as AtomTKChip,
  TKRating as AtomTKRating,
  TKSlider as AtomTKSlider,
  TKStepper as AtomTKStepper,
} from "../src/atoms/controls";
import {
  TKCheckbox as RootTKCheckbox,
  TKChip as RootTKChip,
  TKRating as RootTKRating,
  TKSlider as RootTKSlider,
  TKStepper as RootTKStepper,
} from "../src";
import {
  TKChip as AtomFileTKChip,
  TKChipGroup as AtomFileTKChipGroup,
} from "../src/atoms/controls/chips";
import { TKCheckbox as AtomFileTKCheckbox } from "../src/atoms/controls/checkbox";
import { TKRadioGroup as AtomFileTKRadioGroup } from "../src/atoms/controls/radio-group";
import { TKSwitch as AtomFileTKSwitch } from "../src/atoms/controls/switch";
import {
  TKCheckbox as AtomSelectionTKCheckbox,
  TKRadioGroup as AtomSelectionTKRadioGroup,
  TKSwitch as AtomSelectionTKSwitch,
} from "../src/atoms/controls/selection";
import { TKSlider as AtomFileTKSlider } from "../src/atoms/controls/sliders";
import { TKRating as AtomFileTKRating } from "../src/atoms/controls/rating";
import { TKStepper as AtomFileTKStepper } from "../src/atoms/controls/stepper";
import {
  TKRating as AtomStepperRatingTKRating,
  TKStepper as AtomStepperRatingTKStepper,
} from "../src/atoms/controls/stepper-rating";

describe("controls atom reorganization", () => {
  it("exports controls from the atom category and root package", () => {
    expect(AtomTKChip).toBeDefined();
    expect(AtomTKCheckbox).toBeDefined();
    expect(AtomTKSlider).toBeDefined();
    expect(AtomTKStepper).toBeDefined();
    expect(AtomTKRating).toBeDefined();

    expect(RootTKChip).toBe(AtomTKChip);
    expect(RootTKCheckbox).toBe(AtomTKCheckbox);
    expect(RootTKSlider).toBe(AtomTKSlider);
    expect(RootTKStepper).toBe(AtomTKStepper);
    expect(RootTKRating).toBe(AtomTKRating);
  });

  it("exports chips from their atom module", () => {
    expect(AtomFileTKChip).toBe(AtomTKChip);
    expect(AtomFileTKChipGroup).toBeDefined();
  });

  it("splits selection controls into atom modules", () => {
    expect(AtomFileTKCheckbox).toBe(AtomTKCheckbox);
    expect(AtomFileTKRadioGroup).toBeDefined();
    expect(AtomFileTKSwitch).toBeDefined();

    expect(AtomSelectionTKCheckbox).toBe(AtomFileTKCheckbox);
    expect(AtomSelectionTKRadioGroup).toBe(AtomFileTKRadioGroup);
    expect(AtomSelectionTKSwitch).toBe(AtomFileTKSwitch);
  });

  it("exports sliders from their atom module", () => {
    expect(AtomFileTKSlider).toBe(AtomTKSlider);
  });

  it("splits stepper and rating into atom modules", () => {
    expect(AtomFileTKStepper).toBe(AtomTKStepper);
    expect(AtomFileTKRating).toBe(AtomTKRating);

    expect(AtomStepperRatingTKStepper).toBe(AtomFileTKStepper);
    expect(AtomStepperRatingTKRating).toBe(AtomFileTKRating);
  });
});
