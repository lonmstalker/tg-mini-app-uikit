# Incidents — lists & navigation

One guarantee per incident ID (M1's docs anchor). Paths are relative to
`packages/uikit/src/`.

## Lists

- **LST-001** — `TKVirtualList` supports window/scroll-parent mode: instead of
  owning a fixed-height inner scroller it can flow inline and window against an
  ancestor's scroll, so a page with one scroller stays that way.
  `composites/lists/virtual-list.tsx`
- **LST-002** — `TKCell` stays polymorphic: `as` swaps the rendered element and
  that element's own DOM props still reach it (`as="a" href=…` renders a real
  link row). `composites/lists/cell.tsx`
- **LST-003** — cell slots test `!= null`, not truthiness, so a subtitle/value/
  badge of `0` or `""` still renders. `composites/lists/cell.tsx`
- **LST-004** — an infinite list announces new-content loading to AT while the
  skeleton stays decorative. `composites/lists/infinite-list.tsx`
- **LST-006** — `wrap` lets a cell's title/subtitle wrap instead of truncating
  to one line, for rows whose content genuinely needs two.
  `composites/lists/cell.tsx`
- **LST-007** — press feedback appears only on genuinely actionable rows (click
  or link). A decorative chevron alone must not look tappable.
  `composites/lists/cell.tsx`
- **LST-008** — accordion reveal animates the MEASURED height through WAAPI
  (reduced-motion aware) rather than a `grid-template-rows` CSS transition, so
  nothing layout-animatable rides a transition list.
  `composites/lists/accordion.tsx`
- **LST-009** — a list group drops conditional `null`/`false` children FIRST, so
  `cond ? <Cell/> : null` leaves neither an empty wrapper nor a shifted
  separator count, and keys each wrapper by the child's own key.
  `composites/lists/list-group.tsx`
- **LST-010** — a controlled accordion clamps its open ids for RENDERING only.
  The kit never calls `onChange` from an effect to "fix" a consumer's controlled
  value — that mutates their state and causes an extra commit.
  `composites/lists/accordion.tsx`

## Navigation

- **NAV-001** — the tabbar's navigation landmark takes an accessible name,
  defaulting to `locale.tabs`. `composites/navigation/tab-view.tsx`
- **NAV-002** — `TKSegmented` names its radiogroup (`ariaLabel`), so the control
  is announced on entry. `composites/navigation/segmented.tsx`
- **NAV-003** — the category scroller names its group and keeps the active chip
  scrolled into view as the selection moves.
  `composites/navigation/category-tabs.tsx`
- **NAV-004** — an out-of-range, negative or "complete" `current` still resolves
  to a real step for the rail, `aria-current` and the announced position.
  `composites/navigation/steps.tsx`
- **NAV-005** — `TKTabView` self-manages the active index when uncontrolled,
  like every sibling; the tabbar is driven from that single source of truth, and
  inactive panels stay mounted so their scroll and state survive a switch.
  `composites/navigation/tab-view.tsx`
- **NAV-007** — tab items accept a stable `id` for keys (needed when tabs are
  reordered or removed); the index fallback already handles duplicate labels.
  `composites/navigation/tabbar.tsx`
- **REU-005** — `TKHeader` has a `plain` variant that drops the glass chrome, so
  it can be reused inside custom layouts where the floating glass bar would be
  wrong. `composites/navigation/header.tsx`
