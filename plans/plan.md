# UIKit Component Reorganization Workflow

## Purpose

This document defines the workflow for using the component plan files in `plans/` to reorganize `packages/uikit/src` into clear reusable UIKit categories:

- tokens: design primitives and semantic CSS contracts;
- atoms: low-level UI elements and form controls;
- composites: reusable composed components, overlays, navigation, feedback, lists, cards, gestures, and layout;
- templates: reusable screen and flow patterns;
- cleanup: files that may be too app-specific, demo-specific, or domain-specific for `src`.

This is the operating plan for future implementation. It is not a record of the harness creation task.

## Harness Contract

The executor must use [harness.md](harness.md) as the source of truth for guardrails. The short version:

- Work from one `components-*.md` file at a time.
- Do not close reviewer-only questions as the implementation author.
- Use `uikit-element-development`, `impeccable`, and `superpowers:test-driven-development` for every source-changing component task.
- Keep every touched source file below 2000 lines.
- Keep Storybook evidence inside `packages/uikit/storybook/<category>`; for atoms, use `packages/uikit/storybook/atoms`.
- For every element slice, add or update unit test, Storybook story, and e2e test evidence before claiming it implemented.
- Do not keep old source deep-path import surfaces. Document every breaking change in API tests, snapshots, docs, stories, and migration notes.

## Component Files

- [components-foundation.md](components-foundation.md): package entrypoints, theme, i18n, Telegram runtime, options, internal helpers.
- [components-tokens.md](components-tokens.md): `tokens.css`, typography, semantic states, spacing, radius, shadow, motion, z-index, breakpoints.
- [components-atoms.md](components-atoms.md): buttons, inputs, controls, icons, primitive display, tappable/link-like elements.
- [components-composites.md](components-composites.md): overlays, forms, cards, lists, navigation, layout, chat, feedback, gestures.
- [components-templates.md](components-templates.md): commerce, wallet, onboarding, dashboard, connector setup, approval/history/error/degraded flows.
- [components-cleanup.md](components-cleanup.md): gamification, demo-only candidates, domain-specific cards, app-specific showcases.

## Author Execution Evidence

### 2026-06-13 `packages/uikit/src/service.tsx` atom move

- Checked task: [x] Execute the first component-reorganization slice from `components-atoms.md` for `packages/uikit/src/service.tsx`.
- Scope: first component-reorg slice from [components-atoms.md](components-atoms.md), entry `packages/uikit/src/service.tsx`.
- Contract: implementation moved to `packages/uikit/src/atoms/service.tsx`; old deep path `packages/uikit/src/service.tsx` was removed; root package exports stay stable through `packages/uikit/src/index.ts` `export * from "./atoms/service"`.
- TDD RED: `npm run test -w tg-mini-app-uikit -- service-reorg.test.tsx` exited 1 with the expected missing category import: `Failed to resolve import "../src/atoms/service"`.
- TDD GREEN and focused validation: `npm run test -w tg-mini-app-uikit -- service-reorg.test.tsx` exited 0 with 1 test passing; `npm run test -w tg-mini-app-uikit -- service-reorg.test.tsx m0-api.test.tsx coverage-components.test.tsx` exited 0 with 3 files and 171 tests passing; `npm run typecheck -w tg-mini-app-uikit`, `npm run build -w tg-mini-app-uikit`, and `npm run check:package` all exited 0.
- Visual note: no browser visual pass was run for this move-only slice because no JSX output, CSS, tokens, stories, or runtime behavior changed; package-local Storybook evidence lives in `packages/uikit/storybook/atoms/service.stories.tsx`.

### 2026-06-13 `packages/uikit/src/icons.tsx` atom move

- Checked task: [x] Execute the second atom component-reorganization slice from `components-atoms.md` for `packages/uikit/src/icons.tsx`.
- Scope: second atom component-reorg slice from [components-atoms.md](components-atoms.md), entry `packages/uikit/src/icons.tsx`.
- Contract: implementation moved to `packages/uikit/src/atoms/icons.tsx`; old deep path `packages/uikit/src/icons.tsx` was removed; root package exports stay stable through `packages/uikit/src/index.ts` `export * from "./atoms/icons"`; existing internal imports were rewritten to atom paths.
- TDD RED: `npm run test -w tg-mini-app-uikit -- icons-reorg.test.tsx` exited 1 with the expected missing category import: `Failed to resolve import "../src/atoms/icons"`.
- TDD GREEN and focused validation: `npm run test -w tg-mini-app-uikit -- icons-reorg.test.tsx` exited 0 with 1 file and 2 tests passing; `npm run test -w tg-mini-app-uikit -- icons-reorg.test.tsx m5-display.test.tsx api-surface.test.ts` exited 0 with 3 files and 28 tests passing; `npm run typecheck -w tg-mini-app-uikit`, `npm run build -w tg-mini-app-uikit`, and the sequential `npm run check:package` rerun all exited 0.
- Visual note: no browser visual pass was run for this move-only slice because no JSX output, CSS, tokens, stories, or runtime behavior changed; `packages/uikit/test/icons-reorg.test.tsx` includes a rendered SVG smoke check, and package-local Storybook evidence lives in `packages/uikit/storybook/atoms/icons.stories.tsx`.

### 2026-06-13 `packages/uikit/src/controls.tsx` atom category barrel

