# Templates and Patterns Inventory

## Scope

Templates and patterns are higher-level reusable compositions for common Telegram Mini App screens and flows: settings, onboarding, approval flow, operation history, connector setup, dashboard, wallet, commerce, degraded states, and error states. They must remain generic enough for UIKit consumers and avoid hidden app business logic.

## Shared Evidence

- Unit tests: `packages/uikit/test/m7-patterns.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`
- Stories: `packages/uikit/storybook/templates`
- Docs: `docs/site/pages/components.md`, `docs/site/pages/recipes.md`, `docs/site/pages/api-reference.md`
- Visual/e2e evidence: `e2e/templates.storybook.spec.ts`, `e2e/design.spec.ts`, `e2e/m9-apps.spec.ts`, `e2e/wow.spec.ts`

## Entries

### `packages/uikit/src/patterns.tsx`

- Source: `packages/uikit/src/templates/patterns.tsx`
- Category: template
- Related tests: `packages/uikit/test/templates-reorg.test.tsx`, `packages/uikit/test/m7-patterns.test.tsx`, `packages/uikit/test/api-surface.test.ts`
- Related stories: `packages/uikit/storybook/templates/commerce.stories.tsx`, `packages/uikit/storybook/templates/wallet.stories.tsx`, `packages/uikit/storybook/templates/gamification.stories.tsx`
- Related docs: `docs/site/pages/components.md`, `docs/site/pages/recipes.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (no token change) [x] accessibility [x] Telegram runtime (not applicable) [x] state machine [x] testing [x] docs/stories [x] packaging [x] performance
- TDD checklist: failing test name: `publishes template exports from the template category and root package`; RED command: unavailable in the preserved continuation log; expected failure: unavailable; GREEN command: `npm run test -w tg-mini-app-uikit -- templates-reorg.test.tsx m7-patterns.test.tsx coverage-components.test.tsx m0-api.test.ts api-surface.test.ts consumer-imports.test.tsx` exit 0, 6 files and 201 tests passed; regression command: `npm run check:stories` exit 0 with 112/112 current atom/foundation/token/composite/template exports represented; `npm run stories:build -w tg-mini-app-uikit` exit 0; `npx playwright test e2e/templates.storybook.spec.ts --output=/tmp/tg-uikit-templates-playwright-results-$$` exit 0, 5 Storybook smoke tests passed
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: template Storybook smokes added for commerce, wallet, gamification, onboarding, and confetti; reviewer visual pass remains open
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/patterns/commerce.tsx`

- Source: `packages/uikit/src/templates/patterns/commerce.tsx`
- Category: template
- Related tests: `packages/uikit/test/templates-reorg.test.tsx`, `packages/uikit/test/m7-patterns.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`
- Related stories: `packages/uikit/storybook/templates/commerce.stories.tsx`
- Related docs: `docs/site/pages/components.md`, `docs/site/pages/recipes.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (no token change) [x] accessibility [x] Telegram runtime (not applicable) [x] state machine (controlled day/slot state preserved) [x] testing [x] docs/stories [x] packaging [x] performance
- TDD checklist: failing test name: `publishes template exports from the template category and root package`; RED command: unavailable in the preserved continuation log; expected failure: unavailable; GREEN command: `npm run test -w tg-mini-app-uikit -- templates-reorg.test.tsx m7-patterns.test.tsx coverage-components.test.tsx m0-api.test.ts api-surface.test.ts consumer-imports.test.tsx` exit 0, 6 files and 201 tests passed; regression command: `npm run check:stories` exit 0 with 112/112 current exports represented; `npx playwright test e2e/templates.storybook.spec.ts --output=/tmp/tg-uikit-templates-playwright-results-$$` exit 0, 5 tests passed
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: `templates-commerce--booking-checkout` Storybook e2e smoke added; reviewer visual pass remains open
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/patterns/wallet.tsx`

- Source: `packages/uikit/src/templates/patterns/wallet.tsx`
- Category: template
- Related tests: `packages/uikit/test/templates-reorg.test.tsx`, `packages/uikit/test/m7-patterns.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`
- Related stories: `packages/uikit/storybook/templates/wallet.stories.tsx`
- Related docs: `docs/site/pages/recipes.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (no token change) [x] accessibility (native buttons preserved) [x] Telegram runtime (not applicable) [x] state machine (connected/loading visuals preserved) [x] testing [x] docs/stories [x] packaging [x] performance
- TDD checklist: failing test name: `publishes template exports from the template category and root package`; RED command: unavailable in the preserved continuation log; expected failure: unavailable; GREEN command: `npm run test -w tg-mini-app-uikit -- templates-reorg.test.tsx m7-patterns.test.tsx coverage-components.test.tsx m0-api.test.ts api-surface.test.ts consumer-imports.test.tsx` exit 0, 6 files and 201 tests passed; regression command: `npm run check:stories` exit 0 with 112/112 current exports represented; `npx playwright test e2e/templates.storybook.spec.ts --output=/tmp/tg-uikit-templates-playwright-results-$$` exit 0, 5 tests passed
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: `templates-wallet--wallet-states` Storybook e2e smoke added; reviewer visual pass remains open
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/patterns/gamification.tsx`

