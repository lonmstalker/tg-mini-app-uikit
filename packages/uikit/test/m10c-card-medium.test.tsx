import { readFileSync } from "node:fs";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import * as kit from "../src/index";

/* M10-C — card MEDIUM: CRD-004 (press-scale off under reduced motion),
 * CRD-006 (native-button keyboard semantics on TKCard). */

describe("CRD-004 press-scale respects reduced motion (source contract)", () => {
  const css = readFileSync("src/tokens/tokens.css", "utf8");

  it("[D-MOTION] both motion-off paths drop the press transform", () => {
    // OS setting
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce[\s\S]*?\.tk-press:active[\s\S]*?transform:\s*none/);
    // in-app toggle
    expect(css).toMatch(/data-tk-motion="off"\][\s\S]*?\.tk-press:active[\s\S]*?transform:\s*none/);
  });
});

describe("CRD-006 TKCard keyboard mirrors a native button", () => {
  it("[D-A11Y] held Enter (repeat) fires onClick once; first Enter fires", () => {
    const onClick = vi.fn();
    render(
      <kit.TKCard onClick={onClick} testId="c">
        x
      </kit.TKCard>,
    );
    const card = screen.getByTestId("c");
    fireEvent.keyDown(card, { key: "Enter" });
    fireEvent.keyDown(card, { key: "Enter", repeat: true });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("[D-A11Y] Space activates on keyup, not keydown", () => {
    const onClick = vi.fn();
    render(
      <kit.TKCard onClick={onClick} testId="c">
        x
      </kit.TKCard>,
    );
    const card = screen.getByTestId("c");
    fireEvent.keyDown(card, { key: " " });
    expect(onClick).not.toHaveBeenCalled();
    fireEvent.keyUp(card, { key: " " });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("[D-EDGE] Space keydown is prevented when clickable, but not on a non-clickable card", () => {
    const onClick = vi.fn();
    const { rerender } = render(
      <kit.TKCard onClick={onClick} testId="c">
        x
      </kit.TKCard>,
    );
    // fireEvent returns false when the handler called preventDefault (clickable → no scroll)
    expect(fireEvent.keyDown(screen.getByTestId("c"), { key: " " })).toBe(false);

    rerender(<kit.TKCard testId="c">x</kit.TKCard>);
    // non-clickable card leaves Space alone so the page can still scroll
    expect(fireEvent.keyDown(screen.getByTestId("c"), { key: " " })).toBe(true);
  });
});
