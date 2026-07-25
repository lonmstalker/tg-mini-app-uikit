import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TKChip, TKSlider, TKStepper } from "../src/atoms/controls";

describe("TKChip", () => {
  it("appends the consumer className on the default (non-removable) root too (REU-007)", () => {
    render(<TKChip className="custom">Tag</TKChip>);
    const chip = screen.getByRole("button", { name: "Tag" });
    expect(chip.className).toContain("tk-press");
    expect(chip.className).toContain("custom");
  });
});

describe("TKSlider", () => {
  const getSlider = (name = "Volume") => screen.getByRole("slider", { name });

  it("exposes min/max/value through ARIA", () => {
    render(<TKSlider label="Volume" min={10} max={20} defaultValue={15} suffix="%" />);
    const slider = getSlider();
    expect(slider).toHaveAttribute("aria-valuemin", "10");
    expect(slider).toHaveAttribute("aria-valuemax", "20");
    expect(slider).toHaveAttribute("aria-valuenow", "15");
    expect(slider).toHaveAttribute("aria-valuetext", "15%");
  });

  it("steps with arrow keys by the configured step", () => {
    const onChange = vi.fn();
    render(<TKSlider label="Volume" min={0} max={100} step={5} defaultValue={50} onChange={onChange} />);
    const slider = getSlider();
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(slider).toHaveAttribute("aria-valuenow", "55");
    fireEvent.keyDown(slider, { key: "ArrowUp" });
    expect(slider).toHaveAttribute("aria-valuenow", "60");
    fireEvent.keyDown(slider, { key: "ArrowLeft" });
    fireEvent.keyDown(slider, { key: "ArrowDown" });
    expect(slider).toHaveAttribute("aria-valuenow", "50");
    expect(onChange).toHaveBeenLastCalledWith(50);
  });

  it("clamps at min and max", () => {
    render(<TKSlider label="Volume" min={0} max={10} step={5} defaultValue={10} />);
    const slider = getSlider();
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(slider).toHaveAttribute("aria-valuenow", "10");
    fireEvent.keyDown(slider, { key: "Home" });
    expect(slider).toHaveAttribute("aria-valuenow", "0");
    fireEvent.keyDown(slider, { key: "ArrowLeft" });
    expect(slider).toHaveAttribute("aria-valuenow", "0");
    fireEvent.keyDown(slider, { key: "End" });
    expect(slider).toHaveAttribute("aria-valuenow", "10");
  });

  it("jumps by a tenth of the range on PageUp/PageDown", () => {
    render(<TKSlider label="Volume" min={0} max={100} step={1} defaultValue={50} />);
    const slider = getSlider();
    fireEvent.keyDown(slider, { key: "PageUp" });
    expect(slider).toHaveAttribute("aria-valuenow", "60");
    fireEvent.keyDown(slider, { key: "PageDown" });
    expect(slider).toHaveAttribute("aria-valuenow", "50");
  });

  it("keeps a controlled value and only reports changes", () => {
    const onChange = vi.fn();
    render(<TKSlider label="Volume" value={30} onChange={onChange} />);
    const slider = getSlider();
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledWith(31);
    expect(slider).toHaveAttribute("aria-valuenow", "30");
  });

  it("ignores keyboard input when disabled", () => {
    const onChange = vi.fn();
    render(<TKSlider label="Volume" defaultValue={50} disabled onChange={onChange} />);
    const slider = getSlider();
    expect(slider).toHaveAttribute("tabindex", "-1");
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(onChange).not.toHaveBeenCalled();
    expect(slider).toHaveAttribute("aria-valuenow", "50");
  });
});

describe("TKStepper", () => {
  it("increments and decrements within bounds", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TKStepper defaultValue={1} min={0} max={2} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "Increase" }));
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(onChange).toHaveBeenLastCalledWith(2);

    await user.click(screen.getByRole("button", { name: "Decrease" }));
    await user.click(screen.getByRole("button", { name: "Decrease" }));
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(onChange).toHaveBeenLastCalledWith(0);
  });

  it("disables the buttons at the bounds", () => {
    render(<TKStepper defaultValue={0} min={0} max={0} />);
    expect(screen.getByRole("button", { name: "Decrease" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Increase" })).toBeDisabled();
  });

  it("does not move its own value in controlled mode", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TKStepper value={5} min={0} max={99} onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "Increase" }));
    expect(onChange).toHaveBeenCalledWith(6);
    expect(screen.getByText("5")).toBeInTheDocument();
  });
});
