import { readFileSync } from "node:fs";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import * as kit from "../src/index";
import { tkOnAccentInk } from "../src/foundation/theme";

/* M6 — CC-08 token sweep + TYP-004 typography passthrough + LAY-006 page ref
 * + NAV2-006 typed nav. jsdom doesn't resolve CSS vars, so inline style reads
 * exact var() strings; CSS-buried literals use source-grep. */

/* ---------------- CC-08 — no hardcoded #fff/rgba-white on ink paths ---------------- */

// Catch the realistic re-introductions: #fff / #ffffff, rgb()/rgba() white,
// on color/background/fill/stroke ink properties (M6 review S1).
const INK = /\b(?:color|background|fill|stroke):\s*["'](?:#fff(?:fff)?\b|rgba?\(\s*255\s*,\s*255\s*,\s*255)/i;

describe("CC-08 ink literals replaced with --tk-on-accent / tokens", () => {
  it.each([
    "src/atoms/controls/switch.tsx",
    "src/atoms/controls/sliders.tsx",
    "src/atoms/display/avatar.tsx",
    "src/atoms/display/badges.tsx",
    "src/composites/feedback/timeline.tsx",
    "src/composites/gestures/swipe-cell.tsx",
    "src/composites/lists/cell.tsx",
    "src/templates/patterns/gamification.tsx",
    "src/templates/cards/promotional.tsx",
  ])("%s has no raw #fff/rgba-white ink", (file) => {
    const src = readFileSync(file, "utf8");
    const offending = src.split("\n").filter((l) => INK.test(l));
    expect(offending).toEqual([]);
  });

  it("Avatar/Counter ink resolves to var(--tk-on-accent…)", () => {
    render(<kit.TKAvatar testId="av" initials="NK" />);
    expect(screen.getByTestId("av").style.color).toBe("var(--tk-on-accent, #fff)");
    render(<kit.TKCounter testId="c" value={9} />);
    expect(screen.getByTestId("c").style.color).toBe("var(--tk-on-accent, #fff)");
  });

  it("XPHeader text uses --tk-on-accent on the accent surface", () => {
    render(<kit.TKXPHeader testId="xp" name="NK" level={3} xp={40} />);
    expect(screen.getByTestId("xp").style.color).toBe("var(--tk-on-accent, #fff)");
  });

  it("confetti resolves the live accent (canvas can't read CSS vars) + honors override", () => {
    const src = readFileSync("src/templates/confetti.tsx", "utf8");
    expect(src).toMatch(/getComputedStyle\([^)]*\)\.getPropertyValue\(["']--tk-accent["']\)/);
    expect(src).toMatch(/colors\s*\?\?/); // consumer colors win over the default
  });

  it("switch knob / slider thumb use --tk-knob (a light puck), not on-accent ink", () => {
    expect(readFileSync("src/atoms/controls/switch.tsx", "utf8")).toMatch(/background:\s*"var\(--tk-knob/);
    expect(readFileSync("src/atoms/controls/sliders.tsx", "utf8")).toMatch(/background:\s*"var\(--tk-knob/);
  });

  it("derives a readable on-accent ink from a hex accent's luminance", () => {
    expect(tkOnAccentInk("#3390ec")).toBe("#ffffff"); // dark-ish accent → white ink
    expect(tkOnAccentInk("#f5f5f5")).toBe("#0b0f14"); // near-white accent → dark ink
    expect(tkOnAccentInk("#fff")).toBe("#0b0f14");
    expect(tkOnAccentInk("var(--x)")).toBeUndefined(); // non-hex → leave the CSS default
    expect((kit.tkThemeVars({ accent: "#f5f5f5" }) as Record<string, string>)["--tk-on-accent"]).toBe("#0b0f14");
  });
});

/* ---------------- TYP-004 — typography HTML passthrough ---------------- */

describe("TYP-004 typography forwards id/aria/lang/dir/role/title", () => {
  it("TKTitle exposes id, aria-describedby, lang", () => {
    render(
      <kit.TKTitle id="sec" aria-describedby="d" lang="de">
        Section
      </kit.TKTitle>,
    );
    const el = screen.getByText("Section");
    expect(el.getAttribute("id")).toBe("sec");
    expect(el.getAttribute("aria-describedby")).toBe("d");
    expect(el.getAttribute("lang")).toBe("de");
  });

  it("TKText forwards dir/title/role and keeps controlled class", () => {
    render(
      <kit.TKText dir="rtl" title="tip" role="note" className="late" id="z">
        x
      </kit.TKText>,
    );
    const el = screen.getByText("x");
    expect(el.getAttribute("dir")).toBe("rtl");
    expect(el.getAttribute("title")).toBe("tip");
    expect(el.getAttribute("role")).toBe("note");
    expect(el).toHaveClass("late");
    expect(el.getAttribute("id")).toBe("z");
  });

  it("TKCaption forwards id + aria-hidden", () => {
    render(
      <kit.TKCaption id="cap" aria-hidden testId="cap">
        c
      </kit.TKCaption>,
    );
    const el = screen.getByTestId("cap");
    expect(el.getAttribute("id")).toBe("cap");
    expect(el.getAttribute("aria-hidden")).toBe("true");
  });
});

/* ---------------- LAY-006 — TKPage forwards a ref to the scroll node ---------------- */

describe("LAY-006 TKPage ref → scroll container", () => {
  it("ref points at the scrollable [data-tk-page-scroll] node", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <kit.TKPage ref={ref} testId="p">
        <div>content</div>
      </kit.TKPage>,
    );
    expect(ref.current).toBe(container.querySelector("[data-tk-page-scroll]"));
    ref.current!.scrollTop = 120;
    expect(ref.current!.scrollTop).toBe(120);
  });
});
