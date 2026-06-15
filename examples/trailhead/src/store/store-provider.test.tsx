import { StrictMode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { TKTelegramProvider } from "tg-mini-app-uikit";
import { createMockTelegram, type MockTelegram } from "tg-mini-app-uikit/testing";
import { StoreProvider, useAppDispatch, useAppState } from "./index";

/*
 * Integration test for the most delicate M1 piece: StoreProvider's hydrate →
 * persist wiring, under StrictMode's double-invoked effects. Proves a real
 * close/reopen round-trip through the mock's localStorage-backed storage:
 * complete onboarding, remount fresh, and the flag rehydrates.
 */

function Probe() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  return (
    <div>
      <span data-testid="hydrated">{String(state.hydrated)}</span>
      <span data-testid="onboarding">{String(state.onboardingDone)}</span>
      <span data-testid="bookings">{state.bookings.length}</span>
      <button onClick={() => dispatch({ type: "COMPLETE_ONBOARDING" })}>complete</button>
    </div>
  );
}

const tree = (mock: MockTelegram) => (
  <StrictMode>
    <TKTelegramProvider webApp={mock.webApp}>
      <StoreProvider>
        <Probe />
      </StoreProvider>
    </TKTelegramProvider>
  </StrictMode>
);

afterEach(() => {
  localStorage.clear();
});

describe("StoreProvider hydrate + persist", () => {
  it("hydrates the seed state on first mount and flips `hydrated`", async () => {
    const mock = createMockTelegram();
    render(tree(mock));
    await waitFor(() => expect(screen.getByTestId("hydrated")).toHaveTextContent("true"));
    // fresh session: onboarding not done, one seed booking
    expect(screen.getByTestId("onboarding")).toHaveTextContent("false");
    expect(screen.getByTestId("bookings")).toHaveTextContent("1");
  });

  it("persists onboarding and rehydrates it across a remount (close/reopen)", async () => {
    const mock = createMockTelegram();
    const first = render(tree(mock));
    await waitFor(() => expect(screen.getByTestId("hydrated")).toHaveTextContent("true"));
    expect(screen.getByTestId("onboarding")).toHaveTextContent("false");

    await userEvent.click(screen.getByText("complete"));
    expect(screen.getByTestId("onboarding")).toHaveTextContent("true");
    // let the persist effect flush to (mock) storage
    await waitFor(() => expect(localStorage.getItem("tg-demo-cloud:th_onboarding")).toBe("true"));

    first.unmount();

    // Reopen against the same (localStorage-backed) storage.
    render(tree(mock));
    await waitFor(() => expect(screen.getByTestId("hydrated")).toHaveTextContent("true"));
    await waitFor(() => expect(screen.getByTestId("onboarding")).toHaveTextContent("true"));
  });
});
