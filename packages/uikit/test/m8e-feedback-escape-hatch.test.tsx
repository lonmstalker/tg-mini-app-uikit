import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import * as kit from "../src/index";

/* M8-E — FBK-011/CC-13: feedback display components forward ref + className + native props. */

describe("FBK-011 feedback components expose the escape hatch", () => {
  it("[D-API] TKProgress (keeps its progressbar role)", () => {
    const ref = createRef<HTMLDivElement>();
    render(<kit.TKProgress ref={ref} value={50} className="p" data-x="1" testId="pr" />);
    const el = screen.getByTestId("pr");
    expect(ref.current).toBe(el);
    expect(el.classList.contains("p")).toBe(true);
    expect(el.getAttribute("data-x")).toBe("1");
    expect(el.getAttribute("role")).toBe("progressbar");
    expect(el.getAttribute("aria-valuenow")).toBe("50");
  });

  it("[D-API] TKRing", () => {
    const ref = createRef<HTMLDivElement>();
    render(<kit.TKRing ref={ref} value={0.5} className="r" testId="rg" />);
    const el = screen.getByTestId("rg");
    expect(ref.current).toBe(el);
    expect(el.classList.contains("r")).toBe(true);
    expect(el.getAttribute("role")).toBe("progressbar");
  });

  it("[D-API] TKEmptyState", () => {
    const ref = createRef<HTMLDivElement>();
    render(<kit.TKEmptyState ref={ref} title="Empty" className="e" data-y="2" testId="es" />);
    const el = screen.getByTestId("es");
    expect(ref.current).toBe(el);
    expect(el.classList.contains("e")).toBe(true);
    expect(el.getAttribute("data-y")).toBe("2");
  });

  it("[D-API] TKBars", () => {
    const ref = createRef<HTMLDivElement>();
    render(<kit.TKBars ref={ref} data={[1, 2, 3]} className="b" testId="bars" />);
    const el = screen.getByTestId("bars");
    expect(ref.current).toBe(el);
    expect(el.classList.contains("b")).toBe(true);
  });

  it("[D-API] TKTimeline", () => {
    const ref = createRef<HTMLDivElement>();
    render(<kit.TKTimeline ref={ref} steps={[{ label: "a", status: "done" }]} className="t" testId="tl" />);
    const el = screen.getByTestId("tl");
    expect(ref.current).toBe(el);
    expect(el.classList.contains("t")).toBe(true);
  });

  it("[D-API] TKSkeleton / TKSkeletonText merge className with tk-skel and forward ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<kit.TKSkeleton ref={ref} className="mine" testId="sk" />);
    const el = screen.getByTestId("sk");
    expect(ref.current).toBe(el);
    expect(el.classList.contains("tk-skel")).toBe(true);
    expect(el.classList.contains("mine")).toBe(true);

    const ref2 = createRef<HTMLDivElement>();
    render(<kit.TKSkeletonText ref={ref2} className="txt" testId="skt" />);
    expect(ref2.current).toBe(screen.getByTestId("skt"));
    expect(screen.getByTestId("skt").classList.contains("txt")).toBe(true);
  });
});
