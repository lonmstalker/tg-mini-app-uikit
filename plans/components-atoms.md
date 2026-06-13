# Atoms and UI Elements Inventory

## Scope

Atoms are low-level visual and interactive surfaces: buttons, icon buttons, inputs, selection controls, primitive display elements, icons, badges, tappable/link-like elements, and media primitives. They should remain reusable and free from app-specific behavior.

## Shared Evidence

- Unit tests: `packages/uikit/test/coverage-components.test.tsx`, `packages/uikit/test/controls.test.tsx`, `packages/uikit/test/m0-api.test.tsx`, `packages/uikit/test/m2-roving.test.tsx`, `packages/uikit/test/m4-forms.test.tsx`, `packages/uikit/test/m5-display.test.tsx`, `packages/uikit/test/otp.test.tsx`, `packages/uikit/test/a11y-semantics.test.tsx`
- Stories: `examples/demo/stories/components/forms/choice-controls.stories.tsx`, `examples/demo/stories/components/forms/inputs.stories.tsx`, `examples/demo/stories/components/forms/date-time.stories.tsx`, `examples/demo/stories/components/media/avatar-image.stories.tsx`, `examples/demo/stories/tokens/actions.stories.tsx`, `examples/demo/stories/tokens/feedback-indicators.stories.tsx`
- Docs: `docs/site/pages/components.md`, `docs/site/pages/api-reference.md`, `docs/site/pages/theming.md`
- Visual/e2e evidence: `e2e/design.spec.ts`, `e2e/forms.spec.ts`, `e2e/states.spec.ts`, `e2e/display.spec.ts`, `e2e/contrast-modes.spec.ts`, `e2e/reflow.spec.ts`

## Entries

### `packages/uikit/src/buttons.tsx`

- Source: `packages/uikit/src/buttons.tsx`
- Category: atom
- Related tests: `packages/uikit/test/main-button.test.tsx`, `packages/uikit/test/m0-api.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`
- Related stories: `examples/demo/stories/tokens/actions.stories.tsx`
- Related docs: `docs/site/pages/components.md`, `docs/site/pages/api-reference.md`
- Current status: split
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/controls.tsx`

- Source: `packages/uikit/src/controls.tsx`
- Category: atom
- Related tests: `packages/uikit/test/controls.test.tsx`, `packages/uikit/test/api-surface.test.ts`
- Related stories: `examples/demo/stories/components/forms/choice-controls.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: move
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/controls/chips.tsx`

- Source: `packages/uikit/src/controls/chips.tsx`
- Category: atom
- Related tests: `packages/uikit/test/m2-roving.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`
- Related stories: `examples/demo/stories/components/forms/choice-controls.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: move
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/controls/selection.tsx`

- Source: `packages/uikit/src/controls/selection.tsx`
- Category: atom
- Related tests: `packages/uikit/test/controls.test.tsx`, `packages/uikit/test/m2-roving.test.tsx`, `packages/uikit/test/a11y-semantics.test.tsx`
- Related stories: `examples/demo/stories/components/forms/choice-controls.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: split
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/controls/sliders.tsx`

- Source: `packages/uikit/src/controls/sliders.tsx`
- Category: atom
- Related tests: `packages/uikit/test/coverage-components.test.tsx`, `packages/uikit/test/api-surface.test.ts`
- Related stories: `examples/demo/stories/components/forms/choice-controls.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: move
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/controls/stepper-rating.tsx`

- Source: `packages/uikit/src/controls/stepper-rating.tsx`
- Category: atom
- Related tests: `packages/uikit/test/controls.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`
- Related stories: `examples/demo/stories/components/forms/choice-controls.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: split
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/inputs.tsx`

- Source: `packages/uikit/src/inputs.tsx`
- Category: atom
- Related tests: `packages/uikit/test/api-surface.test.ts`, `packages/uikit/test/coverage-components.test.tsx`
- Related stories: `examples/demo/stories/components/forms/inputs.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: move
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/inputs/base.tsx`

- Source: `packages/uikit/src/inputs/base.tsx`
- Category: atom
- Related tests: `packages/uikit/test/coverage-components.test.tsx`, `packages/uikit/test/a11y-semantics.test.tsx`
- Related stories: `examples/demo/stories/components/forms/inputs.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: split
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/inputs/choices.tsx`

- Source: `packages/uikit/src/inputs/choices.tsx`
- Category: atom
- Related tests: `packages/uikit/test/coverage-components.test.tsx`, `packages/uikit/test/m2-roving.test.tsx`
- Related stories: `examples/demo/stories/components/forms/choice-controls.stories.tsx`, `examples/demo/stories/components/forms/inputs.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: move
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/inputs/file-search.tsx`

- Source: `packages/uikit/src/inputs/file-search.tsx`
- Category: atom
- Related tests: `packages/uikit/test/coverage-components.test.tsx`, `packages/uikit/test/m4-forms.test.tsx`
- Related stories: `examples/demo/stories/components/forms/inputs.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: split
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/inputs/select-otp.tsx`

- Source: `packages/uikit/src/inputs/select-otp.tsx`
- Category: atom
- Related tests: `packages/uikit/test/coverage-components.test.tsx`, `packages/uikit/test/otp.test.tsx`, `packages/uikit/test/m4-forms.test.tsx`
- Related stories: `examples/demo/stories/components/forms/inputs.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: split
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/display.tsx`

- Source: `packages/uikit/src/display.tsx`
- Category: atom
- Related tests: `packages/uikit/test/m5-display.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`, `packages/uikit/test/a11y-semantics.test.tsx`
- Related stories: `examples/demo/stories/components/media/avatar-image.stories.tsx`, `examples/demo/stories/tokens/feedback-indicators.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: split
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/icons.tsx`

- Source: `packages/uikit/src/icons.tsx`
- Category: atom
- Related tests: `packages/uikit/test/coverage-components.test.tsx`, `packages/uikit/test/api-surface.test.ts`
- Related stories: `examples/demo/stories/tokens/actions.stories.tsx`
- Related docs: `docs/site/pages/components.md`, `docs/site/pages/api-reference.md`
- Current status: move
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/service.tsx`

- Source: `packages/uikit/src/service.tsx`
- Category: atom
- Related tests: `packages/uikit/test/m0-api.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`
- Related stories: `examples/demo/stories/tokens/actions.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: move
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет
