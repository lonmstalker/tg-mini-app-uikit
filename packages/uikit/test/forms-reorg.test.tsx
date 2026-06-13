import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import * as kit from "../src";
import {
  TKCalendar,
  TKChipsInput,
  TKDateInput,
  TKMaskedInput,
  TKPhoneInput,
  TKPinInput,
  TKTimeInput,
} from "../src/composites/forms";
import { TKCalendar as ModuleTKCalendar } from "../src/composites/forms/calendar";
import { TKChipsInput as ModuleTKChipsInput } from "../src/composites/forms/chips-date";
import { TKMaskedInput as ModuleTKMaskedInput } from "../src/composites/forms/masked";
import { TKPinInput as ModuleTKPinInput } from "../src/composites/forms/pin";

describe("forms module reorganization", () => {
  it("publishes form composites from the composite category and root package", () => {
    expect(TKCalendar).toBe(kit.TKCalendar);
    expect(TKChipsInput).toBe(kit.TKChipsInput);
    expect(TKDateInput).toBe(kit.TKDateInput);
    expect(TKMaskedInput).toBe(kit.TKMaskedInput);
    expect(TKPhoneInput).toBe(kit.TKPhoneInput);
    expect(TKPinInput).toBe(kit.TKPinInput);
    expect(TKTimeInput).toBe(kit.TKTimeInput);
  });

  it("keeps form implementation modules under the composite category", () => {
    expect(ModuleTKCalendar).toBe(TKCalendar);
    expect(ModuleTKChipsInput).toBe(TKChipsInput);
    expect(ModuleTKMaskedInput).toBe(TKMaskedInput);
    expect(ModuleTKPinInput).toBe(TKPinInput);
  });

  it("renders representative form composites from the new category", () => {
    render(
      <div>
        <TKChipsInput label="Tags" defaultValue={["React"]} />
        <TKMaskedInput mask="##-##" label="Code" defaultValue="1234" />
        <TKPinInput length={4} title={<span>PIN</span>} />
        <TKCalendar defaultMonth={new Date(2026, 5, 1)} />
      </div>,
    );

    expect(screen.getByText("Tags")).toBeVisible();
    expect(screen.getByDisplayValue("12-34")).toBeVisible();
    expect(screen.getByText("PIN")).toBeVisible();
    expect(screen.getByRole("grid")).toBeVisible();
  });
});
