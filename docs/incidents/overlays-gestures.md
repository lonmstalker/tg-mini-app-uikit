# Incidents — overlays, gestures & onboarding

One guarantee per incident ID (M1's docs anchor). Paths are relative to
`packages/uikit/src/`.

## Overlays

- **OVL-001** — the toast stack is capped at `max` as a WHOLE; the earlier
  `slice(-(max-1))` degenerated to keep-all for `max=1`, so the bound never
  applied. `composites/overlays/toasts.tsx`
- **OVL-002** — `TKPopper` with `role="dialog"` is a real modal popover: focus
  moves in, Tab is trapped, Escape closes and restores focus to the anchor, and
  the background is inert. `composites/overlays/popper-tooltip.tsx`
- **OVL-003** — close timing is tied to the REAL exit: the overlay listens for
  `animationend` and reads the resolved `animation-duration` (honouring the
  `--tk-ms` motion-speed knob) instead of a fixed `closeMs` that desyncs and
  clips the close. `composites/overlays/shared.tsx`
- **OVL-004** — a tall action sheet caps its own height so its top items and the
  cancel button cannot be pushed off-screen in a short WebView; cancel is a
  sibling below and stays pinned. `composites/overlays/action-sheet.tsx`
- **OVL-005** — dialog actions stack automatically beyond two buttons, so three
  actions or long localized labels never squeeze into unreadable columns.
  `composites/overlays/dialog.tsx`
- **OVL-006** — everything outside the overlay's ancestor path is marked inert +
  `aria-hidden`, so the rotor/virtual cursor and pointers cannot reach the
  obscured background — Tab trapping alone does not do this.
  `composites/overlays/shared.tsx`
- **OVL-007** — roles with their own Enter handling are not hijacked by a
  dialog's primary confirm (paired with `tagName`/`contentEditable` checks).
  `composites/overlays/shared.tsx`
- **OVL-008** — a toast's action button keeps the 44px touch target, absorbing
  the hit slop with negative margins so the toast row keeps its height.
  `composites/overlays/toasts.tsx`
- **OVL-009** — auto-dismiss timers are per-toast and keyed by id, so an early
  `dismiss()` cancels the pending one instead of leaking a second removal.
  `composites/overlays/toasts.tsx`
- **OVL-011** — `TKActionSheet` has a localized default accessible name through
  `TKLocale`. `foundation/i18n.tsx`
- **OVL-012** — `snapPoints` must be ascending fractions within `(0,1]`;
  out-of-range values are dev-warned once instead of silently clamped into
  misbehaviour. `composites/overlays/sheet.tsx`
- **REU-010** — dropdown listboxes portal to the shared overlay host, so an
  `overflow` or `transform` ancestor cannot clip or displace them.
  `atoms/inputs/choices.tsx`, `atoms/inputs/dropdown-portal.tsx`

## Gestures

- **GES-001** — a long press swallows the synthetic click that follows it, so
  the element's own `onClick` does not also run.
  `composites/gestures/long-press.tsx`
- **GES-002** — `useLongPress()`'s result is spread LAST onto the element; it
  already handles the post-hold click and ignores non-primary pointers.
  `composites/gestures/long-press.tsx`
- **GES-003** — the native context menu is suppressed only while the kit's own
  press is in flight; a plain right-click with no prior pointerdown keeps it.
  `composites/gestures/long-press.tsx`
- **GES-004** — long press has a keyboard equivalent, so the interaction is not
  pointer-only. `composites/gestures/long-press.tsx`
- **GES-005** — pull-to-refresh announces refresh start and finish to AT; the
  spinner stays decorative. `composites/gestures/pull-to-refresh.tsx`
- **GES-006** — swipe actions are grouped (`role="group"`) so AT announces them
  as a set, not as loose buttons. `composites/gestures/swipe-cell.tsx`
- **GES-007** — a destructive first action never auto-fires on a full swipe: it
  opens the row for a deliberate tap. `composites/gestures/swipe-cell.tsx`
- **GES-009** — a landed long press fires a Telegram impact haptic by default
  (opt-out per call). `composites/gestures/long-press.tsx`
- **GES-010** — the pointer is captured so move/up/cancel reach the pressed
  element even if the finger drifts off it; otherwise a stray move could not
  cancel and a stale long press fired. `composites/gestures/long-press.tsx`
- **GES-011** — post-refresh state writes are skipped when the host unmounted
  mid-flight. `composites/gestures/pull-to-refresh.tsx`
- **GES-103** — the pull gate reads ALL plausible scrollers and takes the max
  `scrollTop`; a single "winner" target shadowed the real one twice (an at-top
  ancestor hid the mid-list wrapper; a hidden keep-mount tab pinned at 0 hid the
  visible tab's scroller). `composites/gestures/pull-to-refresh.tsx`

## Onboarding

- **ONB-001** — an early dismissal (Skip, scrim tap, Escape) persists "seen" and
  reports through `onSkip`, falling back to `onFinish` so a gating flag still
  advances. `templates/onboarding.tsx`
- **ONB-002** — `trapFocus={false}` keeps the highlighted target reachable: no
  focus steal, while the bubble stays Escape/scrim-dismissable and announced.
  `templates/onboarding.tsx`
- **ONB-003** — an empty step set finishes cleanly, so the consumer's seen-flag
  still flips; an out-of-range index is clamped at render time without an extra
  state write. `templates/onboarding.tsx`
- **ONB-004** — with no measurable target the tour falls back to a centered
  dialog card over a transparent interceptor (no opaque blackout), instead of
  rendering nothing and stranding the user without Skip/Next.
  `templates/onboarding.tsx`
- **ONB-008** — the live brand accent is prepended to the confetti palette at
  burst time, so a burst matches the app's theme.
  `templates/confetti.tsx`
- **ONB-010** — the particle count is clamped (negatives/NaN → 0, fractional
  floored, hard cap), so a bad number can neither `RangeError` nor freeze the
  device. `templates/confetti.tsx`
