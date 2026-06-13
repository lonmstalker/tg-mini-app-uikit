<div align="center">

# Telegram Mini App UIKit

**iOS-flavored React UI kit for Telegram Mini Apps** — design tokens, springy motion,
production-shaped components and a full Bot API 9.6 WebApp platform layer with a browser-testable Telegram mock.

[![CI](https://github.com/lonmstalker/tg-mini-app-uikit/actions/workflows/ci.yml/badge.svg)](https://github.com/lonmstalker/tg-mini-app-uikit/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](packages/uikit)
[![React](https://img.shields.io/badge/React-18%20·%2019-61DAFB?logo=react&logoColor=black)](packages/uikit/package.json)
[![Runtime deps](https://img.shields.io/badge/runtime%20deps-zero-success)](packages/uikit/package.json)

<img src="docs/demo.gif" width="340" alt="Demo recorded from the real app: shop checkout, Platform Lab Telegram APIs, and component gallery motion" />

*13 example mini-apps plus a Telegram Platform Lab, captured from the real demo and built only with kit exports.*

</div>

## Highlights

- **Broad component surface** — typography, form primitives, buttons, inputs, selectable rows, lists, generic/domain cards, overlays, feedback, booking/commerce/game/chat/feed/forms patterns and wallet-status adapters.
- **Design tokens all the way down.** One `TKProvider` re-themes the whole tree: light/dark, accent, radius scale, motion character & speed, type scale. The `telegram` flag maps every token to the user's live `--tg-theme-*` palette.
- **Telegram platform layer.** Typed `window.Telegram.WebApp` bindings with graceful no-op fallbacks: native buttons, viewport/fullscreen/safe areas, haptics, popups, storage, links, invoice, share, QR, clipboard, permissions, home screen and device APIs — plus an injectable mock for tests and demos.
- **Layout primitives** — `TKPage`, `TKSafeArea`, `TKBottomBar` combine `env(safe-area-inset-*)` with live Telegram insets, so notches, home bars and fullscreen chrome are handled once.
- **Accessible by default.** Combobox select/multiselect, focus-trapped overlays with `Escape`/focus-return, visually-hidden helpers, tappable primitives, `role="slider"` with arrow keys, `prefers-reduced-motion` support.
- **Fast & offline-friendly.** Compositor-only animations (transform/opacity), lazy images with skeleton/error states, system font stack, zero network calls at runtime and zero runtime dependencies beyond the React 18/19 peer pair.

## Why this kit

- More Telegram-specific than **Konsta**: this kit ships invoices, Telegram storage, haptics, back priorities, safe areas, fullscreen, sensors and a browser mock as first-class APIs.
- Lighter than **TelegramUI** for app teams that want strict TypeScript, React 19 readiness and no runtime dependency stack beyond React.
- More focused than **VKUI** for mini apps: instead of a general social-platform design system, this repo is built around Telegram WebApp constraints, Bot API 9.6 and TMA demo flows.
- TON-friendly without coupling: wallet UI is exposed as visual adapters, not a bundled wallet protocol.

## Quick start

```bash
npm install
npm run dev        # demo at http://localhost:5173 (kit sources are aliased — instant HMR)
npm run build      # builds the library (dist/ + .d.ts) and the demo
npm run typecheck  # strict TS across both workspaces
npm run docs:dev   # local static documentation site
npm run record:demo # regenerates docs/demo.gif from scripted browser interactions
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

The demo ships a [complete in-memory mock](examples/demo/src/telegram/mock.ts) of the
WebApp API — the **Platform** tab renders the "client side" (chrome, native buttons,
popups, viewport sheet) around it, so you can develop and test the whole integration
without leaving the browser.

## The demo

13 example mini-apps, each written the way a real one would be — screens, state, data — using only kit components:

- **Shop** — storefront: catalog with search/categories, product sheet, cart, payment with a decline/retry path and a receipt timeline.
- **Booking** — appointment flow: service list → slot picker → confirm → live status timeline.
- **Game** — gamified app: XP header, stat tiles, weekly chart, leaderboard, daily reward.
- **Stars** — subscription paywall using Telegram Stars invoices, receipt state and confetti.
- **Identity** — onboarding with gallery slides, contact/write-access permissions, PIN and biometrics.
- **Storage** — cloud/device/secure storage comparison with restore after simulated restart.
- **Support** — chat, quick replies, bot handoff through Telegram links and rating.
- **Arcade** — fullscreen, orientation lock and motion-sensor controls.
- **Feed** — channel cards with spoilers, blockquotes, reactions, repost and read markers.
- **Wallet** — mock TON connect/send/history flow with no network calls.
- **Forms** — form showcase with date, phone, tags, file upload, range slider and summary sheet.
- **Platform** — the Telegram platform lab: mock client chrome, native buttons, fullscreen/viewport drag, safe-area visualizer, haptics, popups, storage managers, QR/clipboard/permissions/share/payment/device API events.
- **Kit** — live gallery of every export, including loading/error/disabled, form, overlay and long-content stress states.

On desktop the active app runs inside an iPhone frame next to a **Tweaks** panel (itself built from the kit): theme, accent, roundness, motion and type scale — every knob maps to a design token and restyles the apps live. On narrow screens the app takes over the whole viewport, like a real mini app.

### What the demo proves

- Components are not just isolated screenshots: commerce, booking, game and gallery flows keep real state.
- The Telegram layer is testable: `<TKTelegramProvider webApp={mock}>` drives native buttons, client chrome, events and fallbacks in a normal browser.
- The README animation is regenerated from scripted browser interactions, not hand-picked screenshots.

## Testing

CI runs five gates on every PR; all of them run locally too:

| Gate | Command | What it covers |
| --- | --- | --- |
| Unit (vitest + Testing Library) | `npm run test:unit` | hooks, slider/stepper/OTP logic, MainButton state machine, toast eviction, the whole Telegram layer (mapping, events, fallbacks, promisified APIs), SSR `renderToString` of every export, type-level API surface |
| E2E + a11y (Playwright) | `npm run test:e2e` | flows for all demo apps, axe WCAG A/AA scans, keyboard nav, motion, ARIA snapshots, a contrast-debt budget |
| Visual regression | `npm run test:e2e:visual` | every gallery section + app screens in light/dark, component states (hover/focus/open/loading), token matrix and `--tg-theme-*` mode, WebKit (iOS WKWebView rendering), 320px reflow (WCAG 1.4.10), DPR 2–3, forced-colors |
| Packaging | `npm run check:package` | zero runtime deps, publint, arethetypeswrong, size-limit budgets incl. tree-shaking, snippet and docs gates |
| Documentation | `npm run docs:check && npm run docs:build` | static docs pages, AI docs, README positioning, release notes and docs workflow |
| Typecheck + build | `npm run typecheck && npm run build` | strict TS across the workspace |

Visual baselines exist for two platforms: `darwin` (local dev on macOS) and `linux`
(what CI compares against). After an intentional visual change regenerate both:

```bash
npm run test:e2e:update         # darwin baselines, all snapshot projects
npm run test:e2e:update:linux   # linux baselines inside mcr.microsoft.com/playwright:v1.60.0 (needs Docker)
```

CI executes the suite inside that same Playwright Docker image, so the pixel
comparison is enforced on every PR regardless of the contributor's OS.

## Project structure

```
packages/uikit     → tg-mini-app-uikit — the library (TypeScript, design tokens, components + hooks)
examples/demo      → demo app: five example mini-apps consuming the kit
e2e/               → Playwright suites: design, states, tokens, flows, a11y, motion, reflow, ARIA
docs/              → README assets, static documentation source, llms-full.md
```

## License

[MIT](LICENSE)
