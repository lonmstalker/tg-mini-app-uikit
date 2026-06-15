import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StrictMode, useRef } from "react";
import { describe, expect, it, vi } from "vitest";
import * as kit from "../src/index";
import { useOverlayA11y } from "../src/composites/overlays/shared";
import { createMockTelegram } from "@tg-mini-app/telegram/testing";

/*
 * Regression tests for the M1 kit-correctness milestone. Each block pins one
 * confirmed defect so it cannot silently return.
 */

describe("M1 · overlay Escape closes only the top layer (#1)", () => {
  function Overlay({ onClose, label }: { onClose: () => void; label: string }) {
    const ref = useRef<HTMLDivElement>(null);
    useOverlayA11y(true, ref, onClose);
    return (
      <div ref={ref} aria-modal="true">
        {label}
      </div>
    );
  }
  function Harness({ showTop }: { showTop: boolean }) {
    return (
      <>
        <Overlay onClose={onCloseBottom} label="bottom" />
        {showTop ? <Overlay onClose={onCloseTop} label="top" /> : null}
      </>
    );
  }
  const onCloseBottom = vi.fn();
  const onCloseTop = vi.fn();

  it("Escape closes the topmost overlay, not the whole stack", () => {
    onCloseBottom.mockClear();
    onCloseTop.mockClear();
    const { rerender } = render(<Harness showTop />);

    act(() => void fireEvent.keyDown(document.body, { key: "Escape" }));
    expect(onCloseTop).toHaveBeenCalledTimes(1);
    expect(onCloseBottom).not.toHaveBeenCalled();

    // Drop the top overlay; the next Escape reaches the one beneath.
    rerender(<Harness showTop={false} />);
    act(() => void fireEvent.keyDown(document.body, { key: "Escape" }));
    expect(onCloseBottom).toHaveBeenCalledTimes(1);
  });
});

describe("M1 · native Back button survives a sibling consumer unmount (#2)", () => {
  function BackConsumer() {
    kit.useBackButton(() => {});
    return null;
  }
  function App({ showA }: { showA: boolean }) {
    return (
      <kit.TKTelegramProvider webApp={mock.webApp} signalReady={false}>
        {showA ? <BackConsumer /> : null}
        <BackConsumer />
      </kit.TKTelegramProvider>
    );
  }
  const mock = createMockTelegram();

  it("keeps the button visible while another consumer still wants it", () => {
    const { rerender, unmount } = render(<App showA />);
    expect(mock.getState().back.visible).toBe(true);

    // One consumer leaves — the want-count is still 1, so the single native
    // button must stay shown (the race the unconditional hide() used to lose).
    rerender(<App showA={false} />);
    expect(mock.getState().back.visible).toBe(true);

    // Last consumer (and the provider) gone → hidden.
    unmount();
    expect(mock.getState().back.visible).toBe(false);
  });
});

describe("M1 · roving keyboard navigation (#3)", () => {
  it("TKTabbar arrows move selection + focus", () => {
    const onChange = vi.fn();
    render(
      <kit.TKTabbar
        testId="tb"
        defaultValue={0}
        onChange={onChange}
        tabs={[
          { icon: "home", label: "Home" },
          { icon: "search", label: "Search" },
          { icon: "calendar", label: "Plan" },
        ]}
      />,
    );
    const buttons = within(screen.getByTestId("tb")).getAllByRole("button");
    // Roving tabindex: only the active tab is in the tab order.
    expect(buttons[0]).toHaveAttribute("tabindex", "0");
    expect(buttons[1]).toHaveAttribute("tabindex", "-1");

    buttons[0].focus();
    fireEvent.keyDown(buttons[0], { key: "ArrowRight" });
    expect(onChange).toHaveBeenLastCalledWith(1);
    expect(buttons[1]).toHaveAttribute("tabindex", "0");
  });

  it("TKPageDots arrows move the page", () => {
    const onChange = vi.fn();
    render(<kit.TKPageDots testId="dots" count={3} defaultPage={0} onChange={onChange} />);
    const dots = within(screen.getByTestId("dots")).getAllByRole("button");
    dots[0].focus();
    fireEvent.keyDown(dots[0], { key: "ArrowRight" });
    expect(onChange).toHaveBeenLastCalledWith(1);
  });

  it("TKSteps arrows move focus between clickable steps", () => {
    const onStepClick = vi.fn();
    render(<kit.TKSteps testId="steps" steps={["One", "Two", "Three"]} current={0} onStepClick={onStepClick} />);
    const circles = within(screen.getByTestId("steps")).getAllByRole("button");
    circles[0].focus();
    fireEvent.keyDown(circles[0], { key: "ArrowRight" });
    expect(circles[1]).toHaveFocus();
    // Manual activation: Enter on the focused step fires onStepClick.
    fireEvent.click(circles[1]);
    expect(onStepClick).toHaveBeenLastCalledWith(1);
  });
});

