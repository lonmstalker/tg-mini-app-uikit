import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import * as kit from "../src/index";

/* ---------------- TKInput email / validate ---------------- */

describe("TKInput validation", () => {
  it("type=email validates the format on blur and clears when fixed", () => {
    render(<kit.TKInput type="email" label="Email" placeholder="email" defaultValue="bad" />);
    const input = screen.getByPlaceholderText("email") as HTMLInputElement;
    // pristine: no error before the field is touched
    expect(screen.queryByText("Enter a valid email address")).not.toBeInTheDocument();
    expect(input.inputMode).toBe("email");

    fireEvent.blur(input);
    expect(screen.getByText("Enter a valid email address")).toBeInTheDocument();
    expect(input).toHaveAttribute("aria-invalid", "true");

    fireEvent.change(input, { target: { value: "nikita@example.com" } });
    expect(screen.queryByText("Enter a valid email address")).not.toBeInTheDocument();
    expect(input).toHaveAttribute("aria-invalid", "false");
  });

  it("custom validate runs on blur", () => {
    render(<kit.TKInput label="Name" placeholder="n" validate={(v) => (v.length < 3 ? "Too short" : undefined)} />);
    const input = screen.getByPlaceholderText("n");
    fireEvent.change(input, { target: { value: "ab" } });
    fireEvent.blur(input);
    expect(screen.getByText("Too short")).toBeInTheDocument();
    fireEvent.change(input, { target: { value: "abcd" } });
    expect(screen.queryByText("Too short")).not.toBeInTheDocument();
  });
});

/* ---------------- TKPhoneInput countrySelect ---------------- */

describe("TKPhoneInput countrySelect", () => {
  it("splits the dial code into a native <select> + national number field", () => {
    const onChange = vi.fn();
    render(<kit.TKPhoneInput countrySelect defaultCountry="RU" onChange={onChange} />);
    const select = screen.getByRole("combobox", { name: /country code/i });
    expect(select).toBeInTheDocument();
    const number = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.change(number, { target: { value: "9261234567" } });
    expect(number.value).toBe("(926) 123-45-67");
    expect(onChange).toHaveBeenLastCalledWith("+7 (926) 123-45-67", "79261234567");
  });

  it("lists the full country set and localizes names via lang", () => {
    render(<kit.TKPhoneInput countrySelect defaultCountry="DE" lang="ru" />);
    const select = screen.getByRole("combobox", { name: /country code/i }) as HTMLSelectElement;
    // The full ISO list (~240 countries), not a short curated subset.
    expect(select.options.length).toBeGreaterThan(200);
    // Country names are localized through Intl.DisplayNames (DE -> "Германия" in ru).
    expect([...select.options].some((o) => /Германия/.test(o.text))).toBe(true);
  });

  it("changing the country switches the dial code and reformats the number", () => {
    const onChange = vi.fn();
    render(<kit.TKPhoneInput countrySelect defaultCountry="RU" defaultValue="+7 900 000-00-00" onChange={onChange} />);
    const select = screen.getByRole("combobox", { name: /country code/i }) as HTMLSelectElement;
    const us = screen.getByRole("option", { name: /United States/ }) as HTMLOptionElement;
    fireEvent.change(select, { target: { value: us.value } });
    const [formatted, raw] = onChange.mock.lastCall as [string, string];
    expect(formatted.startsWith("+1 ")).toBe(true);
    expect(raw.startsWith("1")).toBe(true);
  });
});

/* ---------------- Native date / time ---------------- */

describe("native date & time pickers", () => {
  it("TKDateInput native renders <input type=date> and reports a Date", () => {
    const onChange = vi.fn();
    render(<kit.TKDateInput native label="Day" defaultValue={new Date(2026, 5, 13)} onChange={onChange} />);
    const input = screen.getByLabelText("Day") as HTMLInputElement;
    expect(input.type).toBe("date");
    expect(input.value).toBe("2026-06-13");
    fireEvent.change(input, { target: { value: "2026-07-01" } });
    const d = onChange.mock.lastCall![0] as Date;
    expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([2026, 6, 1]);
  });

  it("TKTimeInput native renders <input type=time> and emits HH:MM", () => {
    const onChange = vi.fn();
    render(<kit.TKTimeInput native label="At" defaultValue="09:30" onChange={onChange} />);
    const input = screen.getByLabelText("At") as HTMLInputElement;
    expect(input.type).toBe("time");
    expect(input.value).toBe("09:30");
    fireEvent.change(input, { target: { value: "14:45" } });
    expect(onChange).toHaveBeenLastCalledWith("14:45");
  });
});

/* ---------------- TKSkeletonTable ---------------- */

describe("TKSkeletonTable", () => {
  it("renders a header row plus the requested body rows of cells", () => {
    render(<kit.TKSkeletonTable rows={4} columns={3} testId="skel-table" />);
    const table = screen.getByTestId("skel-table");
    // header (3) + 4 rows × 3 cells = 15 placeholder cells
    expect(table.querySelectorAll(".tk-skel")).toHaveLength(15);
  });

  it("omits the header row when header=false", () => {
    render(<kit.TKSkeletonTable rows={2} columns={2} header={false} testId="skel-table" />);
    const table = screen.getByTestId("skel-table");
    expect(table.querySelectorAll(".tk-skel")).toHaveLength(4);
  });
});
