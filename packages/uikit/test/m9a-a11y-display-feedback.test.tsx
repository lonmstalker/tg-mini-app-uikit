import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import * as kit from "../src/index";

/* M9-A — a11y batch: FBK-002 (progress clamp), FBK-003 (bars reachable),
 * DSP-001 (avatar name), DSP-002 (avatar presence label). */

describe("FBK-002 TKProgress clamps aria-valuenow to the visual fill", () => {
  it("[D-STATE] value=140 → 100, value=-10 → 0, value=NaN → 0", () => {
    const { rerender } = render(<kit.TKProgress value={140} testId="p" />);
    expect(screen.getByTestId("p")).toHaveAttribute("aria-valuenow", "100");
    rerender(<kit.TKProgress value={-10} testId="p" />);
    expect(screen.getByTestId("p")).toHaveAttribute("aria-valuenow", "0");
    rerender(<kit.TKProgress value={Number.NaN} testId="p" />);
    expect(screen.getByTestId("p")).toHaveAttribute("aria-valuenow", "0");
    // the inner fill matches: a full-width bar fully slid out by transform
    const fill = screen.getByTestId("p").querySelector("div") as HTMLElement;
    expect(fill.style.transform).toBe("translateX(-100%)");
  });
});

describe("FBK-003 non-interactive TKBars expose the series to AT", () => {
  it("[D-A11Y] role=img with a summary naming each label:value", () => {
    render(<kit.TKBars data={[3, 7]} labels={["Mon", "Tue"]} testId="bars" />);
    const chart = screen.getByRole("img");
    const name = chart.getAttribute("aria-label") ?? "";
    expect(name).toContain("Mon: 3");
    expect(name).toContain("Tue: 7");
  });

  it("[D-A11Y] interactive bars stay buttons (no chart-level img role)", () => {
    render(<kit.TKBars data={[3, 7]} labels={["Mon", "Tue"]} onBarClick={() => {}} testId="bars" />);
    expect(screen.getByTestId("bars").getAttribute("role")).toBeNull();
    expect(screen.getByRole("button", { name: "Mon" })).toBeInTheDocument();
  });

  it("[D-EDGE] non-finite values are normalized in the summary; empty data has no img role", () => {
    const { rerender } = render(<kit.TKBars data={[Number.NaN, Infinity]} testId="bars" />);
    expect(screen.getByRole("img").getAttribute("aria-label")).toBe("Bar 1: 0, Bar 2: 0");
    rerender(<kit.TKBars data={[]} testId="bars" />);
    expect(screen.getByTestId("bars").getAttribute("role")).toBeNull();
  });
});

describe("DSP-001 TKAvatar exposes one accessible name", () => {
  it("[D-A11Y] photo + initials + alt → named by alt, no stale initials", () => {
    render(<kit.TKAvatar src="x.png" initials="JD" alt="Jane Doe" testId="a" />);
    expect(screen.getByRole("img", { name: "Jane Doe" })).toBe(screen.getByTestId("a"));
    expect(screen.queryByRole("img", { name: "JD" })).toBeNull();
  });

  it("[D-A11Y] initials only (no src) → named by initials", () => {
    render(<kit.TKAvatar initials="JD" testId="a" />);
    expect(screen.getByRole("img", { name: "JD" })).toBe(screen.getByTestId("a"));
  });

  it("[D-A11Y] photo with no alt → not named by the stale initials", () => {
    render(<kit.TKAvatar src="x.png" initials="JD" testId="a" />);
    expect(screen.getByTestId("a").getAttribute("aria-label")).not.toBe("JD");
  });

  it("[D-A11Y] a custom status node keeps the person's name on the body img", () => {
    render(
      <kit.TKAvatar initials="JD" alt="Jane Doe" status={<span data-tk-avatar-status>!</span>} testId="a" />,
    );
    // wrapper is the root (testId); the person's name lives on the inner body img
    expect(screen.getByRole("img", { name: "Jane Doe" })).toBeInTheDocument();
  });
});

describe("DSP-002 TKAvatar presence is announced", () => {
  it("[D-A11Y] status='online' exposes a localized 'Online'; 'offline' changes it", () => {
    const { rerender } = render(<kit.TKAvatar initials="X" status="online" testId="a" />);
    expect(screen.getByRole("img", { name: "Online" })).toBeInTheDocument();
    rerender(<kit.TKAvatar initials="X" status="offline" testId="a" />);
    expect(screen.getByRole("img", { name: "Offline" })).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "Online" })).toBeNull();
  });
});
