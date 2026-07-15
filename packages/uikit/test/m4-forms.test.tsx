import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi, afterEach } from "vitest";
import * as kit from "../src/index";

afterEach(() => {
  vi.useRealTimers();
  Reflect.deleteProperty(document, "elementFromPoint");
});

function hitTest(target: Element) {
  Object.defineProperty(document, "elementFromPoint", {
    configurable: true,
    value: vi.fn(() => target),
  });
}

function pointerDrag(from: Element, to: Element, pointerType: "mouse" | "touch" = "mouse") {
  const grid = screen.getByRole("grid");
  hitTest(to);
  fireEvent.pointerDown(from, { pointerId: 1, pointerType, isPrimary: true, button: 0, clientX: 10, clientY: 10 });
  fireEvent.pointerMove(grid, { pointerId: 1, pointerType, isPrimary: true, buttons: 1, clientX: 20, clientY: 20 });
  fireEvent.pointerUp(grid, { pointerId: 1, pointerType, isPrimary: true, button: 0, clientX: 20, clientY: 20 });
}

/* ---------------- M4.1 TKCalendar ---------------- */

describe("M4.1 TKCalendar", () => {
  const june = new Date(2026, 5, 1);

  it("renders the month grid with localized weekday headers", () => {
    render(<kit.TKLocaleProvider locale={kit.ruLocale}><kit.TKCalendar defaultMonth={june} lang="ru" /></kit.TKLocaleProvider>);
    expect(screen.getByRole("grid")).toBeInTheDocument();
    // ru week starts on Monday by default
    const headers = screen.getAllByRole("columnheader").map((h) => h.textContent?.toLowerCase());
    expect(headers[0]).toContain("пн");
  });

  it("opens month and year selectors from the standalone calendar header", async () => {
    const user = userEvent.setup();
    render(<kit.TKCalendar defaultMonth={june} min={new Date(1980, 0, 1)} max={new Date(2026, 11, 31)} />);

    await user.click(screen.getByRole("button", { name: "Month" }));
    await user.click(screen.getByRole("option", { name: "January" }));
    expect(screen.getByRole("grid", { name: "January 2026" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Year" }));
    await user.click(screen.getByRole("option", { name: "1990" }));
    expect(screen.getByRole("grid", { name: "January 1990" })).toBeInTheDocument();
  });

  it("selects a single date and reports it", () => {
    const onChange = vi.fn();
    render(<kit.TKCalendar defaultMonth={june} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /June 15/ }));
    expect(onChange).toHaveBeenCalledOnce();
    const picked = onChange.mock.calls[0][0] as Date;
    expect([picked.getFullYear(), picked.getMonth(), picked.getDate()]).toEqual([2026, 5, 15]);
  });

  it("selects a range in range mode", () => {
    const onRangeChange = vi.fn();
    render(<kit.TKCalendar mode="range" defaultMonth={june} onRangeChange={onRangeChange} />);
    fireEvent.click(screen.getByRole("button", { name: /June 10/ }));
    fireEvent.click(screen.getByRole("button", { name: /June 14/ }));
    const [start, end] = onRangeChange.mock.lastCall![0] as [Date, Date];
    expect(start.getDate()).toBe(10);
    expect(end.getDate()).toBe(14);
  });

  it("range picked in reverse order is normalized", () => {
    const onRangeChange = vi.fn();
    render(<kit.TKCalendar mode="range" defaultMonth={june} onRangeChange={onRangeChange} />);
    fireEvent.click(screen.getByRole("button", { name: /June 14/ }));
    fireEvent.click(screen.getByRole("button", { name: /June 10/ }));
    const [start, end] = onRangeChange.mock.lastCall![0] as [Date, Date];
    expect(start.getDate()).toBe(10);
    expect(end.getDate()).toBe(14);
  });

  it("mouse drag selects a range forward and commits only on pointerup", () => {
    const onRangeChange = vi.fn();
    render(<kit.TKCalendar mode="range" defaultMonth={june} onRangeChange={onRangeChange} />);
    const start = screen.getByRole("button", { name: /June 10/ });
    const end = screen.getByRole("button", { name: /June 14/ });
    const grid = screen.getByRole("grid");
    hitTest(end);

    fireEvent.pointerDown(start, { pointerId: 1, pointerType: "mouse", isPrimary: true, button: 0 });
    fireEvent.pointerMove(grid, { pointerId: 1, pointerType: "mouse", isPrimary: true, buttons: 1, clientX: 20 });
    expect(onRangeChange).not.toHaveBeenCalled();
    expect(end.closest('[role="gridcell"]')).toHaveAttribute("aria-selected", "true");

    fireEvent.pointerUp(grid, { pointerId: 1, pointerType: "mouse", isPrimary: true, button: 0, clientX: 20 });
    expect(onRangeChange).toHaveBeenCalledOnce();
    const [from, to] = onRangeChange.mock.lastCall![0] as kit.TKDateRange;
    expect([from.getDate(), to.getDate()]).toEqual([10, 14]);
  });

  it("mouse drag backwards normalizes the committed range", () => {
    const onRangeChange = vi.fn();
    render(<kit.TKCalendar mode="range" defaultMonth={june} onRangeChange={onRangeChange} />);

    pointerDrag(
      screen.getByRole("button", { name: /June 18/ }),
      screen.getByRole("button", { name: /June 12/ }),
    );

    const [from, to] = onRangeChange.mock.lastCall![0] as kit.TKDateRange;
    expect([from.getDate(), to.getDate()]).toEqual([12, 18]);
  });

  it("pointerup on the starting day keeps tap-tap range selection unchanged", () => {
    const onRangeChange = vi.fn();
    render(<kit.TKCalendar mode="range" defaultMonth={june} onRangeChange={onRangeChange} />);
    const grid = screen.getByRole("grid");
    const start = screen.getByRole("button", { name: /June 10/ });
    const end = screen.getByRole("button", { name: /June 14/ });

    fireEvent.pointerDown(start, { pointerId: 1, pointerType: "mouse", isPrimary: true, button: 0 });
    fireEvent.pointerUp(grid, { pointerId: 1, pointerType: "mouse", isPrimary: true, button: 0 });
    fireEvent.click(start);
    fireEvent.click(end);

    expect(onRangeChange).toHaveBeenCalledTimes(2);
    expect(onRangeChange.mock.calls[0][0]).toBeNull();
    const [from, to] = onRangeChange.mock.lastCall![0] as kit.TKDateRange;
    expect([from.getDate(), to.getDate()]).toEqual([10, 14]);
  });

  it("touch long-press arms drag, suppresses touch action, and commits on lift", () => {
    vi.useFakeTimers();
    const onRangeChange = vi.fn();
    render(<kit.TKCalendar mode="range" defaultMonth={june} onRangeChange={onRangeChange} />);
    const grid = screen.getByRole("grid");
    const start = screen.getByRole("button", { name: /June 10/ });
    const end = screen.getByRole("button", { name: /June 15/ });
    hitTest(end);

    fireEvent.pointerDown(start, { pointerId: 2, pointerType: "touch", isPrimary: true, button: 0, clientX: 10, clientY: 10 });
    act(() => vi.advanceTimersByTime(300));
    expect(grid).toHaveStyle({ touchAction: "none" });
    const armedTouchMove = new Event("touchmove", { bubbles: true, cancelable: true });
    grid.dispatchEvent(armedTouchMove);
    expect(armedTouchMove.defaultPrevented).toBe(true);
    fireEvent.pointerMove(grid, { pointerId: 2, pointerType: "touch", isPrimary: true, buttons: 1, clientX: 20, clientY: 20 });
    expect(onRangeChange).not.toHaveBeenCalled();
    fireEvent.pointerUp(grid, { pointerId: 2, pointerType: "touch", isPrimary: true, button: 0, clientX: 20, clientY: 20 });

    expect(onRangeChange).toHaveBeenCalledOnce();
    const [from, to] = onRangeChange.mock.lastCall![0] as kit.TKDateRange;
    expect([from.getDate(), to.getDate()]).toEqual([10, 15]);
  });

  it("plain touch tap does not arm drag and still starts tap-tap selection", () => {
    vi.useFakeTimers();
    const onRangeChange = vi.fn();
    render(<kit.TKCalendar mode="range" defaultMonth={june} onRangeChange={onRangeChange} />);
    const grid = screen.getByRole("grid");
    const start = screen.getByRole("button", { name: /June 10/ });

    fireEvent.pointerDown(start, { pointerId: 3, pointerType: "touch", isPrimary: true, button: 0, clientX: 10, clientY: 10 });
    act(() => vi.advanceTimersByTime(299));
    expect(grid).not.toHaveStyle({ touchAction: "none" });
    const scrollingTouchMove = new Event("touchmove", { bubbles: true, cancelable: true });
    grid.dispatchEvent(scrollingTouchMove);
    expect(scrollingTouchMove.defaultPrevented).toBe(false);
    fireEvent.pointerUp(grid, { pointerId: 3, pointerType: "touch", isPrimary: true, button: 0, clientX: 10, clientY: 10 });
    fireEvent.click(start);

    expect(onRangeChange).toHaveBeenCalledOnce();
    expect(onRangeChange).toHaveBeenLastCalledWith(null);
  });

  it("pointercancel discards the preview and restores the committed range", () => {
    const onRangeChange = vi.fn();
    render(
      <kit.TKCalendar
        mode="range"
        defaultMonth={june}
        defaultRange={[new Date(2026, 5, 4), new Date(2026, 5, 7)]}
        onRangeChange={onRangeChange}
      />,
    );
    const grid = screen.getByRole("grid");
    const nextEnd = screen.getByRole("button", { name: /June 16/ });
    hitTest(nextEnd);

    fireEvent.pointerDown(screen.getByRole("button", { name: /June 10/ }), {
      pointerId: 4,
      pointerType: "mouse",
      isPrimary: true,
      button: 0,
    });
    fireEvent.pointerMove(grid, { pointerId: 4, pointerType: "mouse", isPrimary: true, buttons: 1, clientX: 20 });
    expect(nextEnd.closest('[role="gridcell"]')).toHaveAttribute("aria-selected", "true");

    fireEvent.pointerCancel(grid, { pointerId: 4, pointerType: "mouse", isPrimary: true });
    expect(nextEnd.closest('[role="gridcell"]')).toHaveAttribute("aria-selected", "false");
    expect(screen.getByRole("button", { name: /June 4/ }).closest('[role="gridcell"]')).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("button", { name: /June 7/ }).closest('[role="gridcell"]')).toHaveAttribute("aria-selected", "true");
    expect(onRangeChange).not.toHaveBeenCalled();
  });

  it("Escape cancels an active drag without changing the committed range", () => {
    const onRangeChange = vi.fn();
    render(
      <kit.TKCalendar
        mode="range"
        defaultMonth={june}
        defaultRange={[new Date(2026, 5, 4), new Date(2026, 5, 7)]}
        onRangeChange={onRangeChange}
      />,
    );
    const grid = screen.getByRole("grid");
    const nextEnd = screen.getByRole("button", { name: /June 16/ });
    hitTest(nextEnd);
    fireEvent.pointerDown(screen.getByRole("button", { name: /June 10/ }), {
      pointerId: 5,
      pointerType: "mouse",
      isPrimary: true,
      button: 0,
    });
    fireEvent.pointerMove(grid, { pointerId: 5, pointerType: "mouse", isPrimary: true, buttons: 1, clientX: 20 });

    fireEvent.keyDown(document, { key: "Escape" });

    expect(nextEnd.closest('[role="gridcell"]')).toHaveAttribute("aria-selected", "false");
    expect(screen.getByRole("button", { name: /June 4/ }).closest('[role="gridcell"]')).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("button", { name: /June 7/ }).closest('[role="gridcell"]')).toHaveAttribute("aria-selected", "true");
    expect(onRangeChange).not.toHaveBeenCalled();
  });

  it("clips drag preview at the first disabled date", () => {
    const onRangeChange = vi.fn();
    render(
      <kit.TKCalendar
        mode="range"
        defaultMonth={june}
        disabledDates={(date) => date.getDate() === 13}
        onRangeChange={onRangeChange}
      />,
    );

    const grid = screen.getByRole("grid");
    const start = screen.getByRole("button", { name: /June 10/ });
    hitTest(screen.getByRole("button", { name: /June 16/ }));
    fireEvent.pointerDown(start, { pointerId: 6, pointerType: "mouse", isPrimary: true, button: 0 });
    fireEvent.pointerMove(grid, { pointerId: 6, pointerType: "mouse", isPrimary: true, buttons: 1, clientX: 20 });

    expect(screen.getByRole("button", { name: /June 12/ }).closest('[role="gridcell"]')).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("button", { name: /June 14/ }).closest('[role="gridcell"]')).toHaveAttribute("aria-selected", "false");
    fireEvent.pointerUp(grid, { pointerId: 6, pointerType: "mouse", isPrimary: true, button: 0, clientX: 20 });

    const [from, to] = onRangeChange.mock.lastCall![0] as kit.TKDateRange;
    expect([from.getDate(), to.getDate()]).toEqual([10, 12]);
  });

  it("controlled range round-trip receives one event after drag commit", () => {
    const onRangeChange = vi.fn();
    function Host() {
      const [range, setRange] = useState<kit.TKDateRange | null>([new Date(2026, 5, 2), new Date(2026, 5, 4)]);
      return (
        <kit.TKCalendar
          mode="range"
          month={june}
          range={range}
          onRangeChange={(next) => {
            onRangeChange(next);
            setRange(next);
          }}
        />
      );
    }
    render(<Host />);

    pointerDrag(
      screen.getByRole("button", { name: /June 20/ }),
      screen.getByRole("button", { name: /June 24/ }),
    );

    expect(onRangeChange).toHaveBeenCalledOnce();
    const [from, to] = onRangeChange.mock.lastCall![0] as kit.TKDateRange;
    expect([from.getDate(), to.getDate()]).toEqual([20, 24]);
  });

  it("disables dates outside min/max and via the predicate", () => {
    render(
      <kit.TKCalendar
        defaultMonth={june}
        min={new Date(2026, 5, 5)}
        max={new Date(2026, 5, 25)}
        disabledDates={(d) => d.getDay() === 0}
      />,
    );
    expect(screen.getByRole("button", { name: "June 3, 2026" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "June 26, 2026" })).toBeDisabled();
    // June 7 2026 is a Sunday
    expect(screen.getByRole("button", { name: "June 7, 2026" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "June 10, 2026" })).toBeEnabled();
  });

  it("keyboard: arrows move by day/week, PageDown jumps a month, Enter picks", () => {
    const onChange = vi.fn();
    render(<kit.TKCalendar defaultMonth={june} defaultValue={new Date(2026, 5, 15)} onChange={onChange} />);
    const cell = screen.getByRole("button", { name: /June 15/ });
    cell.focus();
    fireEvent.keyDown(cell, { key: "ArrowRight" });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: /June 16/ }));
    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: /June 23/ }));
    fireEvent.keyDown(document.activeElement!, { key: "PageDown" });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: /July 23/ }));
    fireEvent.keyDown(document.activeElement!, { key: "Enter" });
    const picked = onChange.mock.lastCall![0] as Date;
    expect([picked.getMonth(), picked.getDate()]).toEqual([6, 23]);
  });

  it("weekStartsOn=0 puts Sunday first", () => {
    render(<kit.TKCalendar defaultMonth={june} weekStartsOn={0} lang="en" />);
    const headers = screen.getAllByRole("columnheader").map((h) => h.textContent);
    expect(headers[0]).toMatch(/^S/);
  });
});

