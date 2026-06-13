# Foundation and Runtime Inventory

## Scope

Foundation files support package entrypoints, theming, localization, Telegram runtime integration, SSR safety, shared option models, and internal helpers. They are not page templates or demo code, but many visual components depend on them.

## Shared Evidence

- Unit tests: `packages/uikit/test/api-surface.test.ts`, `packages/uikit/test/consumer-imports.test.tsx`, `packages/uikit/test/ssr.test.tsx`, `packages/uikit/test/coverage-infrastructure.test.tsx`
- Telegram tests: `packages/uikit/test/telegram-buttons-events.test.tsx`, `packages/uikit/test/telegram-capabilities.test.tsx`, `packages/uikit/test/telegram-runtime-policy.test.tsx`, `packages/uikit/test/telegram-storage-initdata.test.tsx`, `packages/uikit/test/main-button.test.tsx`
- API snapshot: `packages/uikit/test/__snapshots__/api-surface.test.ts.snap`
- Docs: `docs/site/pages/api-reference.md`, `docs/site/pages/getting-started.md`, `docs/site/pages/telegram-platform.md`, `docs/site/pages/theming.md`
- Visual/e2e evidence: `e2e/platform.spec.ts`, `e2e/tokens.spec.ts`, `e2e/i18n.spec.ts`, `e2e/design.spec.ts`

## Entries

### `packages/uikit/src/index.ts`

- Source: `packages/uikit/src/index.ts`
- Category: foundation
- Related tests: `packages/uikit/test/api-surface.test.ts`, `packages/uikit/test/consumer-imports.test.tsx`, `packages/uikit/test/ssr.test.tsx`
- Related stories: `examples/demo/stories`
- Related docs: `docs/site/pages/api-reference.md`, `docs/site/pages/getting-started.md`
- Current status: split
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/global.d.ts`

- Source: `packages/uikit/src/global.d.ts`
- Category: foundation
- Related tests: `packages/uikit/test/ssr.test.tsx`, `packages/uikit/test/consumer-imports.test.tsx`
- Related stories: None found in current inventory
- Related docs: `docs/site/pages/getting-started.md`
- Current status: keep
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/theme.tsx`

- Source: `packages/uikit/src/theme.tsx`
- Category: foundation
- Related tests: `packages/uikit/test/tokens-contract.test.ts`, `packages/uikit/test/coverage-infrastructure.test.tsx`
- Related stories: `examples/demo/stories/tokens/actions.stories.tsx`, `examples/demo/stories/tokens/typography-accessibility.stories.tsx`
- Related docs: `docs/site/pages/theming.md`
- Current status: move
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/i18n.tsx`

- Source: `packages/uikit/src/i18n.tsx`
- Category: foundation
- Related tests: `packages/uikit/test/i18n.test.tsx`
- Related stories: `examples/demo/stories/tokens/typography-accessibility.stories.tsx`
- Related docs: `docs/site/pages/components.md`, `docs/site/pages/recipes.md`
- Current status: move
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/options.ts`

- Source: `packages/uikit/src/options.ts`
- Category: foundation
- Related tests: `packages/uikit/test/api-surface.test.ts`, `packages/uikit/test/coverage-components.test.tsx`
- Related stories: `examples/demo/stories/components/forms/inputs.stories.tsx`, `examples/demo/stories/components/forms/choice-controls.stories.tsx`
- Related docs: `docs/site/pages/api-reference.md`, `docs/site/pages/components.md`
- Current status: move
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/telegram.tsx`

- Source: `packages/uikit/src/telegram.tsx`
- Category: foundation
- Related tests: `packages/uikit/test/telegram-runtime-policy.test.tsx`, `packages/uikit/test/consumer-imports.test.tsx`
- Related stories: None found in current inventory
- Related docs: `docs/site/pages/telegram-platform.md`, `docs/site/pages/api-reference.md`
- Current status: split
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/telegram/provider.tsx`

- Source: `packages/uikit/src/telegram/provider.tsx`
- Category: foundation
- Related tests: `packages/uikit/test/telegram-runtime-policy.test.tsx`, `packages/uikit/test/main-button.test.tsx`, `packages/uikit/test/ssr.test.tsx`
- Related stories: None found in current inventory
- Related docs: `docs/site/pages/telegram-platform.md`
- Current status: move
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/telegram/buttons.ts`

- Source: `packages/uikit/src/telegram/buttons.ts`
- Category: foundation
- Related tests: `packages/uikit/test/telegram-buttons-events.test.tsx`, `packages/uikit/test/main-button.test.tsx`
- Related stories: None found in current inventory
- Related docs: `docs/site/pages/telegram-platform.md`
- Current status: move
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/telegram/capabilities.ts`

