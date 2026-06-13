# Foundation and Runtime Inventory

## Scope

Foundation files support package entrypoints, theming, localization, Telegram runtime integration, SSR safety, shared option models, and internal helpers. They are not page templates or demo code, but many visual components depend on them.

## Shared Evidence

- Unit tests: `packages/uikit/test/foundation-reorg.test.tsx`, `packages/uikit/test/api-surface.test.ts`, `packages/uikit/test/consumer-imports.test.tsx`, `packages/uikit/test/ssr.test.tsx`, `packages/uikit/test/coverage-infrastructure.test.tsx`
- Telegram tests: `packages/uikit/test/telegram-buttons-events.test.tsx`, `packages/uikit/test/telegram-capabilities.test.tsx`, `packages/uikit/test/telegram-runtime-policy.test.tsx`, `packages/uikit/test/telegram-storage-initdata.test.tsx`, `packages/uikit/test/main-button.test.tsx`
- API snapshot: `packages/uikit/test/__snapshots__/api-surface.test.ts.snap`
- Docs: `docs/site/pages/api-reference.md`, `docs/site/pages/getting-started.md`, `docs/site/pages/telegram-platform.md`, `docs/site/pages/theming.md`
- Visual/e2e evidence: `e2e/foundation.storybook.spec.ts`, `e2e/platform.spec.ts`, `e2e/tokens.spec.ts`, `e2e/i18n.spec.ts`, `e2e/design.spec.ts`

## Entries

### `packages/uikit/src/index.ts`

- Source: `packages/uikit/src/index.ts`
- Category: foundation
- Related tests: `packages/uikit/test/foundation-reorg.test.tsx`, `packages/uikit/test/api-surface.test.ts`, `packages/uikit/test/consumer-imports.test.tsx`, `packages/uikit/test/ssr.test.tsx`
- Related stories: `packages/uikit/storybook/foundation/theme.stories.tsx`, `packages/uikit/storybook/foundation/i18n.stories.tsx`, `packages/uikit/storybook/foundation/options.stories.tsx`, `packages/uikit/storybook/foundation/telegram.stories.tsx`
- Related docs: `docs/site/pages/api-reference.md`, `docs/site/pages/getting-started.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (no token change) [x] accessibility (provider and localized controls covered by stories) [x] Telegram runtime (root export preserved through foundation barrel) [x] state machine (no state machine change) [x] testing [x] docs/stories [x] packaging [x] performance
- TDD checklist: failing test name: `publishes foundation providers from the new source category and root entrypoint`; RED command: `npm run test -w tg-mini-app-uikit -- foundation-reorg.test.tsx`; expected failure: exit 1, `Failed to resolve import "../src/foundation/theme"`; GREEN command: `npm run test -w tg-mini-app-uikit -- foundation-reorg.test.tsx` exit 0, 1 file and 3 tests passed; regression command: `npm run test -w tg-mini-app-uikit -- foundation-reorg.test.tsx api-surface.test.ts consumer-imports.test.tsx coverage-infrastructure.test.tsx telegram-runtime-policy.test.tsx telegram-buttons-events.test.tsx telegram-capabilities.test.tsx telegram-storage-initdata.test.tsx` exit 0, 8 files and 83 tests passed; `npm run typecheck -w tg-mini-app-uikit` exit 0; `npm run check:stories` exit 0 with 38/38 atom/foundation exports represented
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: Storybook smoke added for foundation theme, i18n, options, and Telegram runtime; reviewer visual pass remains open
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
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
- Artifact checklist: [ ] unit test [ ] Storybook [ ] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/foundation/theme.tsx`

- Source: `packages/uikit/src/foundation/theme.tsx`
- Category: foundation
- Related tests: `packages/uikit/test/foundation-reorg.test.tsx`, `packages/uikit/test/tokens-contract.test.ts`, `packages/uikit/test/coverage-infrastructure.test.tsx`
- Related stories: `packages/uikit/storybook/foundation/theme.stories.tsx`
- Related docs: `docs/site/pages/theming.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (theme variable contract preserved) [x] accessibility (provider story uses accessible controls) [x] Telegram runtime (`telegram` class contract preserved) [x] state machine (not applicable) [x] testing [x] docs/stories [x] packaging [x] performance
- TDD checklist: failing test name: `publishes foundation providers from the new source category and root entrypoint`; RED command: `npm run test -w tg-mini-app-uikit -- foundation-reorg.test.tsx`; expected failure: exit 1, `Failed to resolve import "../src/foundation/theme"`; GREEN command: `npm run test -w tg-mini-app-uikit -- foundation-reorg.test.tsx` exit 0, 1 file and 3 tests passed; regression command: focused foundation runtime/API suite exit 0, 8 files and 83 tests passed; `npm run typecheck -w tg-mini-app-uikit` exit 0; `npm run check:stories` exit 0 with 38/38 atom/foundation exports represented
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: `foundation-theme--provider-themes` Storybook e2e smoke added; reviewer visual pass remains open
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/foundation/i18n.tsx`

