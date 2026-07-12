import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import * as kit from "../src/index";

/* M10-H — gestures MEDIUM: GES-003 (contextmenu only suppressed during a press),
 * GES-010 (long-press captures the pointer), GES-006 (swipe rails are labelled groups). */

function LongPressBox({ onLongPress = () => {} }: { onLongPress?: () => void }) {
  const bind = kit.useLongPress(onLongPress);
  return (
    <div data-testid="lp" {...bind}>
      hold
    </div>
  );
}

describe("GES-003 long-press contextmenu is suppressed only during a press", () => {
  it("[D-GESTURE] a plain right-click (no prior pointerdown) keeps its context menu", () => {
    render(<LongPressBox />);
    // fireEvent returns false when the default was prevented; true when allowed
    expect(fireEvent.contextMenu(screen.getByTestId("lp"))).toBe(true);
  });

  it("[D-GESTURE] a contextmenu mid-hold is prevented", () => {
    render(<LongPressBox />);
    const el = screen.getByTestId("lp");
    fireEvent.pointerDown(el, { isPrimary: true, button: 0, pointerId: 1, clientX: 0, clientY: 0 });
    expect(fireEvent.contextMenu(el)).toBe(false);
  });

  it("[D-EDGE] a fired-then-released press does not latch suppression onto a later right-click", () => {
    vi.useFakeTimers();
    try {
      render(<LongPressBox />);
      const el = screen.getByTestId("lp");
      fireEvent.pointerDown(el, { isPrimary: true, button: 0, pointerId: 1, clientX: 0, clientY: 0 });
      vi.advanceTimersByTime(600); // the long-press fires
      fireEvent.pointerUp(el, { pointerId: 1 }); // released, no trailing click
      // a later, unrelated right-click must keep its native menu
      expect(fireEvent.contextMenu(el)).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("GES-010 long-press captures the pointer on pointerdown", () => {
  it("[D-GESTURE] setPointerCapture is called so off-element moves still reach the handler", () => {
    render(<LongPressBox />);
    const el = screen.getByTestId("lp");
    const capture = vi.fn();
    el.setPointerCapture = capture;
    fireEvent.pointerDown(el, { isPrimary: true, button: 0, pointerId: 7, clientX: 0, clientY: 0 });
    expect(capture).toHaveBeenCalledWith(7);
  });
});

describe("GES-006 swipe-cell rails are labelled groups", () => {
  it("[D-A11Y] a trailing rail exposes role=group with an Actions label", () => {
    render(
      <kit.TKSwipeCell trailing={[{ label: "Delete", onAction: () => {} }]}>
        <div>row</div>
      </kit.TKSwipeCell>,
    );
    const group = screen.getByRole("group");
    expect(group.getAttribute("aria-label")).toMatch(/trailing.*actions/i);
  });
});
