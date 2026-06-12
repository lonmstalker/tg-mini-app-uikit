<div align="center">

# Telegram Mini App UIKit

**iOS-flavored React UI kit for Telegram Mini Apps** — design tokens, springy motion,
production-shaped components and a full WebApp platform layer with a browser-testable Telegram mock.

[![CI](https://github.com/lonmstalker/tg-mini-app-uikit/actions/workflows/ci.yml/badge.svg)](https://github.com/lonmstalker/tg-mini-app-uikit/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](packages/uikit)
[![React](https://img.shields.io/badge/React-18%20·%2019-61DAFB?logo=react&logoColor=black)](packages/uikit/package.json)
[![Runtime deps](https://img.shields.io/badge/runtime%20deps-zero-success)](packages/uikit/package.json)

<img src="docs/demo.gif" width="340" alt="Demo recorded from the real app: shop checkout, Platform Lab Telegram APIs, and component gallery motion" />

*Five production-shaped mini-app flows plus a Telegram Platform Lab, captured from the real demo and built only with kit exports.*

</div>

## Highlights

- **Broad component surface** — typography, form primitives, buttons, inputs, selectable rows, lists, generic/domain cards, overlays, feedback, booking/commerce/game patterns and wallet-status adapters.
- **Design tokens all the way down.** One `TKProvider` re-themes the whole tree: light/dark, accent, radius scale, motion character & speed, type scale. The `telegram` flag maps every token to the user's live `--tg-theme-*` palette.
- **Telegram platform layer.** Typed `window.Telegram.WebApp` bindings with graceful no-op fallbacks: native buttons, viewport/fullscreen/safe areas, haptics, popups, storage, links, invoice, share, QR, clipboard, permissions, home screen and device APIs — plus an injectable mock for tests and demos.
- **Layout primitives** — `TKPage`, `TKSafeArea`, `TKBottomBar` combine `env(safe-area-inset-*)` with live Telegram insets, so notches, home bars and fullscreen chrome are handled once.
- **Accessible by default.** Combobox select/multiselect, focus-trapped overlays with `Escape`/focus-return, visually-hidden helpers, tappable primitives, `role="slider"` with arrow keys, `prefers-reduced-motion` support.
- **Fast & offline-friendly.** Compositor-only animations (transform/opacity), lazy images with skeleton/error states, system font stack, zero network calls at runtime.

## Why this kit

- Wider than **Mark42** on component coverage and WebApp hooks, while keeping the same no-framework, tree-shakeable feel.
- Lighter than **TelegramUI** for app teams that want an iOS-flavored system, strict TypeScript and no runtime dependency stack beyond React.
- TON-friendly without coupling: wallet UI is exposed as visual adapters, not a bundled wallet protocol.

## Quick start

```bash
npm install
npm run dev        # demo at http://localhost:5173 (kit sources are aliased — instant HMR)
npm run build      # builds the library (dist/ + .d.ts) and the demo
npm run typecheck  # strict TS across both workspaces
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
[`packages/uikit/README.md`](packages/uikit/README.md).

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

Five example mini-apps, each written the way a real one would be — screens, state, data — using only kit components:

- **Shop** — storefront: catalog with search/categories, product sheet, cart, payment with a decline/retry path and a receipt timeline.
- **Booking** — appointment flow: service list → slot picker → confirm → live status timeline.
- **Game** — gamified app: XP header, stat tiles, weekly chart, leaderboard, daily reward.
- **Platform** — the Telegram platform lab: mock client chrome, native buttons, fullscreen/viewport drag, safe-area visualizer, haptics, popups, storage managers, QR/clipboard/permissions/share/payment/device API events.
- **Kit** — live gallery of every export, including loading/error/disabled, form, overlay and long-content stress states.

On desktop the active app runs inside an iPhone frame next to a **Tweaks** panel (itself built from the kit): theme, accent, roundness, motion and type scale — every knob maps to a design token and restyles the apps live. On narrow screens the app takes over the whole viewport, like a real mini app.

### What the demo proves

- Components are not just isolated screenshots: commerce, booking, game and gallery flows keep real state.
- The Telegram layer is testable: `<TKTelegramProvider webApp={mock}>` drives native buttons, client chrome, events and fallbacks in a normal browser.
- The README animation is regenerated from scripted browser interactions, not hand-picked screenshots.

## Project structure

```
packages/uikit     → tg-mini-app-uikit — the library (TypeScript, design tokens, components + hooks)
examples/demo      → demo app: five example mini-apps consuming the kit
docs/              → README assets
```

## License

[MIT](LICENSE)