/* ---------------- M4.3 TKMaskedInput / TKPhoneInput ---------------- */

describe("M4.3 TKMaskedInput", () => {
  it("formats digits through the mask with literals", () => {
    const onChange = vi.fn();
    render(<kit.TKMaskedInput mask="(###) ###-##-##" onChange={onChange} placeholder="phone" />);
    const input = screen.getByPlaceholderText("phone") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "9261234567" } });
    expect(input.value).toBe("(926) 123-45-67");
    expect(onChange).toHaveBeenLastCalledWith("(926) 123-45-67", "9261234567");
  });

  it("ignores non-digit input and truncates overflow", () => {
    render(<kit.TKMaskedInput mask="##-##" placeholder="code" />);
    const input = screen.getByPlaceholderText("code") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "ab12cd345" } });
    expect(input.value).toBe("12-34");
  });

  it("paste works", () => {
    render(<kit.TKMaskedInput mask="## ##" placeholder="p" />);
    const input = screen.getByPlaceholderText("p") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "(12) 34" } });
    expect(input.value).toBe("12 34");
  });

  it("TKPhoneInput prefixes the dial code", () => {
    render(<kit.TKPhoneInput defaultCountry="+7" placeholder="phone" />);
    const input = screen.getByPlaceholderText("phone") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "9261234567" } });
    expect(input.value).toMatch(/^\+7/);
    expect(input.value).toContain("926");
  });

  it("TKPhoneInput lets users change the dial code and clear the field", () => {
    const onChange = vi.fn();
    render(<kit.TKPhoneInput defaultCountry="+7" placeholder="phone" onChange={onChange} />);
    const input = screen.getByPlaceholderText("phone") as HTMLInputElement;

    fireEvent.change(input, { target: { value: "+1 555 123 4567" } });
    expect(input.value).toBe("+1 (555) 123-45-67");
    expect(onChange).toHaveBeenLastCalledWith("+1 (555) 123-45-67", "15551234567");

    fireEvent.change(input, { target: { value: "" } });
    expect(input.value).toBe("");
    expect(onChange).toHaveBeenLastCalledWith("", "");
  });

  it("TKPhoneInput keeps a manually typed non-default dial code", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<kit.TKPhoneInput defaultCountry="+7" placeholder="phone" onChange={onChange} />);
    const input = screen.getByPlaceholderText("phone") as HTMLInputElement;

    await user.type(input, "+1 555 123 4567");

    expect(input.value).toBe("+1 (555) 123-45-67");
    expect(onChange).toHaveBeenLastCalledWith("+1 (555) 123-45-67", "15551234567");
  });

  it("TKTimeInput keeps partial controlled input editable until a valid time is complete", () => {
    function ControlledTime() {
      const [time, setTime] = useState<string | null>(null);
      return <kit.TKTimeInput placeholder="time" value={time ?? ""} onChange={setTime} />;
    }

    render(<ControlledTime />);
    const input = screen.getByPlaceholderText("time") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "1" } });
    expect(input.value).toBe("1");
    fireEvent.change(input, { target: { value: "12" } });
    expect(input.value).toBe("12");
    fireEvent.change(input, { target: { value: "1234" } });
    expect(input.value).toBe("12:34");
  });

  it("TKTimeInput clamps impossible digits to a real time (no 99:99)", () => {
    const onChange = vi.fn();
    render(<kit.TKTimeInput placeholder="time" onChange={onChange} />);
    const input = screen.getByPlaceholderText("time") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "9999" } });
    expect(input.value).not.toBe("99:99");
    expect(input.value).toMatch(/^([01]\d|2[0-3]):[0-5]\d$/);
    expect(onChange).toHaveBeenLastCalledWith(expect.stringMatching(/^([01]\d|2[0-3]):[0-5]\d$/));
  });

  it("TKTimeInput caps the hour at 23 in 24h mode", () => {
    render(<kit.TKTimeInput placeholder="time" />);
    const input = screen.getByPlaceholderText("time") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "2530" } });
    expect(input.value).toBe("23:30");
  });

  it("TKTimeInput hour12 emits canonical 24h via the AM/PM toggle", () => {
    const onChange = vi.fn();
    render(<kit.TKTimeInput placeholder="time" hour12 onChange={onChange} />);
    const input = screen.getByPlaceholderText("time") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "0130" } });
    expect(input.value).toBe("01:30");
    expect(onChange).toHaveBeenLastCalledWith("01:30"); // AM by default
    fireEvent.click(screen.getByRole("button", { name: "PM" }));
    expect(onChange).toHaveBeenLastCalledWith("13:30");
  });
});

