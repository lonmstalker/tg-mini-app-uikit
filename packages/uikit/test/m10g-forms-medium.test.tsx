import { readFileSync } from "node:fs";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import * as kit from "../src/index";

/* M10-G — forms MEDIUM: FRM-005 (PIN reconcile on length change), FRM-007
 * (calendar day cell ≥44px token-driven), FRM-009 (TKNativeField exported). */

describe("FRM-005 TKPinInput reconciles on length/maxLength change", () => {
  it("[D-STATE] shrinking length truncates digits and re-fires onComplete with the new code", () => {
    const onComplete = vi.fn();
    const { rerender } = render(<kit.TKPinInput length={6} maxLength={6} onComplete={onComplete} />);
    for (const d of ["1", "2", "3", "4", "5", "6"]) fireEvent.click(screen.getByRole("button", { name: d }));
    onComplete.mockClear();
    rerender(<kit.TKPinInput length={4} onComplete={onComplete} />);
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith("1234");
  });

  it("[D-EDGE] growing length above the entered digits does not spuriously complete", () => {
    const onComplete = vi.fn();
    const { rerender } = render(<kit.TKPinInput length={4} onComplete={onComplete} />);
    for (const d of ["1", "2", "3", "4"]) fireEvent.click(screen.getByRole("button", { name: d }));
    onComplete.mockClear();
    rerender(<kit.TKPinInput length={6} onComplete={onComplete} />);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("[D-EDGE] a simultaneous error suppresses the reconcile complete (rejected code not re-fired)", () => {
    const onComplete = vi.fn();
    const { rerender } = render(<kit.TKPinInput length={6} maxLength={6} onComplete={onComplete} />);
    for (const d of ["1", "2", "3", "4", "5", "6"]) fireEvent.click(screen.getByRole("button", { name: d }));
    onComplete.mockClear();
    rerender(<kit.TKPinInput length={4} error onComplete={onComplete} />);
    expect(onComplete).not.toHaveBeenCalled();
  });
});

describe("FRM-007 TKCalendar day cells meet the touch-target minimum", () => {
  const css = readFileSync("src/tokens/tokens.css", "utf8");

  it("[D-TG] day cells are token-driven (var(--tk-tap-min)), not a hardcoded 38px", () => {
    render(<kit.TKCalendar defaultMonth={new Date(2026, 5, 1)} />);
    const cell = document.querySelector("[data-tk-date]") as HTMLElement;
    const style = cell.getAttribute("style") ?? "";
    expect(style).toMatch(/var\(--tk-tap-min\)/);
    expect(style).not.toMatch(/width:\s*38px|height:\s*38px/);
  });

  it("[D-RESP] the token defaults to at least 44px (overridable for resizing)", () => {
    expect(css).toMatch(/--tk-tap-min:\s*44px/);
  });
});

describe("FRM-009 TKNativeField is reachable from the package entrypoint", () => {
  it("[D-API] the export resolves and mounts a native input", () => {
    expect(kit.TKNativeField).toBeDefined();
    render(<kit.TKNativeField type="time" value="" onChange={() => {}} />);
    expect(document.querySelector('input[type="time"]')).not.toBeNull();
  });
});
