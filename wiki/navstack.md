# TKNavStack — swipe-back navigation


**Summary**: An iOS-style push/pop navigation stack with edge swipe-back wired into
the Telegram Back button — the kit's headline differentiator, which no other
Telegram UI kit ships.
**Status**: verified
**Updated**: 2026-06-14

---

## Behavior

- `TKNavStack` + `useNav` live in `packages/uikit/src/composites/nav.tsx`.
  `useNav()` returns `{ push, pop, replace, popTo, depth, activePanel, params }`.
- `swipeBack` prop accepts `"edge" | "anywhere" | false`, default `"edge"` (a drag
  from the screen's left edge pops the top panel). The revealed panel underneath
  animates at a parallax offset.
- Lower panels stay mounted, so their scroll position and in-progress form state
  survive a pop — this is why the demo's booking funnel can be a multi-panel push
  and still keep a half-built booking after a back-swipe.
- The stack registers with `useBackIntercept` (see [[telegram-runtime]]), so the
  native Telegram Back button and edge-swipe stay in lockstep, and open overlays
  get the back press first.

## How the demo uses it

Each of the five tabs owns its own `TKNavStack`. The tabbar switches laterally;
each stack is the independent depth axis; switching tabs preserves each stack's
depth and scroll. The booking funnel (Detail → Date/Slot → Summary) exercises
swipe-back at depth. See [[trailhead-demo]].

## Related

- [[telegram-runtime]] · [[trailhead-demo]]

## Sources

- evidence: `packages/uikit/src/composites/nav.tsx`.
