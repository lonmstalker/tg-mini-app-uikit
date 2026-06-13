# Composite Components Inventory

## Scope

Composites combine atoms, runtime helpers, layout rules, and state machines into reusable UI structures: overlays, forms, cards, lists, navigation, gestures, chat, feedback, and layout surfaces.

## Shared Evidence

- Unit tests: `packages/uikit/test/coverage-components.test.tsx`, `packages/uikit/test/m3-gestures.test.tsx`, `packages/uikit/test/m4-forms.test.tsx`, `packages/uikit/test/m5-display.test.tsx`, `packages/uikit/test/m6-nav.test.tsx`, `packages/uikit/test/toasts.test.tsx`, `packages/uikit/test/a11y-semantics.test.tsx`
- Stories: `packages/uikit/storybook/composites/overlays.stories.tsx`, `packages/uikit/storybook/composites/forms.stories.tsx`, `packages/uikit/storybook/composites/cards.stories.tsx`, `packages/uikit/storybook/composites/feedback.stories.tsx`, `packages/uikit/storybook/composites/gestures.stories.tsx`, `packages/uikit/storybook/composites/layout.stories.tsx`, `packages/uikit/storybook/composites/lists.stories.tsx`
- Docs: `docs/site/pages/components.md`, `docs/site/pages/recipes.md`, `docs/site/pages/api-reference.md`
- Visual/e2e evidence: `e2e/composites.storybook.spec.ts`, `e2e/design.spec.ts`, `e2e/forms.spec.ts`, `e2e/gestures.spec.ts`, `e2e/nav.spec.ts`, `e2e/states.spec.ts`, `e2e/aria.spec.ts`, `e2e/reflow.spec.ts`, `e2e/wow.spec.ts`

## Entries

### `packages/uikit/src/composites/overlays.tsx`

- Source: `packages/uikit/src/composites/overlays.tsx`
- Category: composite
- Related tests: `packages/uikit/test/overlays-reorg.test.tsx`, `packages/uikit/test/toasts.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`, `packages/uikit/test/api-surface.test.ts`
- Related stories: `packages/uikit/storybook/composites/overlays.stories.tsx`
- Related docs: `docs/site/pages/components.md`, `docs/site/pages/api-reference.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (no token change) [x] accessibility (dialog/sheet/action-sheet/tooltip semantics covered) [x] Telegram runtime (back interception preserved) [x] state machine (mount transitions, sheet snap, toast lifecycle preserved) [x] testing [x] docs/stories [x] packaging [x] performance
- TDD checklist: failing test name: `publishes overlay composites from the composite category and root package`; RED command: `npm run test -w tg-mini-app-uikit -- overlays-reorg.test.tsx`; expected failure: exit 1, `Failed to resolve import "../src/composites/overlays"`; GREEN command: `npm run test -w tg-mini-app-uikit -- overlays-reorg.test.tsx toasts.test.tsx m0-api.test.tsx m2-roving.test.tsx m3-gestures.test.tsx m6-nav.test.tsx coverage-components.test.tsx coverage-infrastructure.test.tsx a11y-semantics.test.tsx i18n.test.tsx consumer-imports.test.tsx api-surface.test.ts` exit 0, 12 files and 250 tests passed; regression command: `npm run typecheck -w tg-mini-app-uikit` exit 0; `npm run check:stories` exit 0 with 56/56 current atom/foundation/token/composite exports represented; `npm run test:e2e` exit 0 with 30 Storybook smoke tests passing
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: `composites-overlays--modal-surfaces`, `--action-sheet`, `--tooltip`, `--anchored-popper`, and `--toasts` Storybook e2e smokes added; reviewer visual pass remains open
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/composites/overlays/shared.tsx`

