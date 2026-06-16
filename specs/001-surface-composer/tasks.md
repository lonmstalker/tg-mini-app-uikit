---
description: "Task list for UIKit Surface Composer (first increment: US1 + US2)"
---

# Tasks: UIKit Surface Composer

**Input**: Design documents from `specs/001-surface-composer/`

**Prerequisites**: plan.md, spec.md (US1/US2 in scope), research.md, data-model.md, contracts/dom-contract.md, quickstart.md, constitution v1.2.0

**Scope (D10 / spec clarification)**: Deliver **US1 (P1) + US2 (P2) at full fidelity**. US3–US6 remain specified but **deferred** — they generate **no build tasks** here. `SceneOrchestrator` enumerates all six scene ids so the linear primary-action contract (FR-015) is real, but only `firstLaunch` and `rangeRemix` render.

**Tests are REQUIRED for this feature** (not optional): the `surface-composer` Playwright project is the literal "done" bar per constitution Quality Gates, SC-010/SC-011/SC-012, and FR-016. e2e behaviour + visual snapshots at key motion states + reduced-motion parity + no-overlap responsive matrix are first-class deliverables. The DOM/recorder contract ([contracts/dom-contract.md](./contracts/dom-contract.md)) is fixed up front, so specs assert that contract; this is not a TDD-first mandate, but each story is not "done" until its specs pass.

**Hard constraints carried into every task** (constitution + plan): compose only from existing public UIKit exports — **no new public exports**, demo-only helpers stay under `examples/surface-composer/src` (Principle II); animate only `transform` / `opacity` / isolated `clip`/`mask` / semantic CSS-var interpolation — **no layout-property animation** (FR-013); **no-WebGL** live surface — inspectable DOM (FR-018); honest `native-mirror`/`mock`/`browser-fallback` labelling (Principle V); buyer-first first viewport, no token/runtime/recorder/test vocabulary pre-touch (Principle III); reduced-motion path emits **identical** recorder events (FR-010); `examples/trailhead` MUST NOT be modified.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: `[US1]` / `[US2]` for user-story phases; Setup / Foundational / Polish carry no story label
- Every task lists an exact file path

## Path Conventions

New workspace app at `examples/surface-composer/` mirroring `examples/trailhead`. All demo code under `examples/surface-composer/src`; e2e under `examples/surface-composer/e2e`. Repository-root wiring touched: `playwright.config.ts`, `scripts/check-e2e-count.mjs`, `.github/workflows/ci.yml` (per plan Structure). `examples/trailhead` is **untouched**.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Stand up the new workspace app skeleton and register it in the monorepo. Mirror trailhead conventions (Vite + React 19 + `@tg-mini-app/*` source aliases); no behaviour yet.

