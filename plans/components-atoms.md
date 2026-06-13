# Atoms and UI Elements Inventory

## Scope

Atoms are low-level visual and interactive surfaces: buttons, icon buttons, inputs, selection controls, primitive display elements, icons, badges, tappable/link-like elements, and media primitives. They should remain reusable and free from app-specific behavior.

## Shared Evidence

- Unit tests: `packages/uikit/test/coverage-components.test.tsx`, `packages/uikit/test/controls.test.tsx`, `packages/uikit/test/m0-api.test.tsx`, `packages/uikit/test/m2-roving.test.tsx`, `packages/uikit/test/m4-forms.test.tsx`, `packages/uikit/test/m5-display.test.tsx`, `packages/uikit/test/otp.test.tsx`, `packages/uikit/test/a11y-semantics.test.tsx`
- Stories: `packages/uikit/storybook/atoms/buttons.stories.tsx`, `packages/uikit/storybook/atoms/controls.stories.tsx`, `packages/uikit/storybook/atoms/display.stories.tsx`, `packages/uikit/storybook/atoms/inputs.stories.tsx`, `packages/uikit/storybook/atoms/icons.stories.tsx`, `packages/uikit/storybook/atoms/service.stories.tsx`
- Docs: `docs/site/pages/components.md`, `docs/site/pages/api-reference.md`, `docs/site/pages/theming.md`
- Visual/e2e evidence: `e2e/design.spec.ts`, `e2e/forms.spec.ts`, `e2e/states.spec.ts`, `e2e/display.spec.ts`, `e2e/contrast-modes.spec.ts`, `e2e/reflow.spec.ts`

## Entries

### `packages/uikit/src/buttons.tsx`

- Source: `packages/uikit/src/buttons.tsx`
- Target category paths: `packages/uikit/src/atoms/buttons.tsx`, `packages/uikit/src/atoms/buttons/button.tsx`, `packages/uikit/src/atoms/buttons/icon-button.tsx`, `packages/uikit/src/atoms/buttons/inline-buttons.tsx`, `packages/uikit/src/atoms/buttons/spinner.tsx`, `packages/uikit/src/atoms/buttons/main-button.tsx`
- Category: atom
- Related tests: `packages/uikit/test/buttons-reorg.test.tsx`, `packages/uikit/test/main-button.test.tsx`, `packages/uikit/test/m0-api.test.tsx`, `packages/uikit/test/api-surface.test.ts`, `packages/uikit/test/consumer-imports.test.tsx`, `packages/uikit/test/m2-roving.test.tsx`, `packages/uikit/test/m5-display.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`
- Related stories: `packages/uikit/storybook/atoms/buttons.stories.tsx`
- Related docs: `docs/site/pages/components.md`, `docs/site/pages/api-reference.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (no token change) [x] accessibility (button labels/loading/badge semantics preserved) [x] Telegram runtime (haptics provider behavior preserved for `TKMainButton`) [x] state machine (main button idle/loading/success and inline roving behavior preserved) [x] testing [x] docs/stories [x] packaging [x] performance
- TDD checklist: failing test name: `exports buttons from the atom category and root package`; RED command: `npm run test -w tg-mini-app-uikit -- buttons-reorg.test.tsx`; expected failure: exit 1, `Failed to resolve import "../src/atoms/buttons"`; GREEN command: `npm run test -w tg-mini-app-uikit -- buttons-reorg.test.tsx main-button.test.tsx m0-api.test.tsx api-surface.test.ts consumer-imports.test.tsx m2-roving.test.tsx m5-display.test.tsx coverage-components.test.tsx` exit 0, 8 files and 220 tests passed; regression command: `npm run typecheck -w tg-mini-app-uikit` exit 0; `npm run check:stories` exit 0 with 26/26 current atom exports represented; `npm run test:e2e` exit 0 with 15 Storybook atom smoke tests passing
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: Storybook e2e smoke passed for variants, icon buttons, inline buttons, main button states, and spinner; reviewer visual pass remains open
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/controls.tsx`

