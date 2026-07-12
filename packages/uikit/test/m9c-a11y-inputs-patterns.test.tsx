import { readFileSync } from "node:fs";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import * as kit from "../src/index";

/* M9-C — a11y: BTN-003 (inline-buttons roving seed/clamp), INP-002 (OTP caret
 * respects reduced motion), PTN-002 (slot picker pressed + aria-disabled). */

const ITEMS = [
  { id: "a", label: "A" },
  { id: "b", label: "B" },
  { id: "c", label: "C" },
];

describe("BTN-003 TKInlineButtons roving tab-stop", () => {
  it("[D-A11Y] seeds the tab-stop on the selected item, not item 0", () => {
    render(<kit.TKInlineButtons ariaLabel="Sort" items={ITEMS} value="c" />);
    const radios = screen.getAllByRole("radio");
    expect(radios[2].getAttribute("tabindex")).toBe("0");
    expect(radios[0].getAttribute("tabindex")).toBe("-1");
  });

  it("[D-EDGE] keeps exactly one valid tab-stop when items shrink below the focused index", () => {
    const { rerender } = render(<kit.TKInlineButtons ariaLabel="Sort" items={ITEMS} value="c" />);
    rerender(<kit.TKInlineButtons ariaLabel="Sort" items={ITEMS.slice(0, 2)} value="c" />);
    const radios = screen.getAllByRole("radio");
    expect(radios.filter((r) => r.getAttribute("tabindex") === "0")).toHaveLength(1);
  });

  it("[D-A11Y] seeds onto the first enabled item when index 0 is disabled", () => {
    const items = [{ id: "a", label: "A", disabled: true }, { id: "b", label: "B" }, { id: "c", label: "C" }];
    render(<kit.TKInlineButtons ariaLabel="Sort" items={items} />);
    const radios = screen.getAllByRole("radio");
    expect(radios[0].getAttribute("tabindex")).toBe("-1");
    expect(radios[1].getAttribute("tabindex")).toBe("0");
  });
});

describe("INP-002 TKOTP caret respects prefers-reduced-motion", () => {
  it("[D-MOTION] the active caret is a CSS class, not an inline infinite animation", () => {
    const { container } = render(<kit.TKOTP />);
    fireEvent.focus(container.querySelector("input")!);
    const caret = container.querySelector(".tk-otp-caret") as HTMLElement;
    expect(caret).toBeTruthy();
    expect(caret.style.animation).toBe(""); // no inline animation that would ignore the media query
    // the blink is gated behind prefers-reduced-motion: no-preference in the stylesheet
    const css = readFileSync("src/tokens/tokens.css", "utf8"); // vitest cwd = packages/uikit
    const noPref = css.slice(css.indexOf("prefers-reduced-motion: no-preference"));
    expect(noPref).toContain(".tk-otp-caret");
  });
});

describe("PTN-002 TKSlotPicker exposes selection + busy state", () => {
  const days = [{ label: "Mon", date: "1" }];

  it("[D-A11Y] selected slot is pressed; busy slot is aria-disabled with an 'unavailable' cue", () => {
    render(<kit.TKSlotPicker days={days} slots={["10:00", "11:00"]} busy={["10:00"]} />);
    fireEvent.click(screen.getByRole("button", { name: "11:00" }));
    expect(screen.getByRole("button", { name: "11:00", pressed: true })).toBeInTheDocument();
    const busy = screen.getByRole("button", { name: /10:00.*unavailable/i });
    expect(busy).toHaveAttribute("aria-disabled", "true");
  });

  it("[D-A11Y] the active day button reports aria-pressed", () => {
    render(<kit.TKSlotPicker days={days} slots={["10:00"]} />);
    expect(screen.getByRole("button", { name: /Mon/ }).getAttribute("aria-pressed")).toBe("true");
  });
});
