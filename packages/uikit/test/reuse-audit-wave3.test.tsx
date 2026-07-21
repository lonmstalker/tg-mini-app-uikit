import { fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import * as kit from "../src/index";

/*
 * Wave 3 of the July-2026 reuse audit: the four deliberately deferred items.
 * REU-009 — modal overlays portal to the shared `.tk`/[data-tk-portal-root]
 * host instead of anchoring in place; REU-010 — select dropdowns portal too;
 * REU-011 — TKPhoneInput derives its country default from the locale;
 * REU-012 — remaining hardcoded strings go through TKLocale.
 * Waves 1–2 live in reuse-audit.test.tsx / reuse-audit-wave2.test.tsx.
 */

const IMAGES = [{ src: "a.jpg", alt: "Alpha photo" }];

describe("reuse · modal overlays portal to the shared overlay host (REU-009)", () => {
  const overlays: Array<[string, React.ReactElement]> = [
    ["TKSheet", <kit.TKSheet key="s" open title="S" testId="panel" />],
    ["TKActionSheet", <kit.TKActionSheet key="a" open items={[{ label: "A" }]} testId="panel" />],
    ["TKImageViewer", <kit.TKImageViewer key="v" open images={IMAGES} testId="panel" />],
  ];

  it.each(overlays)("%s escapes a transformed/overflow ancestor into the `.tk` root", (_name, overlay) => {
    render(
      <kit.TKProvider testId="root">
        <div data-testid="trap" style={{ transform: "translateZ(0)", overflow: "hidden" }}>
          {overlay}
        </div>
      </kit.TKProvider>,
    );
    const panel = screen.getByTestId("panel");
    expect(screen.getByTestId("trap").contains(panel)).toBe(false);
    expect(panel.closest(".tk")).toBe(screen.getByTestId("root"));
    // inside a `.tk` host the overlay stays absolute — `position: fixed` is
    // unreliable in the Telegram iOS webview while the keyboard animates
    expect(panel.style.position).toBe("absolute");
  });

  it("TKDialog escapes too (its centering wrapper parents to the root)", () => {
    render(
      <kit.TKProvider testId="root">
        <div data-testid="trap" style={{ transform: "translateZ(0)" }}>
          <kit.TKDialog open title="D" testId="panel" />
        </div>
      </kit.TKProvider>,
    );
    const panel = screen.getByTestId("panel");
    expect(screen.getByTestId("trap").contains(panel)).toBe(false);
    expect(panel.closest(".tk")).toBe(screen.getByTestId("root"));
  });

  it("stays inside a TKFrame ([data-tk-portal-root]) instead of escaping to the page root", () => {
    render(
      <kit.TKProvider>
        <kit.TKFrame testId="frame">
          <kit.TKSheet open title="S" testId="panel" />
        </kit.TKFrame>
      </kit.TKProvider>,
    );
    expect(screen.getByTestId("frame").contains(screen.getByTestId("panel"))).toBe(true);
  });

  it("falls back to document.body with position:fixed when no host exists", () => {
    render(<kit.TKSheet open title="S" testId="panel" />);
    const panel = screen.getByTestId("panel");
    expect(panel.parentElement).toBe(document.body);
    expect(panel.style.position).toBe("fixed");
    const scrim = document.querySelector("[data-tk-scrim]") as HTMLElement;
    expect(scrim.style.position).toBe("fixed");
  });

  it("emits no overlay markup on the server (the portal mounts client-side)", () => {
    const html = renderToString(<kit.TKSheet open title="Server-title" />);
    expect(html).not.toContain("Server-title");
  });
});

describe("reuse · select dropdowns portal to the shared overlay host (REU-010)", () => {
  it("TKSelect option list escapes a transformed/overflow ancestor into the `.tk` root", () => {
    render(
      <kit.TKProvider testId="root">
        <div data-testid="trap" style={{ overflow: "hidden", transform: "translateZ(0)" }}>
          <kit.TKSelect options={["Apple", "Pear"]} label="Fruit" />
        </div>
      </kit.TKProvider>,
    );
    fireEvent.click(screen.getByRole("combobox"));
    const list = screen.getByRole("listbox");
    expect(screen.getByTestId("trap").contains(list)).toBe(false);
    expect(list.closest(".tk")).toBe(screen.getByTestId("root"));
  });

  it("TKSelect still selects from the portaled list and closes on outside pointerdown", () => {
    const onChange = vi.fn();
    render(
      <kit.TKProvider>
        <kit.TKSelect options={["Apple", "Pear"]} label="Fruit" onChange={onChange} />
        <button>outside</button>
      </kit.TKProvider>,
    );
    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);
    // a pointerdown INSIDE the portaled popup must not count as outside
    fireEvent.pointerDown(screen.getByRole("option", { name: "Pear" }));
    fireEvent.click(screen.getByRole("option", { name: "Pear" }));
    expect(onChange).toHaveBeenCalledWith("Pear");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    fireEvent.pointerDown(screen.getByText("outside"));
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("TKSelect keyboard contract survives the portal (open, navigate, choose, Escape)", () => {
    const onChange = vi.fn();
    render(
      <kit.TKProvider>
        <kit.TKSelect options={["Apple", "Pear"]} label="Fruit" onChange={onChange} />
      </kit.TKProvider>,
    );
    const trigger = screen.getByRole("combobox");
    trigger.focus();
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    fireEvent.keyDown(trigger, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith("Pear");
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    fireEvent.keyDown(trigger, { key: "Escape" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("TKMultiselect listbox escapes the trap and keeps toggling through the portal", () => {
    const onChange = vi.fn();
    render(
      <kit.TKProvider testId="root">
        <div data-testid="trap" style={{ overflow: "hidden" }}>
          <kit.TKMultiselect options={["One", "Two"]} label="Digits" onChange={onChange} />
        </div>
      </kit.TKProvider>,
    );
    fireEvent.click(screen.getByRole("combobox"));
    const list = screen.getByRole("listbox");
    expect(screen.getByTestId("trap").contains(list)).toBe(false);
    expect(list.closest(".tk")).toBe(screen.getByTestId("root"));
    fireEvent.click(screen.getByRole("option", { name: "Two" }));
    expect(onChange).toHaveBeenCalledWith(["Two"]);
    // multiselect stays open after a toggle
    expect(screen.getByRole("combobox").getAttribute("aria-expanded")).toBe("true");
  });

  it("warns in dev when the portal host is not positioned", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      // a bare `.tk` class without TKProvider's inline position:relative
      <div className="tk">
        <kit.TKSelect options={["Apple"]} label="Fruit" />
      </div>,
    );
    fireEvent.click(screen.getByRole("combobox"));
    const hits = warn.mock.calls.filter(([m]) => typeof m === "string" && m.includes("REU-010"));
    expect(hits).toHaveLength(1);
    warn.mockRestore();
  });
});

describe("reuse · TKPhoneInput derives its default country from the locale (REU-011)", () => {
  const phone = () => screen.getByRole("textbox", { name: /phone/i }) as HTMLInputElement;

  it("is a free unmasked international input without a Russian locale", () => {
    const onChange = vi.fn();
    render(<kit.TKPhoneInput onChange={onChange} />);
    fireEvent.change(phone(), { target: { value: "+371 2 123" } });
    expect(phone().value).toBe("+371 2 123");
    expect(onChange).toHaveBeenLastCalledWith("+371 2 123", "3712123");
  });

  it("keeps the +7 default and Russian mask under the ru locale", () => {
    render(
      <kit.TKLocaleProvider locale={kit.ruLocale}>
        <kit.TKPhoneInput />
      </kit.TKLocaleProvider>,
    );
    const input = screen.getByRole("textbox", { name: "Номер телефона" }) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "9261234567" } });
    expect(input.value).toBe("+7 (926) 123-45-67");
  });

  it("an explicit defaultCountry still wins regardless of locale", () => {
    render(<kit.TKPhoneInput defaultCountry="+44" numberMask="#### ######" />);
    fireEvent.change(phone(), { target: { value: "7911123456" } });
    expect(phone().value).toBe("+44 7911 123456");
  });

  it("countrySelect derives the country from the lang region subtag, US fallback", () => {
    const { unmount } = render(<kit.TKPhoneInput countrySelect lang="de-DE" />);
    expect(screen.getByText("+49")).toBeInTheDocument();
    unmount();
    render(<kit.TKPhoneInput countrySelect />);
    expect(screen.getByText("+1")).toBeInTheDocument();
  });

  it("countrySelect under the ru locale starts on +7", () => {
    render(
      <kit.TKLocaleProvider locale={kit.ruLocale}>
        <kit.TKPhoneInput countrySelect />
      </kit.TKLocaleProvider>,
    );
    expect(screen.getByText("+7")).toBeInTheDocument();
  });
});

describe("reuse · form strings go through TKLocale (REU-012)", () => {
  it("ships the new keys in both bundled dictionaries", () => {
    for (const key of ["invalidDate", "invalidTime", "month", "year", "amPm"] as const) {
      expect(kit.enLocale[key]).toBeTruthy();
      expect(kit.ruLocale[key]).toBeTruthy();
      expect(kit.ruLocale[key]).not.toBe(kit.enLocale[key]);
    }
  });

  it("TKTimeInput incomplete-entry message is localized (invalidText still wins)", () => {
    const { unmount } = render(
      <kit.TKLocaleProvider locale={kit.ruLocale}>
        <kit.TKTimeInput label="Время" />
      </kit.TKLocaleProvider>,
    );
    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "12" } });
    fireEvent.blur(input);
    expect(screen.getByText("Введите корректное время")).toBeInTheDocument();
    unmount();
    render(<kit.TKTimeInput label="Time" invalidText="Own message" />);
    const en = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.change(en, { target: { value: "12" } });
    fireEvent.blur(en);
    expect(screen.getByText("Own message")).toBeInTheDocument();
  });

  it("TKDateInput manual-entry message is localized", () => {
    render(
      <kit.TKLocaleProvider locale={kit.ruLocale}>
        <kit.TKDateInput label="Дата" />
      </kit.TKLocaleProvider>,
    );
    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "99.99.9999" } });
    expect(screen.getByText("Введите корректную дату")).toBeInTheDocument();
  });

  it("TKCalendar part selectors expose localized Month/Year names", () => {
    render(
      <kit.TKLocaleProvider locale={kit.ruLocale}>
        <kit.TKCalendar partSelectors defaultValue={new Date(2026, 5, 15)} />
      </kit.TKLocaleProvider>,
    );
    expect(screen.getByRole("button", { name: "Месяц" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Год" })).toBeInTheDocument();
  });

  it("TKTimeInput hour12 meridiem group is localized", () => {
    render(
      <kit.TKLocaleProvider locale={kit.ruLocale}>
        <kit.TKTimeInput label="Время" hour12 />
      </kit.TKLocaleProvider>,
    );
    expect(screen.getByRole("group", { name: "AM или PM" })).toBeInTheDocument();
  });
});
