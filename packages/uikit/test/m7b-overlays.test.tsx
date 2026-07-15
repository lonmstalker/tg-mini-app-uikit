import { readFileSync } from "node:fs";
import { useRef, useState, type ReactNode } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as kit from "../src/index";

/* M7-B — whole overlay family correctness: OVL-002/003/004/005/006/007/009/010/011/012.
 * jsdom rules: no layout (assert inline-style strings, not px), getComputedStyle
 * doesn't resolve var()/calc(), animationend never fires on its own (dispatch it). */

// vitest CWD is packages/uikit; read sources by relative path.
const readSrc = (f: string) => readFileSync(`src/composites/overlays/${f}`, "utf8");

/* ---------------- OVL-002 — popper role="dialog" traps focus ---------------- */

describe("OVL-002 TKPopper role=dialog is a focus-trapping modal", () => {
  function DialogPopper({ onClose }: { onClose?: () => void }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLButtonElement>(null);
    return (
      <kit.TKProvider>
        <button ref={ref} onClick={() => setOpen(true)}>
          anchor
        </button>
        <kit.TKPopper
          open={open}
          anchorRef={ref}
          role="dialog"
          onClose={() => {
            onClose?.();
            setOpen(false);
          }}
          testId="pop"
        >
          <button>First</button>
          <button>Last</button>
        </kit.TKPopper>
      </kit.TKProvider>
    );
  }

  it("[D-A11Y] moves focus inside on open and traps Tab; Escape restores to anchor", () => {
    const onClose = vi.fn();
    render(<DialogPopper onClose={onClose} />);
    const anchor = screen.getByRole("button", { name: "anchor" });
    act(() => anchor.focus());
    act(() => fireEvent.click(anchor));
    const pop = screen.getByTestId("pop");
    expect(pop.contains(document.activeElement)).toBe(true);

    // Tab from last cycles to first; Shift+Tab from first cycles to last.
    screen.getByRole("button", { name: "Last" }).focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "First" }));
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Last" }));

    act(() => fireEvent.keyDown(document, { key: "Escape" }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(anchor);
  });

  it("[D-A11Y] role=tooltip does NOT trap focus", () => {
    function TooltipPopper() {
      const [open, setOpen] = useState(false);
      const ref = useRef<HTMLButtonElement>(null);
      return (
        <kit.TKProvider>
          <button ref={ref} onClick={() => setOpen(true)}>
            anchor
          </button>
          <button>outside</button>
          <kit.TKPopper open={open} anchorRef={ref} role="tooltip" testId="pop">
            <button>Inside</button>
          </kit.TKPopper>
        </kit.TKProvider>
      );
    }
    render(<TooltipPopper />);
    const outside = screen.getByRole("button", { name: "outside" });
    act(() => outside.focus());
    act(() => fireEvent.click(screen.getByRole("button", { name: "anchor" })));
    // focus was NOT pulled into the tooltip
    expect(screen.getByTestId("pop").contains(document.activeElement)).toBe(false);
  });
});

/* ---------------- OVL-003 — mount transition follows the real exit ---------------- */

describe("OVL-003 useMountTransition ties unmount to the CSS exit, not a fixed timer", () => {
  afterEach(() => vi.useRealTimers());

  it("[D-PERF] unmounts on animationend before the fallback timer elapses", () => {
    vi.useFakeTimers();
    const { rerender } = render(<kit.TKDialog open title="Hi" testId="dlg" />);
    expect(screen.getByTestId("dlg")).toBeInTheDocument();
    rerender(<kit.TKDialog open={false} title="Hi" testId="dlg" />);
    const panel = screen.getByTestId("dlg");
    act(() => {
      fireEvent.animationEnd(panel, { animationName: "tk-fade-out" });
    });
    expect(screen.queryByTestId("dlg")).toBeNull(); // gone immediately, no 260ms wait
  });

  it("[D-PERF] falls back to closeMs when no animationend fires", () => {
    vi.useFakeTimers();
    const { rerender } = render(<kit.TKDialog open title="Hi" testId="dlg" />);
    rerender(<kit.TKDialog open={false} title="Hi" testId="dlg" />);
    act(() => vi.advanceTimersByTime(259));
    expect(screen.queryByTestId("dlg")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByTestId("dlg")).toBeNull();
  });

  it("[D-PERF source-grep] the transition wires animationend (not only setTimeout)", () => {
    expect(readSrc("shared.tsx")).toMatch(/animationend/);
  });
});

