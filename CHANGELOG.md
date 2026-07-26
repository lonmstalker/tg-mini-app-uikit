# Changelog

## 0.8.1 — 2026-07-26

Manual-audit patch: the on-screen keyboard and real content. `TKDialog`
re-centers through the kit's keyboard controller instead of raw
`innerHeight − visualViewport.height` — no jump in the KB-4 transient
window, and plain CSS centering is kept under a host-managed viewport.
`TKOnboardingTooltip` skips its center-scroll while a text field owns focus
(the KB-3 settle-scroll class) and keeps the `.tk` portal host when gated by
a storage adapter. `TKCalendar`/`TKDateInput` month/year lists scroll their
own listbox only, and the native `TKDateInput` variant forwards consumer
`className`/`style`. `TKHeader` ellipsizes unbroken titles instead of
pushing its actions off a 320px viewport (REU-001). `TKChip` applies the
consumer `className` on the non-removable root too; `TKEllipsis` with a
controlled `expanded={true}` renders unclamped from the first paint and in
SSR markup. Skeletons are `aria-hidden` decorative placeholders; the
product-card favorite toggle exposes `aria-pressed`. In
`@tg-mini-app/telegram` 0.4.2 the `TKViewportForensics` overlay portals into
the nearest `.tk` host and stays `absolute` there, so the debug panel itself
survives the keyboard animation it exists to observe.

## 0.8.0 — 2026-07-24

Reuse-audit waves 2–3: components stop fighting their consumers. Modal
overlays and select dropdowns portal into the nearest `.tk` root /
`[data-tk-portal-root]` host, so transformed, positioned, or
`overflow: hidden` ancestors can no longer clip or displace them (Telegram
iOS-safe `position: absolute` inside a host). `TKPhoneInput` drops the
invisible `+7`/Russian-mask default in favor of the active locale (breaking
on 0.x — pass `defaultCountry="+7"` or provide `ruLocale` to keep it). The
last hardcoded strings resolve through `TKLocale` (`invalidDate`,
`invalidTime`, `month`, `year`, `amPm`), and the wave-2 reuse contracts land
across the kit: custom `icon` elements, per-instance `color`, root-reaching
`style`/`className`, no invented demo content, dev warnings for silent
coupling. Ships `tg-mini-app-uikit@0.8.0` (`@tg-mini-app/telegram@0.4.1`,
peer range `^0.4.0` unchanged); per-package notes in
`packages/*/CHANGELOG.md`.

## 0.7.0 — 2026-07-18

The keyboard saga, resolved on a real iPhone and promoted into the kit
(wiki/ios-debugging.md). `useKeyboard` learns two host-managed-keyboard modes:
KB-3 (the client resizes the webview — the settle scroll no longer dismisses
the composer's keyboard) and KB-4 (the bridge reports the keyboard-reduced
stable viewport before any visualViewport event — no transient lift, no false
height memory). New public surface: `tkResolveTelegramBridge()` /
`isRealTelegramBridge()` (kit-owned app-entry launch over the vendored
bridge), `TKAppShell` (stable-viewport-capped app column that rides the OS
keyboard animation), `useTKHostBackground()` (html/body/native-chrome
painting for bare-`TKProvider` apps), and `TKViewportForensics` (the
on-device debug overlay behind `?kbdebug=1`). Ships
`tg-mini-app-uikit@0.7.0` (`@tg-mini-app/telegram@0.4.0`, peer range bumped
accordingly); per-package notes in `packages/*/CHANGELOG.md`.

## 0.6.0 — 2026-07-16

Native-chrome arbitration: modal overlays now suppress the native Telegram
Main/Secondary buttons while open (opt out per overlay with
`nativeButtons="keep"`), and `TKHeader back` defaults to `"auto"` so an
in-DOM arrow never duplicates the native Back button for the same press.
New platform hooks: `useSuppressNativeButtons`, `useNativeButtonsSuppressed`,
`useBackButtonWanted`. Plus the real-device sweep (wiki/device-testing.md):
version gates + try/catch across the bridge hooks, reactive biometric
availability, snap-sheet drag fix, composer pointerdown fix, eased keyboard
shift, 44px hit targets. Ships `tg-mini-app-uikit@0.6.0`
(`@tg-mini-app/telegram@0.3.0`, peer range bumped accordingly);
per-package notes in `packages/*/CHANGELOG.md`.

## 0.5.0 — 2026-07-15

`TKCalendar` learns press-and-drag date-range selection (mouse/pen drag
immediately, touch after a 300 ms hold with haptic arming; the preview clips
at the first disabled date and controlled consumers get exactly one
`onRangeChange` at commit). `TKSheet` gains a `modal={false}` mode for
passive previews that must not capture document focus or lock the page.
Two fixes: the modal scroll lock restores the page position instantly (hosts
with `scroll-behavior: smooth` no longer animate from the top on close), and
the derived `--tk-*-ink` colors recompute on every provider, so a nested
light preview inside a dark page keeps readable accent text. Ships
`tg-mini-app-uikit@0.5.0` (`@tg-mini-app/telegram` stays `0.2.1`);
per-package notes in `packages/uikit/CHANGELOG.md`.

## 0.4.0 — 2026-07-14

Animation smoothness overhaul (plan phases 0–5): gestures track the finger
1:1 with zero layout/React commits per drag frame; every layout-property
animation moved to transforms (snap sheet, sliders, segmented, fills, search,
keyboard shrink) or measured-height WAAPI (accordion, collapsing header);
paint diet (`will-change` windows, static blur layers, `TKProvider
glassBars`, opacity focus rings, one shimmer per skeleton group) enforced by
the new `check-animatable-props` CI gate; familiar motion added (form error
rise/shake, header title crossfade, tab fades with preserved scroll,
skeleton→content and list-append fades, pull-progress spinner, toast FLIP);
`TKHeader back="auto"` dedups against the native Telegram Back button via
`TKNavStack.nativeBack`. Ships `tg-mini-app-uikit@0.4.0`
(`@tg-mini-app/telegram` stays `0.2.1`); per-package notes in
`packages/uikit/CHANGELOG.md`.

## 0.3.1 — 2026-07-12

Patch release: the adversarial review remediation for the 0.3.0 wave —
keyboard settle vs. page scroll, pre-shrink lifecycle, nav exit subtree
preservation, controlled-mode nav keys, the pull-to-refresh scroller gate,
the theme-correct html/body underlay, and the hardened tag-driven release
pipeline (tag↔version gate, idempotent publish guards, both packages under
publint/attw). Ships `tg-mini-app-uikit@0.3.1` and
`@tg-mini-app/telegram@0.2.1`; per-package notes in
`packages/uikit/CHANGELOG.md` and `packages/telegram/CHANGELOG.md`.

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
