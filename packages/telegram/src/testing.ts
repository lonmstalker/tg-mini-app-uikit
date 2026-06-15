/**
 * Dev/test-only mock of the Telegram WebApp host (`@tg-mini-app/telegram/testing`).
 * Tree-shakeable and `sideEffects:false`, so it never lands in a production
 * bundle — import it only from tests, stories, and demo dev shells.
 */
export * from "./mock";
