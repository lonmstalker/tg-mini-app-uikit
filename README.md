<div align="center">

# Telegram Mini App UIKit

**iOS-flavored React UI kit for Telegram Mini Apps** — design tokens, springy motion,
and a full WebApp platform layer (native buttons, haptics, viewport, safe areas, cloud storage).

[![CI](https://github.com/lonmstalker/tg-mini-app-uikit/actions/workflows/ci.yml/badge.svg)](https://github.com/lonmstalker/tg-mini-app-uikit/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](packages/uikit)
[![React](https://img.shields.io/badge/React-18%20·%2019-61DAFB?logo=react&logoColor=black)](packages/uikit/package.json)
[![Runtime deps](https://img.shields.io/badge/runtime%20deps-zero-success)](packages/uikit/package.json)

<img src="docs/demo.gif" width="340" alt="Demo: shop checkout with payment receipt, Platform Lab with native Telegram buttons and dark theme, component gallery" />

*Shop checkout → Platform Lab (mock Telegram client) → component gallery. Everything in the demo is built from the kit.*

</div>

## Highlights

- **50+ components & hooks** — buttons, inputs, lists, cards, overlays, charts, booking/commerce patterns. Zero runtime dependencies besides React, no CSS framework.
- **Design tokens all the way down.** One `TKProvider` re-themes the whole tree: light/dark, accent, radius scale, motion character & speed, type scale. The `telegram` flag maps every token to the user's live `--tg-theme-*` palette.
- **Telegram platform layer.** Typed `window.Telegram.WebApp` bindings with graceful no-op fallbacks: `useMainButton`, `useBackButton`, `useViewport`, `useSafeArea`, `useHaptics`, `useTelegramPopup`, `useCloudStorage`, `useInitData` and more — plus an injectable mock for tests and demos.
- **Layout primitives** — `TKPage`, `TKSafeArea`, `TKBottomBar` combine `env(safe-area-inset-*)` with live Telegram insets, so notches, home bars and fullscreen chrome are handled once.
- **Accessible by default.** Combobox select with full keyboard support, focus-trapped overlays with `Escape`/focus-return, `role="slider"` with arrow keys, `prefers-reduced-motion` support.
- **Fast & offline-friendly.** Compositor-only animations (transform/opacity), lazy images with skeleton/error states, system font stack, zero network calls at runtime.

## Quick start

```bash
npm install
npm run dev        # demo at http://localhost:5173 (kit sources are aliased — instant HMR)
npm run build      # builds the library (dist/ + .d.ts) and the demo
npm run typecheck  # strict TS across both workspaces
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
| `useTelegramTheme()` | Live light/dark scheme | falls back to `"light"` |
| `useMainButton(params)` / `useSecondaryButton(params)` | Declarative native bottom buttons (text, visible, loading, disabled) | no-op |
| `useBackButton(onBack)` / `useSettingsButton(onClick)` | Header buttons with auto show/hide | no-op |
| `useViewport()` | `height`, `stableHeight`, `isExpanded`, `expand()` | static defaults |
| `useSafeArea()` | Device cutouts + Telegram chrome insets, event-synced | zeroes |
| `useHaptics()` | `impact` / `notification` / `selection` | no-op |
| `useTelegramPopup()` | Promisified `alert` / `confirm` / 3-button popup | `window.alert`/`confirm` |
| `useCloudStorage()` | Promisified CloudStorage | `localStorage` |
| `useInitData()` | `user`, `startParam`, raw init data | `undefined`s |
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
- **Platform** — the Telegram platform lab: mock client chrome, native Main/Back/Settings buttons, viewport expand/collapse with a draggable grabber, safe-area visualizer, haptics, popups, cloud storage, event log.
- **Kit** — live gallery of every export, including loading/error/disabled and long-content stress states.

On desktop the active app runs inside an iPhone frame next to a **Tweaks** panel (itself built from the kit): theme, accent, roundness, motion and type scale — every knob maps to a design token and restyles the apps live. On narrow screens the app takes over the whole viewport, like a real mini app.

## Project structure

```
packages/uikit     → tg-mini-app-uikit — the library (TypeScript, design tokens, components + hooks)
examples/demo      → demo app: five example mini-apps consuming the kit
docs/              → README assets
```

## License

[MIT](LICENSE)