- Source: `packages/uikit/src/telegram/capabilities.ts`
- Category: foundation
- Related tests: `packages/uikit/test/telegram-capabilities.test.tsx`, `packages/uikit/test/telegram-storage-initdata.test.tsx`
- Related stories: None found in current inventory
- Related docs: `docs/site/pages/telegram-platform.md`
- Current status: split
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/telegram/device.ts`

- Source: `packages/uikit/src/telegram/device.ts`
- Category: foundation
- Related tests: `packages/uikit/test/telegram-capabilities.test.tsx`, `packages/uikit/test/telegram-runtime-policy.test.tsx`
- Related stories: None found in current inventory
- Related docs: `docs/site/pages/telegram-platform.md`
- Current status: split
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/telegram/identity.ts`

- Source: `packages/uikit/src/telegram/identity.ts`
- Category: foundation
- Related tests: `packages/uikit/test/telegram-capabilities.test.tsx`, `packages/uikit/test/telegram-runtime-policy.test.tsx`
- Related stories: None found in current inventory
- Related docs: `docs/site/pages/telegram-platform.md`
- Current status: move
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/telegram/layout.ts`

- Source: `packages/uikit/src/telegram/layout.ts`
- Category: foundation
- Related tests: `packages/uikit/test/telegram-runtime-policy.test.tsx`, `packages/uikit/test/coverage-infrastructure.test.tsx`
- Related stories: None found in current inventory
- Related docs: `docs/site/pages/telegram-platform.md`, `docs/site/pages/theming.md`
- Current status: move
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/telegram/storage.ts`

- Source: `packages/uikit/src/telegram/storage.ts`
- Category: foundation
- Related tests: `packages/uikit/test/telegram-storage-initdata.test.tsx`, `packages/uikit/test/telegram-capabilities.test.tsx`
- Related stories: None found in current inventory
- Related docs: `docs/site/pages/telegram-platform.md`
- Current status: move
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/telegram/types.ts`

- Source: `packages/uikit/src/telegram/types.ts`
- Category: foundation
- Related tests: `packages/uikit/test/telegram-runtime-policy.test.tsx`, `packages/uikit/test/api-surface.test.ts`
- Related stories: None found in current inventory
- Related docs: `docs/site/pages/telegram-platform.md`, `docs/site/pages/api-reference.md`
- Current status: split
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/internal/dom.ts`

- Source: `packages/uikit/src/internal/dom.ts`
- Category: foundation
- Related tests: `packages/uikit/test/m0-api.test.tsx`, `packages/uikit/test/coverage-infrastructure.test.tsx`
- Related stories: None found in current inventory
- Related docs: None found in current inventory
- Current status: keep
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/internal/pageScroll.ts`

- Source: `packages/uikit/src/internal/pageScroll.ts`
- Category: foundation
- Related tests: `packages/uikit/test/m5-display.test.tsx`, `packages/uikit/test/m6-nav.test.tsx`
- Related stories: `examples/demo/stories/templates/page-shell.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: keep
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/internal/polymorphic.ts`

- Source: `packages/uikit/src/internal/polymorphic.ts`
- Category: foundation
- Related tests: `packages/uikit/test/m0-api.test.tsx`, `packages/uikit/test/api-surface.test.ts`
- Related stories: None found in current inventory
- Related docs: `docs/site/pages/api-reference.md`
- Current status: keep
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/internal/roving.ts`

- Source: `packages/uikit/src/internal/roving.ts`
- Category: foundation
- Related tests: `packages/uikit/test/m2-roving.test.tsx`, `packages/uikit/test/coverage-infrastructure.test.tsx`
- Related stories: `examples/demo/stories/components/forms/choice-controls.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: keep
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/internal/useControllable.ts`

- Source: `packages/uikit/src/internal/useControllable.ts`
- Category: foundation
- Related tests: `packages/uikit/test/useControllable.test.tsx`
- Related stories: None found in current inventory
- Related docs: None found in current inventory
- Current status: keep
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/internal/useDragGesture.ts`

- Source: `packages/uikit/src/internal/useDragGesture.ts`
- Category: foundation
- Related tests: `packages/uikit/test/m3-gestures.test.tsx`
- Related stories: `examples/demo/stories/components/overlays/overlays.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: keep
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет
