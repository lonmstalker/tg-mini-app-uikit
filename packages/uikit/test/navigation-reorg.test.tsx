import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import * as kit from "../src";
import {
  TKCategoryTabs,
  TKHeader,
  TKPageDots,
  TKSegmented,
  TKSteps,
  TKTabbar,
} from "../src/composites/navigation";
import { TKCategoryTabs as ModuleTKCategoryTabs } from "../src/composites/navigation/category-tabs";
import { TKHeader as ModuleTKHeader } from "../src/composites/navigation/header";
import { TKPageDots as ModuleTKPageDots } from "../src/composites/navigation/page-dots";
import { TKSegmented as ModuleTKSegmented } from "../src/composites/navigation/segmented";
import { TKSteps as ModuleTKSteps } from "../src/composites/navigation/steps";
import { TKTabbar as ModuleTKTabbar } from "../src/composites/navigation/tabbar";

describe("navigation module reorganization", () => {
  it("publishes navigation composites from the composite category and root package", () => {
    expect(TKCategoryTabs).toBe(kit.TKCategoryTabs);
    expect(TKHeader).toBe(kit.TKHeader);
    expect(TKPageDots).toBe(kit.TKPageDots);
    expect(TKSegmented).toBe(kit.TKSegmented);
    expect(TKSteps).toBe(kit.TKSteps);
    expect(TKTabbar).toBe(kit.TKTabbar);
  });

  it("keeps navigation implementation modules under the composite category", () => {
    expect(ModuleTKCategoryTabs).toBe(TKCategoryTabs);
    expect(ModuleTKHeader).toBe(TKHeader);
    expect(ModuleTKPageDots).toBe(TKPageDots);
    expect(ModuleTKSegmented).toBe(TKSegmented);
    expect(ModuleTKSteps).toBe(TKSteps);
    expect(ModuleTKTabbar).toBe(TKTabbar);
  });

  it("renders representative navigation composites from the new category", () => {
    const onBack = vi.fn();
    const onTab = vi.fn();
    const onSegment = vi.fn();
    const onCategory = vi.fn();
    const onStep = vi.fn();
    const onDot = vi.fn();

    render(
      <div>
        <TKHeader title="Orders" subtitle="Today" onBack={onBack} />
        <TKTabbar
          tabs={[
            { icon: "home", label: "Home" },
            { icon: "settings", label: "Settings", count: 2 },
          ]}
          onChange={onTab}
        />
        <TKSegmented options={["Open", "Closed"]} onChange={onSegment} />
        <TKCategoryTabs tabs={["All", "Paid"]} onChange={onCategory} />
        <TKSteps steps={["Cart", "Pay", "Done"]} current={1} onStepClick={onStep} />
        <TKPageDots count={3} onChange={onDot} />
      </div>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    fireEvent.click(screen.getByRole("button", { name: /Settings/ }));
    fireEvent.click(screen.getByRole("button", { name: "Closed" }));
    fireEvent.click(screen.getByRole("button", { name: "Paid" }));
    fireEvent.click(screen.getByRole("button", { name: /Done/ }));
    fireEvent.click(screen.getByRole("button", { name: "Page 2" }));

    expect(onBack).toHaveBeenCalledOnce();
    expect(onTab).toHaveBeenCalledWith(1);
    expect(onSegment).toHaveBeenCalledWith("Closed");
    expect(onCategory).toHaveBeenCalledWith(1);
    expect(onStep).toHaveBeenCalledWith(2);
    expect(onDot).toHaveBeenCalledWith(1);
  });
});
