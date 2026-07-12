import { useRef } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as kit from "../src/index";

/* M7 composite-correctness P0 subset: OVL-001 toast bound, GES-007 (in m3-gestures),
 * NAV2-001 focus, NAV2-003 .tk scope, ONB-004 blackout, CHT-004 IME, CHT-001 a11y name. */

/* ---------------- OVL-001 — toast max bounds the stack ---------------- */

describe("OVL-001 TKToastProvider max bounds the stack", () => {
  function Burst({ n }: { n: number }) {
    const toast = kit.useTKToast();
    return (
      <button type="button" onClick={() => Array.from({ length: n }, (_, i) => toast.show({ text: `t${i}` }))}>
        burst
      </button>
    );
  }

  it("max={1} keeps exactly one toast (was: slice(-0) kept all)", () => {
    render(
      <kit.TKToastProvider max={1} duration={60000}>
        <Burst n={3} />
      </kit.TKToastProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "burst" }));
    expect(document.querySelectorAll('[role="status"], [role="alert"]')).toHaveLength(1);
    expect(screen.getByText("t2")).toBeInTheDocument(); // the latest
  });
});

/* ---------------- NAV2-003 — nav root self-applies .tk ---------------- */

describe("NAV2-003 TKNavStack root carries the .tk scope", () => {
  it("has the tk class even without a TKProvider ancestor", () => {
    render(
      <kit.TKNavStack initial="a" testId="nav">
        <kit.TKNavPanel id="a">
          <div>A</div>
        </kit.TKNavPanel>
      </kit.TKNavStack>,
    );
    expect(screen.getByTestId("nav").classList.contains("tk")).toBe(true);
  });
});

/* ---------------- NAV2-001 — push moves focus into the new panel ---------------- */

describe("NAV2-001 nav push moves focus into the new top panel", () => {
  function Home() {
    const nav = kit.useNav();
    return (
      <button type="button" onClick={() => nav.push("detail")}>
        open
      </button>
    );
  }

  it("focuses the detail panel region after push", () => {
    render(
      <kit.TKNavStack initial="home" testId="nav">
        <kit.TKNavPanel id="home">
          <Home />
        </kit.TKNavPanel>
        <kit.TKNavPanel id="detail">
          <div>Detail</div>
        </kit.TKNavPanel>
      </kit.TKNavStack>,
    );
    fireEvent.click(screen.getByRole("button", { name: "open" }));
    const detail = screen.getByTestId("nav").querySelector('[data-tk-nav-panel="detail"]');
    expect(detail).not.toBeNull();
    expect(document.activeElement).toBe(detail);
    expect((detail as HTMLElement).getAttribute("role")).toBe("region");
  });
});

/* ---------------- ONB-004 — null target does not blackout ---------------- */

describe("ONB-004 onboarding null target does not opaque-blackout the screen", () => {
  it("renders no full-screen solid scrim when the target ref is null", () => {
    function Tour() {
      const missing = useRef<HTMLElement>(null); // never attached
      return <kit.TKOnboardingTooltip steps={[{ target: missing, title: "Hi", text: "x" }]} testId="tour" />;
    }
    const { container } = render(
      <kit.TKProvider>
        <Tour />
      </kit.TKProvider>,
    );
    // No fixed, inset:0 element painting the scrim background (the old blackout).
    const fixedFull = [...container.querySelectorAll<HTMLElement>("div[style]")].filter(
      (d) => d.style.position === "fixed" && d.style.inset === "0px" && d.style.background.includes("--tk-scrim"),
    );
    expect(fixedFull).toHaveLength(0);
    // …but the step must still be escapable: the bubble (title + Next) renders so
    // the user can advance/finish instead of being stranded on a dead screen.
    expect(screen.getByText("Hi")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /next|done/i })).toBeInTheDocument();
  });
});

/* ---------------- CHT-004 / CHT-001 — write bar IME + accessible name ---------------- */

