import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import * as kit from "../src/index";

/* M9-D — a11y: DSP-003 (spoiler secure), FRM-002 (phone field name), NAV-001
 * (tabbar navigation landmark name + aria-current). */

describe("DSP-003 TKSpoiler secure keeps secrets out of the DOM", () => {
  it("[D-SEC] secure spoiler doesn't ship the text until revealed", () => {
    const { container, rerender } = render(<kit.TKSpoiler secure>SECRET-123</kit.TKSpoiler>);
    expect(container.textContent).not.toContain("SECRET-123");
    rerender(
      <kit.TKSpoiler secure revealed>
        SECRET-123
      </kit.TKSpoiler>,
    );
    expect(container.textContent).toContain("SECRET-123");
  });

  it("[D-SEC] the default (presentational) spoiler does ship the text (blur only)", () => {
    const { container } = render(<kit.TKSpoiler>VISIBLE-TEXT</kit.TKSpoiler>);
    expect(container.textContent).toContain("VISIBLE-TEXT");
  });

  it("[D-A11Y] a consumer aria-label wins over the default reveal label", () => {
    render(<kit.TKSpoiler aria-label="Reveal balance">123</kit.TKSpoiler>);
    expect(screen.getByRole("button", { name: "Reveal balance" })).toBeInTheDocument();
  });
});

describe("FRM-002 phone field has an accessible name without a label", () => {
  it("[D-A11Y] country-select variant falls back to a phone-number name", () => {
    render(<kit.TKPhoneInput countrySelect />);
    expect(screen.getByRole("textbox", { name: /phone/i })).toBeInTheDocument();
  });

  it("[D-A11Y] simple variant falls back too", () => {
    render(<kit.TKPhoneInput />);
    expect(screen.getByRole("textbox", { name: /phone/i })).toBeInTheDocument();
  });

  it("[D-A11Y] an explicit label still wins over the fallback", () => {
    render(<kit.TKPhoneInput countrySelect label="Mobile" />);
    expect(screen.getByRole("textbox", { name: "Mobile" })).toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: /phone number/i })).toBeNull();
  });
});

describe("NAV-001 TKTabbar is a named navigation landmark with aria-current", () => {
  const tabs = [
    { icon: "home" as const, label: "Home" },
    { icon: "search" as const, label: "Search" },
  ];

  it("[D-A11Y] the landmark has an accessible name and the active tab is current", () => {
    render(<kit.TKTabbar tabs={tabs} value={1} />);
    expect(screen.getByRole("navigation", { name: /tabs/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Search" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("button", { name: "Home" }).getAttribute("aria-current")).toBeNull();
  });

  it("[D-A11Y] a custom ariaLabel overrides the default", () => {
    render(<kit.TKTabbar tabs={tabs} ariaLabel="Main sections" />);
    expect(screen.getByRole("navigation", { name: "Main sections" })).toBeInTheDocument();
  });

  it("[D-A11Y] TKTabView forwards ariaLabel to its tabbar landmark", () => {
    render(<kit.TKTabView tabs={tabs} panels={[<div key="a" />, <div key="b" />]} ariaLabel="Sections" />);
    expect(screen.getByRole("navigation", { name: "Sections" })).toBeInTheDocument();
  });
});
