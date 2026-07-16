# @tg-mini-app/telegram

## Unreleased

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
