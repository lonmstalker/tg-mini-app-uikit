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
