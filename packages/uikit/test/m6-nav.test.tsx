import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import * as kit from "../src/index";

function Home() {
  const nav = kit.useNav();
  const [count, setCount] = useState(0);
  return (
    <div>
      <button type="button" onClick={() => setCount((c) => c + 1)}>
        count {count}
      </button>
      <button type="button" onClick={() => nav.push("details", { id: 42 })}>
        open details
      </button>
      <button type="button" onClick={() => nav.replace("about")}>
        replace about
      </button>
    </div>
  );
}

function Details() {
  const nav = kit.useNav();
  const params = nav.params as { id: number } | undefined;
  return (
    <div>
      <span>details {params?.id}</span>
      <button type="button" onClick={() => nav.pop()}>
        back
      </button>
      <button type="button" onClick={() => nav.push("deep")}>
        deeper
      </button>
    </div>
  );
}

function Deep() {
  const nav = kit.useNav();
  return (
    <button type="button" onClick={() => nav.popTo("home")}>
      pop to home
    </button>
  );
}

function App(props: Partial<kit.TKNavStackProps>) {
  return (
    <kit.TKNavStack initial="home" {...props}>
      <kit.TKNavPanel id="home">
        <Home />
      </kit.TKNavPanel>
      <kit.TKNavPanel id="details">
        <Details />
      </kit.TKNavPanel>
      <kit.TKNavPanel id="deep">
        <Deep />
      </kit.TKNavPanel>
      <kit.TKNavPanel id="about">
        <span>about page</span>
      </kit.TKNavPanel>
    </kit.TKNavStack>
  );
}

const visiblePanel = (root: HTMLElement) =>
  Array.from(root.querySelectorAll<HTMLElement>("[data-tk-nav-panel]")).filter(
    (p) => p.style.visibility !== "hidden",
  );

describe("M6.1 TKNavStack / useNav", () => {
  it("push shows the next panel with params, lower panel state survives pop", () => {
    const onStackChange = vi.fn();
    render(<App onStackChange={onStackChange} testId="stack" />);
    fireEvent.click(screen.getByRole("button", { name: "count 0" }));
    fireEvent.click(screen.getByRole("button", { name: "open details" }));
    expect(screen.getByText("details 42")).toBeInTheDocument();
    expect(onStackChange).toHaveBeenLastCalledWith(["home", "details"]);

    fireEvent.click(screen.getByRole("button", { name: "back" }));
    expect(onStackChange).toHaveBeenLastCalledWith(["home"]);
    // home kept its local state while covered
    expect(screen.getByRole("button", { name: "count 1" })).toBeInTheDocument();
  });

  it("replace swaps the top entry", () => {
    const onStackChange = vi.fn();
    render(<App onStackChange={onStackChange} />);
    fireEvent.click(screen.getByRole("button", { name: "replace about" }));
    expect(onStackChange).toHaveBeenLastCalledWith(["about"]);
    expect(screen.getByText("about page")).toBeInTheDocument();
  });

  it("popTo unwinds to the named panel", () => {
    const onStackChange = vi.fn();
    render(<App onStackChange={onStackChange} />);
    fireEvent.click(screen.getByRole("button", { name: "open details" }));
    fireEvent.click(screen.getByRole("button", { name: "deeper" }));
    fireEvent.click(screen.getByRole("button", { name: "pop to home" }));
    expect(onStackChange).toHaveBeenLastCalledWith(["home"]);
  });

  it("covered panels stay mounted but hidden (scroll position survives)", () => {
    render(<App testId="stack" />);
    fireEvent.click(screen.getByRole("button", { name: "open details" }));
    const stack = screen.getByTestId("stack");
    const panels = stack.querySelectorAll("[data-tk-nav-panel]");
    expect(panels).toHaveLength(2);
    expect(visiblePanel(stack)).toHaveLength(1);
    expect(screen.getByText("count 0")).toBeInTheDocument(); // still mounted
  });
});

/* ---------------- M6.3 back priority queue ---------------- */

function fakeWebApp() {
  let backCb: (() => void) | undefined;
  const webApp = {
    ready: vi.fn(),
    BackButton: {
      isVisible: false,
      show: vi.fn(),
      hide: vi.fn(),
      onClick: (cb: () => void) => {
        backCb = cb;
      },
      offClick: () => {
        backCb = undefined;
      },
    },
  } as unknown as kit.TelegramWebApp;
  return { webApp, pressBack: () => backCb?.() };
}

describe("M6.3 back handler queue", () => {
  it("the last registered interceptor wins; unregistering falls through", () => {
    const { webApp, pressBack } = fakeWebApp();
    const stackPop = vi.fn();
    const sheetClose = vi.fn();

    function Probe({ sheetOpen }: { sheetOpen: boolean }) {
      kit.useBackIntercept(true, stackPop);
      kit.useBackIntercept(sheetOpen, sheetClose);
      kit.useBackDispatcher();
      return null;
    }

    const { rerender } = render(
      <kit.TKTelegramProvider webApp={webApp} signalReady={false}>
        <Probe sheetOpen />
      </kit.TKTelegramProvider>,
    );
    act(() => pressBack());
    expect(sheetClose).toHaveBeenCalledOnce();
    expect(stackPop).not.toHaveBeenCalled();

    rerender(
      <kit.TKTelegramProvider webApp={webApp} signalReady={false}>
        <Probe sheetOpen={false} />
      </kit.TKTelegramProvider>,
    );
    act(() => pressBack());
    expect(stackPop).toHaveBeenCalledOnce();
  });

  it("an open TKSheet intercepts back before the nav stack", () => {
    const { webApp, pressBack } = fakeWebApp();
    const onClose = vi.fn();
    function Inner() {
      kit.useBackDispatcher();
      return <kit.TKSheet open onClose={onClose} title="S" />;
    }
    render(
      <kit.TKTelegramProvider webApp={webApp} signalReady={false}>
        <Inner />
      </kit.TKTelegramProvider>,
    );
    act(() => pressBack());
    expect(onClose).toHaveBeenCalledOnce();
  });
});

/* ---------------- M6.5 useKeyboard ---------------- */

describe("M6.5 useKeyboard", () => {
  it("reports the on-screen keyboard from visualViewport", () => {
    const listeners: Record<string, () => void> = {};
    const vv = {
      height: window.innerHeight,
      offsetTop: 0,
      addEventListener: (e: string, cb: () => void) => {
        listeners[e] = cb;
      },
      removeEventListener: vi.fn(),
    };
    Object.defineProperty(window, "visualViewport", { value: vv, configurable: true });

    function Probe() {
      const kb = kit.useKeyboard();
      return <span>{kb.visible ? `kb ${kb.height}` : "no kb"}</span>;
    }
    render(<Probe />);
    expect(screen.getByText("no kb")).toBeInTheDocument();
    const input = document.createElement("input");
    document.body.append(input);
    input.focus();
    act(() => {
      vv.height = window.innerHeight - 320;
      listeners.resize?.();
    });
    expect(screen.getByText("kb 320")).toBeInTheDocument();
    Object.defineProperty(window, "visualViewport", { value: undefined, configurable: true });
  });
});
