# tg-mini-app-uikit

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