- Source: `packages/uikit/src/controls.tsx`
- Target category path: `packages/uikit/src/atoms/controls.tsx`
- Category: atom
- Related tests: `packages/uikit/test/controls-reorg.test.tsx`, `packages/uikit/test/controls.test.tsx`, `packages/uikit/test/api-surface.test.ts`, `packages/uikit/test/m2-roving.test.tsx`, `packages/uikit/test/m4-forms.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`
- Related stories: `packages/uikit/storybook/atoms/controls.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (no token change) [x] accessibility (behavior preserved) [x] Telegram runtime (not applicable) [x] state machine (implementation modules not moved in this slice) [x] testing [x] docs/stories (no public docs/story change needed) [x] packaging [x] performance
- TDD checklist: failing test name: `exports controls from the atom category and root package`; RED command: `npm run test -w tg-mini-app-uikit -- controls-reorg.test.tsx`; expected failure: exit 1, `Failed to resolve import "../src/atoms/controls"`; GREEN command: initial `npm run test -w tg-mini-app-uikit -- controls-reorg.test.tsx` exit 0, 1 file and 1 test passed; current rerun after chips test added exits 0, 1 file and 2 tests passed; regression command: `npm run test -w tg-mini-app-uikit -- controls-reorg.test.tsx controls.test.tsx m2-roving.test.tsx m4-forms.test.tsx coverage-components.test.tsx api-surface.test.ts` exit 0, 6 files and 93 tests passed; `npm run typecheck -w tg-mini-app-uikit` exit 0
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: not rerun for barrel-only category move with no JSX output, CSS, tokens, stories, runtime behavior, or implementation module move
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/controls/chips.tsx`

- Source: `packages/uikit/src/controls/chips.tsx`
- Target category path: `packages/uikit/src/atoms/controls/chips.tsx`
- Category: atom
- Related tests: `packages/uikit/test/controls-reorg.test.tsx`, `packages/uikit/test/m2-roving.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`, `packages/uikit/test/a11y-semantics.test.tsx`
- Related stories: `packages/uikit/storybook/atoms/controls.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (no token change) [x] accessibility (behavior preserved and a11y regression covered) [x] Telegram runtime (not applicable) [x] state machine (controlled/uncontrolled behavior preserved) [x] testing [x] docs/stories (no public docs/story change needed) [x] packaging [x] performance
- TDD checklist: failing test name: `exports chips from their atom module`; RED command: `npm run test -w tg-mini-app-uikit -- controls-reorg.test.tsx`; expected failure: exit 1, `Failed to resolve import "../src/atoms/controls/chips"`; GREEN command: `npm run test -w tg-mini-app-uikit -- controls-reorg.test.tsx` exit 0, 1 file and 2 tests passed; regression command: `npm run test -w tg-mini-app-uikit -- controls-reorg.test.tsx m2-roving.test.tsx coverage-components.test.tsx a11y-semantics.test.tsx` exit 0, 4 files and 44 tests passed; `npm run typecheck -w tg-mini-app-uikit` exit 0
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: not rerun for implementation move with no JSX output, CSS, token, or runtime behavior change; Storybook evidence is `packages/uikit/storybook/atoms/controls.stories.tsx`
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/controls/selection.tsx`

