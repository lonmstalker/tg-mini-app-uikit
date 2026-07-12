import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import * as kit from "../src/index";

/* M3 cross-cutting a11y sweep — locks the per-family role / aria-live / 44px fixes. */

/* ---------------- CC-04 group semantics ---------------- */

describe("BTN-002 InlineButtons single-select group", () => {
  const items = [
    { id: "a", label: "A" },
    { id: "b", label: "B" },
    { id: "c", label: "C" },
  ];

  it("exposes a named radiogroup of radios with aria-checked (no aria-pressed)", () => {
    render(<kit.TKInlineButtons ariaLabel="View" items={items} defaultValue="a" />);
    expect(screen.getByRole("radiogroup", { name: "View" })).toBeInTheDocument();
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(3);
    expect(radios[0]).toHaveAttribute("aria-checked", "true");
    expect(radios[1]).toHaveAttribute("aria-checked", "false");
    expect(radios[0]).not.toHaveAttribute("aria-pressed");
  });

  it("arrow key selects (selection follows focus)", () => {
    const onChange = vi.fn();
    render(<kit.TKInlineButtons ariaLabel="View" items={items} defaultValue="a" onChange={onChange} />);
    const radios = screen.getAllByRole("radio");
    radios[0].focus();
    fireEvent.keyDown(radios[0], { key: "ArrowRight" });
    expect(onChange).toHaveBeenLastCalledWith("b");
  });

  it("multiple keeps group + aria-pressed toggles", () => {
    render(<kit.TKInlineButtons multiple ariaLabel="Filters" items={items} defaultValue="a" />);
    expect(screen.getByRole("group", { name: "Filters" })).toBeInTheDocument();
    expect(screen.queryByRole("radio")).toBeNull();
    expect(screen.getAllByRole("button")[0]).toHaveAttribute("aria-pressed", "true");
  });
});

describe("NAV-002 Segmented single-select radiogroup", () => {
  it("exposes a named radiogroup of radios with one checked", () => {
    render(<kit.TKSegmented ariaLabel="Range" options={["D", "W", "M"]} defaultValue="D" />);
    expect(screen.getByRole("radiogroup", { name: "Range" })).toBeInTheDocument();
    const radios = screen.getAllByRole("radio");
    expect(radios.filter((r) => r.getAttribute("aria-checked") === "true")).toHaveLength(1);
    expect(radios[0]).not.toHaveAttribute("aria-pressed");
  });

  it("arrow key moves the checked state", () => {
    const onChange = vi.fn();
    render(<kit.TKSegmented options={["D", "W", "M"]} defaultValue="D" onChange={onChange} />);
    const radios = screen.getAllByRole("radio");
    radios[0].focus();
    fireEvent.keyDown(radios[0], { key: "ArrowRight" });
    expect(onChange).toHaveBeenLastCalledWith("W");
    expect(screen.getAllByRole("radio")[1]).toHaveAttribute("aria-checked", "true");
  });
});

describe("CTL-001 Rating radiogroup with keyboard half-values", () => {
  it("exposes radios with aria-checked and a single tab stop", () => {
    render(<kit.TKRating max={5} defaultValue={2} />);
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(5);
    expect(radios[1]).toHaveAttribute("aria-checked", "true");
    expect(radios.map((r) => r.tabIndex)).toEqual([-1, 0, -1, -1, -1]);
  });

  it("arrow keys reach whole and (with Shift) half values", () => {
    const onChange = vi.fn();
    render(<kit.TKRating max={5} defaultValue={2} allowHalf onChange={onChange} />);
    const radios = screen.getAllByRole("radio");
    radios[1].focus();
    fireEvent.keyDown(radios[1], { key: "ArrowRight" });
    expect(onChange).toHaveBeenLastCalledWith(3);
    fireEvent.keyDown(screen.getAllByRole("radio")[2], { key: "ArrowLeft" });
    expect(onChange).toHaveBeenLastCalledWith(2);
    fireEvent.keyDown(screen.getAllByRole("radio")[1], { key: "ArrowRight", shiftKey: true });
    expect(onChange).toHaveBeenLastCalledWith(2.5);
  });

  it("Home/End reach the bounds", () => {
    const onChange = vi.fn();
    render(<kit.TKRating max={5} defaultValue={3} onChange={onChange} />);
    const radios = screen.getAllByRole("radio");
    radios[2].focus();
    fireEvent.keyDown(radios[2], { key: "End" });
    expect(onChange).toHaveBeenLastCalledWith(5);
    fireEvent.keyDown(screen.getAllByRole("radio")[4], { key: "Home" });
    expect(onChange).toHaveBeenLastCalledWith(1);
  });
});

