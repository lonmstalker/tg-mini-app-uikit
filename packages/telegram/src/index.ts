/**
 * @tg-mini-app/telegram — the Telegram Mini Apps platform bridge over
 * `window.Telegram.WebApp` (Bot API 9.6). The public surface mirrors the kit's
 * former `foundation/telegram` barrel exactly, so `tg-mini-app-uikit`'s
 * re-export shim is transparent — plus the storage types the old barrel
 * accidentally dropped. `version` (tkSupports / TK_MIN_VERSION) and
 * `createStorageApi` stay internal, as they were before.
 */
export * from "./types";
export * from "./provider";
export * from "./layout";
export * from "./buttons";
export { useCloudStorage, useInitData, useClosingConfirmation } from "./storage";
export type { TKCloudStorage, TKInitData } from "./storage";
export * from "./capabilities";
export * from "./identity";
export * from "./device";
export * from "./launch";
export * from "./debug";