- Source: `packages/uikit/src/controls/selection.tsx`
- Target category paths: `packages/uikit/src/atoms/controls/checkbox.tsx`, `packages/uikit/src/atoms/controls/radio-group.tsx`, `packages/uikit/src/atoms/controls/switch.tsx`, `packages/uikit/src/atoms/controls/selection.tsx`
- Category: atom
- Related tests: `packages/uikit/test/controls-reorg.test.tsx`, `packages/uikit/test/m2-roving.test.tsx`, `packages/uikit/test/m4-forms.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`, `packages/uikit/test/a11y-semantics.test.tsx`, `packages/uikit/test/m7-patterns.test.tsx`
- Related stories: `packages/uikit/storybook/atoms/controls.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (no token change) [x] accessibility (semantics preserved and a11y regression covered) [x] Telegram runtime (haptics provider behavior preserved) [x] state machine (controlled/uncontrolled behavior preserved) [x] testing [x] docs/stories (no public docs/story change needed) [x] packaging [x] performance
- TDD checklist: failing test name: `splits selection controls into atom modules`; RED command: `npm run test -w tg-mini-app-uikit -- controls-reorg.test.tsx`; expected failure: exit 1, `Failed to resolve import "../src/atoms/controls/checkbox"`; GREEN command: `npm run test -w tg-mini-app-uikit -- controls-reorg.test.tsx` exit 0, 1 file and 3 tests passed; regression command: `npm run test -w tg-mini-app-uikit -- controls-reorg.test.tsx m2-roving.test.tsx m4-forms.test.tsx coverage-components.test.tsx a11y-semantics.test.tsx m7-patterns.test.tsx` exit 0, 6 files and 99 tests passed; `npm run typecheck -w tg-mini-app-uikit` exit 0
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: not rerun for implementation split with no JSX output, CSS, token, or runtime behavior change; Storybook evidence is `packages/uikit/storybook/atoms/controls.stories.tsx`
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/controls/sliders.tsx`

- Source: `packages/uikit/src/controls/sliders.tsx`
- Target category path: `packages/uikit/src/atoms/controls/sliders.tsx`
- Category: atom
- Related tests: `packages/uikit/test/controls-reorg.test.tsx`, `packages/uikit/test/controls.test.tsx`, `packages/uikit/test/m4-forms.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`, `packages/uikit/test/api-surface.test.ts`, `packages/uikit/test/m7-patterns.test.tsx`
- Related stories: `packages/uikit/storybook/atoms/controls.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (no token change) [x] accessibility (slider ARIA behavior preserved) [x] Telegram runtime (haptics provider behavior preserved) [x] state machine (controlled/range/pointer behavior preserved) [x] testing [x] docs/stories (no public docs/story change needed) [x] packaging [x] performance
- TDD checklist: failing test name: `exports sliders from their atom module`; RED command: `npm run test -w tg-mini-app-uikit -- controls-reorg.test.tsx`; expected failure: exit 1, `Failed to resolve import "../src/atoms/controls/sliders"`; GREEN command: `npm run test -w tg-mini-app-uikit -- controls-reorg.test.tsx` exit 0, 1 file and 4 tests passed; regression command: `npm run test -w tg-mini-app-uikit -- controls-reorg.test.tsx controls.test.tsx m4-forms.test.tsx coverage-components.test.tsx api-surface.test.ts m7-patterns.test.tsx` exit 0, 6 files and 100 tests passed; `npm run typecheck -w tg-mini-app-uikit` exit 0
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: not rerun for implementation move with no JSX output, CSS, token, or runtime behavior change; Storybook evidence is `packages/uikit/storybook/atoms/controls.stories.tsx`
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/controls/stepper-rating.tsx`

- Source: `packages/uikit/src/controls/stepper-rating.tsx`
- Target category paths: `packages/uikit/src/atoms/controls/stepper.tsx`, `packages/uikit/src/atoms/controls/rating.tsx`, `packages/uikit/src/atoms/controls/stepper-rating.tsx`
- Category: atom
- Related tests: `packages/uikit/test/controls-reorg.test.tsx`, `packages/uikit/test/controls.test.tsx`, `packages/uikit/test/m4-forms.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`, `packages/uikit/test/i18n.test.tsx`
- Related stories: `packages/uikit/storybook/atoms/controls.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (no token change) [x] accessibility (stepper/rating labels and semantics preserved) [x] Telegram runtime (not applicable) [x] state machine (editable/timer/rating hover behavior preserved) [x] testing [x] docs/stories (no public docs/story change needed) [x] packaging [x] performance
- TDD checklist: failing test name: `splits stepper and rating into atom modules`; RED command: `npm run test -w tg-mini-app-uikit -- controls-reorg.test.tsx`; expected failure: exit 1, `Failed to resolve import "../src/atoms/controls/rating"`; GREEN command: `npm run test -w tg-mini-app-uikit -- controls-reorg.test.tsx` exit 0, 1 file and 5 tests passed; regression command: `npm run test -w tg-mini-app-uikit -- controls-reorg.test.tsx controls.test.tsx m4-forms.test.tsx coverage-components.test.tsx i18n.test.tsx` exit 0, 5 files and 87 tests passed; `npm run typecheck -w tg-mini-app-uikit` exit 0
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: not rerun for implementation split with no JSX output, CSS, token, or runtime behavior change; Storybook evidence is `packages/uikit/storybook/atoms/controls.stories.tsx`
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/inputs.tsx`

