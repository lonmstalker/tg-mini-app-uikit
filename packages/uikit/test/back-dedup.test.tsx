import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { createMockTelegram } from "@tg-mini-app/telegram/testing";
import * as kit from "../src/index";

/* 2026-07-14 smoothness plan, phase 5 — back-button dedup: inside Telegram the
 * nav stack drives the NATIVE Back button, so `TKHeader back="auto"` must NOT
 * render its own arrow (two visible back controls for one pop). In a plain
 * browser (no BackButton API) the arrow is the only "back" and stays. */

function DetailPusher() {
  const nav = kit.useNav();
  return (
    <button type="button" onClick={() => nav.push("detail")}>
      go-detail
    </button>
  );
}

function Stack() {
  return (
    <kit.TKNavStack initial="home" testId="nav">
      <kit.TKNavPanel id="home" label="Home">
        <DetailPusher />
      </kit.TKNavPanel>
      <kit.TKNavPanel id="detail" label="Detail">
        <kit.TKHeader title="Detail" back="auto" testId="detail-header" />
      </kit.TKNavPanel>
    </kit.TKNavStack>
  );
}

describe("TKHeader back=\"auto\" dedups against the native Telegram Back button", () => {
  afterEach(() => {
    Reflect.deleteProperty(window, "Telegram");
  });

  it("inside a real Telegram client (window.Telegram set): no header arrow, the native button is visible", () => {
    const telegram = createMockTelegram();
    // Real-client signal: useHasNativeChrome() reads window.Telegram.WebApp.
    (window as unknown as { Telegram?: { WebApp: unknown } }).Telegram = { WebApp: telegram.webApp };
    render(
      <kit.TKTelegramProvider webApp={telegram.webApp} signalReady={false}>
        <Stack />
      </kit.TKTelegramProvider>,
    );
    fireEvent.click(screen.getByText("go-detail"));
    expect(screen.getByTestId("detail-header")).toBeInTheDocument();
    // The nav stack shows the native button for depth > 1…
    expect(telegram.webApp.BackButton?.isVisible).toBe(true);
    // …so the header renders NO second arrow.
    expect(screen.queryByRole("button", { name: "Back" })).toBeNull();
  });

  it("with only an injected mock (no window.Telegram — storybook/demo): the arrow stays", () => {
    const telegram = createMockTelegram();
    render(
      <kit.TKTelegramProvider webApp={telegram.webApp} signalReady={false}>
        <Stack />
      </kit.TKTelegramProvider>,
    );
    fireEvent.click(screen.getByText("go-detail"));
    // No native chrome on screen — the in-DOM arrow is the only back control.
    expect(screen.getByRole("button", { name: "Back" })).toBeInTheDocument();
  });

  it("without a native BackButton (plain browser): the header arrow is the only back and stays", () => {
    render(<Stack />);
    fireEvent.click(screen.getByText("go-detail"));
    const arrow = screen.getByRole("button", { name: "Back" });
    expect(arrow).toBeInTheDocument();
    // …and it actually pops: detail leaves the LIVE stack (the aria-hidden
    // exit layer may still play its slide-out for one more beat).
    fireEvent.click(arrow);
    expect(screen.getByText("go-detail")).toBeInTheDocument();
    expect(document.querySelector('[data-tk-nav-panel="detail"]')).toBeNull();
  });
});
