# Telegram Platform

The platform layer wraps `window.Telegram.WebApp` in typed hooks that degrade safely outside Telegram.

- Native chrome: `useMainButton`, `useSecondaryButton`, `useBackButton`, `useSettingsButton`.
- Viewport and device: `useViewport`, `useSafeArea`, `useFullscreen`, `useOrientationLock`, `useActivity`, `useKeyboard`, `useMotionSensors`.
- Client APIs: `useInvoice`, `useShare`, `useTelegramLinks`, `useDataTransport`, `useQrScanner`, `useClipboard`, `useDownloadFile`.
- Permissions and identity: `useContactRequest`, `useWriteAccess`, `useBiometrics`, `useLocation`, `useEmojiStatus`, `useHomeScreen`.
- Storage: `useCloudStorage`, `useDeviceStorage`, `useSecureStorage`.
- Environment: `useTelegramEnvironment` (the one "am I really inside Telegram?" primitive — other hooks return confident fallbacks outside), `useVerticalSwipes` (enable/disable swipe-to-minimize), `useHasNativeChrome` (native MainButton/BackButton available vs in-DOM fallbacks).

For tests, inject a WebApp-like client:

```tsx
import { TKTelegramProvider } from "tg-mini-app-uikit";

const mock = createWebAppTestDouble();

<TKTelegramProvider webApp={mock.webApp}>
  <App />
</TKTelegramProvider>
```

The package-local Storybook stories and e2e specs exercise mocked runtime states in a normal browser, including native buttons, storage, capability gates and browser fallbacks.

## App Bootstrap: Bridge, Shell, Background

Three duties every production Mini App must handle before rendering — all
learned the hard way on real devices, all owned by the kit:

**1. Resolve the launch environment.** The official `telegram-web-app.js` is
vendored inside the package; `tkResolveTelegramBridge()` loads it as a
bundled same-origin chunk only when the host didn't already provide
`window.Telegram.WebApp` (never clobbering a pre-injected bridge or a test
double), classifies the result by `platform` — real clients always stamp it,
while an empty `initData` is a legitimate launch shape — and deletes the
outside-Telegram stub so DOM fallbacks stay honest:

```tsx
const bridge = await tkResolveTelegramBridge();
// bridge !== null → real Telegram client: native chrome path
// bridge === null → plain browser: DOM fallbacks or your mock
```

The classifier itself is exported as `isRealTelegramBridge(webApp)` for hosts
that load the bridge some other way.

Do NOT load the bridge from `https://telegram.org/…` at runtime: on a slow
route the fetch loses the race with the first render and the app silently
runs in browser-fallback mode inside Telegram.

**2. Size the shell with `TKAppShell`.** Bare `100dvh` tracks the layout
viewport, which Telegram iOS resizes LAST when the keyboard opens — the
page scrolls to the composer and snaps back (a visible two-jump jerk).
`TKAppShell` caps the app at the bridge's stable viewport
(`min(100dvh, var(--tg-viewport-stable-height, 100dvh))`) and eases the
change with the kit's keyboard-shift tokens so the shell rides the OS
keyboard animation. One per app, directly under the providers.

**3. Paint the page behind the app.** `--tk-*` tokens are scoped to the
`.tk` root and never resolve at `html`/`body`, so overscroll, WebKit pans,
and the strip under a shrinking shell flash UA-white unless the page is
painted. `TKApp` does it automatically; apps composing bare `TKProvider`
call `useTKHostBackground(resolvedTheme)` themselves.

When a viewport bug reproduces only on a real device (Safari's inspector
cannot attach to Telegram's WKWebView), mount `<TKViewportForensics />`
behind `tkViewportDebugRequested()` (`?kbdebug=1` or start_param `kbdebug`)
— one screenshot of its on-screen log reconstructs the whole event timeline.

## Runtime Policy

The hooks use capability detection first: a method or field is called only when it exists on the active `Telegram.WebApp` object. The kit does not maintain an exhaustive Telegram client version matrix in runtime code. This keeps ordinary browsers, Storybook, SSR, older Telegram clients, and partial mocks on the same path.

Two traps the official bridge script sets, and how the hooks defuse them:

- **Method presence is not feature detection.** The script defines every method on every client and THROWS at call time (`WebAppMethodUnsupported` below the feature's version, `WebAppInlineModeDisabled` for a bot without inline mode, `WebAppRequestChatOpened` on re-entry). Version-gated hooks (`useChatRequest` 9.6, `useContactRequest`/`useWriteAccess` 6.9, `switchInlineQuery` 6.6) plus try/catch turn those into honest `false`s.
- **The script ships ahead of the clients.** A client can pass the version gate yet not implement the underlying `web_app_*` event — the event is silently dropped and the callback never fires (observed with `requestChat` on current clients). A promise from such a hook may never settle; design UI so a missing answer is survivable, or use a universally implemented mechanism (e.g. the `t.me/share/url` deep link) for must-work flows.

`getTelegramWebApp()` returns the real `window.Telegram.WebApp` or `null` when the host is missing. `useWebApp()` returns `undefined` outside Telegram so hook consumers can branch naturally.

Native side effects happen in effects or explicit callbacks, not during render. For example, native buttons subscribe on mount, update from hook params, and hide on cleanup. Link, invoice, share, QR, clipboard, and device APIs run only when the returned callback is invoked.

## Native Chrome Arbitration

The Main/Secondary buttons live in the client chrome outside the webview, so an in-DOM scrim or focus trap can never disable them. The kit arbitrates them the same way it already arbitrates the Back button:

- While any modal overlay (`TKSheet`, `TKDialog`, `TKActionSheet`, `TKImageViewer`) is open, `useMainButton`/`useSecondaryButton` render the buttons hidden and restore the requested state when the last overlay closes. A single overlay opts out with `nativeButtons="keep"` when the native button is its own CTA (e.g. a picker sheet confirmed by the MainButton). The primitives are public: `useSuppressNativeButtons(active)` registers a suppressor, `useNativeButtonsSuppressed()` reads the state.
- The Back button is never suppressed — an open overlay intercepts it to close itself (the existing back queue).
- `useBackButtonWanted()` reports whether some interceptor already shows the native Back button; `TKHeader back="auto"` (now the default) uses it so an in-DOM arrow never duplicates the native control for the same press.

## Storage

`useCloudStorage()` uses Telegram `CloudStorage` when available. Outside Telegram it falls back to a `tk-cloud:` localStorage namespace when browser storage is available.

`useDeviceStorage()` and `useSecureStorage()` follow the same shape for developer convenience. The `isSupported` flag tells you whether a native Telegram storage backend is present. If `useSecureStorage()` falls back to browser localStorage, it is not secure storage; treat it only as a local development fallback.

Storage fallbacks are best-effort. In SSR, private browsing, or restricted browser contexts where localStorage is unavailable or throws, methods no-op or return `null` / empty results instead of throwing.

## Init Data Trust Boundary

`useInitData()` returns raw `initData` separately from parsed display data:

- `raw` is the only value your backend should validate and trust.
- `unsafe`, `user`, and `startParam` come from `initDataUnsafe` and are display-only in client code.

Do not use `initDataUnsafe` as proof of identity, authorization, subscription, or payment state. Send raw `initData` to your server and validate the Telegram hash there before making trust decisions.
