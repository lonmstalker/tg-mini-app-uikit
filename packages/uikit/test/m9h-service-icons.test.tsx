import { readFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import * as kit from "../src/index";

/* M9-H — SVC-002 (TKVisuallyHidden forwards attrs + focusable), SVC-003
 * (filled icons keep inner cut-outs via fill-rule:evenodd). */

describe("SVC-002 TKVisuallyHidden forwards native attributes", () => {
  it("[D-API] merges className and forwards id/role; keeps the sr-only class", () => {
    render(
      <kit.TKVisuallyHidden className="x" id="skip" role="status" testId="vh">
        hi
      </kit.TKVisuallyHidden>,
    );
    const el = screen.getByTestId("vh");
    expect(el.classList.contains("tk-sr-only")).toBe(true);
    expect(el.classList.contains("x")).toBe(true);
    expect(el.getAttribute("id")).toBe("skip");
    expect(el.getAttribute("role")).toBe("status");
  });

  it("[D-A11Y] focusable variant gets the reveal class (defined with a :focus rule)", () => {
    render(
      <kit.TKVisuallyHidden focusable testId="vh">
        Skip to content
      </kit.TKVisuallyHidden>,
    );
    expect(screen.getByTestId("vh").classList.contains("tk-sr-only-focusable")).toBe(true);
    const css = readFileSync("src/tokens/tokens.css", "utf8");
    expect(css).toMatch(/\.tk-sr-only-focusable:focus/);
  });
});

describe("SVC-003 filled icons preserve inner cut-outs", () => {
  it("[D-THEME] filled icon fills with evenodd; outline icon stays stroked", () => {
    const { rerender } = render(<kit.TKIcon name="verified" filled testId="ic" />);
    const svg = screen.getByTestId("ic");
    expect(svg.getAttribute("fill")).toBe("currentColor");
    expect(svg.getAttribute("fill-rule")).toBe("evenodd");

    rerender(<kit.TKIcon name="verified" testId="ic" />);
    expect(screen.getByTestId("ic").getAttribute("fill")).toBe("none");
    expect(screen.getByTestId("ic").getAttribute("fill-rule")).toBeNull();
  });
});