- Source: `packages/uikit/src/composites/overlays/shared.tsx`
- Category: composite
- Related tests: `packages/uikit/test/coverage-components.test.tsx`, `packages/uikit/test/a11y-semantics.test.tsx`
- Related stories: `packages/uikit/storybook/composites/overlays.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (no token change) [x] accessibility (focus trap helper covered by overlay tests) [x] Telegram runtime (not applicable) [x] state machine (mount transition helper preserved) [x] testing [x] docs/stories [x] packaging [x] performance
- TDD checklist: failing test name: `keeps overlay implementation modules under the composite category`; RED command: `npm run test -w tg-mini-app-uikit -- overlays-reorg.test.tsx`; expected failure: exit 1, `Failed to resolve import "../src/composites/overlays"`; GREEN command: focused overlays regression suite exit 0, 12 files and 250 tests passed; regression command: `npm run typecheck -w tg-mini-app-uikit` exit 0; `npm run check:stories` exit 0 with 56/56 current atom/foundation/token/composite exports represented
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: helper-only move represented through overlay stories; reviewer visual pass remains open
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/composites/overlays/action-sheet.tsx`

- Source: `packages/uikit/src/composites/overlays/action-sheet.tsx`
- Category: composite
- Related tests: `packages/uikit/test/overlays-reorg.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`, `packages/uikit/test/a11y-semantics.test.tsx`
- Related stories: `packages/uikit/storybook/composites/overlays.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (no token change) [x] accessibility (dialog semantics preserved) [x] Telegram runtime (back interception preserved) [x] state machine (mount/close transition preserved) [x] testing [x] docs/stories [x] packaging [x] performance
- TDD checklist: failing test name: `publishes overlay composites from the composite category and root package`; RED command: `npm run test -w tg-mini-app-uikit -- overlays-reorg.test.tsx`; expected failure: exit 1, `Failed to resolve import "../src/composites/overlays"`; GREEN command: focused overlays regression suite exit 0, 12 files and 250 tests passed; regression command: `npm run test:e2e` exit 0 with 30 Storybook smoke tests passing
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: `composites-overlays--action-sheet` Storybook e2e smoke added; reviewer visual pass remains open
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/composites/overlays/dialog.tsx`

- Source: `packages/uikit/src/composites/overlays/dialog.tsx`
- Category: composite
- Related tests: `packages/uikit/test/overlays-reorg.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`, `packages/uikit/test/a11y-semantics.test.tsx`
- Related stories: `packages/uikit/storybook/composites/overlays.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (no token change) [x] accessibility (alertdialog semantics and keyboard behavior preserved) [x] Telegram runtime (back interception preserved) [x] state machine (open/close transition preserved) [x] testing [x] docs/stories [x] packaging [x] performance
- TDD checklist: failing test name: `keeps overlay implementation modules under the composite category`; RED command: `npm run test -w tg-mini-app-uikit -- overlays-reorg.test.tsx`; expected failure: exit 1, `Failed to resolve import "../src/composites/overlays"`; GREEN command: focused overlays regression suite exit 0, 12 files and 250 tests passed; regression command: `npm run test:e2e` exit 0 with 30 Storybook smoke tests passing
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: `composites-overlays--modal-surfaces` Storybook e2e smoke added; reviewer visual pass remains open
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/composites/overlays/popper-tooltip.tsx`

- Source: `packages/uikit/src/composites/overlays/popper-tooltip.tsx`
- Category: composite
- Related tests: `packages/uikit/test/overlays-reorg.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`, `packages/uikit/test/a11y-semantics.test.tsx`
- Related stories: `packages/uikit/storybook/composites/overlays.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (no token change) [x] accessibility (tooltip trigger description behavior preserved) [x] Telegram runtime (not applicable) [x] state machine (open/close/auto-flip behavior preserved) [x] testing [x] docs/stories [x] packaging [x] performance
- TDD checklist: failing test name: `publishes overlay composites from the composite category and root package`; RED command: `npm run test -w tg-mini-app-uikit -- overlays-reorg.test.tsx`; expected failure: exit 1, `Failed to resolve import "../src/composites/overlays"`; GREEN command: focused overlays regression suite exit 0, 12 files and 250 tests passed; regression command: `npm run test:e2e` exit 0 with 30 Storybook smoke tests passing
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: `composites-overlays--tooltip` and `composites-overlays--anchored-popper` Storybook e2e smokes added; reviewer visual pass remains open
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/composites/overlays/sheet.tsx`