- Checked task: [x] Execute the third atom component-reorganization slice from `components-atoms.md` for `packages/uikit/src/controls.tsx`.
- Status: needs reviewer.
- Scope: third atom component-reorg slice from [components-atoms.md](components-atoms.md), entry `packages/uikit/src/controls.tsx`.
- Contract: `packages/uikit/src/atoms/controls.tsx` is the atom category barrel; old deep path `packages/uikit/src/controls.tsx` was removed; root package exports stay stable through `packages/uikit/src/index.ts` `export * from "./atoms/controls"`; implementation modules were moved or split by the later controls slices.
- TDD RED: `npm run test -w tg-mini-app-uikit -- controls-reorg.test.tsx` exited 1 with the expected missing category import: `Failed to resolve import "../src/atoms/controls"`.
- TDD GREEN and focused validation: initial `npm run test -w tg-mini-app-uikit -- controls-reorg.test.tsx` exited 0 with 1 file and 1 test passing; after the later chips reorg test was added, the same command exits 0 with 1 file and 2 tests passing. Current focused regression `npm run test -w tg-mini-app-uikit -- controls-reorg.test.tsx controls.test.tsx m2-roving.test.tsx m4-forms.test.tsx coverage-components.test.tsx api-surface.test.ts` exited 0 with 6 files and 93 tests passing; `npm run typecheck -w tg-mini-app-uikit` exited 0.
- Visual note: no browser visual pass was run for this barrel-only slice because no JSX output, CSS, tokens, stories, runtime behavior, or component implementation moved; package-local Storybook evidence lives in `packages/uikit/storybook/atoms/controls.stories.tsx`.

### 2026-06-13 `packages/uikit/src/controls/chips.tsx` atom move

- Checked task: [x] Execute the fourth atom component-reorganization slice from `components-atoms.md` for `packages/uikit/src/controls/chips.tsx`.
- Status: needs reviewer.
- Scope: fourth atom component-reorg slice from [components-atoms.md](components-atoms.md), entry `packages/uikit/src/controls/chips.tsx`.
- Contract: implementation moved to `packages/uikit/src/atoms/controls/chips.tsx`; old deep path `packages/uikit/src/controls/chips.tsx` was removed; `packages/uikit/src/atoms/controls.tsx` exports chips from `./controls/chips`; root package exports stay stable through `packages/uikit/src/index.ts` `export * from "./atoms/controls"`.
- TDD RED: `npm run test -w tg-mini-app-uikit -- controls-reorg.test.tsx` exited 1 with the expected missing category import: `Failed to resolve import "../src/atoms/controls/chips"`.
- TDD GREEN and focused validation: `npm run test -w tg-mini-app-uikit -- controls-reorg.test.tsx` exited 0 with 1 file and 2 tests passing; `npm run test -w tg-mini-app-uikit -- controls-reorg.test.tsx m2-roving.test.tsx coverage-components.test.tsx a11y-semantics.test.tsx` exited 0 with 4 files and 44 tests passing; `npm run typecheck -w tg-mini-app-uikit` exited 0.
- Visual note: no browser visual pass was run for this move-only slice because JSX output, CSS, tokens, stories, and runtime behavior were preserved; package-local Storybook evidence lives in `packages/uikit/storybook/atoms/controls.stories.tsx`.

### 2026-06-13 `packages/uikit/src/controls/selection.tsx` atom split

- Checked task: [x] Execute the fifth atom component-reorganization slice from `components-atoms.md` for `packages/uikit/src/controls/selection.tsx`.
- Status: needs reviewer.
- Scope: fifth atom component-reorg slice from [components-atoms.md](components-atoms.md), entry `packages/uikit/src/controls/selection.tsx`.
- Contract: `TKCheckbox`, `TKRadioGroup`, and `TKSwitch` implementations split into `packages/uikit/src/atoms/controls/checkbox.tsx`, `packages/uikit/src/atoms/controls/radio-group.tsx`, and `packages/uikit/src/atoms/controls/switch.tsx`; `packages/uikit/src/atoms/controls/selection.tsx` is a sub-barrel for the split modules; old deep path `packages/uikit/src/controls/selection.tsx` was removed; `packages/uikit/src/atoms/controls.tsx` exports selection from `./controls/selection`; root package exports stay stable through `packages/uikit/src/index.ts` `export * from "./atoms/controls"`.
- TDD RED: `npm run test -w tg-mini-app-uikit -- controls-reorg.test.tsx` exited 1 with the expected missing split-module import: `Failed to resolve import "../src/atoms/controls/checkbox"`.
- TDD GREEN and focused validation: `npm run test -w tg-mini-app-uikit -- controls-reorg.test.tsx` exited 0 with 1 file and 3 tests passing; `npm run test -w tg-mini-app-uikit -- controls-reorg.test.tsx m2-roving.test.tsx m4-forms.test.tsx coverage-components.test.tsx a11y-semantics.test.tsx m7-patterns.test.tsx` exited 0 with 6 files and 99 tests passing; `npm run typecheck -w tg-mini-app-uikit` exited 0.
- Visual note: no browser visual pass was run for this split-only slice because JSX output, CSS, tokens, stories, and runtime behavior were preserved; package-local Storybook evidence lives in `packages/uikit/storybook/atoms/controls.stories.tsx`.

### 2026-06-13 `packages/uikit/src/controls/sliders.tsx` atom move

- Checked task: [x] Execute the sixth atom component-reorganization slice from `components-atoms.md` for `packages/uikit/src/controls/sliders.tsx`.
- Status: needs reviewer.
- Scope: sixth atom component-reorg slice from [components-atoms.md](components-atoms.md), entry `packages/uikit/src/controls/sliders.tsx`.
- Contract: `TKSlider` and `TKSliderProps` implementation moved to `packages/uikit/src/atoms/controls/sliders.tsx`; old deep path `packages/uikit/src/controls/sliders.tsx` was removed; `packages/uikit/src/atoms/controls.tsx` exports sliders from `./controls/sliders`; root package exports stay stable through `packages/uikit/src/index.ts` `export * from "./atoms/controls"`.
- TDD RED: `npm run test -w tg-mini-app-uikit -- controls-reorg.test.tsx` exited 1 with the expected missing atom-module import: `Failed to resolve import "../src/atoms/controls/sliders"`.
- TDD GREEN and focused validation: `npm run test -w tg-mini-app-uikit -- controls-reorg.test.tsx` exited 0 with 1 file and 4 tests passing; `npm run test -w tg-mini-app-uikit -- controls-reorg.test.tsx controls.test.tsx m4-forms.test.tsx coverage-components.test.tsx api-surface.test.ts m7-patterns.test.tsx` exited 0 with 6 files and 100 tests passing; `npm run typecheck -w tg-mini-app-uikit` exited 0.
- Visual note: no browser visual pass was run for this move-only slice because JSX output, CSS, tokens, stories, and runtime behavior were preserved; package-local Storybook evidence lives in `packages/uikit/storybook/atoms/controls.stories.tsx`.

