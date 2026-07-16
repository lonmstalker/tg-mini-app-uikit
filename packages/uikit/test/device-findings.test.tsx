import { readFileSync } from "node:fs";
import { fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createMockTelegram } from "@tg-mini-app/telegram/testing";
import type { TelegramWebApp } from "@tg-mini-app/telegram";
import * as kit from "../src/index";

/* Reproductions for the 2026-07-16 real-device findings (wiki/device-testing.md).
 * Each test first models how the OFFICIAL telegram-web-app.js actually behaves
 * (it defines every method on every client and THROWS at call time), then pins
 * the kit behavior that keeps that from reaching users. */

function wrap(webApp: TelegramWebApp) {
  return ({ children }: { children: React.ReactNode }) => (
    <kit.TKTelegramProvider webApp={webApp} signalReady={false}>
      {children}
    </kit.TKTelegramProvider>
  );
}

describe("finding #1 — switchInlineQuery on a bot without inline mode", () => {
  it("the client throws WebAppInlineModeDisabled at call time — the hook reports false instead", () => {
    const telegram = createMockTelegram();
    telegram.webApp.switchInlineQuery = () => {
      throw new Error("WebAppInlineModeDisabled");
    };
    const { result } = renderHook(() => kit.useDataTransport(), { wrapper: wrap(telegram.webApp) });
    expect(result.current.isSupported).toBe(true); // not detectable upfront…
    expect(result.current.switchInlineQuery("trail:x", ["users"])).toBe(false); // …so the call must not explode
  });
});

describe("finding #2 — requestChat exists on every client but is Bot API 9.6+", () => {
  it("an older client (method present, version too low) reports unsupported and resolves false", async () => {
    const telegram = createMockTelegram();
    telegram.webApp.isVersionAtLeast = (v: string) => Number.parseFloat(v) <= 9.0;
    telegram.webApp.requestChat = () => {
      throw new Error("WebAppMethodUnsupported"); // what the official bridge does below 9.6
    };
    const { result } = renderHook(() => kit.useChatRequest(), { wrapper: wrap(telegram.webApp) });
    expect(result.current.isSupported).toBe(false);
    await expect(result.current.request("trip-1")).resolves.toBe(false);
  });

  it("requestContact/requestWriteAccess get the same version gate (throw below 6.9)", () => {
    const telegram = createMockTelegram();
    telegram.webApp.isVersionAtLeast = () => false;
    const contact = renderHook(() => kit.useContactRequest(), { wrapper: wrap(telegram.webApp) });
    const write = renderHook(() => kit.useWriteAccess(), { wrapper: wrap(telegram.webApp) });
    expect(contact.result.current.isSupported).toBe(false);
    expect(write.result.current.isSupported).toBe(false);
  });
});

describe("review follow-up — a throwing bridge must not abort the caller's flow", () => {
  it("hideKeyboard falls back to the DOM blur instead of escaping the tap handler", () => {
    const telegram = createMockTelegram();
    telegram.webApp.hideKeyboard = () => {
      throw new Error("WebAppMethodUnsupported");
    };
    const { result } = renderHook(() => kit.useHideKeyboard(), { wrapper: wrap(telegram.webApp) });
    expect(() => result.current.hide()).not.toThrow();
  });

  it("orientation lock/unlock degrade to false — a check-in latch must never strand", () => {
    const telegram = createMockTelegram();
    telegram.webApp.lockOrientation = () => {
      throw new Error("WebAppMethodUnsupported");
    };
    telegram.webApp.unlockOrientation = () => {
      throw new Error("WebAppMethodUnsupported");
    };
    const { result } = renderHook(() => kit.useOrientationLock(), { wrapper: wrap(telegram.webApp) });
    expect(result.current.lock()).toBe(false);
    expect(result.current.unlock()).toBe(false);
  });
});

