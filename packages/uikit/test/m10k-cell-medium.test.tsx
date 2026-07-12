import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import * as kit from "../src/index";

/* M10-K — list cell MEDIUM: LST-006 (title wrap/clamp opt-in), LST-007 (press
 * feedback only on actionable rows, not decorative chevrons). */

describe("LST-007 TKCell press feedback tracks actionability", () => {
  it("[D-A11Y] a chevron-only cell (no onClick) is not tappable and has no button role", () => {
    render(<kit.TKCell chevron title="Decorative" testId="c" />);
    const cell = screen.getByTestId("c");
    expect(cell.classList.contains("tk-cell-tap")).toBe(false);
    expect(cell.getAttribute("role")).toBeNull();
    expect(cell.getAttribute("tabindex")).toBeNull();
  });

  it("[D-A11Y] a chevron cell WITH onClick is actionable + tappable", () => {
    render(<kit.TKCell chevron onClick={() => {}} title="Open" testId="c" />);
    const cell = screen.getByTestId("c");
    expect(cell.classList.contains("tk-cell-tap")).toBe(true);
    expect(cell.getAttribute("role")).toBe("button");
  });

  it("[D-API] a link cell stays tappable", () => {
    render(
      <kit.TKCell as="a" href="#x" title="Link" testId="c" />,
    );
    expect(screen.getByTestId("c").classList.contains("tk-cell-tap")).toBe(true);
  });
});

describe("LST-006 TKCell title truncation is configurable", () => {
  const long = "x".repeat(60);

  it("[D-RESP] default title is a single-line ellipsis", () => {
    render(<kit.TKCell title={long} />);
    expect(screen.getByText(long).style.whiteSpace).toBe("nowrap");
  });

  it("[D-RESP] wrap lets the title flow over multiple lines (no ellipsis)", () => {
    render(<kit.TKCell title={long} wrap />);
    const el = screen.getByText(long);
    expect(el.style.whiteSpace).toBe("normal");
    expect(el.style.textOverflow).toBe("");
  });

  it("[D-RESP] lines={2} clamps with -webkit-line-clamp", () => {
    render(<kit.TKCell title={long} lines={2} />);
    const el = screen.getByText(long);
    expect(el.style.display).toBe("-webkit-box");
    expect(el.style.webkitLineClamp).toBe("2");
  });
});
