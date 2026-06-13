# Composite Components Inventory

## Scope

Composites combine atoms, runtime helpers, layout rules, and state machines into reusable UI structures: overlays, forms, cards, lists, navigation, gestures, chat, feedback, and layout surfaces.

## Shared Evidence

- Unit tests: `packages/uikit/test/coverage-components.test.tsx`, `packages/uikit/test/m3-gestures.test.tsx`, `packages/uikit/test/m4-forms.test.tsx`, `packages/uikit/test/m5-display.test.tsx`, `packages/uikit/test/m6-nav.test.tsx`, `packages/uikit/test/toasts.test.tsx`, `packages/uikit/test/a11y-semantics.test.tsx`
- Stories: `examples/demo/stories/components/overlays/overlays.stories.tsx`, `examples/demo/stories/components/forms/date-time.stories.tsx`, `examples/demo/stories/components/forms/inputs.stories.tsx`, `examples/demo/stories/components/lists/lists.stories.tsx`, `examples/demo/stories/patterns/messaging.stories.tsx`, `examples/demo/stories/templates/page-shell.stories.tsx`
- Docs: `docs/site/pages/components.md`, `docs/site/pages/recipes.md`, `docs/site/pages/api-reference.md`
- Visual/e2e evidence: `e2e/design.spec.ts`, `e2e/forms.spec.ts`, `e2e/gestures.spec.ts`, `e2e/nav.spec.ts`, `e2e/states.spec.ts`, `e2e/aria.spec.ts`, `e2e/reflow.spec.ts`, `e2e/wow.spec.ts`

## Entries

### `packages/uikit/src/overlays.tsx`

