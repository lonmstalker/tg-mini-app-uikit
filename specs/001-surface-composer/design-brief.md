# Design Brief — UIKit Surface Composer (US1 + US2)

**Feature**: `001-surface-composer` · **Register**: product · **Status**: confirmed direction
**Source of truth**: [spec.md](./spec.md) + [../../.specify/memory/constitution.md](../../.specify/memory/constitution.md)
**Companions**: [animation-brief.md](./animation-brief.md) (motion grammar, no-WebGL strategy) · [wow-brief.md](./wow-brief.md) (wow architecture, anti-wow)
**Produced by**: `impeccable shape` (2026-06-16). Design direction confirmed by the user.

This brief is design planning, not implementation. It guides `/speckit.plan` and any
`impeccable craft` build for the first increment (US1 + US2 at full fidelity).

## 1. Feature Summary

A demo app (`examples/surface-composer`) that sells the UIKit itself: a founder opens
the surface inside Telegram and within seconds feels "this could be my premium Mini App",
then an engineer sees the system behind it. First increment: US1 (birth / first launch)
and US2 (one surface speaks shop / booking / wallet / support / community) at full
cinematic fidelity.

## 2. Primary User Action

One thing: want to order this Mini App. Everything in the first viewport leads to
`I want this Mini App`. Technical proof is the second layer, only after a touch.

## 3. Design Direction

- **Color**: restrained, theme-aware surface + a committed accent. The live Mini App
  surface stays on-brand (`--tk-*` tokens, tinted neutrals); one saturated accent
  (derived from `--tk-accent`, OKLCH ~`0.62 0.17 250`) carries ONLY the seed birth, the
  active context, and the primary action.
- **Theme (scene sentence)**: "A founder on a phone during a client call, in the dim
  light of a meeting room, deciding whether to order a premium TMA." → a dark cinematic
  STAGE frames a light theme-aware SURFACE. The stage/product contrast amplifies the wow
  and separates theater from the honest product.
- **Anchor references**: Apple keynote (calm inevitability, one idea per screen), Rauno
  Freiberg (deterministic signature motion), Family app (tactile premium, object-feel).
- **Probe result**: the first-viewport probe confirmed the lane. Carried into the brief:
  the committed accent is strictly localized (seed + CTA), otherwise "this is a real
  product" is lost.

## 4. Scope

Fidelity production-ready. Breadth two scenes (US1, US2) of one continuous surface.
Interactivity shipped-quality (real UIKit, not a prototype). Time polish until it ships.
US3–US6 are specified but deferred.

## 5. Layout Strategy

Dark stage (centered ~390px TMA frame appears to float). Inside, a vertical hierarchy of
one surface: compact header → promise zone (`Open. Trust. Order.` is the first strong
text) → business-context switcher → live preview surface `Client-ready Mini App` →
buyer-proof strip → one primary action. The seed sits at the visual center of the safe
area as the continuity object: it births the surface via token / safe-area rails, then
shrinks to an origin mark under the touch point. US2 morphs the same fragments
(header / content / price / action / list / bottom) as tiles that rotate and recompose
into the next context while tokens, safe area, theme, and runtime status visibly persist.
No tabbar / navbar. No nested cards. No identical card grids.

## 6. Wow Strategy

Wow is a risk budget that must not be spread thin. The earlier "compact loop" failed
precisely because it gave a little everywhere and nothing its full weight. Rule: pick one
signature moment, over-invest 200%, keep everything else deliberately quiet. The silence
is what makes the one moment expensive. For US1 + US2 the whole budget goes into three
mechanisms:

- **A. Birth (US1, ~70% of the wow).** The surface condenses from a single seed point,
  and every movement maps to a system concept. Seed breath (`scale 1→1.18→1`, ~180ms,
  ease-out-expo) → token / safe-area rails grow outward from `transform-origin` at the
  seed (scaleX/Y 0→1 + opacity, stagger 30–45ms) → real UIKit components resolve from the
  seed position (FLIP: translate+scale only, stagger 45ms, ease-out-quint) → one light
  sweep crosses the surface once → idle breathing on ONLY the surface (`scale 1→1.004`).
  Not a fade. Use ease-out-expo/quint; do NOT use `--tk-spring` (overshoot 1.45 = bounce,
  banned).
