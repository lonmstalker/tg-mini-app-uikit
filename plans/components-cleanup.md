# Cleanup Candidates Inventory

## Scope

This document lists files and surfaces that may be too domain-specific for `packages/uikit/src` or too tied to demo behavior. It does not authorize deletion by itself. Every cleanup candidate requires TDD-backed public API decisions, story/docs replacement, visual evidence, and reviewer-subagent approval.

## Global Cleanup Rules

- Do not delete `examples/demo` in the same task as this harness.
- Do not delete Storybook evidence until equivalent stories or visual tests exist elsewhere.
- Do not remove API exports without updating `packages/uikit/test/api-surface.test.ts`, the API snapshot, docs, recipes, and migration notes.
- If a source file is moved to demo-only, first prove no reusable UIKit consumer contract depends on it.

## Source Candidates

### `packages/uikit/src/patterns/gamification.tsx`

- Source: `packages/uikit/src/patterns/gamification.tsx`
- Category: cleanup
- Related tests: `packages/uikit/test/m7-patterns.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`
- Related stories: None found in current inventory
- Related docs: `docs/site/pages/components.md`
- Current status: demo-only candidate
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/cards/product.tsx`

- Source: `packages/uikit/src/cards/product.tsx`
- Category: cleanup
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
- Category: cleanup
- Related tests: `packages/uikit/test/coverage-components.test.tsx`
- Related stories: `examples/demo/stories/patterns/commerce.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: needs reviewer
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/chat.tsx`

- Source: `packages/uikit/src/chat.tsx`
- Category: cleanup
- Related tests: `packages/uikit/test/m7-patterns.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`
- Related stories: `examples/demo/stories/patterns/messaging.stories.tsx`
- Related docs: `docs/site/pages/recipes.md`
- Current status: needs reviewer
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/confetti.tsx`

- Source: `packages/uikit/src/confetti.tsx`
- Category: cleanup
- Related tests: `packages/uikit/test/m7-patterns.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`
- Related stories: None found in current inventory
- Related docs: `docs/site/pages/components.md`
- Current status: needs reviewer
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

## Demo Workspace Candidates

These are not `src` files and must not be deleted by this harness task. They are listed because future cleanup may need to move app-specific behavior out of package source or preserve evidence before deleting demo code.

- `examples/demo/src/apps/game/GameApp.tsx`: gamification showcase tied to `TKXPHeader`, `TKLeaderboard`, and rewards behavior.
- `examples/demo/src/apps/arcade/ArcadeApp.tsx`: narrow app/game showcase, useful for visual stress but not reusable UIKit source.
- `examples/demo/src/apps/stars/StarsApp.tsx`: Stars checkout demo, useful as recipe or template evidence.
- `examples/demo/src/apps/shop/ShopApp.tsx`: commerce app flow, currently important visual and recorder evidence.
- `examples/demo/src/apps/platform/PlatformApp.tsx`: Telegram runtime lab, important for platform evidence.
- `examples/demo/src/apps/gallery/GalleryApp.tsx`: e2e fixture and component inventory surface.
- `examples/demo/stories`: current Storybook evidence. Keep until replacement exists.

## Future Cleanup Tasks

- Decide whether gamification belongs in reusable templates or demo-only examples.
- Decide whether product and promotional card variants should become generic card primitives plus examples.
- Decide whether chat belongs in composites, templates, or recipes.
- Decide whether confetti belongs in reusable source or only demo/app recipes.
- Replace every cleanup candidate with tests, stories, docs, or migration notes before removing public exports.
