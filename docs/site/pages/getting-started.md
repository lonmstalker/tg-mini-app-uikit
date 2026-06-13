# Getting Started

`tg-mini-app-uikit` is a React UI kit for Telegram Mini Apps with zero runtime dependencies, React 18/19 peer support and a full Bot API 9.6 platform layer.

```bash
npm i tg-mini-app-uikit
```

Import the CSS once, then mount the providers near your app root.

```tsx
import "tg-mini-app-uikit/style.css";
import { TKProvider, TKTelegramProvider, TKPage } from "tg-mini-app-uikit";

export function App() {
  return (
    <TKTelegramProvider haptics>
      <TKProvider telegram style={{ height: "100dvh" }}>
        <TKPage>{/* screens */}</TKPage>
      </TKProvider>
    </TKTelegramProvider>
  );
}
```

The package Storybook is the fastest way to inspect components:

```bash
npm install
npm run stories
```

The explorer runs at `http://localhost:6006`, exposes global controls for theme, accent, roundness, locale, RTL, density, motion and preset. Story files live in `packages/uikit/storybook`, grouped by UIKit category such as `packages/uikit/storybook/atoms`.
