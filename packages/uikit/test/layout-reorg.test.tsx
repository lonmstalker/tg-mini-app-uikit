import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import * as kit from "../src";
import { TKBottomBar, TKPage, TKSafeArea } from "../src/composites/layout";
import { TKSafeArea as ModuleTKSafeArea } from "../src/composites/layout/safe-area";
import { TKPage as ModuleTKPage } from "../src/composites/layout/page";
import { TKBottomBar as ModuleTKBottomBar } from "../src/composites/layout/bottom-bar";

describe("layout module reorganization", () => {
  it("publishes layout composites from the composite category and root package", () => {
    expect(TKBottomBar).toBe(kit.TKBottomBar);
    expect(TKPage).toBe(kit.TKPage);
    expect(TKSafeArea).toBe(kit.TKSafeArea);
  });

  it("keeps layout implementation modules under the composite category", () => {
    expect(ModuleTKBottomBar).toBe(TKBottomBar);
    expect(ModuleTKPage).toBe(TKPage);
    expect(ModuleTKSafeArea).toBe(TKSafeArea);
  });

  it("renders representative layout composites from the new category", () => {
    render(
      <TKPage header={<div>Header</div>} footer={<TKBottomBar>Actions</TKBottomBar>} safeTop={false} testId="page">
        <TKSafeArea edges={["bottom"]}>Content</TKSafeArea>
      </TKPage>,
    );

    expect(screen.getByTestId("page")).toBeVisible();
    expect(screen.getByText("Header")).toBeVisible();
    expect(screen.getByText("Content")).toBeVisible();
    expect(screen.getByText("Actions")).toBeVisible();
  });
});