- **B. Tactility (everywhere).** Sub-100ms feedback anchored at the contact point, light
  that follows the finger (masked radial highlight), an origin pulse traveling to the
  responsible element, empty space that acknowledges the touch, an honest haptic tick
  (browser → visual, recorder marks mock/fallback). Use `--tk-ease` for functional motion.
- **C. Continuity (US2).** The remix morphs one object around the seed axis; tokens, safe
  area, theme, and runtime visibly persist. A page cross-fade kills the wow.

**Restraint multiplier** (without it the three mechanisms do not read): dark stage / light
surface so the surface glows into existence; committed accent only on seed + CTA; negative
space and silence; copy arrives after motion.

**Anti-wow (banned)**: fade-everything-at-once, layout-property animation, perpetual
shimmer / particles, generic easing, copy before motion, cross-fade in the remix,
gradient-SaaS look.

**Pass test**: motion-without-copy (hide all text — does the motion alone make a viewer
lean in?); deterministic `data-motion-state` under snapshot; perf (no long task > 50ms,
60fps); no AI-slop.

**Where to invest first**: perfect the birth (A) on US1 — that is ~70% of the wow. Then
universal tactility (B). Then remix continuity (C) on US2.

## 7. Key States

- US1: `seed` → `rails` → `assembling` → `idle` → `first-touch` (second layer:
  `Why it feels premium`, `UIKit proof appears after the buyer cares`).
- US2: `remix-start` (compress 0.992) → `separating` → `rotating` → `locked` →
  `continuity` (recorder: `templateChanged`, `tokensPreserved`, `safeAreaPreserved`,
  `runtimePreserved`).
- Cross-cutting: `reduced-motion` (static origin/highlights, same recorder events),
  `browser-fallback` (honest native/mock/fallback), `320/375/430/desktop` no overlap,
  RTL + long locales, rapid taps (never stuck in `entering`/`active`).
- Live surface: loading (`TKSkeleton`), empty, error — honest, never dead UI.

## 8. Interaction Model

Linear navigation: one primary action advances scenes in a fixed keynote order
(`I want this Mini App` → US2 remix → rest deferred). Within US1: a tap on the live
surface reveals the second proof layer (not before). Within US2: primary action / drag /
context chip triggers the remix; gyroscope drag left-right, on release the nearest context
locks to center. Back/Escape close the inspector before navigating. Every visible effect
produces a recorder event (source / target / reaction / native|mock|fallback).

## 9. Content Requirements

Sparse, product-led copy (no marketing, no em dashes):
- US1: title `Your Mini App in Telegram`, sub `Shop, booking, wallet, support.`, label
  `First launch`, hero `Open. Trust. Order.`, switcher `Shop / Booking / Wallet / Support`,
  CTA `I want this Mini App`, proof pills `Open · Native · Order · Share`, buyer-proof
  `opens in Telegram · premium feel · order path`, second layer `Why it feels premium` /
  `UIKit proof appears after the buyer cares`.
- US2: hero `Checkout. Booking. Wallet. Support.`, continuity marks
  `tokens · safe area · theme · runtime`.
- Localization: reuse `enLocale` / `ruLocale`; keep literal buyer copy layout-resilient to
  long strings.

## 10. Recommended References (impeccable)

`motion-design.md` (signature birth + remix, ease-out-expo/quint), `interaction-design.md`
(touch model, second layer), `spatial-design.md` (zones + safe area),
`responsive-design.md` (320→desktop), `color-and-contrast.md` (committed accent +
theme-aware stage/surface contrast), `ux-writing.md` (buyer-first), `cognitive-load.md`
(one idea per screen).

## 11. Open Questions (resolve in craft / plan)

- Exact derivation of the committed accent from `--tk-accent` and its behavior when the
  inner surface is itself in Telegram dark theme (the stage/surface contrast must not
  collapse).
- Whether the seed glow survives reduced motion as a static origin mark (yes, but fix the
  tokens).
- Whether `community` is in the first cut of US2 or four contexts first (the spec lists
  five).
- Where the dark stage boundary reads on desktop preview so it does not look like a web
  landing page.
