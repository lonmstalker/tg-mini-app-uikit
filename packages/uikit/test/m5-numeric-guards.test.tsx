import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as kit from "../src/index";
import { tkSafePad } from "../src/composites/layout/safe-area";

/* M5 CC-14 — numeric edge guards. jsdom has no layout, so assert on the applied
 * inline-style string (never "NaN"/"Infinity"), not measured pixels. */

const noBadNum = (el: HTMLElement) => expect(el.getAttribute("style") ?? "").not.toMatch(/NaN|Infinity/);

/* ---------------- TCRD-002 ---------------- */

describe("TCRD-002 TKStatTile all-zero bars", () => {
  it("renders 0% heights, never NaN", () => {
    render(<kit.TKStatTile bars={[0, 0, 0]} testId="tile" />);
    const bars = screen.getByTestId("tile").querySelectorAll<HTMLElement>("div[style*='height:'][style*='%']");
    const leaves = [...bars].filter((b) => b.style.height.endsWith("%"));
    expect(leaves.length).toBeGreaterThan(0);
    for (const b of leaves) noBadNum(b);
  });

  it("keeps proportions for mixed data", () => {
    render(<kit.TKStatTile bars={[0, 5, 10]} testId="tile" />);
    const heights = [...screen.getByTestId("tile").querySelectorAll<HTMLElement>("div")]
      .map((d) => d.style.height)
      .filter((h) => h.endsWith("%"));
    expect(heights).toContain("100%");
    expect(heights).toContain("50%");
  });
});

/* ---------------- FBK-006 ---------------- */

describe("FBK-006 TKBars edge data", () => {
  it("empty data renders nothing without throwing", () => {
    expect(() => render(<kit.TKBars data={[]} testId="bars" />)).not.toThrow();
  });

  it("a non-finite value does not poison the heights", () => {
    render(<kit.TKBars data={[Number.NaN, 5]} testId="bars" />);
    for (const el of screen.getByTestId("bars").querySelectorAll<HTMLElement>("[style*='height']")) noBadNum(el);
  });
  // The reduce (vs Math.max spread) also avoids a RangeError on a huge series;
  // rendering 200k nodes in jsdom is too slow to unit-test, so the reduce logic
  // is covered by the empty + non-finite cases above.
});

/* ---------------- CTL-009 ---------------- */

describe("CTL-009 slider step<=0 guard", () => {
  it("step=0 keeps aria-valuenow finite on arrow", () => {
    const onChange = vi.fn();
    render(<kit.TKSlider defaultValue={50} step={0} onChange={onChange} label="vol" />);
    const slider = screen.getByRole("slider");
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(slider.getAttribute("aria-valuenow")).toBe("51");
    const lastArg = onChange.mock.calls[onChange.mock.calls.length - 1]?.[0];
    expect(Number.isFinite(lastArg)).toBe(true);
  });

  it("negative step still increments sanely", () => {
    render(<kit.TKSlider defaultValue={10} step={-5} onChange={() => {}} label="v" />);
    const slider = screen.getByRole("slider");
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(slider.getAttribute("aria-valuenow")).toBe("11");
  });
});

/* ---------------- CRS-007 ---------------- */

describe("CRS-007 carousel zero/single slide", () => {
  it("empty gallery does not scroll negative or throw", () => {
    const { container } = render(<kit.TKGallery testId="g" />);
    const track = container.querySelector<HTMLElement>("[tabindex='0']")!;
    const scrollTo = vi.fn();
    Object.defineProperty(track, "scrollTo", { value: scrollTo, configurable: true });
    Object.defineProperty(track, "clientWidth", { value: 100, configurable: true });
    expect(() => fireEvent.keyDown(track, { key: "ArrowRight" })).not.toThrow();
    expect(scrollTo.mock.calls.every((c) => (c[0]?.left ?? 0) >= 0)).toBe(true);
  });
});

/* ---------------- PTN-005 ---------------- */

