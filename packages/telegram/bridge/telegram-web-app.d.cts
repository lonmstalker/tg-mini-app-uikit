/*
 * Side-effect-only module: executing it ASSIGNS `window.Telegram.WebApp`
 * unconditionally (the official Telegram bridge, vendored — see the package
 * CHANGELOG for the refresh procedure). Load it at startup only when the host
 * hasn't already provided a bridge, or you'll clobber it:
 *
 *   if (!getTelegramWebApp()) await import("@tg-mini-app/telegram/bridge");
 */
export {};
