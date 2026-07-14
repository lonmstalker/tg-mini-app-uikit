---
"tg-mini-app-uikit": minor
---

Animation smoothness overhaul (2026-07-14 plan, phases 0–5).

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
