# Changelog

## 0.3.0 — 2026-07-12

This release also ships the m2–m10 audit wave and the keyboard/viewport/nav
overhaul (flicker-free keyboard, exit animations, scoped nested tokens, TKApp
bootstrap, TKPage onRefresh, TKKeepMountTabs) — the full per-package notes
live in `packages/uikit/CHANGELOG.md` and `packages/telegram/CHANGELOG.md`.

The non-UI layers move into their own DDD-bounded, publishable packages; `tg-mini-app-uikit` keeps only UI and depends on the platform package as a peer. The kit's public surface is unchanged for existing consumers (a re-export shim), so this is a minor — the one action is adding the `@tg-mini-app/telegram` peer dependency.

### New packages

- `@tg-mini-app/telegram` — the Telegram WebApp bridge (provider, back-button queue, native buttons, storage, capabilities, sensors, layout/theme). Owns the `TKTheme` type. Subpath `@tg-mini-app/telegram/testing` exports `createMockTelegram` (dev-only, `sideEffects:false`).
- `@tg-mini-app/intl` — `createI18n` + `Intl.PluralRules` plurals + `resolveLang` + locale-aware date helpers.
- `@tg-mini-app/async` — `useAsync`, `useTKInfiniteData` (cursor pagination FSM), the `Page<T>` contract, `createMockGate`.

### Breaking changes

- `tg-mini-app-uikit` now declares `@tg-mini-app/telegram` as a **peer dependency** — install it alongside the kit. Platform hooks still re-export from `tg-mini-app-uikit` (deprecated shim); prefer importing them from `@tg-mini-app/telegram`.

### Added

- Restored the `TKCloudStorage` / `TKInitData` type exports the previous barrel dropped.
- New UI: `AsyncBoundary` / `TKAsyncState` (loading → skeleton / error → retry / empty), `TKTabView` (keep-mounted tabs), `useHasNativeChrome()`, and `TKHeader back="auto"`.
- Kit a11y/correctness hardening: overlay Escape closes only the top layer, native Back-button reference counting, roving keyboard nav on `TKTabbar`/`TKPageDots`/`TKSteps`, keyboard-operable searchable `TKSelect`, `TKFileInput` re-pick, standalone `TKSwitch` haptics, assertive error toasts.

### Migration

- Add `@tg-mini-app/telegram` to your dependencies. No import changes are required (the kit re-exports it), but moving platform imports to `@tg-mini-app/telegram` is recommended. See `docs/migration-v0.3.md` and `scripts/codemod-v0.3.mjs`.

## 0.2.0 — 2026-06-15

### Breaking changes

These breaking changes are intentional and belong to the 0.2.0 migration.

- Components with meaningful DOM roots now use `forwardRef`; code that depended on function component identity should treat exports as normal React components.
- `TKLocaleProvider` centralizes built-in user-facing strings. Override text through locale values or explicit component props instead of relying on hardcoded English.
- `TKButton`, `TKCell`, `TKCardCell` and `TKTappable` use the new polymorphic `as` conventions for link-like rendering.

### Added

- Full Bot API 9.6 platform layer coverage in the demo mock, including invoices, biometrics, storages, sensors and fullscreen APIs.
- New Telegram-ready patterns: calendar/date input, pull-to-refresh, swipe cells, `TKNavStack`, chat, onboarding tooltip, confetti, virtual lists and feed/wallet/support/forms demos.
- Documentation site scripts, `llms.txt`, `docs/llms-full.md` and docs CI.

### Migration

- Import `TKLocaleProvider` when the app needs non-English defaults.
- Prefer `testId` for stable selectors; it renders to `data-testid`.
- Use `useBackIntercept` for custom close/pop priority instead of wiring the Telegram Back button directly.
