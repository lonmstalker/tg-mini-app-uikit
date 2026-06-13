# Tokens Inventory

## Scope

Token files define design primitives and semantic presentation contracts: colors, typography, spacing, radius, shadow,
motion, z-index, breakpoints, density, and semantic states. Future source work should keep shared primitives here and
avoid raw values in components when an existing token fits.

## Shared Evidence

- Unit tests: `packages/uikit/test/tokens-contract.test.ts`, `packages/uikit/test/api-surface.test.ts`,
  `packages/uikit/test/coverage-infrastructure.test.tsx`
- Stories: `examples/demo/stories/tokens/actions.stories.tsx`,
  `examples/demo/stories/tokens/feedback-indicators.stories.tsx`,
  `examples/demo/stories/tokens/typography-accessibility.stories.tsx`
- Docs: `docs/site/pages/theming.md`, `docs/site/pages/components.md`
- Visual/e2e evidence: `e2e/tokens.spec.ts`, `e2e/contrast-modes.spec.ts`, `e2e/density.spec.ts`,
  `e2e/reduced-motion.spec.ts`

## Entries

### `packages/uikit/src/styles/tokens.css`

- Source: `packages/uikit/src/styles/tokens.css`
- Category: token
- Related tests: `packages/uikit/test/tokens-contract.test.ts`
- Related stories: `examples/demo/stories/tokens/actions.stories.tsx`,
  `examples/demo/stories/tokens/feedback-indicators.stories.tsx`,
  `examples/demo/stories/tokens/typography-accessibility.stories.tsx`
- Related docs: `docs/site/pages/theming.md`
- Current status: move
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state
  machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression
  command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced
  motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ]
  Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/typography.tsx`

- Source: `packages/uikit/src/typography.tsx`
- Category: token
- Related tests: `packages/uikit/test/coverage-components.test.tsx`, `packages/uikit/test/a11y-semantics.test.tsx`
- Related stories: `examples/demo/stories/tokens/typography-accessibility.stories.tsx`
- Related docs: `docs/site/pages/theming.md`, `docs/site/pages/components.md`
- Current status: move
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state
  machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression
  command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced
  motion [ ] no overlap [ ] stable layout
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
