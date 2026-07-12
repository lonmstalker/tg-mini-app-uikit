import { act, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useKeyboard } from "@tg-mini-app/telegram";
import { TKPage } from "../src";
import { usePageScrollTop } from "../src/internal/pageScroll";

/* Keyboard/viewport controller (KB-1.x): covered formula, open/close
   hysteresis, geometry-driven pan settle, deferred focusout. */

interface FakeVV {
  height: number;
  offsetTop: number;
  addEventListener: (e: string, cb: () => void) => void;
  removeEventListener: (e: string, cb: () => void) => void;
}

function installVV(innerHeight = 800) {
  const listeners = new Map<string, Set<() => void>>();
  const vv: FakeVV = {
    height: innerHeight,
    offsetTop: 0,
    addEventListener: (e, cb) => {
      if (!listeners.has(e)) listeners.set(e, new Set());
      listeners.get(e)!.add(cb);
    },
    removeEventListener: (e, cb) => listeners.get(e)?.delete(cb),
  };
  Object.defineProperty(window, "innerHeight", { value: innerHeight, configurable: true });
  Object.defineProperty(window, "visualViewport", { value: vv, configurable: true });
  const fire = (e: string) => listeners.get(e)?.forEach((cb) => cb());
  return { vv, fire, innerHeight };
}

let input: HTMLInputElement;

beforeEach(() => {
  vi.useFakeTimers();
  input = document.createElement("input");
  document.body.append(input);
  Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});

afterEach(() => {
  input.remove();
  Reflect.deleteProperty(window, "visualViewport");
  window.localStorage.removeItem("tk:kbHeight");
  vi.useRealTimers();
  vi.restoreAllMocks();
});

function tkRoot(): HTMLDivElement {
  const root = document.createElement("div");
  root.className = "tk";
  document.body.append(root);
  return root;
}

/* ---------------- KB-1.1 · covered formula + hysteresis ---------------- */

describe("KB-1.1 covered ignores offsetTop and open/close use split thresholds", () => {
  it("stays open through a WebKit pan (offsetTop ~ keyboard height)", () => {
    const { vv, fire, innerHeight } = installVV();
    const { result } = renderHook(() => useKeyboard(80));
    input.focus();
    act(() => {
      vv.height = innerHeight - 300;
      fire("resize");
    });
    expect(result.current).toEqual({ visible: true, height: 300 });
    // WebKit pans to a bottom field: offsetTop grows to ~keyboard height. The
    // old formula subtracted it, zeroing covered and flipping visible=false.
    act(() => {
      vv.offsetTop = 290;
      fire("scroll");
    });
    expect(result.current.visible).toBe(true);
  });

  it("does not flip while covered oscillates between the two thresholds", () => {
    const { vv, fire, innerHeight } = installVV();
    const { result } = renderHook(() => useKeyboard(80));
    input.focus();
    act(() => {
      vv.height = innerHeight - 85; // covered 85 > 80 → opens
      fire("resize");
    });
    expect(result.current.visible).toBe(true);
    for (const covered of [75, 45, 60, 72, 41]) {
      act(() => {
        vv.height = innerHeight - covered; // 40 < covered < 80: hold open
        fire("resize");
      });
      expect(result.current.visible).toBe(true);
    }
    act(() => {
      vv.height = innerHeight - 35; // covered 35 < 40 → closes
      fire("resize");
    });
    expect(result.current.visible).toBe(false);
    act(() => {
      vv.height = innerHeight - 75; // 75 < 80: not enough to re-open
      fire("resize");
    });
    expect(result.current.visible).toBe(false);
  });
});

/* ---------------- KB-1.5 · single animated height source ---------------- */

describe("KB-1.5 --tk-kb-height on the .tk root drives the page shrink", () => {
  it("(a) a resize burst within one keyboard animation writes the var once", () => {
    const { vv, fire, innerHeight } = installVV();
    const root = tkRoot();
    root.append(input);
    renderHook(() => useKeyboard(80));
    input.focus();
    let styleWrites = 0;
    const mo = new MutationObserver((recs) => {
      styleWrites += recs.filter((r) => r.attributeName === "style").length;
    });
    mo.observe(root, { attributes: true, attributeOldValue: true });
    // One keyboard animation: WebKit reports the final height, then jitters
    // by a couple px while settling.
    for (const covered of [300, 301, 299, 302, 300]) {
      act(() => {
        vv.height = innerHeight - covered;
        fire("resize");
      });
    }
    styleWrites += mo.takeRecords().filter((r) => r.attributeName === "style").length;
    expect(styleWrites).toBe(1);
    expect(root.style.getPropertyValue("--tk-kb-height")).toBe("300px");
    root.remove();
    input = document.createElement("input");
  });

  it("(b) focusin pre-shrinks from the remembered height before any resize", () => {
    window.localStorage.setItem("tk:kbHeight", "264");
    installVV();
    const root = tkRoot();
    root.append(input);
    const { result } = renderHook(() => useKeyboard(80));
    act(() => {
      input.focus();
      document.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    });
    // No vv resize yet — the stored height is already applied.
    expect(result.current).toEqual({ visible: true, height: 264 });
    expect(root.style.getPropertyValue("--tk-kb-height")).toBe("264px");
    root.remove();
    input = document.createElement("input");
  });

  it("(c) pre-shrink reverts after ~600ms when no resize confirms it", () => {
    window.localStorage.setItem("tk:kbHeight", "264");
    installVV();
    const root = tkRoot();
    root.append(input);
    const { result } = renderHook(() => useKeyboard(80));
    act(() => {
      input.focus();
      document.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    });
    expect(result.current.visible).toBe(true);
    act(() => {
      vi.advanceTimersByTime(600); // hardware keyboard: no resize ever comes
    });
    expect(result.current).toEqual({ visible: false, height: 0 });
    expect(root.style.getPropertyValue("--tk-kb-height")).toBe("0px");
    root.remove();
    input = document.createElement("input");
  });

  it("(d) the footer collapses via the CSS hook, never display:none on the flip", () => {
    const { vv, fire, innerHeight } = installVV();
    render(
      <div className="tk">
        <TKPage footer={<button type="button">tab</button>} testId="page">
          <input aria-label="field" />
        </TKPage>
      </div>,
    );
    const page = screen.getByTestId("page");
    expect(page).toHaveClass("tk-page");
    expect(page.style.height).toBe("calc(100% - var(--tk-kb-height, 0px))");
    const footer = page.querySelector(".tk-page-footer") as HTMLElement;
    expect(footer.hasAttribute("data-kb-open")).toBe(false);
    screen.getByLabelText("field").focus();
    act(() => {
      vv.height = innerHeight - 300;
      fire("resize");
    });
    // The flip only toggles the collapse hook; hiding is CSS's delayed
    // visibility at the end of the transition, never a synchronous display:none.
    expect(footer.hasAttribute("data-kb-open")).toBe(true);
    expect(footer.style.display).not.toBe("none");
    expect(getComputedStyle(footer).display).not.toBe("none");
    act(() => {
      vv.height = innerHeight;
      fire("resize");
    });
    expect(footer.hasAttribute("data-kb-open")).toBe(false);
  });
});

/* ---------------- KB-1.7 · pre-shrink is speculative, not sticky ---------------- */

describe("KB-1.7 pre-shrink cannot outlive its focus or bypass the open threshold", () => {
  it("(a) blur before the confirming resize reverts the pre-shrink promptly", () => {
    window.localStorage.setItem("tk:kbHeight", "264");
    installVV();
    const { result } = renderHook(() => useKeyboard(80));
    act(() => {
      input.focus();
      document.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    });
    expect(result.current).toEqual({ visible: true, height: 264 });
    // The keyboard never opened (no resize); focus leaves. The deferred
    // focusout re-check must drop the speculative shrink — not hold the
    // footer collapsed until the 600ms revert timer.
    act(() => {
      input.blur();
      document.dispatchEvent(new FocusEvent("focusout", { bubbles: true }));
      vi.advanceTimersByTime(150);
    });
    expect(result.current).toEqual({ visible: false, height: 0 });
  });

  it("(b) a sub-threshold gap after a pre-shrink cannot latch the hysteresis open", () => {
    window.localStorage.setItem("tk:kbHeight", "264");
    const { vv, fire, innerHeight } = installVV();
    const { result } = renderHook(() => useKeyboard(80));
    act(() => {
      input.focus();
      document.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    });
    expect(result.current.visible).toBe(true);
    // A non-keyboard viewport shift lands between the two thresholds
    // (closeThreshold 40 < 60 < threshold 80) while the pre-shrink is live.
    // The hysteresis latch must NOT adopt it: no resize ever crossed the FULL
    // open threshold, so the 600ms revert returns the full layout.
    act(() => {
      vv.height = innerHeight - 60;
      fire("resize");
    });
    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(result.current).toEqual({ visible: false, height: 0 });
  });

  it("(c) hardware keyboard: focusin with no resize ever → full layout after 600ms", () => {
    window.localStorage.setItem("tk:kbHeight", "264");
    installVV();
    const root = tkRoot();
    root.append(input);
    const { result } = renderHook(() => useKeyboard(80));
    act(() => {
      input.focus(); // focus STAYS (user is typing on the hardware keyboard)
      document.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    });
    expect(result.current.visible).toBe(true);
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(result.current).toEqual({ visible: false, height: 0 });
    expect(root.style.getPropertyValue("--tk-kb-height")).toBe("0px");
    expect(document.activeElement).toBe(input);
    root.remove();
    input = document.createElement("input");
  });
});