- Source: `packages/uikit/src/composites/overlays/sheet.tsx`
- Category: composite
- Related tests: `packages/uikit/test/overlays-reorg.test.tsx`, `packages/uikit/test/m3-gestures.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`
- Related stories: `packages/uikit/storybook/composites/overlays.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (no token change) [x] accessibility (dialog semantics and close label preserved) [x] Telegram runtime (back interception preserved) [x] state machine (snap/drag/open-change behavior preserved) [x] testing [x] docs/stories [x] packaging [x] performance
- TDD checklist: failing test name: `keeps overlay implementation modules under the composite category`; RED command: `npm run test -w tg-mini-app-uikit -- overlays-reorg.test.tsx`; expected failure: exit 1, `Failed to resolve import "../src/composites/overlays"`; GREEN command: focused overlays regression suite exit 0, 12 files and 250 tests passed; regression command: `npm run test:e2e` exit 0 with 30 Storybook smoke tests passing
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: `composites-overlays--modal-surfaces` Storybook e2e smoke includes `TKSheet`; reviewer visual pass remains open
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/composites/overlays/toasts.tsx`

- Source: `packages/uikit/src/composites/overlays/toasts.tsx`
- Category: composite
- Related tests: `packages/uikit/test/overlays-reorg.test.tsx`, `packages/uikit/test/toasts.test.tsx`
- Related stories: `packages/uikit/storybook/composites/overlays.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (no token change) [x] accessibility (`role=status` live region preserved) [x] Telegram runtime (not applicable) [x] state machine (queue, max, duration, dismiss lifecycle preserved) [x] testing [x] docs/stories [x] packaging [x] performance
- TDD checklist: failing test name: `publishes overlay composites from the composite category and root package`; RED command: `npm run test -w tg-mini-app-uikit -- overlays-reorg.test.tsx`; expected failure: exit 1, `Failed to resolve import "../src/composites/overlays"`; GREEN command: focused overlays regression suite exit 0, 12 files and 250 tests passed; regression command: `npm run test:e2e` exit 0 with 30 Storybook smoke tests passing
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: `composites-overlays--toasts` Storybook e2e smoke added; reviewer visual pass remains open
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/composites/forms.tsx`

- Source: `packages/uikit/src/composites/forms.tsx`
- Category: composite
- Related tests: `packages/uikit/test/forms-reorg.test.tsx`, `packages/uikit/test/m4-forms.test.tsx`, `packages/uikit/test/api-surface.test.ts`
- Related stories: `packages/uikit/storybook/composites/forms.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (no token change) [x] accessibility (form semantics preserved through existing form tests) [x] Telegram runtime (PIN haptics provider import preserved) [x] state machine (calendar/date/chips/masked/PIN state preserved) [x] testing [x] docs/stories [x] packaging [x] performance
- TDD checklist: failing test name: `publishes form composites from the composite category and root package`; RED command: `npm run test -w tg-mini-app-uikit -- forms-reorg.test.tsx`; expected failure: exit 1, `Failed to resolve import "../src/composites/forms"`; GREEN command: `npm run test -w tg-mini-app-uikit -- forms-reorg.test.tsx m4-forms.test.tsx otp.test.tsx coverage-components.test.tsx coverage-infrastructure.test.tsx a11y-semantics.test.tsx m7-patterns.test.tsx api-surface.test.ts consumer-imports.test.tsx` exit 0, 9 files and 115 tests passed; regression command: `npm run check:stories` exit 0 with 63/63 current atom/foundation/token/composite exports represented
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: `composites-forms--calendar-and-date-input`, `--masked-inputs`, and `--pin-and-chips` Storybook stories added; reviewer visual pass remains open
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/composites/forms/calendar.tsx`

