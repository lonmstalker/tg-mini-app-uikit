import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as kit from "../src/index";
import type { TKIconName } from "../src/atoms/icons";

/* M10-M — service/icons MEDIUM: SVC-004 (TKIcon optional accessible name),
 * SVC-005 (TKTappable pressEffect opt-out), SVC-007 (unknown icon warns + fallback). */

afterEach(() => vi.restoreAllMocks());

describe("SVC-004 TKIcon accessible-name escape hatch", () => {
  it("[D-A11Y] label makes the icon a labelled role=img (not aria-hidden)", () => {
    render(<kit.TKIcon name="warning" label="Warning" testId="i" />);
    const svg = screen.getByTestId("i");
    expect(svg.getAttribute("role")).toBe("img");
    expect(svg.getAttribute("aria-label")).toBe("Warning");
    expect(svg.getAttribute("aria-hidden")).toBeNull();
    expect(screen.getByRole("img", { name: "Warning" })).toBe(svg);
    // single name source — no <title> alongside aria-label (would double-announce)
    expect(svg.querySelector("title")).toBeNull();
  });

  it("[D-A11Y] without a label the icon stays decorative (aria-hidden)", () => {
    render(<kit.TKIcon name="warning" testId="i" />);
    const svg = screen.getByTestId("i");
    expect(svg.getAttribute("aria-hidden")).toBe("true");
    expect(svg.getAttribute("role")).toBeNull();
  });
});

describe("SVC-005 TKTappable pressEffect opt-out", () => {
  it("[D-A11Y-MOTION] pressEffect={false} drops the tk-press class", () => {
    render(
      <kit.TKTappable pressEffect={false} testId="t">
        x
      </kit.TKTappable>,
    );
    expect(screen.getByTestId("t").classList.contains("tk-press")).toBe(false);
  });

  it("[D-API] the press class is present by default", () => {
    render(<kit.TKTappable testId="t">x</kit.TKTappable>);
    expect(screen.getByTestId("t").classList.contains("tk-press")).toBe(true);
  });
});

describe("SVC-007 unknown icon name warns + renders a placeholder", () => {
  it("[D-EDGE] a bad name logs a dev warning and renders a non-empty fallback", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<kit.TKIcon name={"definitely-not-an-icon" as TKIconName} testId="i" />);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toMatch(/TKIcon.*unknown/i);
    // not an empty <svg> — a placeholder box is drawn
    expect(screen.getByTestId("i").querySelector("rect")).not.toBeNull();
  });
});
