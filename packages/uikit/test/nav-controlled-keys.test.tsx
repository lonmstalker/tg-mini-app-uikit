import { StrictMode, useRef, useState } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TKNavPanel, TKNavStack, useNav, type TKNavStackEntry } from "../src";

/* A4 — controlled-mode keys must be monotonic, not the array index: an index
   key returns on the next push to the same depth, which poisons the
   settled-guard (no entrance animation ever again on a "warmed" depth) and
   lets a stale swipe-back fromX leak into an unrelated exit. */

const panel = (id: string, body?: React.ReactNode) => (
  <TKNavPanel key={id} id={id} label={id}>
    {body ?? <div>{id}</div>}
  </TKNavPanel>
);

// jsdom has no AnimationEvent and fireEvent.animationEnd drops animationName —
// dispatch a hand-built event instead (same helper as nav-exit.test.tsx).
function fireAnimationEnd(el: HTMLElement, animationName: string) {
  const ev = new Event("animationend", { bubbles: true }) as Event & { animationName?: string };
  ev.animationName = animationName;
  act(() => {
    el.dispatchEvent(ev);
  });
}

const panelEl = (id: string) =>
  screen.getByTestId("nav").querySelector<HTMLElement>(`[data-tk-nav-panel="${id}"]`);
const exitEl = () => screen.getByTestId("nav").querySelector<HTMLElement>("[data-tk-nav-exit]");

describe("A4 controlled stack: settled-guard survives a pop→push to the same depth", () => {
  function Harness({ entries }: { entries: TKNavStackEntry[] }) {
    return (
      <TKNavStack initial="h" stack={entries} testId="nav">
        {panel("h")}
        {panel("a")}
        {panel("b")}
      </TKNavStack>
    );
  }

  it("a fresh push to a previously-settled depth still gets the entrance animation", () => {
    const { rerender } = render(<Harness entries={[{ panel: "h" }, { panel: "a" }]} />);
    const a = panelEl("a")!;
    expect(a.style.animation).toContain("tk-nav-in");
    fireAnimationEnd(a, "tk-nav-in");
    expect(panelEl("a")!.style.animation).toBe("");
    // Pop to depth 1, then push a DIFFERENT panel back to depth 2.
    rerender(<Harness entries={[{ panel: "h" }]} />);
    rerender(<Harness entries={[{ panel: "h" }, { panel: "b" }]} />);
    // b is a brand-new entry: it must animate in — a reused index key would
    // have inherited a's settled state and skipped the entrance.
    expect(panelEl("b")!.style.animation).toContain("tk-nav-in");
  });
});

describe("A4 controlled key mapping is state-adjusted in render (no remount across renders)", () => {
  // Ключи controlled-режима живут в state (adjust-state-during-render, как
  // prevStack), не в render-мутируемом ref: отброшенный concurrent-рендер
  // отбрасывает и свой маппинг. Пиннинг: локальный стейт панели переживает
  // push поверх, смену params и pop обратно — в том числе под StrictMode,
  // где каждый рендер прогоняется дважды.
  function Stateful() {
    const [value, setValue] = useState("");
    return <input aria-label="draft" value={value} onChange={(e) => setValue(e.target.value)} />;
  }

  function Harness({ entries }: { entries: TKNavStackEntry[] }) {
    return (
      <StrictMode>
        <TKNavStack initial="h" stack={entries} testId="nav">
          {panel("h", <Stateful />)}
          {panel("a")}
        </TKNavStack>
      </StrictMode>
    );
  }

  it("panel-local state survives push, params change and pop under StrictMode", () => {
    const { rerender } = render(<Harness entries={[{ panel: "h" }]} />);
    const draft = screen.getByLabelText("draft");
    fireEvent.change(draft, { target: { value: "черновик" } });
    expect(screen.getByLabelText("draft")).toHaveValue("черновик");
    // push поверх: у нижней панели должен сохраниться ключ (и стейт)
    rerender(<Harness entries={[{ panel: "h" }, { panel: "a" }]} />);
    // смена params верхней записи: kept-ветка (тот же ключ), не новый ключ
    rerender(<Harness entries={[{ panel: "h" }, { panel: "a", params: { x: 1 } }]} />);
    // pop назад
    rerender(<Harness entries={[{ panel: "h" }]} />);
    expect(screen.getByLabelText("draft")).toHaveValue("черновик");
  });
});

describe("A4 rejected swipe-back leaves no stale fromX for the next exit", () => {
  function PopA() {
    const nav = useNav();
    return (
      <button type="button" onClick={() => nav.pop()}>
        pop-a
      </button>
    );
  }

  function RejectingHost() {
    const [entries, setEntries] = useState<TKNavStackEntry[]>([{ panel: "h" }, { panel: "a" }]);
    const acceptRef = useRef(false);
    return (
      <>
        <button type="button" onClick={() => (acceptRef.current = true)}>
          accept-pops
        </button>
        <TKNavStack
          initial="h"
          stack={entries}
          onChange={(next) => {
            if (acceptRef.current) setEntries(next);
          }}
          testId="nav"
        >
          {panel("h")}
          {panel("a", <PopA />)}
        </TKNavStack>
      </>
    );
  }

  it("a button pop after a host-rejected swipe starts the exit from x=0", () => {
    render(<RejectingHost />);
    const nav = screen.getByTestId("nav");
    // Committing edge swipe-back (jsdom clientWidth is 0, so any positive
    // delta commits); the host REJECTS the resulting pop request.
    fireEvent.pointerDown(nav, { pointerId: 1, clientX: 5, clientY: 100 });
    fireEvent.pointerMove(nav, { pointerId: 1, clientX: 200, clientY: 100 });
    fireEvent.pointerUp(nav, { pointerId: 1, clientX: 200, clientY: 100 });
    expect(panelEl("a")).not.toBeNull(); // still on a — the pop was rejected
    expect(exitEl()).toBeNull();
    // Now the host accepts; the pop comes from a BUTTON, not a swipe: the
    // exit must slide from 0, not from the long-gone finger position.
    fireEvent.click(screen.getByText("accept-pops"));
    fireEvent.click(screen.getByText("pop-a"));
    const exit = exitEl();
    expect(exit).not.toBeNull();
    expect(exit!.style.transform).toBe("translateX(0px)");
  });
});
