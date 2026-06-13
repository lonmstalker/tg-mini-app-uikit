# Tokens Inventory

## Scope

Token files define design primitives and semantic presentation contracts: colors, typography, spacing, radius, shadow,
motion, z-index, breakpoints, density, and semantic states. Future source work should keep shared primitives here and
avoid raw values in components when an existing token fits.

## Shared Evidence

- Unit tests: `packages/uikit/test/tokens-reorg.test.tsx`, `packages/uikit/test/tokens-contract.test.ts`, `packages/uikit/test/api-surface.test.ts`,
  `packages/uikit/test/coverage-infrastructure.test.tsx`
- Stories: `packages/uikit/storybook/tokens/tokens.stories.tsx`, `packages/uikit/storybook/tokens/typography.stories.tsx`
- Docs: `docs/site/pages/theming.md`, `docs/site/pages/components.md`
- Visual/e2e evidence: `e2e/tokens.storybook.spec.ts`, `e2e/tokens.spec.ts`, `e2e/contrast-modes.spec.ts`, `e2e/density.spec.ts`,
  `e2e/reduced-motion.spec.ts`

## Entries

### `packages/uikit/src/tokens/tokens.css`

- Source: `packages/uikit/src/tokens/tokens.css`
- Category: token
- Related tests: `packages/uikit/test/tokens-reorg.test.tsx`, `packages/uikit/test/tokens-contract.test.ts`, `packages/uikit/test/m0-api.test.tsx`
- Related stories: `packages/uikit/storybook/tokens/tokens.stories.tsx`
- Related docs: `docs/site/pages/theming.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens [x] accessibility (semantic swatches preserve readable labels) [x] Telegram runtime (Telegram theme variables preserved) [x] state machine (not applicable) [x] testing [x] docs/stories [x] packaging [x] performance
- TDD checklist: failing test name: `keeps the design token stylesheet in the token category only`; RED command: `npm run test -w tg-mini-app-uikit -- tokens-reorg.test.tsx`; expected failure: exit 1, `Failed to resolve import "../src/tokens/typography"` before the token category existed; GREEN command: `npm run test -w tg-mini-app-uikit -- tokens-reorg.test.tsx tokens-contract.test.ts m0-api.test.tsx api-surface.test.ts coverage-components.test.tsx a11y-semantics.test.tsx` exit 0, 6 files and 204 tests passed; regression command: `npm run test -w tg-mini-app-uikit -- consumer-imports.test.tsx tokens-reorg.test.tsx tokens-contract.test.ts m0-api.test.tsx` exit 0, 4 files and 167 tests passed; `npm run typecheck -w tg-mini-app-uikit` exit 0; `npm run check:stories` exit 0 with 48/48 current atom/foundation/token exports represented; `npm run test:e2e` exit 0 with 25 Storybook smoke tests passing
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: `tokens-semantic-tokens--semantic-swatches` Storybook e2e smoke added; reviewer visual pass remains open
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ]
  Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/tokens/typography.tsx`

- Source: `packages/uikit/src/tokens/typography.tsx`
- Category: token
- Related tests: `packages/uikit/test/tokens-reorg.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`, `packages/uikit/test/a11y-semantics.test.tsx`, `packages/uikit/test/api-surface.test.ts`
- Related stories: `packages/uikit/storybook/tokens/typography.stories.tsx`
- Related docs: `docs/site/pages/theming.md`, `docs/site/pages/components.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (typography variables preserved) [x] accessibility (semantic heading/text rendering covered) [x] Telegram runtime (not applicable) [x] state machine (not applicable) [x] testing [x] docs/stories [x] packaging [x] performance
- TDD checklist: failing test name: `publishes typography components from the token category and root package`; RED command: `npm run test -w tg-mini-app-uikit -- tokens-reorg.test.tsx`; expected failure: exit 1, `Failed to resolve import "../src/tokens/typography"`; GREEN command: `npm run test -w tg-mini-app-uikit -- tokens-reorg.test.tsx tokens-contract.test.ts m0-api.test.tsx api-surface.test.ts coverage-components.test.tsx a11y-semantics.test.tsx` exit 0, 6 files and 204 tests passed; regression command: `npm run test -w tg-mini-app-uikit -- consumer-imports.test.tsx tokens-reorg.test.tsx tokens-contract.test.ts m0-api.test.tsx` exit 0, 4 files and 167 tests passed; `npm run typecheck -w tg-mini-app-uikit` exit 0; `npm run check:stories` exit 0 with 48/48 current atom/foundation/token exports represented; `npm run test:e2e` exit 0 with 25 Storybook smoke tests passing
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: `tokens-typography--type-scale` Storybook e2e smoke added; reviewer visual pass remains open
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ]
  Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

## Token Reorganization Targets

- Colors: base surfaces, text hierarchy, accent, red, green, orange, gray, Telegram theme mappings, contrast-safe ink
  tokens.
- Typography: title, text, caption, visually hidden, line-height and weight contracts.
- Spacing: `--tk-sp-*`, local geometry exceptions, safe-area insets.
- Radius: `--tk-r-*`, roundness knob mapping, component-local radii.
- Shadow: shared elevation and overlay shadow tokens.
- Motion: duration, easing, reduced-motion behavior, transform/opacity-only motion.
- Z-index: base, sticky, header, overlay, sheet, dialog, popper, toast.
- Breakpoints: current responsive behavior should be inventoried before adding shared breakpoint tokens.
- Semantic states: hover, focus, active, selected, disabled, loading, error, warning, success, info, unsupported.