- Source: `packages/uikit/src/composites/forms/calendar.tsx`
- Category: composite
- Related tests: `packages/uikit/test/forms-reorg.test.tsx`, `packages/uikit/test/m4-forms.test.tsx`
- Related stories: `packages/uikit/storybook/composites/forms.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (no token change) [x] accessibility (grid semantics and keyboard tests preserved) [x] Telegram runtime (not applicable) [x] state machine (single/range/month picker behavior preserved) [x] testing [x] docs/stories [x] packaging [x] performance
- TDD checklist: failing test name: `keeps form implementation modules under the composite category`; RED command: `npm run test -w tg-mini-app-uikit -- forms-reorg.test.tsx`; expected failure: exit 1, `Failed to resolve import "../src/composites/forms"`; GREEN command: focused forms regression suite exit 0, 9 files and 115 tests passed; regression command: `npm run check:stories` exit 0 with 63/63 current exports represented
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: `composites-forms--calendar-and-date-input` Storybook story added; reviewer visual pass remains open
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/composites/forms/chips-date.tsx`

- Source: `packages/uikit/src/composites/forms/chips-date.tsx`
- Category: composite
- Related tests: `packages/uikit/test/forms-reorg.test.tsx`, `packages/uikit/test/m4-forms.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`
- Related stories: `packages/uikit/storybook/composites/forms.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (no token change) [x] accessibility (input labels and date validation preserved) [x] Telegram runtime (not applicable) [x] state machine (chips commit/removal and date picker state preserved) [x] testing [x] docs/stories [x] packaging [x] performance
- TDD checklist: failing test name: `keeps form implementation modules under the composite category`; RED command: `npm run test -w tg-mini-app-uikit -- forms-reorg.test.tsx`; expected failure: exit 1, `Failed to resolve import "../src/composites/forms"`; GREEN command: focused forms regression suite exit 0, 9 files and 115 tests passed; regression command: `npm run check:stories` exit 0 with 63/63 current exports represented
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: `composites-forms--calendar-and-date-input` and `composites-forms--pin-and-chips` Storybook stories added; reviewer visual pass remains open
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/composites/forms/masked.tsx`

- Source: `packages/uikit/src/composites/forms/masked.tsx`
- Category: composite
- Related tests: `packages/uikit/test/forms-reorg.test.tsx`, `packages/uikit/test/m4-forms.test.tsx`
- Related stories: `packages/uikit/storybook/composites/forms.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (no token change) [x] accessibility (input labels and validation preserved) [x] Telegram runtime (not applicable) [x] state machine (masking/phone/time normalization preserved) [x] testing [x] docs/stories [x] packaging [x] performance
- TDD checklist: failing test name: `keeps form implementation modules under the composite category`; RED command: `npm run test -w tg-mini-app-uikit -- forms-reorg.test.tsx`; expected failure: exit 1, `Failed to resolve import "../src/composites/forms"`; GREEN command: focused forms regression suite exit 0, 9 files and 115 tests passed; regression command: `npm run check:stories` exit 0 with 63/63 current exports represented
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: `composites-forms--masked-inputs` Storybook story added; reviewer visual pass remains open
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/composites/forms/pin.tsx`

- Source: `packages/uikit/src/composites/forms/pin.tsx`
- Category: composite
- Related tests: `packages/uikit/test/forms-reorg.test.tsx`, `packages/uikit/test/m4-forms.test.tsx`, `packages/uikit/test/otp.test.tsx`
- Related stories: `packages/uikit/storybook/composites/forms.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (no token change) [x] accessibility (keypad labels and title preserved) [x] Telegram runtime (haptics optional fallback preserved) [x] state machine (digit entry, completion, error reset preserved) [x] testing [x] docs/stories [x] packaging [x] performance
- TDD checklist: failing test name: `keeps form implementation modules under the composite category`; RED command: `npm run test -w tg-mini-app-uikit -- forms-reorg.test.tsx`; expected failure: exit 1, `Failed to resolve import "../src/composites/forms"`; GREEN command: focused forms regression suite exit 0, 9 files and 115 tests passed; regression command: `npm run check:stories` exit 0 with 63/63 current exports represented
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: `composites-forms--pin-and-chips` Storybook story added; reviewer visual pass remains open
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/composites/cards.tsx`