- Source: `packages/uikit/src/foundation/i18n.tsx`
- Category: foundation
- Related tests: `packages/uikit/test/foundation-reorg.test.tsx`, `packages/uikit/test/i18n.test.tsx`
- Related stories: `packages/uikit/storybook/foundation/i18n.stories.tsx`
- Related docs: `docs/site/pages/components.md`, `docs/site/pages/recipes.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (not applicable) [x] accessibility (localized labels rendered through controls) [x] Telegram runtime (not applicable) [x] state machine (not applicable) [x] testing [x] docs/stories [x] packaging [x] performance
- TDD checklist: failing test name: `renders theme, locale, options, and Telegram runtime surfaces from foundation modules`; RED command: `npm run test -w tg-mini-app-uikit -- foundation-reorg.test.tsx`; expected failure: exit 1, `Failed to resolve import "../src/foundation/theme"` before the foundation category existed; GREEN command: `npm run test -w tg-mini-app-uikit -- foundation-reorg.test.tsx` exit 0, 1 file and 3 tests passed; regression command: focused foundation runtime/API suite exit 0, 8 files and 83 tests passed; `npm run typecheck -w tg-mini-app-uikit` exit 0; `npm run check:stories` exit 0 with 38/38 atom/foundation exports represented
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: `foundation-i18n--localized-controls` Storybook e2e smoke added; reviewer visual pass remains open
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/foundation/options.ts`

- Source: `packages/uikit/src/foundation/options.ts`
- Category: foundation
- Related tests: `packages/uikit/test/foundation-reorg.test.tsx`, `packages/uikit/test/api-surface.test.ts`, `packages/uikit/test/coverage-components.test.tsx`
- Related stories: `packages/uikit/storybook/foundation/options.stories.tsx`
- Related docs: `docs/site/pages/api-reference.md`, `docs/site/pages/components.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (not applicable) [x] accessibility (shared option model exercised through select/radio controls) [x] Telegram runtime (not applicable) [x] state machine (not applicable) [x] testing [x] docs/stories [x] packaging [x] performance
- TDD checklist: failing test name: `renders theme, locale, options, and Telegram runtime surfaces from foundation modules`; RED command: `npm run test -w tg-mini-app-uikit -- foundation-reorg.test.tsx`; expected failure: exit 1, `Failed to resolve import "../src/foundation/theme"` before the foundation category existed; GREEN command: `npm run test -w tg-mini-app-uikit -- foundation-reorg.test.tsx` exit 0, 1 file and 3 tests passed; regression command: focused foundation runtime/API suite exit 0, 8 files and 83 tests passed; `npm run typecheck -w tg-mini-app-uikit` exit 0; `npm run check:stories` exit 0 with 38/38 atom/foundation exports represented
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: `foundation-options--grouped-options` Storybook e2e smoke added; reviewer visual pass remains open
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/foundation/telegram.tsx`

- Source: `packages/uikit/src/foundation/telegram.tsx`
- Category: foundation
- Related tests: `packages/uikit/test/foundation-reorg.test.tsx`, `packages/uikit/test/telegram-runtime-policy.test.tsx`, `packages/uikit/test/consumer-imports.test.tsx`
- Related stories: `packages/uikit/storybook/foundation/telegram.stories.tsx`
- Related docs: `docs/site/pages/telegram-platform.md`, `docs/site/pages/api-reference.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (not applicable) [x] accessibility (runtime story includes visible fallback action) [x] Telegram runtime [x] state machine (native button and event lifecycles covered by existing tests) [x] testing [x] docs/stories [x] packaging [x] performance
- TDD checklist: failing test name: `publishes foundation providers from the new source category and root entrypoint`; RED command: `npm run test -w tg-mini-app-uikit -- foundation-reorg.test.tsx`; expected failure: exit 1, `Failed to resolve import "../src/foundation/theme"` before the foundation category existed; GREEN command: `npm run test -w tg-mini-app-uikit -- foundation-reorg.test.tsx` exit 0, 1 file and 3 tests passed; regression command: focused foundation runtime/API suite exit 0, 8 files and 83 tests passed; `npm run typecheck -w tg-mini-app-uikit` exit 0; `npm run check:stories` exit 0 with 38/38 atom/foundation exports represented
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: `foundation-telegram--runtime-provider` Storybook e2e smoke added; reviewer visual pass remains open
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/foundation/telegram/provider.tsx`

- Source: `packages/uikit/src/foundation/telegram/provider.tsx`
- Category: foundation
- Related tests: `packages/uikit/test/foundation-reorg.test.tsx`, `packages/uikit/test/telegram-runtime-policy.test.tsx`, `packages/uikit/test/main-button.test.tsx`, `packages/uikit/test/ssr.test.tsx`
- Related stories: `packages/uikit/storybook/foundation/telegram.stories.tsx`
- Related docs: `docs/site/pages/telegram-platform.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (not applicable) [x] accessibility (provider story renders runtime state and button) [x] Telegram runtime [x] state machine (back/haptics/provider lifecycles preserved) [x] testing [x] docs/stories [x] packaging [x] performance
- TDD checklist: failing test name: `publishes foundation providers from the new source category and root entrypoint`; RED command: `npm run test -w tg-mini-app-uikit -- foundation-reorg.test.tsx`; expected failure: exit 1, `Failed to resolve import "../src/foundation/theme"` before the foundation category existed; GREEN command: `npm run test -w tg-mini-app-uikit -- foundation-reorg.test.tsx` exit 0, 1 file and 3 tests passed; regression command: focused foundation runtime/API suite exit 0, 8 files and 83 tests passed; `npm run typecheck -w tg-mini-app-uikit` exit 0
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: `foundation-telegram--runtime-provider` Storybook e2e smoke added; reviewer visual pass remains open
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/foundation/telegram/buttons.ts`

- Source: `packages/uikit/src/foundation/telegram/buttons.ts`
- Category: foundation
- Related tests: `packages/uikit/test/foundation-reorg.test.tsx`, `packages/uikit/test/telegram-buttons-events.test.tsx`, `packages/uikit/test/main-button.test.tsx`
- Related stories: `packages/uikit/storybook/foundation/telegram.stories.tsx`
- Related docs: `docs/site/pages/telegram-platform.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (not applicable) [x] accessibility (DOM fallback button story visible) [x] Telegram runtime [x] state machine (native button lifecycle preserved) [x] testing [x] docs/stories [x] packaging [x] performance
- TDD checklist: failing test name: `publishes foundation providers from the new source category and root entrypoint`; RED command: `npm run test -w tg-mini-app-uikit -- foundation-reorg.test.tsx`; expected failure: exit 1, `Failed to resolve import "../src/foundation/theme"` before the foundation category existed; GREEN command: `npm run test -w tg-mini-app-uikit -- foundation-reorg.test.tsx` exit 0, 1 file and 3 tests passed; regression command: focused foundation runtime/API suite exit 0, 8 files and 83 tests passed; `npm run typecheck -w tg-mini-app-uikit` exit 0
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: `foundation-telegram--runtime-provider` Storybook e2e smoke added; reviewer visual pass remains open
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/foundation/telegram/capabilities.ts`

- Source: `packages/uikit/src/foundation/telegram/capabilities.ts`
- Category: foundation
- Related tests: `packages/uikit/test/foundation-reorg.test.tsx`, `packages/uikit/test/telegram-capabilities.test.tsx`, `packages/uikit/test/telegram-storage-initdata.test.tsx`
- Related stories: `packages/uikit/storybook/foundation/telegram.stories.tsx`
- Related docs: `docs/site/pages/telegram-platform.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (not applicable) [x] accessibility (not a visual element) [x] Telegram runtime [x] state machine (async capability states preserved) [x] testing [x] docs/stories [x] packaging [x] performance
- TDD checklist: failing test name: `publishes foundation providers from the new source category and root entrypoint`; RED command: `npm run test -w tg-mini-app-uikit -- foundation-reorg.test.tsx`; expected failure: exit 1, `Failed to resolve import "../src/foundation/theme"` before the foundation category existed; GREEN command: `npm run test -w tg-mini-app-uikit -- foundation-reorg.test.tsx` exit 0, 1 file and 3 tests passed; regression command: focused foundation runtime/API suite exit 0, 8 files and 83 tests passed; `npm run typecheck -w tg-mini-app-uikit` exit 0
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: runtime/provider smoke is represented by `foundation-telegram--runtime-provider`; reviewer visual pass remains open
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/foundation/telegram/device.ts`

- Source: `packages/uikit/src/foundation/telegram/device.ts`
- Category: foundation
- Related tests: `packages/uikit/test/foundation-reorg.test.tsx`, `packages/uikit/test/telegram-capabilities.test.tsx`, `packages/uikit/test/telegram-runtime-policy.test.tsx`
- Related stories: `packages/uikit/storybook/foundation/telegram.stories.tsx`
- Related docs: `docs/site/pages/telegram-platform.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (not applicable) [x] accessibility (not a visual element) [x] Telegram runtime [x] state machine (keyboard/device async states preserved) [x] testing [x] docs/stories [x] packaging [x] performance
- TDD checklist: failing test name: `publishes foundation providers from the new source category and root entrypoint`; RED command: `npm run test -w tg-mini-app-uikit -- foundation-reorg.test.tsx`; expected failure: exit 1, `Failed to resolve import "../src/foundation/theme"` before the foundation category existed; GREEN command: `npm run test -w tg-mini-app-uikit -- foundation-reorg.test.tsx` exit 0, 1 file and 3 tests passed; regression command: focused foundation runtime/API suite exit 0, 8 files and 83 tests passed; `npm run typecheck -w tg-mini-app-uikit` exit 0
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: runtime/provider smoke is represented by `foundation-telegram--runtime-provider`; reviewer visual pass remains open
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/foundation/telegram/identity.ts`

- Source: `packages/uikit/src/foundation/telegram/identity.ts`
- Category: foundation
- Related tests: `packages/uikit/test/foundation-reorg.test.tsx`, `packages/uikit/test/telegram-capabilities.test.tsx`, `packages/uikit/test/telegram-runtime-policy.test.tsx`
- Related stories: `packages/uikit/storybook/foundation/telegram.stories.tsx`
- Related docs: `docs/site/pages/telegram-platform.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (not applicable) [x] accessibility (not a visual element) [x] Telegram runtime [x] state machine (identity async states preserved) [x] testing [x] docs/stories [x] packaging [x] performance
- TDD checklist: failing test name: `publishes foundation providers from the new source category and root entrypoint`; RED command: `npm run test -w tg-mini-app-uikit -- foundation-reorg.test.tsx`; expected failure: exit 1, `Failed to resolve import "../src/foundation/theme"` before the foundation category existed; GREEN command: `npm run test -w tg-mini-app-uikit -- foundation-reorg.test.tsx` exit 0, 1 file and 3 tests passed; regression command: focused foundation runtime/API suite exit 0, 8 files and 83 tests passed; `npm run typecheck -w tg-mini-app-uikit` exit 0
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: runtime/provider smoke is represented by `foundation-telegram--runtime-provider`; reviewer visual pass remains open
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/foundation/telegram/layout.ts`

- Source: `packages/uikit/src/foundation/telegram/layout.ts`
- Category: foundation
- Related tests: `packages/uikit/test/foundation-reorg.test.tsx`, `packages/uikit/test/telegram-runtime-policy.test.tsx`, `packages/uikit/test/coverage-infrastructure.test.tsx`
- Related stories: `packages/uikit/storybook/foundation/theme.stories.tsx`, `packages/uikit/storybook/foundation/telegram.stories.tsx`
- Related docs: `docs/site/pages/telegram-platform.md`, `docs/site/pages/theming.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (Telegram theme hook contract preserved) [x] accessibility (layout hooks not visual by themselves) [x] Telegram runtime [x] state machine (viewport/safe-area sync preserved) [x] testing [x] docs/stories [x] packaging [x] performance
- TDD checklist: failing test name: `renders theme, locale, options, and Telegram runtime surfaces from foundation modules`; RED command: `npm run test -w tg-mini-app-uikit -- foundation-reorg.test.tsx`; expected failure: exit 1, `Failed to resolve import "../src/foundation/theme"` before the foundation category existed; GREEN command: `npm run test -w tg-mini-app-uikit -- foundation-reorg.test.tsx` exit 0, 1 file and 3 tests passed; regression command: focused foundation runtime/API suite exit 0, 8 files and 83 tests passed; `npm run typecheck -w tg-mini-app-uikit` exit 0
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: theme and Telegram provider smoke stories cover the provider/runtime surface; reviewer visual pass remains open
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/foundation/telegram/storage.ts`