### 2026-06-13 `packages/uikit/src/controls/stepper-rating.tsx` atom split

- Checked task: [x] Execute the seventh atom component-reorganization slice from `components-atoms.md` for `packages/uikit/src/controls/stepper-rating.tsx`.
- Status: needs reviewer.
- Scope: seventh atom component-reorg slice from [components-atoms.md](components-atoms.md), entry `packages/uikit/src/controls/stepper-rating.tsx`.
- Contract: `TKStepper`/`TKStepperProps` and `TKRating`/`TKRatingProps` split into `packages/uikit/src/atoms/controls/stepper.tsx` and `packages/uikit/src/atoms/controls/rating.tsx`; `packages/uikit/src/atoms/controls/stepper-rating.tsx` is a sub-barrel for both modules; old deep path `packages/uikit/src/controls/stepper-rating.tsx` was removed; `packages/uikit/src/atoms/controls.tsx` exports stepper-rating from `./controls/stepper-rating`; root package exports stay stable through `packages/uikit/src/index.ts` `export * from "./atoms/controls"`.
- TDD RED: `npm run test -w tg-mini-app-uikit -- controls-reorg.test.tsx` exited 1 with the expected missing split-module import: `Failed to resolve import "../src/atoms/controls/rating"`.
- TDD GREEN and focused validation: `npm run test -w tg-mini-app-uikit -- controls-reorg.test.tsx` exited 0 with 1 file and 5 tests passing; `npm run test -w tg-mini-app-uikit -- controls-reorg.test.tsx controls.test.tsx m4-forms.test.tsx coverage-components.test.tsx i18n.test.tsx` exited 0 with 5 files and 87 tests passing; `npm run typecheck -w tg-mini-app-uikit` exited 0.
- Visual note: no browser visual pass was run for this split-only slice because JSX output, CSS, tokens, stories, and runtime behavior were preserved; package-local Storybook evidence lives in `packages/uikit/storybook/atoms/controls.stories.tsx`.

### 2026-06-13 package-local Storybook and examples removal

- Checked task: [x] Remove `examples` and replace demo-owned evidence with package-local Storybook/test evidence.
- Contract: `examples` is removed; Storybook evidence lives under `packages/uikit/storybook/<category>`; current atom stories live in `packages/uikit/storybook/atoms`; Telegram test mock moved to `packages/uikit/test/support/telegram`.
- Artifacts added: `packages/uikit/storybook/atoms/controls.stories.tsx`, `packages/uikit/storybook/atoms/icons.stories.tsx`, `packages/uikit/storybook/atoms/service.stories.tsx`, and `e2e/atoms.storybook.spec.ts`.
- Validation: `npm run check:stories` exited 0 with 11/11 current atom exports represented; `npm run stories:build -w tg-mini-app-uikit` exited 0; `npm run test:e2e` exited 0 with 7 Storybook atom smoke tests passing.
- Package/docs validation: `npm run test:unit` exited 0 with 27 files and 529 tests passing; `npm run build -w tg-mini-app-uikit` exited 0; `npm run check:package` exited 0 after removing obsolete demo snippet and lighthouse checks.

### 2026-06-13 `packages/uikit/src/inputs.tsx` atom category and input module splits

- Checked tasks: [x] Execute the inputs atom component-reorganization slices from `components-atoms.md` for `packages/uikit/src/inputs.tsx`, `packages/uikit/src/inputs/base.tsx`, `packages/uikit/src/inputs/choices.tsx`, `packages/uikit/src/inputs/file-search.tsx`, and `packages/uikit/src/inputs/select-otp.tsx`.
- Contract: root package exports now route input atoms through `packages/uikit/src/index.ts` `export * from "./atoms/inputs"`; old `packages/uikit/src/inputs.tsx` and `packages/uikit/src/inputs/*` implementation files were removed; implementation lives under `packages/uikit/src/atoms/inputs.tsx` and `packages/uikit/src/atoms/inputs/*`.
- Module split: `base.tsx` split to `input.tsx`, `form-field.tsx`, `textarea.tsx`, `selectable.tsx`; `file-search.tsx` split to `file-input.tsx` and `search.tsx`; `select-otp.tsx` split to `select.tsx` and `otp.tsx`; `choices.tsx` moved into the atom inputs module set.
- TDD RED evidence: `npm run test -w tg-mini-app-uikit -- inputs-reorg.test.tsx` failed first on each missing atom path: `../src/atoms/inputs`, `../src/atoms/inputs/base`, `../src/atoms/inputs/choices`, `../src/atoms/inputs/file-input`, and `../src/atoms/inputs/select`.
- Unit/story/e2e artifacts: `packages/uikit/test/inputs-reorg.test.tsx`, `packages/uikit/storybook/atoms/inputs.stories.tsx`, and `e2e/atoms.storybook.spec.ts`.
- Validation: `npm run test -w tg-mini-app-uikit -- inputs-reorg.test.tsx coverage-components.test.tsx m4-forms.test.tsx otp.test.tsx a11y-semantics.test.tsx i18n.test.tsx m0-api.test.tsx api-surface.test.ts consumer-imports.test.tsx` exited 0 with 9 files and 248 tests passing; `npm run typecheck -w tg-mini-app-uikit` exited 0; `npm run check:stories` exited 0 with 21/21 atom exports represented; `npm run test:e2e` exited 0 with 11 Storybook atom smoke tests passing.

### 2026-06-13 `packages/uikit/src/buttons.tsx` atom category and button module split

