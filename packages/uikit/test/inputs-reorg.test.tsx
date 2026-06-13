import { describe, expect, it } from "vitest";
import {
  TKFileInput as AtomTKFileInput,
  TKFormField as AtomTKFormField,
  TKFormInput as AtomTKFormInput,
  TKInput as AtomTKInput,
  TKMultiselect as AtomTKMultiselect,
  TKOTP as AtomTKOTP,
  TKSearch as AtomTKSearch,
  TKSelect as AtomTKSelect,
  TKSelectable as AtomTKSelectable,
  TKTextarea as AtomTKTextarea,
} from "../src/atoms/inputs";
import {
  TKFormInput as AtomBaseTKFormInput,
  TKInput as AtomBaseTKInput,
  TKSelectable as AtomBaseTKSelectable,
  TKTextarea as AtomBaseTKTextarea,
} from "../src/atoms/inputs/base";
import {
  TKFormInput as AtomFileTKFormInput,
  TKInput as AtomFileTKInput,
} from "../src/atoms/inputs/input";
import { TKFormField as AtomFileTKFormField } from "../src/atoms/inputs/form-field";
import { TKTextarea as AtomFileTKTextarea } from "../src/atoms/inputs/textarea";
import { TKSelectable as AtomFileTKSelectable } from "../src/atoms/inputs/selectable";
import { TKMultiselect as AtomFileTKMultiselect } from "../src/atoms/inputs/choices";
import { TKFileInput as AtomFileTKFileInput } from "../src/atoms/inputs/file-input";
import { TKSearch as AtomFileTKSearch } from "../src/atoms/inputs/search";
import {
  TKFileInput as AtomFileSearchTKFileInput,
  TKSearch as AtomFileSearchTKSearch,
} from "../src/atoms/inputs/file-search";
import { TKSelect as AtomFileTKSelect } from "../src/atoms/inputs/select";
import { TKOTP as AtomFileTKOTP } from "../src/atoms/inputs/otp";
import {
  TKOTP as AtomSelectOtpTKOTP,
  TKSelect as AtomSelectOtpTKSelect,
} from "../src/atoms/inputs/select-otp";
import {
  TKFileInput as RootTKFileInput,
  TKFormField as RootTKFormField,
  TKFormInput as RootTKFormInput,
  TKInput as RootTKInput,
  TKMultiselect as RootTKMultiselect,
  TKOTP as RootTKOTP,
  TKSearch as RootTKSearch,
  TKSelect as RootTKSelect,
  TKSelectable as RootTKSelectable,
  TKTextarea as RootTKTextarea,
} from "../src";

describe("inputs atom reorganization", () => {
  it("exports inputs from the atom category and root package", () => {
    expect(AtomTKInput).toBeDefined();
    expect(AtomTKTextarea).toBeDefined();
    expect(AtomTKSearch).toBeDefined();
    expect(AtomTKSelect).toBeDefined();
    expect(AtomTKMultiselect).toBeDefined();
    expect(AtomTKSelectable).toBeDefined();
    expect(AtomTKOTP).toBeDefined();
    expect(AtomTKFileInput).toBeDefined();
    expect(AtomTKFormField).toBeDefined();
    expect(AtomTKFormInput).toBeDefined();

    expect(RootTKInput).toBe(AtomTKInput);
    expect(RootTKTextarea).toBe(AtomTKTextarea);
    expect(RootTKSearch).toBe(AtomTKSearch);
    expect(RootTKSelect).toBe(AtomTKSelect);
    expect(RootTKMultiselect).toBe(AtomTKMultiselect);
    expect(RootTKSelectable).toBe(AtomTKSelectable);
    expect(RootTKOTP).toBe(AtomTKOTP);
    expect(RootTKFileInput).toBe(AtomTKFileInput);
    expect(RootTKFormField).toBe(AtomTKFormField);
    expect(RootTKFormInput).toBe(AtomTKFormInput);
  });

  it("splits base inputs into atom modules", () => {
    expect(AtomFileTKInput).toBe(AtomTKInput);
    expect(AtomFileTKFormInput).toBe(AtomTKFormInput);
    expect(AtomFileTKFormField).toBe(AtomTKFormField);
    expect(AtomFileTKTextarea).toBe(AtomTKTextarea);
    expect(AtomFileTKSelectable).toBe(AtomTKSelectable);

    expect(AtomBaseTKInput).toBe(AtomFileTKInput);
    expect(AtomBaseTKFormInput).toBe(AtomFileTKFormInput);
    expect(AtomBaseTKTextarea).toBe(AtomFileTKTextarea);
    expect(AtomBaseTKSelectable).toBe(AtomFileTKSelectable);
  });

  it("exports choices from their atom module", () => {
    expect(AtomFileTKMultiselect).toBe(AtomTKMultiselect);
  });

  it("splits file input and search into atom modules", () => {
    expect(AtomFileTKFileInput).toBe(AtomTKFileInput);
    expect(AtomFileTKSearch).toBe(AtomTKSearch);

    expect(AtomFileSearchTKFileInput).toBe(AtomFileTKFileInput);
    expect(AtomFileSearchTKSearch).toBe(AtomFileTKSearch);
  });

  it("splits select and otp into atom modules", () => {
    expect(AtomFileTKSelect).toBe(AtomTKSelect);
    expect(AtomFileTKOTP).toBe(AtomTKOTP);

    expect(AtomSelectOtpTKSelect).toBe(AtomFileTKSelect);
    expect(AtomSelectOtpTKOTP).toBe(AtomFileTKOTP);
  });
});
