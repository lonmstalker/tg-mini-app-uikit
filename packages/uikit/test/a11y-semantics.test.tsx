import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TKChip } from "../src/atoms/controls";
import { TKBars, TKRing } from "../src/composites/feedback";
import { TKOTP } from "../src/atoms/inputs";
import { TKSteps, TKTabbar } from "../src/composites/navigation";
import { TKTooltip } from "../src/composites/overlays";

describe("accessibility semantics", () => {
  it("A11Y-RING-001 exposes progressbar semantics when TKRing represents progress", () => {
    render(<TKRing value={0.42} />);

    const ring = screen.getByRole("progressbar", { name: /progress/i });
    expect(ring).toHaveAttribute("aria-valuemin", "0");
    expect(ring).toHaveAttribute("aria-valuemax", "100");
    expect(ring).toHaveAttribute("aria-valuenow", "42");
  });

  it("A11Y-BARS-001/A11Y-BARS-002 makes interactive bars named and keyboard-operable", async () => {
    const onSelect = vi.fn();
    render(<TKBars data={[3, 7]} labels={["Mon", "Tue"]} onBarClick={onSelect} />);

    const mon = screen.getByRole("button", { name: "Mon" });
    const tue = screen.getByRole("button", { name: "Tue" });
    // FBK-004: plain action bars (no selectedIndex) are not toggle buttons → no aria-pressed.
    expect(mon).not.toHaveAttribute("aria-pressed");
    expect(tue).not.toHaveAttribute("aria-pressed");

    mon.focus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    expect(onSelect).toHaveBeenNthCalledWith(1, 0);
    expect(onSelect).toHaveBeenNthCalledWith(2, 0);
  });

  it("A11Y-CHIP-001/A11Y-CHIP-002 exposes selected and removable chip semantics", async () => {
    const onRemove = vi.fn();
    render(
      <TKChip selected removable onRemove={onRemove}>
        Promo
      </TKChip>,
    );

    const chip = screen.getByRole("button", { name: "Promo" });
    const remove = screen.getByRole("button", { name: "Remove Promo" });
    expect(chip).toHaveAttribute("aria-pressed", "true");
    expect(chip.contains(remove)).toBe(false);
    await userEvent.click(remove);
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it("A11Y-OTP-001 makes the resend action a native keyboard-operable button", async () => {
    const onResend = vi.fn();
    render(<TKOTP onResend={onResend} />);

    const resend = screen.getByRole("button", { name: /resend/i });
    resend.focus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    expect(onResend).toHaveBeenCalledTimes(2);
  });

  it("A11Y-TABBAR-001 announces selected bottom navigation item", () => {
    render(
      <TKTabbar
        tabs={[
          { icon: "home", label: "Home" },
          { icon: "settings", label: "Settings" },
        ]}
        value={1}
      />,
    );

    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Settings" })).toHaveAttribute("aria-current", "page");
  });

  it("A11Y-STEPS-001 keeps passive steps out of the tab order", () => {
    render(<TKSteps steps={["Service", "Time", "Confirm"]} current={1} />);

    expect(screen.queryAllByRole("button")).toEqual([]);
    expect(screen.getByText("Time")).toHaveAttribute("aria-current", "step");
  });

  it("A11Y-TOOLTIP-001/A11Y-TOOLTIP-002 links tooltip to trigger and opens on focus", () => {
    render(
      <TKTooltip content="Helpful context">
        <button type="button">Help</button>
      </TKTooltip>,
    );

    const trigger = screen.getByRole("button", { name: "Help" });
    fireEvent.focus(trigger);

    const tooltip = screen.getByRole("tooltip");
    expect(trigger).toHaveAttribute("aria-describedby", tooltip.id);

    fireEvent.keyDown(document, { key: "Escape" });
    // Escape dismisses the portaled tooltip (removed from the DOM) and drops the
    // trigger's description link.
    expect(screen.queryByRole("tooltip")).toBeNull();
    expect(trigger).not.toHaveAttribute("aria-describedby");
  });
});