- Checked task: [x] Execute the buttons atom component-reorganization slice from `components-atoms.md` for `packages/uikit/src/buttons.tsx`.
- Contract: root package exports now route action atoms through `packages/uikit/src/index.ts` `export * from "./atoms/buttons"`; old `packages/uikit/src/buttons.tsx` was removed; implementation lives under `packages/uikit/src/atoms/buttons.tsx` and `packages/uikit/src/atoms/buttons/*`.
- Module split: `TKButton` and `tkButtonVariantStyle` moved to `button.tsx`; `TKIconButton` moved to `icon-button.tsx`; `TKInlineButtons` moved to `inline-buttons.tsx`; `TKSpinner` moved to `spinner.tsx`; `TKMainButton` moved to `main-button.tsx`; shared button sizing/variant helpers live in `shared.ts`.
- TDD RED evidence: `npm run test -w tg-mini-app-uikit -- buttons-reorg.test.tsx` failed first on missing atom path `../src/atoms/buttons`.
- Unit/story/e2e artifacts: `packages/uikit/test/buttons-reorg.test.tsx`, `packages/uikit/storybook/atoms/buttons.stories.tsx`, and `e2e/atoms.storybook.spec.ts`.
- Validation: `npm run test -w tg-mini-app-uikit -- buttons-reorg.test.tsx main-button.test.tsx m0-api.test.tsx api-surface.test.ts consumer-imports.test.tsx m2-roving.test.tsx m5-display.test.tsx coverage-components.test.tsx` exited 0 with 8 files and 220 tests passing; `npm run typecheck -w tg-mini-app-uikit` exited 0; `npm run check:stories` exited 0 with 26/26 current atom exports represented; `npm run test:e2e` exited 0 with 15 Storybook atom smoke tests passing.

### 2026-06-13 `packages/uikit/src/display.tsx` atom category and display module split

- Checked task: [x] Execute the display atom component-reorganization slice from `components-atoms.md` for `packages/uikit/src/display.tsx`.
- Contract: root package exports now route display atoms through `packages/uikit/src/index.ts` `export * from "./atoms/display"`; old `packages/uikit/src/display.tsx` was removed; implementation lives under `packages/uikit/src/atoms/display.tsx` and `packages/uikit/src/atoms/display/*`.
- Module split: badges/status atoms moved to `badges.tsx`; avatar and avatar stack moved to `avatar.tsx`; image placeholder and real image moved to `image.tsx`; spoiler moved to `spoiler.tsx`; blockquote moved to `blockquote.tsx`.
- TDD RED evidence: `npm run test -w tg-mini-app-uikit -- display-reorg.test.tsx` failed first on missing atom path `../src/atoms/display`.
- Unit/story/e2e artifacts: `packages/uikit/test/display-reorg.test.tsx`, `packages/uikit/storybook/atoms/display.stories.tsx`, and `e2e/atoms.storybook.spec.ts`.
- Validation: `npm run test -w tg-mini-app-uikit -- display-reorg.test.tsx m5-display.test.tsx coverage-components.test.tsx coverage-infrastructure.test.tsx m0-api.test.tsx api-surface.test.ts consumer-imports.test.tsx m7-patterns.test.tsx` exited 0 with 8 files and 228 tests passing; `npm run typecheck -w tg-mini-app-uikit` exited 0; `npm run check:stories` exited 0 with 35/35 current atom exports represented; `npm run test:e2e` exited 0 with 19 Storybook atom smoke tests passing.

### 2026-06-13 foundation category move

- Checked tasks: [x] Execute the foundation component-reorganization slices from `components-foundation.md` for `packages/uikit/src/theme.tsx`, `packages/uikit/src/i18n.tsx`, `packages/uikit/src/options.ts`, `packages/uikit/src/telegram.tsx`, and `packages/uikit/src/telegram/*`.
- Contract: root package exports now route foundation surfaces through `packages/uikit/src/index.ts` `export * from "./foundation/theme"`, `export * from "./foundation/i18n"`, `export * from "./foundation/telegram"`, and `export * from "./foundation/options"`; old `packages/uikit/src/theme.tsx`, `packages/uikit/src/i18n.tsx`, `packages/uikit/src/options.ts`, `packages/uikit/src/telegram.tsx`, and `packages/uikit/src/telegram/*` were removed; no package subpath exports were added.
- Module move: `TKProvider`/theme knobs moved to `packages/uikit/src/foundation/theme.tsx`; locale provider and dictionaries moved to `packages/uikit/src/foundation/i18n.tsx`; shared option model moved to `packages/uikit/src/foundation/options.ts`; Telegram runtime barrel and hooks/types moved to `packages/uikit/src/foundation/telegram.tsx` and `packages/uikit/src/foundation/telegram/*`.
- TDD RED evidence: `npm run test -w tg-mini-app-uikit -- foundation-reorg.test.tsx` failed first on missing foundation path `../src/foundation/theme`.
- Unit/story/e2e artifacts: `packages/uikit/test/foundation-reorg.test.tsx`, `packages/uikit/storybook/foundation/theme.stories.tsx`, `packages/uikit/storybook/foundation/i18n.stories.tsx`, `packages/uikit/storybook/foundation/options.stories.tsx`, `packages/uikit/storybook/foundation/telegram.stories.tsx`, and `e2e/foundation.storybook.spec.ts`.
- Validation: `npm run test -w tg-mini-app-uikit -- foundation-reorg.test.tsx` exited 0 with 1 file and 3 tests passing; `npm run test -w tg-mini-app-uikit -- foundation-reorg.test.tsx api-surface.test.ts consumer-imports.test.tsx coverage-infrastructure.test.tsx telegram-runtime-policy.test.tsx telegram-buttons-events.test.tsx telegram-capabilities.test.tsx telegram-storage-initdata.test.tsx` exited 0 with 8 files and 83 tests passing; `npm run typecheck -w tg-mini-app-uikit` exited 0; `npm run check:stories` exited 0 with 38/38 current atom/foundation exports represented; `npm run stories:build -w tg-mini-app-uikit` exited 0; `npm run test:e2e` exited 0 with 23 Storybook smoke tests passing.
- Broad validation after this slice: `npm run test:unit` exited 0 with 31 files and 545 tests passing; `npm run build -w tg-mini-app-uikit` exited 0; sequential `npm run check:package` exited 0.

### 2026-06-13 token category move