/* ---------------- OVL-004 — action sheet caps height & scrolls ---------------- */

describe("OVL-004 TKActionSheet scrolls a long list, cancel stays pinned", () => {
  const items = Array.from({ length: 30 }, (_, i) => ({ label: `Item ${i}`, onSelect: () => {} }));

  it("[D-STATE] list container has maxHeight + overflowY:auto; cancel is outside it", () => {
    render(<kit.TKActionSheet open items={items} testId="sheet" />);
    const list = document.querySelector<HTMLElement>("[data-tk-actions-list]");
    expect(list).not.toBeNull();
    expect(list!.style.overflowY).toBe("auto");
    expect(list!.style.maxHeight).toBeTruthy();
    const cancel = screen.getByRole("button", { name: /cancel/i });
    expect(list!.contains(cancel)).toBe(false);
  });
});

/* ---------------- OVL-005 — dialog action layout ---------------- */

describe("OVL-005 TKDialog action layout (row / stacked / auto)", () => {
  const actionsContainer = () =>
    [...screen.getByTestId("dlg").querySelectorAll<HTMLElement>("div")].find((d) => d.style.display === "grid")!;

  it("[D-RESP] two actions default to equal columns", () => {
    render(<kit.TKDialog open testId="dlg" actions={[<button key="a">A</button>, <button key="b">B</button>]} />);
    expect(actionsContainer().style.gridAutoFlow).toBe("column");
  });

  it("[D-RESP] actionsLayout='stacked' switches to row flow", () => {
    render(
      <kit.TKDialog open testId="dlg" actionsLayout="stacked" actions={[<button key="a">A</button>, <button key="b">B</button>]} />,
    );
    expect(actionsContainer().style.gridAutoFlow).toBe("row");
  });

  it("[D-RESP] auto stacks when there are more than two actions", () => {
    render(
      <kit.TKDialog
        open
        testId="dlg"
        actions={[<button key="a">A</button>, <button key="b">B</button>, <button key="c">C</button>]}
      />,
    );
    expect(actionsContainer().style.gridAutoFlow).toBe("row");
  });

  it("[D-RESP] auto keeps columns for two actions", () => {
    render(<kit.TKDialog open testId="dlg" actions={[<button key="a">A</button>, <button key="b">B</button>]} />);
    expect(actionsContainer().style.gridAutoFlow).toBe("column");
  });
});

/* ---------------- OVL-006 — modal inerts the background ---------------- */

describe("OVL-006 modal overlays inert/aria-hide the background", () => {
  afterEach(() => vi.useRealTimers());

  it("[D-A11Y] background sibling becomes aria-hidden; the dialog itself does not", () => {
    const { rerender } = render(
      <div>
        <div data-testid="bg">
          <button>behind</button>
        </div>
        <kit.TKDialog open title="Hi" testId="dlg" />
      </div>,
    );
    expect(screen.getByTestId("bg").getAttribute("aria-hidden")).toBe("true");
    // also carries our inert marker (jsdom doesn't implement HTMLElement.inert,
    // so assert the attribute contract directly)
    expect(screen.getByTestId("bg").hasAttribute("data-tk-inert")).toBe(true);
    expect(screen.getByTestId("dlg").getAttribute("aria-hidden")).not.toBe("true");

    // closing releases the background
    rerender(
      <div>
        <div data-testid="bg">
          <button>behind</button>
        </div>
        <kit.TKDialog open={false} title="Hi" testId="dlg" />
      </div>,
    );
    expect(screen.getByTestId("bg").getAttribute("aria-hidden")).toBeNull();
    expect(screen.getByTestId("bg").hasAttribute("data-tk-inert")).toBe(false);
  });

  it("[D-A11Y] does NOT inert the toast stack (live region stays above the modal)", () => {
    function Trigger() {
      const toast = kit.useTKToast();
      return <button onClick={() => toast.show({ text: "over dialog" })}>go</button>;
    }
    render(
      <kit.TKProvider>
        <kit.TKToastProvider testId="toasts">
          <Trigger />
        </kit.TKToastProvider>
        <kit.TKDialog open title="Hi" testId="dlg" />
      </kit.TKProvider>,
    );
    // the trigger sits in the (now inerted) background, so query by text
    act(() => fireEvent.click(screen.getByText("go")));
    const toasts = screen.getByTestId("toasts");
    expect(toasts.getAttribute("aria-hidden")).toBeNull();
    expect(toasts.hasAttribute("data-tk-inert")).toBe(false);
    // the toast is still announced over the open dialog
    expect(screen.getByText("over dialog")).toBeInTheDocument();
  });
});

