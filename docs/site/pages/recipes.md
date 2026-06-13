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