- Checked tasks: [x] Execute the token component-reorganization slices from `components-tokens.md` for `packages/uikit/src/styles/tokens.css` and `packages/uikit/src/typography.tsx`.
- Contract: root package entrypoint now imports CSS from `packages/uikit/src/tokens/tokens.css` and exports typography from `packages/uikit/src/tokens/typography.tsx`; old `packages/uikit/src/styles/tokens.css`, `packages/uikit/src/styles/`, and `packages/uikit/src/typography.tsx` were removed; public package CSS remains `tg-mini-app-uikit/style.css`.
- TDD RED evidence: `npm run test -w tg-mini-app-uikit -- tokens-reorg.test.tsx` failed first on missing token path `../src/tokens/typography`.
- Unit/story/e2e artifacts: `packages/uikit/test/tokens-reorg.test.tsx`, `packages/uikit/storybook/tokens/typography.stories.tsx`, `packages/uikit/storybook/tokens/tokens.stories.tsx`, and `e2e/tokens.storybook.spec.ts`.
- Validation: `npm run test -w tg-mini-app-uikit -- tokens-reorg.test.tsx tokens-contract.test.ts m0-api.test.tsx api-surface.test.ts coverage-components.test.tsx a11y-semantics.test.tsx` exited 0 with 6 files and 204 tests passing; `npm run test -w tg-mini-app-uikit -- consumer-imports.test.tsx tokens-reorg.test.tsx tokens-contract.test.ts m0-api.test.tsx` exited 0 with 4 files and 167 tests passing after the `tg-mini-app-uikit/style.css` test alias was updated to `src/tokens/tokens.css`; `npm run typecheck -w tg-mini-app-uikit` exited 0; `npm run check:stories` exited 0 with 48/48 current atom/foundation/token exports represented; `npm run stories:build -w tg-mini-app-uikit` exited 0; `npm run test:e2e` exited 0 with 25 Storybook smoke tests passing.
- Broad validation after this slice: fresh `npm run build -w tg-mini-app-uikit` exited 0 and `packages/uikit/dist/index.d.ts` no longer contains a dangling CSS import; `npm run test:unit` exited 0 with 32 files and 548 tests passing; sequential `npm run check:package` exited 0.

### 2026-06-13 overlay composites category move

- Checked tasks: [x] Execute the overlay composite reorganization slices from `components-composites.md` for `packages/uikit/src/overlays.tsx` and `packages/uikit/src/overlays/*`.
- Contract: root package exports now route overlays through `packages/uikit/src/index.ts` `export * from "./composites/overlays"`; old `packages/uikit/src/overlays.tsx` and `packages/uikit/src/overlays/*` were removed; implementation lives under `packages/uikit/src/composites/overlays.tsx` and `packages/uikit/src/composites/overlays/*`.
- TDD RED evidence: `npm run test -w tg-mini-app-uikit -- overlays-reorg.test.tsx` failed first on missing composite path `../src/composites/overlays`.
- Unit/story/e2e artifacts: `packages/uikit/test/overlays-reorg.test.tsx`, `packages/uikit/storybook/composites/overlays.stories.tsx`, and `e2e/composites.storybook.spec.ts`.
- Validation: `npm run test -w tg-mini-app-uikit -- overlays-reorg.test.tsx toasts.test.tsx m0-api.test.tsx m2-roving.test.tsx m3-gestures.test.tsx m6-nav.test.tsx coverage-components.test.tsx coverage-infrastructure.test.tsx a11y-semantics.test.tsx i18n.test.tsx consumer-imports.test.tsx api-surface.test.ts` exited 0 with 12 files and 250 tests passing; `npm run typecheck -w tg-mini-app-uikit` exited 0; `npm run check:stories` exited 0 with 56/56 current atom/foundation/token/composite exports represented; `npm run stories:build -w tg-mini-app-uikit` exited 0; `npm run test:e2e` exited 0 with 30 Storybook smoke tests passing.

### 2026-06-13 form composites category move

- Checked tasks: [x] Execute the form composite reorganization slices from `components-composites.md` for `packages/uikit/src/forms.tsx` and `packages/uikit/src/forms/*`.
- Contract: root package exports now route forms through `packages/uikit/src/index.ts` `export * from "./composites/forms"`; old `packages/uikit/src/forms.tsx` and `packages/uikit/src/forms/*` were removed; implementation lives under `packages/uikit/src/composites/forms.tsx` and `packages/uikit/src/composites/forms/*`.
- TDD RED evidence: `npm run test -w tg-mini-app-uikit -- forms-reorg.test.tsx` failed first on missing composite path `../src/composites/forms`.
- Unit/story/e2e artifacts: `packages/uikit/test/forms-reorg.test.tsx`, `packages/uikit/storybook/composites/forms.stories.tsx`, and `e2e/composites.storybook.spec.ts`.
- Validation: `npm run test -w tg-mini-app-uikit -- forms-reorg.test.tsx m4-forms.test.tsx otp.test.tsx coverage-components.test.tsx coverage-infrastructure.test.tsx a11y-semantics.test.tsx m7-patterns.test.tsx api-surface.test.ts consumer-imports.test.tsx` exited 0 with 9 files and 115 tests passing; `npm run check:stories` exited 0 with 63/63 current atom/foundation/token/composite exports represented; `npm run stories:build -w tg-mini-app-uikit` exited 0; `npm run test:e2e` exited 0 with 33 Storybook smoke tests passing.

### 2026-06-13 card composites category move

- Checked tasks: [x] Execute the card composite reorganization slices from `components-composites.md` for `packages/uikit/src/cards.tsx` and `packages/uikit/src/cards/*`.
- Contract: root package exports now route cards through `packages/uikit/src/index.ts` `export * from "./composites/cards"`; old `packages/uikit/src/cards.tsx` and `packages/uikit/src/cards/*` were removed; implementation lives under `packages/uikit/src/composites/cards.tsx` and `packages/uikit/src/composites/cards/*`.
- TDD RED evidence: `npm run test -w tg-mini-app-uikit -- cards-reorg.test.tsx` failed first on missing composite path `../src/composites/cards`.
- Unit/story/e2e artifacts: `packages/uikit/test/cards-reorg.test.tsx`, `packages/uikit/storybook/composites/cards.stories.tsx`, and `e2e/composites.storybook.spec.ts`.
- Validation: `npm run test -w tg-mini-app-uikit -- cards-reorg.test.tsx coverage-components.test.tsx m0-api.test.tsx api-surface.test.ts consumer-imports.test.tsx m5-display.test.tsx` exited 0 with 6 files and 206 tests passing; `npm run check:stories` exited 0 with 71/71 current atom/foundation/token/composite exports represented; `npm run stories:build -w tg-mini-app-uikit` exited 0; `npm run test:e2e` exited 0 with 36 Storybook smoke tests passing.

