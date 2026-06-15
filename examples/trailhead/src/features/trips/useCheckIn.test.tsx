import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { TKTelegramProvider } from "tg-mini-app-uikit";
import { createMockTelegram, type MockTelegram } from "@tg-mini-app/telegram/testing";
import { LangProvider } from "../../i18n";
import { StoreProvider, useAppState } from "../../store";
import { CHECKIN_XP, useCheckIn } from "./useCheckIn";

/*
 * Unit coverage for the signature device chain (QR → biometric → location → flip
 * the booking to checked in). Runs against the injected mock, which resolves each
 * device step to a scripted success.
 */

function Probe() {
  const checkin = useCheckIn();
  const { bookings, streak } = useAppState();
  const seed = bookings.find((b) => b.id === "bk-seed");
  return (
    <div>
      <span data-testid="phase">{checkin.phase}</span>
      <span data-testid="status">{seed?.status}</span>
      <span data-testid="xp">{streak.xp}</span>
      <button onClick={() => void checkin.run("bk-seed")}>run</button>
      <button onClick={() => void checkin.runDemo("bk-seed")}>demo</button>
    </div>
  );
}

const tree = (mock: MockTelegram) => (
  <TKTelegramProvider webApp={mock.webApp} haptics>
    <StoreProvider>
      <LangProvider initialLang="en">
        <Probe />
      </LangProvider>
    </StoreProvider>
  </TKTelegramProvider>
);

afterEach(() => {
  localStorage.clear();
});

describe("useCheckIn", () => {
  it("runs QR → biometric → location and flips the booking to checkedIn", async () => {
    const mock = createMockTelegram();
    render(tree(mock));
    expect(screen.getByTestId("status")).toHaveTextContent("paid");

    await userEvent.click(screen.getByText("run"));

    await waitFor(() => expect(screen.getByTestId("phase")).toHaveTextContent("done"), { timeout: 2000 });
    expect(screen.getByTestId("status")).toHaveTextContent("checkedIn");

    // the device chain ran each step exactly once
    const log = mock.getState().log.map((l) => l.text);
    expect(log.filter((t) => t.includes("BiometricManager.authenticate")).length).toBe(1);
    expect(log.some((t) => t.includes("showScanQrPopup"))).toBe(true);
    expect(log.some((t) => t.includes("LocationManager.getLocation"))).toBe(true);
  });

  it("is idempotent — a double run never books the device chain twice", async () => {
    const mock = createMockTelegram();
    render(tree(mock));

    // fire twice back-to-back; the synchronous latch blocks the second
    await userEvent.click(screen.getByText("run"));
    await userEvent.click(screen.getByText("run"));

    await waitFor(() => expect(screen.getByTestId("phase")).toHaveTextContent("done"), { timeout: 2000 });
    const log = mock.getState().log.map((l) => l.text);
    expect(log.filter((t) => t.includes("BiometricManager.authenticate")).length).toBe(1);
    expect(screen.getByTestId("status")).toHaveTextContent("checkedIn");
  });

  it("awards XP on completion so the check-in feeds the Train dashboard", async () => {
    const mock = createMockTelegram();
    render(tree(mock));
    const before = Number(screen.getByTestId("xp").textContent);

    await userEvent.click(screen.getByText("demo"));
    await waitFor(() => expect(screen.getByTestId("phase")).toHaveTextContent("done"), { timeout: 2000 });

    expect(Number(screen.getByTestId("xp").textContent)).toBe(before + CHECKIN_XP);
  });

  it("has an explicit demo path that checks in without opening device bridges", async () => {
    const mock = createMockTelegram();
    render(tree(mock));

    await userEvent.click(screen.getByText("demo"));

    await waitFor(() => expect(screen.getByTestId("phase")).toHaveTextContent("done"), { timeout: 2000 });
    expect(screen.getByTestId("status")).toHaveTextContent("checkedIn");

    const log = mock.getState().log.map((l) => l.text);
    expect(log.some((t) => t.includes("showScanQrPopup"))).toBe(false);
    expect(log.some((t) => t.includes("BiometricManager.authenticate"))).toBe(false);
    expect(log.some((t) => t.includes("LocationManager.getLocation"))).toBe(false);
  });
});
