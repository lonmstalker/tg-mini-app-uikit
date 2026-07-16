import { describe, expect, it } from "vitest";
import { isRealTelegramBridge } from "./launch";

/* Device-testing finding #6 v2 (wiki/device-testing.md): a real client with an
 * EMPTY initData (a legitimate launch shape — e.g. the main Mini App opened
 * from the bot profile) must still be recognized as Telegram. Classifying it
 * as "browser" ran the DOM-fallback mode inside the client: no native
 * MainButton, no expand(), the pay bar half below the visible area. */

describe("isRealTelegramBridge — classify by platform, not initData", () => {
  it("keeps a real client even when initData is empty (the finding-#6 launch shape)", () => {
    expect(isRealTelegramBridge({ platform: "ios" })).toBe(true);
    expect(isRealTelegramBridge({ platform: "android" })).toBe(true);
    expect(isRealTelegramBridge({ platform: "tdesktop" })).toBe(true);
  });

  it("drops the outside-Telegram stub (platform 'unknown' — the script's default)", () => {
    expect(isRealTelegramBridge({ platform: "unknown" })).toBe(false);
  });

  it("drops a missing or malformed bridge", () => {
    expect(isRealTelegramBridge(null)).toBe(false);
    expect(isRealTelegramBridge(undefined)).toBe(false);
    expect(isRealTelegramBridge({ platform: "" })).toBe(false);
    expect(isRealTelegramBridge({ platform: undefined as unknown as string })).toBe(false);
  });
});
