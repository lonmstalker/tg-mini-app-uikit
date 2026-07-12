import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import * as kit from "../src/index";
import {
  TKCategoryTabs,
  TKChipGroup,
  TKInlineButtons,
  TKMultiselect,
  TKRadioGroup,
  TKSegmented,
} from "../src/index";

describe("M2.1 roving tabindex & arrow navigation", () => {
  it("TKRadioGroup: only the checked radio is tabbable; arrows move selection and focus", () => {
    const onChange = vi.fn();
    render(<TKRadioGroup options={["a", "b", "c"]} defaultValue="a" onChange={onChange} />);
    const radios = screen.getAllByRole("radio");
    expect(radios.map((r) => r.tabIndex)).toEqual([0, -1, -1]);

    radios[0].focus();
    fireEvent.keyDown(radios[0], { key: "ArrowDown" });
    expect(onChange).toHaveBeenLastCalledWith("b");
    expect(document.activeElement).toBe(screen.getAllByRole("radio")[1]);

    // wraps from the last to the first
    const updated = screen.getAllByRole("radio");
    fireEvent.keyDown(updated[1], { key: "ArrowDown" });
    fireEvent.keyDown(screen.getAllByRole("radio")[2], { key: "ArrowDown" });
    expect(onChange).toHaveBeenLastCalledWith("a");
  });

  it("TKRadioGroup: arrows skip disabled options", () => {
    const onChange = vi.fn();
    render(
      <TKRadioGroup
        options={["a", { value: "b", disabled: true }, "c"]}
        defaultValue="a"
        onChange={onChange}
      />,
    );
    const radios = screen.getAllByRole("radio");
    radios[0].focus();
    fireEvent.keyDown(radios[0], { key: "ArrowDown" });
    expect(onChange).toHaveBeenLastCalledWith("c");
  });

  it("TKSegmented: roving tabindex, arrows move the selection", () => {
    const onChange = vi.fn();
    render(<TKSegmented options={["one", "two", "three"]} defaultValue="one" onChange={onChange} />);
    const buttons = screen.getAllByRole("radio"); // NAV-002: segmented is a radiogroup
    expect(buttons.map((b) => b.tabIndex)).toEqual([0, -1, -1]);
    buttons[0].focus();
    fireEvent.keyDown(buttons[0], { key: "ArrowRight" });
    expect(onChange).toHaveBeenLastCalledWith("two");
    expect(document.activeElement).toBe(screen.getAllByRole("radio")[1]);
  });

  it("TKCategoryTabs: arrows move the active tab", () => {
    const onChange = vi.fn();
    render(<TKCategoryTabs tabs={["x", "y", "z"]} defaultValue={0} onChange={onChange} />);
    const tabs = screen.getAllByRole("button");
    expect(tabs.map((b) => b.tabIndex)).toEqual([0, -1, -1]);
    tabs[0].focus();
    fireEvent.keyDown(tabs[0], { key: "ArrowRight" });
    expect(onChange).toHaveBeenLastCalledWith(1);
  });

  it("TKChipGroup: arrows rove focus without changing selection", () => {
    const onChange = vi.fn();
    render(<TKChipGroup items={["a", "b", "c"]} defaultValue="a" onChange={onChange} />);
    const chips = screen.getAllByRole("button");
    expect(chips.map((b) => b.tabIndex)).toEqual([0, -1, -1]);
    chips[0].focus();
    fireEvent.keyDown(chips[0], { key: "ArrowRight" });
    expect(document.activeElement).toBe(chips[1]);
    expect(onChange).not.toHaveBeenCalled();
    expect(chips.map((b) => b.tabIndex)).toEqual([-1, 0, -1]);
  });

  it("TKInlineButtons: toolbar focus roving with Home/End", () => {
    render(
      <TKInlineButtons
        ariaLabel="View"
        items={[
          { id: "a", label: "A" },
          { id: "b", label: "B" },
          { id: "c", label: "C" },
        ]}
      />,
    );
    // single-select InlineButtons now exposes radiogroup/radio semantics (BTN-002)
    const buttons = screen.getAllByRole("radio");
    buttons[0].focus();
    fireEvent.keyDown(buttons[0], { key: "End" });
    expect(document.activeElement).toBe(buttons[2]);
    fireEvent.keyDown(buttons[2], { key: "Home" });
    expect(document.activeElement).toBe(buttons[0]);
  });

  it("TKMultiselect: keyboard listbox — arrows set the active option, Enter toggles", () => {
    const onChange = vi.fn();
    render(<TKMultiselect options={["a", "b", "c"]} onChange={onChange} />);
    const combo = screen.getByRole("combobox");
    combo.focus();
    fireEvent.keyDown(combo, { key: "ArrowDown" }); // opens
    expect(combo).toHaveAttribute("aria-expanded", "true");
    fireEvent.keyDown(combo, { key: "ArrowDown" });
    expect(combo.getAttribute("aria-activedescendant")).toMatch(/-opt-1$/);
    fireEvent.keyDown(combo, { key: "Enter" });
    expect(onChange).toHaveBeenLastCalledWith(["b"]);
    // stays open for further toggles, Escape closes
    fireEvent.keyDown(combo, { key: "Escape" });
    expect(combo).toHaveAttribute("aria-expanded", "false");
  });
});

describe("M2.4 TKSegmented disabled option is visibly distinct", () => {
  it("renders the disabled option dimmed with tertiary color", () => {
    render(<TKSegmented options={["on", { value: "off", disabled: true }]} />);
    const off = screen.getByRole("radio", { name: "off" }); // NAV-002

    expect(off).toBeDisabled();
    expect(off.style.opacity).toBe("0.45");
    expect(off.style.color).toBe("var(--tk-text-3)");
  });
});

describe("M2.3 keyboard-accessible popovers", () => {
  it("TKTooltip opens on focus and closes on blur", () => {
    render(
      <kit.TKTooltip content="hint">
        <button type="button">target</button>
      </kit.TKTooltip>,
    );
    const target = screen.getByRole("button", { name: "target" });
    // The tooltip is portaled (not an always-rendered hidden child), so it only
    // exists in the DOM while open — escaping any overflow:hidden ancestor.
    expect(screen.queryByRole("tooltip")).toBeNull();
    fireEvent.focus(target);
    const tooltip = screen.getByRole("tooltip");
    expect(tooltip).toHaveTextContent("hint");
    expect(target).toHaveAttribute("aria-describedby", tooltip.id);
    fireEvent.blur(target);
    expect(screen.queryByRole("tooltip")).toBeNull();
  });
});