describe("finding #3 — BiometricManager exists on desktop where no biometrics do", () => {
  it("isSupported alone is the trap; isAvailable resolves false after init on a desktop-shaped client", async () => {
    const telegram = createMockTelegram();
    const manager = telegram.webApp.BiometricManager!;
    // Desktop shape: the wrapper object exists, nothing is known until init,
    // and init reveals there is no biometric hardware.
    manager.isInited = false;
    manager.isBiometricAvailable = undefined;
    manager.init = (cb?: () => void) => {
      manager.isInited = true;
      manager.isBiometricAvailable = false;
      cb?.();
    };
    const { result } = renderHook(() => kit.useBiometrics(), { wrapper: wrap(telegram.webApp) });
    expect(result.current.isSupported).toBe(true); // the trap the fingerprint key fell into
    expect(result.current.isAvailable).toBeUndefined(); // unknown until init
    await result.current.init();
    await waitFor(() => expect(result.current.isAvailable).toBe(false)); // the honest signal to hide biometric UI
  });
});

describe("finding #4 — dragging a snap sheet must not reveal blank panel (OVL-013)", () => {
  it("the content box expands to the full pinned height for the gesture and returns after", () => {
    render(
      <kit.TKSheet open onClose={() => {}} title="Confirm" snapPoints={[0.5, 0.9]} testId="snap-sheet">
        <div>sheet-content</div>
      </kit.TKSheet>,
    );
    const panel = screen.getByTestId("snap-sheet");
    const grab = panel.querySelector<HTMLElement>("[data-tk-sheet-grab]")!;
    const box = grab.parentElement as HTMLElement;
    // Resting at the small snap the box is snap-sized (50/90 of the panel).
    expect(box.style.height).not.toBe("100%");

    fireEvent.pointerDown(grab, { pointerId: 1, clientX: 0, clientY: 300 });
    fireEvent.pointerMove(grab, { pointerId: 1, clientX: 0, clientY: 280 }); // past the threshold, dragging up
    // Mid-gesture the box is pinned to the FULL height, so the revealed area
    // shows content — not the grey panel background the device test hit.
    expect(box.style.height).toBe("100%");

    // A canceled gesture (browser steals it — no snap commit, no re-render)
    // must still hand the box back to the committed snap's height.
    fireEvent.pointerCancel(grab, { pointerId: 1, clientX: 0, clientY: 280 });
    expect(box.style.height).toBe("");
  });
});

describe("finding #9 — composer send must not blur the input out from under the tap", () => {
  it("send button prevents the pointerdown default (keeps the keyboard up), and the click still sends", () => {
    const onSend = vi.fn();
    render(<kit.TKWriteBar onSend={onSend} placeholder="Message" testId="wb" />);
    const input = screen.getByRole("textbox", { name: "Message" });
    fireEvent.change(input, { target: { value: "hi" } });

    const send = screen.getByRole("button", { name: "Send" });
    const down = fireEvent.pointerDown(send, { pointerId: 1 });
    // fireEvent returns false when preventDefault was called — the focus grab is vetoed.
    expect(down).toBe(false);
    fireEvent.click(send);
    expect(onSend).toHaveBeenCalledWith("hi");
    expect((input as HTMLTextAreaElement).value).toBe(""); // cleared for the next message
  });
});

describe("finding #7 — the booking-card action is a real 44px target", () => {
  it("check-in button reserves at least a 44px hit area", () => {
    render(
      <kit.TKBookingCard
        name="Cedar Loop"
        date="Sat"
        time="13:00"
        actionLabel="Check in"
        onAction={() => {}}
        testId="bk"
      />,
    );
    const action = screen.getByRole("button", { name: "Check in" });
    expect(action.style.minHeight).toBe("44px");
    expect(action.style.minWidth).toBe("44px");
  });
});

describe("findings #8/#9 — shared CSS: instant taps and eased keyboard shifts", () => {
  const css = readFileSync("src/tokens/tokens.css", "utf8"); // vitest cwd = packages/uikit

  it("tk-press opts out of the mobile double-tap-zoom wait", () => {
    const block = css.slice(css.indexOf(".tk-press {"), css.indexOf(".tk-press:active"));
    expect(block).toContain("touch-action: manipulation");
  });

  it("the page and its footer ride the keyboard as one eased movement", () => {
    const page = css.slice(css.indexOf(".tk-page {"));
    expect(page).toContain("transition: height var(--tk-t3)");
    const footer = css.slice(css.indexOf(".tk-page-footer {"), css.indexOf("/* ============ shared micro-interaction"));
    expect(footer).toContain("transition: grid-template-rows var(--tk-t3)");
  });
});