/* ---------------- CC-07 disabled anchors ---------------- */

describe("BTN-001 disabled polymorphic TKButton anchor is inert", () => {
  it("drops href, leaves tab order, swallows activation", () => {
    const onClick = vi.fn();
    render(
      <kit.TKButton as="a" href="#go" disabled onClick={onClick} testId="b">
        Pay
      </kit.TKButton>,
    );
    const el = screen.getByTestId("b");
    expect(el.hasAttribute("href")).toBe(false);
    expect(el.tabIndex).toBe(-1);
    expect(el).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(el);
    fireEvent.keyDown(el, { key: "Enter" });
    expect(onClick).not.toHaveBeenCalled();
  });

  it("a loading anchor is also inert", () => {
    const onClick = vi.fn();
    render(
      <kit.TKButton as="a" href="#go" loading onClick={onClick} testId="b">
        Pay
      </kit.TKButton>,
    );
    const el = screen.getByTestId("b");
    expect(el.hasAttribute("href")).toBe(false);
    fireEvent.click(el);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("a normal disabled button keeps the native disabled attribute", () => {
    render(
      <kit.TKButton disabled testId="b">
        Pay
      </kit.TKButton>,
    );
    expect(screen.getByTestId("b")).toBeDisabled();
  });
});

/* ---------------- CC-03 touch targets (assert applied min style, jsdom has no layout) ---------------- */

describe("CC-03 44px touch targets", () => {
  const has44 = (el: HTMLElement, axis: "minWidth" | "minHeight") => expect(el.style[axis]).toBe("44px");

  it("BTN-004 IconButton", () => {
    render(<kit.TKIconButton icon="close" label="Close" testId="ib" />);
    const el = screen.getByTestId("ib");
    has44(el, "minWidth");
    has44(el, "minHeight");
  });

  it("BTN-004 InlineButtons radio", () => {
    render(<kit.TKInlineButtons ariaLabel="V" items={[{ id: "a", label: "A" }]} />);
    expect(screen.getByRole("radio").style.minHeight).toBe("44px");
  });

  it("CTL-004 bare Switch", () => {
    render(<kit.TKSwitch ariaLabel="Sound" testId="sw" />);
    has44(screen.getByTestId("sw"), "minHeight");
  });

  it("CTL-004 Rating star", () => {
    render(<kit.TKRating max={3} defaultValue={1} />);
    has44(screen.getAllByRole("radio")[0], "minHeight");
  });

  it("CTL-004 Stepper buttons", () => {
    render(<kit.TKStepper defaultValue={1} />);
    has44(screen.getByRole("button", { name: /increase|increment|\+/i }), "minHeight");
  });

  it("CRD-003 CardChip", () => {
    render(<kit.TKCardChip onClick={() => {}}>Filter</kit.TKCardChip>);
    has44(screen.getByRole("button", { name: "Filter" }), "minHeight");
  });

  it("INP-009 clear button keeps a small glyph but a 44px hit area", () => {
    render(<kit.TKInput defaultValue="hi" label="Name" />);
    const clear = screen.getByRole("button", { name: /clear/i });
    has44(clear, "minWidth");
    has44(clear, "minHeight");
  });
});

/* ---------------- CC-05 live regions ---------------- */

describe("CC-05 async/loading is announced", () => {
  it("FBK-001 AsyncBoundary loading exposes a busy status, success clears it", () => {
    const { rerender } = render(
      <kit.AsyncBoundary loading>
        <div>content</div>
      </kit.AsyncBoundary>,
    );
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveAttribute("aria-busy", "true");
    expect(status.textContent).toContain("Loading");
    rerender(
      <kit.AsyncBoundary loading={false}>
        <div>content</div>
      </kit.AsyncBoundary>,
    );
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("FBK-001 error surfaces an alert", () => {
    render(
      <kit.AsyncBoundary error onRetry={() => {}}>
        <div>content</div>
      </kit.AsyncBoundary>,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("LST-004 InfiniteList announces loading and sets aria-busy", () => {
    render(
      <kit.TKInfiniteList hasMore loading testId="list" onLoadMore={() => {}}>
        <div>row</div>
      </kit.TKInfiniteList>,
    );
    expect(screen.getByTestId("list")).toHaveAttribute("aria-busy", "true");
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status.textContent).toContain("Loading");
  });

  it("FRM-004 PIN announces progress and errors", () => {
    const { rerender } = render(<kit.TKPinInput length={4} />);
    // the hidden one-time-code <input> (role textbox) drives the value
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "12" } });
    expect(screen.getByRole("status").textContent).toMatch(/2/);
    rerender(<kit.TKPinInput length={4} error />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
