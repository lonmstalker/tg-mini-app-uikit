---
name: uikit-element-development
description: Use when adding, changing, or reviewing any reusable UIKit/design-system element in tg-mini-app-uikit, including tokens, CSS variables, primitives, atoms, composite components, overlays, forms, navigation, layouts, patterns/templates, Telegram Mini Apps runtime hooks/providers/adapters, examples/demo surfaces, stories, docs, tests, exports, or future element types. Use it for new public or internal reusable UI surfaces. Do not use it for unrelated app business logic, one-off demo content, or generated build artifacts unless they affect reusable UIKit behavior.
---

# Purpose

Use this skill to keep every new or changed UIKit element consistent with this library's architecture: React + TypeScript, CSS variables and semantic tokens, Telegram Mini Apps theme/runtime constraints, SSR and non-Telegram fallback behavior, accessibility, Storybook/docs/tests, and package/public API stability.

# When to use this skill

Use this skill for requests such as:

- add a new component;
- add a new primitive;
- add a new hook;
- add Telegram runtime support;
- add tokens;
- add overlay, form, nav, list, layout, pattern, or template behavior;
- add a story, docs, or tests for a reusable UIKit surface;
- review a new UIKit element;
- extend public API.

Do not use this skill for one-off demo-only content unless it becomes reusable, package infrastructure unrelated to UIKit behavior, or generated `dist`, `coverage`, snapshot, or test output unless the user intentionally updates baselines.

# Core workflow

1. Identify the element type.
   Classify it as one or more of: token; CSS variable; primitive; atom; composite; overlay; form control; navigation/layout; pattern/template; Telegram runtime hook/provider/adapter; utility; example/story/docs-only addition; unknown/future type.

2. Inspect analogs before implementing.
   Search existing code for the closest similar elements. Follow local naming, prop, styling, test, story, docs, and export conventions before inventing new structure.

3. Define the contract.
   Establish the API before implementation: public vs internal; component/hook/type names; props/types; controlled/uncontrolled behavior if stateful; events/callbacks; default behavior; disabled/loading/error/readonly states where applicable; SSR behavior; non-Telegram fallback behavior; and whether it should be exported from the package root.

4. Implement with project conventions.
   Keep changes in the relevant repo areas: `packages/uikit/src`, `packages/uikit/src/styles/tokens.css`, `packages/uikit/src/telegram`, `packages/uikit/test`, `examples/demo/stories`, `docs/site/pages`, and package barrel exports.

5. Style through tokens.
   Prefer semantic `--tk-*` variables and the existing spacing, radius, shadow, z-index, and motion scales. Avoid raw hex/rgb/hsl/px values unless local geometry requires them, and explain why. Support light, dark, Telegram theme variables, reduced motion, and stable layout without avoidable shifts.

6. Respect Telegram Mini Apps runtime.
   For any element touching Telegram WebApp or mobile shell behavior, use safe `window` access, SSR import safety, non-Telegram browser fallbacks, feature detection and/or version gates, event cleanup, stale-callback protection, and safe-area/viewport awareness where relevant. Do not leak trust boundaries around `initDataUnsafe`. Route MainButton, SecondaryButton, BackButton, and SettingsButton behavior through existing runtime wrappers/hooks, not ad hoc global calls.

7. Build accessibility in by default.
   Prefer semantic HTML. Use ARIA only when needed. Provide an accessible name for every interactive element, keyboard support, visible unclipped focus, logical focus management for overlays, label/description/error wiring for fields, mobile-suitable target size, status announcements where needed, and no information conveyed only by color, tooltip, icon, or animation.

8. Add tests appropriate to the element.
   Use the minimal relevant set: unit/contract tests; component interaction tests; SSR import/render tests where applicable; Telegram mock tests for runtime surfaces; keyboard/focus tests for interactive elements; a11y tests where existing infra supports them; e2e/visual tests only when the repo already has a pattern and the change warrants it; and package API snapshot/export updates when public exports change.

9. Add Storybook/docs/examples.
   Add a story for every visual reusable public surface. Add docs for public API or runtime behavior. Add examples only when they demonstrate reusable patterns. Do not make docs claims that tests do not support.

10. Validate.
    Inspect package scripts before claiming coverage. Run the narrowest useful commands first, then broader checks when needed. Default commands for this repo, if still present:
    - `npm run typecheck`
    - `npm run test:unit`
    - `npm run check:stories`
    - `npm run build -w tg-mini-app-uikit`
    - `npm run stories:build -w tg-mini-app-uikit-demo`
    - `npm run check:package`
    Do not run snapshot update commands unless explicitly asked.

11. Summarize.
    Final responses must include files changed, element type/classification, API added/changed, tests/docs/stories added, validation commands run and result, and risks or follow-up gaps.

# Hard rules

- Do not modify generated `dist`, `coverage`, `test-results`, or visual baselines unless explicitly requested.
- Do not add runtime dependencies unless necessary and justified.
- Do not bypass existing providers/hooks for Telegram runtime.
- Do not treat `initDataUnsafe` as trusted.
- Do not add raw CSS values when an existing token fits.
- Do not export a new public API without tests and docs/story evidence.
- Do not silently change existing public API semantics.
- Do not skip accessibility for custom interactive elements.
- Do not add broad snapshots as a substitute for behavior tests.
- Do not add a component just to satisfy a prompt if an existing component can be generalized safely.

# Self-review questions

- Is this element reusable UIKit surface or one-off app code?
- Did I inspect the closest existing analogs before adding files?
- Is the name consistent with `TK*` naming and existing exports?
- Is the API minimal, typed, and stable?
- Does the component support controlled/uncontrolled state if appropriate?
- Are disabled/loading/error/empty/readonly states defined when relevant?
- Does styling use semantic tokens instead of raw values?
- Does it work in light, dark, Telegram-themed, and non-Telegram contexts?
- Does import/render work without `window.Telegram`?
- Is SSR safe?
- Are Telegram events cleaned up?
- Could callbacks become stale?
- Is focus behavior correct?
- Can the element be used by keyboard only?
- Does every interactive element have an accessible name?
- Are helper/error/tooltip descriptions wired correctly?
- Does the element respect safe area, viewport, and reduced motion where relevant?
- Are tests aligned with the risk of the element?
- Are stories/docs/examples updated?
- If public API changed, are exports, API snapshot, docs, and package checks updated?
- Did I avoid generated files and unrelated refactors?
- Did validation pass, or did I document failures honestly?

# Reference loading

- Read `references/quality-checklists.md` before implementing a non-trivial element.
- Read `references/element-patterns.md` when the user asks for a new kind of element, when the element type is unclear, or when adding a Telegram runtime surface.