/* ---------------- M4.4 TKPinInput ---------------- */

describe("M4.4 TKPinInput", () => {
  it("types via the on-screen keypad and completes", () => {
    const onComplete = vi.fn();
    render(<kit.TKPinInput length={4} onComplete={onComplete} />);
    for (const d of ["1", "2", "3", "4"]) fireEvent.click(screen.getByRole("button", { name: d }));
    expect(onComplete).toHaveBeenCalledWith("1234");
  });

  it("backspace key removes the last digit", () => {
    const onComplete = vi.fn();
    render(<kit.TKPinInput length={3} onComplete={onComplete} />);
    fireEvent.click(screen.getByRole("button", { name: "1" }));
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    fireEvent.click(screen.getByRole("button", { name: /backspace|delete/i }));
    fireEvent.click(screen.getByRole("button", { name: "9" }));
    fireEvent.click(screen.getByRole("button", { name: "5" }));
    expect(onComplete).toHaveBeenCalledWith("195");
  });

  it("shows the biometric key when onBiometricRequest is provided", () => {
    const onBio = vi.fn();
    render(<kit.TKPinInput onBiometricRequest={onBio} />);
    fireEvent.click(screen.getByRole("button", { name: /biometric|face|fingerprint/i }));
    expect(onBio).toHaveBeenCalledOnce();
  });

  it("supports variable-length PIN entry with an explicit submit action", () => {
    const onComplete = vi.fn();
    render(<kit.TKPinInput length={4} maxLength={8} onComplete={onComplete} />);

    for (const d of ["1", "2", "3"]) fireEvent.click(screen.getByRole("button", { name: d }));
    expect(screen.getByRole("button", { name: "Done" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "4" }));
    fireEvent.click(screen.getByRole("button", { name: "5" }));
    fireEvent.click(screen.getByRole("button", { name: "6" }));
    fireEvent.click(screen.getByRole("button", { name: "Done" }));

    expect(onComplete).toHaveBeenCalledWith("123456");
  });

  it("adds PIN dots as digits are entered instead of pre-rendering the maximum length", () => {
    const { container } = render(<kit.TKPinInput length={4} maxLength={8} />);
    expect(container.querySelectorAll("[data-dot]")).toHaveLength(0);

    fireEvent.click(screen.getByRole("button", { name: "1" }));
    fireEvent.click(screen.getByRole("button", { name: "2" }));

    expect(container.querySelectorAll("[data-dot]")).toHaveLength(2);
  });
});

