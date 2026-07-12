import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import * as kit from "../src/index";

/* M10-N — CTL-010: RadioGroup/ChipGroup accept aria-label(/labelledby) and forward
 * a ref to their group root. */

const opts = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Bravo" },
];

describe("CTL-010 TKRadioGroup naming + ref", () => {
  it("[D-A11Y] aria-label names the radiogroup", () => {
    render(<kit.TKRadioGroup options={opts} aria-label="Pick one" />);
    expect(screen.getByRole("radiogroup", { name: "Pick one" })).toBeInTheDocument();
  });

  it("[D-API] ref resolves to the radiogroup root", () => {
    const ref = createRef<HTMLDivElement>();
    render(<kit.TKRadioGroup ref={ref} options={opts} aria-label="G" />);
    expect(ref.current?.getAttribute("role")).toBe("radiogroup");
  });
});

describe("CTL-010 TKChipGroup naming + ref", () => {
  it("[D-A11Y] is a named role=toolbar (announces reliably, matches the roving pattern)", () => {
    render(<kit.TKChipGroup items={opts} aria-label="Filters" />);
    expect(screen.getByRole("toolbar", { name: "Filters" })).toBeInTheDocument();
  });

  it("[D-API] ref resolves to the toolbar root", () => {
    const ref = createRef<HTMLDivElement>();
    render(<kit.TKChipGroup ref={ref} items={opts} aria-label="F" />);
    expect(ref.current?.getAttribute("role")).toBe("toolbar");
  });
});
