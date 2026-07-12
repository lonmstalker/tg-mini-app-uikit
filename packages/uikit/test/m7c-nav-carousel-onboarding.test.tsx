import { useRef, useState } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as kit from "../src/index";

/* M7-C — carousel geometry/resize/guard (CRS-001/003/004), nav double-push
 * (NAV2-009), onboarding dismiss/a11y/state (ONB-001/002/003). */

const track = (testId: string) => screen.getByTestId(testId).querySelector("[tabindex='0']") as HTMLDivElement;
const slides = (n: number) => Array.from({ length: n }, (_, i) => <div key={i}>{i}</div>);

/* ---------------- CRS-001 — gap-aware snap stride ---------------- */

describe("CRS-001 carousel snap stride includes the gap", () => {
  it("[D-GESTURE] dot tap scrolls to index*(clientWidth+gap)", () => {
    render(
      <kit.TKGallery testId="g" gap={10} height={120}>
        {slides(5)}
      </kit.TKGallery>,
    );
    const el = track("g");
    Object.defineProperty(el, "clientWidth", { value: 200, configurable: true });
    const scrollTo = vi.fn();
    Object.defineProperty(el, "scrollTo", { value: scrollTo, configurable: true });
    fireEvent.click(screen.getByRole("button", { name: "Page 5" }));
    expect(scrollTo).toHaveBeenCalledWith({ left: 4 * (200 + 10), behavior: "smooth" });
  });
});

/* ---------------- CRS-003 — resize re-aligns the current slide ---------------- */

describe("CRS-003 carousel re-centers the current slide on resize", () => {
  it("[D-TG] window resize re-scrolls to page*stride (behavior auto)", () => {
    render(
      <kit.TKGallery testId="g" gap={10} height={120} defaultPage={2}>
        {slides(5)}
      </kit.TKGallery>,
    );
    const el = track("g");
    Object.defineProperty(el, "clientWidth", { value: 300, configurable: true });
    const scrollTo = vi.fn();
    Object.defineProperty(el, "scrollTo", { value: scrollTo, configurable: true });
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });
    expect(scrollTo).toHaveBeenCalledWith({ left: 2 * (300 + 10), behavior: "auto" });
  });
});

/* ---------------- CRS-004 — programmatic guard self-clears ---------------- */

describe("CRS-004 carousel programmatic-scroll guard cannot latch", () => {
  afterEach(() => vi.useRealTimers());

  it("[D-GESTURE] a later user scroll still reports after an interrupted animation", () => {
    vi.useFakeTimers();
    const onPageChange = vi.fn();
    render(
      <kit.TKGallery testId="g" gap={10} height={120} onPageChange={onPageChange}>
        {slides(3)}
      </kit.TKGallery>,
    );
    const el = track("g");
    Object.defineProperty(el, "clientWidth", { value: 100, configurable: true });
    Object.defineProperty(el, "scrollTo", { value: vi.fn(), configurable: true });
    Object.defineProperty(el, "scrollLeft", { value: 0, configurable: true });
    // dot tap to page 2 (index 1) arms the guard for a smooth scroll that never
    // produces the exact target frame
    fireEvent.click(screen.getByRole("button", { name: "Page 2" }));
    onPageChange.mockClear();
    // a non-matching scroll is swallowed while the guard is armed
    fireEvent.scroll(el);
    expect(onPageChange).not.toHaveBeenCalled();
    // guard self-clears after the settle window…
    act(() => vi.advanceTimersByTime(400));
    // …so the next user scroll reports the page again (index 0 here)
    fireEvent.scroll(el);
    expect(onPageChange).toHaveBeenCalledWith(0);
  });
});

/* ---------------- NAV2-009 — rapid double-push dedup ---------------- */

