import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import * as kit from "../src/index";

/* M10-J — card MEDIUM: CRD-005 (selected-chip contrast ink), CRD-008 (disabled
 * state on TKCard). */

describe("CRD-005 TKCardChip selected ink contrasts on every tone", () => {
  it("[D-THEME] accent keeps the white on-accent ink", () => {
    render(
      <kit.TKCardChip selected tone="accent" testId="c">
        A
      </kit.TKCardChip>,
    );
    expect((screen.getByTestId("c") as HTMLElement).style.color).toBe("var(--tk-on-accent)");
  });

  it("[D-THEME] bright tones (orange/green) use a near-black ink, not white", () => {
    const { rerender } = render(
      <kit.TKCardChip selected tone="orange" testId="c">
        A
      </kit.TKCardChip>,
    );
    expect((screen.getByTestId("c") as HTMLElement).style.color).toContain("0, 0, 0");
    rerender(
      <kit.TKCardChip selected tone="green" testId="c">
        A
      </kit.TKCardChip>,
    );
    expect((screen.getByTestId("c") as HTMLElement).style.color).toContain("0, 0, 0");
  });

  it("[D-THEME] gray uses the theme-flipping --tk-surface ink (its bg flips with theme)", () => {
    render(
      <kit.TKCardChip selected tone="gray" testId="c">
        A
      </kit.TKCardChip>,
    );
    expect((screen.getByTestId("c") as HTMLElement).style.color).toBe("var(--tk-surface)");
  });

  it("[D-EDGE] an unselected chip keeps its tone ink", () => {
    render(
      <kit.TKCardChip tone="orange" testId="c">
        A
      </kit.TKCardChip>,
    );
    expect((screen.getByTestId("c") as HTMLElement).style.color).toBe("var(--tk-orange-ink)");
  });
});

describe("CRD-008 TKCard disabled state", () => {
  it("[D-STATE] disabled card is aria-disabled, not focusable, and does not fire onClick", () => {
    const onClick = vi.fn();
    render(
      <kit.TKCard onClick={onClick} disabled testId="card">
        x
      </kit.TKCard>,
    );
    const card = screen.getByTestId("card");
    expect(card.getAttribute("aria-disabled")).toBe("true");
    expect(card.getAttribute("role")).toBe("button"); // stays a (disabled) button for AT
    expect(card.getAttribute("tabindex")).toBeNull(); // but not focusable
    expect(card.style.opacity).toBe("0.5");
    fireEvent.click(card);
    fireEvent.keyDown(card, { key: "Enter" });
    expect(onClick).not.toHaveBeenCalled();
  });

  it("[D-STATE] an enabled clickable card still works", () => {
    const onClick = vi.fn();
    render(
      <kit.TKCard onClick={onClick} testId="card">
        x
      </kit.TKCard>,
    );
    const card = screen.getByTestId("card");
    expect(card.getAttribute("role")).toBe("button");
    fireEvent.keyDown(card, { key: "Enter" });
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
