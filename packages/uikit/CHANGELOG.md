# tg-mini-app-uikit

## Unreleased

### Minor Changes

- `TKAppShell`: the app's outermost sized element — a flex column capped at
  the bridge's STABLE viewport (`min(100dvh, var(--tg-viewport-stable-height,
  100dvh))`, `.tk-app-shell` in tokens.css) and eased with the kit's
  keyboard-shift tokens. Bare `100dvh` tracks the layout viewport, which
  Telegram iOS resizes LAST on keyboard open — the page scrolled to the
  composer and snapped back (the two-jump keyboard jerk,
  wiki/ios-debugging.md). One per app, under the providers.
- `useTKHostBackground(resolvedTheme)`: the html/body/native-chrome painting
  `TKApp` always did, extracted for apps composing bare `TKProvider` —
  `--tk-*` tokens don't resolve at html/body level, so an unpainted page
  flashes UA-white wherever the host reveals it (overscroll, WebKit pans, the
  strip under a shrinking shell during the keyboard animation). `TKApp` now
  uses the hook internally; no behavior change for `TKApp` consumers.

## 0.6.0

### Minor Changes

- Modal overlays (`TKSheet`, `TKDialog`, `TKActionSheet`, `TKImageViewer`) now
  hide the native Telegram Main/Secondary buttons while open and restore them
  when the last overlay closes — the buttons live in the client chrome beyond
  the scrim's reach, so without this a "Pay" stayed tappable under a
  confirmation sheet. **Behavior change** with a per-overlay opt-out: pass
  `nativeButtons="keep"` when the overlay itself is confirmed by the native
  button. The Back button is unaffected (it keeps closing the overlay).
- `TKHeader back` now defaults to `"auto"`: the arrow renders only when it is
  the only back control — it follows an enclosing `TKNavStack`, needs an
  `onBack` when standalone, and steps aside when a real client already shows
  the native Back button (`useBackButtonWanted`). **Behavior change**: a bare
  `<TKHeader>` without `onBack`/nav stack no longer renders a dead arrow;
  pass `back={true}` to force the old rendering.

### Patch Changes (2026-07-16 device-testing sweep)

- The `@tg-mini-app/telegram` peer range is now `^0.3.0` — this release
  imports `useSuppressNativeButtons`/`useBackButtonWanted`, which older 0.2.x
  peer builds do not export.
- `TKSheet` with snap points no longer reveals blank panel background while
  dragged between snaps — the content box is pinned to the full height for the
  duration of the gesture and handed back to the committed snap on release
  (OVL-013).
- `TKWriteBar`'s send button prevents the pointerdown default so the tap no
  longer blurs the composer first — on iOS the closing keyboard moved the bar
  out from under the finger and the click never landed (CHT-007).
- The page and its footer now ride the keyboard as one eased movement
  (`--tk-t3`, collapses under reduced motion) instead of a discrete jump per
  visualViewport event.
- `.tk-press` sets `touch-action: manipulation` — no mobile double-tap-zoom
  wait on kit controls.
- The booking-card action (`TKBookingCard actionLabel`) is a real ≥44px hit
  target (TCRD-004).

## 0.5.0

### Minor Changes

- 1b77173: Add press-and-drag date-range selection to `TKCalendar`, including long-press touch arming and disabled-date clipping.

### Patch Changes

- 3d2b239: Add a non-modal `TKSheet` mode for passive previews that must not capture document focus or lock the surrounding page.
- 7c5c107: Modal scroll lock now restores the page position instantly on release — host pages with `scroll-behavior: smooth` no longer animate from the top after closing a sheet, dialog or image viewer.
- cc6cb14: Derived ink colors (`--tk-accent-ink`, `--tk-red-ink`, `--tk-green-ink`, `--tk-orange-ink`) now recompute on every provider instead of only the outermost one — a nested `TKProvider` with its own theme (e.g. a light preview inside a dark page) no longer inherits the outer theme's unreadable mixes.

## 0.4.0

### Minor Changes

- 4fe611c: Animation smoothness overhaul (2026-07-14 plan, phases 0–5).

  - Gestures track the finger 1:1: `useDragGesture` fires the first move of a
    frame synchronously (rAF only dedups extra same-frame moves); sheet,
    swipe-cell, nav swipe-back and sliders move imperatively — zero layout and
    zero React commits per drag frame.
  - Layout-property animations replaced with transforms: snap sheet
    (max-snap height + translateY), sliders (percent rails), segmented
    indicator, progress/XP/steps/file-input fills, bar charts, search
    expand/Cancel; the keyboard page shrink lands in one jump; accordion and the
    collapsing large header animate a measured height through WAAPI
    (`useCollapse`). Collapsing headers re-render once per hysteresis flip, not
    per scroll frame (`usePageHeaderCollapsed`).
  - Paint diet: `will-change` only for the animation window (sheet, dialog,
    action sheet, nav panels, toasts); the body scroll-lock pins one frame after
    the entrance starts; toasts/tooltips animate a wrapper around the static
    blur layer; new `TKProvider glassBars={false}` downgrades bar blur to the
    opaque background; focus rings fade on an opacity overlay (`box-shadow` and
    `filter` never sit in a transition list — enforced by the new
    `check-animatable-props` CI gate); composite skeletons use one shimmer layer
    per container.
  - Familiar motion added: form errors rise in / shake on repeat, both header
    titles crossfade, tab switches fade with hidden tabs kept via
    `visibility` + `content-visibility` (scroll positions survive; heavy first
    mounts ride a deferred render), skeleton→content and infinite-list appends
    fade in, the PTR spinner turns/scales with the pull, toast exits run faster
    than entries and the stack reflows via FLIP transforms.
  - Back-button dedup: `TKNavStack` exposes `nativeBack` and `TKHeader