### 2026-06-13 feedback composites category split

- Checked task: [x] Execute the feedback composite reorganization slice from `components-composites.md` for `packages/uikit/src/feedback.tsx`.
- Contract: root package exports now route feedback through `packages/uikit/src/index.ts` `export * from "./composites/feedback"`; old `packages/uikit/src/feedback.tsx` was removed; implementation split into `packages/uikit/src/composites/feedback.tsx` plus `packages/uikit/src/composites/feedback/skeletons.tsx`, `progress.tsx`, `bars.tsx`, `empty-state.tsx`, and `timeline.tsx`.
- TDD RED evidence: `npm run test -w tg-mini-app-uikit -- feedback-reorg.test.tsx` failed first on missing composite path `../src/composites/feedback`.
- Unit/story/e2e artifacts: `packages/uikit/test/feedback-reorg.test.tsx`, `packages/uikit/storybook/composites/feedback.stories.tsx`, and `e2e/composites.storybook.spec.ts`.
- Validation: `npm run test -w tg-mini-app-uikit -- feedback-reorg.test.tsx coverage-components.test.tsx m5-display.test.tsx a11y-semantics.test.tsx m0-api.test.tsx api-surface.test.ts consumer-imports.test.tsx` exited 0 with 7 files and 213 tests passing; `npm run check:stories` exited 0 with 80/80 current atom/foundation/token/composite exports represented; `npm run stories:build -w tg-mini-app-uikit` exited 0; after fixing a hidden skeleton test marker, `npm run test:e2e` exited 0 with 39 Storybook smoke tests passing.

### 2026-06-13 gesture composites category split

- Checked task: [x] Execute the gesture composite reorganization slice from `components-composites.md` for `packages/uikit/src/gestures.tsx`.
- Contract: root package exports now route gestures through `packages/uikit/src/index.ts` `export * from "./composites/gestures"`; old `packages/uikit/src/gestures.tsx` was removed; implementation split into `packages/uikit/src/composites/gestures.tsx` plus `packages/uikit/src/composites/gestures/long-press.tsx`, `pull-to-refresh.tsx`, and `swipe-cell.tsx`.
- TDD RED evidence: `npm run test -w tg-mini-app-uikit -- gestures-reorg.test.tsx` failed first on missing composite path `../src/composites/gestures`.
- Unit/story/e2e artifacts: `packages/uikit/test/gestures-reorg.test.tsx`, `packages/uikit/storybook/composites/gestures.stories.tsx`, and `e2e/composites.storybook.spec.ts`.
- Validation: `npm run test -w tg-mini-app-uikit -- gestures-reorg.test.tsx m3-gestures.test.tsx coverage-components.test.tsx coverage-infrastructure.test.tsx m0-api.test.tsx api-surface.test.ts consumer-imports.test.tsx` exited 0 with 7 files and 215 tests passing; `npm run check:stories` exited 0 with 83/83 current atom/foundation/token/composite exports represented; `npm run stories:build -w tg-mini-app-uikit` exited 0; `npm run test:e2e` exited 0 with 42 Storybook smoke tests passing.

### 2026-06-13 layout composites category split

- Checked task: [x] Execute the layout composite reorganization slice from `components-composites.md` for `packages/uikit/src/layout.tsx`.
- Contract: root package exports now route layout through `packages/uikit/src/index.ts` `export * from "./composites/layout"`; old `packages/uikit/src/layout.tsx` was removed; implementation split into `packages/uikit/src/composites/layout.tsx` plus `packages/uikit/src/composites/layout/safe-area.tsx`, `page.tsx`, and `bottom-bar.tsx`.
- TDD RED evidence: `npm run test -w tg-mini-app-uikit -- layout-reorg.test.tsx` failed first on missing composite path `../src/composites/layout`.
- Unit/story/e2e artifacts: `packages/uikit/test/layout-reorg.test.tsx`, `packages/uikit/storybook/composites/layout.stories.tsx`, and `e2e/composites.storybook.spec.ts`.
- Validation: `npm run test -w tg-mini-app-uikit -- layout-reorg.test.tsx coverage-components.test.tsx m6-nav.test.tsx m5-display.test.tsx api-surface.test.ts consumer-imports.test.tsx` initially caught accidental helper exports in the API snapshot; after restricting the category barrel to public exports, the same command exited 0 with 6 files and 65 tests passing. `npm run check:stories` exited 0 with 86/86 current atom/foundation/token/composite exports represented; `npm run stories:build -w tg-mini-app-uikit` exited 0; `npm run test:e2e` exited 0 with 44 Storybook smoke tests passing.

### 2026-06-13 list composites category split

- Checked task: [x] Execute the list composite reorganization slice from `components-composites.md` for `packages/uikit/src/lists.tsx`.
- Contract: root package exports now route lists through `packages/uikit/src/index.ts` `export * from "./composites/lists"`; old `packages/uikit/src/lists.tsx` was removed; implementation split into `packages/uikit/src/composites/lists.tsx` plus `packages/uikit/src/composites/lists/list-group.tsx`, `cell.tsx`, `accordion.tsx`, `infinite-list.tsx`, and `virtual-list.tsx`.
- TDD RED evidence: `npm run test -w tg-mini-app-uikit -- lists-reorg.test.tsx` failed first on missing composite path `../src/composites/lists`.
- Unit/story/e2e artifacts: `packages/uikit/test/lists-reorg.test.tsx`, `packages/uikit/storybook/composites/lists.stories.tsx`, and `e2e/composites.storybook.spec.ts`.
- Validation: `npm run test -w tg-mini-app-uikit -- lists-reorg.test.tsx m5-display.test.tsx coverage-components.test.tsx coverage-infrastructure.test.tsx m0-api.test.tsx api-surface.test.ts consumer-imports.test.tsx` exited 0 with 7 files and 215 tests passing; `npm run check:stories` exited 0 with 91/91 current atom/foundation/token/composite exports represented; `npm run stories:build -w tg-mini-app-uikit` exited 0; `npm run test:e2e` exited 0 with 47 Storybook smoke tests passing.

