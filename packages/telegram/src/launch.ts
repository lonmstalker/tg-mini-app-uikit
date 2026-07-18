import type { TelegramWebApp } from "./types";
import { getTelegramWebApp } from "./provider";

/*
 * App-entry launch resolution. Getting this right took three real-device
 * iterations in the Trailhead demo (wiki/device-testing.md #6 and
 * wiki/ios-debugging.md), so the kit owns the whole sequence:
 *
 *   const bridge = await tkResolveTelegramBridge();
 *   // bridge !== null  → a REAL Telegram client: render the native path
 *   // bridge === null  → a plain browser: render DOM fallbacks / a mock
 */

/**
 * Is this `window.Telegram.WebApp` a REAL client bridge, or the stub the
 * official script creates when it runs outside Telegram?
 *
 * The robust signal is `platform`: a real client always stamps its platform
 * into the launch params (ios/android/tdesktop/macos/weba/…), while the
 * outside-Telegram stub stays `"unknown"`. `initData` is NOT a presence
 * signal — real launches can carry an empty one (e.g. a main Mini App opened
 * from the bot profile), and classifying those as "browser" runs the app in
 * the DOM-fallback mode INSIDE Telegram: no native MainButton, no expand(),
 * an unmanaged viewport. Validating initData is the SERVER's auth job.
 */
export function isRealTelegramBridge(
  bridge: Pick<TelegramWebApp, "platform"> | null | undefined,
): bridge is Pick<TelegramWebApp, "platform"> {
  return !!bridge && typeof bridge.platform === "string" && bridge.platform !== "unknown" && bridge.platform !== "";
}

/**
 * Resolve the launch environment, loading the vendored bridge when needed.
 *
 * - A host-provided `window.Telegram.WebApp` (a real client that pre-injects,
 *   a test harness) is respected and never overwritten — the vendored script
 *   assigns the global unconditionally, so it is only imported when the
 *   global is absent (bundled app chunk: same origin, properly awaited — not
 *   a runtime telegram.org fetch that can lose a race on a slow route).
 * - The outside-Telegram stub the script creates (platform `"unknown"`) is
 *   DELETED: keeping it would hide DOM fallbacks and call unsupported APIs.
 * - SSR-safe: resolves `null` without touching the DOM.
 */
export async function tkResolveTelegramBridge(): Promise<TelegramWebApp | null> {
  if (typeof window === "undefined") return null;
  if (!getTelegramWebApp()) {
    try {
      await import("../bridge/telegram-web-app.cjs");
    } catch {
      /* bridge chunk unreachable — stay an honest plain browser */
    }
  }
  const bridge = getTelegramWebApp();
  if (!bridge) return null;
  if (isRealTelegramBridge(bridge)) return bridge;
  const host = window as { Telegram?: { WebApp?: unknown } };
  if (host.Telegram?.WebApp === bridge) {
    delete host.Telegram.WebApp;
  }
  return null;
}
