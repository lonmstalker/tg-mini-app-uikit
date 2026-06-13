# Recipes

## Tabbar and Content

Use `TKPage` plus `TKBottomBar` or `TKTabbar`. The kit exposes `--tk-tabbar-h`; app content should reserve that space instead of guessing a pixel height.

## Input Above Keyboard

Use `useKeyboard()` and the `tk-kb-open` class on the provider root. Keep the focused field inside a `TKPage` scroll container, not on `body`. This is the keyboard recipe for iOS WebView layouts.

## Edge Swipes and Carousels

`TKGallery` uses scroll snap and safe edge margins so Telegram/iOS edge swipes do not fight horizontal content. For custom gestures, use `useDragGesture` and keep the active zone away from the platform edge unless the gesture is navigation.

## Back Priorities

Use `useBackIntercept` for transient surfaces. Dialogs and sheets should close before `TKNavStack` pops. The Platform Lab has a back-priority card that logs this order against the mock client; use it as the back priorities reference.

## tg-mini-app-testkit

Use this kit's `createMockTelegram()` while building UI locally. For consumer-app e2e suites, pair it with `tg-mini-app-testkit` so Bot API behavior, start params and client events are testable outside Telegram.

## Non-Telegram Browser Usage

Wrap app code in `TKTelegramProvider` only when you want to inject a mock or a real WebApp object. Without Telegram, hooks report unsupported state or use browser-safe fallbacks. This lets the same components run in Storybook, local Vite, SSR, and tests.

Storage fallbacks are local only. `useCloudStorage()` writes to a `tk-cloud:` localStorage namespace outside Telegram. `useSecureStorage()` may still read and write a `tk-secure:` local fallback, but `isSupported` remains false and the fallback is not secure storage.

For identity, render friendly UI from `useInitData().unsafe` if useful, but send `useInitData().raw` to your backend for Telegram hash validation before trusting the user or start parameter.