### 2026-06-13 navigation composites category split

- Checked task: [x] Execute the navigation composite reorganization slice from `components-composites.md` for `packages/uikit/src/navigation.tsx`.
- Contract: root package exports now route navigation through `packages/uikit/src/index.ts` `export * from "./composites/navigation"`; old `packages/uikit/src/navigation.tsx` was removed; implementation split into `packages/uikit/src/composites/navigation.tsx` plus `packages/uikit/src/composites/navigation/header.tsx`, `tabbar.tsx`, `segmented.tsx`, `category-tabs.tsx`, `steps.tsx`, and `page-dots.tsx`.
- TDD RED evidence: unavailable in the preserved continuation log; do not treat this entry as fail-first proof. Current contract evidence is the reorg unit test plus the validation commands below.
- Unit/story/e2e artifacts: `packages/uikit/test/navigation-reorg.test.tsx`, `packages/uikit/storybook/composites/navigation.stories.tsx`, and `e2e/composites.storybook.spec.ts`.
- Validation: `npm run test -w tg-mini-app-uikit -- navigation-reorg.test.tsx m2-roving.test.tsx m6-nav.test.tsx coverage-components.test.tsx m7-patterns.test.tsx a11y-semantics.test.tsx m0-api.test.tsx api-surface.test.ts consumer-imports.test.tsx` exited 0 with 9 files and 224 tests passing; `npm run check:stories` exited 0 with 97/97 current atom/foundation/token/composite exports represented; `npm run stories:build -w tg-mini-app-uikit` exited 0; `npm run test:e2e` exited 0 with 50 Storybook smoke tests passing.

### 2026-06-13 nav stack composite category move

- Checked task: [x] Execute the nav stack composite move from `components-composites.md` for `packages/uikit/src/nav.tsx`.
- Contract: root package exports now route nav stack primitives through `packages/uikit/src/index.ts` `export * from "./composites/nav"`; old `packages/uikit/src/nav.tsx` was removed; implementation lives in `packages/uikit/src/composites/nav.tsx`.
- TDD RED evidence: unavailable in the preserved continuation log; do not treat this entry as fail-first proof. Current contract evidence is the reorg unit test plus the validation commands below.
- Unit/story/e2e artifacts: `packages/uikit/test/nav-reorg.test.tsx`, `packages/uikit/storybook/composites/nav.stories.tsx`, and `e2e/composites.storybook.spec.ts`.
- Validation: `npm run test -w tg-mini-app-uikit -- nav-reorg.test.tsx m6-nav.test.tsx coverage-infrastructure.test.tsx m0-api.test.ts api-surface.test.ts consumer-imports.test.tsx` exited 0 with 6 files and 176 tests passing; `npm run check:stories` exited 0 with 100/100 current atom/foundation/token/composite exports represented; `npm run stories:build -w tg-mini-app-uikit` exited 0; `npm run test:e2e` exited 0 with 51 Storybook smoke tests passing.

### 2026-06-13 carousel composite category move

- Checked task: [x] Execute the carousel composite move from `components-composites.md` for `packages/uikit/src/carousel.tsx`.
- Contract: root package exports now route gallery through `packages/uikit/src/index.ts` `export * from "./composites/carousel"`; old `packages/uikit/src/carousel.tsx` was removed; implementation lives in `packages/uikit/src/composites/carousel.tsx`.
- TDD RED evidence: unavailable in the preserved continuation log; do not treat this entry as fail-first proof. Current contract evidence is the reorg unit test plus the validation commands below.
- Unit/story/e2e artifacts: `packages/uikit/test/carousel-reorg.test.tsx`, `packages/uikit/storybook/composites/carousel.stories.tsx`, and `e2e/composites.storybook.spec.ts`.
- Validation: `npm run test -w tg-mini-app-uikit -- carousel-reorg.test.tsx coverage-components.test.tsx m5-display.test.tsx m0-api.test.ts api-surface.test.ts consumer-imports.test.tsx` exited 0 with 6 files and 205 tests passing; `npm run check:stories` exited 0 with 101/101 current atom/foundation/token/composite exports represented; `npm run stories:build -w tg-mini-app-uikit` exited 0; `npx playwright test e2e/composites.storybook.spec.ts --grep composites-carousel --output=/tmp/tg-uikit-carousel-playwright-results-$$` exited 0 with 1 Storybook smoke test passing.

### 2026-06-13 chat composites category split

- Checked task: [x] Execute the chat composite split from `components-composites.md` for `packages/uikit/src/chat.tsx`.
- Contract: root package exports now route chat through `packages/uikit/src/index.ts` `export * from "./composites/chat"`; old `packages/uikit/src/chat.tsx` was removed; implementation split into `packages/uikit/src/composites/chat.tsx` plus `packages/uikit/src/composites/chat/message-bubble.tsx`, `messages.tsx`, and `write-bar.tsx`.
- TDD RED evidence: unavailable in the preserved continuation log; do not treat this entry as fail-first proof. Current contract evidence is the reorg unit test plus the validation commands below.
- Unit/story/e2e artifacts: `packages/uikit/test/chat-reorg.test.tsx`, `packages/uikit/storybook/composites/chat.stories.tsx`, and `e2e/composites.storybook.spec.ts`.
- Validation: `npm run test -w tg-mini-app-uikit -- chat-reorg.test.tsx m7-patterns.test.tsx coverage-components.test.tsx m0-api.test.ts api-surface.test.ts consumer-imports.test.tsx` exited 0 with 6 files and 201 tests passing; `npm run check:stories` exited 0 with 104/104 current atom/foundation/token/composite exports represented; `npm run stories:build -w tg-mini-app-uikit` exited 0; `npx playwright test e2e/composites.storybook.spec.ts --grep composites-chat --output=/tmp/tg-uikit-chat-playwright-results-2-$$` exited 0 with 2 Storybook smoke tests passing.