- [X] T001 [P] Create `examples/surface-composer/package.json` (name `surface-composer`, `type: module`, scripts `dev`/`build`/`preview`/`typecheck`/`test`, **workspace-only** deps `tg-mini-app-uikit` + `@tg-mini-app/{telegram,intl,async}` at `*`, devDeps mirroring trailhead: `@playwright/test` 1.60.0, `@axe-core/playwright`, vitest 4.1.8, `@testing-library/*`, react 19.1.0, vite 6.3.5, typescript 5.8.3) — **no new runtime dependency** (plan Technical Context)
- [X] T002 [P] Create `examples/surface-composer/tsconfig.json` (strict; `paths` → `../../packages/*/src`, mirroring trailhead resolution)
- [X] T003 [P] Create `examples/surface-composer/vite.config.ts` (react plugin; source aliases for `tg-mini-app-uikit`, `tg-mini-app-uikit/style.css`, `@tg-mini-app/telegram` + `/testing`, `@tg-mini-app/intl`, `@tg-mini-app/async`; `SURFACE_COMPOSER_USE_DIST` dist-parity branch like trailhead's `TRAILHEAD_USE_DIST`; `server.host 127.0.0.1`, `server.port 5174`; vitest jsdom block)
- [X] T004 [P] Create `examples/surface-composer/index.html` (minimal `#root` mount; reads `?lang=ru` / `?mock=1` query params in `main.tsx`)
- [X] T005 Register the app in the npm workspace and install — confirm root `package.json` `workspaces` covers `examples/*` (add the glob/entry if missing), then run `npm install` so `surface-composer` links; edit root `package.json`

**Checkpoint**: `npm run dev -w surface-composer` boots an empty app on :5174; `npm run typecheck -w surface-composer` passes on the skeleton.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The shared spine both US1 and US2 depend on — state tree, scene/motion machine, recorder, runtime-mode, motion primitives, the centered TMA frame + theme/safe-area bridge, the 7-slot surface scaffold, the DOM/recorder contract on `<main>`, i18n, and the Playwright project + e2e harness.

**⚠️ CRITICAL**: No user-story work begins until this phase is complete.

- [X] T006 [P] Create state types + root reducer in `examples/surface-composer/src/app/composerReducer.ts` — `ComposerState { scene, businessContext, motionState, runtimeMode, reducedMotion, recorder[], proofRevealed }` and the unions `SceneId` (6 ids), `BusinessContext` (5), `MotionState` (US1 7 + US2 6), `RuntimeMode` (3) exactly per data-model.md; pure `useReducer` reducer with typed actions
- [X] T007 [P] Create the recorder in `examples/surface-composer/src/recorder/recorderTypes.ts` + `examples/surface-composer/src/recorder/recorder.ts` — append-only `RecorderEvent[]` with `{ id, scene, source, target, reaction, status, motionState, businessContext?, timestamp }`; **fixture-seeded deterministic** timestamp/id (never `Date.now()` in test path); expose `window.__composerRecorder` accessor in dev/test builds (dom-contract §2)
- [X] T008 [P] Create `examples/surface-composer/src/runtime/useRuntimeMode.ts` — internal (not exported from any package) hook returning `native-mirror | mock | browser-fallback` from `useWebApp()` + `wa.initData` (native) vs the trailhead-style `MockProvider` handle (mock) vs neither (fallback); honesty rule: a mock's `isSupported===true` is NOT native (D4, Principle V)
- [X] T009 [P] Create demo-local motion tokens in `examples/surface-composer/src/motion/easing.css` + `examples/surface-composer/src/motion/easing.ts` — `--sc-ease-out-expo: cubic-bezier(0.16,1,0.3,1)`, `--sc-ease-out-quint`, `--sc-ease-functional`, `--sc-duration-*`, `--sc-origin-x/y`, `--sc-contact-x/y`, `--sc-motion-intensity`; collapse to ~1ms under `prefers-reduced-motion`; reuse kit `--tk-ease`, **never `--tk-spring`** (overshoots — banned, D3)
- [X] T010 [P] Create `examples/surface-composer/src/motion/flip.ts` (FLIP first/last/invert/play using `transform`+`opacity` only — FR-013) and `examples/surface-composer/src/motion/reducedMotion.ts` (`prefers-reduced-motion` hook feeding `reducedMotion` state + `data-reduced-motion`)
- [X] T011 [P] Create `examples/surface-composer/src/runtime/useTelegramThemeBridge.ts` — thin wrapper over existing `useTelegramTheme()` + `useSafeArea()` exposing semantic theme tokens + safe-area bounds for continuity (D6/Principle VI); no duplicated event subscriptions
- [X] T012 [P] Create i18n bridge `examples/surface-composer/src/i18n/enLocale.ts` + `examples/surface-composer/src/i18n/ruLocale.ts` — reuse existing uikit/intl locales + demo keys; RU copy + long-label coverage for the RTL/overflow gate (SC-006)
- [X] T013 Create `examples/surface-composer/src/app/SceneOrchestrator.tsx` — linear scene machine over all 6 `SceneId`s; single primary action advances scene-by-scene in fixed keynote order (FR-015); only `firstLaunch`/`rangeRemix` render, the other four are enumerated-not-rendered (D10); recorder middleware appends one event per visible-effect dispatch (FR-005) (depends T006, T007)
- [X] T014 Create `examples/surface-composer/src/surface/TelegramSurfaceFrame.tsx` — centered TMA frame (max-width ~390px) with safe-area/theme via the bridge; elevation (drop-shadow + faint rim) so stage/surface separation holds even on a dark inner surface (D11) (depends T011)
- [X] T015 Create `examples/surface-composer/src/surface/SurfaceSlots.tsx` — the 7 named slots (`header` `TKHeader`; `hero`/`media` `TKBannerCard`/`TKImage`/`TKProductCardA`; `primaryMetric` `TKStatTile`/`TKCounter`+`TKIcon`; `supportingList` `TKListGroup`+`TKCell`; `trustStrip` `TKAvatarStack`+`TKRating`+`TKBadge`; `primaryAction` `TKButton`/`TKMainButton`) composed **only** from existing exports; stable slot identity across remix, content via props (D2, data-model Surface)
- [X] T016 Create `examples/surface-composer/src/app/SurfaceComposerApp.tsx` — full-viewport dark stage + centered frame + active scene; exposes the DOM contract on the surface root `<main>`: `data-scene` / `data-motion-state` / `data-runtime-mode` / `data-business-context` / `data-reduced-motion` + CSS vars `--sc-contact-x/y`, `--sc-origin-x/y`, `--sc-motion-intensity` (dom-contract §1; FR-019) (depends T013, T014)
- [X] T017 Create `examples/surface-composer/src/main.tsx` — bootstrap: `createMockTelegram` + `TKTelegramProvider` + the composer store/reducer provider + Lang provider; honour `?lang=ru` / `?mock=1`; render `SurfaceComposerApp` (depends T006, T016)
- [X] T018 [P] Create `examples/surface-composer/e2e/helpers.ts` — `page.waitForFunction` motion-state waits (e.g. `[data-motion-state="idle"]`), reduced-motion via `emulateMedia({ reducedMotion: 'reduce' })`, recorder accessor read + fixture-sequence assertion, forbidden-term scanner for the buyer-first gate; **no `waitForTimeout`** (D9, dom-contract §1)
- [X] T019 [P] Create deterministic fixtures under `examples/surface-composer/e2e/fixtures/` — `firstLaunch`, `remix`, `runtime` seeds driving identical recorder sequences / proof comparison (data-model determinism)
- [X] T020 Register the Playwright project at repo root in `playwright.config.ts` — add a `webServer` entry (`npm run dev -w surface-composer`, url `http://127.0.0.1:5174`, `reuseExistingServer: !CI`) and a `surface-composer` project (`testDir: ./examples/surface-composer/e2e`, `baseURL: http://127.0.0.1:5174`, frame 402×874), mirroring the existing `trailhead` project; do not alter the `trailhead`/`chromium` projects (depends T017)
- [X] T021 [P] Unit tests for the pure logic in `examples/surface-composer/src/app/composerReducer.test.ts`, `examples/surface-composer/src/recorder/recorder.test.ts`, `examples/surface-composer/src/runtime/useRuntimeMode.test.ts` — motion-machine transitions are total/valid, recorder is deterministic (identical fixture → identical sequence), runtime-mode derivation is honest (mock ≠ native) (depends T006, T007, T008)

**Checkpoint**: app boots with the dark stage + empty centered frame, DOM contract attributes present on `<main>`, recorder accessor live, `npx playwright test --project=surface-composer --list` collects the (still-empty) project, unit logic green. User-story work can begin.

---

## Phase 3: User Story 1 - First launch sells a Mini App outcome (Priority: P1) 🎯 MVP

**Goal**: The default path opens a buyer-first first viewport — buyer promise, 4-context switcher, a live premium surface that visibly assembles from a single origin point, and one "order this Mini App" action — with zero technical vocabulary. A first meaningful touch opens an inspector revealing ≥1 named UIKit proof element; the CTA exhibits gravity; empty space is recognized, not destructive.

**Independent Test**: Open `/`; confirm buyer promise + switcher (shop/booking/wallet/support) + live surface + single primary action are present and readable with **no overlap** and **no** token/runtime/recorder/test text and **no** build-proof affordance before interaction; then first-touch → `inspector-open` + named proof element + affordance appears (quickstart §US1).

- [X] T022 [P] [US1] Create buyer copy `examples/surface-composer/src/scenes/first-launch/firstLaunch.copy.ts` — promise ("Open. Trust. Order." intent) + CTA ("I want this Mini App"); en + ru; **zero** token/runtime/recorder/test vocabulary (FR-002, SC-002)
- [X] T023 [P] [US1] Create `examples/surface-composer/src/components/Seed.tsx` (origin marker pinned to `--sc-origin-x/y`, committed accent) and `examples/surface-composer/src/components/Rails.tsx` (token + safe-area SVG rails, `scaleX/Y` from the seed) (D2 demo-only helpers)
- [X] T024 [P] [US1] Create `examples/surface-composer/src/components/TactileRing.tsx` (contact-highlight ring anchored at `--sc-contact-x/y`) and `examples/surface-composer/src/components/GravityLayer.tsx` (container that aligns fragments toward the CTA, transform/opacity only)
- [X] T025 [P] [US1] Create `examples/surface-composer/src/surface/SurfaceContextSwitcher.tsx` (4 chips shop/booking/wallet/support via `TKSegmented`/`TKChipGroup`; community deliberately absent — reached via US2 remix, D7) and `examples/surface-composer/src/components/ContextChip.tsx`
- [X] T026 [P] [US1] Create `examples/surface-composer/src/surface/PrimaryActionBar.tsx` — the single primary commitment action (`TKButton` + `TKMainButton`) with accessible name and visible focus (FR-011)
- [X] T027 [US1] Create `examples/surface-composer/src/scenes/first-launch/birthTimeline.ts` — `seed → rails → assembling` (FLIP translate+scale, stagger ~45ms, `--sc-ease-out-quint`) `→ light-sweep` (single radial sweep from seed) `→ idle` (surface-only `scale(1→1.004)`, breathe once then rest; text/icons/cards static); writes `data-motion-state` + one recorder event per step; transform/opacity only (FR-003, FR-013, D5) (depends T009, T010, T023)
- [X] T028 [US1] Create `examples/surface-composer/src/motion/useOriginPulse.ts` + `examples/surface-composer/src/motion/useContactHighlight.ts` — first meaningful touch produces visual feedback < 100ms at the contact point → `first-touch` → `inspector-open`; empty-space tap → recognition ring + faint rail glow with **no** state change (FR-017, SC-014, FR-006, US1 sc.3/sc.5) (depends T024)
- [X] T029 [US1] Create `examples/surface-composer/src/motion/gravity.ts` — on CTA press, proof/context fragments in the first viewport align toward the CTA (transform/opacity only, no confetti) and emit a recorder event; reduced motion resolves to a static aligned state with the same event (FR-020, US1 sc.4) (depends T024)
- [X] T030 [US1] Create `examples/surface-composer/src/proof/PremiumInspectorSheet.tsx` — composed from `TKSheet` + `TKListGroup` + `TKCell`; opens from the contact point at `inspector-open`, surfaces ≥1 **named** UIKit proof element (component/state/token/a11y/runtime), and flips `proofRevealed=true`; Escape/Back closes it before any navigation (US1 sc.3, FR-011)
- [X] T031 [P] [US1] Create `examples/surface-composer/src/surface/BuyerProofStrip.tsx` + `examples/surface-composer/src/components/ProofPill.tsx` — **absent pre-touch**, mounted only after `proofRevealed` (Principle III, dom-contract §3)
- [X] T032 [US1] Create `examples/surface-composer/src/scenes/first-launch/FirstLaunchScene.tsx` — compose the surface with first-launch content into the 7 slots; wire birth + contact-highlight + gravity + inspector + switcher + primary action; enforce the buyer-first gate (`proofRevealed=false`, proof strip/affordance absent, no tech vocabulary pre-touch); reduced-motion shows static assembled state; register as scene `firstLaunch` in `SceneOrchestrator` (depends T022–T031)
- [X] T033 [US1] Create `examples/surface-composer/e2e/first-launch.spec.ts` — buyer-first viewport (forbidden-term scan, proof affordance absent, no overlap); birth `seed → rails → assembling → idle` via state-waits; first-touch → `inspector-open` + ≥1 named proof element + affordance appears; CTA gravity recorder event; empty-space ring with no state change; **+ visual snapshots** at `seed`/`rails`/`assembling`/`idle`/`first-touch`/`inspector-open` (SC-011, `toHaveScreenshot`, animations disabled) (depends T032)
- [X] T034 [P] [US1] Create `examples/surface-composer/e2e/reduced-motion.spec.ts` (US1 cases) — static birth path under `reducedMotion: 'reduce'` emits **identical** recorder events to the full-motion path (FR-010, SC-007) (depends T032)
- [X] T035 [P] [US1] Create `examples/surface-composer/e2e/accessibility.spec.ts` (US1 cases) — accessible names on switcher/CTA/surface, visible unclipped focus ring, Back/Escape closes the inspector before navigating, non-color state signals (FR-011, Principle VI) (depends T032)
- [X] T036 [P] [US1] Create `examples/surface-composer/e2e/performance.spec.ts` — no long task > 50ms during the birth sequence; first primary-touch feedback < 100ms on the reference preview (FR-016, SC-012, SC-014) (depends T032)

**Checkpoint**: 🎯 **MVP** — US1 is fully functional and independently testable; `npx playwright test --project=surface-composer` (US1 specs) is green. Deployable/demoable on its own.

---

## Phase 4: User Story 2 - One surface speaks many businesses (Priority: P2)

**Goal**: The same surface remixes across shop → booking → wallet → support → community by morphing in place (slots separate, rotate around the seed axis, recompose) while design tokens, safe-area, theme, selected context, and runtime status stay anchored. Three accessible triggers (primary action, context chip, horizontal drag) drive the same state machine; no overlap across the responsive matrix; reduced motion substitutes a stepped crossfade with identical events.

**Independent Test**: Trigger the remix and confirm `data-business-context` changes in the defined order, the surface morphs in place (no page cross-fade), the primary action updates with no layout shift, continuity marks stay anchored, and there is no overlap at 320/375/430/desktop + RTL (quickstart §US2).

- [X] T037 [P] [US2] Create `examples/surface-composer/src/scenes/range-remix/businessContexts.ts` — per-context slot content + copy for all 5 contexts (shop/booking/wallet/support/community); en + ru; community supplied here but only reachable through the remix set, not the switcher (D7, FR-004)
- [X] T038 [US2] Create `examples/surface-composer/src/scenes/range-remix/remixTimeline.ts` — `remix-start → separating → rotating → recomposing → locked → continuity`; FLIP shared-element morph, slots rotate around the seed axis (slight `perspective`), new content inherits old bounds, no page cross-fade; writes `data-motion-state` + `data-business-context` + recorder events (FR-004, D6, US2 sc.1) (depends T009, T010, T015)
- [X] T039 [US2] Create `examples/surface-composer/src/motion/useRemixDrag.ts` — horizontal drag (pointer/gyroscope) maps displacement to context proximity; on release the nearest context `locked`s to center; seed stays visually stable; **must not** become a free carousel; recorder event `source: 'pointer'` (D6, dom-contract §4) (depends T038)
- [X] T040 [US2] Wire the three remix triggers to one sequence in `examples/surface-composer/src/surface/SurfaceContextSwitcher.tsx`, `examples/surface-composer/src/surface/PrimaryActionBar.tsx`, and `examples/surface-composer/src/scenes/range-remix/RangeRemixScene.tsx` — context chip + primary action + `useRemixDrag` all dispatch the same remix and emit the **same** recorder sequence; primary action updates **in place** with no layout shift; keyboard reaches every context (a11y parity, FR-011, US2 sc.1) (depends T025, T026, T039)
- [X] T041 [US2] Enforce continuity in `examples/surface-composer/src/scenes/range-remix/remixTimeline.ts` (the `continuity` state) — design tokens, safe-area bounds, theme, selected context, runtime mark, origin point, and primary-action position remain anchored across every remix (FR-004, US2 sc.2) (depends T038)
- [X] T042 [US2] Add the reduced-motion remix substitute in `examples/surface-composer/src/scenes/range-remix/remixTimeline.ts` (reading `reducedMotion` from `src/motion/reducedMotion.ts`) — stepped crossfade replacing rotation/perspective, continuity marks visible, **identical** recorder events; this substitute is itself a gated snapshot state (FR-010, SC-011, US2 sc.4) (depends T038, T010)
- [X] T043 [US2] Create `examples/surface-composer/src/scenes/range-remix/RangeRemixScene.tsx` — compose the remix over the shared surface (slot identity preserved); wire timeline + drag + continuity + reduced-motion; register as scene `rangeRemix` so the primary action advances `firstLaunch → rangeRemix` (FR-015) (depends T037–T042)
- [X] T044 [US2] Create `examples/surface-composer/e2e/range-remix.spec.ts` — remix order shop→booking→wallet→support→community via `data-business-context`; morph-in-place (no page cross-fade); primary action no layout shift; continuity anchored; three triggers emit the same recorder sequence; drag locks the nearest context (not a carousel); **+ visual snapshots** at `remix-start`/`separating`/`rotating`/`locked` (SC-011) (depends T043)
- [X] T045 [US2] Add the responsive matrix to `examples/surface-composer/e2e/range-remix.spec.ts` — no overflow / no overlapping controls at 320 / 375 / 430 px and desktop preview, shell stays a centered TMA surface, RTL + long Russian labels do not clip (SC-006, dom-contract §6) (depends T044)
- [X] T046 [P] [US2] Extend `examples/surface-composer/e2e/reduced-motion.spec.ts` (US2 stepped-crossfade substitute + identical events + its gated snapshot) and `examples/surface-composer/e2e/accessibility.spec.ts` (chip + keyboard reach every context, visible focus ring) (depends T043)

**Checkpoint**: US1 **and** US2 both work independently; full `surface-composer` project green (behaviour + snapshots + reduced-motion + responsive). Increment scope complete.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Craft-finishing, dev tooling, root-wiring gates, and the final verified done-bar sweep.

- [X] T047 [P] Derive the committed accent (OKLCH ≈ `0.62 0.17 250` from `--tk-accent`) applied **only** to the seed + primary action, in `examples/surface-composer/src/motion/easing.css` / `Seed.tsx` / `PrimaryActionBar.tsx`; verify ≥ 4.5:1 contrast on both the light surface and a Telegram-dark inner surface (D8)
- [X] T048 [P] Refine the dark-stage boundary in `examples/surface-composer/src/app/SurfaceComposerApp.tsx` — slow light-falloff stage (no looping spectacle), floating surface with elevation; on a dark inner surface hold stage/surface separation with shadow + faint rim + distinct stage tone, not lightness alone (D11, FR-021)
- [X] T049 [P] Create the dev-only recorder HUD `examples/surface-composer/src/recorder/RecorderPanel.dev.tsx` — visible only in dev, **never** in the buyer first viewport (Principle III)
- [X] T050 Raise `FLOOR` in `scripts/check-e2e-count.mjs` by the count of the new `surface-composer` specs (verify against `npx playwright test --list`), with the reason noted inline
- [X] T051 [P] Add `npm run typecheck -w surface-composer` + `npm run build -w surface-composer` steps to `.github/workflows/ci.yml`
- [X] T052 [P] Create `examples/surface-composer/README.md` — run + validate per quickstart.md (dev :5174, `?lang=ru`/`?mock=1`, the test gates)
- [X] T053 Run the full quality-gate sweep from a clean worktree per quickstart.md and confirm output (no claims from memory): `playwright --project=surface-composer` green, `playwright --project=trailhead` green **and unmodified**, `typecheck -w surface-composer`, `build -w surface-composer`, `npm run typecheck` (uikit), `npm run check:api` **unchanged baseline** (proves no new public exports), `npm run check:e2e-count`, `npx react-doctor@latest --verbose --scope changed`

---

## Dependencies & Execution Order

### Phase dependencies

- **Setup (T001–T005)**: T001–T004 parallel; T005 after the package exists.
- **Foundational (T006–T021)**: depends on Setup. **Blocks all user stories.** T006–T012 + T018/T019 parallel; T013 needs T006/T007; T014 needs T011; T016 needs T013/T014; T017 needs T006/T016; T020 needs T017; T021 needs T006/T007/T008.
- **US1 (T022–T036, P1)**: depends on Foundational. **MVP.** Independently testable.
- **US2 (T037–T046, P2)**: depends on Foundational; reuses the US1 switcher/primary-action/surface but is independently testable. (Can start in parallel with US1 once Foundational is done; T040 then waits on US1's T025/T026.)
- **Polish (T047–T053)**: depends on US1 + US2; T050 after specs exist (count is final); T053 is the final verified gate.

### Within US1

T022–T026/T031 parallel ([P]) → T027 (needs T023) / T028 (needs T024) / T029 (needs T024) / T030 → T032 (needs all) → T033 (+snapshots); T034/T035/T036 parallel after T032.

### Within US2

T037 [P] → T038 → T039 → T040 (needs T025/T026/T039) / T041 (needs T038) / T042 (needs T038) → T043 (needs all) → T044 → T045 (same file, sequential); T046 [P] after T043.

### Parallel opportunities

- Setup config files T001–T004 together.
- Foundational T006–T012 + T018 + T019 together (distinct files, no cross-dep).
- US1 leaf components/copy T022, T023, T024, T025, T026, T031 together; US1 secondary specs T034/T035/T036 together.
- Polish T047, T048, T049, T051, T052 together.

---

## Parallel Example: Foundational

```bash
# Distinct files, no dependency on an incomplete task:
Task T006: composerReducer.ts (state + reducer)
Task T007: recorder.ts + recorderTypes.ts
Task T008: useRuntimeMode.ts
Task T009: motion/easing.css + easing.ts
Task T010: motion/flip.ts + reducedMotion.ts
Task T011: runtime/useTelegramThemeBridge.ts
Task T012: i18n/enLocale.ts + ruLocale.ts
Task T018: e2e/helpers.ts
Task T019: e2e/fixtures/
```

## Parallel Example: User Story 1

```bash
# Leaf components + copy in parallel:
Task T022: scenes/first-launch/firstLaunch.copy.ts
Task T023: components/Seed.tsx + components/Rails.tsx
Task T024: components/TactileRing.tsx + components/GravityLayer.tsx
Task T025: surface/SurfaceContextSwitcher.tsx + components/ContextChip.tsx
Task T026: surface/PrimaryActionBar.tsx
Task T031: surface/BuyerProofStrip.tsx + components/ProofPill.tsx
```

---

## Implementation Strategy

### MVP first (US1 only)

1. Setup (T001–T005) → 2. Foundational (T006–T021) → 3. US1 (T022–T036) → **STOP & VALIDATE** US1 independently (buyer-first gate, birth states, first-touch inspector, CTA gravity, empty-space recognition; US1 specs + snapshots green) → demo.

### Incremental delivery

Setup + Foundational → US1 (MVP, demo) → US2 (range, demo) → Polish (craft + gates). Each story adds value without breaking the previous one; `examples/trailhead` stays green throughout as independent regression coverage.

### Deferred (NOT in this increment)

US3 (interaction trust), US4 (runtime pressure), US5 (build proof), US6 (receipt) — specified, no tasks here (D10). The mock adapter already exposes `setColorScheme`/`setDeviceCutouts`/`setViewportBounds`/`dragViewport`, so US4 is ready to land later without foundational rework.

---

## Notes

- `[P]` = different files, no dependency on an incomplete task; same-file edits are sequential.
- Every visible effect emits exactly one recorder event carrying the same state vocabulary exposed on the DOM (FR-005 ↔ FR-019).
- Reduced-motion is a **designed static state** emitting identical recorder events — not "animations off" (FR-010).
- No completion is claimed from a summary; T053 verifies every gate locally (constitution Quality Gates).
- Commit after each task or logical group; stop at any checkpoint to validate a story independently.