- Source: `packages/uikit/src/foundation/telegram/storage.ts`
- Category: foundation
- Related tests: `packages/uikit/test/foundation-reorg.test.tsx`, `packages/uikit/test/telegram-storage-initdata.test.tsx`, `packages/uikit/test/telegram-capabilities.test.tsx`
- Related stories: `packages/uikit/storybook/foundation/telegram.stories.tsx`
- Related docs: `docs/site/pages/telegram-platform.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (not applicable) [x] accessibility (not a visual element) [x] Telegram runtime [x] state machine (storage fallback/async contract preserved) [x] testing [x] docs/stories [x] packaging [x] performance
- TDD checklist: failing test name: `renders theme, locale, options, and Telegram runtime surfaces from foundation modules`; RED command: `npm run test -w tg-mini-app-uikit -- foundation-reorg.test.tsx`; expected failure: exit 1, `Failed to resolve import "../src/foundation/theme"` before the foundation category existed; GREEN command: `npm run test -w tg-mini-app-uikit -- foundation-reorg.test.tsx` exit 0, 1 file and 3 tests passed; regression command: focused foundation runtime/API suite exit 0, 8 files and 83 tests passed; `npm run typecheck -w tg-mini-app-uikit` exit 0
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: runtime/provider smoke is represented by `foundation-telegram--runtime-provider`; reviewer visual pass remains open
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/foundation/telegram/types.ts`

- Source: `packages/uikit/src/foundation/telegram/types.ts`
- Category: foundation
- Related tests: `packages/uikit/test/foundation-reorg.test.tsx`, `packages/uikit/test/telegram-runtime-policy.test.tsx`, `packages/uikit/test/api-surface.test.ts`
- Related stories: `packages/uikit/storybook/foundation/telegram.stories.tsx`
- Related docs: `docs/site/pages/telegram-platform.md`, `docs/site/pages/api-reference.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (type-only) [x] accessibility (type-only) [x] Telegram runtime (structural types preserved) [x] state machine (async status types preserved) [x] testing [x] docs/stories [x] packaging [x] performance
- TDD checklist: failing test name: `keeps foundation type contracts available at their new source paths`; RED command: `npm run test -w tg-mini-app-uikit -- foundation-reorg.test.tsx`; expected failure: exit 1, `Failed to resolve import "../src/foundation/theme"` before the foundation category existed; GREEN command: `npm run test -w tg-mini-app-uikit -- foundation-reorg.test.tsx` exit 0, 1 file and 3 tests passed; regression command: focused foundation runtime/API suite exit 0, 8 files and 83 tests passed; `npm run typecheck -w tg-mini-app-uikit` exit 0
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: type-only move, runtime/provider smoke is represented by `foundation-telegram--runtime-provider`; reviewer visual pass remains open
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
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
- Artifact checklist: [ ] unit test [ ] Storybook [ ] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/internal/pageScroll.ts`

- Source: `packages/uikit/src/internal/pageScroll.ts`
- Category: foundation
- Related tests: `packages/uikit/test/m5-display.test.tsx`, `packages/uikit/test/m6-nav.test.tsx`
- Related stories: `packages/uikit/storybook/<category>`
- Related docs: `docs/site/pages/components.md`
- Current status: keep
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Artifact checklist: [ ] unit test [ ] Storybook [ ] e2e test
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
- Artifact checklist: [ ] unit test [ ] Storybook [ ] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/internal/roving.ts`

- Source: `packages/uikit/src/internal/roving.ts`
- Category: foundation
- Related tests: `packages/uikit/test/m2-roving.test.tsx`, `packages/uikit/test/coverage-infrastructure.test.tsx`
- Related stories: `packages/uikit/storybook/<category>`
- Related docs: `docs/site/pages/components.md`
- Current status: keep
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Artifact checklist: [ ] unit test [ ] Storybook [ ] e2e test
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
- Artifact checklist: [ ] unit test [ ] Storybook [ ] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/internal/useDragGesture.ts`

- Source: `packages/uikit/src/internal/useDragGesture.ts`
- Category: foundation
- Related tests: `packages/uikit/test/m3-gestures.test.tsx`
- Related stories: `packages/uikit/storybook/<category>`
- Related docs: `docs/site/pages/components.md`
- Current status: keep
- UIKit checklist: [ ] classification [ ] API contract [ ] tokens [ ] accessibility [ ] Telegram runtime [ ] state machine [ ] testing [ ] docs/stories [ ] packaging [ ] performance
- TDD checklist: failing test name: blank; RED command: blank; expected failure: blank; GREEN command: blank; regression command: blank
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout
- Artifact checklist: [ ] unit test [ ] Storybook [ ] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет
