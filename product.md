# Product Context

## Register

product

## Product Purpose

Telegram Mini App UIKit is a React and TypeScript design-system package for building production Telegram Mini Apps. It gives product teams a reusable component library, semantic design tokens, Telegram WebApp runtime hooks, browser-testable Telegram mocks, Storybook coverage, static documentation, and demo flows that prove the kit works under real Mini App constraints.

The product exists to make Telegram Mini App interfaces predictable, accessible, testable, and fast without forcing every app team to rediscover the same platform issues: safe areas, native buttons, viewport changes, Telegram theme variables, haptics, storage, invoices, narrow WebView layouts, reduced motion, and SSR/browser fallback boundaries.

## Primary Users

- Frontend engineers building Telegram Mini Apps with React 18 or React 19.
- Product engineers who need a practical UIKit rather than a visual-only component gallery.
- Design-system maintainers responsible for reusable tokens, public APIs, Storybook, docs, and regression evidence.
- QA and automation engineers validating WebView layout, accessibility, visual regressions, Telegram runtime behavior, and package stability.
- AI coding agents that need a clear package surface, usage map, and explicit constraints before editing components.

## User Jobs

- Compose common Mini App screens from reusable UIKit exports instead of one-off app code.
- Keep visual styling aligned with Telegram themes while retaining app-level control over accent, radius, density, type scale, and motion.
- Test Telegram runtime behavior in a browser through injectable mocks.
- Ship source changes with behavior tests, visual evidence, docs, stories, and package checks.
- Refactor the source tree into durable categories without losing public API evidence.

## Product Principles

- Reusable UIKit first: package source should hold generic tokens, atoms, composites, templates, runtime hooks, and helpers, not app-specific flows.
- Telegram-aware by default: safe areas, viewport, haptics, native buttons, storage, invoices, events, and fallbacks are first-class constraints.
- Evidence over claims: public APIs need tests, Storybook or docs, SSR safety where relevant, and package validation.
- Zero avoidable dependencies: runtime bundle size and tree-shaking remain part of the product value.
- Accessibility is part of the contract: keyboard use, focus, semantic naming, descriptions, status announcements, and reduced motion are not optional polish.
- Source purity matters: demo-only examples can exist, but they should not masquerade as reusable package primitives.

## Tone

Precise, calm, engineering-led, and concrete. Documentation should favor exact behavior, commands, file paths, API names, and failure modes over marketing language. The kit should feel trustworthy to teams that already know strong product tools and design systems.

## Anti-References

- Decorative SaaS landing-page UI inside task surfaces.
- One-off demo widgets exported as if they were reusable package APIs.
- Visual-only components without keyboard, focus, SSR, Telegram fallback, or test coverage.
- Generic mobile UI kits that ignore Telegram WebApp behavior.
- Broad snapshot updates used as a substitute for behavior tests.
- Theme systems that rely on raw colors in components instead of semantic tokens.

## Success Criteria

- A new component can be classified, implemented with TDD, reviewed visually, documented, tested, and exported without guessing repo conventions.
- Consumers can build Mini App screens that survive narrow WebViews, Telegram themes, safe areas, runtime absence, SSR import, keyboard-only use, and reduced motion.
- Future reorganization keeps package source focused on reusable tokens, atoms, composites, templates, and runtime foundations.
