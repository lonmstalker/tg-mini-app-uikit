# Changelog

## 0.2.0

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
