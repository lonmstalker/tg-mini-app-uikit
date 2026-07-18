/*
 * The vendored official bridge (bridge/telegram-web-app.cjs) is a
 * side-effect-only script: importing it assigns `window.Telegram.WebApp`.
 * This ambient declaration lets `tkResolveTelegramBridge` import it lazily.
 */
declare module "*telegram-web-app.cjs";