/* ---------------- KB-1.6 · scroll tracking decoupled from render ---------------- */

describe("KB-1.6 page scroll commits only quantized header phases", () => {
  it("a 0→500px scroll re-renders the header consumer per 4px quantum, not per frame", () => {
    installVV();
    let headerRenders = 0;
    const seen: number[] = [];
    function CountingHeader() {
      headerRenders += 1;
      const scrollTop = usePageScrollTop();
      if (seen[seen.length - 1] !== scrollTop) seen.push(scrollTop);
      return <div data-testid="hdr">{scrollTop}</div>;
    }
    render(
      <TKPage header={<CountingHeader />} testId="page">
        <div style={{ height: 2000 }} />
      </TKPage>,
    );
    const scroller = screen.getByTestId("page").querySelector("[data-tk-page-scroll]") as HTMLElement;
    const before = headerRenders;
    // 50 scroll frames, 10px apart — a fast flick through the whole band.
    for (let px = 10; px <= 500; px += 10) {
      Object.defineProperty(scroller, "scrollTop", { value: px, configurable: true });
      fireEvent.scroll(scroller);
    }
    // ≤ one commit per quantum crossed inside 0..64 (16 quanta), not 50 frames.
    expect(headerRenders - before).toBeLessThanOrEqual(17);
    // The header still sees the full collapse band it needs (36/20 hysteresis).
    expect(seen).toContain(64);
    expect(Math.max(...seen)).toBe(64); // clamp: deep scroll stays 64
  });
});

/* ---------------- KB-1.4 · idempotent .tk-kb-open writes ---------------- */

describe("KB-1.4 repeated sync() without a state change mutates no attributes", () => {
  it("zero class mutations on .tk roots for watchdog-style re-syncs", () => {
    const { vv, fire, innerHeight } = installVV();
    const root = document.createElement("div");
    root.className = "tk";
    root.append(input); // scope the lift to this root
    document.body.append(root);
    renderHook(() => useKeyboard(80));
    input.focus();
    act(() => {
      vv.height = innerHeight - 300;
      fire("resize");
    });
    expect(root.classList.contains("tk-kb-open")).toBe(true);

    const mo = new MutationObserver(() => {});
    mo.observe(root, { attributes: true });
    // Same geometry re-synced many ways — the watchdog pattern.
    act(() => {
      fire("resize");
      fire("scroll");
      document.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
      vi.advanceTimersByTime(500);
    });
    expect(mo.takeRecords()).toHaveLength(0);
    mo.disconnect();
    root.remove();
    input = document.createElement("input"); // afterEach removes this one
  });
});

/* ---------------- KB-1.2 · geometry-driven pan settle ---------------- */

