---
"tg-mini-app-uikit": minor
---

Split the non-UI layers into DDD-bounded, publishable packages and keep `tg-mini-app-uikit` UI-only.

- New packages: `@tg-mini-app/telegram` (platform bridge + `./testing` mock), `@tg-mini-app/intl` (`createI18n`, `Intl.PluralRules` plurals, `resolveLang`, date helpers), `@tg-mini-app/async` (`useAsync`, `useTKInfiniteData`, `Page<T>`, `createMockGate`).
- `tg-mini-app-uikit` now depends on `@tg-mini-app/telegram` as a **peer dependency** and re-exports it for source compatibility (a `@deprecated` shim) — the public surface is unchanged, so existing imports keep working; add the peer to your dependencies.
- Restores the previously-dropped `TKCloudStorage` / `TKInitData` type exports.
- Adds `AsyncBoundary`/`TKAsyncState`, `TKTabView`, `useHasNativeChrome`, `TKHeader back="auto"`, and the M1 a11y/correctness fixes.

The three new packages publish at their initial `0.1.0`. See `docs/migration-v0.3.md`.
