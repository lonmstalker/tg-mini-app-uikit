import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import * as kit from "../src/index";

describe("M7 · TKTabView", () => {
  const tabs = [
    { icon: "home" as const, label: "A" },
    { icon: "search" as const, label: "B" },
  ];

  it("keeps every panel mounted but shows only the active one", () => {
    render(
      <kit.TKTabView
        testId="tabs"
        tabs={tabs}
        panels={[<div key="a">panel-a</div>, <div key="b">panel-b</div>]}
        panelTestId={(i) => `p-${i}`}
        value={0}
        onChange={() => {}}
      />,
    );
    // Both panels are in the DOM (state/scroll survive a tab switch)...
    expect(screen.getByText("panel-a")).toBeInTheDocument();
    expect(screen.getByText("panel-b")).toBeInTheDocument();
    // ...but only the active one is shown.
    expect(screen.getByTestId("p-0").style.display).toBe("block");
    expect(screen.getByTestId("p-1").style.display).toBe("none");
  });

  it("hides the tabbar on a deep screen", () => {
    const view = (hideTabbar: boolean) => (
      <kit.TKTabView testId="tabs" tabs={tabs} panels={[<div key="a" />, <div key="b" />]} value={0} onChange={() => {}} hideTabbar={hideTabbar} />
    );
    const { rerender } = render(view(false));
    expect(screen.getByTestId("tabs").parentElement?.style.display).toBe("block");
    rerender(view(true));
    expect(screen.getByTestId("tabs").parentElement?.style.display).toBe("none");
  });
});

describe("M7 · useHasNativeChrome", () => {
  function Probe() {
    return <span data-testid="chrome">{String(kit.useHasNativeChrome())}</span>;
  }
  afterEach(() => {
    Reflect.deleteProperty(window as unknown as Record<string, unknown>, "Telegram");
  });

  it("is false without a real Telegram host, true with one", () => {
    const { rerender } = render(<Probe />);
    expect(screen.getByTestId("chrome")).toHaveTextContent("false");

    (window as unknown as { Telegram?: unknown }).Telegram = { WebApp: {} };
    rerender(<Probe />);
    expect(screen.getByTestId("chrome")).toHaveTextContent("true");
  });
});

describe("M7 · TKHeader back='auto'", () => {
  it("shows no back outside a nav stack (depth 1); back={true} forces it", () => {
    const { rerender } = render(<kit.TKHeader title="T" back="auto" testId="h" />);
    expect(within(screen.getByTestId("h")).queryByRole("button")).toBeNull();

    rerender(<kit.TKHeader title="T" back onBack={() => {}} testId="h" />);
    expect(within(screen.getByTestId("h")).getByRole("button")).toBeInTheDocument();
  });

  it("derives back + pop from an enclosing TKNavStack", () => {
    function Top() {
      const nav = kit.useNav();
      return (
        <>
          <kit.TKHeader title="A" back="auto" testId="hdr-a" />
          <button type="button" onClick={() => nav.push("b")}>
            go
          </button>
        </>
      );
    }
    render(
      <kit.TKNavStack initial="a">
        <kit.TKNavPanel id="a">
          <Top />
        </kit.TKNavPanel>
        <kit.TKNavPanel id="b">
          <kit.TKHeader title="B" back="auto" testId="hdr-b" />
        </kit.TKNavPanel>
      </kit.TKNavStack>,
    );
    // depth 1 → the header shows no back control
    expect(within(screen.getByTestId("hdr-a")).queryByRole("button")).toBeNull();
    fireEvent.click(screen.getByText("go"));
    // depth 2 → panel B's header derives a back control
    expect(within(screen.getByTestId("hdr-b")).getByRole("button")).toBeInTheDocument();
  });
});
