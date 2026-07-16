import type { TelegramWebApp } from "./types";

/*
 * Version gating. Telegram clients ship features incrementally, and calling a
 * method the running client predates throws (mirroring the old-clients haptics
 * case at buttons.ts). `wa.isVersionAtLeast(v)` is the only reliable signal —
 * mere method presence on the injected object is not enough — so every platform
 * call below and every hook's `isSupported` is gated through `tkSupports`.
 */

/** Minimum Bot API version a feature needs, keyed by capability. */
export const TK_MIN_VERSION = {
  cloudStorage: "6.9",
  setHeaderColor: "6.1",
  setBackgroundColor: "6.1",
  setBottomBarColor: "7.10",
  secondaryButton: "7.10",
  fullscreen: "8.0",
  activity: "8.0",
  homeScreen: "8.0",
  biometric: "7.2",
  location: "8.0",
  sensors: "8.0",
  shareToStory: "7.8",
  setEmojiStatus: "8.0",
  downloadFile: "8.0",
  shareMessage: "8.0",
  scanQrPopup: "6.4",
  switchInlineQuery: "6.6",
  requestContact: "6.9",
  writeAccess: "6.9",
  requestChat: "9.6",
} as const;

/**
 * True when the running client is at least `minVersion`. Returns false for a
 * missing WebApp or a client too old to report its version, so it is safe to
 * gate any platform call with it.
 */
export function tkSupports(wa: TelegramWebApp | undefined, minVersion: string): boolean {
  return !!wa?.isVersionAtLeast?.(minVersion);
}
