# Telegram Platform

The platform layer wraps `window.Telegram.WebApp` in typed hooks that degrade safely outside Telegram.

- Native chrome: `useMainButton`, `useSecondaryButton`, `useBackButton`, `useSettingsButton`.
- Viewport and device: `useViewport`, `useSafeArea`, `useFullscreen`, `useOrientationLock`, `useActivity`, `useKeyboard`, `useMotionSensors`.
- Client APIs: `useInvoice`, `useShare`, `useTelegramLinks`, `useDataTransport`, `useQrScanner`, `useClipboard`, `useDownloadFile`.
- Permissions and identity: `useContactRequest`, `useWriteAccess`, `useBiometrics`, `useLocation`, `useEmojiStatus`, `useHomeScreen`.
- Storage: `useCloudStorage`, `useDeviceStorage`, `useSecureStorage`.

For tests and demos, inject a client:

```tsx
import { TKTelegramProvider } from "tg-mini-app-uikit";
import { createMockTelegram } from "../telegram/mock";

const mock = createMockTelegram();

<TKTelegramProvider webApp={mock.webApp}>
  <App />
</TKTelegramProvider>
```

The Platform Lab in the demo renders the mock client chrome and event log, so invoices, QR, biometrics and sensors can be tested in a normal browser.

## Runtime Policy

The hooks use capability detection first: a method or field is called only when it exists on the active `Telegram.WebApp` object. The kit does not maintain an exhaustive Telegram client version matrix in runtime code. This keeps ordinary browsers, Storybook, SSR, older Telegram clients, and partial mocks on the same path.

`getTelegramWebApp()` returns the real `window.Telegram.WebApp` or `null` when the host is missing. `useWebApp()` returns `undefined` outside Telegram so hook consumers can branch naturally.

Native side effects happen in effects or explicit callbacks, not during render. For example, native buttons subscribe on mount, update from hook params, and hide on cleanup. Link, invoice, share, QR, clipboard, and device APIs run only when the returned callback is invoked.

## Storage

`useCloudStorage()` uses Telegram `CloudStorage` when available. Outside Telegram it falls back to a `tk-cloud:` localStorage namespace when browser storage is available.

`useDeviceStorage()` and `useSecureStorage()` follow the same shape for developer convenience. The `isSupported` flag tells you whether a native Telegram storage backend is present. If `useSecureStorage()` falls back to browser localStorage, it is not secure storage; treat it only as a local development fallback.

Storage fallbacks are best-effort. In SSR, private browsing, or restricted browser contexts where localStorage is unavailable or throws, methods no-op or return `null` / empty results instead of throwing.

## Init Data Trust Boundary

`useInitData()` returns raw `initData` separately from parsed display data:

- `raw` is the only value your backend should validate and trust.
- `unsafe`, `user`, and `startParam` come from `initDataUnsafe` and are display-only in client code.

Do not use `initDataUnsafe` as proof of identity, authorization, subscription, or payment state. Send raw `initData` to your server and validate the Telegram hash there before making trust decisions.
