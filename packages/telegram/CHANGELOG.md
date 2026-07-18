# @tg-mini-app/telegram

## Unreleased

### Minor Changes (launch & debug surface)

- `tkResolveTelegramBridge()`: kit-owned app-entry launch resolution — loads
  the vendored bridge as a bundled chunk only when the host didn't provide
  `window.Telegram.WebApp` (never clobbers a pre-injected bridge or a test
  double), classifies by `platform` via the new `isRealTelegramBridge()`
  (empty `initData` is a legitimate real-client launch shape), and deletes
  the outside-Telegram stub. Promoted from the Trailhead demo after three
  real-device iterations (wiki/ios-debugging.md).
- `TKViewportForensics` + `tkViewportDebugRequested()`: the on-device
  viewport/keyboard forensics overlay (Safari's inspector cannot attach to
  Telegram's WKWebView). Logs vv geometry, the bridge's `viewportChanged`,
  `.tk` root box changes, every `--tk-kb-height` write, focus moves and
  `window.scrollTo` calls into an on-screen readout — one screenshot
  reconstructs the timeline. Tree-shaken when unused; displays geometry only.

### Fixed

- Keyboard, bridge-managed viewport (KB-4, pinned from an on-device
  timeline): Telegram iOS reports `viewportStableHeight` = keyboard-reduced
  height ~400ms before any `visualViewport` event, then resizes the WKWebView
  ~20ms AFTER vv shrinks. In that window `innerHeight − vv.height` read a
  full keyboard, so the kit lifted the page a whole keyboard and snapped it
  back when `innerHeight` followed — a two-jump storm around the focused
  composer that ended in the client dropping focus. When the bridge's stable
  viewport is more than the open threshold smaller than the layout viewport,
  the HOST manages the keyboard: no lift is applied, the transient is not
  learned as the device keyboard height, the settle scroll stays off, and
  `sync` also runs on the bridge's own `viewportChanged` (which arrives
  first). Pinned by KB-4 tests.
- Keyboard, host-managed mode (KB-3): Telegram iOS RESIZES the webview for
  the keyboard, so `innerHeight − vv.height` reads ≈0 with the keyboard open
  and geometry alone said "closed". The WebKit pan toward the composer then
  looked like a stuck leftover and the settle `scrollTo(0, 0)` fired UNDER
  the open keyboard — the client's interactive-dismiss closed it (tap the
  chat composer → layout slides, slides back, keyboard gone). The focused
  root shrinking by ~a keyboard since focusin now marks the host-managed
  mode: the settle scroll is suppressed while it holds (chevron-close
  restores the root and settles on geometry as before), the mode is
  remembered (`tk:kbHostAbsorbs`) so the next session's pre-shrink doesn't
  flash a lift the host is about to make itself, and a geometry-confirmed
  keyboard clears the memory. Pinned by KB-3 tests.
- Keyboard: the applied `--tk-kb-height` is now the keyboard's real overlap
  with the lifted `.tk` root, not the raw `innerHeight − vv.height`. The raw
  value double-lifted on real iOS devices in two ways: when the HOST already
  shrank the root (Telegram lowers `--tg-viewport-stable-height` on keyboard
  and `#root` is capped to it), and when WebKit PANNED the page toward a
  bottom field (`vv.offsetTop` ≈ keyboard height) — both drew the composer a
  whole keyboard ABOVE the keyboard and made focus/tap targets jump. Keyboard
  DETECTION still ignores `offsetTop` (KB-1.1); only the applied height
  changed. A `ResizeObserver` on the `.tk` roots re-syncs when the host
  resizes them without any `visualViewport` event. Pinned by KB-2 tests.

### Minor Changes