/* ---------------- OVL-007 — Enter-confirm only from non-interactive targets ---------------- */

describe("OVL-007 TKDialog Enter-confirm doesn't fire from interactive children", () => {
  const setup = (child: ReactNode) => {
    const onConfirm = vi.fn();
    render(
      <kit.TKDialog open onConfirm={onConfirm} testId="dlg">
        {child}
      </kit.TKDialog>,
    );
    return onConfirm;
  };

  it("[D-API] Enter on the panel confirms", () => {
    const onConfirm = setup(null);
    act(() => fireEvent.keyDown(screen.getByTestId("dlg"), { key: "Enter" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("[D-API] Enter on a <div role=button> child does NOT confirm", () => {
    const onConfirm = setup(
      <div role="button" tabIndex={0} data-testid="rb">
        toggle
      </div>,
    );
    act(() => fireEvent.keyDown(screen.getByTestId("rb"), { key: "Enter" }));
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("[D-API] Enter on a contentEditable child does NOT confirm", () => {
    const onConfirm = setup(<div contentEditable data-testid="ce" suppressContentEditableWarning />);
    const ce = screen.getByTestId("ce");
    act(() => fireEvent.keyDown(ce, { key: "Enter" }));
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("[D-API] Enter inside an <input> child does NOT confirm", () => {
    const onConfirm = setup(<input data-testid="in" />);
    act(() => fireEvent.keyDown(screen.getByTestId("in"), { key: "Enter" }));
    expect(onConfirm).not.toHaveBeenCalled();
  });
});

/* ---------------- OVL-009 — toast timer cleanup ---------------- */

describe("OVL-009 toast action dismiss cancels the auto-dismiss timer", () => {
  afterEach(() => vi.useRealTimers());

  function Trigger() {
    const toast = kit.useTKToast();
    return (
      <button onClick={() => toast.show({ text: "saved", action: "Undo", onAction: () => {}, duration: 5000 })}>
        go
      </button>
    );
  }

  it("[D-EDGE] action dismiss runs once; the stale auto-timer never re-fires", () => {
    vi.useFakeTimers();
    const onAction = vi.fn();
    function T() {
      const toast = kit.useTKToast();
      return <button onClick={() => toast.show({ text: "saved", action: "Undo", onAction, duration: 5000 })}>go</button>;
    }
    render(
      <kit.TKProvider>
        <kit.TKToastProvider>
          <T />
        </kit.TKToastProvider>
      </kit.TKProvider>,
    );
    act(() => fireEvent.click(screen.getByRole("button", { name: "go" })));
    act(() => fireEvent.click(screen.getByRole("button", { name: "Undo" })));
    expect(onAction).toHaveBeenCalledTimes(1);
    act(() => vi.advanceTimersByTime(350)); // out-animation removal
    expect(screen.queryByText("saved")).toBeNull();
    // advance well past the original 5000ms auto-dismiss — must NOT throw or re-remove
    act(() => vi.advanceTimersByTime(6000));
    expect(vi.getTimerCount()).toBe(0);
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  void Trigger;
});

/* ---------------- OVL-010 — toast stack escapes a transformed ancestor ---------------- */

describe("OVL-010 toast stack portals out of a transformed wrapper", () => {
  function Trigger() {
    const toast = kit.useTKToast();
    return <button onClick={() => toast.show({ text: "hello" })}>go</button>;
  }

  it("[D-TG] stack is not a descendant of the transformed wrapper; role preserved", () => {
    render(
      <kit.TKProvider>
        <div data-testid="wrap" style={{ position: "relative", transform: "translateZ(0)" }}>
          <kit.TKToastProvider testId="stack">
            <Trigger />
          </kit.TKToastProvider>
        </div>
      </kit.TKProvider>,
    );
    act(() => fireEvent.click(screen.getByRole("button", { name: "go" })));
    const wrap = screen.getByTestId("wrap");
    const stack = screen.getByTestId("stack");
    expect(wrap.contains(stack)).toBe(false);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});

/* ---------------- OVL-011 — action sheet name localizes ---------------- */

describe("OVL-011 TKActionSheet accessible name follows the locale", () => {
  const items = [{ label: "One", onSelect: () => {} }];

  it("[D-TG] uses the localized term when ariaLabel is omitted", () => {
    render(
      <kit.TKLocaleProvider locale={{ actions: "Действия" }}>
        <kit.TKActionSheet open items={items} />
      </kit.TKLocaleProvider>,
    );
    expect(screen.getByRole("dialog").getAttribute("aria-label")).toBe("Действия");
  });

  it("[D-TG] explicit ariaLabel overrides the locale", () => {
    render(
      <kit.TKLocaleProvider locale={{ actions: "Действия" }}>
        <kit.TKActionSheet open items={items} ariaLabel="Custom" />
      </kit.TKLocaleProvider>,
    );
    expect(screen.getByRole("dialog").getAttribute("aria-label")).toBe("Custom");
  });

  it("[D-TG] falls back to the default locale term (not a raw literal)", () => {
    render(<kit.TKActionSheet open items={items} />);
    expect(screen.getByRole("dialog").getAttribute("aria-label")).toBe("Actions");
  });
});

/* ---------------- OVL-012 — sheet snapPoints dev-warning ---------------- */

describe("OVL-012 TKSheet warns on misconfigured snapPoints (dev)", () => {
  afterEach(() => vi.restoreAllMocks());

  it("[D-EDGE] warns on descending snapPoints", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<kit.TKSheet open snapPoints={[0.9, 0.4]} title="S" />);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toMatch(/ascending|snapPoints/i);
  });

  it("[D-EDGE] warns on out-of-range snapPoints", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<kit.TKSheet open snapPoints={[0.4, 1.5]} title="S" />);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it("[D-EDGE] does not warn on valid ascending in-range snapPoints", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<kit.TKSheet open snapPoints={[0.4, 0.9]} title="S" />);
    expect(warn).not.toHaveBeenCalled();
  });

  it("[D-EDGE] does not warn when snapPoints is undefined", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<kit.TKSheet open title="S" />);
    expect(warn).not.toHaveBeenCalled();
  });

  it("[D-EDGE] warns once, not on every rerender", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { rerender } = render(<kit.TKSheet open snapPoints={[0.9, 0.4]} title="S" />);
    rerender(<kit.TKSheet open snapPoints={[0.9, 0.4]} title="S" />);
    expect(warn).toHaveBeenCalledTimes(1);
  });
});

/* ---------------- OVL-013 — non-modal sheet focus contract ---------------- */

describe("OVL-013 TKSheet can opt out of modal document behavior", () => {
  it("[D-A11Y] modal=false neither moves focus on open nor restores it on close", () => {
    function Host({ open }: { open: boolean }) {
      return (
        <div>
          <button type="button">Original focus</button>
          <button type="button">Later focus</button>
          <kit.TKSheet open={open} modal={false} title="Preview" testId="sheet">
            <button type="button">Inside sheet</button>
          </kit.TKSheet>
        </div>
      );
    }

    const { rerender } = render(<Host open={false} />);
    const original = screen.getByRole("button", { name: "Original focus" });
    const later = screen.getByRole("button", { name: "Later focus" });
    original.focus();

    rerender(<Host open />);
    expect(document.activeElement).toBe(original);
    expect(screen.getByTestId("sheet")).not.toHaveAttribute("aria-modal");
    expect(document.querySelector("[data-tk-scrim]")).toBeNull();

    later.focus();
    rerender(<Host open={false} />);
    expect(document.activeElement).toBe(later);
  });
});
