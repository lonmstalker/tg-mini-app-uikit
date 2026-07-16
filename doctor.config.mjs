// React Doctor configuration for the tg-mini-app-uikit design system.
//
// React Doctor's defaults target application code. The genuine findings were
// fixed in source (conditional hook order in TKPhoneInput, an invalid
// aria-selected on a <button>, non-passive visualViewport listeners, a
// chained filter().map(), a missing role on the carousel track, a per-call Intl
// formatter). The rules below are turned OFF because they flag DELIBERATE
// architecture of this component library, not real defects — each with its
// rationale so any can be re-enabled if the convention changes.
export default {
  rules: {
    // Styling is intentionally inline token-object `style={{…}}` on every
    // element (no CSS modules / className system) — that is the kit's convention.
    "react-doctor/no-inline-exhaustive-style": "off",

    // Composite widgets co-locate their sub-components in a single file by
    // design (TKPhoneInput + its two field variants, TKCalendar + its parts,
    // the time/date variants), and TKCalendar is one cohesive grid component.
    "react-doctor/no-multi-comp": "off",
    "react-doctor/no-giant-component": "off",

    // Controlled/uncontrolled mirroring and subscriptions to external sources
    // (visualViewport, page scroll position, Telegram theme vars, the
    // `error`/`range` props) are core to these controlled components — they
    // legitimately sync state from props/externals inside effects.
    "react-doctor/no-adjust-state-on-prop-change": "off",
    "react-doctor/no-derived-state": "off",
    "react-doctor/no-derived-useState": "off",
    "react-doctor/no-event-handler": "off",

    // Deliberate effect dependency arrays (documented with eslint-disable where
    // needed); ESLint's react-hooks/exhaustive-deps already governs these.
    "react-doctor/exhaustive-deps": "off",
    "react-doctor/advanced-event-handler-refs": "off",

    // ARIA composite-widget patterns: grid / gridcell / listbox / group on
    // <div>/<span> are the correct markup when not backed by a <table>, and
    // aria-multiselectable on role="grid" is valid (ARIA 1.2). These checks
    // false-positive on those intentional roles.
    "react-doctor/prefer-tag-over-role": "off",
    "react-doctor/role-supports-aria-props": "off",

    // localeDateOrder caches its Intl formatter per locale; it can't be hoisted
    // to module scope because the locale is a runtime argument.
    "react-doctor/js-hoist-intl": "off",

    // The segmented control animates its sliding indicator via an inline
    // transition by design.
    "react-doctor/no-layout-transition-inline": "off",

    // Carousel slides are static, positional content set by the consumer and are
    // never reordered or filtered, so the index is a stable key here.
    "react-doctor/no-array-index-as-key": "off",

    // The TS target is ES2020; `[...list].sort()` is already an immutable copy.
    // `Array.prototype.toSorted` (ES2023) isn't in our lib, so prefer the spread.
    "react-doctor/js-tosorted-immutable": "off",

    // A component library co-locates each component with its hook API by
    // design (TKNavStack + useNav, TKProvider + useTheme, i18n provider +
    // useLocale…). Fast-refresh module boundaries are an app concern, not a
    // published-package one.
    "react-doctor/only-export-components": "off",

    // The frosted glass chrome (header/tabbar/toast/write-bar backdrop
    // blur(14px)) is the kit's Telegram-native design signature. The flagged
    // surfaces are small fixed bars, not full-screen layers, and the blur is
    // static — only the bar itself animates in/out.
    "react-doctor/no-large-animated-blur": "off",

    // TKDialog/TKSheet deliberately do not use <dialog>: the native top layer
    // escapes TKProvider's theming scope and bypasses the kit's overlay stack
    // (Telegram BackButton queue, scroll lock, staged animations).
    "react-doctor/prefer-html-dialog": "off",

    // The showcase is a Vite MPA (demo/, telegram/, motion/… each with its own
    // index.html entry). The scanner only follows the root entry, so every
    // page-module tree behind a non-root entry false-positives as unreachable.
    "deslop/unused-file": "off",

    // Modal panels/stages (sheet, action sheet, image viewer) are tabIndex={-1}
    // — never Tab-reachable — and take only programmatic focus as the trap's
    // fallback; every keyboard-reachable control keeps the kit-wide
    // `.tk :focus-visible` outline. `outline: none` on those panels is the
    // documented pattern (commented at each site), not a focus-ring removal.
    "react-doctor/no-outline-none": "off",

    // will-change lives in deliberate promotion windows: nav exit layers leave
    // the DOM at animationend, and toasts clear it imperatively after the
    // entrance keyframes. The repo enforces the stronger invariant itself —
    // check-animatable-props (CI) plus the perf e2e that assert no per-frame
    // layout and no resting promoted layers.
    "react-doctor/no-permanent-will-change": "off",

    // Measured-DOM lifecycles (the onboarding spotlight re-measuring its
    // target's rect once after refs resolve post-commit) re-render once by
    // design and are documented at the call site.
    "react-doctor/no-effect-chain": "off",

    // Lifecycle transitions set state in effects by design: onboarding's
    // finish-on-empty-steps (ONB-003) persists the seen flag and notifies the
    // consumer when the step set drains. Same family as the already-disabled
    // no-adjust-state-on-prop-change / no-derived-state above.
    "react-doctor/no-chain-state-updates": "off",

    // The platform bridge's whole job is syncing declarative hook params to
    // Telegram's IMPERATIVE chrome (MainButton.setParams/show/hide) inside
    // effects — there is no parent React component receiving state, so the
    // "pushing state up costs a render" premise doesn't apply to these calls.
    "react-doctor/no-pass-live-state-to-parent": "off",
  },
};