- Source: `packages/uikit/src/overlays.tsx`
- Category: composite
- Related tests: `packages/uikit/test/toasts.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`, `packages/uikit/test/api-surface.test.ts`
- Related stories: `examples/demo/stories/components/overlays/overlays.stories.tsx`
- Related docs: `docs/site/pages/components.md`, `docs/site/pages/api-reference.md`
- Current status: move
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/overlays/shared.tsx`

- Source: `packages/uikit/src/overlays/shared.tsx`
- Category: composite
- Related tests: `packages/uikit/test/coverage-components.test.tsx`, `packages/uikit/test/a11y-semantics.test.tsx`
- Related stories: `examples/demo/stories/components/overlays/overlays.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: keep
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/overlays/action-sheet.tsx`

- Source: `packages/uikit/src/overlays/action-sheet.tsx`
- Category: composite
- Related tests: `packages/uikit/test/coverage-components.test.tsx`, `packages/uikit/test/a11y-semantics.test.tsx`
- Related stories: `examples/demo/stories/components/overlays/overlays.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: move
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/overlays/dialog.tsx`

- Source: `packages/uikit/src/overlays/dialog.tsx`
- Category: composite
- Related tests: `packages/uikit/test/coverage-components.test.tsx`, `packages/uikit/test/a11y-semantics.test.tsx`
- Related stories: `examples/demo/stories/components/overlays/overlays.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: move
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/overlays/popper-tooltip.tsx`

- Source: `packages/uikit/src/overlays/popper-tooltip.tsx`
- Category: composite
- Related tests: `packages/uikit/test/coverage-components.test.tsx`, `packages/uikit/test/a11y-semantics.test.tsx`
- Related stories: `examples/demo/stories/components/overlays/overlays.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: split
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/overlays/sheet.tsx`

- Source: `packages/uikit/src/overlays/sheet.tsx`
- Category: composite
- Related tests: `packages/uikit/test/m3-gestures.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`
- Related stories: `examples/demo/stories/components/overlays/overlays.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: move
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/overlays/toasts.tsx`

- Source: `packages/uikit/src/overlays/toasts.tsx`
- Category: composite
- Related tests: `packages/uikit/test/toasts.test.tsx`
- Related stories: `examples/demo/stories/components/overlays/overlays.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: move
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/forms.tsx`

- Source: `packages/uikit/src/forms.tsx`
- Category: composite
- Related tests: `packages/uikit/test/m4-forms.test.tsx`, `packages/uikit/test/api-surface.test.ts`
- Related stories: `examples/demo/stories/components/forms/date-time.stories.tsx`, `examples/demo/stories/components/forms/inputs.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: move
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/forms/calendar.tsx`

- Source: `packages/uikit/src/forms/calendar.tsx`
- Category: composite
- Related tests: `packages/uikit/test/m4-forms.test.tsx`
- Related stories: `examples/demo/stories/components/forms/date-time.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: split
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/forms/chips-date.tsx`

- Source: `packages/uikit/src/forms/chips-date.tsx`
- Category: composite
- Related tests: `packages/uikit/test/m4-forms.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`
- Related stories: `examples/demo/stories/components/forms/date-time.stories.tsx`, `examples/demo/stories/components/forms/inputs.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: split
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/forms/masked.tsx`

- Source: `packages/uikit/src/forms/masked.tsx`
- Category: composite
- Related tests: `packages/uikit/test/m4-forms.test.tsx`
- Related stories: `examples/demo/stories/components/forms/inputs.stories.tsx`, `examples/demo/stories/components/forms/date-time.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: split
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/forms/pin.tsx`

- Source: `packages/uikit/src/forms/pin.tsx`
- Category: composite
- Related tests: `packages/uikit/test/m4-forms.test.tsx`, `packages/uikit/test/otp.test.tsx`
- Related stories: `examples/demo/stories/components/forms/inputs.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: move
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/cards.tsx`

- Source: `packages/uikit/src/cards.tsx`
- Category: composite
- Related tests: `packages/uikit/test/coverage-components.test.tsx`, `packages/uikit/test/api-surface.test.ts`
- Related stories: `examples/demo/stories/patterns/commerce.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: move
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/cards/primitives.tsx`

- Source: `packages/uikit/src/cards/primitives.tsx`
- Category: composite
- Related tests: `packages/uikit/test/m0-api.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`
- Related stories: `examples/demo/stories/patterns/commerce.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: move
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/cards/product.tsx`

- Source: `packages/uikit/src/cards/product.tsx`
- Category: composite
- Related tests: `packages/uikit/test/coverage-components.test.tsx`
- Related stories: `examples/demo/stories/patterns/commerce.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: needs reviewer
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/cards/promotional.tsx`

- Source: `packages/uikit/src/cards/promotional.tsx`
- Category: composite
- Related tests: `packages/uikit/test/coverage-components.test.tsx`
- Related stories: `examples/demo/stories/patterns/commerce.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: needs reviewer
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/feedback.tsx`

- Source: `packages/uikit/src/feedback.tsx`
- Category: composite
- Related tests: `packages/uikit/test/coverage-components.test.tsx`, `packages/uikit/test/m5-display.test.tsx`
- Related stories: `examples/demo/stories/tokens/feedback-indicators.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: split
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/gestures.tsx`

- Source: `packages/uikit/src/gestures.tsx`
- Category: composite
- Related tests: `packages/uikit/test/m3-gestures.test.tsx`
- Related stories: `examples/demo/stories/components/lists/lists.stories.tsx`, `examples/demo/stories/components/overlays/overlays.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: split
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/layout.tsx`

- Source: `packages/uikit/src/layout.tsx`
- Category: composite
- Related tests: `packages/uikit/test/coverage-components.test.tsx`, `packages/uikit/test/m6-nav.test.tsx`
- Related stories: `examples/demo/stories/templates/page-shell.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: move
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/lists.tsx`

- Source: `packages/uikit/src/lists.tsx`
- Category: composite
- Related tests: `packages/uikit/test/coverage-components.test.tsx`, `packages/uikit/test/m5-display.test.tsx`, `packages/uikit/test/m0-api.test.tsx`
- Related stories: `examples/demo/stories/components/lists/lists.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: split
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/navigation.tsx`

- Source: `packages/uikit/src/navigation.tsx`
- Category: composite
- Related tests: `packages/uikit/test/m2-roving.test.tsx`, `packages/uikit/test/m6-nav.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`
- Related stories: `examples/demo/stories/templates/page-shell.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: split
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/nav.tsx`

- Source: `packages/uikit/src/nav.tsx`
- Category: composite
- Related tests: `packages/uikit/test/m6-nav.test.tsx`
- Related stories: `examples/demo/stories/templates/page-shell.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: move
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/carousel.tsx`

- Source: `packages/uikit/src/carousel.tsx`
- Category: composite
- Related tests: `packages/uikit/test/coverage-components.test.tsx`, `packages/uikit/test/m5-display.test.tsx`
- Related stories: `examples/demo/stories/components/media/avatar-image.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: move
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/chat.tsx`

- Source: `packages/uikit/src/chat.tsx`
- Category: composite
- Related tests: `packages/uikit/test/m7-patterns.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`
- Related stories: `examples/demo/stories/patterns/messaging.stories.tsx`
- Related docs: `docs/site/pages/components.md`, `docs/site/pages/recipes.md`
- Current status: needs reviewer
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет
