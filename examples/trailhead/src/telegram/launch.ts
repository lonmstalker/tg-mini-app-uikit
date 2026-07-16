import type { TelegramWebApp } from "@tg-mini-app/telegram";

/**
 * Is this `window.Telegram.WebApp` a REAL client bridge, or the stub the
 * official script creates when it runs outside Telegram?
 *
 * The robust signal is `platform`: a real client always stamps its platform
 * into the launch params (ios/android/tdesktop/macos/weba/…), while the
 * outside-Telegram stub stays `"unknown"`. `initData` is NOT a presence
 * signal — real launches can carry an empty one (e.g. a main Mini App opened
 * from the bot profile), and classifying those as "browser" ran the app in
 * the DOM-fallback mode INSIDE Telegram: no native MainButton, no expand(),
 * an unmanaged viewport — the pay bar landed half below the visible area
 * (wiki/device-testing.md #6). Validating initData is the SERVER's auth job.
 */
export function isRealTelegramBridge(
  bridge: Pick<TelegramWebApp, "platform"> | null | undefined,
): bridge is Pick<TelegramWebApp, "platform"> {
  return !!bridge && typeof bridge.platform === "string" && bridge.platform !== "unknown" && bridge.platform !== "";
}
