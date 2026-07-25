# Incidents — buttons, controls, cross-cutting contracts

One guarantee per incident ID (M1's docs anchor). Paths are relative to
`packages/uikit/src/`.

## Buttons

- **BTN-001** — a blocked/disabled `TKButton` rendered as a non-button (`as="a"`)
  is genuinely inert: no `href`, out of the tab order, no activation. Visual
  dimming alone let keyboard and AT users still trigger it.
  `atoms/buttons/button.tsx`
- **BTN-002** — `TKInlineButtons` exposes `radiogroup`/`radio` + `aria-checked`
  by default (it switches a value, not tab panels); `multiple` keeps `group` +
  `aria-pressed` toggle semantics. `atoms/buttons/inline-buttons.tsx`
- **BTN-003** — the roving tab-stop is seeded on the SELECTED item (WAI-ARIA:
  the checked radio is the tab stop), not always item 0, and stays valid as
  items shrink or get disabled. `atoms/buttons/inline-buttons.tsx`
- **BTN-004** — `TKIconButton` keeps a ≥44px hit area regardless of the visual
  glyph size. `atoms/buttons/icon-button.tsx`
- **BTN-005** — native button attributes the vetted `TKDomProps` set does not
  cover (`type`, `name`, `value`, `form`, `title`, mouse handlers) are passed
  through explicitly rather than by a blind rest-spread.
  `atoms/buttons/icon-button.tsx`
- **BTN-006** — a numeric `badge` renders only when > 0; any other truthy value
  renders a dot. `atoms/buttons/icon-button.tsx`
- **BTN-009** — the busy state is announced politely while loading; the spinner
  itself stays decorative (`aria-hidden`), because `aria-busy` alone is not
  announced by most screen readers. `atoms/buttons/button.tsx`

## Cross-cutting contracts

- **CC-01** — a destructive swipe action never auto-fires on an over-swipe: the
  row opens for a deliberate tap instead. `composites/gestures/swipe-cell.tsx`
- **CC-03** — every interactive control meets the 44px Telegram/iOS touch
  minimum, expanding the hit area rather than the glyph. `internal/dom.ts`
  (`tkMinTargetStyle`) and its call sites.
- **CC-04** — a group control that owns a `radiogroup`/`toolbar`/`tablist` role
  takes an accessible name (`ariaLabel`), and dev-warns when it is missing.
  `atoms/buttons/inline-buttons.tsx`, `composites/navigation/segmented.tsx`
- **CC-05** — a state change that is not otherwise perceivable is announced:
  validation errors as `role="alert"`, loading/refresh/progress as a polite
  live region. `atoms/inputs/form-field.tsx` and every feedback surface.
- **CC-07** — "disabled" is a behavioural state, not a colour: blocked controls
  leave the tab order and refuse activation. `atoms/buttons/button.tsx`
- **CC-09** — `prefers-reduced-motion` is tracked live and works outside the
  `.tk` scope; when unavailable (SSR, old WebView) it resolves to `false`
  instead of throwing. `foundation/theme.tsx`
- **CC-11** — list-shaped props accept a stable `id` for React keys, falling
  back to a content-derived key, so reordering never re-mounts the wrong row.
  `atoms/display/avatar.tsx`, `composites/navigation/tabbar.tsx`
- **CC-12** — `TKCell` keeps its established polymorphic typing shape; the
  proposed re-typing was reviewed and refuted, so the older shape is deliberate,
  not an oversight. `composites/lists/cell.tsx`
- **CC-13** — display atoms forward a ref, `className` and native props, so a
  consumer can attach a tooltip ref, utility class, `data-*` or `title` without
  wrapping the element in a span. `atoms/display/badges.tsx`
- **CC-15** — every form control extends the shared `TKFieldProps` contract
  (value-first `onChange` with an optional native event), so swapping one field
  for another is a zero-surprise edit. `atoms/inputs/base.tsx`

## Layout survival

- **REU-008** — a control's box never gets squeezed by a long wrapping label:
  checkbox/radio/switch/stepper boxes carry `flex-shrink: 0`, labels truncate
  with ellipsis. `atoms/controls/checkbox.tsx` and siblings.
