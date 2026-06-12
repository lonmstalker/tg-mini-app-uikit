# Telegram Mini App UIKit

iOS-flavored React UI kit for Telegram Mini Apps, plus example projects built on it.

```
packages/uikit     → tg-mini-app-uikit — the library (TypeScript, design tokens, ~45 components)
examples/demo      → demo app: four example mini-apps consuming the kit
raw/               → original static prototype (React UMD + Babel in the browser), kept for reference
```

## Getting started

```bash
npm install
npm run dev        # demo at http://localhost:5173 (kit sources are aliased — instant HMR)
npm run build      # builds the library (dist/ + .d.ts) and the demo
npm run typecheck  # strict TS across both workspaces
```

## The demo

Four example projects, each written the way a real mini app would be — screens, state, data — using only kit components:

- **Shop** — storefront: catalog with search/categories, product bottom sheet, cart with stepper rows + payment summary + Telegram-style main button, profile with settings (its dark-mode cell drives the real theme).
- **Booking** — appointment flow: service list → slot picker → confirm, then a live status timeline.
- **Game** — gamified app: XP header, stat tiles, weekly chart, leaderboard, daily reward, action sheet.
- **Components** — live gallery of every kit export.

On desktop the active app runs inside an iPhone frame next to a **Tweaks** panel (itself built from the kit): theme, accent, roundness, motion and type scale — every knob maps to a design token and restyles the apps live. On narrow screens the app takes over the whole viewport, like a real mini app.

## Using the kit

See [`packages/uikit/README.md`](packages/uikit/README.md) for the full guide: theming, design tokens, the Telegram WebApp integration (`telegram` flag + `useTelegramTheme()`), component inventory and the migration map from the `raw/` prototype.

```tsx
import { TKProvider, TKMainButton, useTelegramTheme } from "tg-mini-app-uikit";

export function App() {
  const theme = useTelegramTheme();
  return (
    <TKProvider theme={theme} telegram style={{ height: "100dvh" }}>
      <TKMainButton label="Pay $24.00" successLabel="Paid" onClick={() => api.pay()} />
    </TKProvider>
  );
}
```
