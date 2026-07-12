import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { TKTappable, useTKBusyAnnounce, type TKBusyState } from "../src/index";
import { useRovingFocus } from "../src/internal/roving";

/* M3 shared a11y primitives: minTarget (A1), useTKBusyAnnounce (A2),
 * useRovingFocus (A3), disabled-anchor inert (A4). */

/* ---------------- A1 · minTarget ---------------- */

describe("A1 minTarget — 44px hit area on TKTappable", () => {
  it("injects 44px on both axes by default and centers content", () => {
    render(<TKTappable testId="t">x</TKTappable>);
    const el = screen.getByTestId("t");
    expect(el.style.minWidth).toBe("44px");
    expect(el.style.minHeight).toBe("44px");
    expect(el.style.display).toBe("inline-flex");
    expect(el.style.alignItems).toBe("center");
    expect(el.style.justifyContent).toBe("center");
  });

  it("opts out with minTarget={false}", () => {
    render(
      <TKTappable minTarget={false} testId="t">
        x
      </TKTappable>,
    );
    const el = screen.getByTestId("t");
    expect(el.style.minWidth).toBe("");
    expect(el.style.minHeight).toBe("");
  });

  it("accepts a numeric override", () => {
    render(
      <TKTappable minTarget={56} testId="t">
        x
      </TKTappable>,
    );
    const el = screen.getByTestId("t");
    expect(el.style.minWidth).toBe("56px");
    expect(el.style.minHeight).toBe("56px");
  });

  it("lets a consumer style override a single axis", () => {
    render(
      <TKTappable testId="t" style={{ minWidth: 60 }}>
        x
      </TKTappable>,
    );
    const el = screen.getByTestId("t");
    expect(el.style.minWidth).toBe("60px");
    expect(el.style.minHeight).toBe("44px");
  });
});

/* ---------------- A4 · disabled anchor inert ---------------- */

describe("A4 disabled polymorphic anchor is inert (CC-07)", () => {
  it("drops href, leaves the tab order, swallows activation", () => {
    const onClick = vi.fn();
    render(
      <TKTappable as="a" href="#go" disabled onClick={onClick} testId="a">
        link
      </TKTappable>,
    );
    const el = screen.getByTestId("a");
    expect(el.hasAttribute("href")).toBe(false);
    expect(el.tabIndex).toBe(-1);
    expect(el.getAttribute("aria-disabled")).toBe("true");
    expect(el.style.pointerEvents).toBe("none");
    fireEvent.click(el);
    fireEvent.keyDown(el, { key: "Enter" });
    fireEvent.keyDown(el, { key: " " });
    expect(onClick).not.toHaveBeenCalled();
  });

  it("leaves an enabled anchor fully operable", () => {
    const onClick = vi.fn();
    render(
      <TKTappable as="a" href="#go" onClick={onClick} testId="a">
        link
      </TKTappable>,
    );
    const el = screen.getByTestId("a");
    expect(el.getAttribute("href")).toBe("#go");
    expect(el.tabIndex).not.toBe(-1);
    fireEvent.click(el);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

/* ---------------- A2 · useTKBusyAnnounce ---------------- */

function BusyProbe({ state, opts }: { state: TKBusyState; opts?: Parameters<typeof useTKBusyAnnounce>[1] }) {
  return <div>{useTKBusyAnnounce(state, opts)}</div>;
}

describe("A2 useTKBusyAnnounce — owned aria-live region", () => {
  it("renders an empty polite status region at rest", () => {
    render(<BusyProbe state="idle" />);
    const status = screen.getByRole("status");
    expect(status.getAttribute("aria-live")).toBe("polite");
    expect(status.textContent).toBe("");
  });

  it("announces loading and done text", () => {
    const { rerender } = render(<BusyProbe state="loading" />);
    expect(screen.getByRole("status").textContent).toBe("Loading…");
    rerender(<BusyProbe state="done" />);
    expect(screen.getByRole("status").textContent).toBe("Done");
  });

  it("custom strings override and empty suppresses", () => {
    const { rerender } = render(<BusyProbe state="loading" opts={{ loadingText: "Saving" }} />);
    expect(screen.getByRole("status").textContent).toBe("Saving");
    rerender(<BusyProbe state="loading" opts={{ loadingText: "" }} />);
    expect(screen.getByRole("status").textContent).toBe("");
  });

  it("escalates errors to an assertive alert", () => {
    render(<BusyProbe state="error" opts={{ errorText: "Failed" }} />);
    expect(screen.getByRole("alert").textContent).toBe("Failed");
  });

  it("is visually hidden", () => {
    render(<BusyProbe state="loading" />);
    const status = screen.getByRole("status");
    expect(status.style.position).toBe("absolute");
    expect(status.style.width).toBe("1px");
  });
});

/* ---------------- A3 · useRovingFocus ---------------- */

function Roving({
  count,
  selectedIndex,
  orientation,
  isDisabled,
  onNavigate,
}: {
  count: number;
  selectedIndex?: number;
  orientation?: "horizontal" | "vertical" | "both";
  isDisabled?: (i: number) => boolean;
  onNavigate?: (i: number) => void;
}) {
  const roving = useRovingFocus({ count, selectedIndex, orientation, isDisabled, onNavigate });
  return (
    <div>
      {Array.from({ length: count }, (_, i) => {
        const { ref, tabIndex, onKeyDown } = roving.getItemProps(i);
        return (
          <button key={i} type="button" ref={ref as never} tabIndex={tabIndex} onKeyDown={onKeyDown} data-testid={`r-${i}`}>
            {i}
          </button>
        );
      })}
    </div>
  );
}

describe("A3 useRovingFocus", () => {
  it("seeds the single tab stop on the selected index", () => {
    render(<Roving count={3} selectedIndex={1} />);
    expect(screen.getByTestId("r-0").tabIndex).toBe(-1);
    expect(screen.getByTestId("r-1").tabIndex).toBe(0);
    expect(screen.getByTestId("r-2").tabIndex).toBe(-1);
  });

  it("arrow moves focus and notifies, skipping disabled", () => {
    const onNavigate = vi.fn();
    render(<Roving count={3} selectedIndex={0} orientation="horizontal" isDisabled={(i) => i === 1} onNavigate={onNavigate} />);
    const first = screen.getByTestId("r-0");
    first.focus();
    fireEvent.keyDown(first, { key: "ArrowRight" });
    expect(document.activeElement).toBe(screen.getByTestId("r-2")); // skipped disabled 1
    expect(onNavigate).toHaveBeenCalledWith(2);
  });

  it("ignores cross-axis keys for the orientation", () => {
    const onNavigate = vi.fn();
    render(<Roving count={3} orientation="horizontal" onNavigate={onNavigate} />);
    const first = screen.getByTestId("r-0");
    first.focus();
    fireEvent.keyDown(first, { key: "ArrowDown" });
    expect(document.activeElement).toBe(first);
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it("re-syncs the tab stop when count shrinks below the selected index", () => {
    function Shrinking() {
      const [count, setCount] = useState(5);
      return (
        <div>
          <button type="button" onClick={() => setCount(3)}>
            shrink
          </button>
          <Roving count={count} selectedIndex={4} />
        </div>
      );
    }
    render(<Shrinking />);
    act(() => screen.getByText("shrink").click());
    // selected index 4 is now out of range -> tab stop falls back to a valid index
    expect(screen.getByTestId("r-0").tabIndex).toBe(0);
  });
});
