# Phase 1 Data Model — UIKit Surface Composer

Demo-only client state (no backend, no persistence in this increment). All types live
under `examples/surface-composer/src` — none are public UIKit exports. The contract these
entities expose to tests is in [contracts/dom-contract.md](./contracts/dom-contract.md).

## ComposerState (root reducer state)

The single `useReducer` tree in `src/app/composerReducer.ts`.

| Field | Type | Notes |
|-------|------|-------|
| `scene` | `SceneId` | active scene; advances linearly via the primary action (FR-015) |
| `businessContext` | `BusinessContext` | active remix context (US2) |
| `motionState` | `MotionState` | current choreography state (US1/US2) |
| `runtimeMode` | `RuntimeMode` | honest native/mock/fallback label (FR-014, V) |
| `reducedMotion` | `boolean` | mirrors `prefers-reduced-motion`; drives the static path |
| `recorder` | `RecorderEvent[]` | append-only log of visible effects (FR-005) |
| `proofRevealed` | `boolean` | false until first meaningful touch (FR-002/Buyer-first) |

State transitions are owned by `SceneOrchestrator` (scene/motion machine) and the
recorder middleware (every dispatch that produces a visible effect appends a `RecorderEvent`).

## SceneId

`'firstLaunch' | 'rangeRemix' | 'interactionTrust' | 'runtimePressure' | 'buildProof' | 'receipt'`

- In scope this increment: `firstLaunch` (US1), `rangeRemix` (US2).
- Enumerated but **not rendered**: the remaining four (US3–US6 deferred). The orchestrator
  still treats the primary action as a linear advance so FR-015 holds.

## BusinessContext

`'shop' | 'booking' | 'wallet' | 'support' | 'community'`

- Remix order (US2): `shop → booking → wallet → support → community`.
- Switcher visibility: 4 chips (shop/booking/wallet/support); `community` enters via remix (D7).
- Each context supplies **data + copy + slot content only**; token rails, safe-area bounds,
  selected context, runtime mark, origin point, and primary-action position are invariant
  across contexts (FR-004 continuity).

## MotionState

```
US1:  'seed' | 'rails' | 'assembling' | 'light-sweep' | 'idle' | 'first-touch' | 'inspector-open'
US2:  'remix-start' | 'separating' | 'rotating' | 'recomposing' | 'locked' | 'continuity'
```

- Validation: every value MUST be reflected on the DOM (`data-motion-state`) and be
  reachable by the e2e state-wait helper (no timing sleeps).
- Reduced motion: the machine resolves directly to settled states (`assembling`/`idle` for
  birth; stepped `recomposing`/`locked` crossfade for remix) — no rotation/perspective/long-path.
- Transition (in-between) frames `light-sweep` / `recomposing` / `continuity` are intentionally
  excluded from the snapshot gate (SC-011); all others are gated key frames.

## RuntimeMode

`'native-mirror' | 'mock' | 'browser-fallback'` plus deferred runtime-pressure conditions
`'theme-shift' | 'safe-area-pressure' | 'keyboard-pressure' | 'permission-denied'` (US4).

- Derivation (`useRuntimeMode`, internal): `native-mirror` when `useWebApp()` + `wa.initData`;
  `mock` when the `MockProvider` handle is present; else `browser-fallback`.
- Honesty rule: a capability is never claimed `native` when only a fallback exists (FR-014).
  `isSupported === true` from a mock is NOT native.

## RecorderEvent

```ts
type RecorderEvent = {
  id: string;
  scene: SceneId;
  source: 'pointer' | 'keyboard' | 'runtime' | 'system';
  target: string;             // e.g. 'surface.preview.media'
  reaction: string;           // visible reaction, e.g. 'contact-highlight+inspector-open'
  status: RuntimeMode;        // native-mirror | mock | browser-fallback
  motionState: MotionState;
  businessContext?: BusinessContext;   // present for remix events
  timestamp: number;          // deterministic (fixture-seeded), not Date.now() in tests
};
```

- Invariant: every visible effect produces exactly one event carrying the same state
  vocabulary exposed on the DOM (FR-005 ↔ FR-019).
- Determinism: under a fixed fixture the event sequence (and any derived proof hash) is
  identical; the reduced-motion path emits the **same** events as the full-motion path (FR-010).

## Surface (view model, not stored)

The live composition rendered into the centered TMA frame. Slots:

```ts
type SurfaceSlots = {
  header; hero; media; primaryMetric; supportingList; trustStrip; primaryAction;
};
```

- Each slot is filled by an existing TK* export (see research D2); slot identity is stable
  across remix (continuity), only content rebinds.

## Deferred entities (US5/US6, specified, not built)

- **Build layer / evidence pin**: fixture-backed proof element attached to a real surface
  element; unproven → `candidate`/`planned`, never `passed`.
- **Proof receipt**: deterministic capsule generated from recorder fixture data (reproducible
  proof hash + milestone replay). Out of scope this increment.
