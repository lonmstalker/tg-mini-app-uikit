# UIKit Surface Composer Constitution

This constitution governs the flagship demo for `tg-mini-app-uikit`. It is the
source of durable principles. Individual feature specs and plans must comply
with it; where a spec conflicts, the constitution wins.

## Core Principles

### I. Sell The System, Not A One-Off
The demo exists to sell the reusable UIKit, not a single custom Telegram Mini
App. A viewer must leave thinking "I can build premium, Telegram-native Mini App
surfaces from this kit", never "nice custom app". Any scene that reads as one
bespoke product instead of reusable composition is a defect, not a feature.

### II. Compose From Existing Exports (NON-NEGOTIABLE)
The demo is built from existing public UIKit exports plus demo-only composition
that lives under `examples/`. New public UIKit elements are blocked by default.
A new public element ships only after it passes API review, tests, Storybook,
docs, accessibility, and reduced-motion review — never just because a demo scene
wanted it. Demo-only helpers must not leak into `packages/uikit/src/index.ts`.

### III. Buyer-First, Proof Second
The first impression sells the outcome in plain commercial language (open inside
Telegram, look premium, let users trust and order). Token, runtime, recorder,
and test vocabulary must not appear in the first viewport. UIKit internals are
revealed only after a meaningful touch or in a dedicated proof scene. Leading
with engineering chrome is a regression.

### IV. Deterministic, Testable Motion (NON-NEGOTIABLE)
Every visible effect must be addressable and provable, not decorative:
- exposes deterministic `data-demo-*` / `data-motion-*` / `data-runtime-mode` /
  `data-reduced-motion` hooks tied to fixed states, not timing sleeps;
- produces a recorder event with source, target, visible reaction, and
  native/mock/fallback status;
- animates only `transform`, `opacity`, isolated clip/mask, and semantic CSS
  variable interpolation — never width, height, top, left, margin, or padding;
- ships a reduced-motion path that preserves all meaning without rotation, long
  path travel, or depth.
An effect that could be swapped into any other UI library without losing meaning
fails this principle.

### V. Honest Runtime, No Fake Claims
Native, mock, and browser-fallback states are always explicit and visually
distinct. The demo never claims a native capability (haptic, MainButton, share,
theme) when only a fallback exists, and never shows a layer, test, or proof pin
as `passed` when the evidence does not exist. Unproven evidence is labelled
`candidate` or `planned`.

### VI. Telegram Constraints Are The Value
Safe areas, theme variables, viewport pressure, keyboard, native buttons, and
BackButton priority are presented as system advantages the kit absorbs, not as
isolated wow claims or afterthoughts. Accessibility basics are non-negotiable:
every interactive region has an accessible name and visible focus, keyboard
reaches every primary target, Back/Escape closes overlays before navigating, and
color is never the only state signal.

## Additional Constraints

- Implementation surface: a dedicated demo-only example app at
  `examples/surface-composer`. Its default launch path `/` opens Surface Composer.
  It MUST NOT modify the separate `examples/trailhead` example, which stays as
  independent regression coverage.
- Presentation discipline: cold open with the product, one idea per screen,
  signature motion before copy, proof immediately after, sparse exact copy. No
  landing-page hero, feature checklist, tutorial narration, generic mobile
  navigation, or docs pasted onto the surface.
- Layout: the surface must read as a Telegram Mini App at 320 / 375 / 430 px and
  on desktop preview (centered TMA width, not a stretched web page), with no
  overlap among promise, switcher, live surface, proof strip, and bottom action.
- Rendering: the live product surface is inspectable, accessible DOM (CSS, SVG, and
  a small rAF layer). WebGL/3D must not render product UI or hold product state; it
  is allowed only as a non-interactive stage/background atmosphere, and the full
  experience must pass with WebGL absent. The "alive" feel comes from product agency,
  not a separate renderer.

## Quality Gates

A change to the demo is "done" only when, from the current worktree:
- the Surface Composer e2e (its own Playwright project) passes, and the existing
  `playwright --project=trailhead` suite stays green and unmodified;
- `npm run typecheck` for the demo app and uikit, `npm run build` for the demo
  app, `npm run check:api`, `npm run check:stories`, and `npm run check:package`
  pass;
- `npx react-doctor@latest --verbose --scope changed` does not regress;
- responsive no-overlap and reduced-motion behavior are proven, not asserted from
  memory.
No completion is claimed on the basis of an assistant or subagent summary; every
accepted claim is verified locally.

## Governance

This constitution supersedes ad-hoc demo decisions. Amendments require an edit
here with a bumped version, a dated rationale, and a sync check of dependent
templates (`spec`, `plan`, `tasks`). Complexity that violates a principle must be
justified in the feature's plan Complexity Tracking or removed. The living design
notes in `plans.md` are historical input, not authority; this constitution and
the feature spec are authority.

**Version**: 1.2.0 | **Ratified**: 2026-06-16 | **Last Amended**: 2026-06-16
<!-- 1.2.0 (2026-06-16): Added Rendering constraint — no-WebGL default; live surface
must be inspectable DOM, WebGL only as non-interactive atmosphere, experience must pass
with WebGL absent. Spec 001 already conforms; no plan/tasks yet to sync. -->
<!-- 1.1.0 (2026-06-16): Implementation surface moved from examples/trailhead to a
dedicated examples/surface-composer app; legacy ?legacy=1 routing dropped. -->