- Source: `packages/uikit/src/composites/cards.tsx`
- Category: composite
- Related tests: `packages/uikit/test/cards-reorg.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`, `packages/uikit/test/api-surface.test.ts`
- Related stories: `packages/uikit/storybook/composites/cards.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (no token change) [x] accessibility (interactive card/cell semantics preserved) [x] Telegram runtime (not applicable) [x] state machine (favorite card state preserved) [x] testing [x] docs/stories [x] packaging [x] performance
- TDD checklist: failing test name: `publishes card composites from the composite category and root package`; RED command: `npm run test -w tg-mini-app-uikit -- cards-reorg.test.tsx`; expected failure: exit 1, `Failed to resolve import "../src/composites/cards"`; GREEN command: `npm run test -w tg-mini-app-uikit -- cards-reorg.test.tsx coverage-components.test.tsx m0-api.test.tsx api-surface.test.ts consumer-imports.test.tsx m5-display.test.tsx` exit 0, 6 files and 206 tests passed; regression command: `npm run check:stories` exit 0 with 71/71 current exports represented; `npm run test:e2e` exit 0 with 36 Storybook smoke tests passing
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: `composites-cards--card-primitives`, `--product-cards`, and `--promotional-cards` Storybook e2e smokes added; reviewer visual pass remains open
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/composites/cards/primitives.tsx`

- Source: `packages/uikit/src/composites/cards/primitives.tsx`
- Category: composite
- Related tests: `packages/uikit/test/cards-reorg.test.tsx`, `packages/uikit/test/m0-api.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`
- Related stories: `packages/uikit/storybook/composites/cards.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (no token change) [x] accessibility (button/link row semantics preserved) [x] Telegram runtime (not applicable) [x] state machine (not applicable) [x] testing [x] docs/stories [x] packaging [x] performance
- TDD checklist: failing test name: `keeps card implementation modules under the composite category`; RED command: `npm run test -w tg-mini-app-uikit -- cards-reorg.test.tsx`; expected failure: exit 1, `Failed to resolve import "../src/composites/cards"`; GREEN command: focused cards regression suite exit 0, 6 files and 206 tests passed; regression command: `npm run check:stories` exit 0 with 71/71 current exports represented
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: `composites-cards--card-primitives` Storybook e2e smoke added; reviewer visual pass remains open
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/composites/cards/product.tsx`

- Source: `packages/uikit/src/composites/cards/product.tsx`
- Category: composite
- Related tests: `packages/uikit/test/cards-reorg.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`
- Related stories: `packages/uikit/storybook/composites/cards.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (no token change) [x] accessibility (image fallback/add/favorite labels preserved) [x] Telegram runtime (not applicable) [x] state machine (favorite controlled/uncontrolled behavior preserved) [x] testing [x] docs/stories [x] packaging [x] performance
- TDD checklist: failing test name: `keeps card implementation modules under the composite category`; RED command: `npm run test -w tg-mini-app-uikit -- cards-reorg.test.tsx`; expected failure: exit 1, `Failed to resolve import "../src/composites/cards"`; GREEN command: focused cards regression suite exit 0, 6 files and 206 tests passed; regression command: `npm run check:stories` exit 0 with 71/71 current exports represented
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: `composites-cards--product-cards` Storybook e2e smoke added; reviewer visual pass remains open
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/composites/cards/promotional.tsx`

- Source: `packages/uikit/src/composites/cards/promotional.tsx`
- Category: composite
- Related tests: `packages/uikit/test/cards-reorg.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`
- Related stories: `packages/uikit/storybook/composites/cards.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (no token change) [x] accessibility (booking avatar/status and CTA behavior preserved) [x] Telegram runtime (not applicable) [x] state machine (stat bars and CTA behavior preserved) [x] testing [x] docs/stories [x] packaging [x] performance
- TDD checklist: failing test name: `keeps card implementation modules under the composite category`; RED command: `npm run test -w tg-mini-app-uikit -- cards-reorg.test.tsx`; expected failure: exit 1, `Failed to resolve import "../src/composites/cards"`; GREEN command: focused cards regression suite exit 0, 6 files and 206 tests passed; regression command: `npm run test:e2e` exit 0 with 36 Storybook smoke tests passing
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: `composites-cards--promotional-cards` Storybook e2e smoke added; reviewer visual pass remains open
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/composites/feedback.tsx`

