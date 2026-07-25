# Incidents — runtime internals

One guarantee per incident ID (M1's docs anchor). Paths are relative to
`packages/uikit/src/`.

## Drag & gesture engine

- **INT-001** — the velocity branch may only commit after a minimum travel
  (`min(size * 0.15, 48)`), so a micro-flick can no longer close a sheet or fire
  a swipe action on its own. `internal/useDragGesture.ts`
- **INT-002** — `enabled` is snapshotted into a ref, so flipping it mid-gesture
  is honoured instead of being read once at pointerdown.
  `internal/useDragGesture.ts`
- **INT-003** — the swipe-back gesture claims the horizontal axis and releases
  vertical pan to native scroll / Telegram's swipe-to-minimize, with overscroll
  contained so a horizontal drag never bubbles to the page.
  `composites/nav.tsx`
- **INT-004** — a value that flips between controlled and uncontrolled mid-life
  dev-warns once through `useControllable`, instead of silently dropping state.
  `internal/useControllable.ts`
- **INT-006** — layout effects run synchronously before paint in the browser but
  degrade to `useEffect` on the server, so layered overlays claim their z-slot
  before the first frame without the SSR warning.
  `internal/useIsomorphicLayoutEffect.ts`
- **INT-007** — the vertical-swipe guard depends on `active` plus the API's
  availability (read through a ref), so a changing `useWebApp()` identity no
  longer thrashes enable/disable mid-overlay.
  `internal/useVerticalSwipeGuard.ts`
- **INT-008** — when a gesture is stolen, the flag is raised and the last good
  `delta`/`velocity` preserved: a consumer that ignores the flag never
  auto-commits, one that wants to commit still can.
  `internal/useDragGesture.ts`
- **INT-009** — a queued animation frame is cancelled and in-flight state
  dropped on unmount, so a pending rAF never fires `onMove` against a dead
  render. `internal/useDragGesture.ts`
- **INT-010** — the z-scale is exposed as CSS-var STRINGS (`tkZ`) so userland
  token overrides keep working; `tkZIndex()` returns a real number for the rare
  layering arithmetic. `internal/dom.ts`
- **INT-011** — velocity sampling uses an in-window pair; when every prior
  sample predates the window, `dt` stays 0 (velocity 0) instead of silently
  spanning the whole buffer. `internal/useDragGesture.ts`

## Keyboard & viewport

- **KB-2** — the keyboard's measured overlap with the page root is published as
  a CSS var on the `.tk` root by `useKeyboard`, and the change lands in ONE jump
  — no layout animation, since the OS keyboard slide masks it.
  `composites/layout/page.tsx`

The rest of the keyboard saga (KB-1, KB-3, KB-4: host-managed mode, the settle
scroll that closed the user's keyboard, the stable-viewport cap) is documented
in [wiki/ios-debugging.md](../../wiki/ios-debugging.md) and
[wiki/device-testing.md](../../wiki/device-testing.md).
