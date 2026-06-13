import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  TKIcon as AtomTKIcon,
  TK_ICON_NAMES as ATOM_TK_ICON_NAMES,
  TK_ICON_PATHS as ATOM_TK_ICON_PATHS,
} from "../src/atoms/icons";
import { TKIcon as RootTKIcon, TK_ICON_NAMES as ROOT_TK_ICON_NAMES, TK_ICON_PATHS as ROOT_TK_ICON_PATHS } from "../src";

describe("icons atom reorganization", () => {
  it("exports icons from the atom category and root package", () => {
    expect(AtomTKIcon).toBeDefined();
    expect(ATOM_TK_ICON_NAMES).toContain("check");
    expect(ATOM_TK_ICON_PATHS.check).toBeDefined();
    expect(RootTKIcon).toBe(AtomTKIcon);
    expect(ROOT_TK_ICON_NAMES).toBe(ATOM_TK_ICON_NAMES);
    expect(ROOT_TK_ICON_PATHS).toBe(ATOM_TK_ICON_PATHS);
  });

  it("renders a smoke icon through the atom implementation", () => {
    render(<AtomTKIcon name="check" size={24} strokeWidth={2.5} testId="icon" />);

    const icon = screen.getByTestId("icon");
    expect(icon.tagName.toLowerCase()).toBe("svg");
    expect(icon).toHaveAttribute("width", "24");
    expect(icon).toHaveAttribute("height", "24");
    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(icon.querySelector("path")).not.toBeNull();
  });
});
