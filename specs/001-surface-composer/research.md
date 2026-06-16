# Phase 0 Research — UIKit Surface Composer

All Technical Context fields are resolved (no NEEDS CLARIFICATION remain). Each
decision below is grounded in the real repo, the spec, and the design/animation/wow
briefs. Source paths are given so `/speckit-tasks` and implementation can verify.

## D1. App location and wiring

- **Decision**: New workspace app `examples/surface-composer` (name `surface-composer`),
  mirroring `examples/trailhead`. Dev port **5174** (trailhead owns 5173). Add a
  `surface-composer` Playwright project + webServer; raise `scripts/check-e2e-count.mjs`
  `FLOOR` by the new spec count; add `typecheck -w` / `build -w` CI steps.
- **Rationale**: `scripts/build.mjs` builds only packages, not examples; example apps
  carry their own scripts and Playwright project (`playwright.config.ts` trailhead pattern).
  The uikit-scoped gates (`check:api`, `check:stories`, `check:package`, `check:cycles`)
  do not scan `examples/`, so composing the demo from existing exports keeps them green
  with no change — directly satisfying Principle II.
- **Alternatives rejected**: building inside `examples/trailhead` (the historical
  `plans.md` approach) — forbidden by the constitution (trailhead must stay untouched as
  regression coverage); a standalone repo — loses workspace source aliases and the shared
  Telegram mock.

## D2. Compose-only inventory and demo-only gaps

- **Decision**: Build the 7 surface slots from existing exports — header `TKHeader`;
  switcher `TKSegmented`/`TKChip`/`TKChipGroup`; hero/media `TKBannerCard`/`TKImage`/
  `TKProductCardA`; metric `TKStatTile`/`TKCounter`+`TKIcon`; list `TKListGroup`+`TKCell`
  (or `TKInfiniteList`); trust strip `TKAvatarStack`+`TKRating`+`TKBadge`; action `TKButton`
  + `TKMainButton`; loading `TKSkeleton*`; inspector `TKSheet`+`TKListGroup`+`TKCell`;
  layout `TKPage`/`TKSafeArea`/`TKBottomBar`. Demo-only helpers (under `examples/`, **not**
  public exports): `Seed` (origin marker), `Rails` (token/safe-area SVG rails), `TactileRing`
  (contact highlight), `GravityLayer` (CTA gravity), `ContextChip`/`ProofPill` wrappers,
  `RecorderPanel.dev` (HUD), `useRuntimeMode` badge.
- **Rationale**: There is no `TKInspector`, no single "trust" primitive, and no origin/rails
  concept in the kit — these are demo composition, which the constitution explicitly allows
  under `examples/`. Confirmed against `packages/uikit/src/index.ts` and the atoms/composites/
  templates barrels.
- **Alternatives rejected**: adding `TKInspector`/`TKSeed` to the kit — blocked by Principle II
  (would require API review/tests/Storybook/docs and would not be "because a demo wanted it").

## D3. Motion tokens and easing

- **Decision**: Define demo-local motion tokens under `src/motion/easing` per
  animation-brief §5 (`--sc-ease-out-expo: cubic-bezier(0.16,1,0.3,1)`,
  `--sc-ease-out-quint`, `--sc-ease-functional`, `--sc-duration-*`, `--sc-origin-x/y`,
  `--sc-contact-x/y`, `--sc-motion-intensity`). Use the kit's `--tk-ease` for functional
  motion; **never** `--tk-spring`.
- **Rationale**: `packages/uikit/src/tokens/tokens.css` defines `--tk-spring:
  cubic-bezier(.34,1.45,.58,1)` whose control point `1.45 > 1` overshoots (bounce) — banned
  by the brief ("premium is inevitability, not play-toy physics"). Demo-local tokens keep the
  signature easing without touching kit tokens.
- **Reduced motion**: the kit already collapses `--tk-ms`/`--tk-t*` to ~1ms under
  `prefers-reduced-motion`; demo tokens follow the same media query so reduced motion is a
  designed static state, not "animations off".

## D4. Runtime-mode (honest native/mock/fallback)

- **Decision**: Internal hook `useRuntimeMode()` (not exported) returns
  `native-mirror | mock | browser-fallback` by checking `useWebApp()` + `wa.initData`
  (native) vs the trailhead-style `MockProvider` handle (mock) vs neither (fallback). Theme
  and safe-area continuity reuse `useTelegramTheme()` and `useSafeArea()` directly.
- **Rationale**: `@tg-mini-app/telegram` has no built-in runtime-source concept — every hook
  exposes only `isSupported`, and a mock also reports `isSupported=true`. Honest labelling
  therefore requires explicit detection, synthesized in the demo. Reusing the theme/safe-area
  hooks avoids duplicating their event subscriptions.
- **Note**: `keyboard-pressure`, `theme-shift`, `safe-area-pressure` (US4 runtime pressure)
  are deferred; the mock already exposes `setColorScheme`/`setDeviceCutouts`/`setViewportBounds`/
  `dragViewport`, so the adapter is ready when US4 lands.

## D5. Birth, light sweep, idle (US1)