- Source: `packages/uikit/src/inputs.tsx`
- Target category path: `packages/uikit/src/atoms/inputs.tsx`
- Category: atom
- Related tests: `packages/uikit/test/inputs-reorg.test.tsx`, `packages/uikit/test/api-surface.test.ts`, `packages/uikit/test/coverage-components.test.tsx`, `packages/uikit/test/m0-api.test.tsx`
- Related stories: `packages/uikit/storybook/atoms/inputs.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (no token change) [x] accessibility (implementation preserved) [x] Telegram runtime (not applicable) [x] state machine (implementation modules preserved or split later) [x] testing [x] docs/stories [x] packaging [x] performance
- TDD checklist: failing test name: `exports inputs from the atom category and root package`; RED command: `npm run test -w tg-mini-app-uikit -- inputs-reorg.test.tsx`; expected failure: exit 1, `Failed to resolve import "../src/atoms/inputs"`; GREEN command: `npm run test -w tg-mini-app-uikit -- inputs-reorg.test.tsx` exit 0, 1 file and 1 test passed; regression command: final `npm run test -w tg-mini-app-uikit -- inputs-reorg.test.tsx coverage-components.test.tsx m4-forms.test.tsx otp.test.tsx a11y-semantics.test.tsx i18n.test.tsx m0-api.test.tsx api-surface.test.ts consumer-imports.test.tsx` exit 0, 9 files and 248 tests passed; `npm run typecheck -w tg-mini-app-uikit` exit 0; `npm run check:stories` exit 0 with 21/21 atom exports represented; `npm run test:e2e` exit 0 with 11 Storybook atom smoke tests passing
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: Storybook e2e smoke passed for text, search/textarea, choice, and file/OTP stories; reviewer visual pass remains open
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/inputs/base.tsx`

- Source: `packages/uikit/src/inputs/base.tsx`
- Target category paths: `packages/uikit/src/atoms/inputs/input.tsx`, `packages/uikit/src/atoms/inputs/form-field.tsx`, `packages/uikit/src/atoms/inputs/textarea.tsx`, `packages/uikit/src/atoms/inputs/selectable.tsx`, `packages/uikit/src/atoms/inputs/base.tsx`
- Category: atom
- Related tests: `packages/uikit/test/inputs-reorg.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`, `packages/uikit/test/a11y-semantics.test.tsx`, `packages/uikit/test/m4-forms.test.tsx`
- Related stories: `packages/uikit/storybook/atoms/inputs.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (no token change) [x] accessibility (labels/descriptions preserved and a11y regression covered) [x] Telegram runtime (not applicable) [x] state machine (controlled input/selectable behavior preserved) [x] testing [x] docs/stories [x] packaging [x] performance
- TDD checklist: failing test name: `splits base inputs into atom modules`; RED command: `npm run test -w tg-mini-app-uikit -- inputs-reorg.test.tsx`; expected failure: exit 1, `Failed to resolve import "../src/atoms/inputs/base"`; GREEN command: `npm run test -w tg-mini-app-uikit -- inputs-reorg.test.tsx` exit 0, 1 file and 2 tests passed; regression command: final `npm run test -w tg-mini-app-uikit -- inputs-reorg.test.tsx coverage-components.test.tsx m4-forms.test.tsx otp.test.tsx a11y-semantics.test.tsx i18n.test.tsx m0-api.test.tsx api-surface.test.ts consumer-imports.test.tsx` exit 0, 9 files and 248 tests passed; `npm run typecheck -w tg-mini-app-uikit` exit 0
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: Storybook e2e smoke passed for text fields and search/textarea stories; reviewer visual pass remains open
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/inputs/choices.tsx`

