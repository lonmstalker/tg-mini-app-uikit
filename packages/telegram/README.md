# @tg-mini-app/telegram

Typed React bridge for the Telegram Mini Apps WebApp API (Bot API 9.6):
provider, back-button queue, native buttons, CloudStorage, capabilities,
sensors, viewport/keyboard and theme hooks.

It is the platform peer of [`tg-mini-app-uikit`](https://www.npmjs.com/package/tg-mini-app-uikit)
and works standalone in any React mini app.

## Install

```bash
npm i @tg-mini-app/telegram
```

## Quick start

```tsx
import { TKTelegramProvider, useKeyboard, useBackIntercept } from "@tg-mini-app/telegram";

function Screen() {
  const keyboard = useKeyboard(); // { visible, height } from visualViewport
  useBackIntercept(true, () => history.back()); // native Back button queue
  return <main style={{ paddingBottom: keyboard.height }}>…</main>;
}

export function App() {
  return (
    <TKTelegramProvider>
      <Screen />
    </TKTelegramProvider>
  );
}
```

Outside Telegram every hook degrades to a safe no-op, so the same bundle runs
in a plain browser.

## Testing

`@tg-mini-app/telegram/testing` ships `createMockTelegram()` — a scriptable
WebApp mock for unit tests and demos.

## License

MIT
