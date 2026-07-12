import { useEffect, useState } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TKNavPanel, TKNavStack, useNav } from "../src";

/* NAV exit animation + tk-nav-in settled-guard (phase-2 audit fixes). */

function Nav({ id }: { id: string }) {
  const nav = useNav();
  return (
    <>
      <button type="button" onClick={() => nav.push(`${id}-next`)}>
        push-{id}
      </button>
      <button type="button" onClick={() => nav.pop()}>
        pop-{id}
      </button>
    </>
  );
}

function stackOf(a: string, b: string) {
  return (
    <TKNavStack initial={a} testId="nav">
      <TKNavPanel id={a} label={a}>
        <Nav id={a} />
      </TKNavPanel>
      <TKNavPanel id={b} label={b}>
        <Nav id={b} />
      </TKNavPanel>
    </TKNavStack>
  );
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  // stubGlobal (matchMedia in the reduced-motion test) is NOT undone by
  // restoreAllMocks — without this every later test runs "reduced motion".
  vi.unstubAllGlobals();
});

const exitEl = () => screen.getByTestId("nav").querySelector<HTMLElement>("[data-tk-nav-exit]");

// jsdom has no AnimationEvent and fireEvent.animationEnd drops animationName —
// dispatch a hand-built event instead.
function fireAnimationEnd(el: HTMLElement, animationName: string) {
  const ev = new Event("animationend", { bubbles: true }) as Event & { animationName?: string };
  ev.animationName = animationName;
  act(() => {
    el.dispatchEvent(ev);
  });
}

describe("NAV exit animation on pop", () => {
  it("keeps the departed panel in the DOM during the slide and removes it on animationend", () => {
    render(stackOf("home", "home-next"));
    fireEvent.click(screen.getByText("push-home"));
    fireEvent.click(screen.getByText("pop-home-next"));
    const exit = exitEl();
    expect(exit).not.toBeNull();
    expect(exit!.dataset.tkNavExit).toBe("home-next");
    expect(exit!.getAttribute("aria-hidden")).toBe("true");
    expect(exit!.style.pointerEvents).toBe("none");
    expect(exit!.style.animation).toContain("tk-nav-out");
    fireAnimationEnd(exit!, "tk-nav-out");
    expect(exitEl()).toBeNull();
  });

  it("fallback timer removes the panel when animationend never fires (WKWebView in background)", () => {
    vi.useFakeTimers();
    render(stackOf("home", "home-next"));
    fireEvent.click(screen.getByText("push-home"));
    fireEvent.click(screen.getByText("pop-home-next"));
    expect(exitEl()).not.toBeNull();
    act(() => {
      vi.advanceTimersByTime(260 + 80 + 10);
    });
    expect(exitEl()).toBeNull();
  });

  it("prefers-reduced-motion removes the panel synchronously (no exit layer)", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn((q: string) => ({
        matches: q.includes("prefers-reduced-motion"),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
    render(stackOf("home", "home-next"));
    fireEvent.click(screen.getByText("push-home"));
    fireEvent.click(screen.getByText("pop-home-next"));
    expect(exitEl()).toBeNull();
    expect(screen.getByTestId("nav").querySelectorAll("[data-tk-nav-panel]")).toHaveLength(1);
  });

  it("keeps the focus contract: the revealed panel receives focus after pop", () => {
    render(stackOf("home", "home-next"));
    fireEvent.click(screen.getByText("push-home"));
    fireEvent.click(screen.getByText("pop-home-next"));
    const topPanel = screen.getByTestId("nav").querySelector('[data-tk-nav-panel="home"]');
    expect(document.activeElement).toBe(topPanel);
  });
});

describe("NAV exit layer preserves the dying panel's subtree", () => {
  it("input state and mount effects survive the pop into the exit layer", () => {
    const mounted = { count: 0 };
    function Root() {
      const nav = useNav();
      return (
        <button type="button" onClick={() => nav.push("form")}>
          open-form
        </button>
      );
    }
    function Form() {
      const nav = useNav();
      const [value, setValue] = useState("");
      useEffect(() => {
        mounted.count += 1;
      }, []);
      return (
        <>
          <input aria-label="field" value={value} onChange={(e) => setValue(e.target.value)} />
          <button type="button" onClick={() => nav.pop()}>
            pop-form
          </button>
        </>
      );
    }
    render(
      <TKNavStack initial="home" testId="nav">
        <TKNavPanel id="home" label="home">
          <Root />
        </TKNavPanel>
        <TKNavPanel id="form" label="form">
          <Form />
        </TKNavPanel>
      </TKNavStack>,
    );
    fireEvent.click(screen.getByText("open-form"));
    const field = screen.getByLabelText("field") as HTMLInputElement;
    fireEvent.change(field, { target: { value: "typed" } });
    expect(field.value).toBe("typed");
    expect(mounted.count).toBe(1);
    fireEvent.click(screen.getByText("pop-form"));
    // The panel is sliding out: its DOM must be the SAME subtree — typed value
    // still there, mount effect NOT re-run for a screen dying in 260ms.
    const exit = exitEl();
    expect(exit).not.toBeNull();
    const exitField = exit!.querySelector("input") as HTMLInputElement;
    expect(exitField.value).toBe("typed");
    expect(mounted.count).toBe(1);
    fireAnimationEnd(exit!, "tk-nav-out");
    expect(exitEl()).toBeNull();
    expect(mounted.count).toBe(1); // cycle push→pop: exactly one mount, ever
  });
});

describe("NAV tk-nav-in settled-guard", () => {
  it("clears the entrance animation after animationend and never re-applies it", () => {
    const { rerender } = render(stackOf("home", "home-next"));
    fireEvent.click(screen.getByText("push-home"));
    const panel = () => screen.getByTestId("nav").querySelector<HTMLElement>('[data-tk-nav-panel="home-next"]')!;
    expect(panel().style.animation).toContain("tk-nav-in");
    fireAnimationEnd(panel(), "tk-nav-in");
    expect(panel().style.animation).toBe("");
    rerender(stackOf("home", "home-next"));
    expect(panel().style.animation).toBe(""); // a later render must not bring it back
  });

  it("a newly pushed panel still gets the entrance animation", () => {
    render(stackOf("home", "home-next"));
    fireEvent.click(screen.getByText("push-home"));
    const panel = screen.getByTestId("nav").querySelector<HTMLElement>('[data-tk-nav-panel="home-next"]')!;
    fireAnimationEnd(panel, "tk-nav-in");
    fireEvent.click(screen.getByText("pop-home-next"));
    fireEvent.click(screen.getByText("push-home"));
    const again = screen.getByTestId("nav").querySelector<HTMLElement>('[data-tk-nav-panel="home-next"]')!;
    expect(again.style.animation).toContain("tk-nav-in");
  });
});
