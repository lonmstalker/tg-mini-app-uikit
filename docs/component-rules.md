# Component Rules

The contract every reusable element in this kit satisfies. The goal is
shadcn-grade flexibility on the outside — composition, escape hatches,
consumer-wins styling — with the Telegram Mini Apps traps absorbed on the
inside, so a consumer never rediscovers them on a real device.

Every rule below was paid for by a real incident. The IDs (REU-*, KB-*,
OVL-*, INT-*, device-testing #N) trace to pinned tests, code comments, and
wiki pages. Never "simplify away" code guarded by one of these IDs without
reading its story first: `wiki/device-testing.md`, `wiki/ios-debugging.md`,
`docs/site/pages/components.md` ("Reuse contracts").

## M. Meta-rules — how a rule stays alive

- **M1. Three anchors per absorbed trap.** A comment at the code site citing
  the incident ID, a pinned test that replays the failure, and a docs line
  stating the guarantee. A fix with fewer anchors gets refactored away by the
  next well-meaning agent.
- **M2. Warn when you cannot absorb.** If the trap depends on the consumer's
  layout, ship a dev-only warning that fires once and names the fix in its
  message — the `useAnchorGuard` pattern (REU-006). Silent coupling is a bug.
- **M3. Promote learnings into the kit.** If a demo/app fix taught something
  generic, it becomes public kit surface (the keyboard saga became
  `TKAppShell`, `useTKHostBackground`, `tkResolveTelegramBridge`). Consumers
  must not rediscover device bugs.
- **M4. Instrument before the third fix.** When a real-device bug survives two
  hypotheses, stop guessing and measure: `TKViewportForensics` /
  `?kbdebug=1` (wiki/ios-debugging.md). One screenshot of the timeline beats
  a week of speculative patches.

## A. API shape — shadcn parity

- **A1. `className`/`style` reach the root.** Consumer `style` merges LAST
  (consumer wins), `className` is appended. Every composite and template
  (REU-007 — TKCell used to drop consumer style).
- **A2. Icon escape hatch everywhere.** Every icon-shaped prop is
  `TKIconProp` — a built-in name OR a ready element (own SVG, emoji, img);
  `TKIcon` takes `path` for custom SVG. Render via `tkRenderIcon` (REU-004).
- **A3. Colors: token for the theme, prop for the instance.** Per-instance
  `color` props on progress/ring/bars/slider/switch/checkbox/rating/swipe
  actions (REU-003). Never force consumers to override private CSS variables.
- **A4. Never invent demo data.** No sparkline without `bars`, no placeholder
  product title, no default illustration (REU-002). Empty means empty.
- **A5. No invisible regional defaults.** Locale drives behavior —
  `TKLocale.lang` picks TKPhoneInput's country (REU-011); every built-in
  string resolves through `TKLocale` with an English fallback.
- **A6. Controlled AND uncontrolled.** Stateful components go through
  `useControllable` (dev-warns when authority switches mid-life).
- **A7. Survive real content.** Long labels, i18n expansion, missing fields:
  flex-shrink guards, ellipsis, `minmax(0, 1fr)` grids (REU-001/008). A
  component that only survives its Storybook copy is broken.
- **A8. Public API is deliberate.** `TK*` naming, barrel exports, the API
  baseline updated consciously, semantics never changed silently.

## B. Telegram runtime — traps the kit absorbs

- **B1. Overlays portal; `absolute` inside a host.** All overlays and select
  dropdowns portal into the shared `.tk` / `[data-tk-portal-root]` host via
  `useOverlayPortal` / `useDropdownPortal` and stay `position: absolute`
  against it; `fixed` ONLY for the bare `document.body` fallback.
  `position: fixed` is unreliable in the Telegram iOS webview while the
  keyboard/viewport animates (REU-009/010, OVL-010).
- **B2. One `TKAppShell`, capped at the STABLE viewport.** Never a bare
  `100dvh` column: dvh tracks the layout viewport, which Telegram iOS
  resizes LAST — bare dvh is the two-jump keyboard jerk
  (wiki/ios-debugging.md).
- **B3. Never fight the host over the keyboard.** When the client resizes the
  webview itself (host-managed mode, detected and remembered as
  `tk:kbHostAbsorbs`), the kit applies no lift, no settle scroll, no
  pre-shrink — the settle scroll used to close the user's keyboard
  (KB-3/KB-4, `packages/telegram/src/device.ts`).
- **B4. Paint `html`/`body` in the host theme.** `--tk-*` is scoped to the
  `.tk` root; overscroll and the keyboard animation reveal a UA-white body
  otherwise. `useTKHostBackground` (automatic inside `TKApp`).
- **B5. The bridge is vendored and classified by `platform`.** Resolve launch
  with `tkResolveTelegramBridge()`: load the vendored bridge only when the
  host provided none; classify by `platform !== "unknown"` — NEVER by
  `initData` presence (an empty initData is a legal real launch). A CDN
  `<script>` + timeout race once ran the app in browser mode inside Telegram:
  no MainButton, no expand() (device-testing #6).
- **B6. Method presence is NOT feature detection.** The official bridge
  defines every method on every client and THROWS at call time. Every native
  call = `tkSupports` version gate + try/catch. And a passing version gate is
  still not enough: clients lag the bridge script, a posted event may never
  be answered — never assume a bridge promise settles
  (device-testing #1–#3, `identity.ts` requestChat).
- **B7. Native chrome goes through arbitration.** MainButton /
  SecondaryButton / BackButton / SettingsButton and the back gesture are
  driven by the kit's registries and hooks (`useBackIntercept`,
  `useSuppressNativeButtons`, chrome/back registries) — LIFO order: overlay
  closes before the nav stack pops, before the app minimizes. No ad hoc
  `wa.*` calls from components.
- **B8. Own the vertical axis explicitly.** Any dragged surface uses
  `useVerticalSwipeGuard` (else a downward drag minimizes the whole Mini
  App); modal overlays use `useScrollLock`. Both are reference-counted on the
  shared `tkSharedState` registry so stacked overlays and duplicate package
  copies don't fight (INT-005).
- **B9. Trust boundary.** `initDataUnsafe` is display-only; raw `initData` is
  validated server-side; the SecureStorage browser fallback is NOT secure and
  must not be described as such.

## C. Safety net — every component

- **C1. SSR-safe.** No `window`/`document` at import time; portals render a
  hidden marker on the server and mount client-side; imports work without
  `window.Telegram`.
- **C2. Everything cleans up; callbacks never go stale.** Telegram events,
  visualViewport listeners, RAFs, timers, observers, WAAPI finish listeners.
  Ref mirrors write via `useLatest` (useInsertionEffect — safe under
  discarded/replayed concurrent renders).
- **C3. A11y is the contract, not a layer.** Semantic HTML first; an
  accessible name on every interactive element; a keyboard path; visible,
  unclipped focus; label/description/error wired by IDs; live announcements
  when a state change is not otherwise perceivable.
- **C4. Motion on transform/opacity, reduced-motion honored.** Animated
  height/size is exceptional and goes through the `check:animatable` ratchet.

## T. The toolbox — never re-invent these

- `useOverlayPortal`, `useAnchorGuard` — `packages/uikit/src/composites/overlays/shared.tsx`
- `useDropdownPortal` — `packages/uikit/src/atoms/inputs/dropdown-portal.tsx`
- `useScrollLock`, `useVerticalSwipeGuard`, `tkSharedState` — `packages/uikit/src/internal/`
- `useControllable`, `useLatest`, `polymorphic`, roving focus — `packages/uikit/src/internal/`
- `TKAppShell` — `packages/uikit/src/composites/layout/app-shell.tsx`
- `useTKHostBackground` — `packages/uikit/src/foundation/host-background.ts`
- `tkResolveTelegramBridge`, `isRealTelegramBridge` — `packages/telegram/src/launch.ts`
- `tkSupports`, `TK_MIN_VERSION` — `packages/telegram/src/version.ts`
- `useBackIntercept`, `useSuppressNativeButtons` — `packages/uikit/src/foundation/telegram`
- `TKViewportForensics`, `tkViewportDebugRequested` — `packages/telegram/src/debug.tsx`

## D. Definition of done

A component change ships with: unit + Storybook + e2e evidence; docs that
claim only what tests pin; the API-baseline delta reviewed; incident comments
intact at every trap site. Gates:

```
npm run typecheck && npm run test:unit && npm run check:stories && npm run check:package
```

Per-component status against every rule above lives in
[docs/component-checklist/](./component-checklist/), regenerated by
`npm run check:rules` (`--check` exits non-zero on any hard failure). Statuses
are static analysis: `!` means a detector fired, `?` means the rule needs a
human — neither is a verdict.
