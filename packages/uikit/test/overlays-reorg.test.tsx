import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import * as kit from "../src";
import {
  TKActionSheet,
  TKDialog,
  TKFrame,
  TKPopper,
  TKSheet,
  TKToastProvider,
  TKTooltip,
  useTKToast,
} from "../src/composites/overlays";
import { TKDialog as ModuleTKDialog } from "../src/composites/overlays/dialog";
import { TKFrame as ModuleTKFrame } from "../src/composites/overlays/shared";
import { TKSheet as ModuleTKSheet } from "../src/composites/overlays/sheet";
import { TKToastProvider as ModuleTKToastProvider } from "../src/composites/overlays/toasts";

describe("overlays module reorganization", () => {
  it("publishes overlay composites from the composite category and root package", () => {
    expect(TKActionSheet).toBe(kit.TKActionSheet);
    expect(TKDialog).toBe(kit.TKDialog);
    expect(TKFrame).toBe(kit.TKFrame);
    expect(TKPopper).toBe(kit.TKPopper);
    expect(TKSheet).toBe(kit.TKSheet);
    expect(TKToastProvider).toBe(kit.TKToastProvider);
    expect(TKTooltip).toBe(kit.TKTooltip);
    expect(useTKToast).toBe(kit.useTKToast);
  });

  it("keeps overlay implementation modules under the composite category", () => {
    expect(ModuleTKDialog).toBe(TKDialog);
    expect(ModuleTKFrame).toBe(TKFrame);
    expect(ModuleTKSheet).toBe(TKSheet);
    expect(ModuleTKToastProvider).toBe(TKToastProvider);
  });

  it("renders representative overlay composites from the new category", () => {
    render(
      <TKFrame testId="frame">
        <TKDialog open title="Confirm" text="Run the action?" />
        <TKActionSheet open items={[{ label: "Share" }]} cancelLabel="Close" />
        <TKSheet open title="Details">
          <div>Sheet body</div>
        </TKSheet>
      </TKFrame>,
    );

    expect(screen.getByTestId("frame")).toBeVisible();
    expect(screen.getByRole("alertdialog", { name: "Confirm" })).toBeVisible();
    expect(screen.getAllByRole("dialog")).toHaveLength(2);
    expect(screen.getByText("Sheet body")).toBeVisible();
  });
});