describe("CHT-004 WriteBar ignores Enter during IME composition", () => {
  it("does not send while composing, sends after", () => {
    const onSend = vi.fn();
    render(<kit.TKWriteBar onSend={onSend} placeholder="Message" />);
    const area = screen.getByRole("textbox");
    fireEvent.change(area, { target: { value: "привет" } });
    fireEvent.keyDown(area, { key: "Enter", isComposing: true });
    expect(onSend).not.toHaveBeenCalled();
    fireEvent.keyDown(area, { key: "Enter" });
    expect(onSend).toHaveBeenCalledWith("привет");
  });
});

describe("CHT-001 WriteBar textarea always has an accessible name", () => {
  it("falls back to a localized name with no placeholder", () => {
    render(<kit.TKWriteBar onSend={() => {}} />);
    expect(screen.getByRole("textbox").getAttribute("aria-label")).toBeTruthy();
  });
});

/* ---------------- CHT-003 — bubble wraps long text ---------------- */

describe("CHT-003 TKMessageBubble wraps long unbroken text", () => {
  it("sets overflow-wrap:anywhere and min-width:0 on the bubble", () => {
    render(<kit.TKMessageBubble text={"x".repeat(200)} testId="bub" />);
    const inner = screen.getByTestId("bub").querySelector<HTMLElement>("div");
    expect(inner!.style.overflowWrap).toBe("anywhere");
    expect(inner!.style.minWidth).toBe("0px");
  });
});

/* ---------------- CRS-005 / NAV2-002 — live regions ---------------- */

describe("CRS-005 carousel announces the current slide", () => {
  it("renders a polite status region with the page position", () => {
    render(
      <kit.TKGallery testId="g">
        <div>1</div>
        <div>2</div>
        <div>3</div>
      </kit.TKGallery>,
    );
    const status = screen.getByTestId("g").querySelector('[role="status"][aria-live="polite"]');
    expect(status?.textContent).toBe("Slide 1 of 3");
  });
});

describe("NAV2-002 nav names the active screen with a human label (no double-announce)", () => {
  it("exposes the panel label as the region landmark and adds no separate live-region", () => {
    render(
      <kit.TKNavStack initial="home" testId="nav">
        <kit.TKNavPanel id="home" label="Home screen">
          <div>H</div>
        </kit.TKNavPanel>
      </kit.TKNavStack>,
    );
    const root = screen.getByTestId("nav");
    // Focusing the named region IS the announcement, so there must be no extra
    // role=status duplicating it (NAV2-002).
    expect(root.querySelector('[role="status"]')).toBeNull();
    const region = root.querySelector('[data-tk-nav-panel="home"]');
    expect(region?.getAttribute("role")).toBe("region");
    expect(region?.getAttribute("aria-label")).toBe("Home screen");
  });
});

/* ---------------- GES-011 — PTR no setState after unmount ---------------- */

describe("GES-011 TKPullToRefresh does not setState after unmount", () => {
  afterEach(() => vi.restoreAllMocks());

  it("skips the post-refresh setState when unmounted mid-flight", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    let resolve!: () => void;
    const onRefresh = vi.fn(() => new Promise<void>((r) => (resolve = r)));
    const { unmount } = render(
      <kit.TKPullToRefresh onRefresh={onRefresh} testId="ptr">
        <div style={{ height: 300 }}>content</div>
      </kit.TKPullToRefresh>,
    );
    const area = screen.getByTestId("ptr");
    fireEvent.pointerDown(area, { pointerId: 1, clientY: 50 });
    fireEvent.pointerMove(area, { pointerId: 1, clientY: 260 });
    fireEvent.pointerUp(area, { pointerId: 1, clientY: 260 });
    expect(onRefresh).toHaveBeenCalledOnce();
    unmount();
    await act(async () => {
      resolve();
    });
    expect(errorSpy.mock.calls.flat().join(" ")).not.toMatch(/unmounted|not wrapped in act/i);
  });
});