- Source: `packages/uikit/src/composites/feedback.tsx`
- Category: composite
- Related tests: `packages/uikit/test/feedback-reorg.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`, `packages/uikit/test/m5-display.test.tsx`, `packages/uikit/test/a11y-semantics.test.tsx`
- Related stories: `packages/uikit/storybook/composites/feedback.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (no token change) [x] accessibility (progressbar and interactive bars semantics covered) [x] Telegram runtime (not applicable) [x] state machine (bar hover/click and timeline status rendering preserved) [x] testing [x] docs/stories [x] packaging [x] performance
- TDD checklist: failing test name: `publishes feedback composites from the composite category and root package`; RED command: `npm run test -w tg-mini-app-uikit -- feedback-reorg.test.tsx`; expected failure: exit 1, `Failed to resolve import "../src/composites/feedback"`; GREEN command: `npm run test -w tg-mini-app-uikit -- feedback-reorg.test.tsx coverage-components.test.tsx m5-display.test.tsx a11y-semantics.test.tsx m0-api.test.tsx api-surface.test.ts consumer-imports.test.tsx` exit 0, 7 files and 213 tests passed; regression command: `npm run check:stories` exit 0 with 80/80 current exports represented; `npm run test:e2e` exit 0 with 39 Storybook smoke tests passing
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: `composites-feedback--skeletons`, `--progress-and-bars`, and `--empty-and-timeline` Storybook e2e smokes added; reviewer visual pass remains open
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/composites/gestures.tsx`

- Source: `packages/uikit/src/composites/gestures.tsx`
- Category: composite
- Related tests: `packages/uikit/test/gestures-reorg.test.tsx`, `packages/uikit/test/m3-gestures.test.tsx`
- Related stories: `packages/uikit/storybook/composites/gestures.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (no token change) [x] accessibility (swipe action buttons remain keyboard reachable) [x] Telegram runtime (optional haptics fallback preserved) [x] state machine (long-press timer, pull threshold, and swipe open/full-swipe behavior preserved) [x] testing [x] docs/stories [x] packaging [x] performance
- TDD checklist: failing test name: `publishes gesture composites from the composite category and root package`; RED command: `npm run test -w tg-mini-app-uikit -- gestures-reorg.test.tsx`; expected failure: exit 1, `Failed to resolve import "../src/composites/gestures"`; GREEN command: `npm run test -w tg-mini-app-uikit -- gestures-reorg.test.tsx m3-gestures.test.tsx coverage-components.test.tsx coverage-infrastructure.test.tsx m0-api.test.tsx api-surface.test.ts consumer-imports.test.tsx` exit 0, 7 files and 215 tests passed; regression command: `npm run check:stories` exit 0 with 83/83 current exports represented; `npm run test:e2e` exit 0 with 42 Storybook smoke tests passing
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: `composites-gestures--pull-to-refresh`, `--swipe-actions`, and `--long-press` Storybook e2e smokes added; reviewer visual pass remains open
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/composites/layout.tsx`

