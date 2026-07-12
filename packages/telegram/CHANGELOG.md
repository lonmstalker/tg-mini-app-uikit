# @tg-mini-app/telegram

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