describe("M1 · searchable TKSelect is keyboard-operable (#4)", () => {
  it("opening focuses the filter; typing + arrows + Enter select", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <kit.TKSelect
        searchable
        testId="sel"
        onChange={onChange}
        options={[
          { value: "apple", label: "Apple" },
          { value: "banana", label: "Banana" },
          { value: "cherry", label: "Cherry" },
        ]}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    const filter = screen.getByRole("textbox");
    expect(filter).toHaveFocus();

    await user.keyboard("ban");
    await user.keyboard("{ArrowDown}{Enter}");
    expect(onChange).toHaveBeenLastCalledWith("banana");
  });
});

describe("M1 · TKFileInput re-fires for the same file (#5)", () => {
  it("clears the input value after change so the same pick fires again", () => {
    const onFilesChange = vi.fn();
    const { container } = render(<kit.TKFileInput onFilesChange={onFilesChange} testId="fi" />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["x"], "photo.png", { type: "image/png" });

    fireEvent.change(input, { target: { files: [file] } });
    expect(onFilesChange).toHaveBeenCalledTimes(1);
    // Reset to "" so the browser delivers `change` again for an identical pick.
    expect(input.value).toBe("");
  });
});

describe("M1 · standalone TKSwitch fires haptics (#6)", () => {
  it("the label-less switch buzzes on toggle like the labeled one", () => {
    const haptics: string[] = [];
    render(
      <kit.TKTelegramProvider
        haptics
        signalReady={false}
        webApp={{ HapticFeedback: { selectionChanged: () => haptics.push("selection") } } as never}
      >
        <kit.TKSwitch ariaLabel="Wi-Fi" />
      </kit.TKTelegramProvider>,
    );
    fireEvent.click(screen.getByRole("switch"));
    expect(haptics).toContain("selection");
  });
});

describe("M1 · error toasts are assertive (#7)", () => {
  it("error → role=alert, success → role=status", async () => {
    const user = userEvent.setup();
    function Triggers() {
      const api = kit.useTKToast();
      return (
        <>
          <button type="button" onClick={() => api.error("bad")}>
            err
          </button>
          <button type="button" onClick={() => api.success("good")}>
            ok
          </button>
        </>
      );
    }
    render(
      <kit.TKToastProvider>
        <Triggers />
      </kit.TKToastProvider>,
    );

    await user.click(screen.getByText("err"));
    expect(screen.getByRole("alert")).toHaveTextContent("bad");

    await user.click(screen.getByText("ok"));
    expect(screen.getByRole("status")).toHaveTextContent("good");
  });
});

describe("M1 · TKAccordion resets its lazy cache without a render-phase ref (#8)", () => {
  function Host({ extra }: { extra: boolean }) {
    const items = [
      { id: "a", title: "A", content: <div>A-body</div> },
      { id: "b", title: "B", content: <div>B-body</div> },
      ...(extra ? [{ id: "c", title: "C", content: <div>C-body</div> }] : []),
    ];
    return <kit.TKAccordion testId="acc" lazy items={items} />;
  }

  it("changing the item set drops stale lazily-mounted content (StrictMode-safe)", () => {
    const { rerender } = render(
      <StrictMode>
        <Host extra={false} />
      </StrictMode>,
    );
    // Open A then B (single mode): A collapses but lazy keeps its body mounted.
    fireEvent.click(screen.getByText("A"));
    fireEvent.click(screen.getByText("B"));
    expect(screen.getByText("A-body")).toBeInTheDocument();

    // Changing the id set must reset the cache — under StrictMode's double
    // render a ref guard would eat the reset; the useState guard survives.
    rerender(
      <StrictMode>
        <Host extra />
      </StrictMode>,
    );
    expect(screen.queryByText("A-body")).not.toBeInTheDocument();
    expect(screen.getByText("B-body")).toBeInTheDocument();
  });
});
