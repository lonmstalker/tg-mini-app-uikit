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
  },
};