describe("KB-1.2 leftover WebKit pan settles by keyboard geometry, not focus", () => {
  it("chevron close: no focus events, resize back → scrollTo(0,0) within ~150ms", () => {
    const { vv, fire, innerHeight } = installVV();
    const { result } = renderHook(() => useKeyboard(80));
    input.focus();
    act(() => {
      vv.height = innerHeight - 300;
      vv.offsetTop = 280; // WebKit panned to the focused field
      fire("resize");
    });
    expect(result.current.visible).toBe(true);
    // The iOS keyboard chevron closes the keyboard WITHOUT blurring the input
    // and without focus events; only the geometry comes back.
    act(() => {
      vv.height = innerHeight;
      fire("resize");
    });
    expect(result.current.visible).toBe(false);
    expect(window.scrollTo).not.toHaveBeenCalled(); // never synchronously
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    expect(document.activeElement).toBe(input); // focus was never touched
  });

  it("does not fight a native settle: no scrollTo while vv keeps moving", () => {
    const { vv, fire, innerHeight } = installVV();
    renderHook(() => useKeyboard(80));
    input.focus();
    act(() => {
      vv.height = innerHeight - 300;
      vv.offsetTop = 280;
      fire("resize");
    });
    // Keyboard retracts; WebKit walks offsetTop back over several frames.
    for (const offsetTop of [220, 160, 90, 30]) {
      act(() => {
        vv.height = innerHeight;
        vv.offsetTop = offsetTop;
        fire("scroll");
        vi.advanceTimersByTime(50); // < settle delay between movements
      });
    }
    expect(window.scrollTo).not.toHaveBeenCalled();
    // Native settle finished on its own — nothing left to undo.
    act(() => {
      vv.offsetTop = 0;
      fire("scroll");
      vi.advanceTimersByTime(200);
    });
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it("focus hop between fields (KB-1.3): no scrollTo, no visible flip", () => {
    const { vv, fire, innerHeight } = installVV();
    const inputB = document.createElement("input");
    document.body.append(inputB);
    const flips: boolean[] = [];
    const { result } = renderHook(() => {
      const kb = useKeyboard(80);
      if (flips[flips.length - 1] !== kb.visible) flips.push(kb.visible);
      return kb;
    });
    input.focus();
    act(() => {
      vv.height = innerHeight - 300;
      vv.offsetTop = 260; // panned to the field; keyboard stays up across the hop
      fire("resize");
    });
    expect(result.current.visible).toBe(true);
    const flipsBefore = flips.length;
    act(() => {
      input.blur();
      document.dispatchEvent(new FocusEvent("focusout", { bubbles: true }));
      vi.advanceTimersByTime(30);
      inputB.focus();
      document.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
      vi.advanceTimersByTime(300); // deferred focusout re-check fires → no-op
    });
    expect(window.scrollTo).not.toHaveBeenCalled();
    expect(flips.length).toBe(flipsBefore);
    expect(result.current.visible).toBe(true);
    inputB.remove();
  });

  it("focusout with no follow-up focus still resyncs (lost resize event)", () => {
    const { vv, fire, innerHeight } = installVV();
    const { result } = renderHook(() => useKeyboard(80));
    input.focus();
    act(() => {
      vv.height = innerHeight - 300;
      vv.offsetTop = 260;
      fire("resize");
    });
    expect(result.current.visible).toBe(true);
    // Keyboard closes and vv's resize event is swallowed — only blur arrives.
    act(() => {
      vv.height = innerHeight;
      vv.offsetTop = 90;
      input.blur();
      document.dispatchEvent(new FocusEvent("focusout", { bubbles: true }));
    });
    expect(result.current.visible).toBe(true); // nothing observed yet
    act(() => {
      vi.advanceTimersByTime(100); // deferred re-check reads the geometry
    });
    expect(result.current.visible).toBe(false);
    act(() => {
      vi.advanceTimersByTime(150); // and the leftover pan settles
    });
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it("never yanks a legitimately scrolled page: closed-keyboard sync with scrollY>0 but no pan", () => {
    // A real app with a scrolling document: scrollY is the USER's position.
    Object.defineProperty(document.documentElement, "scrollHeight", { value: 2000, configurable: true });
    Object.defineProperty(document.documentElement, "clientHeight", { value: 800, configurable: true });
    Object.defineProperty(window, "scrollY", { value: 500, configurable: true });
    installVV();
    renderHook(() => useKeyboard(80));
    // Any sync trigger with the keyboard closed (focusin before the kb resize
    // arrives) must NOT arm the settle: there is no pan (offsetTop 0), only scroll.
    act(() => {
      input.focus();
      document.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
      vi.advanceTimersByTime(130);
    });
    expect(window.scrollTo).not.toHaveBeenCalled();
    Reflect.deleteProperty(document.documentElement, "scrollHeight");
    Reflect.deleteProperty(document.documentElement, "clientHeight");
  });

  it("an actively changing scrollY inside the settle window restarts the countdown", () => {
    const { vv, fire, innerHeight } = installVV();
    renderHook(() => useKeyboard(80));
    input.focus();
    act(() => {
      vv.height = innerHeight - 300;
      vv.offsetTop = 280;
      fire("resize");
    });
    // Keyboard closes with a stuck pan AND a leftover scroll offset (the doc
    // itself is unscrollable — jsdom default — so both are WebKit artifacts).
    Object.defineProperty(window, "scrollY", { value: 80, configurable: true });
    act(() => {
      vv.height = innerHeight;
      vv.offsetTop = 120;
      fire("resize");
    });
    act(() => {
      vi.advanceTimersByTime(60);
    });
    // WebKit is still walking the scroll back — the stability snapshot must
    // see the moving scrollY and reschedule instead of firing.
    Object.defineProperty(window, "scrollY", { value: 30, configurable: true });
    act(() => {
      vi.advanceTimersByTime(70); // t=130 from arming: original countdown expired
    });
    expect(window.scrollTo).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(120); // stable since the restart → now it settles
    });
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    expect(window.scrollTo).toHaveBeenCalledTimes(1);
  });

  it("settles a native settle that stalls mid-way", () => {
    const { vv, fire, innerHeight } = installVV();
    renderHook(() => useKeyboard(80));
    input.focus();
    act(() => {
      vv.height = innerHeight - 300;
      vv.offsetTop = 280;
      fire("resize");
    });
    act(() => {
      vv.height = innerHeight;
      vv.offsetTop = 120; // retraction stalls here (the Telegram iOS bug)
      fire("resize");
    });
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });
});
