import { readFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import * as kit from "../src/index";

/* M10-B — layout MEDIUM: LAY-004 (page scroll region name), LAY-005 (bottom-bar
 * landmark), LAY-007 (glass opaque fallback), LAY-008 (safe-area logical edges). */

describe("LAY-004 TKPage scroll region naming", () => {
  it("[D-A11Y] scrollLabel makes the scroller a named region", () => {
    render(<kit.TKPage scrollLabel="Feed">x</kit.TKPage>);
    expect(screen.getByRole("region", { name: "Feed" })).toBeInTheDocument();
  });

  it("[D-API] without scrollLabel the scroller is not an unnamed tab stop", () => {
    const { container } = render(<kit.TKPage>x</kit.TKPage>);
    const scroll = container.querySelector("[data-tk-page-scroll]")!;
    expect(scroll.getAttribute("tabindex")).toBeNull();
    expect(scroll.getAttribute("aria-label")).toBeNull();
  });
});

describe("LAY-005 TKBottomBar landmark + passthrough", () => {
  it("[D-A11Y] renders a contentinfo (footer) landmark by default", () => {
    render(<kit.TKBottomBar>Pay</kit.TKBottomBar>);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("[D-API] forwards aria-label and role overrides + data-* via rest", () => {
    const { container } = render(
      <kit.TKBottomBar role="toolbar" aria-label="Checkout" data-variant="pay">
        x
      </kit.TKBottomBar>,
    );
    expect(screen.getByRole("toolbar", { name: "Checkout" })).toBeInTheDocument();
    expect(container.firstElementChild!.getAttribute("data-variant")).toBe("pay");
  });

  it("[D-API] blur=false uses the opaque --tk-bg background and no backdrop-filter", () => {
    const { container } = render(<kit.TKBottomBar blur={false}>x</kit.TKBottomBar>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.background).toBe("var(--tk-bg)");
    expect(root.style.backdropFilter).toBe("");
  });
});

describe("LAY-007 glass has an opaque fallback (source contract)", () => {
  // jsdom can't resolve @supports/var() cascade — the fallback is declared OUTSIDE
  // @layer tk so it wins over every themed --tk-glass; cascade win is verified in e2e.
  const css = readFileSync("src/tokens/tokens.css", "utf8");

  it("[D-THEME] the fallback lives outside @layer tk so it can't lose on specificity", () => {
    const layerEnd = css.indexOf("} /* @layer tk */");
    expect(layerEnd).toBeGreaterThan(0);
    expect(css.slice(layerEnd)).toMatch(/@supports\s+not\s*\(backdrop-filter/);
  });

  it("[D-THEME] gates an opaque --tk-glass behind @supports not (backdrop-filter)", () => {
    // the @supports-not branch resets --tk-glass to the opaque surface
    expect(css).toMatch(/@supports\s+not\s*\(backdrop-filter[\s\S]{0,160}?--tk-glass:\s*var\(--tk-bg\)/);
  });

  it("[D-THEME] honors prefers-reduced-transparency with an opaque glass", () => {
    expect(css).toMatch(/@media[^{]*prefers-reduced-transparency:\s*reduce[\s\S]*?--tk-glass:\s*var\(--tk-bg\)/);
  });
});

describe("LAY-008 TKSafeArea logical start/end edges", () => {
  it("[D-RTL] start/end map to logical padding, not physical left/right", () => {
    const { container } = render(
      <kit.TKSafeArea edges={["start", "end"]} testId="sa">
        x
      </kit.TKSafeArea>,
    );
    const root = container.querySelector('[data-testid="sa"]') as HTMLElement;
    expect(root.style.paddingInlineStart).not.toBe("");
    expect(root.style.paddingInlineEnd).not.toBe("");
    expect(root.style.paddingLeft).toBe("");
  });

  it("[D-RESP] physical left/right edges stay physical (back-compat)", () => {
    const { container } = render(
      <kit.TKSafeArea edges={["left", "right"]} testId="sa">
        x
      </kit.TKSafeArea>,
    );
    const root = container.querySelector('[data-testid="sa"]') as HTMLElement;
    expect(root.style.paddingLeft).toMatch(/^max\(|^calc\(/);
    expect(root.style.paddingInlineStart).toBe("");
  });

  it("[D-EDGE] an unknown edge is ignored, no undefined-keyed style", () => {
    const { container } = render(
      // @ts-expect-error intentionally invalid edge
      <kit.TKSafeArea edges={["bogus"]} testId="sa">
        x
      </kit.TKSafeArea>,
    );
    expect((container.querySelector('[data-testid="sa"]')!.getAttribute("style") ?? "")).not.toMatch(/undefined/);
  });
});