- Source: `packages/uikit/src/composites/layout.tsx`
- Category: composite
- Related tests: `packages/uikit/test/layout-reorg.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`, `packages/uikit/test/m6-nav.test.tsx`
- Related stories: `packages/uikit/storybook/composites/layout.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (no token change) [x] accessibility (page scroll region remains focusable) [x] Telegram runtime (safe-area hook preserved) [x] state machine (page scroll context preserved) [x] testing [x] docs/stories [x] packaging [x] performance
- TDD checklist: failing test name: `publishes layout composites from the composite category and root package`; RED command: `npm run test -w tg-mini-app-uikit -- layout-reorg.test.tsx`; expected failure: exit 1, `Failed to resolve import "../src/composites/layout"`; GREEN command: `npm run test -w tg-mini-app-uikit -- layout-reorg.test.tsx coverage-components.test.tsx m6-nav.test.tsx m5-display.test.tsx api-surface.test.ts consumer-imports.test.tsx` exit 0, 6 files and 65 tests passed; regression command: `npm run check:stories` exit 0 with 86/86 current exports represented; `npm run test:e2e` exit 0 with 44 Storybook smoke tests passing
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: `composites-layout--page-shell` and `--safe-area` Storybook e2e smokes added; reviewer visual pass remains open
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/composites/lists.tsx`

- Source: `packages/uikit/src/composites/lists.tsx`
- Category: composite
- Related tests: `packages/uikit/test/lists-reorg.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`, `packages/uikit/test/m5-display.test.tsx`, `packages/uikit/test/m0-api.test.tsx`
- Related stories: `packages/uikit/storybook/composites/lists.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (no token change) [x] accessibility (cell keyboard activation, switch isolation, accordion buttons, virtual scroll focus preserved) [x] Telegram runtime (not applicable) [x] state machine (accordion controlled state, infinite observer lifecycle, virtual window state preserved) [x] testing [x] docs/stories [x] packaging [x] performance
- TDD checklist: failing test name: `publishes list composites from the composite category and root package`; RED command: `npm run test -w tg-mini-app-uikit -- lists-reorg.test.tsx`; expected failure: exit 1, `Failed to resolve import "../src/composites/lists"`; GREEN command: `npm run test -w tg-mini-app-uikit -- lists-reorg.test.tsx m5-display.test.tsx coverage-components.test.tsx coverage-infrastructure.test.tsx m0-api.test.tsx api-surface.test.ts consumer-imports.test.tsx` exit 0, 7 files and 215 tests passed; regression command: `npm run check:stories` exit 0 with 91/91 current exports represented; `npm run test:e2e` exit 0 with 47 Storybook smoke tests passing
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: `composites-lists--grouped-cells`, `--accordion-list`, and `--loading-and-virtualization` Storybook e2e smokes added; reviewer visual pass remains open
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/navigation.tsx`

- Source: `packages/uikit/src/composites/navigation.tsx`
- Category: composite
- Related tests: `packages/uikit/test/navigation-reorg.test.tsx`, `packages/uikit/test/m2-roving.test.tsx`, `packages/uikit/test/m6-nav.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`
- Related stories: `packages/uikit/storybook/composites/navigation.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (no token change) [x] accessibility (header label, tabbar current page, roving controls, passive steps, page-dot labels preserved) [x] Telegram runtime (safe-area and haptics hooks preserved) [x] state machine (controlled/uncontrolled selection state preserved) [x] testing [x] docs/stories [x] packaging [x] performance
- TDD checklist: failing test name: `publishes navigation composites from the composite category and root package`; RED command: unavailable in the preserved continuation log; expected failure: unavailable; GREEN command: `npm run test -w tg-mini-app-uikit -- navigation-reorg.test.tsx m2-roving.test.tsx m6-nav.test.tsx coverage-components.test.tsx m7-patterns.test.tsx a11y-semantics.test.tsx m0-api.test.tsx api-surface.test.ts consumer-imports.test.tsx` exit 0, 9 files and 224 tests passed; regression command: `npm run check:stories` exit 0 with 97/97 current exports represented; `npm run test:e2e` exit 0 with 50 Storybook smoke tests passing
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: `composites-navigation--header-and-tabbar`, `--segmented-and-tabs`, and `--steps-and-dots` Storybook e2e smokes added; reviewer visual pass remains open
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/nav.tsx`