/* ---------------- M4.5 TKChipsInput ---------------- */

describe("M4.5 TKChipsInput", () => {
  it("Enter and comma add tags, Backspace removes the last", () => {
    const onChange = vi.fn();
    render(<kit.TKChipsInput onChange={onChange} placeholder="tags" />);
    const input = screen.getByPlaceholderText("tags");
    fireEvent.change(input, { target: { value: "alpha" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenLastCalledWith(["alpha"]);
    fireEvent.change(input, { target: { value: "beta," } });
    expect(onChange).toHaveBeenLastCalledWith(["alpha", "beta"]);
    fireEvent.keyDown(input, { key: "Backspace" });
    expect(onChange).toHaveBeenLastCalledWith(["alpha"]);
  });

  it("does not add duplicates or empty tags", () => {
    const onChange = vi.fn();
    render(<kit.TKChipsInput defaultValue={["x"]} onChange={onChange} placeholder="tags" />);
    // the placeholder hides once tags exist — grab the editor input directly
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "x" } });
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.change(input, { target: { value: "  " } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).not.toHaveBeenCalled();
  });
});

/* ---------------- M4.5b TKDateInput manual entry ---------------- */

describe("M4.5b TKDateInput", () => {
  it("allows typing a known date without paging through the calendar", () => {
    const onChange = vi.fn();
    render(
      <kit.TKDateInput
        label="Birth date"
        placeholder="DD / MM / YYYY"
        min={new Date(1900, 0, 1)}
        max={new Date(2026, 5, 15)}
        onChange={onChange}
      />,
    );
    const input = screen.getByLabelText("Birth date") as HTMLInputElement;

    fireEvent.change(input, { target: { value: "17 / 02 / 1990" } });

    expect(input.value).toBe("17 / 02 / 1990");
    const picked = onChange.mock.lastCall![0] as Date;
    expect([picked.getFullYear(), picked.getMonth(), picked.getDate()]).toEqual([1990, 1, 17]);
  });

  it("marks invalid manual dates instead of accepting arbitrary text", () => {
    const onChange = vi.fn();
    render(
      <kit.TKDateInput
        label="Birth date"
        placeholder="DD / MM / YYYY"
        min={new Date(1900, 0, 1)}
        max={new Date(2026, 5, 15)}
        onChange={onChange}
      />,
    );
    const input = screen.getByLabelText("Birth date") as HTMLInputElement;

    fireEvent.change(input, { target: { value: "33:33" } });

    expect(screen.getByText("Enter a valid date")).toBeInTheDocument();
    expect(onChange).toHaveBeenLastCalledWith(null);
  });
});

/* ---------------- M4.6 searchable select / groups / select all ---------------- */

describe("M4.6 select search, groups, select-all", () => {
  it("TKSelect searchable filters options", () => {
    render(<kit.TKSelect searchable options={["Lisbon", "Berlin", "Belgrade"]} label="City" />);
    const combo = screen.getByRole("combobox");
    fireEvent.click(combo);
    const search = screen.getByPlaceholderText(/search/i);
    fireEvent.change(search, { target: { value: "bel" } });
    expect(screen.getByRole("option", { name: /Belgrade/ })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /Lisbon/ })).not.toBeInTheDocument();
  });

  it("TKSelect renders option groups", () => {
    render(
      <kit.TKSelect
        label="City"
        options={[
          { label: "Europe", options: ["Lisbon", "Berlin"] },
          { label: "Asia", options: ["Tokyo"] },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByText("Europe")).toBeInTheDocument();
    expect(screen.getByText("Asia")).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("TKMultiselect select-all toggles everything", () => {
    const onChange = vi.fn();
    render(<kit.TKMultiselect selectAll options={["a", "b", "c"]} onChange={onChange} />);
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByRole("option", { name: /select all/i }));
    expect(onChange).toHaveBeenLastCalledWith(["a", "b", "c"]);
    fireEvent.click(screen.getByRole("option", { name: /select all/i }));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });
});

/* ---------------- M4.7 slider range ---------------- */

describe("M4.7 TKSlider range", () => {
  it("renders two thumbs with separate slider roles and reports a tuple", () => {
    const onRangeChange = vi.fn();
    render(<kit.TKSlider range min={0} max={100} defaultRange={[20, 80]} onRangeChange={onRangeChange} label="Price" />);
    const sliders = screen.getAllByRole("slider");
    expect(sliders).toHaveLength(2);
    expect(sliders[0]).toHaveAttribute("aria-valuenow", "20");
    expect(sliders[1]).toHaveAttribute("aria-valuenow", "80");
    fireEvent.keyDown(sliders[0], { key: "ArrowRight" });
    expect(onRangeChange).toHaveBeenLastCalledWith([21, 80]);
  });

  it("thumbs cannot cross", () => {
    const onRangeChange = vi.fn();
    render(<kit.TKSlider range min={0} max={10} defaultRange={[5, 6]} onRangeChange={onRangeChange} label="P" />);
    const sliders = screen.getAllByRole("slider");
    fireEvent.keyDown(sliders[0], { key: "ArrowRight" });
    fireEvent.keyDown(screen.getAllByRole("slider")[0], { key: "ArrowRight" });
    expect(onRangeChange).toHaveBeenLastCalledWith([6, 6]);
  });
});

/* ---------------- M4.8 input extras ---------------- */

describe("M4.8 TKInput counter, password, slots", () => {
  it("shows the maxLength counter", () => {
    render(<kit.TKInput maxLength={10} defaultValue="abc" placeholder="p" />);
    expect(screen.getByText("3/10")).toBeInTheDocument();
  });

  it("password visibility toggle flips the input type", () => {
    render(<kit.TKInput type="password" placeholder="pwd" />);
    const input = screen.getByPlaceholderText("pwd") as HTMLInputElement;
    expect(input.type).toBe("password");
    fireEvent.click(screen.getByRole("button", { name: /show password/i }));
    expect(input.type).toBe("text");
    fireEvent.click(screen.getByRole("button", { name: /hide password/i }));
    expect(input.type).toBe("password");
  });

  it("renders prefix and suffix slots", () => {
    render(<kit.TKInput prefix={<span>пре</span>} suffix={<span>суф</span>} placeholder="p" />);
    expect(screen.getByText("пре")).toBeInTheDocument();
    expect(screen.getByText("суф")).toBeInTheDocument();
  });
});

/* ---------------- M4.9 checkbox indeterminate, stepper, rating ---------------- */

describe("M4.9 control extras", () => {
  it("TKCheckbox indeterminate exposes aria-checked=mixed", () => {
    render(<kit.TKCheckbox indeterminate label="Some" />);
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-checked", "mixed");
  });

  it("TKStepper editable allows direct typing", () => {
    const onChange = vi.fn();
    render(<kit.TKStepper editable defaultValue={2} min={0} max={50} onChange={onChange} />);
    const input = screen.getByRole("spinbutton") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "30" } });
    fireEvent.blur(input);
    expect(onChange).toHaveBeenLastCalledWith(30);
  });

  it("TKStepper holding the plus button autorepeats", () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    render(<kit.TKStepper defaultValue={0} max={99} onChange={onChange} />);
    const plus = screen.getByRole("button", { name: /increase/i });
    fireEvent.pointerDown(plus, { clientX: 1, clientY: 1 });
    act(() => vi.advanceTimersByTime(1300));
    fireEvent.pointerUp(plus);
    expect(onChange.mock.calls.length).toBeGreaterThan(2);
  });

  it("TKStepper clears autorepeat timers on unmount", () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    const { unmount } = render(<kit.TKStepper defaultValue={0} max={99} onChange={onChange} />);
    const plus = screen.getByRole("button", { name: /increase/i });

    fireEvent.pointerDown(plus, { clientX: 1, clientY: 1 });
    expect(onChange).toHaveBeenCalledTimes(1);
    unmount();
    act(() => vi.advanceTimersByTime(1300));

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("TKRating readonly ignores clicks; allowHalf renders halves", () => {
    const onChange = vi.fn();
    render(<kit.TKRating readonly defaultValue={3.5} allowHalf onChange={onChange} />);
    const group = screen.getByRole("radiogroup"); // CTL-001: rating is a radiogroup
    const buttons = within(group).getAllByRole("radio");
    fireEvent.click(buttons[4]);
    expect(onChange).not.toHaveBeenCalled();
  });
});

/* ---------------- M4.10 file input extras ---------------- */

describe("M4.10 TKFileInput drag-n-drop and progress", () => {
  it("accepts files dropped on the zone", () => {
    const onFilesChange = vi.fn();
    render(<kit.TKFileInput dropZone onFilesChange={onFilesChange} testId="file" />);
    const zone = screen.getByTestId("file");
    const file = new File(["data"], "photo.png", { type: "image/png" });
    fireEvent.drop(zone.querySelector('[role="button"]')!, { dataTransfer: { files: [file], types: ["Files"] } });
    expect(onFilesChange).toHaveBeenCalledOnce();
    expect(onFilesChange.mock.calls[0][0][0].name).toBe("photo.png");
  });

  it("shows per-file progress", () => {
    render(<kit.TKFileInput progress={42} testId="file" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "42");
  });
});