describe("NAV2-009 nav dedups a rapid double-push", () => {
  // Two clicks across separate commits (the real laggy-WebView double-tap): without
  // the guard the second would stack a duplicate.
  it("[D-EDGE] a repeated same-panel push within the window adds a single entry", () => {
    const stacks: string[][] = [];
    function Home() {
      const nav = kit.useNav();
      return (
        <button type="button" onClick={() => nav.push("detail")}>
          go
        </button>
      );
    }
    render(
      <kit.TKNavStack initial="home" testId="nav" onStackChange={(p) => stacks.push(p)}>
        <kit.TKNavPanel id="home">
          <Home />
        </kit.TKNavPanel>
        <kit.TKNavPanel id="detail">
          <div>Detail</div>
        </kit.TKNavPanel>
      </kit.TKNavStack>,
    );
    const btn = screen.getByRole("button", { name: "go" });
    act(() => fireEvent.click(btn));
    act(() => fireEvent.click(btn));
    expect(stacks[stacks.length - 1]).toEqual(["home", "detail"]);
  });

  it("[D-EDGE] distinct params are NOT deduped (list navigation by id)", () => {
    const stacks: string[][] = [];
    function Home() {
      const nav = kit.useNav<{ id: number }>();
      const n = useRef(0);
      return (
        <button type="button" onClick={() => nav.push("detail", { id: ++n.current })}>
          go
        </button>
      );
    }
    render(
      <kit.TKNavStack initial="home" testId="nav" onStackChange={(p) => stacks.push(p)}>
        <kit.TKNavPanel id="home">
          <Home />
        </kit.TKNavPanel>
        <kit.TKNavPanel id="detail">
          <div>Detail</div>
        </kit.TKNavPanel>
      </kit.TKNavStack>,
    );
    const btn = screen.getByRole("button", { name: "go" });
    act(() => fireEvent.click(btn)); // id:1
    act(() => fireEvent.click(btn)); // id:2 → distinct, both stack
    expect(stacks[stacks.length - 1]).toEqual(["home", "detail", "detail"]);
  });
});

/* ---------------- ONB — onboarding dismiss / a11y / state ---------------- */

function Tour(props: Partial<React.ComponentProps<typeof kit.TKOnboardingTooltip>> & { withTarget?: boolean }) {
  const ref = useRef<HTMLButtonElement>(null);
  const { withTarget = true, steps, ...rest } = props;
  const defaultSteps = [{ target: ref, title: "Hi", text: "first" }];
  return (
    <kit.TKProvider>
      <button ref={ref}>anchor</button>
      <kit.TKOnboardingTooltip steps={steps ?? (withTarget ? defaultSteps : [])} testId="tour" {...rest} />
    </kit.TKProvider>
  );
}

describe("ONB-001 coach-mark is dismissable", () => {
  it("[D-API] Escape ends the tour and fires onSkip", () => {
    const onSkip = vi.fn();
    render(<Tour onSkip={onSkip} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    act(() => fireEvent.keyDown(document, { key: "Escape" }));
    expect(onSkip).toHaveBeenCalledTimes(1);
  });

  it("[D-API] dismissable={false} keeps Escape from closing", () => {
    const onSkip = vi.fn();
    render(<Tour onSkip={onSkip} dismissable={false} />);
    act(() => fireEvent.keyDown(document, { key: "Escape" }));
    expect(onSkip).not.toHaveBeenCalled();
  });
});

describe("ONB-002 coach-mark is a labelled dialog with a live region", () => {
  it("[D-A11Y] role=dialog named by the step title, with a polite status region", () => {
    render(<Tour />);
    const dialog = screen.getByRole("dialog");
    expect(dialog.getAttribute("aria-label")).toBe("Hi");
    expect(dialog.querySelector('[role="status"][aria-live="polite"]')).not.toBeNull();
  });

  it("[D-A11Y] trapFocus={false} is a non-trapping tooltip that still dismisses", () => {
    const onSkip = vi.fn();
    render(<Tour onSkip={onSkip} trapFocus={false} />);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    act(() => fireEvent.keyDown(document, { key: "Escape" }));
    expect(onSkip).toHaveBeenCalledTimes(1);
  });
});

describe("ONB-003 onboarding survives a shrinking / empty step set", () => {
  it("[D-STATE] empty steps finishes exactly once", () => {
    const onFinish = vi.fn();
    render(<Tour withTarget={false} onFinish={onFinish} />);
    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("[D-STATE] shrinking steps under the index clamps to a valid step (no vanish)", () => {
    function Harness() {
      const ref = useRef<HTMLButtonElement>(null);
      const [count, setCount] = useState(3);
      const all = [
        { target: ref, title: "One", text: "1" },
        { target: ref, title: "Two", text: "2" },
        { target: ref, title: "Three", text: "3" },
      ];
      return (
        <kit.TKProvider>
          <button ref={ref}>anchor</button>
          <button onClick={() => setCount(2)}>shrink</button>
          <kit.TKOnboardingTooltip steps={all.slice(0, count)} testId="tour" />
        </kit.TKProvider>
      );
    }
    render(<Harness />);
    // advance to the 3rd step (index 2)
    act(() => fireEvent.click(screen.getByRole("button", { name: "Next" })));
    act(() => fireEvent.click(screen.getByRole("button", { name: "Next" })));
    expect(screen.getByText("Three")).toBeInTheDocument();
    // shrink to 2 steps — index 2 is now out of range; must clamp, not vanish
    act(() => fireEvent.click(screen.getByRole("button", { name: "shrink" })));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Two")).toBeInTheDocument();
  });
});
