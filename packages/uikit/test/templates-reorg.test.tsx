import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import * as kit from "../src";
import {
  TKLeaderboard,
  TKPaymentSummary,
  TKSlotPicker,
  TKWalletConnectButton,
  TKWalletStatusCell,
  TKXPHeader,
} from "../src/templates/patterns";
import { TKSlotPicker as ModuleTKSlotPicker } from "../src/templates/patterns/commerce";
import { TKLeaderboard as ModuleTKLeaderboard } from "../src/templates/patterns/gamification";
import { TKWalletConnectButton as ModuleTKWalletConnectButton } from "../src/templates/patterns/wallet";
import { TKConfetti } from "../src/templates/confetti";
import { TKOnboardingTooltip } from "../src/templates/onboarding";

describe("templates module reorganization", () => {
  it("publishes template exports from the template category and root package", () => {
    expect(TKConfetti).toBe(kit.TKConfetti);
    expect(TKLeaderboard).toBe(kit.TKLeaderboard);
    expect(TKOnboardingTooltip).toBe(kit.TKOnboardingTooltip);
    expect(TKPaymentSummary).toBe(kit.TKPaymentSummary);
    expect(TKSlotPicker).toBe(kit.TKSlotPicker);
    expect(TKWalletConnectButton).toBe(kit.TKWalletConnectButton);
    expect(TKWalletStatusCell).toBe(kit.TKWalletStatusCell);
    expect(TKXPHeader).toBe(kit.TKXPHeader);
  });

  it("keeps pattern implementation modules under the template category", () => {
    expect(ModuleTKSlotPicker).toBe(TKSlotPicker);
    expect(ModuleTKLeaderboard).toBe(TKLeaderboard);
    expect(ModuleTKWalletConnectButton).toBe(TKWalletConnectButton);
  });

  it("renders representative template surfaces from the new category", () => {
    const onSlot = vi.fn();
    const onWallet = vi.fn();
    const target = createRef<HTMLButtonElement>();
    render(
      <div>
        <TKSlotPicker days={[{ label: "Mon", date: "12" }]} slots={["10:00", "11:00"]} onSlotChange={onSlot} />
        <TKPaymentSummary rows={[{ label: "Total", value: "$42", total: true }]} />
        <TKWalletConnectButton onClick={onWallet} />
        <TKWalletStatusCell connected walletName="Tonkeeper" address="EQ..." />
        <TKXPHeader name="Anna" level={4} xp={60} />
        <TKLeaderboard rows={[{ rank: 1, initials: "AK", name: "Anna", points: 120, you: true }]} />
        <button ref={target} type="button">
          Target
        </button>
        <TKOnboardingTooltip steps={[{ target, title: "Tour", text: "First step" }]} />
      </div>,
    );

    fireEvent.click(screen.getByRole("button", { name: "11:00" }));
    fireEvent.click(screen.getByRole("button", { name: /Connect wallet/ }));

    expect(onSlot).toHaveBeenCalledWith("11:00");
    expect(onWallet).toHaveBeenCalledOnce();
    expect(screen.getByText("$42")).toBeVisible();
    expect(screen.getByText("Tonkeeper")).toBeVisible();
    expect(screen.getAllByText("Anna")).toHaveLength(2);
    expect(screen.getByText("Tour")).toBeVisible();
  });
});
