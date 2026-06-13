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
