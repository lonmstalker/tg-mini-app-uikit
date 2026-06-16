# Implementation Plan: UIKit Surface Composer

**Branch**: `001-surface-composer` | **Date**: 2026-06-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-surface-composer/spec.md`

**Companions**: [design-brief.md](./design-brief.md) · [animation-brief.md](./animation-brief.md) · [wow-brief.md](./wow-brief.md) · authority: [constitution.md](../../.specify/memory/constitution.md) (v1.2.0)

## Summary

Build `examples/surface-composer` — a new npm-workspace demo app that sells the
reusable `tg-mini-app-uikit`. One continuous, Telegram-native DOM surface is born
from a single origin point (US1), then remixes across shop / booking / wallet /
support / community without losing token, safe-area, theme, or runtime continuity
(US2). Buyer-facing value leads; technical proof appears only after a meaningful
touch. The first increment delivers **US1 + US2 at full fidelity**; US3–US6 stay
specified but deferred.

Technical approach: mirror the `examples/trailhead` scaffold (Vite + React 19 +
the `@tg-mini-app/*` workspace packages), compose the surface **only** from existing
public UIKit exports plus demo-only helpers under `examples/surface-composer/src`,
and drive every visible effect through a deterministic motion-state machine exposed
on the DOM (`data-scene` / `data-motion-state` / `data-runtime-mode` /
`data-business-context` / `data-reduced-motion`) with a recorder event per effect.
The live surface is **no-WebGL** (CSS/SVG/FLIP + a small rAF layer). A new
`surface-composer` Playwright project gates behaviour, visual snapshots at key motion
states, reduced-motion parity, and the no-overlap responsive matrix. `examples/trailhead`
is not modified and stays green as independent regression coverage.

## Technical Context

**Language/Version**: TypeScript 5.x (strict) · React 19.1.0

**Primary Dependencies**: `tg-mini-app-uikit`, `@tg-mini-app/telegram`,
`@tg-mini-app/intl`, `@tg-mini-app/async` (all workspace `*`) · Vite 6.3.5 · **no new
runtime dependencies**; no new public UIKit exports.

**Storage**: N/A for this increment. The Telegram storage backends are reachable via
the existing adapter; the deterministic proof receipt that would use them is US6
(deferred).

**Testing**: Playwright 1.60.0 — a new `surface-composer` project (e2e + visual
snapshots + reduced-motion + responsive matrix). Vitest 4.1.8 + `@testing-library/react`
available for demo-only unit logic (motion-state machine, recorder, runtime-mode
detection) if useful.

**Target Platform**: Telegram Mini App WebView, **browser-simulated** this phase
(real-Telegram execution deferred). Reference frame 402×874; responsive at 320 / 375 /
430 px and desktop preview.

**Project Type**: Web — a single-page demo app inside the npm workspace at
`examples/surface-composer` (workspace name `surface-composer`).

**Performance Goals**: no long task > 50 ms during signature sequences; 60fps target on
the reference preview; first visual feedback for any primary touch < 100 ms.

**Constraints**: motion limited to `transform`, `opacity`, isolated `clip`/`mask`, and
semantic CSS-variable interpolation — layout-property animation prohibited; live surface
no-WebGL (inspectable DOM); no new public UIKit exports; reduced-motion parity emitting
identical recorder events; RTL + long Russian labels; no overlap across the responsive
matrix; honest `native` / `mock` / `fallback` labelling.

**Scale/Scope**: 2 in-scope scenes (US1 first-launch, US2 range-remix) of a 6-scene
linear instrument; 5 business contexts (4 visible in the switcher, community via remix);
one surface with 7 slots (header / hero / media / primaryMetric / supportingList /
trustStrip / primaryAction).

## Constitution Check

*GATE: evaluated against constitution v1.2.0. Re-checked after Phase 1 design — still PASS.*

| # | Principle | Verdict | How the plan satisfies it |
|---|-----------|---------|---------------------------|
| I | Sell the system, not a one-off | PASS | One remixable surface across 5 contexts; SC-001/SC-003 reviewer checks. No bespoke single-app framing. |
| II | Compose from existing exports (NON-NEGOTIABLE) | PASS | Surface composed from existing TK* exports; gaps (seed, rails, contact-highlight, gravity, inspector-via-TKSheet, runtime badge, recorder HUD) are demo-only under `examples/surface-composer/src`. Nothing added to `packages/uikit/src/index.ts`; `check:api` stays green unchanged. |
| III | Buyer-first, proof second | PASS | First viewport = buyer copy + switcher + surface + one CTA; no token/runtime/recorder/test vocabulary pre-touch (FR-002, SC-002). Proof layer gated behind first meaningful touch. |
| IV | Deterministic, testable motion (NON-NEGOTIABLE) | PASS | `data-scene`/`data-motion-state`/`data-runtime-mode`/`data-business-context`/`data-reduced-motion` hooks; recorder event per effect; transform/opacity/clip-mask/CSS-var only; reduced-motion path with identical events. Demo-local `--sc-ease-*` tokens (kit `--tk-spring` overshoots and is banned). |
| V | Honest runtime, no fake claims | PASS | Internal `useRuntimeMode()` distinguishes native/mock/fallback from `wa.initData` + mock presence; fallbacks visually distinct; evidence pins `candidate`/`planned` until fixture-backed. |
| VI | Telegram constraints are the value | PASS | Reuse `useTelegramTheme` + `useSafeArea` for theme/safe-area continuity; a11y basics (names, focus, Back/Escape, non-color signals) per FR-011. |
| — | Additional Constraints (surface app, presentation, layout, **Rendering/no-WebGL**) | PASS | Dedicated `examples/surface-composer`; trailhead untouched; cold-open product; live surface inspectable DOM, WebGL absent. |
| — | Quality Gates | PASS (planned) | `surface-composer` Playwright project + trailhead suite green + `typecheck`/`build` for the app + uikit gates unchanged + `react-doctor --scope changed` + proven responsive/reduced-motion. |

No violations → Complexity Tracking is empty.

## Project Structure

### Documentation (this feature)

```text
specs/001-surface-composer/
├── plan.md              # This file
├── research.md          # Phase 0 — decisions resolving open questions
├── data-model.md        # Phase 1 — entities (Surface, BusinessContext, RecorderEvent, motion machine, RuntimeMode)
├── quickstart.md        # Phase 1 — run + validate guide
├── contracts/
│   └── dom-contract.md   # Phase 1 — DOM data-attribute + recorder-event contract (what e2e asserts)
├── spec.md / design-brief.md / animation-brief.md / wow-brief.md   # existing
└── tasks.md             # Phase 2 — created by /speckit-tasks (NOT here)
```

### Source Code (repository root)

New app (mirrors `examples/trailhead` conventions; trailhead itself is untouched):

```text
examples/surface-composer/
├── package.json          # name "surface-composer"; scripts dev/build/typecheck/test; workspace deps only
├── vite.config.ts        # source aliases (HMR) + SURFACE_COMPOSER_USE_DIST dist-parity; server.port 5174
├── tsconfig.json         # paths → ../../packages/*/src (mirror trailhead)
├── index.html            # minimal mount; ?lang=ru / ?mock=1 query params
├── src/
│   ├── main.tsx          # bootstrap: createMockTelegram + TKTelegramProvider + ComposerStore + Lang
│   ├── app/
│   │   ├── SurfaceComposerApp.tsx   # dark stage + centered TMA frame + active scene
│   │   ├── composerReducer.ts       # scene, businessContext, motionState, runtimeMode, recorder[], reducedMotion
│   │   └── SceneOrchestrator.tsx     # linear scene machine (6 ids; US1+US2 implemented)
│   ├── scenes/
│   │   ├── first-launch/  # FirstLaunchScene, birthTimeline, firstLaunch.copy
│   │   └── range-remix/   # RangeRemixScene, remixTimeline, businessContexts
│   ├── surface/           # TelegramSurfaceFrame, SurfaceSlots, SurfaceContextSwitcher, BuyerProofStrip, PrimaryActionBar
│   ├── runtime/           # useRuntimeMode (native/mock/fallback), useTelegramThemeBridge (wraps useTelegramTheme/useSafeArea)
│   ├── recorder/          # recorder, recorderTypes, RecorderPanel.dev (dev-only HUD)
│   ├── motion/            # flip, reducedMotion, easing (--sc-* tokens), useOriginPulse, useContactHighlight, gravity, useRemixDrag
│   ├── proof/             # PremiumInspectorSheet (TKSheet+TKListGroup+TKCell) — US1 second layer
│   ├── components/        # demo-only primitives: Seed, Rails, ContextChip, ProofPill, TactileRing, GravityLayer
│   └── i18n/              # enLocale, ruLocale (reuse uikit locales + demo keys)
└── e2e/
    ├── first-launch.spec.ts   # buyer-first viewport, birth states, first-touch inspector, CTA gravity, empty-space
    ├── range-remix.spec.ts    # remix order, continuity, no-overlap 320/375/430/desktop
    ├── reduced-motion.spec.ts # static paths, identical recorder events
    ├── accessibility.spec.ts  # names, focus, Back/Escape, non-color signals
    ├── performance.spec.ts    # no long task > 50ms, <100ms first feedback
    ├── helpers.ts             # motion-state waits (no sleeps), recorder/fixture assertions
    └── fixtures/              # firstLaunch / remix / runtime deterministic fixtures
```

Repository-root wiring the plan touches (NOT trailhead):

```text
playwright.config.ts            # + webServer (npm run dev -w surface-composer, :5174) + project "surface-composer"
scripts/check-e2e-count.mjs     # raise FLOOR by the new spec count
.github/workflows/ci.yml        # + "npm run typecheck -w surface-composer" + "npm run build -w surface-composer"
```

**Structure Decision**: A dedicated workspace app at `examples/surface-composer` mirroring
the trailhead scaffold (Vite/React/TS, `@tg-mini-app/*` source aliases, Telegram mock
bootstrap, i18n bridge). It diverges from trailhead by replacing tabbed navigation with a
linear `SceneOrchestrator` and a single remixable `Surface`, and by adding demo-only motion /
recorder / runtime-mode helpers under `src/`. Note: `plans.md` historically placed Surface
Composer inside `examples/trailhead` (e.g. `data-demo-screen='surface-composer'`); the
constitution v1.1.0 superseded that — the authoritative location is the dedicated app.

## Complexity Tracking

> No constitution violations. No entries.