back="auto"` hides its arrow while the native Telegram Back button is shown
    for the same pop; in plain browsers the arrow remains.

## 0.3.1

### Fixed

- Adversarial review remediation: the nav exit layer keeps the dying panel's
  live subtree (typed input/scroll preserved, mount effects don't re-run)
  instead of mounting a fresh clone; controlled-mode stack entries get
  monotonic keys, so a push to a previously "warmed" depth animates again
  and a host-rejected swipe-back can't leak its finger offset into a later
  exit; the entrance settled-guard gets the same swallowed-`animationend`
  fallback timer as the exit layer; `TKPullToRefresh` gates on the max
  `scrollTop` of all VISIBLE candidate scrollers (an at-top ancestor no
  longer unlocks a mid-list pull, a hidden keep-mount tab no longer shadows
  the visible one) and exposes a stable `[data-tk-ptr]` marker; the `TKApp`
  html/body underlay follows the kit's resolved theme outside real Telegram
  (no light flash under a dark app); `TKPage` scopes the footer collapse to
  its own `.tk` root (a keyboard in one root no longer collapses another
  root's footers).

## 0.3.0

### Breaking

- **Nested `.tk` roots now inherit the host palette.** The default
  palette/knob block is scoped to top-level roots
  (`.tk:where(:not(.tk .tk))`): a nested `.tk` (e.g. a standalone-mounted
  `TKNavStack`) no longer re-declares the light defaults over a dark host or
  resets host-tuned `--tk-safe-*`. **Migration:** delete any mirror variables
  you kept to fight this (e.g. a `--tga-*` copy of the palette in your
  `brand.css`) — nested roots now resolve the host values natively. A bare
  top-level `.tk` without a provider keeps its painted defaults.
- **`useKeyboard` closes by geometry, not by blur.** `visible` flips to
  `false` when the keyboard actually retracts (visualViewport), not when the
  focus leaves an input. Consumers that relied on blur-driven closing should
  drive UI from `visible`/`--tk-kb-height` as before — the state is now
  simply correct during focus hops and the iOS chevron close.
- **`TKPage` keyboard contract.** With a `footer`, the page height is
  `calc(100% - var(--tk-kb-height))` under a 200 ms transition. The `100%`
  base must be the real visible viewport: remove host-side caps such as
  `min(var(--tg-viewport-stable-height), 100%)` on the `.tk` root, or the
  keyboard is subtracted twice.

### Added

- `TKApp` full WebView bootstrap: `ready()` → `expand()` (opt-out via
  `expand={false}`), theme-colored `html`/`body` underlay (kills the black
  WKWebView flashes), `overscroll-behavior: none`, app-wide keyboard
  controller, `WebApp.setBackgroundColor` sync.
- `TKPage onRefresh` — pull-to-refresh wired to the page's own scroller (the
  pit of success; hand-wrapping a non-scroller in `TKPullToRefresh` is the
  documented anti-pattern).
- `TKKeepMountTabs` / `TKKeepMountTab` / `useTabActive()` — keep-mount tab
  host: visited tabs stay mounted (`display: contents|none`), lazy first
  mount, page scroll restored to top on switch, hidden tabs can gate their
  polling via the hook.
- `--tk-kb-height` design token (written by the keyboard controller on the
  owning `.tk` root) and the `.tk.tk-kb-open` CSS hook (zeroes
  `--tk-safe-bottom` while the keyboard covers the home indicator).
- Exit animation for `TKNavStack` pop / committed swipe-back (`tk-nav-out`),
  with an animationend + fallback-timer removal and reduced-motion support.
- m2–m10 audit wave: `TKNativeField`, a11y helpers (`useTKBusyAnnounce`,
  `useReducedMotion`), controlled nav stack (`stack`/`onChange`/`reset()`,
  typed `useNav<T>()` params), link-URL guards, and hardened atoms,
  composites and templates across the board.

### Fixed

- Keyboard/viewport: `covered` no longer subtracts `vv.offsetTop` (the WebKit
  pan made an open keyboard read as closed and collapsed the page);
  open/close hysteresis kills the flicker around the threshold; a leftover
  WebKit pan settles once the keyboard is geometrically closed (the iOS
  chevron case) without fighting the native settle; focus hops between
  fields no longer jump the screen; `.tk-kb-open`/`--tk-kb-height` writes are
  idempotent (zero style invalidation on watchdog re-syncs); the footer
  collapses on the keyboard curve instead of a synchronous `display:none`;
  the page pre-shrinks on focusin from the remembered keyboard height
  (`localStorage` `tk:kbHeight`).
- `TKPage` no longer re-renders the whole screen on every scroll frame: the
  scroll context carries a 4px-quantized 0–64px collapse band (TKHeader
  behavior unchanged).
- `TKPullToRefresh` resolves its real scroll target (descendant → ancestor →
  own wrapper) instead of hijacking mid-list swipes and firing hidden
  refreshes when placed inside a page scroller.
- `TKNavStack`: the old screen no longer flashes on pop (exit layer), and
  settled panels drop their entrance animation instead of keeping a resolved
  transform forever (a permanent containing block for `position: fixed` and
  a leaked compositor layer per panel).

## 0.2.0

- Platform split: the Telegram bridge moved to `@tg-mini-app/telegram`
  (peer dependency); unified card design system; pull-to-refresh and gesture
  onboarding.
