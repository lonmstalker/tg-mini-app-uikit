import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import * as kit from "../src/index";

/*
 * Wave 2 of the July-2026 reuse audit: fixes found by the full-library sweep
 * (REU-002…REU-008). Wave 1 (the consumer-reported six) is pinned in
 * reuse-audit.test.tsx.
 */

const customGlyph = (id: string) => <svg data-testid={id} viewBox="0 0 24 24" />;

describe("reuse · icon props accept custom elements (REU-004)", () => {
  it("TKIconButton renders a custom element icon", () => {
    render(<kit.TKIconButton icon={customGlyph("g-iconbtn")} label="X" />);
    expect(screen.getByTestId("g-iconbtn")).toBeTruthy();
  });

  it("TKTabbar renders custom element icons and ReactNode labels", () => {
    render(
      <kit.TKTabbar
        tabs={[
          { icon: customGlyph("g-tab"), label: <em>История</em> },
          { icon: "home", label: "Домой" },
        ]}
      />,
    );
    expect(screen.getByTestId("g-tab")).toBeTruthy();
    expect(screen.getByText("История")).toBeTruthy();
  });

  it("TKCell renders a custom element in the leading slot", () => {
    render(<kit.TKCell icon={customGlyph("g-cell")} title="Row" />);
    expect(screen.getByTestId("g-cell")).toBeTruthy();
  });

  it("TKChip renders a custom element icon", () => {
    render(<kit.TKChip icon={customGlyph("g-chip")}>Чип</kit.TKChip>);
    expect(screen.getByTestId("g-chip")).toBeTruthy();
  });

  it("TKDialog renders a custom element in the icon medallion", () => {
    render(<kit.TKDialog open icon={customGlyph("g-dialog")} title="T" />);
    expect(screen.getByTestId("g-dialog")).toBeTruthy();
  });

  it("TKEmptyState renders a custom element in the circle", () => {
    render(<kit.TKEmptyState icon={customGlyph("g-empty")} title="Пусто" />);
    expect(screen.getByTestId("g-empty")).toBeTruthy();
  });

  it("TKWriteBar renders a custom send icon element", () => {
    render(<kit.TKWriteBar onSend={() => {}} sendIcon={customGlyph("g-send")} />);
    expect(screen.getByTestId("g-send")).toBeTruthy();
  });
});

describe("reuse · no invented demo content (REU-002)", () => {
  it("TKProductCardA without a title renders no 'Product' placeholder", () => {
    render(<kit.TKProductCardA price="₽100" testId="card" />);
    expect(screen.getByTestId("card").textContent).not.toContain("Product");
  });

  it("TKEmptyState without icon/media renders no illustration circle", () => {
    const { container } = render(<kit.TKEmptyState title="Пусто" testId="es" />);
    expect(container.querySelector("svg")).toBeNull();
    const circle = [...container.querySelectorAll("div")].find((el) => el.style.width === "68px");
    expect(circle).toBeUndefined();
  });
});

describe("reuse · color escape hatches (REU-003)", () => {
  it("TKSwitch paints the ON track with `color`", () => {
    const { container } = render(<kit.TKSwitch ariaLabel="s" defaultChecked color="rgb(10, 20, 30)" />);
    const track = container.querySelector("button > span") as HTMLElement;
    expect(track.style.background).toBe("rgb(10, 20, 30)");
  });

  it("TKCheckbox paints the checked box with `color`", () => {
    render(<kit.TKCheckbox label="c" defaultChecked color="rgb(30, 20, 10)" />);
    const box = screen.getByRole("checkbox").querySelector("span") as HTMLElement;
    expect(box.style.background).toBe("rgb(30, 20, 10)");
  });

  it("TKRating paints filled stars with `color`", () => {
    render(<kit.TKRating defaultValue={2} color="rgb(1, 2, 3)" testId="r" />);
    const star = screen.getByTestId("r").querySelector("button") as HTMLElement;
    expect(star.style.color).toBe("rgb(1, 2, 3)");
  });

  it("TKBars paints hovered/resting fills from `color`", () => {
    render(<kit.TKBars data={[1, 2]} color="rgb(9, 9, 9)" testId="b" />);
    const fill = screen.getByTestId("b").querySelector("span") as HTMLElement;
    expect(fill.style.background).toContain("color-mix(in srgb, rgb(9, 9, 9) 20%, transparent)");
  });

  it("TKSwipeAction accepts an arbitrary background color", () => {
    render(
      <kit.TKSwipeCell trailing={[{ label: "Архив", color: "rgb(5, 6, 7)", onAction: () => {} }]}>
        <div>row</div>
      </kit.TKSwipeCell>,
    );
    const btn = screen.getByRole("button", { name: "Архив" });
    expect(btn.style.background).toBe("rgb(5, 6, 7)");
  });
});

