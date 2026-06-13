import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import * as kit from "../src";
import { TKAccordion, TKCell, TKInfiniteList, TKListGroup, TKVirtualList } from "../src/composites/lists";
import { TKListGroup as ModuleTKListGroup } from "../src/composites/lists/list-group";
import { TKCell as ModuleTKCell } from "../src/composites/lists/cell";
import { TKAccordion as ModuleTKAccordion } from "../src/composites/lists/accordion";
import { TKInfiniteList as ModuleTKInfiniteList } from "../src/composites/lists/infinite-list";
import { TKVirtualList as ModuleTKVirtualList } from "../src/composites/lists/virtual-list";

describe("lists module reorganization", () => {
  it("publishes list composites from the composite category and root package", () => {
    expect(TKAccordion).toBe(kit.TKAccordion);
    expect(TKCell).toBe(kit.TKCell);
    expect(TKInfiniteList).toBe(kit.TKInfiniteList);
    expect(TKListGroup).toBe(kit.TKListGroup);
    expect(TKVirtualList).toBe(kit.TKVirtualList);
  });

  it("keeps list implementation modules under the composite category", () => {
    expect(ModuleTKAccordion).toBe(TKAccordion);
    expect(ModuleTKCell).toBe(TKCell);
    expect(ModuleTKInfiniteList).toBe(TKInfiniteList);
    expect(ModuleTKListGroup).toBe(TKListGroup);
    expect(ModuleTKVirtualList).toBe(TKVirtualList);
  });

  it("renders representative list composites from the new category", () => {
    const onCell = vi.fn();
    render(
      <div>
        <TKListGroup title="Settings">
          <TKCell title="Profile" subtitle="Open settings" onClick={onCell} />
        </TKListGroup>
        <TKAccordion items={[{ id: "a", title: "FAQ", content: "Answer" }]} />
        <TKInfiniteList hasMore onLoadMore={vi.fn()} testId="infinite">
          <div>Feed item</div>
        </TKInfiniteList>
        <TKVirtualList
          items={["one", "two", "three"]}
          itemHeight={24}
          height={72}
          renderItem={(item) => <div>{item}</div>}
          testId="virtual"
        />
      </div>,
    );

    fireEvent.keyDown(screen.getByRole("button", { name: /Profile/ }), { key: "Enter" });
    expect(onCell).toHaveBeenCalledOnce();
    expect(screen.getByText("Settings")).toBeVisible();
    expect(screen.getByRole("button", { name: /FAQ/ })).toBeVisible();
    expect(screen.getByTestId("infinite").querySelector("[data-tk-sentinel]")).not.toBeNull();
    expect(screen.getByTestId("virtual")).toBeVisible();
  });
});