- **Decision**: Birth choreography per animation-brief §6: `seed` (0–180ms scale+glow) →
  `rails` (120–340ms SVG `scaleX/Y` from seed origin) → `assembling` (340–760ms FLIP
  translate+scale, stagger ~45ms, `--sc-ease-out-quint`) → `light-sweep` (760–920ms single
  radial sweep emanating from seed center, opacity 0→1→0, `--sc-ease-out-expo`) → `idle`
  (surface-only `scale(1→1.004)`, breathe once then rest; text/icons/cards static).
- **Rationale**: Matches FR-003 (signature reveal closing with a light sweep, surface-only
  idle) and the wow-brief Birth weighting (~70%). FLIP uses transform/opacity only (FR-013).

## D6. Remix continuity (US2)

- **Decision**: Remix is one object morphing, not navigation: `remix-start` (compress 0.992,
  seed brightens) → `separating` (slots detach 4–8px) → `rotating` (slots rotate around seed
  axis, slight CSS `perspective`) → `recomposing` (new content inherits old bounds) → `locked`
  (primary action updates in place) → `continuity` (tokens/safe-area/theme/runtime marks
  anchored). Order: shop → booking → wallet → support → community. Shared elements persist
  (FLIP); no page cross-fade.
- **Triggers**: three ways to advance the remix, all landing on the same state machine —
  (1) the primary action, (2) a context chip in the switcher, (3) horizontal drag (pointer /
  gyroscope, design-brief §8 / animation-brief §8.4). Drag maps horizontal displacement to
  context proximity; on release the nearest context `locked`s to center, the seed stays
  visually stable, and it MUST NOT become a free carousel. Pointer and chip are the
  click/keyboard-accessible equivalents of drag (a11y parity, FR-011); all three emit the same
  recorder event sequence.
- **Reduced motion**: keep chip + primary action; drag still resolves to the two-step stepped
  crossfade (no rotation/perspective) with continuity marks visible and identical recorder
  events. This reduced-motion remix substitute is itself a gated snapshot (SC-011).

## D7. Business-context switcher count (4 vs 5)

- **Decision**: Visible switcher shows the four primary contexts (shop / booking / wallet /
  support); **community** is reachable through the US2 remix set. The remixable context set is
  all five (FR-004).
- **Rationale**: The research doc, design-brief §9 copy, and both briefs agree — the switcher
  renders 4 chips while the system supports 5. Already encoded in spec US1 scenario 1. Closes
  the design-brief §11 open question.

## D8. Committed accent derivation

- **Decision**: Derive the committed accent from `--tk-accent` toward OKLCH ≈ `0.62 0.17 250`
  (design-brief §3), applied **only** to the seed and the primary action. Verify ≥4.5:1 contrast
  on both the light surface and a Telegram-dark inner surface at craft time.
- **Rationale**: The kit accent default (`#3390ec`/`--tk-accent`) is theme-overridable; an OKLCH
  derivation keeps the accent committed and stable across theme. The dark-surface contrast check
  is a build-time verification, not a spec unknown.

## D9. Test + snapshot harness

- **Decision**: New `surface-composer` Playwright project at frame 402×874. Determinism via
  `page.waitForFunction(() => document.querySelector('[data-motion-state="idle"]'))` (and other
  states) instead of `waitForTimeout`. Reduced motion via `page.emulateMedia({ reducedMotion:
  'reduce' })` asserting `--tk-ms`/`--sc-*` collapse and identical recorder events. Visual
  snapshots (global `toHaveScreenshot`, `animations:'disabled'`, `maxDiffPixels:64`) at the
  SC-011 key states. Responsive matrix 320/375/430 + desktop. Fixtures under `e2e/fixtures/`
  drive deterministic recorder comparison.
- **Rationale**: Matches the existing trailhead/a11y harness (`examples/trailhead/e2e/a11y.spec.ts`)
  and the global Playwright config; reuses conventions reviewers already trust.

## D10. US3–US6 scope boundary

- **Decision**: This increment implements US1 + US2 only. `SceneOrchestrator` enumerates all six
  scene ids so the linear primary-action contract (FR-015) is real, but only `firstLaunch` and
  `rangeRemix` render full scenes; US3–US6 are not built (no stubs required for the increment's
  acceptance). Any evidence pin shown is `candidate`/`planned` until fixture-backed (FR-008/V).
- **Rationale**: Concentrates the wow budget (design-brief §6) and keeps the increment shippable
  and independently testable per the spec scope clarification.

## D11. Dark-stage boundary (desktop + dark inner surface)

- **Decision**: Full-viewport dark stage background (very slow light falloff, no looping
  spectacle — the "Stage" layer of animation-brief §3); the live surface is a centered TMA
  container at max-width ~390px that floats with a subtle drop shadow. On desktop preview the
  stage fills the viewport while the surface stays Telegram-sized, so it reads as "a phone
  surface on a dark stage", never a stretched web landing page.
- **Dark inner surface**: when the surface itself is in Telegram dark theme, stage/surface
  separation MUST NOT collapse — hold it with elevation (surface drop-shadow + a faint rim) and
  a distinct stage tone, not lightness alone.
- **Rationale**: A bordered frame would read as a web hero; a full-bleed stage with a fixed-width
  floating surface preserves the theater-vs-product separation that amplifies the birth wow
  (design-brief §3) and satisfies the centered-TMA layout gate (SC-006) on desktop. Resolves the
  two design-brief §11 open questions (desktop boundary + accent/contrast on dark; accent
  derivation itself is D8).