- Source: `packages/uikit/src/inputs/choices.tsx`
- Target category path: `packages/uikit/src/atoms/inputs/choices.tsx`
- Category: atom
- Related tests: `packages/uikit/test/inputs-reorg.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`, `packages/uikit/test/m2-roving.test.tsx`, `packages/uikit/test/m4-forms.test.tsx`
- Related stories: `packages/uikit/storybook/atoms/inputs.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (no token change) [x] accessibility (combobox/listbox behavior preserved) [x] Telegram runtime (not applicable) [x] state machine (multi-select open/active/selected behavior preserved) [x] testing [x] docs/stories [x] packaging [x] performance
- TDD checklist: failing test name: `exports choices from their atom module`; RED command: `npm run test -w tg-mini-app-uikit -- inputs-reorg.test.tsx`; expected failure: exit 1, `Failed to resolve import "../src/atoms/inputs/choices"`; GREEN command: `npm run test -w tg-mini-app-uikit -- inputs-reorg.test.tsx m4-forms.test.tsx coverage-components.test.tsx m0-api.test.tsx` exit 0, 4 files and 216 tests passed; regression command: final `npm run test -w tg-mini-app-uikit -- inputs-reorg.test.tsx coverage-components.test.tsx m4-forms.test.tsx otp.test.tsx a11y-semantics.test.tsx i18n.test.tsx m0-api.test.tsx api-surface.test.ts consumer-imports.test.tsx` exit 0, 9 files and 248 tests passed; `npm run typecheck -w tg-mini-app-uikit` exit 0
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: Storybook e2e smoke passed for `atoms-inputs--choice-inputs`; reviewer visual pass remains open
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/inputs/file-search.tsx`

- Source: `packages/uikit/src/inputs/file-search.tsx`
- Target category paths: `packages/uikit/src/atoms/inputs/file-input.tsx`, `packages/uikit/src/atoms/inputs/search.tsx`, `packages/uikit/src/atoms/inputs/file-search.tsx`
- Category: atom
- Related tests: `packages/uikit/test/inputs-reorg.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`, `packages/uikit/test/m4-forms.test.tsx`, `packages/uikit/test/i18n.test.tsx`
- Related stories: `packages/uikit/storybook/atoms/inputs.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (no token change) [x] accessibility (file row/search semantics preserved) [x] Telegram runtime (not applicable) [x] state machine (file preview/drag/search focus behavior preserved) [x] testing [x] docs/stories [x] packaging [x] performance
- TDD checklist: failing test name: `splits file input and search into atom modules`; RED command: `npm run test -w tg-mini-app-uikit -- inputs-reorg.test.tsx`; expected failure: exit 1, `Failed to resolve import "../src/atoms/inputs/file-input"`; GREEN command: `npm run test -w tg-mini-app-uikit -- inputs-reorg.test.tsx coverage-components.test.tsx m4-forms.test.tsx i18n.test.tsx m0-api.test.tsx api-surface.test.ts` exit 0, 6 files and 231 tests passed; regression command: final `npm run test -w tg-mini-app-uikit -- inputs-reorg.test.tsx coverage-components.test.tsx m4-forms.test.tsx otp.test.tsx a11y-semantics.test.tsx i18n.test.tsx m0-api.test.tsx api-surface.test.ts consumer-imports.test.tsx` exit 0, 9 files and 248 tests passed; `npm run typecheck -w tg-mini-app-uikit` exit 0
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: Storybook e2e smoke passed for search/textarea and file/OTP stories; reviewer visual pass remains open
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/inputs/select-otp.tsx`

