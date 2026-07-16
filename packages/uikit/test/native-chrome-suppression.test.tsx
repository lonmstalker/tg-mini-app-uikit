import { render, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createMockTelegram } from "@tg-mini-app/telegram/testing";
import * as kit from "../src/index";

/* Native-chrome arbitration: the Main/Secondary buttons live in the client
 * chrome OUTSIDE the webview, so a modal overlay's scrim/focus-trap cannot
 * reach them — an active "Pay" would stay tappable under a confirmation sheet.
 * The kit hides them while a modal overlay is mounted (default), restores them
 * when the last overlay closes, and lets an overlay opt out with
 * `nativeButtons="keep"` when the native button is the overlay's own CTA. */

function Buttons() {
  kit.useMainButton({ text: "Pay", onClick: () => {} });
  kit.useSecondaryButton({ text: "Cancel", onClick: () => {} });
  return null;
}

function Harness({ open, nativeButtons }: { open: boolean; nativeButtons?: "suppress" | "keep" }) {
  return (
    <>
      <Buttons />
      <kit.TKSheet open={open} onClose={() => {}} title="Confirm" nativeButtons={nativeButtons}>
        <div>sheet-body</div>
      </kit.TKSheet>
    </>
  );
}

function setup(ui: React.ReactElement) {
  const telegram = createMockTelegram();
  const view = render(
    <kit.TKTelegramProvider webApp={telegram.webApp} signalReady={false}>
      {ui}
    </kit.TKTelegramProvider>,
    {
      wrapper: undefined,
    },
  );
  const rerender = (next: React.ReactElement) =>
    view.rerender(
      <kit.TKTelegramProvider webApp={telegram.webApp} signalReady={false}>
        {next}
      </kit.TKTelegramProvider>,
    );
  return { telegram, rerender };
}

describe("modal overlays suppress the native Main/Secondary buttons", () => {
  it("hides both while a sheet is open and restores them after it closes", async () => {
    const { telegram, rerender } = setup(<Harness open={false} />);
    expect(telegram.webApp.MainButton?.isVisible).toBe(true);
    expect(telegram.webApp.SecondaryButton?.isVisible).toBe(true);

    rerender(<Harness open />);
    expect(telegram.webApp.MainButton?.isVisible).toBe(false);
    expect(telegram.webApp.SecondaryButton?.isVisible).toBe(false);

    rerender(<Harness open={false} />);
    // The sheet stays mounted for its exit transition; the buttons come back
    // when it actually unmounts.
    await waitFor(() => expect(telegram.webApp.MainButton?.isVisible).toBe(true));
    expect(telegram.webApp.SecondaryButton?.isVisible).toBe(true);
  });

  it('nativeButtons="keep" leaves the native buttons to the overlay', () => {
    const { telegram, rerender } = setup(<Harness open={false} nativeButtons="keep" />);
    rerender(<Harness open nativeButtons="keep" />);
    expect(telegram.webApp.MainButton?.isVisible).toBe(true);
    expect(telegram.webApp.SecondaryButton?.isVisible).toBe(true);
  });

  it("nested overlays compose: the buttons stay hidden until the LAST one closes", async () => {
    function Nested({ outer, inner }: { outer: boolean; inner: boolean }) {
      return (
        <>
          <Buttons />
          <kit.TKSheet open={outer} onClose={() => {}} title="Outer">
            <div>outer-body</div>
          </kit.TKSheet>
          <kit.TKDialog open={inner} onClose={() => {}} title="Inner" />
        </>
      );
    }
    const { telegram, rerender } = setup(<Nested outer inner />);
    expect(telegram.webApp.MainButton?.isVisible).toBe(false);

    rerender(<Nested outer inner={false} />);
    // The dialog left, the sheet is still up — stays suppressed.
    await waitFor(() => expect(document.body.textContent).not.toContain("Inner"));
    expect(telegram.webApp.MainButton?.isVisible).toBe(false);

    rerender(<Nested outer={false} inner={false} />);
    await waitFor(() => expect(telegram.webApp.MainButton?.isVisible).toBe(true));
  });
});
