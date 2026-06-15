import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  TKCalendar,
  TKDateInput,
  TKDialog,
  TKInfiniteList,
  TKPhoneInput,
  TKPinInput,
  TKSheet,
  type TKDateRange,
} from "../src/index";
import { createMockTelegram } from "./support/telegram/mock";
import { wrapperFor } from "./helpers/telegram";

/*
 * Regression coverage for the production-audit findings fixed in this pass
 * (see plans.md). Each test fails against the pre-fix behavior.
 */

describe("forms: phone / masked", () => {
  it("#15 country-picker Backspace on a mask literal deletes the adjacent digit", () => {
    const onChange = vi.fn();
    render(
      <TKPhoneInput
        countrySelect
        defaultCountry="+7"
        numberMask="(###) ###-##-##"
        defaultValue="+79991234567"
        onChange={onChange}
      />,
    );
    const input = screen.getByDisplayValue("(999) 123-45-67") as HTMLInputElement;

    // Caret sits just after the ")" literal; deleting it removes only a literal,
    // so the digit count is unchanged — the fix drops a digit anyway.
    fireEvent.change(input, { target: { value: "(999 123-45-67", selectionStart: 4 } });

    // raw = dial + national; a digit was actually removed (11 → 10 digits).
    expect(onChange).toHaveBeenLastCalledWith(expect.any(String), "7991234567");
  });
});

describe("forms: date / calendar", () => {
  it("#11 keeps the browsed month across a parent re-render with inline Date props", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <TKDateInput label="DOB" min={new Date(1900, 0, 1)} max={new Date(2030, 11, 31)} />,
    );

    await user.click(screen.getByRole("button", { name: "Open calendar" }));
    await user.click(screen.getByRole("button", { name: "Year" }));
    await user.click(screen.getByRole("option", { name: "1950" }));
    expect(screen.getByRole("button", { name: "Year" })).toHaveTextContent("1950");

    // Fresh min/max Date identities every render used to re-fire the sync effect
    // and snap the view back; now it keys on the (unchanged) selected value.
    rerender(<TKDateInput label="DOB" min={new Date(1900, 0, 1)} max={new Date(2030, 11, 31)} />);
    expect(screen.getByRole("button", { name: "Year" })).toHaveTextContent("1950");
  });

  it("#10 a field tap does not open the sheet (manual entry stays reachable)", async () => {
    const user = userEvent.setup();
    render(<TKDateInput label="DOB" placeholder="DD/MM/YYYY" />);
    const input = screen.getByLabelText("DOB");

    await user.click(input);
    // tapping the field must not pop the picker over the keyboard
    expect(screen.queryByRole("button", { name: "Year" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Open calendar" }));
    expect(screen.getByRole("button", { name: "Year" })).toBeInTheDocument();
  });

  it("#12 closes a range on re-select in controlled mode", async () => {
    const user = userEvent.setup();
    function Host() {
      const [range, setRange] = useState<TKDateRange | null>([new Date(2026, 0, 10), new Date(2026, 0, 15)]);
      return <TKCalendar mode="range" month={new Date(2026, 0, 1)} range={range} onRangeChange={setRange} />;
    }
    render(<Host />);

    await user.click(screen.getByRole("button", { name: /January 5, 2026/ }));
    await user.click(screen.getByRole("button", { name: /January 8, 2026/ }));

    // Both endpoints selected → the second click closed the range instead of
    // being swallowed as a new start (the self-emitted null no longer wipes it).
    // aria-selected lives on the gridcell (valid for the grid role).
    const cellOf = (name: RegExp) => screen.getByRole("button", { name }).closest('[role="gridcell"]');
    expect(cellOf(/January 5, 2026/)).toHaveAttribute("aria-selected", "true");
    expect(cellOf(/January 8, 2026/)).toHaveAttribute("aria-selected", "true");
  });
});

describe("forms: PIN", () => {
  it("#14 lights the full set of dots before clearing on completion", () => {
    vi.useFakeTimers();
    try {
      const onComplete = vi.fn();
      const { container } = render(<TKPinInput length={4} onComplete={onComplete} />);

      ["1", "2", "3", "4"].forEach((d) => fireEvent.click(screen.getByRole("button", { name: d })));

      expect(onComplete).toHaveBeenCalledWith("1234");
      // the completed state paints first…
      expect(container.querySelectorAll("[data-dot]")).toHaveLength(4);
      // …then the deferred reset clears it
      act(() => vi.advanceTimersByTime(220));
      expect(container.querySelectorAll("[data-dot]")).toHaveLength(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it("#13 hidden input uses inputMode=none so the OS keyboard stays down", () => {
    render(<TKPinInput length={4} />);
    // the keypad group shares the "One-time code" name, so target the input
    expect(screen.getByRole("textbox", { name: "One-time code" })).toHaveAttribute("inputmode", "none");
  });
});

describe("lists: infinite list", () => {
  it("#16 loads the first page only once when the sentinel is visible at mount", () => {
    const original = globalThis.IntersectionObserver;
    const instances: MockIO[] = [];
    class MockIO {
      cb: IntersectionObserverCallback;
      constructor(cb: IntersectionObserverCallback) {
        this.cb = cb;
        instances.push(this);
      }
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
      // Browsers deliver the initial intersection asynchronously, AFTER both
      // observers are registered — replay that here for every live observer.
      fire() {
        this.cb([{ isIntersecting: true } as IntersectionObserverEntry], this as never);
      }
    }
    Object.defineProperty(globalThis, "IntersectionObserver", { value: MockIO, configurable: true });
    try {
      const onLoadMore = vi.fn();
      render(
        <TKInfiniteList hasMore loading={false} onLoadMore={onLoadMore}>
          <div>row</div>
        </TKInfiniteList>,
      );
      // both the persistent and the loading-settled observer see the sentinel
      act(() => instances.forEach((io) => io.fire()));
      expect(onLoadMore).toHaveBeenCalledTimes(1);
    } finally {
      Object.defineProperty(globalThis, "IntersectionObserver", { value: original, configurable: true });
    }
  });
});

describe("overlays: Telegram gestures + stacking", () => {
  it("#1 disables Telegram vertical swipes while a sheet is open and restores on close", () => {
    vi.useFakeTimers();
    try {
      const mock = createMockTelegram();
      const { rerender } = render(<TKSheet open title="S" />, { wrapper: wrapperFor(mock.webApp) });
      expect(mock.webApp.isVerticalSwipesEnabled).toBe(false);

      rerender(<TKSheet open={false} title="S" />);
      // the guard releases once the closing animation unmounts the sheet
      act(() => vi.advanceTimersByTime(450));
      expect(mock.webApp.isVerticalSwipesEnabled).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it("#17 stacks a later overlay (scrim included) above an earlier one", () => {
    render(
      <>
        <TKDialog open testId="dlg1" title="First" />
        <TKDialog open testId="dlg2" title="Second" />
      </>,
    );
    const wrapper1 = screen.getByTestId("dlg1").parentElement as HTMLElement;
    const wrapper2 = screen.getByTestId("dlg2").parentElement as HTMLElement;
    const panelZ1 = Number(wrapper1.style.zIndex);
    const panelZ2 = Number(wrapper2.style.zIndex);

    // The second panel sits above the first, and its scrim (panelZ2 - 1) still
    // covers the first panel — the earlier overlay no longer shows through.
    expect(panelZ2).toBeGreaterThan(panelZ1);
    expect(panelZ2 - 1).toBeGreaterThan(panelZ1);
  });
});
