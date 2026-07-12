import { useEffect, useReducer } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import * as kit from "../src/index";

/* M5 CC-11 stable keys + perf. Index keys remount a node on reorder; stable keys
 * preserve it — assert DOM node identity (toBe) across a reorder/removal. */

/* ---------------- DSP-007 — AvatarStack ---------------- */

describe("DSP-007 AvatarStack keys by identity", () => {
  const items = [
    { id: "a", src: "/a.png", initials: "A" },
    { id: "b", src: "/b.png", initials: "B" },
    { id: "c", src: "/c.png", initials: "C" },
  ];

  it("removing the first avatar preserves the surviving nodes", () => {
    const { rerender } = render(<kit.TKAvatarStack avatars={items} max={4} testId="st" />);
    const imgsBefore = screen.getByTestId("st").querySelectorAll("img");
    const bNode = imgsBefore[1]; // "b"
    rerender(<kit.TKAvatarStack avatars={items.slice(1)} max={4} testId="st" />);
    const imgsAfter = screen.getByTestId("st").querySelectorAll("img");
    expect(imgsAfter[0]).toBe(bNode); // same DOM node, not remounted into position 0
  });
});

/* ---------------- NAV-007 — duplicate tab labels ---------------- */

describe("NAV-007 Tabbar duplicate labels render distinct buttons", () => {
  it("two identical labels yield two tabs", () => {
    render(
      <kit.TKTabbar
        tabs={[
          { label: "More", icon: "dots" },
          { label: "More", icon: "dots" },
        ]}
        value={0}
        onChange={() => {}}
      />,
    );
    expect(screen.getAllByRole("button")).toHaveLength(2);
  });
});

/* ---------------- CRS-008 — carousel slides keyed stably ---------------- */

describe("CRS-008 carousel preserves keyed slides on reorder", () => {
  it("dropping the first keyed slide does not remount the others", () => {
    const mounts: Record<string, number> = {};
    function Slide({ tag }: { tag: string }) {
      useEffect(() => {
        mounts[tag] = (mounts[tag] ?? 0) + 1;
      }, []);
      return <span data-slide={tag}>{tag}</span>;
    }
    const { rerender } = render(
      <kit.TKGallery height={120} testId="g">
        {[<Slide key="a" tag="a" />, <Slide key="b" tag="b" />, <Slide key="c" tag="c" />]}
      </kit.TKGallery>,
    );
    expect(mounts).toEqual({ a: 1, b: 1, c: 1 });
    rerender(
      <kit.TKGallery height={120} testId="g">
        {[<Slide key="b" tag="b" />, <Slide key="c" tag="c" />]}
      </kit.TKGallery>,
    );
    expect(mounts.b).toBe(1); // not remounted
    expect(mounts.c).toBe(1);
  });
});

/* ---------------- PTN-008 — PaymentSummary rows ---------------- */

describe("PTN-008 PaymentSummary keys rows stably", () => {
  const rows = [
    { id: "sub", label: "Subtotal", value: "$10" },
    { id: "disc", label: "Promo", value: "-$2", accent: true },
    { id: "tot", label: "Total", value: "$8", total: true },
  ];

  it("reordering preserves the row node and uses no display:contents", () => {
    const { rerender } = render(<kit.TKPaymentSummary rows={rows} testId="ps" />);
    const promoNode = screen.getByText("Promo").closest("div[style*='flex-direction']");
    expect((promoNode as HTMLElement).style.display).not.toBe("contents");
    rerender(<kit.TKPaymentSummary rows={[rows[1], rows[0], rows[2]]} testId="ps" />);
    expect(screen.getByText("Promo").closest("div[style*='flex-direction']")).toBe(promoNode);
  });
});

/* ---------------- LST-DX-003 — VirtualList getKey + optional height ---------------- */

describe("LST-DX-003 VirtualList getKey + optional height", () => {
  it("getKey preserves a row's node across reorder", () => {
    const items = [{ id: "a" }, { id: "b" }, { id: "c" }];
    const { rerender } = render(
      <kit.TKVirtualList
        items={items}
        itemHeight={56}
        height={400}
        getKey={(r) => r.id}
        renderItem={(r) => <span data-row={r.id}>{r.id}</span>}
      />,
    );
    const cNode = document.querySelector('[data-row="c"]');
    expect(cNode).not.toBeNull();
    rerender(
      <kit.TKVirtualList
        items={[items[2], items[0], items[1]]}
        itemHeight={56}
        height={400}
        getKey={(r) => r.id}
        renderItem={(r) => <span data-row={r.id}>{r.id}</span>}
      />,
    );
    expect(document.querySelector('[data-row="c"]')).toBe(cNode);
  });

  it("height omitted defaults to 100%", () => {
    render(
      <kit.TKVirtualList items={[1, 2]} itemHeight={56} renderItem={(n) => <span>{n}</span>} testId="vl" />,
    );
    expect(screen.getByTestId("vl").style.height).toBe("100%");
  });
});

/* ---------------- CHT-005 — message bubble keying + memo ---------------- */

describe("CHT-005 TKMessages keys by id", () => {
  it("reordering preserves a bubble node", () => {
    const a = { id: "1", text: "a" };
    const b = { id: "2", text: "b" };
    const { rerender } = render(<kit.TKMessages messages={[a, b]} />);
    const bNode = screen.getByText("b");
    rerender(<kit.TKMessages messages={[b, a]} />);
    expect(screen.getByText("b")).toBe(bNode);
  });

  it("memoized bubble does not re-render when an unrelated sibling state changes", () => {
    let renders = 0;
    function Tracked({ n }: { n: number }) {
      renders++;
      return <span>{n}</span>;
    }
    // stable messages array so the only variable is the parent state tick
    const msgs = [
      { id: "1", children: <Tracked n={1} /> },
      { id: "2", children: <Tracked n={2} /> },
    ];
    function Harness() {
      const [, force] = useReducer((x: number) => x + 1, 0);
      return (
        <>
          <button type="button" onClick={force}>
            tick
          </button>
          <kit.TKMessages messages={msgs} />
        </>
      );
    }
    render(<Harness />);
    const before = renders;
    fireEvent.click(screen.getByText("tick"));
    expect(renders).toBe(before); // React.memo blocked the re-render (CHT-005)
  });
});

/* ---------------- DSP-011 — single avatar instance ---------------- */

describe("DSP-011 TKAvatar renders one instance with status", () => {
  it("status set yields a single testId instance and one img, dot as sibling", () => {
    render(<kit.TKAvatar status="online" src="/p.png" testId="av" />);
    expect(document.querySelectorAll('[data-testid="av"]')).toHaveLength(1);
    expect(screen.getByTestId("av").querySelectorAll("img")).toHaveLength(1);
    expect(screen.getByTestId("av").querySelector("[data-tk-avatar-status]")).not.toBeNull();
  });
});

/* ---------------- LAY-001 — headerless page scroll doesn't re-render content ---------------- */

describe("LAY-001 TKPage scroll isolation", () => {
  it("scrolling a headerless page does not re-render the content child", () => {
    let renders = 0;
    function Counter() {
      renders++;
      return <div>row</div>;
    }
    const { container } = render(
      <kit.TKPage testId="p">
        <Counter />
      </kit.TKPage>,
    );
    const baseline = renders;
    const scroller = container.querySelector<HTMLElement>("[data-tk-page-scroll]")!;
    act(() => {
      Object.defineProperty(scroller, "scrollTop", { value: 120, configurable: true });
      fireEvent.scroll(scroller);
    });
    expect(renders).toBe(baseline);
  });
});
