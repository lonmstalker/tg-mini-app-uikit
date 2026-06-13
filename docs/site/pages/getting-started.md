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

The demo is the fastest way to inspect real app surfaces:

```bash
npm install
npm run dev
```

Open `http://localhost:5173/?app=gallery` for the component gallery or jump to product flows with `?app=stars`, `?app=support`, `?app=feed`, `?app=wallet`, `?app=forms`, `?app=arcade`, `?app=onboarding` and `?app=settings`.
