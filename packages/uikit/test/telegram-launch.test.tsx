import { afterEach, describe, expect, it } from "vitest";
import { isRealTelegramBridge, tkResolveTelegramBridge } from "@tg-mini-app/telegram";

/* Kit-owned launch resolution (moved up from the Trailhead demo after three
 * real-device iterations — wiki/device-testing.md #6, wiki/ios-debugging.md).
 * The vendored-bridge LOADING path (no window.Telegram at all) is covered by
 * the trailhead telegram-bridge e2e in a real browser; here jsdom pins the
 * classification and stub-deletion contract. */

afterEach(() => {
  Reflect.deleteProperty(window, "Telegram");
});

describe("isRealTelegramBridge — classify by platform, not initData", () => {
  it("keeps a real client even when initData is empty (the finding-#6 launch shape)", () => {
    expect(isRealTelegramBridge({ platform: "ios" })).toBe(true);
    expect(isRealTelegramBridge({ platform: "android" })).toBe(true);
    expect(isRealTelegramBridge({ platform: "tdesktop" })).toBe(true);
  });

  it("drops the outside-Telegram stub (platform 'unknown' — the script's default)", () => {
    expect(isRealTelegramBridge({ platform: "unknown" })).toBe(false);
    expect(isRealTelegramBridge({ platform: "" })).toBe(false);
    expect(isRealTelegramBridge(null)).toBe(false);
    expect(isRealTelegramBridge(undefined)).toBe(false);
  });
});

describe("tkResolveTelegramBridge", () => {
  it("returns a host-provided real bridge untouched (never overwritten by the vendored script)", async () => {
    const real = { platform: "ios", version: "9.0" };
    (window as unknown as { Telegram?: { WebApp?: unknown } }).Telegram = { WebApp: real };
    await expect(tkResolveTelegramBridge()).resolves.toBe(real);
    expect((window as unknown as { Telegram?: { WebApp?: unknown } }).Telegram?.WebApp).toBe(real);
  });

  it("deletes the outside-Telegram stub and resolves null (keeping it would hide DOM fallbacks)", async () => {
    const stub = { platform: "unknown" };
    (window as unknown as { Telegram?: { WebApp?: unknown } }).Telegram = { WebApp: stub };
    await expect(tkResolveTelegramBridge()).resolves.toBe(null);
    expect((window as unknown as { Telegram?: { WebApp?: unknown } }).Telegram?.WebApp).toBe(undefined);
  });
});
