import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import * as kit from "../src";
import {
  TKBars,
  TKEmptyState,
  TKProgress,
  TKRing,
  TKSkeleton,
  TKSkeletonCard,
  TKSkeletonList,
  TKSkeletonText,
  TKTimeline,
} from "../src/composites/feedback";
import { TKSkeleton as ModuleTKSkeleton } from "../src/composites/feedback/skeletons";
import { TKProgress as ModuleTKProgress } from "../src/composites/feedback/progress";
import { TKBars as ModuleTKBars } from "../src/composites/feedback/bars";
import { TKEmptyState as ModuleTKEmptyState } from "../src/composites/feedback/empty-state";
import { TKTimeline as ModuleTKTimeline } from "../src/composites/feedback/timeline";

describe("feedback module reorganization", () => {
  it("publishes feedback composites from the composite category and root package", () => {
    expect(TKBars).toBe(kit.TKBars);
    expect(TKEmptyState).toBe(kit.TKEmptyState);
    expect(TKProgress).toBe(kit.TKProgress);
    expect(TKRing).toBe(kit.TKRing);
    expect(TKSkeleton).toBe(kit.TKSkeleton);
    expect(TKSkeletonCard).toBe(kit.TKSkeletonCard);
    expect(TKSkeletonList).toBe(kit.TKSkeletonList);
    expect(TKSkeletonText).toBe(kit.TKSkeletonText);
    expect(TKTimeline).toBe(kit.TKTimeline);
  });

  it("keeps feedback implementation modules under the composite category", () => {
    expect(ModuleTKSkeleton).toBe(TKSkeleton);
    expect(ModuleTKProgress).toBe(TKProgress);
    expect(ModuleTKBars).toBe(TKBars);
    expect(ModuleTKEmptyState).toBe(TKEmptyState);
    expect(ModuleTKTimeline).toBe(TKTimeline);
  });

  it("renders representative feedback composites from the new category", () => {
    const onBarClick = vi.fn();
    render(
      <div>
        <TKSkeleton testId="skel" />
        <TKSkeletonCard testId="skel-card" />
        <TKSkeletonList rows={2} testId="skel-list" />
        <TKSkeletonText lines={2} testId="skel-text" />
        <TKProgress value={35} />
        <TKRing value={0.64} />
        <TKBars data={[2, 4]} labels={["Mon", "Tue"]} onBarClick={onBarClick} />
        <TKEmptyState title="No orders" text="Try another filter" cta="Reset" />
        <TKTimeline steps={[{ label: "Ordered", status: "done" }, { label: "Packed", status: "active" }]} />
      </div>,
    );

    expect(screen.getByTestId("skel")).toBeVisible();
    expect(screen.getByTestId("skel-list")).toHaveStyle({ width: "100%", boxSizing: "border-box" });
    expect(screen.getAllByRole("progressbar")).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "Tue" }));
    expect(onBarClick).toHaveBeenCalledWith(1);
    expect(screen.getByText("No orders")).toBeVisible();
    expect(screen.getByText("Packed")).toBeVisible();
  });
});