### 2026-06-13 templates category split

- Checked task: [x] Execute the template category split from `components-templates.md` for `packages/uikit/src/patterns.tsx`, `packages/uikit/src/patterns/*`, `packages/uikit/src/onboarding.tsx`, and `packages/uikit/src/confetti.tsx`.
- Contract: root package exports now route templates through `packages/uikit/src/index.ts` `export * from "./templates/patterns"`, `export * from "./templates/onboarding"`, and `export * from "./templates/confetti"`; old root template source paths were removed; implementations live under `packages/uikit/src/templates`.
- TDD RED evidence: unavailable in the preserved continuation log; do not treat this entry as fail-first proof. Current contract evidence is the reorg unit test plus the validation commands below.
- Unit/story/e2e artifacts: `packages/uikit/test/templates-reorg.test.tsx`, `packages/uikit/storybook/templates/*.stories.tsx`, and `e2e/templates.storybook.spec.ts`.
- Validation: `npm run test -w tg-mini-app-uikit -- templates-reorg.test.tsx m7-patterns.test.tsx coverage-components.test.tsx m0-api.test.ts api-surface.test.ts consumer-imports.test.tsx` exited 0 with 6 files and 201 tests passing; `npm run check:stories` exited 0 with 112/112 current atom/foundation/token/composite/template exports represented; `npm run stories:build -w tg-mini-app-uikit` exited 0; `npx playwright test e2e/templates.storybook.spec.ts --output=/tmp/tg-uikit-templates-playwright-results-$$` exited 0 with 5 Storybook smoke tests passing.

## Per-Component Workflow

For each source entry in a component file:

1. Classify the element.
   Confirm whether the file is a token, atom, composite, template, foundation runtime surface, or cleanup candidate. If the current document category is wrong, update the entry and cross-link the correct document before editing source.

2. Inspect analogs and evidence.
   Read related tests, package-local stories, docs, API snapshots, and closest source analogs listed in the entry. Add missing evidence links before changing implementation.

3. Define the contract.
   Record public/internal status, target category path, exported names, props/types, default behavior, controlled/uncontrolled authority, state transitions, SSR behavior, non-Telegram fallback, Telegram trust boundaries, and breaking-change impact.

4. Write the failing test first.
   Add the narrowest useful test before production changes. Run it and record the expected failure in the entry's TDD checklist.

5. Implement the smallest passing change.
   Move, split, generalize, or delete only the planned surface. Keep behavior covered by the failing test. Do not mix unrelated cleanup.

6. Run focused validation.
   Run the narrow unit/contract/SSR/story/API checks listed in the entry. Update the entry with actual commands and outcomes.

7. Run visual validation for public/visual surfaces.
   Use `impeccable` with `product.md` and `design.md` loaded. Cover light, dark, Telegram theme, narrow/mobile, RTL/locale when relevant, reduced motion, no-overlap, and stable-layout checks.

8. Update docs and stories.
   If the source remains public, ensure Storybook and docs represent the final API. If the source moves to demo-only, ensure equivalent demo/story evidence remains before removing public exports.

9. Request reviewer-subagent review.
   The reviewer-subagent answers each reviewer-only yes/no question with evidence. The implementation author must leave these boxes open.

10. Commit or hand off only after evidence is recorded.
    The component entry must include test evidence, visual evidence where applicable, reviewer answers, known risks, and remaining follow-up before the implementation is considered ready.

## Required Checks By Category

Tokens:

- Verify semantic token names, light/dark mappings, Telegram theme mappings, contrast, reduced motion, and no accidental `--tk-separator` drift away from canonical `--tk-sep`.
- Use `packages/uikit/test/tokens-contract.test.ts` and token visual specs as the first evidence surface.

Atoms:

- Verify accessible names, keyboard use, focus visibility, disabled/loading/error/readonly states, stable sizing, and token-based styles.
- Use interaction tests before visual checks.

Composites:

- Verify focus management, cleanup of listeners/timers/observers, async race behavior, portals, z-index, safe-area behavior, and mobile/narrow layout.
- Use SSR and a11y tests when browser globals, overlays, or Telegram runtime are involved.

Templates:

- Verify the pattern is reusable and not a hidden app flow.
- Keep app data, network assumptions, and demo-only state out of package source.

Cleanup:

- Prove the candidate is app-specific or demo-specific before removal.
- Preserve or replace tests, package-local stories, docs, and visual evidence before public exports are deleted.

## Reviewer-Only Questions

Every component entry keeps these questions open until a reviewer-subagent answers them:

- Code: does the implementation match the planned API and category boundary?
- Visual: does the visual result pass `impeccable` review and local visual evidence?
- Performance: does it avoid avoidable re-renders, layout work, timers, and bundle growth?
- Logic: are state transitions, async behavior, cleanup, and fallbacks correct?
- Category fit: does the file belong in this category after reorganization?
- Src purity: is `src` free from app-specific or demo-only behavior for this element?
- Test adequacy: did tests fail first and then cover the accepted behavior?

Reviewer answers must be `Да` or `Нет` with evidence. Author answers are invalid.

## Validation Loop

Run these after every component-plan update:

```bash
find plans -type f | sort
rg -n "Reviewer-only" plans
git diff --stat -- plans
git status --short
```

Run these before claiming implementation readiness for any source-changing slice:

```bash
npm run typecheck
npm run test:unit
npm run check:stories
npm run build -w tg-mini-app-uikit
npm run stories:build -w tg-mini-app-uikit
npm run check:package
```

Run e2e or visual suites only when the touched slice affects browser behavior, public visuals, Telegram runtime, layout, motion, accessibility, or demo/story evidence.

## Current Known Constraints

- The repo may have unrelated dirty changes. Do not revert or stage unrelated files.
- Storybook evidence lives in `packages/uikit/storybook/<category>`.
- `examples` has been removed; do not add new evidence there.
- Existing component source files were below 2000 lines during the initial inventory; keep checking this before and after future source edits.
