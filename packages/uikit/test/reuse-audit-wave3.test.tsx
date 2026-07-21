import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
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
