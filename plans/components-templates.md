# Templates and Patterns Inventory

## Scope

Templates and patterns are higher-level reusable compositions for common Telegram Mini App screens and flows: settings, onboarding, approval flow, operation history, connector setup, dashboard, wallet, commerce, degraded states, and error states. They must remain generic enough for UIKit consumers and avoid hidden app business logic.

## Shared Evidence

- Unit tests: `packages/uikit/test/m7-patterns.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`
- Stories: `examples/demo/stories/patterns/commerce.stories.tsx`, `examples/demo/stories/patterns/messaging.stories.tsx`, `examples/demo/stories/templates/dashboard.stories.tsx`, `examples/demo/stories/templates/page-shell.stories.tsx`
- Docs: `docs/site/pages/components.md`, `docs/site/pages/recipes.md`, `docs/site/pages/api-reference.md`
- Visual/e2e evidence: `e2e/design.spec.ts`, `e2e/demo2.spec.ts`, `e2e/m9-apps.spec.ts`, `e2e/wow.spec.ts`

## Entries

### `packages/uikit/src/patterns.tsx`

- Source: `packages/uikit/src/patterns.tsx`
- Category: template
- Related tests: `packages/uikit/test/m7-patterns.test.tsx`, `packages/uikit/test/api-surface.test.ts`
- Related stories: `examples/demo/stories/patterns/commerce.stories.tsx`
- Related docs: `docs/site/pages/components.md`, `docs/site/pages/recipes.md`
- Current status: split
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/patterns/commerce.tsx`

- Source: `packages/uikit/src/patterns/commerce.tsx`
- Category: template
- Related tests: `packages/uikit/test/m7-patterns.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`
- Related stories: `examples/demo/stories/patterns/commerce.stories.tsx`
- Related docs: `docs/site/pages/components.md`, `docs/site/pages/recipes.md`
- Current status: needs reviewer
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/patterns/wallet.tsx`

- Source: `packages/uikit/src/patterns/wallet.tsx`
- Category: template
- Related tests: `packages/uikit/test/m7-patterns.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`
- Related stories: `examples/demo/stories/patterns/commerce.stories.tsx`
- Related docs: `docs/site/pages/recipes.md`
- Current status: needs reviewer
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/patterns/gamification.tsx`

- Source: `packages/uikit/src/patterns/gamification.tsx`
- Category: template
- Related tests: `packages/uikit/test/m7-patterns.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`
- Related stories: None found in current inventory
- Related docs: `docs/site/pages/components.md`
- Current status: demo-only candidate
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/onboarding.tsx`

- Source: `packages/uikit/src/onboarding.tsx`
- Category: template
- Related tests: `packages/uikit/test/m7-patterns.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`
- Related stories: `examples/demo/stories/templates/page-shell.stories.tsx`
- Related docs: `docs/site/pages/recipes.md`
- Current status: move
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/confetti.tsx`

- Source: `packages/uikit/src/confetti.tsx`
- Category: template
- Related tests: `packages/uikit/test/m7-patterns.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`
- Related stories: None found in current inventory
- Related docs: `docs/site/pages/components.md`
- Current status: needs reviewer
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

## Missing Template Targets

These requested template families do not yet have obvious reusable `src` counterparts and need future design/API planning before implementation:

- Settings screen template.
- Approval flow template.
- Operation history template.
- Connector setup template.
- Dashboard template.
- Error or degraded-state template.

Potential current evidence surfaces:

- `examples/demo/stories/templates/dashboard.stories.tsx`
- `examples/demo/stories/templates/page-shell.stories.tsx`
- `docs/site/pages/recipes.md`
- `e2e/m9-apps.spec.ts`
