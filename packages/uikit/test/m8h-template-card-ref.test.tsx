import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import * as kit from "../src/index";

/* M8-H — TCRD-010/CC-13: template cards forward ref + className + native props. */

describe("TCRD-010 template cards expose ref + className", () => {
  it("[D-API] TKProductCardA (merges with its press class)", () => {
    const ref = createRef<HTMLDivElement>();
    render(<kit.TKProductCardA ref={ref} title="P" price="$1" onClick={() => {}} className="mine" data-x="1" testId="a" />);
    const el = screen.getByTestId("a");
    expect(ref.current).toBe(el);
    expect(el.classList.contains("tk-press")).toBe(true); // press class present on a clickable card
    expect(el.classList.contains("mine")).toBe(true);
    expect(el.getAttribute("data-x")).toBe("1");
  });

  it("[D-API] TKProductCardB", () => {
    const ref = createRef<HTMLDivElement>();
    render(<kit.TKProductCardB ref={ref} title="P" price="$1" className="b" testId="b" />);
    expect(ref.current).toBe(screen.getByTestId("b"));
    expect(screen.getByTestId("b").classList.contains("b")).toBe(true);
  });

  it("[D-API] TKBannerCard", () => {
    const ref = createRef<HTMLDivElement>();
    render(<kit.TKBannerCard ref={ref} title="Hi" text="t" className="bn" testId="bn" />);
    expect(ref.current).toBe(screen.getByTestId("bn"));
    expect(screen.getByTestId("bn").classList.contains("bn")).toBe(true);
  });

  it("[D-API] TKBookingCard", () => {
    const ref = createRef<HTMLDivElement>();
    render(<kit.TKBookingCard ref={ref} name="Meeting" className="bk" testId="bk" />);
    expect(ref.current).toBe(screen.getByTestId("bk"));
    expect(screen.getByTestId("bk").classList.contains("bk")).toBe(true);
  });

  it("[D-API] TKStatTile", () => {
    const ref = createRef<HTMLDivElement>();
    render(<kit.TKStatTile ref={ref} label="Users" value="1.2k" className="st" data-z="9" testId="st" />);
    const el = screen.getByTestId("st");
    expect(ref.current).toBe(el);
    expect(el.classList.contains("st")).toBe(true);
    expect(el.getAttribute("data-z")).toBe("9");
  });
});