describe("reuse · style/className reach the root (REU-007)", () => {
  it("TKCell no longer drops a consumer style", () => {
    render(<kit.TKCell title="Row" testId="cell" style={{ background: "rgb(7, 7, 7)", paddingLeft: 0 }} />);
    const cell = screen.getByTestId("cell");
    expect(cell.style.background).toBe("rgb(7, 7, 7)");
    expect(cell.style.paddingLeft).toBe("0px");
  });

  const styled: Array<[string, (style: React.CSSProperties, className: string) => React.ReactElement]> = [
    ["TKTabbar", (style, className) => <kit.TKTabbar tabs={[{ icon: "home", label: "A" }]} style={style} className={className} testId="t" />],
    ["TKHeader", (style, className) => <kit.TKHeader title="T" style={style} className={className} testId="t" />],
    ["TKSegmented", (style, className) => <kit.TKSegmented options={["a", "b"]} ariaLabel="s" style={style} className={className} testId="t" />],
    ["TKSteps", (style, className) => <kit.TKSteps steps={["a", "b"]} current={0} style={style} className={className} testId="t" />],
    ["TKPageDots", (style, className) => <kit.TKPageDots count={3} style={style} className={className} testId="t" />],
    ["TKListGroup", (style, className) => <kit.TKListGroup style={style} className={className} testId="t" />],
    ["TKStepper", (style, className) => <kit.TKStepper style={style} className={className} testId="t" />],
    ["TKRating", (style, className) => <kit.TKRating style={style} className={className} testId="t" />],
    ["TKSlider", (style, className) => <kit.TKSlider label="s" style={style} className={className} testId="t" />],
    ["TKXPHeader", (style, className) => <kit.TKXPHeader name="N" style={style} className={className} testId="t" />],
    ["TKLeaderboard", (style, className) => <kit.TKLeaderboard rows={[]} style={style} className={className} testId="t" />],
    ["TKSlotPicker", (style, className) => <kit.TKSlotPicker days={[]} slots={[]} style={style} className={className} testId="t" />],
    ["TKPaymentSummary", (style, className) => <kit.TKPaymentSummary rows={[]} style={style} className={className} testId="t" />],
    ["TKWriteBar", (style, className) => <kit.TKWriteBar onSend={() => {}} style={style} className={className} testId="t" />],
    ["TKMessages", (style, className) => <kit.TKMessages messages={[]} style={style} className={className} testId="t" />],
  ];

  it.each(styled)("%s merges style (consumer wins) and applies className", (_name, make) => {
    const { unmount } = render(make({ marginTop: 7 }, "my-cls"));
    const el = screen.getByTestId("t");
    expect(el.style.marginTop).toBe("7px");
    expect(el.className).toContain("my-cls");
    unmount();
  });

  it("TKSheet and TKDialog forward style/className to the panel", () => {
    render(<kit.TKSheet open title="S" testId="sheet" className="sheet-cls" style={{ borderRadius: "1px" }} />);
    const sheet = screen.getByTestId("sheet");
    expect(sheet.className).toContain("sheet-cls");
    expect(sheet.style.borderRadius).toBe("1px");
  });

  it("TKMessageBubble styles the bubble itself", () => {
    render(<kit.TKMessageBubble text="hi" testId="bubble" style={{ background: "rgb(3, 3, 3)" }} className="b-cls" />);
    const wrap = screen.getByTestId("bubble");
    const bubble = wrap.firstElementChild as HTMLElement;
    expect(bubble.style.background).toBe("rgb(3, 3, 3)");
    expect(bubble.className).toContain("b-cls");
  });
});

describe("reuse · compression/wrap guards (REU-008)", () => {
  it("TKTabbar labels truncate instead of wrapping", () => {
    render(<kit.TKTabbar tabs={[{ icon: "home", label: "Очень длинная подпись" }]} testId="bar" />);
    const label = screen.getByText("Очень длинная подпись") as HTMLElement;
    expect(label.style.whiteSpace).toBe("nowrap");
    expect(label.style.textOverflow).toBe("ellipsis");
  });

  it("TKCheckbox box carries flex-shrink: 0", () => {
    render(<kit.TKCheckbox label="Очень длинная подпись, которая переносится" />);
    const box = screen.getByRole("checkbox").querySelector("span") as HTMLElement;
    expect(box.style.flexShrink).toBe("0");
  });

  it("TKStepper root carries flex-shrink: 0", () => {
    render(<kit.TKStepper testId="st" />);
    expect(screen.getByTestId("st").style.flexShrink).toBe("0");
  });

  it("TKDialog row actions use minmax(0, 1fr) columns", () => {
    render(
      <kit.TKDialog open title="T" actions={[<button key="a">Долгая надпись</button>, <button key="b">Ещё длиннее надпись</button>]} testId="dlg" />,
    );
    const grid = [...screen.getByTestId("dlg").querySelectorAll("div")].find(
      (el) => el.style.gridAutoFlow === "column",
    ) as HTMLElement;
    expect(grid.style.gridAutoColumns).toBe("minmax(0, 1fr)");
  });
});

describe("reuse · dev warnings for silent coupling (REU-006)", () => {
  it("TKVirtualList warns when the scroller resolves to 0px height", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<kit.TKVirtualList items={[1, 2, 3]} itemHeight={40} renderItem={(x) => <span>{x}</span>} />);
    const hits = warn.mock.calls.filter(([m]) => typeof m === "string" && m.includes("TKVirtualList"));
    expect(hits.length).toBe(1);
    warn.mockRestore();
  });
});