- Source: `packages/uikit/src/templates/patterns/gamification.tsx`
- Category: template
- Related tests: `packages/uikit/test/templates-reorg.test.tsx`, `packages/uikit/test/m7-patterns.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`
- Related stories: `packages/uikit/storybook/templates/gamification.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (no token change) [x] accessibility [x] Telegram runtime (not applicable) [x] state machine (XP clamp preserved) [x] testing [x] docs/stories [x] packaging [x] performance
- TDD checklist: failing test name: `publishes template exports from the template category and root package`; RED command: unavailable in the preserved continuation log; expected failure: unavailable; GREEN command: `npm run test -w tg-mini-app-uikit -- templates-reorg.test.tsx m7-patterns.test.tsx coverage-components.test.tsx m0-api.test.ts api-surface.test.ts consumer-imports.test.tsx` exit 0, 6 files and 201 tests passed; regression command: `npm run check:stories` exit 0 with 112/112 current exports represented; `npx playwright test e2e/templates.storybook.spec.ts --output=/tmp/tg-uikit-templates-playwright-results-$$` exit 0, 5 tests passed
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: `templates-gamification--progress-and-leaderboard` Storybook e2e smoke added; reviewer visual pass remains open
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/onboarding.tsx`

- Source: `packages/uikit/src/templates/onboarding.tsx`
- Category: template
- Related tests: `packages/uikit/test/templates-reorg.test.tsx`, `packages/uikit/test/m7-patterns.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`
- Related stories: `packages/uikit/storybook/templates/onboarding.stories.tsx`
- Related docs: `docs/site/pages/recipes.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (no token change) [x] accessibility (button controls preserved) [x] Telegram runtime (storage adapter boundary preserved) [x] state machine (checking/open/done state preserved) [x] testing [x] docs/stories [x] packaging [x] performance
- TDD checklist: failing test name: `publishes template exports from the template category and root package`; RED command: unavailable in the preserved continuation log; expected failure: unavailable; GREEN command: `npm run test -w tg-mini-app-uikit -- templates-reorg.test.tsx m7-patterns.test.tsx coverage-components.test.tsx m0-api.test.ts api-surface.test.ts consumer-imports.test.tsx` exit 0, 6 files and 201 tests passed; regression command: `npm run check:stories` exit 0 with 112/112 current exports represented; `npx playwright test e2e/templates.storybook.spec.ts --output=/tmp/tg-uikit-templates-playwright-results-$$` exit 0, 5 tests passed
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: `templates-onboarding--coach-mark` Storybook e2e smoke added; reviewer visual pass remains open
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/confetti.tsx`

- Source: `packages/uikit/src/templates/confetti.tsx`
- Category: template
- Related tests: `packages/uikit/test/templates-reorg.test.tsx`, `packages/uikit/test/m7-patterns.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`
- Related stories: `packages/uikit/storybook/templates/onboarding.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (no token change) [x] accessibility (aria-hidden burst preserved) [x] Telegram runtime (not applicable) [x] state machine (alive/done lifecycle and reduced-motion shortcut preserved) [x] testing [x] docs/stories [x] packaging [x] performance
- TDD checklist: failing test name: `publishes template exports from the template category and root package`; RED command: unavailable in the preserved continuation log; expected failure: unavailable; GREEN command: `npm run test -w tg-mini-app-uikit -- templates-reorg.test.tsx m7-patterns.test.tsx coverage-components.test.tsx m0-api.test.ts api-surface.test.ts consumer-imports.test.tsx` exit 0, 6 files and 201 tests passed; regression command: `npm run check:stories` exit 0 with 112/112 current exports represented; `npx playwright test e2e/templates.storybook.spec.ts --output=/tmp/tg-uikit-templates-playwright-results-$$` exit 0, 5 tests passed
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: `templates-onboarding--confetti-burst` Storybook e2e smoke added; reviewer visual pass remains open
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
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

- `packages/uikit/storybook/<category>`
- `packages/uikit/storybook/<category>`
- `docs/site/pages/recipes.md`
- `e2e/m9-apps.spec.ts`
