<div align="center">

# Telegram Mini App UIKit

**iOS-flavored React UI kit for Telegram Mini Apps** — design tokens, springy motion,
production-shaped components and a full Bot API 9.6 WebApp platform layer with a browser-testable Telegram mock.

[![CI](https://github.com/lonmstalker/tg-mini-app-uikit/actions/workflows/ci.yml/badge.svg)](https://github.com/lonmstalker/tg-mini-app-uikit/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](packages/uikit)
[![React](https://img.shields.io/badge/React-18%20·%2019-61DAFB?logo=react&logoColor=black)](packages/uikit/package.json)
[![Runtime deps](https://img.shields.io/badge/runtime%20deps-zero-success)](packages/uikit/package.json)

<img src="docs/demo.gif" width="340" alt="UIKit Storybook recording with checkout, Telegram platform states, and component motion" />

*Package-local Storybook, Telegram runtime test support, and unit/e2e gates for reusable Mini App UI elements.*

</div>

## Highlights

- **Broad component surface** — typography, form primitives, buttons, inputs, selectable rows, lists, generic/domain cards, overlays, feedback, booking/commerce/game/chat/feed/forms patterns and wallet-status adapters.
- **Design tokens all the way down.** One `TKProvider` re-themes the whole tree: light/dark, accent, radius scale, motion character & speed, type scale. The `telegram` flag maps every token to the user's live `--tg-theme-*` palette.
- **Telegram platform layer.** Typed `window.Telegram.WebApp` bindings with graceful no-op fallbacks: native buttons, viewport/fullscreen/safe areas, haptics, popups, storage, links, invoice, share, QR, clipboard, permissions, home screen and device APIs — plus an injectable mock for tests.
- **Layout primitives** — `TKPage`, `TKSafeArea`, `TKBottomBar` combine `env(safe-area-inset-*)` with live Telegram insets, so notches, home bars and fullscreen chrome are handled once.
- **Accessible by default.** Combobox select/multiselect, focus-trapped overlays with `Escape`/focus-return, visually-hidden helpers, tappable primitives, `role="slider"` with arrow keys, `prefers-reduced-motion` support.
- **Fast & offline-friendly.** Compositor-only animations (transform/opacity), lazy images with skeleton/error states, system font stack, zero network calls at runtime and zero runtime dependencies beyond the React 18/19 peer pair.

## Why this kit

- More Telegram-specific than **Konsta**: this kit ships invoices, Telegram storage, haptics, back priorities, safe areas, fullscreen, sensors and a browser mock as first-class APIs.
- Lighter than **TelegramUI** for app teams that want strict TypeScript, React 19 readiness and no runtime dependency stack beyond React.
- More focused than **VKUI** for mini apps: instead of a general social-platform design system, this repo is built around Telegram WebApp constraints, Bot API 9.6 and reusable TMA flows.
- TON-friendly without coupling: wallet UI is exposed as visual adapters, not a bundled wallet protocol.

## Quick start

```bash
npm install
npm run stories    # Storybook component explorer at http://localhost:6006
npm run build      # builds the library (dist/ + .d.ts)
npm run typecheck  # strict TS for the package workspace
npm run docs:dev   # local static documentation site
```

## Using the kit

```tsx
import {
  TKProvider,
  TKPage,
  TKMainButton,
  useTelegramTheme,
  useMainButton,
  useHaptics,
} from "tg-mini-app-uikit";

export function App() {
  const theme = useTelegramTheme();       // follows WebApp.colorScheme + themeChanged
  const haptics = useHaptics();           // no-op outside Telegram — always safe to call

  // Native Telegram Main button, declaratively. Hidden again on unmount.
  useMainButton({
    text: "Pay $24.00",
    onClick: () => {
      haptics.notification("success");
      api.pay();
    },
  });

  return (
    <TKProvider theme={theme} telegram style={{ height: "100dvh" }}>
      <TKPage>{/* …screens built from the kit… */}</TKPage>
    </TKProvider>
  );
}
```

Full guide — theming, design tokens, component inventory, conventions — in
[`docs/site/pages`](docs/site/pages) and [`packages/uikit/README.md`](packages/uikit/README.md).
AI-oriented usage maps live in [`llms.txt`](llms.txt) and [`docs/llms-full.md`](docs/llms-full.md).

## Telegram platform layer

Every hook works against `window.Telegram.WebApp`, degrades to a sensible
fallback in a plain browser, and accepts a mock via `<TKTelegramProvider webApp={…}>`:

| Hook | What it does | Outside Telegram |
| ---- | ------------ | ---------------- |
| `useWebApp()` / `useTelegramEvent()` | Raw WebApp access and typed event subscription | `undefined` / no-op |
| `useTelegramTheme()` | Live light/dark scheme | falls back to `"light"` |
| `useMainButton(params)` / `useSecondaryButton(params)` | Declarative native bottom buttons (text, visible, loading, disabled) | no-op |
| `useBackButton(onBack)` / `useSettingsButton(onClick)` | Header buttons with auto show/hide | no-op |
| `useViewport()` / `useFullscreen()` / `useActivity()` | Sheet height, fullscreen and active state | static defaults / unsupported |
| `useSafeArea()` | Device cutouts + Telegram chrome insets, event-synced | zeroes |
| `useHaptics()` | `impact` / `notification` / `selection` | no-op |
| `useTelegramPopup()` | Promisified `alert` / `confirm` / 3-button popup | `window.alert`/`confirm` |
| `useCloudStorage()` / `useDeviceStorage()` / `useSecureStorage()` | Promisified key-value storage, including bulk helpers | scoped `localStorage` |
| `useInitData()` | `user`, `startParam`, raw init data | `undefined`s |
| `useTelegramLinks()` / `useInvoice()` / `useShare()` / `useDataTransport()` | Links, payments, prepared shares, `sendData`, inline mode | browser-safe fallbacks or unsupported |
| `useClipboard()` / `useQrScanner()` / `useContactRequest()` / `useWriteAccess()` | Permission and native capability prompts | browser clipboard or unsupported |
| `useHomeScreen()` / `useEmojiStatus()` / `useDownloadFile()` / `useChatRequest()` / `useHideKeyboard()` | Bot API 8-9.6 client capabilities | unsupported or browser equivalent |
| `useBiometrics()` / `useLocation()` / `useMotionSensors()` | Permission-heavy device APIs | unsupported |
| `useClosingConfirmation(enabled)` | "Ask before closing" while mounted | no-op |

Test support ships a [complete in-memory mock](packages/uikit/test/support/telegram/mock.ts) of the
WebApp API, so hooks can be tested with `<TKTelegramProvider webApp={mock.webApp}>`
without leaving the browser.

## Storybook

For isolated component work, run `npm run stories`: Storybook exposes theme,
accent, roundness, locale, RTL, density, motion and preset controls. Stories
live inside the package under `packages/uikit/storybook/<category>`; atoms live
under `packages/uikit/storybook/atoms`.

The Playwright e2e smoke suite exercises Storybook iframe stories, so each
element slice can carry unit, Storybook and e2e evidence together.

## Testing

CI runs these gates on every PR; all of them run locally too:

| Gate | Command | What it covers |
| --- | --- | --- |
| Unit (vitest + Testing Library) | `npm run test:unit` | hooks, slider/stepper/OTP logic, MainButton state machine, toast eviction, the whole Telegram layer (mapping, events, fallbacks, promisified APIs), SSR `renderToString` of every export, type-level API surface |
| E2E + a11y (Playwright) | `npm run test:e2e` | Storybook iframe smoke coverage for implemented element stories |
| Component explorer | `npm run check:stories && npm run stories:build` | package-local Storybook coverage and static explorer compilation |
| Packaging | `npm run check:package` | zero runtime deps, publint, arethetypeswrong, size-limit budgets incl. tree-shaking |
| Documentation | `npm run docs:check && npm run docs:build` | static docs pages, AI docs, README positioning, release notes and docs workflow |
| Typecheck + build | `npm run typecheck && npm run build` | strict TS across the workspace |

## Project structure

```
packages/uikit     → tg-mini-app-uikit — the library (TypeScript, design tokens, components + hooks)
packages/uikit/storybook → package-local Storybook stories grouped by UIKit category
e2e/               → Playwright Storybook smoke suites
docs/              → README assets, static documentation source, llms-full.md
```

## License

[MIT](LICENSE)
