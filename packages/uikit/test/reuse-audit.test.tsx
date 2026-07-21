import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as kit from "../src/index";

/*
 * Regression tests for the July-2026 reuse audit (REU-001…REU-006): defects
 * that blocked using components outside the TKPage/TKAppShell architecture,
 * reported from a consumer finance app. Each block pins one confirmed defect.
 */

describe("reuse · TKChip never shrinks or wraps its label (REU-001)", () => {
  it("carries flex-shrink: 0 and white-space: nowrap", () => {
    render(<kit.TKChip>Готовая еда</kit.TKChip>);
    const chip = screen.getByRole("button", { name: "Готовая еда" });
    expect(chip.style.flexShrink).toBe("0");
    expect(chip.style.whiteSpace).toBe("nowrap");
  });

  it("keeps the guards in the removable variant (outer pill)", () => {
    render(
      <kit.TKChip removable onRemove={() => {}}>
        Готовая еда
      </kit.TKChip>,
    );
    const pill = screen.getByRole("button", { name: "Готовая еда" }).parentElement!;
    expect(pill.style.flexShrink).toBe("0");
    expect(pill.style.whiteSpace).toBe("nowrap");
  });
});

describe("reuse · TKStatTile invents no demo data (REU-002)", () => {
  const barsBlock = (container: HTMLElement) =>
    [...container.querySelectorAll("div")].find((el) => el.style.height === "34px");

  it("renders no sparkline block when `bars` is omitted", () => {
    const { container } = render(<kit.TKStatTile label="Spend" value="₽100" />);
    expect(barsBlock(container)).toBeUndefined();
  });

  it("renders no reserved 34px block for empty bars", () => {
    const { container } = render(<kit.TKStatTile label="Spend" value="₽100" bars={[]} />);
    expect(barsBlock(container)).toBeUndefined();
  });

  it("still renders the sparkline when real bars are passed", () => {
    const { container } = render(<kit.TKStatTile label="Spend" value="₽100" bars={[1, 2, 3]} />);
    expect(barsBlock(container)).toBeDefined();
  });
});

describe("reuse · TKProgress/TKRing accept a fill color (REU-003)", () => {
  it("TKProgress paints the inner fill with the `color` prop", () => {
    render(<kit.TKProgress value={40} color="rgb(200, 30, 30)" testId="p" />);
    const fill = screen.getByTestId("p").firstElementChild as HTMLElement;
    expect(fill.style.background).toBe("rgb(200, 30, 30)");
  });

  it("TKProgress defaults to the accent gradient", () => {
    render(<kit.TKProgress value={40} testId="p" />);
    const fill = screen.getByTestId("p").firstElementChild as HTMLElement;
    expect(fill.style.background).toBe("var(--tk-accent-grad)");
  });

  it("TKRing strokes the value arc with the `color` prop", () => {
    render(<kit.TKRing value={0.5} color="rgb(30, 200, 30)" testId="r" />);
    const circles = screen.getByTestId("r").querySelectorAll("circle");
    expect(circles[1]?.getAttribute("stroke")).toBe("rgb(30, 200, 30)");
  });
});

describe("reuse · TKIcon renders custom glyph content (REU-004)", () => {
  it("renders the `path` escape hatch inside the standard viewBox without warning", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<kit.TKIcon path={<path data-testid="custom-glyph" d="M4 12h16" />} label="Debts" />);
    const svg = screen.getByRole("img", { name: "Debts" });
    expect(svg.getAttribute("viewBox")).toBe("0 0 24 24");
    expect(screen.getByTestId("custom-glyph")).toBeTruthy();
    // no placeholder rect, no unknown-name warning
    expect(svg.querySelector("rect")).toBeNull();
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it("`path` wins over `name`", () => {
    render(<kit.TKIcon name="home" path={<path data-testid="override" d="M0 0" />} label="X" />);
    expect(screen.getByTestId("override")).toBeTruthy();
  });
});

describe("reuse · TKHeader works outside the TKPage slot (REU-005)", () => {
  it('variant="plain" drops the glass background, blur and hairline', () => {
    render(<kit.TKHeader title="История" variant="plain" testId="hdr" />);
    const root = screen.getByTestId("hdr");
    expect(root.style.background).toBe("");
    expect(root.style.backdropFilter).toBe("");
    expect(root.style.borderBottom).toBe("");
  });

  it("keeps the glass chrome by default", () => {
    render(<kit.TKHeader title="История" testId="hdr" />);
    expect(screen.getByTestId("hdr").style.background).toContain("var(--tk-glass)");
  });

  it("exposes the title as a level-1 heading by default", () => {
    render(<kit.TKHeader title="История" />);
    expect(screen.getByRole("heading", { level: 1, name: "История" })).toBeTruthy();
  });

  it("headingLevel tunes the level and 0 opts out", () => {
    const { rerender } = render(<kit.TKHeader title="История" headingLevel={2} />);
    expect(screen.getByRole("heading", { level: 2, name: "История" })).toBeTruthy();
    rerender(<kit.TKHeader title="История" headingLevel={0} />);
    expect(screen.queryByRole("heading")).toBeNull();
  });
});

describe("reuse · TKSheet warns when anchored to a document-growing ancestor (REU-006)", () => {
  const originalOffsetParent = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetParent");
  let anchor: HTMLDivElement;
  let anchorRect: { height: number; bottom: number };

  beforeEach(() => {
    anchor = document.createElement("div");
    anchor.getBoundingClientRect = () =>
      ({ top: 0, left: 0, right: 375, width: 375, height: anchorRect.height, bottom: anchorRect.bottom }) as DOMRect;
    Object.defineProperty(HTMLElement.prototype, "offsetParent", {
      configurable: true,
      get: () => anchor,
    });
  });

  afterEach(() => {
    if (originalOffsetParent) Object.defineProperty(HTMLElement.prototype, "offsetParent", originalOffsetParent);
  });

  it("warns once when the positioned ancestor outgrows the viewport", () => {
    anchorRect = { height: window.innerHeight * 3, bottom: window.innerHeight * 2 };
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<kit.TKSheet open title="S" />);
    const reuWarnings = warn.mock.calls.filter(([m]) => typeof m === "string" && m.includes("REU-006"));
    expect(reuWarnings).toHaveLength(1);
    warn.mockRestore();
  });

  it("stays silent for a viewport-sized anchor", () => {
    anchorRect = { height: window.innerHeight, bottom: window.innerHeight };
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<kit.TKSheet open title="S" />);
    const reuWarnings = warn.mock.calls.filter(([m]) => typeof m === "string" && m.includes("REU-006"));
    expect(reuWarnings).toHaveLength(0);
    warn.mockRestore();
  });
});