- New `@tg-mini-app/telegram/bridge` export: the official
  `telegram-web-app.js`, vendored and shipped inside the package as a
  side-effect module. Load it at startup, gated on the bridge being absent —
  the script assigns `window.Telegram.WebApp` unconditionally, so an
  unconditional import would clobber a bridge the host already provided
  (e.g. a test harness):
  `if (!getTelegramWebApp()) await import("@tg-mini-app/telegram/bridge");`
  The bridge ships as an app chunk — same origin, properly awaited — instead
  of a runtime `<script src="https://telegram.org/…">` fetch that can lose on
  a slow mobile route (losing it ran the app in browser-fallback mode INSIDE
  Telegram: no native MainButton, no `expand()`, the CTA half off-screen —
  wiki/device-testing.md #6, v3). Refresh the vendored copy when bumping the
  supported Bot API level:
  `curl -o bridge/telegram-web-app.cjs https://telegram.org/js/telegram-web-app.js`.

## 0.3.0

### Minor Changes

- Native-chrome suppression registry (shared on `globalThis`, dedupe-safe
  across package copies like the back registry): `useSuppressNativeButtons(active)`
  counts a suppressor, `useNativeButtonsSuppressed()` reads the state, and
  `useMainButton`/`useSecondaryButton` render the native button hidden while
  any suppressor is active, restoring the requested params after. A dev-only
  warning points at the overlay's `nativeButtons` prop the first time a
  visible button is suppressed.
- `useBackButtonWanted()`: true while at least one interceptor (overlay, nav
  stack) wants the native Back button visible — lets in-DOM back affordances
  avoid rendering a second arrow for the same press.

### Fixed (2026-07-16 device-testing sweep)

- The official bridge defines every method on every client and THROWS at call
  time — method presence is not feature detection. `useChatRequest` (9.6),
  `useContactRequest` / `useWriteAccess` (6.9) and
  `useDataTransport.switchInlineQuery` (6.6) are now version-gated, and every
  native call is wrapped: a bot without inline mode
  (`WebAppInlineModeDisabled`) or a re-entered picker resolves `false` instead
  of an unhandled exception.
- `useBiometrics` exposes reactive `isAvailable` (`undefined` until `init()`
  reports, then the device truth). `isSupported` alone is a trap: desktop
  clients ship a `BiometricManager` with no biometrics behind it — gate
  biometric UI on `isAvailable === true`.

## 0.2.1

### Fixed

- Adversarial review remediation: the pan settle no longer fires on a
  legitimately scrolled page (it arms on the pan signal `offsetTop > 0`, or
  on a scrollY the user could not have produced, and its stability snapshot
  now includes `scrollY`); the focusin pre-shrink is dropped as soon as
  focus leaves before the confirming resize, and it can no longer latch the
  hysteresis open without `covered` ever crossing the full threshold;
  non-text inputs (checkbox/radio/button/…) and `contenteditable="false"`
  no longer count as editable (no phantom pre-shrink on Tab); `state.height`
  is quantized to the same 4px steps as `--tk-kb-height`, killing re-render
  noise on visualViewport jitter.
- Packaging: `./testing` now resolves under node10 module resolution
  (`typesVersions`), and the package is gated by publint/attw in CI.

## 0.2.0

### Breaking

- **`useKeyboard` closes by geometry, not by blur.** `visible` flips to
  `false` when the keyboard actually retracts (visualViewport), not when
  focus leaves an input; a focusout alone schedules a ~100 ms re-check. This
  makes the state correct during focus hops and the iOS keyboard-chevron
  close (which fires no focus events at all).

### Added

- Back-intercept registry on a `globalThis` singleton (FND-004): the
  want-count/queue survive duplicated module instances, so the native Back
  button routing can't split between two copies of the package.
- Keyboard height memory: the controller stores the seen keyboard height
  (`localStorage` `tk:kbHeight`) and pre-shrinks the layout on focusin before
  the visualViewport resize arrives, reverting after ~600 ms if the keyboard
  never opens (hardware keyboards).
- `--tk-kb-height` CSS variable maintained on the owning `.tk` root — the
  single animated height source consumed by `TKPage`.
- Capabilities/storage hardening: version-gated sensors with per-sensor
  status, CloudStorage key validation on every path, bounded `shareToStory`.

### Fixed

- `covered` formula no longer subtracts `visualViewport.offsetTop`: during a
  WebKit pan to a bottom field the offset grows to roughly the keyboard
  height, which reported the keyboard closed while it was physically open.
- Open/close hysteresis (open > threshold, close < threshold/2) stops the
  visible flicker when the viewport height wobbles mid-animation.
- A leftover WebKit pan (`offsetTop`/`scrollY` stuck > 0) settles once the
  keyboard is geometrically closed — deferred ~120 ms with a stability
  re-check so it never fights the native settle animation.
- Focus hops between form fields no longer scroll the page to 0 and back
  (deferred focusout re-check re-reads `activeElement`).
- `.tk-kb-open` / `--tk-kb-height` writes are idempotent: repeated syncs at
  an unchanged state cause zero attribute mutations (no more style
  invalidation storms under consumer watchdogs).

## 0.1.0

- Initial release: typed WebApp provider, back-button queue, native buttons,
  storage, capabilities, sensors, layout/theme hooks.
