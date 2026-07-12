import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import * as kit from "../src/index";

/* M9-E — INP-004: the searchable TKSelect's filter input must live OUTSIDE
 * role=listbox so the listbox holds only option/group children. */

describe("INP-004 searchable TKSelect has a valid combobox/listbox structure", () => {
  it("[D-A11Y] the filter input is not a DOM descendant of the listbox", async () => {
    const user = userEvent.setup();
    render(
      <kit.TKSelect
        searchable
        options={[
          { value: "apple", label: "Apple" },
          { value: "banana", label: "Banana" },
        ]}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    const listbox = screen.getByRole("listbox");
    const filter = screen.getByRole("textbox");

    // the filter drives the listbox but is not inside it (no nested control)
    expect(listbox.contains(filter)).toBe(false);
    expect(within(listbox).queryByRole("textbox")).toBeNull();
    // the listbox holds only options
    expect(within(listbox).getAllByRole("option")).toHaveLength(2);
    // and the filter is linked to that listbox
    expect(filter.getAttribute("aria-controls")).toBe(listbox.getAttribute("id"));
  });

  it("[D-A11Y] a non-matching filter shows a status, not an empty listbox (A11Y-202)", async () => {
    const user = userEvent.setup();
    render(
      <kit.TKSelect
        searchable
        options={[
          { value: "apple", label: "Apple" },
          { value: "banana", label: "Banana" },
        ]}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    await user.keyboard("zzz");
    expect(screen.queryByRole("listbox")).toBeNull(); // no empty role=listbox
    expect(screen.getByRole("status")).toHaveTextContent(/nothing found/i);
  });
});
