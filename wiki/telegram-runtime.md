# Telegram runtime layer


**Summary**: Typed hooks over `window.Telegram.WebApp`, an injectable mock for
browser/test runs, centralized back-button arbitration, and a vertical-swipe guard
that stops gestures from minimizing the Mini App.
**Status**: verified
**Updated**: 2026-06-14

---

## Provider and mock injection

- `TKTelegramProvider` (`packages/uikit/src/foundation/telegram/provider.tsx`)
  supplies the bridge to all `use*` hooks. Its `webApp?: TelegramWebApp` prop
  overrides `window.Telegram.WebApp`; inject a mock here. With no prop it falls
  back to `getTelegramWebApp()`, which returns `null` off-Telegram.
- The mock factory is `createMockTelegram({ colorScheme })` in
  `packages/uikit/test/support/telegram/mock.ts`. It is NOT a public export today.
  Only option is `colorScheme?: "light" | "dark"`. Platform is fixed to `"ios"` —
  there is no platform option. The returned handle adds `setColorScheme(...)` and
  `setDeviceCutouts(boolean)` for live control. The [[trailhead-demo]] plan
  promotes it to a public `tg-mini-app-uikit/testing` subpath.

## Back-button arbitration

- `useBackIntercept(active, handler, showNativeButton = true)` pushes onto a LIFO
  `backQueue` in the provider. An open overlay closes before the nav stack pops,
  before the app minimizes — no custom wiring needed. [[navstack]] uses it.

## Vertical-swipe guard (audit #1–#3 — RESOLVED)

- In Telegram a downward swipe is the native "minimize/close" gesture. The kit now
  neutralizes it where it matters: `src/internal/useVerticalSwipeGuard.ts` is wired
  into `TKSheet`, `TKDialog`, `TKActionSheet`, and `TKPullToRefresh`, and `TKPage`
  sets `overscroll-behavior: contain`. So the demo inherits correct behavior; the
  job is to VERIFY, not re-fix. The standalone hook `useVerticalSwipes()` returns
  `{ isEnabled, enable, disable, isSupported }`.
- CONTRADICTION FLAG: the root `plans.md` audit snapshot (now deleted from the
  working tree; in git history, `git show HEAD:plans.md`) listed #1–#3 as open. It
  is stale — trust the working tree, re-verify before treating any audit finding as
  open. See [[testing-and-review]].

## Capabilities used by the demo

`useMainButton`, `useBackButton`, `useHaptics`, `useInvoice` (real `openInvoice`
round-trip, `capabilities.ts`), `useQrScanner`, `useBiometrics`, `useLocation`,
`useCloudStorage` / `useSecureStorage` / `useDeviceStorage`, `useClosingConfirmation`
(declarative `(enabled: boolean)`), `useTelegramTheme`, `useHomeScreen`, `useKeyboard`.

## Related

- [[navstack]] · [[trailhead-demo]] · [[testing-and-review]]

## Sources

- evidence: `provider.tsx`, `test/support/telegram/mock.ts`, `device.ts`,
  `internal/useVerticalSwipeGuard.ts`, `capabilities.ts`.
