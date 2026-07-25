---
"tg-mini-app-uikit": patch
"@tg-mini-app/telegram": patch
---

Component-rules manual audit: keyboard, a11y and real-content fixes.

- `TKDialog` decides "is the keyboard open" through the kit's keyboard
  controller instead of raw `innerHeight − visualViewport.height` — no more
  jump in the KB-4 transient window; under a host-managed viewport (Telegram
  iOS) plain CSS centering is kept.
- `TKOnboardingTooltip` no longer center-scrolls the page while a text field
  owns focus (the KB-3 settle-scroll class), and a storage-backed tour keeps
  the `.tk` portal host — it used to fall back to `document.body`/`fixed`.
- `TKCalendar`/`TKDateInput` month/year lists scroll their own listbox only,
  never `scrollIntoView` (which also walks page-level scrollable ancestors);
  the native `TKDateInput` variant forwards consumer `className`/`style`.
- `TKHeader` survives an unbroken title: the title column shrinks and
  ellipsizes instead of pushing the actions off a 320px viewport; large
  titles break long words.
- `TKChip` applies the consumer `className` on the default (non-removable)
  root too; `TKEllipsis` with controlled `expanded={true}` renders unclamped
  from the first paint and in SSR markup.
- A11y: skeletons are `aria-hidden` decorative placeholders (overridable via
  props); the product-card favorite toggle exposes `aria-pressed`.
- `@tg-mini-app/telegram`: `TKViewportForensics` portals into the nearest
  `.tk` / `[data-tk-portal-root]` host and stays `absolute` there (`fixed`
  only for the bare-body fallback), so the debug overlay itself survives the
  keyboard animation it exists to observe.