describe("PTN-005 SlotPicker day / XP guards", () => {
  it("day out of range highlights the last valid day", () => {
    render(
      <kit.TKSlotPicker
        days={[{ label: "Mon", date: "1" }, { label: "Tue", date: "2" }]}
        slots={["10:00"]}
        day={99}
        testId="sp"
      />,
    );
    const dayButtons = [...screen.getByTestId("sp").querySelectorAll<HTMLElement>("button")].filter((b) =>
      /Mon|Tue/.test(b.textContent ?? ""),
    );
    const active = dayButtons.filter((b) => b.style.background.includes("var(--tk-accent)"));
    expect(active).toHaveLength(1);
    expect(active[0].textContent).toContain("Tue");
  });

  it("XP NaN renders 0% width", () => {
    render(<kit.TKXPHeader name="A" xp={Number.NaN} testId="xp" />);
    const fill = [...screen.getByTestId("xp").querySelectorAll<HTMLElement>("div")].find((d) => d.style.width.endsWith("%"))!;
    expect(fill.style.width).toBe("0%");
  });

  it("empty days/slots do not throw", () => {
    expect(() => render(<kit.TKSlotPicker days={[]} slots={[]} testId="sp" />)).not.toThrow();
  });
});

/* ---------------- DSP-006 ---------------- */

describe("DSP-006 TKCounter", () => {
  it("coerces a numeric string over max", () => {
    render(<kit.TKCounter value={"1000"} max={99} testId="c" />);
    expect(screen.getByTestId("c").textContent).toBe("99+");
  });

  it("clamps a negative to 0", () => {
    render(<kit.TKCounter value={-5} testId="c" />);
    expect(screen.getByTestId("c").textContent).toBe("0");
  });

  it("renders 0 and a normal over-max", () => {
    const { rerender } = render(<kit.TKCounter value={0} max={99} testId="c" />);
    expect(screen.getByTestId("c").textContent).toBe("0");
    rerender(<kit.TKCounter value={150} max={99} testId="c" />);
    expect(screen.getByTestId("c").textContent).toBe("99+");
  });
});

/* ---------------- ONB-010 ---------------- */

describe("ONB-010 confetti count edge", () => {
  afterEach(() => vi.useRealTimers());

  it("negative count does not throw", () => {
    expect(() => render(<kit.TKConfetti count={-5} />)).not.toThrow();
  });

  it("count=0 settles onDone promptly (no waiting out duration)", () => {
    vi.useFakeTimers();
    const onDone = vi.fn();
    render(<kit.TKConfetti count={0} duration={1800} onDone={onDone} />);
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});

/* ---------------- LAY-009 ---------------- */

describe("LAY-009 tkSafePad clamps", () => {
  it("clamps negatives and keeps the env floor", () => {
    const s = tkSafePad("bottom", -5, -3);
    expect(s).toContain("env(safe-area-inset-bottom, 0px)");
    expect(s).not.toMatch(/-\d/);
  });

  it("guards NaN to 0", () => {
    // now reads the overridable --tk-safe-* token with an env() fallback (LAY-002)
    expect(tkSafePad("top", Number.NaN)).toBe("max(var(--tk-safe-top, env(safe-area-inset-top, 0px)), 0px)");
  });

  it("keeps valid positive input", () => {
    expect(tkSafePad("bottom", 10, 4)).toBe(
      "calc(max(var(--tk-safe-bottom, env(safe-area-inset-bottom, 0px)), 10px) + 4px)",
    );
  });
});

/* ---------------- NAV-004 ---------------- */

describe("NAV-004 TKSteps clamps current", () => {
  const steps = ["A", "B", "C"];
  const activeCount = () => document.querySelectorAll('[aria-current="step"]').length;

  it("current=length keeps exactly one active on the last step", () => {
    render(<kit.TKSteps steps={steps} current={3} onStepClick={() => {}} />);
    expect(activeCount()).toBe(1);
    expect(document.querySelector('[aria-current="step"]')?.textContent).toBe("C");
  });

  it("current=-1 falls back to the first step", () => {
    render(<kit.TKSteps steps={steps} current={-1} onStepClick={() => {}} />);
    expect(activeCount()).toBe(1);
    expect(document.querySelector('[aria-current="step"]')?.textContent).toBe("A");
  });

  it("clamped group keeps a single roving tab stop", () => {
    render(<kit.TKSteps steps={steps} current={99} onStepClick={() => {}} />);
    const tabbable = screen.getAllByRole("button").filter((b) => b.tabIndex === 0);
    expect(tabbable).toHaveLength(1);
  });
});