- Source: `packages/uikit/src/composites/nav.tsx`
- Category: composite
- Related tests: `packages/uikit/test/nav-reorg.test.tsx`, `packages/uikit/test/m6-nav.test.tsx`, `packages/uikit/test/coverage-infrastructure.test.tsx`
- Related stories: `packages/uikit/storybook/composites/nav.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (no token change) [x] accessibility (covered panels stay aria-hidden) [x] Telegram runtime (BackButton integration preserved) [x] state machine (push/pop/replace/popTo stack API preserved) [x] testing [x] docs/stories [x] packaging [x] performance
- TDD checklist: failing test name: `publishes nav stack primitives from the composite category and root package`; RED command: unavailable in the preserved continuation log; expected failure: unavailable; GREEN command: `npm run test -w tg-mini-app-uikit -- nav-reorg.test.tsx m6-nav.test.tsx coverage-infrastructure.test.tsx m0-api.test.ts api-surface.test.ts consumer-imports.test.tsx` exit 0, 6 files and 176 tests passed; regression command: `npm run check:stories` exit 0 with 100/100 current exports represented; `npm run test:e2e` exit 0 with 51 Storybook smoke tests passing
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: `composites-nav--stack-flow` Storybook e2e smoke added; reviewer visual pass remains open
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/carousel.tsx`

- Source: `packages/uikit/src/composites/carousel.tsx`
- Category: composite
- Related tests: `packages/uikit/test/carousel-reorg.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`, `packages/uikit/test/m5-display.test.tsx`
- Related stories: `packages/uikit/storybook/composites/carousel.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (no token change) [x] accessibility (page-dot button labels preserved) [x] Telegram runtime (edge inset behavior preserved) [x] state machine (scroll/page state preserved) [x] testing [x] docs/stories [x] packaging [x] performance
- TDD checklist: failing test name: `publishes gallery from the composite category and root package`; RED command: unavailable in the preserved continuation log; expected failure: unavailable; GREEN command: `npm run test -w tg-mini-app-uikit -- carousel-reorg.test.tsx coverage-components.test.tsx m5-display.test.tsx m0-api.test.ts api-surface.test.ts consumer-imports.test.tsx` exit 0, 6 files and 205 tests passed; regression command: `npm run check:stories` exit 0 with 101/101 current exports represented; `npm run stories:build -w tg-mini-app-uikit` exit 0; `npx playwright test e2e/composites.storybook.spec.ts --grep composites-carousel --output=/tmp/tg-uikit-carousel-playwright-results-$$` exit 0, 1 Storybook smoke test passed
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: `composites-carousel--product-slides` Storybook e2e smoke added; reviewer visual pass remains open
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/chat.tsx`

- Source: `packages/uikit/src/composites/chat.tsx`
- Category: composite
- Related tests: `packages/uikit/test/chat-reorg.test.tsx`, `packages/uikit/test/m7-patterns.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`
- Related stories: `packages/uikit/storybook/composites/chat.stories.tsx`
- Related docs: `docs/site/pages/components.md`, `docs/site/pages/recipes.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (no token change) [x] accessibility (send label and bubble metadata preserved) [x] Telegram runtime (safe-area hook preserved) [x] state machine (message grouping and write-bar send/clear state preserved) [x] testing [x] docs/stories [x] packaging [x] performance
- TDD checklist: failing test name: `publishes chat composites from the composite category and root package`; RED command: unavailable in the preserved continuation log; expected failure: unavailable; GREEN command: `npm run test -w tg-mini-app-uikit -- chat-reorg.test.tsx m7-patterns.test.tsx coverage-components.test.tsx m0-api.test.ts api-surface.test.ts consumer-imports.test.tsx` exit 0, 6 files and 201 tests passed; regression command: `npm run check:stories` exit 0 with 104/104 current exports represented; `npm run stories:build -w tg-mini-app-uikit` exit 0; `npx playwright test e2e/composites.storybook.spec.ts --grep composites-chat --output=/tmp/tg-uikit-chat-playwright-results-2-$$` exit 0, 2 Storybook smoke tests passed
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: `composites-chat--support-thread` and `--bubble-states` Storybook e2e smokes added; reviewer visual pass remains open
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет
