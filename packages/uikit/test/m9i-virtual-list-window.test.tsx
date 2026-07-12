import { useRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import * as kit from "../src/index";

/* M9-I — LST-001: TKVirtualList window/scroll-parent mode renders only ~viewport
 * rows while flowing inline (no own fixed-height scroller). */

describe("LST-001 TKVirtualList window mode", () => {
  const items = Array.from({ length: 1000 }, (_, i) => i);
  const renderItem = (n: number) => <div data-row>{n}</div>;

  it("[D-PERF] page-scroll mode renders only a windowed slice, not all rows", () => {
    render(
      <kit.TKVirtualList items={items} itemHeight={50} scrollParent="window" renderItem={renderItem} testId="vl" />,
    );
    const rows = document.querySelectorAll("[data-row]");
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.length).toBeLessThan(60); // viewport(768)/50 + overscan ≪ 1000
  });

  it("[D-API] window mode flows inline — it does NOT own an overflow scroller", () => {
    render(
      <kit.TKVirtualList items={items} itemHeight={50} scrollParent="window" renderItem={renderItem} testId="vl" />,
    );
    const root = screen.getByTestId("vl");
    expect(root.style.overflowY).toBe(""); // no inner scroller
    // the spacer still reserves the full scroll height for correct scrollbar geometry
    expect((root.firstElementChild as HTMLElement).style.height).toBe(`${1000 * 50}px`);
  });

  it("[D-API] without scrollParent it keeps the fixed-height scroller", () => {
    render(<kit.TKVirtualList items={items} itemHeight={50} height={400} renderItem={renderItem} testId="vl" />);
    expect(screen.getByTestId("vl").style.overflowY).toBe("auto");
  });

  it("[D-API] an element scrollParent ref resolves and windows the slice", () => {
    function Harness() {
      const boxRef = useRef<HTMLDivElement>(null);
      return (
        <div ref={boxRef} style={{ height: 400, overflow: "auto" }}>
          <kit.TKVirtualList items={items} itemHeight={50} scrollParent={boxRef} renderItem={renderItem} testId="vl" />
        </div>
      );
    }
    render(<Harness />);
    const rows = document.querySelectorAll("[data-row]");
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.length).toBeLessThan(60);
    expect(screen.getByTestId("vl").style.overflowY).toBe(""); // still no own scroller
  });
});
