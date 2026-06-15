# Migrating to tg-mini-app-uikit 0.3.0

0.3.0 splits the kit's non-UI layers into their own packages. **Your existing
imports keep working** — `tg-mini-app-uikit` re-exports the platform bridge — so
the migration is small.

## Required: add the platform peer

`tg-mini-app-uikit` now declares `@tg-mini-app/telegram` as a **peer
dependency**. Install it alongside the kit:

```sh
npm install @tg-mini-app/telegram
```

A single physical instance must back the Telegram context and the back-button
queue, which is why it is a peer rather than a bundled dependency.

## Recommended: import platform hooks from the package

Platform hooks (`useWebApp`, `TKTelegramProvider`, `useMainButton`,
`useCloudStorage`, `useSafeArea`, the `Telegram*`/`TKTheme` types, …) still
re-export from `tg-mini-app-uikit`, but that barrel is now `@deprecated`. Prefer:

```diff
- import { useWebApp, TKTelegramProvider } from "tg-mini-app-uikit";
+ import { useWebApp, TKTelegramProvider } from "@tg-mini-app/telegram";
```

The test/dev mock moved to a dedicated subpath (it was never a public export):

```diff
- import { createMockTelegram } from "tg-mini-app-uikit/testing";
+ import { createMockTelegram } from "@tg-mini-app/telegram/testing";
```

Run the codemod to apply both rewrites across a project:

```sh
node node_modules/tg-mini-app-uikit/scripts/codemod-v0.3.mjs src
# (in this repo: node scripts/codemod-v0.3.mjs <dir>)
```

## Optional: adopt the new engines

Two more packages ship the logic the kit used to keep private — adopt them only
if useful; nothing forces it:

- `@tg-mini-app/intl` — `createI18n` with `Intl.PluralRules` plurals,
  `resolveLang`, and locale-aware `formatDate`/`toIsoDate`.
- `@tg-mini-app/async` — `useAsync`, `useTKInfiniteData` (cursor pagination),
  `Page<T>`, `createMockGate`. Pair `useTKInfiniteData`/`useAsync` with the kit's
  new `AsyncBoundary` for loading → skeleton / error → retry / empty.

## Restored type exports

`TKCloudStorage` and `TKInitData` are exported again (a previous barrel dropped
them); `import type { TKCloudStorage } from "tg-mini-app-uikit"` resolves.
