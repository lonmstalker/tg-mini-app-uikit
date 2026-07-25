# Incident ledger

Every absorbed trap in this kit carries three anchors (M1 in
[component-rules.md](../component-rules.md)): a comment at the code site citing
the incident ID, a pinned test that replays the failure, and a **docs line
stating the guarantee**. This directory is that third anchor.

One line per ID: what the kit guarantees, so a reader can tell whether a
refactor still honours it without reverse-engineering the fix.

- [buttons, controls & cross-cutting contracts](buttons-controls.md) — `BTN-*`, `CC-*`, `REU-008`
- [inputs & forms](inputs-forms.md) — `INP-*`, `FRM-*`, `A11Y-202`, `REU-012`
- [lists & navigation](lists-navigation.md) — `LST-*`, `NAV-*`, `REU-005`
- [overlays, gestures & onboarding](overlays-gestures.md) — `OVL-*`, `GES-*`, `ONB-*`, `REU-010`
- [runtime internals](runtime-internals.md) — `INT-*`, `KB-*`

Older, longer-form stories live in [wiki/device-testing.md](../../wiki/device-testing.md),
[wiki/ios-debugging.md](../../wiki/ios-debugging.md) and the "Reuse contracts"
section of [docs/site/pages/components.md](../site/pages/components.md); the
`REU-*`, `KB-*` and `OVL-010`-class entries documented there are not repeated
here.

`npm run check:rules` flags any ID that has a code comment but no test and no
docs line — see [docs/component-checklist/](../component-checklist/).
