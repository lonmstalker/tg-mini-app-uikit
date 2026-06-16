# Phase 1 Contract — DOM + Recorder (what e2e asserts)

The Surface Composer has no network API. Its external contract is the **DOM state surface**
and the **recorder event stream** that the `surface-composer` Playwright project asserts
against. This file is the source of truth for those hooks; data shapes are in
[data-model.md](../data-model.md). Hook names conform to constitution Principle IV.

## 1. DOM state attributes (on the surface root `<main>`)

```html
<main
  data-scene="firstLaunch | rangeRemix | …"
  data-motion-state="seed | rails | assembling | light-sweep | idle | first-touch |
                     inspector-open | remix-start | separating | rotating | recomposing |
                     locked | continuity"
  data-runtime-mode="native-mirror | mock | browser-fallback"
  data-business-context="shop | booking | wallet | support | community"
  data-reduced-motion="true | false"
>
```

- **Contract**: every state value above MUST be observable on the DOM and reachable by a
  `page.waitForFunction` state-wait — never via `waitForTimeout` (D9). Reduced motion is the
  dedicated `data-reduced-motion` hook, not a `data-motion-state` value.
- CSS variables exposed for contact-anchored motion: `--sc-contact-x` / `--sc-contact-y`
  (last contact point), `--sc-origin-x` / `--sc-origin-y` (seed), `--sc-motion-intensity`.

## 2. Recorder event stream

- Surfaced for tests via a deterministic accessor (e.g. `window.__composerRecorder` in
  dev/test builds) returning the `RecorderEvent[]` in order.
- **Contract**: one event per visible effect; each carries `source`, `target`, `reaction`,
  `status` (= runtime mode), `motionState`, `scene`, and `businessContext` for remix events.
  A fixed fixture yields an identical sequence; reduced-motion emits the identical sequence.

## 3. Buyer-first gate (pre-touch)

- Before the first meaningful touch (`proofRevealed === false`): the first viewport contains
  **no** token / runtime / recorder / test vocabulary and **no** build-proof affordance
  (FR-002, SC-002). Assertable by scanning visible text against a forbidden-term list and
  asserting the proof affordance is absent.
- After first meaningful touch: `data-motion-state="inspector-open"`, the inspector surfaces
  ≥1 named UIKit proof element, and the build-proof affordance becomes present (US1 sc.3).

## 4. Interaction contracts (in scope)

| Probe | Expected DOM/recorder result |
|-------|------------------------------|
| Primary touch | visual feedback < 100 ms anchored at `--sc-contact-x/y`; one recorder event (FR-017, SC-014) |
| Empty-space tap | recognition ring at contact point + faint rail glow, **no** state change; optional "recognized" event (FR-006) |
| CTA press | proof/context fragments in first viewport align toward CTA (transform/opacity only); recorder event (US1 sc.4) |
| Remix advance | `remix-start → … → locked`; `data-business-context` changes to next in order; primary action updates with no layout shift (US2 sc.1). Triggerable three ways — primary action, context chip, horizontal drag — all emitting the same recorder sequence |
| Remix by drag | horizontal drag (pointer/gyroscope) maps to context proximity; on release the nearest context `locked`s to center; seed stays visually stable; not a free carousel; recorder event `source: 'pointer'` (design-brief §8.4) |
| Keyboard activate | same proof path as pointer; chip + primary action reach every context without drag; visible unclipped focus ring (FR-011) |
| Reduced motion | static birth/remix substitute; identical recorder events (FR-010) |

## 5. Visual snapshot gate (SC-011)

Key frames captured at frame 402×874 (global `toHaveScreenshot`, `animations:'disabled'`,
`maxDiffPixels:64`):

- US1: `seed`, `rails`, `assembling`, `idle`, `first-touch`, `inspector-open`
- US2: `remix-start`, `separating`, `rotating`, `locked`, **+ reduced-motion remix substitute**
- Excluded transition frames: `light-sweep`, `recomposing`, `continuity`.

## 6. Responsive contract

No overlap / no overflow at 320 / 375 / 430 px and desktop preview; the shell stays a
centered TMA surface (not a stretched dashboard); RTL + long Russian labels do not clip
(FR-011, SC-006).