- Source: `packages/uikit/src/inputs/select-otp.tsx`
- Target category paths: `packages/uikit/src/atoms/inputs/select.tsx`, `packages/uikit/src/atoms/inputs/otp.tsx`, `packages/uikit/src/atoms/inputs/select-otp.tsx`
- Category: atom
- Related tests: `packages/uikit/test/inputs-reorg.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`, `packages/uikit/test/otp.test.tsx`, `packages/uikit/test/m4-forms.test.tsx`, `packages/uikit/test/a11y-semantics.test.tsx`
- Related stories: `packages/uikit/storybook/atoms/inputs.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (no token change) [x] accessibility (select/OTP semantics preserved) [x] Telegram runtime (not applicable) [x] state machine (select open/query/active and OTP completion behavior preserved) [x] testing [x] docs/stories [x] packaging [x] performance
- TDD checklist: failing test name: `splits select and otp into atom modules`; RED command: `npm run test -w tg-mini-app-uikit -- inputs-reorg.test.tsx`; expected failure: exit 1, `Failed to resolve import "../src/atoms/inputs/select"`; GREEN command: `npm run test -w tg-mini-app-uikit -- inputs-reorg.test.tsx coverage-components.test.tsx m4-forms.test.tsx otp.test.tsx a11y-semantics.test.tsx i18n.test.tsx m0-api.test.tsx api-surface.test.ts consumer-imports.test.tsx` exit 0, 9 files and 248 tests passed; regression command: `npm run typecheck -w tg-mini-app-uikit` exit 0; `npm run check:stories` exit 0 with 21/21 atom exports represented; `npm run test:e2e` exit 0 with 11 Storybook atom smoke tests passing
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: Storybook e2e smoke passed for choice and file/OTP stories; reviewer visual pass remains open
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/display.tsx`

- Source: `packages/uikit/src/display.tsx`
- Target category paths: `packages/uikit/src/atoms/display.tsx`, `packages/uikit/src/atoms/display/badges.tsx`, `packages/uikit/src/atoms/display/avatar.tsx`, `packages/uikit/src/atoms/display/image.tsx`, `packages/uikit/src/atoms/display/spoiler.tsx`, `packages/uikit/src/atoms/display/blockquote.tsx`
- Category: atom
- Related tests: `packages/uikit/test/display-reorg.test.tsx`, `packages/uikit/test/m5-display.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`, `packages/uikit/test/coverage-infrastructure.test.tsx`, `packages/uikit/test/m0-api.test.tsx`, `packages/uikit/test/api-surface.test.ts`, `packages/uikit/test/consumer-imports.test.tsx`, `packages/uikit/test/m7-patterns.test.tsx`
- Related stories: `packages/uikit/storybook/atoms/display.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (no token change) [x] accessibility (status/media/spoiler semantics preserved) [x] Telegram runtime (not applicable) [x] state machine (image load/error and spoiler reveal behavior preserved) [x] testing [x] docs/stories [x] packaging [x] performance
- TDD checklist: failing test name: `exports display atoms from the atom category and root package`; RED command: `npm run test -w tg-mini-app-uikit -- display-reorg.test.tsx`; expected failure: exit 1, `Failed to resolve import "../src/atoms/display"`; GREEN command: `npm run test -w tg-mini-app-uikit -- display-reorg.test.tsx m5-display.test.tsx coverage-components.test.tsx coverage-infrastructure.test.tsx m0-api.test.tsx api-surface.test.ts consumer-imports.test.tsx m7-patterns.test.tsx` exit 0, 8 files and 228 tests passed; regression command: `npm run typecheck -w tg-mini-app-uikit` exit 0; `npm run check:stories` exit 0 with 35/35 current atom exports represented; `npm run test:e2e` exit 0 with 19 Storybook atom smoke tests passing
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: Storybook e2e smoke passed for badges/counters, avatars, media, spoiler, and blockquote stories; reviewer visual pass remains open
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/icons.tsx`

