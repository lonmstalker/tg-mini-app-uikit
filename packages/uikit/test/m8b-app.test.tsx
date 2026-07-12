import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import * as kit from "../src/index";

/* M8-B — FND-DX-001: <TKApp> batteries-included root. */

const wa = (colorScheme: "light" | "dark") => ({ colorScheme, HapticFeedback: {} }) as never;

describe("FND-DX-001 TKApp composes the provider ladder", () => {
  it("[D-API] renders children inside the .tk root", () => {
    render(
      <kit.TKApp webApp={wa("light")} signalReady={false}>
        <div data-testid="child">hi</div>
      </kit.TKApp>,
    );
    expect(screen.getByTestId("child").closest(".tk")).not.toBeNull();
  });

  it("[D-THEME] theme='auto' (default) mirrors the live Telegram scheme", () => {
    render(
      <kit.TKApp webApp={wa("dark")} signalReady={false}>
        <div data-testid="child" />
      </kit.TKApp>,
    );
    expect(screen.getByTestId("child").closest(".tk")?.getAttribute("data-theme")).toBe("dark");
  });

  it("[D-THEME] an explicit theme overrides the Telegram scheme", () => {
    render(
      <kit.TKApp webApp={wa("dark")} signalReady={false} theme="light">
        <div data-testid="child" />
      </kit.TKApp>,
    );
    expect(screen.getByTestId("child").closest(".tk")?.getAttribute("data-theme")).toBe("light");
  });

  it("[D-API] bundles a TKToastProvider by default so useTKToast() works", () => {
    function Trigger() {
      const toast = kit.useTKToast();
      return (
        <button type="button" onClick={() => toast.show({ text: "saved" })}>
          go
        </button>
      );
    }
    render(
      <kit.TKApp webApp={wa("light")} signalReady={false}>
        <Trigger />
      </kit.TKApp>,
    );
    fireEvent.click(screen.getByRole("button", { name: "go" }));
    expect(screen.getByText("saved")).toBeInTheDocument();
  });

  it("[D-API] forwards className to the .tk root and honors fallbackTheme in a browser", () => {
    render(
      // no webApp → no Telegram scheme → theme='auto' falls back
      <kit.TKApp signalReady={false} fallbackTheme="dark" className="my-app">
        <div data-testid="child" />
      </kit.TKApp>,
    );
    const tk = screen.getByTestId("child").closest(".tk");
    expect(tk?.classList.contains("my-app")).toBe(true);
    expect(tk?.getAttribute("data-theme")).toBe("dark");
  });

  it("[D-API] toasts={false} omits the toast provider", () => {
    function Trigger() {
      // useTKToast throws without a provider — render it in an error boundary-free
      // probe that only calls the hook lazily on click.
      let threw = false;
      try {
        kit.useTKToast();
      } catch {
        threw = true;
      }
      return <span data-testid="probe">{threw ? "no-provider" : "has-provider"}</span>;
    }
    render(
      <kit.TKApp webApp={wa("light")} signalReady={false} toasts={false}>
        <Trigger />
      </kit.TKApp>,
    );
    expect(screen.getByTestId("probe").textContent).toBe("no-provider");
  });
});
