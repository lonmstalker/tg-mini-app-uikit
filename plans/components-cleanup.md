# Cleanup Candidates Inventory

## Scope

This document lists files and surfaces that may be too domain-specific for `packages/uikit/src` or too tied to demo behavior. It does not authorize deletion by itself. Every cleanup candidate requires TDD-backed public API decisions, story/docs replacement, visual evidence, and reviewer-subagent approval.

## Global Cleanup Rules

- Do not add cleanup evidence under `examples`; that directory has been removed.
- Do not delete package-local Storybook evidence until equivalent stories or visual tests exist elsewhere.
- Do not remove API exports without updating `packages/uikit/test/api-surface.test.ts`, the API snapshot, docs, recipes, and migration notes.
- If a source file is moved to demo-only, first prove no reusable UIKit consumer contract depends on it.

## Source Candidates

### `packages/uikit/src/patterns/gamification.tsx`

- Source: `packages/uikit/src/templates/patterns/gamification.tsx`
- Category: template
- Related tests: `packages/uikit/test/m7-patterns.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`
- Related stories: `packages/uikit/storybook/templates/gamification.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: resolved as reusable template
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Artifact checklist: [ ] unit test [ ] Storybook [ ] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/composites/cards/product.tsx`

- Source: `packages/uikit/src/composites/cards/product.tsx`
- Category: composite
- Related tests: `packages/uikit/test/coverage-components.test.tsx`
- Related stories: `packages/uikit/storybook/composites/cards.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: resolved as composite
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Artifact checklist: [ ] unit test [ ] Storybook [ ] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/composites/cards/promotional.tsx`

- Source: `packages/uikit/src/composites/cards/promotional.tsx`
- Category: composite
- Related tests: `packages/uikit/test/coverage-components.test.tsx`
- Related stories: `packages/uikit/storybook/composites/cards.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: resolved as composite
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Artifact checklist: [ ] unit test [ ] Storybook [ ] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/chat.tsx`

- Source: `packages/uikit/src/composites/chat.tsx`
- Category: composite
- Related tests: `packages/uikit/test/m7-patterns.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`
- Related stories: `packages/uikit/storybook/composites/chat.stories.tsx`
- Related docs: `docs/site/pages/recipes.md`
- Current status: resolved as composite
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Artifact checklist: [ ] unit test [ ] Storybook [ ] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/confetti.tsx`

- Source: `packages/uikit/src/templates/confetti.tsx`
- Category: template
- Related tests: `packages/uikit/test/m7-patterns.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`
- Related stories: `packages/uikit/storybook/templates/onboarding.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: resolved as reusable template
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Artifact checklist: [ ] unit test [ ] Storybook [ ] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

## Removed Example Surfaces

The former `examples` workspace has been removed. Future cleanup must preserve evidence inside the package instead:

- Storybook: `packages/uikit/storybook/<category>`
- Unit tests: `packages/uikit/test`
- E2E tests: `e2e`
- Docs: `docs/site/pages`

## Future Cleanup Tasks

- Gamification is currently kept as a reusable template under `packages/uikit/src/templates/patterns/gamification.tsx`.
- Decide whether product and promotional card variants should become generic card primitives plus examples.
- Chat is currently kept as a reusable composite under `packages/uikit/src/composites/chat.tsx`.
- Confetti is currently kept as a reusable template under `packages/uikit/src/templates/confetti.tsx`.
- Replace every cleanup candidate with tests, stories, docs, or migration notes before removing public exports.