- Source: `packages/uikit/src/icons.tsx`
- Target category path: `packages/uikit/src/atoms/icons.tsx`
- Category: atom
- Related tests: `packages/uikit/test/icons-reorg.test.tsx`, `packages/uikit/test/m5-display.test.tsx`, `packages/uikit/test/api-surface.test.ts`, `packages/uikit/test/coverage-components.test.tsx`
- Related stories: `packages/uikit/storybook/atoms/icons.stories.tsx`
- Related docs: `docs/site/pages/components.md`, `docs/site/pages/api-reference.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (no token change) [x] accessibility (behavior preserved) [x] Telegram runtime (not applicable) [x] state machine (stateless) [x] testing [x] docs/stories (story evidence corrected; no public docs/story change needed) [x] packaging [x] performance
- TDD checklist: failing test name: `exports icons from the atom category and root package`; RED command: `npm run test -w tg-mini-app-uikit -- icons-reorg.test.tsx`; expected failure: exit 1, `Failed to resolve import "../src/atoms/icons"`; GREEN command: `npm run test -w tg-mini-app-uikit -- icons-reorg.test.tsx` exit 0, 1 file and 2 tests passed; regression command: `npm run test -w tg-mini-app-uikit -- icons-reorg.test.tsx m5-display.test.tsx api-surface.test.ts` exit 0, 3 files and 28 tests passed; `npm run typecheck -w tg-mini-app-uikit` exit 0; `npm run build -w tg-mini-app-uikit` exit 0; sequential `npm run check:package` rerun exit 0
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: not rerun for path/export-only move with no intended JSX output, CSS, token, or runtime behavior change; `icons-reorg.test.tsx` includes a rendered SVG smoke check
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет

### `packages/uikit/src/service.tsx`

- Source: `packages/uikit/src/service.tsx`
- Target category path: `packages/uikit/src/atoms/service.tsx`
- Category: atom
- Related tests: `packages/uikit/test/service-reorg.test.tsx`, `packages/uikit/test/m0-api.test.tsx`, `packages/uikit/test/coverage-components.test.tsx`
- Related stories: `packages/uikit/storybook/atoms/service.stories.tsx`
- Related docs: `docs/site/pages/components.md`
- Current status: needs reviewer
- UIKit checklist: [x] classification [x] API contract [x] tokens (no token change) [x] accessibility (behavior preserved) [x] Telegram runtime (not applicable) [x] state machine (stateless) [x] testing [x] docs/stories (no public docs/story change needed) [x] packaging [x] performance
- TDD checklist: failing test name: `exports service atoms from the atom category and root package`; RED command: `npm run test -w tg-mini-app-uikit -- service-reorg.test.tsx`; expected failure: exit 1, `Failed to resolve import "../src/atoms/service"`; GREEN command: `npm run test -w tg-mini-app-uikit -- service-reorg.test.tsx` exit 0, 1 test passed; regression command: `npm run test -w tg-mini-app-uikit -- service-reorg.test.tsx m0-api.test.tsx coverage-components.test.tsx` exit 0, 3 files and 171 tests passed; `npm run typecheck -w tg-mini-app-uikit` exit 0; `npm run build -w tg-mini-app-uikit` exit 0; `npm run check:package` exit 0
- Visual checklist: [ ] light [ ] dark [ ] Telegram theme [ ] narrow/mobile [ ] RTL/locale where relevant [ ] reduced motion [ ] no overlap [ ] stable layout; author note: not rerun for path/export-only move with no JSX output, CSS, token, or runtime behavior change
- Artifact checklist: [x] unit test [x] Storybook [x] e2e test
- Reviewer-only yes/no questions: Code [ ] Да [ ] Нет; Visual [ ] Да [ ] Нет; Performance [ ] Да [ ] Нет; Logic [ ] Да [ ] Нет; Category fit [ ] Да [ ] Нет; Src purity [ ] Да [ ] Нет; Test adequacy [ ] Да [ ] Нет
