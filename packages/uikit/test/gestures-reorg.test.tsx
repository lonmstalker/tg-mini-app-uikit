import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import * as kit from "../src";
import { TKPullToRefresh, TKSwipeCell, useLongPress } from "../src/composites/gestures";
import { useLongPress as ModuleUseLongPress } from "../src/composites/gestures/long-press";
import { TKPullToRefresh as ModuleTKPullToRefresh } from "../src/composites/gestures/pull-to-refresh";
import { TKSwipeCell as ModuleTKSwipeCell } from "../src/composites/gestures/swipe-cell";

describe("gestures module reorganization", () => {
  it("publishes gesture composites from the composite category and root package", () => {
    expect(TKPullToRefresh).toBe(kit.TKPullToRefresh);
    expect(TKSwipeCell).toBe(kit.TKSwipeCell);
    expect(useLongPress).toBe(kit.useLongPress);
  });

  it("keeps gesture implementation modules under the composite category", () => {
    expect(ModuleTKPullToRefresh).toBe(TKPullToRefresh);
    expect(ModuleTKSwipeCell).toBe(TKSwipeCell);
    expect(ModuleUseLongPress).toBe(useLongPress);
  });

  it("renders representative gesture surfaces from the new category", () => {
    const onRefresh = vi.fn();
    const onDelete = vi.fn();
    render(
      <div>
        <TKPullToRefresh onRefresh={onRefresh} testId="ptr">
          <div>Pull content</div>
        </TKPullToRefresh>
        <TKSwipeCell trailing={[{ label: "Delete", onAction: onDelete }]} testId="swipe">
          <div>Swipe row</div>
        </TKSwipeCell>
      </div>,
    );

    expect(screen.getByTestId("ptr")).toBeVisible();
    expect(screen.getByText("Swipe row")).toBeVisible();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });
});
