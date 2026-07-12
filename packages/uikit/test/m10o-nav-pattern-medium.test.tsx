import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as kit from "../src/index";

/* M10-O — NAV-003 (CategoryTabs/PageDots named group + positional total), NAV2-008
 * (unknown panel id dev-warn), PTN-003 (XP header progressbar role). */

afterEach(() => vi.restoreAllMocks());

describe("NAV-003 navigation groups are named with positional total", () => {
  it("[D-A11Y] TKCategoryTabs is a named group", () => {
    render(
      <kit.TKCategoryTabs
        ariaLabel="Categories"
        tabs={[
          { value: "a", label: "A" },
          { value: "b", label: "B" },
        ]}
      />,
    );
    expect(screen.getByRole("group", { name: "Categories" })).toBeInTheDocument();
  });

  it("[D-A11Y] TKPageDots is a named group whose label includes the positional total", () => {
    render(<kit.TKPageDots count={5} defaultPage={2} />);
    // group label carries the total ("Slide 3 of 5"); per-dot labels stay concise
    expect(screen.getByRole("group", { name: /3 of 5/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Page 1" })).toBeInTheDocument();
  });
});

describe("NAV2-008 TKNavStack warns on an unknown panel id", () => {
  it("[D-EDGE] an initial id with no registered panel logs a dev warning naming the ids", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <kit.TKNavStack initial="ghost">
        <kit.TKNavPanel id="home">home</kit.TKNavPanel>
      </kit.TKNavStack>,
    );
    expect(warn).toHaveBeenCalled();
    expect(warn.mock.calls.some((c) => /ghost/.test(String(c[0])) && /home/.test(String(c[0])))).toBe(true);
  });
});

describe("PTN-003 TKXPHeader exposes a progressbar", () => {
  it("[D-A11Y] progress track is role=progressbar with the clamped value", () => {
    render(<kit.TKXPHeader name="Player" xp={60} />);
    const bar = screen.getByRole("progressbar");
    expect(bar.getAttribute("aria-valuenow")).toBe("60");
    expect(bar.getAttribute("aria-valuemax")).toBe("100");
  });

  it("[D-EDGE] out-of-range xp is clamped in aria-valuenow", () => {
    render(<kit.TKXPHeader name="Player" xp={140} />);
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("100");
  });
});
