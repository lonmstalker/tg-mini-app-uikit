# Design the UIKit-selling Telegram Mini App demo

This file is an ExecPlan: a self-contained, living plan for designing and then
implementing the flagship demo for `tg-mini-app-uikit`. It follows the OpenAI
Codex PLANS.md convention for multi-hour problem solving. Read it top to bottom
before editing code. The sections `Progress`, `Surprises & Discoveries`,
`Decision Log`, and `Outcomes & Retrospective` are living sections and must be
updated as work proceeds.

The previous working-tree occupant of this file was the completed post-Trailhead
DDD package split plan. The user explicitly allowed deleting old content from
`plans.md`. This plan now supersedes it as the one active `plans.md` effort.


## Agent Operating Contract

This file is written for future coding and design agents. It is the source of
truth for the demo design, but it is not the user-facing answer format.

When working from this plan, an agent must:

- read the whole file before changing demo code or expanding a screen;
- keep `plans.md` precise, exhaustive, and implementation-ready;
- write chat updates in concise Russian, using natural human language;
- keep chat summaries synchronized with this file, but never paste long plan
  sections into chat unless the user explicitly asks for that;
- describe only the currently active screen in chat, plus the concrete decision
  needed from the user;
- update `Progress`, `Surprises & Discoveries`, and `Decision Log` when the
  design direction changes;
- mark screen status as `drafted`, `approved`, `needs revision`, or
  `implemented`;
- avoid starting implementation for any screen that is not approved;
- preserve existing unrelated working-tree changes.

The correct loop is:

1. Update this file with exact screen detail.
2. Give the user a short human-readable explanation of the same screen.
3. Ask for approval or targeted changes.
4. If the user changes direction, update this file first, then summarize the
   synchronized change in chat.

Never answer only with "I updated the file." The user needs the human version of
the same decision.


## Human Sync Snapshot

This section mirrors the current state in a short form. Agents should update it
whenever a screen changes, then use it as the basis for the chat response.

Current approved direction:

- The demo sells `tg-mini-app-uikit`, not a one-off Mini App.
- The approved working name is **UIKit Surface Composer**.
- The demo is a live in-app composer inside a Telegram Mini App WebView.
- The user accepted the direction where the opening wow is **Token Singularity**:
  one living point in the center of the TMA viewport generates the first page
  from UIKit tokens, safe-area rails, component slots, runtime states, and
  motion rules.
- Every later page must stay in the same language: not a typical app flow, not a
  navbar demo, but a capability scene that makes TMA constraints feel valuable.
- Every touch reveals UIKit craft: components, tokens, runtime, accessibility,
  Telegram constraints, and recorder proof.
- Screens 1-6 are now drafted for review.

Human version of Screen 1:

Screen 1 starts almost empty: a real TMA viewport and one tiny point in the
center. That point is the seed token. It breathes, emits spacing rails, radius
arcs, safe-area bounds, semantic colors, component slots, and runtime state
marks. The page does not fade in as a screenshot. It is generated from the
UIKit contract, then settles into a compact premium composer. When the viewer
taps the surface, chips, badge, progress ring, avatar stack, header action, or
empty space, the screen answers with small purposeful motion and shows which
UIKit layer caused it. The first impression should be: this UIKit can generate a
living TMA surface, and I can inspect how it is built.

Human version of the remaining pages:

Screen 2 remixes the same generated surface into commerce, booking, wallet,
community, and support without losing tokens or Telegram constraints. Screen 3
turns touch into a microscope: cards can tilt, rotate, split into state layers,
and show why each microinteraction exists. Screen 4 stress-tests Telegram
runtime: keyboard, safe areas, viewport, native buttons, haptics, BackButton,
theme changes, fallback mode. Screen 5 breaks one card into refracted UIKit
layers so developers see tokens, atoms, composites, templates, runtime hooks,
a11y, tests, and stories. Screen 6 compresses the whole run into a shareable
proof card generated from recorder events.

Current user decision needed:

- Choose the first surface content: checkout, booking, wallet, support, or a
  neutral premium app shell.
- Approve or revise the Screen 2-6 motif line: `Template Prism`,
  `Component Refraction`, `Runtime Pressure Chamber`, `Build Tomography`,
  `Proof Card Forge`.


## Purpose / Big Picture

The demo must sell the UIKit, not a one-off Telegram Mini App. The user should
not leave thinking "nice custom app." They should leave thinking:

> I can build premium, alive, Telegram-native Mini App surfaces from this UIKit,
> and every touch proves the kit has real product craft.

The demo runs inside a Telegram Mini App WebView. It does not depend on real
Telegram dialogs, a video sequence, or an external chat screen. Telegram context
can appear only as in-app simulated launch context, native chrome, safe-area
constraints, runtime events, theme variables, and share-ready proof states.

The current working direction is **UIKit Surface Composer**. It is a live composer
where a premium Mini App surface can be touched, remixed, inspected, stressed,
and decomposed into real UIKit primitives. The wow is not a MainButton, theme
change, safe area, haptic, or animation by itself. The wow is that every
interaction reveals a reusable UIKit layer: tokens, primitives, templates,
runtime hooks, accessibility states, Telegram chrome, and recorder-backed proof.

This plan is intentionally screen-by-screen. Each screen must be described,
reviewed, and approved before moving to the next one. Do not implement a later
screen until its plan section has been accepted or revised.


## Progress

- [x] (2026-06-16) Read the brainstorm
  `docs/brainstorms/2026-06-16-tma-native-lab-brainstorm.md`.
- [x] (2026-06-16) Rejected the previous `Revenue Recovery`, `Launch Echo`, and
  generic magic-app directions as first-screen concepts because they sell a
  custom TMA instead of the UIKit.
- [x] (2026-06-16) Loaded project design context through `impeccable`:
  `PRODUCT.md` and `DESIGN.md` are present and valid.
- [x] (2026-06-16) Confirmed the real UIKit surface from
  `packages/uikit/src/index.ts` and package-local Storybook folders.
- [x] (2026-06-16) Drafted this new active `plans.md`.
- [x] (2026-06-16) Added an agent operating contract and human sync snapshot so
  future agents keep `plans.md` exhaustive while answering the user in concise
  synchronized Russian.
- [x] (2026-06-16) Replaced the generic first-screen reveal with
  `Token Singularity`: one center point generates the first TMA page from UIKit
  tokens, safe-area rails, component slots, runtime states, and motion rules.
- [x] (2026-06-16) Expanded Screens 2-6 as TMA capability scenes instead of a
  typical navbar application flow.
- [x] (2026-06-16) Integrated 5 spawned role-agent reviews: founder, senior TMA
  engineer, creative director, product motion designer, and QA automation lead.
- [x] (2026-06-16) Renamed the demo to **UIKit Surface Composer**.
- [x] (2026-06-16) Added Apple/OpenAI-style product reveal direction: cold open,
  one idea per screen, signature motion first, proof immediately after.
- [x] (2026-06-16) Approved the `Show UIKit layers` reveal behavior: hidden
  during the first cinematic birth, revealed only after the first meaningful
  touch.
- [ ] User approves or revises the first surface content and Screen 2-6
  capability scene line.


## Product Principles For This Demo

The demo is a product surface first and a sales surface second. It should feel
like something a serious Telegram or TON product team could open in front of a
client and say: this is why the UIKit is worth using.

The first viewer is not a random visitor. The viewer has already seen generic
TMA dashboards, airdrops, claim screens, launchpads, wallets, and card grids.
They will not be impressed by standard mobile UI, ordinary gradients, component
catalogs, or Telegram API checklists.

The demo must prove three things quickly:

- UIKit surfaces can feel premium and alive.
- The same surface is built from reusable pieces, not a hand-coded one-off.
- Telegram constraints are handled as part of the system, not afterthoughts.

Why the viewer should care about TMA at all:

- A TMA opens inside the distribution surface where the user already is:
  Telegram. The demo should make this feel like instant product entry, not a
  compromised embedded website.
- TMA can combine native Telegram context, lightweight checkout or wallet
  actions, sharing, bot journeys, chat-adjacent acquisition, and web-grade UI in
  one surface. The demo should show that this can feel premium instead of
  cramped.
- The UIKit's job is to make Telegram constraints productive: safe areas,
  theme variables, native buttons, haptics, viewport pressure, fallback runtime,
  recorder proof, and automated tests become visible advantages.
- A buyer should leave thinking: a TMA is not a smaller website. It is a
  Telegram-native product surface with distribution, trust, and interaction
  primitives already around it.

The demo should avoid:

- external Telegram chat as the primary scene;
- fake bot versus website comparisons as first-screen wow;
- business metrics as first-screen wow;
- a standalone "cool object" that does not explain UIKit;
- a Storybook-like component grid as the hero;
- MainButton, theme, safe area, haptics, or sensors as isolated wow claims;
- visual effects that do not reveal function.


## Presentation Direction: Apple/OpenAI-Style Product Reveal

The demo should borrow presentation discipline from Apple and OpenAI without
copying their visual identity. The goal is calm inevitability: the product feels
simple because the system underneath is powerful.

Do:

- open with the product, not explanation;
- show one idea per screen;
- let the signature motion happen before copy appears;
- reveal proof immediately after the wow moment;
- use short, exact sentences instead of marketing paragraphs;
- make every label sound like an object or event in the system;
- keep the viewer inside the TMA surface the entire time;
- use silence, delay, and negative space as part of the perceived value;
- make the UI feel discovered, not explained.

Do not:

- use a landing-page hero;
- introduce a feature checklist;
- narrate the interface with tutorial text;
- show generic mobile-app navigation;
- overuse glowing lines, particles, or decorative 3D;
- paste docs into the product surface;
- claim platform magic without recorder or runtime proof.

### Narrative Arc

The six screens should feel like a keynote demo compressed into an interactive
TMA:

1. **Birth.** One token point creates the first TMA surface.
2. **Range.** The same system remixes into multiple business surfaces.
3. **Feel.** Every touch reveals a component contract.
4. **Telegram Reality.** The surface survives runtime pressure.
5. **Trust.** The magic opens into UIKit layers and evidence.
6. **Handoff.** The run compresses into a proof card that can be shared.

Each screen has the same structure:

- cold open with the surface;
- one signature motion;
- one concise sentence;
- one visible proof layer;
- one touch surprise;
- one recorder event trail.

### Copy System

Copy should be sparse and product-led.

Screen-level copy candidates:

- Screen 1: `A Telegram surface, born from tokens.`
- Screen 2: `One system. Many Mini Apps.`
- Screen 3: `Every touch has a contract.`
- Screen 4: `Telegram changes the environment. The surface holds.`
- Screen 5: `The magic is inspectable.`
- Screen 6: `A demo you can replay, share, and build from.`

Buttons should stay functional:

- `Remix surface`;
- `Inspect touch`;
- `Stress runtime`;
- `Open layers`;
- `Forge proof`;
- `Replay`.

Avoid vague copy:

- `Experience the future`;
- `Unlock possibilities`;
- `Seamless magic`;
- `Next-gen Mini Apps`;
- `Beautiful components`.

### Pacing

Opening:

- 0 to 1200 ms: Token Singularity birth;
- after 1200 ms: surface is usable;
- after first touch: proof affordances appear.

Between screens:

- navigation feels like changing capability modes in one instrument, not moving
  between app pages;
- the seed point should appear as the continuity object between modes;
- each transition must finish quickly enough that the viewer wants to touch, not
  wait.

Proof reveal:

- proof follows wow, never precedes it;
- proof is anchored to the touched object;
- recorder output stays compact and visible enough to create trust.


## Audience

Primary audience:

- Telegram and TON product founders who want a premium Mini App surface.
- Studios and senior frontend teams selling Mini Apps to clients.
- Product engineers who need reusable React components, not static mockups.
- Design-system maintainers who care about tokens, variants, docs, and tests.

Secondary audience:

- QA and automation engineers validating Telegram WebView behavior.
- AI coding agents that need a clear map of what the UIKit exports and how it
  should be used.

The demo should make a founder feel the polish first. Then it should make an
engineer trust the system.


## Existing UIKit Surface To Use

Use existing UIKit exports as the default building blocks.

Foundation and runtime:

- `TKProvider`, `tkThemeVars`, `useTKTheme`.
- `TKLocaleProvider`, `useTKLocale`, `enLocale`, `ruLocale`.
- Telegram runtime re-export from `@tg-mini-app/telegram`.
- `useHasNativeChrome` from `foundation/chrome`.

Layout and navigation:

- `TKPage`, `TKSafeArea`, `TKBottomBar`.
- `TKHeader`, `TKTabbar`, `TKTabView`, `TKSegmented`, `TKCategoryTabs`.
- `TKSteps`, `TKPageDots`, `TKNavStack`, `TKNavPanel`, `useNav`.

Controls and inputs:

- `TKTappable`, `TKButton`, `TKIconButton`, `TKInlineButtons`,
  `TKMainButton`, `TKSpinner`.
- `TKChip`, `TKChipGroup`, `TKCheckbox`, `TKRadioGroup`, `TKSwitch`,
  `TKSlider`, `TKStepper`, `TKRating`.
- `TKInput`, `TKFormInput`, `TKTextarea`, `TKSearch`, `TKSelect`, `TKOTP`,
  `TKFileInput`, `TKPhoneInput`, `TKTimeInput`, `TKDateInput`,
  `TKChipsInput`.

Display, lists, cards, overlays, feedback:

- `TKText`, `TKTitle`, `TKCaption`, `TKIcon`.
- `TKAvatar`, `TKAvatarStack`, `TKBadge`, `TKDot`, `TKCounter`.
- `TKCard`, `TKCardCell`, `TKCardChip`, `TKCell`, `TKListGroup`,
  `TKAccordion`, `TKInfiniteList`, `TKVirtualList`.
- `TKFrame`, `TKSheet`, `TKDialog`, `TKActionSheet`, `TKTooltip`,
  `TKPopper`, `TKToastProvider`, `useTKToast`.
- `TKProgress`, `TKRing`, `TKTimeline`, `TKEmptyState`, `TKSkeleton*`,
  `AsyncBoundary`, `TKAsyncState`.
- `TKPullToRefresh`, `TKSwipeCell`, `TKGallery`.

Templates and patterns:

- `TKProductCardA`, `TKProductCardB`, `TKBannerCard`, `TKBookingCard`,
  `TKStatTile`.
- `TKSlotPicker`, `TKPaymentSummary`.
- `TKXPHeader`, `TKLeaderboard`.
- `TKWalletConnectButton`, `TKWalletStatusCell`.
- `TKMessageBubble`, `TKMessages`, `TKWriteBar`.
- `TKOnboardingTooltip`, `TKConfetti`.

New public UIKit elements are not allowed by default. If a screen needs an
effect that cannot be composed from existing exports, mark it as one of:

- demo-only composition;
- internal helper candidate;
- future public UIKit candidate, blocked until it has API, tests, Storybook,
  docs, accessibility, reduced-motion behavior, and package export review.


## Screen Map

The current screen sequence is:

1. **Token Singularity / Surface Composer.** First impression. One center point
   generates a premium TMA surface from UIKit tokens, slots, Telegram rails, and
   runtime state. Touching any region proves the surface is alive and inspectable.
2. **Template Remix Studio.** The same generated surface morphs between
   commerce, booking, wallet, community, and support templates without losing
   token identity, Telegram chrome, safe area, or interaction states.
3. **Interaction Microscope.** The viewer rotates, presses, cracks, and inspects
   cards or media. Every expensive detail maps to a component state, event,
   token, accessibility contract, or haptic/runtime fallback.
4. **Telegram Runtime Stress.** Keyboard, viewport, safe area, native chrome,
   theme, BackButton, MainButton, haptics, permission denial, and browser fallback
   strike the same surface as visible forces. The UI adapts without breaking.
5. **UIKit Layers / Build Proof.** One rich card refracts into tokens, atoms,
   composites, templates, runtime hooks, accessibility, stories, tests, and
   recorder evidence. Developer flexibility becomes explicit here.
6. **Shareable Proof / Handoff.** The final screen forges the run into a
   share-ready proof card for founders, developers, and agents, generated from
   deterministic recorder data.

All six screens are drafted below. They remain review specs until the user
approves or revises the motion direction.


## Screen 1: Token Singularity / UIKit Surface Composer

Status: drafted for user review. Do not implement until approved.

Purpose:

Screen 1 must immediately sell the UIKit. It should not look like a component
gallery, a Trailhead clone, a product landing page, or a custom business app.
It is an interactive composer inside a Telegram Mini App: a polished TMA surface
in the center, surrounded by compact controls that reveal how UIKit makes the
surface feel alive.

The viewer should understand in the first 10 seconds:

- this is running inside a Telegram Mini App frame;
- the surface is touchable and alive;
- the surface is built from UIKit primitives;
- the surface was generated from semantic tokens, not revealed as a static mock;
- every interaction can be inspected;
- Telegram constraints are part of the design system.

### Physical Scene

A senior product engineer or studio founder opens the demo on a phone-sized TMA
surface during a client call. They are not browsing docs. They are trying to
decide if this UIKit can make their next Telegram Mini App feel premium without
building everything from scratch.

This forces a product UI direction:

- compact;
- high trust;
- tactile;
- no decorative hero copy;
- no generic card grid;
- no fake website or external Telegram chat;
- enough magic to make the buyer want to touch the screen.

### Why The Previous Visual References Failed

The earlier image references looked like expensive UI posters, not like a UIKit
generating a TMA. They were too complete at the first frame, so the viewer could
not feel where the interface came from.

They also separated the visual effect from the product value. A light sweep,
depth lift, or premium dark frame could sell any app. The opening effect must
instead make the buyer feel this exact system: semantic tokens, slots, safe-area
rails, runtime state, accessibility, and deterministic motion.

The new rule: the first page does not appear as a finished mockup. It is born
from one center point, then settles into a usable surface.

### First Viewport Composition

The first viewport uses one full-screen TMA frame.

Top zone:

- `TKHeader` with title `UIKit Surface Composer`.
- Subtitle: `Build premium Telegram surfaces`.
- One `TKIconButton` for theme, one `TKIconButton` for reduced motion preview,
  one `TKIconButton` for recorder mode.
- The header is compact and does not become a marketing hero.

Center zone:

- A single live preview surface named **Surface A**.
- Surface A is a realistic TMA mini screen, initially a premium checkout or
  booking surface built from existing UIKit pieces.
- Surface A uses `TKCard`, `TKCardCell`, `TKBadge`, `TKAvatarStack`,
  `TKSegmented`, `TKProgress`, `TKBottomBar`, and `TKButton`.
- The preview surface is not a screenshot. It is composed from real UIKit.

Left or upper rail, depending on viewport:

- A compact `TKSegmented` control: `Surface`, `Tokens`, `Runtime`.
- On mobile width, this becomes a top segmented strip.
- On wider demo/browser width, it can sit as a narrow side rail.

Bottom zone:

- `TKBottomBar` with one obvious first action:
  - primary: `Remix surface`;
- The secondary action `Show UIKit layers` is hidden during the first
  Token Singularity birth.
- After the first meaningful touch, the seed pulse travels into a compact
  `Layers` affordance and the secondary action appears.
- If native chrome is available, primary action maps to `TKMainButton`, but
  the in-DOM fallback remains visible in browser demo mode.
- MainButton is not the wow. It is proof that native chrome is integrated.

Floating detail layer:

- Three `TKCardChip` tags pinned to real parts of Surface A:
  - `tokens`;
  - `safe area`;
  - `state`.
- Chips are not decorative. Tapping a chip highlights the exact UIKit layer it
  represents.

### Token Singularity Arrival

The first load is cinematic but functional. It is not a spinner, logo reveal, or
blocking video. The TMA viewport is present from the first frame; the center
point explains where the UIKit surface comes from.

0 ms:

- TMA viewport is visible immediately.
- The screen is nearly empty, using tinted neutral `--tk-*` surfaces.
- One seed point sits in the exact visual center of the safe content area.
- The point is 4 px to 6 px and uses the current accent token.
- `data-motion-state="seed"` is present for deterministic capture.

0 to 180 ms:

- The seed point breathes once: scale `1` to `1.18` to `1`.
- The movement is quiet, like stored energy, not a loader loop.
- A faint static ready dot remains for reduced motion.

180 to 360 ms:

- The seed emits token rails:
  - spacing rails;
  - radius arcs;
  - typography baseline marks;
  - elevation shadow hints;
  - top and bottom safe-area bounds.
- Rails draw outward from the point using transform and opacity only.
- No particles without meaning. Every line maps to a UIKit or Telegram concept.

360 to 620 ms:

- Semantic token fragments appear around the seed and move to their destinations:
  - `surface` becomes the central Surface A canvas;
  - `accent` lights selected controls;
  - `text` and `muted` settle into labels;
  - `success`, `warning`, and `danger` attach to state-capable components;
  - `radius` defines card and chip corners;
  - `motion` becomes the interaction physics marker;
  - `safe area` forms the Telegram rails.
- Labels are tiny and transient. They should feel like an engineering trailer,
  not documentation pasted on the screen.

620 to 900 ms:

- Component slots materialize:
  - header;
  - Surface A;
  - segmented control;
  - layer chips;
  - recorder strip;
  - bottom action bar.
- Slots become real UIKit components with a 45 ms stagger.
- Components do not fly in from arbitrary directions; they resolve from the
  token geometry created by the seed.

900 to 1200 ms:

- Runtime state marks attach:
  - `themeChanged`;
  - `viewport`;
  - `safeArea`;
  - `haptic`;
  - `mainButton`;
  - `backButton`;
  - `fallback`, when not running inside native Telegram.
- The recorder strip captures the generation as system events.
- A final ready pulse moves from the seed to the nearest active layer chip.

After 1200 ms:

- Idle breathing begins only on Surface A and the seed memory, not the whole
  page.
- The original point is no longer a central dot. It becomes a small origin mark
  under the active chip or tap point.
- Scale changes from `1` to `1.004` over 2400 ms and back.
- Shadow opacity shifts by a tiny amount.
- Reduced motion disables breathing and replaces it with a static origin mark.

Touch recall:

- Any later tap briefly reveals the seed origin under the pointer.
- The origin pulse travels to the responsible token, component, or runtime chip.
- This makes even accidental taps feel expensive without adding random actions.

### Idle State

The screen must feel alive but not busy.

Surface A:

- soft depth;
- stable dimensions;
- no text movement;
- no layout shift;
- very subtle breathing;
- touchable regions show small affordance contours on pointer proximity.

Layer chips:

- `TKDot pulse` only on the active chip.
- Inactive chips stay calm.
- Each chip has a stable width so labels do not cause jump.

Bottom action area:

- Primary action has a calm pressed affordance only on touch.
- No endless shimmer.
- No fake urgency.

### Touch Model

Every primary object needs a response.

Tap Surface A background:

- A circular context pulse starts at the tap point.
- Nearby UIKit regions shift `1px` to `2px` away, then settle.
- The pulse ends in the closest layer chip.
- A tiny event mark appears in the mini recorder strip.
- Duration: 220 ms.
- Reduced motion: instant static ring for 500 ms.

Tap a `TKCardCell` inside Surface A:

- Cell compresses to scale `0.992` for 70 ms.
- Leading icon shifts `1px` down, then returns.
- Trailing value updates or reveals a state chip.
- If haptics are available, fire selection haptic once.
- If haptics are unavailable, no fake haptic claim. Show `mock` or `fallback`
  in recorder state.

Tap a `TKCardChip`:

- Chip becomes selected.
- Surface A dims non-related regions to 82 percent opacity.
- The related region gets a thin focus contour.
- The layer inspector rail slides in from the nearest edge by transform.
- Duration: 180 ms.
- Escape or Back closes the inspector first.

Long press Surface A:

- Surface A lifts by `translateY(-3px)` and exposes a shallow layer stack.
- Layers are named `template`, `components`, `tokens`, `runtime`, `a11y`.
- This is not a modal.
- The user can drag slightly left or right to scrub layers.
- Releasing returns the surface to normal.

Drag a layer chip:

- The chip detaches with a small lift and follows the pointer.
- Surface A highlights compatible drop zones.
- Dropping `tokens` on the preview opens token mapping.
- Dropping `state` opens interaction states.
- Dropping outside snaps back with 160 ms transform.
- No layout animation.

Tap empty space:

- Empty space is not dead.
- A small pulse travels to Surface A and then to the `runtime` chip.
- It communicates that the app understood the tap but no destructive action was
  taken.
- This is one of the "expensive product" details.

### Microinteraction Points

The following exact points need designed responses:

- Header title hover or press: title weight increases from 600 to 700 for
  120 ms, then settles. It must not resize.
- Theme icon press: icon rotates 22 degrees, tokens remap in Surface A, and the
  `tokens` chip counts one event.
- Recorder icon press: a small red `TKDot` appears for 800 ms, then the recorder
  strip expands by transform. No modal.
- Surface A top edge press: safe-area rails appear from top and bottom.
- Surface A bottom edge press: bottom bar demonstrates keyboard-safe rebound.
- Avatar stack press: `TKAvatarStack` fans out by `translateX`, then returns.
- Badge press: `TKBadge` flips tone between info and success, with the related
  state shown in the inspector.
- Progress ring press: `TKRing` advances by 7 percent and logs a state event.
- Primary action press: `TKButton` or native button enters loading for 420 ms,
  then success for 600 ms, then returns to idle.
- Secondary action reveal: after the first meaningful touch, `Show UIKit layers`
  appears as a proof affordance rather than first-frame developer chrome.
- Secondary action press: `Show UIKit layers` transitions to Screen 5.

### Motion Grammar

Use motion only for state, feedback, reveal, dismissal, or loading.

Allowed properties:

- transform;
- opacity;
- filter only for small focus contrast if performance remains stable;
- CSS variable interpolation for token changes.

Forbidden in Screen 1:

- animating width, height, top, left, margin, or padding;
- permanent background shimmer;
- decorative particle fields;
- full-screen intro animation;
- bounce or elastic gimmicks;
- animation that hides what component changed.

Default durations:

- tap compression: 70 ms down, 140 ms return;
- chip selection: 160 ms to 190 ms;
- inspector reveal: 180 ms to 220 ms;
- token remap: 180 ms;
- safe-area rail reveal: 160 ms;
- bottom bar rebound: 220 ms;
- idle breathing: 2400 ms cycle.

### UIKit Proof Inside The Screen

Screen 1 must visibly expose the kit without becoming docs.

When the user taps `tokens`:

- show the active semantic token names next to real UI regions;
- examples: `--tk-bg`, `--tk-card`, `--tk-accent`, `--tk-text`,
  `--tk-sep`, `--tk-r-md`;
- do not show a full token table.

When the user taps `safe area`:

- `TKSafeArea` rails appear;
- top and bottom rails show measured values;
- content magnetically avoids rails;
- bottom bar remains clear of the home indicator.

When the user taps `state`:

- show component state badges: default, pressed, loading, success, error,
  disabled, unsupported;
- each state points to one visible component;
- no generic checklist.

When the user taps `runtime`:

- show Telegram runtime source: native, mock, or browser fallback;
- show `themeChanged`, `viewportChanged`, `mainButton`, `haptic`,
  `backButton` as compact event chips only if they are part of the scenario.

### Visual Style

The visual style should feel like a precise product instrument, not a crypto
landing page.

Color:

- tinted neutral surfaces;
- one Telegram-friendly accent;
- small state colors only where state needs them;
- no purple-blue gradient wash;
- no neon cyberpunk;
- no black or pure white as new design decisions.

Typography:

- system font stack;
- compact hierarchy;
- no display font;
- no hero-scale type inside panels;
- labels must fit at 320 px width.

Layout:

- one primary live surface;
- compact controls;
- no nested cards;
- no identical feature-card grid;
- stable dimensions for chips, buttons, rail, recorder strip, and bottom bar.

### Accessibility And Reduced Motion

Screen 1 cannot fake craft by excluding accessibility.

Required:

- every interactive region has an accessible name;
- chips use button semantics or equivalent;
- focus ring is visible and not clipped;
- keyboard can reach Surface A, chips, top actions, and bottom actions;
- Escape closes the active inspector first;
- Back closes inspector before navigating;
- reduced motion preserves all meaning with static highlights and shorter fades;
- color is never the only way to understand state;
- recorder strip has polite status announcements.

### Data And Recorder Hooks

Screen 1 needs deterministic scenario data.

Minimum event record:

- timestamp;
- source: user, runtime, mock, system;
- event name;
- target component;
- visible reaction;
- fallback or native status.

Suggested test hooks:

- `data-demo-frame` on the outer capture target.
- `data-demo-screen="surface-composer"`.
- `data-demo-surface`.
- `data-demo-layer-chip="tokens|safe-area|state|runtime"`.
- `data-demo-inspector`.
- `data-demo-recorder-strip`.
- `data-demo-primary-action`.

Do not finalize hook names until implementation planning checks existing demo
conventions.

### Existing UIKit Used In Screen 1

Primary:

- `TKProvider`;
- `TKPage`;
- `TKSafeArea`;
- `TKHeader`;
- `TKSegmented`;
- `TKCard`;
- `TKCardCell`;
- `TKCardChip`;
- `TKBadge`;
- `TKDot`;
- `TKAvatarStack`;
- `TKProgress` or `TKRing`;
- `TKBottomBar`;
- `TKButton`;
- `TKIconButton`;
- `TKToastProvider`;
- `TKTooltip` or `TKPopper`.

Conditional:

- `TKMainButton` if native chrome is active;
- `TKSheet` only if an inspector cannot remain inline;
- `TKTimeline` only if the event strip needs more than compact chips.

Demo-only composition:

- `SurfaceComposerStage`;
- `SurfaceLayerPins`;
- `SurfaceInteractionRecorder`;
- `SurfaceSafeAreaRails`;
- `SurfaceTokenOverlay`.

Future UIKit candidates, not automatically public:

- `TKInteractionPulse`;
- `TKLayerInspector`;
- `TKMotionScope`;
- `TKSurfaceComposer`.

These candidates stay internal until a later API review proves they are
generically reusable outside this demo.

### Screen 1 Acceptance Criteria

- In 10 seconds, a reviewer understands that the demo sells the UIKit, not one
  custom TMA.
- A founder wants to touch the screen because it feels premium and alive.
- A developer can identify at least five real UIKit primitives being used.
- Every primary touch target has a purposeful response.
- Empty space is not dead, but it does not trigger random decoration.
- At least five microinteractions are discoverable without instructions.
- `Show UIKit layers` appears after the first meaningful touch and does not
  compete with the opening wow.
- MainButton, theme, safe area, and haptics are proof details, not hero claims.
- The screen works at 320 px width without overlapping text or controls.
- Reduced motion preserves meaning.
- Recorder events can prove the visible reactions.

### User Approval Questions For Screen 1

Answer these before implementation planning starts:

- Should Surface A start as checkout, booking, wallet, support, or a neutral
  "premium app shell"?
- Should the first obvious interaction be tapping Surface A, dragging a layer
  chip, or pressing `Remix surface`?

### Screen 1 Test Cases

Token Singularity states:

- Opening exposes deterministic states:
  `seed -> rails -> tokens -> components -> runtime -> idle`.
- Each state is addressable through `data-motion-state`, not only through
  timing sleeps.
- Visual snapshots are captured at the important states: seed, rails, tokens,
  components, runtime, idle.
- The same fixture produces the same state sequence and recorder output.

Reduced motion:

- seed remains visible as a static origin mark;
- token rails and component slots appear as static highlights;
- no breathing loop, rotation, particle travel, or long path motion is required
  to understand the opening.

Layout and Telegram constraints:

- 320 px, 375 px, 430 px, and desktop preview do not overlap header, token
  labels, layer chips, Surface A, recorder strip, or bottom actions;
- top and bottom safe-area rails appear from fixture values;
- Surface A and bottom action stay clear of the home indicator.

Recorder and data:

- recorder logs `tokenSeed`, `tokenRails`, `componentMaterialized`,
  `runtimeReady`, and `idleReady`;
- every later touch recall logs a source, target, visible reaction, and
  native/mock/fallback status.

Performance:

- opening uses transform and opacity for motion;
- token variable interpolation is allowed only for token remap;
- no width, height, top, left, margin, padding, or layout shift animation;
- no long task during the 1200 ms opening sequence.


## Screen 2: Template Remix Studio

Status: drafted for user review. Do not implement until approved.

Purpose:

Screen 2 proves that a TMA is a fast product surface for Telegram distribution,
not one fixed app screen. A founder should understand that the same UIKit can
generate checkout, booking, wallet, community, and support flows inside the
same Telegram-native shell.

Business reason for TMA:

- Telegram already contains the audience, identity context, chat-adjacent
  acquisition, sharing, and bot journey.
- The TMA should turn that audience into action without app install friction.
- UIKit makes the production of multiple TMA scenarios repeatable instead of
  hand-coded for every client.

### Core Visual Motif: Token Prism Remix

The seed origin from Screen 1 opens into a small prism of semantic tokens. The
current surface separates into meaningful fragments:

- header;
- hero/content area;
- price or value row;
- primary action;
- list or timeline;
- bottom bar;
- safe-area rails;
- runtime event strip.

The fragments rotate like physical surface tiles, then reassemble into the next
template. The movement must prove continuity: token identity, safe-area rails,
theme, selected segment, and runtime status remain anchored while the business
scenario changes.

Template cycle:

1. checkout;
2. booking;
3. wallet;
4. support;
5. community.

The user does not navigate through app pages. They remix one Telegram-native
surface.

### Secondary Motif: Card Gyroscope

The viewer can drag the central surface stack left or right. Cards rotate around
a calm center axis, like a premium physical object. The front card is always
readable; side cards are abstracted enough to avoid text distortion.

On release:

- the nearest template locks into the center;
- the token prism compresses back into the active seed mark;
- the recorder logs `templateChanged`, `tokensPreserved`,
  `safeAreaPreserved`, and `runtimePreserved`;
- the bottom action updates without layout shift.

### UIKit And TMA Proof

Must visibly prove:

- templates can share one token system;
- Telegram safe areas are preserved across business scenarios;
- theme variables remain mapped through tokens;
- interaction states survive the remix when they are still meaningful;
- runtime status is not reset just because the template changed;
- the shell remains TMA-sized and does not become a desktop dashboard.

Existing UIKit candidates to compose:

- `TKSegmented` or `TKCategoryTabs` for template categories;
- `TKCard`, `TKCardCell`, `TKProductCardA`, `TKBookingCard`,
  `TKPaymentSummary`, `TKWalletStatusCell`, `TKMessages`, `TKWriteBar`;
- `TKBottomBar`, `TKButton`, `TKBadge`, `TKDot`, `TKProgress`;
- `TKSafeArea`, `TKHeader`, `TKToastProvider`.

Demo-only composition:

- `TemplateRemixStage`;
- `TokenPrism`;
- `TemplateSurfaceTile`;
- `TemplateContinuityRecorder`.

Future UIKit candidates, not automatically public:

- `TKTemplateRemix`;
- `TKSurfacePreview`;
- `TKTokenMorph`;
- `TKTemplateRail`.

### Motion Detail

Remix trigger:

- press `Remix surface`;
- drag the surface stack;
- tap a template chip.

Timeline:

- 0 to 90 ms: active surface compresses to scale `0.992`;
- 90 to 220 ms: fragments separate by `translateZ`-like depth using transform;
- 220 to 480 ms: fragments rotate to the next scenario around the seed axis;
- 480 to 700 ms: fragments lock into the new template slots;
- 700 to 860 ms: state chips and recorder events settle;
- after 860 ms: the surface returns to the quiet breathing state.

Easing:

- ease-out-quart for separation and lock;
- no bounce;
- no elastic;
- no layout property animation.

Reduced motion:

- replace 3D-ish rotation with a stepped crossfade:
  `checkout -> booking -> wallet -> support -> community`;
- show static continuity marks for tokens, safe area, theme, and runtime;
- keep the recorder events identical.

### Test Cases

E2E:

- `Remix surface` changes template id in the expected order.
- Theme, safe-area values, selected segment, and runtime source persist through
  every remix.
- The same scenario can be restored from a deterministic fixture.
- `Escape` or Back cancels an in-progress inspector before leaving Screen 2.

Visual:

- capture before remix, mid-remix, lock state, and idle state;
- verify 320 px, 375 px, 430 px, and desktop preview;
- assert no text overflow, no overlapping chips, and no bottom bar jump.

Reduced motion:

- `prefers-reduced-motion` disables rotation and uses static steps;
- all proof labels remain available;
- recorder events match the full-motion path.

Performance:

- only transform and opacity animate;
- no layout shift budget failures during remix;
- no long task during card rotation.


## Screen 3: Interaction Microscope

Status: drafted for user review. Do not implement until approved.

Purpose:

Screen 3 proves that the expensive feeling is systematic. The buyer should see
that every tap, hover, long press, focus, loading state, haptic response, and
unsupported fallback is part of the UIKit contract, not custom animation glue.

Business reason for TMA:

- TMA conversion depends on instant confidence in a cramped WebView.
- Users decide quickly whether a Telegram surface feels real or cheap.
- Microinteractions create trust only when they are consistent, accessible, and
  resilient across Telegram clients.

### Core Visual Motif: Touch Lens

Any tap creates a short-lived lens at the contact point. The lens is not a
tooltip. It is a microscope that reveals the interaction stack:

- hit target;
- component name;
- state transition;
- semantic token;
- haptic native/mock/fallback status;
- focus or aria contract;
- recorder event.

The lens lasts 500 ms by default, then collapses into the responsible chip or
recorder mark. Empty space also responds: it shows "recognized, no action" and
routes the pulse to the runtime chip.

### Secondary Motif: Refracted State Card

Long press on a rich card or image splits it into thin meaning layers. This is
the user's requested "broken card with light refraction", but with product
meaning:

- visual layer;
- state layer;
- token layer;
- haptic/runtime layer;
- accessibility layer;
- test hook layer.

The layers separate by a few pixels with a restrained light refraction between
them. Text remains real DOM and readable, or deliberately fades into an intact
text layer before the split. The card must never look randomly shattered.

### Interaction Set

Required probes:

- tap card;
- tap badge;
- tap avatar stack;
- tap empty space;
- press primary action;
- long press rich card;
- drag card slightly to inspect depth;
- keyboard focus card;
- trigger loading, success, error, disabled, and unsupported states.

Each probe must reveal a real reason:

- component state;
- token;
- accessibility contract;
- haptic or runtime event;
- fallback branch;
- recorder proof.

### UIKit And TMA Proof

Existing UIKit candidates to compose:

- `TKTappable`, `TKButton`, `TKIconButton`;
- `TKCard`, `TKCardCell`, `TKCardChip`;
- `TKBadge`, `TKAvatarStack`, `TKRing`, `TKProgress`;
- `TKTooltip` or `TKPopper` for anchored details only;
- `TKToastProvider` for non-blocking state feedback;
- `TKFocus` behavior through existing focus-visible rules;
- Telegram runtime haptic wrapper or fallback event.

Demo-only composition:

- `TouchLens`;
- `RefractedStateCard`;
- `InteractionStackOverlay`;
- `HapticStatusMark`;
- `A11yContractPin`.

Future UIKit candidates, not automatically public:

- `TKInteractionPulse`;
- `TKStateInspector`;
- `TKHapticIndicator`;
- `TKFocusProbe`;
- `TKMotionScope`.

### Motion Detail

Touch Lens:

- 0 to 70 ms: local compression or focus response;
- 70 to 180 ms: lens expands from the touch point;
- 180 to 360 ms: stack labels appear in a radial but compact arrangement;
- 360 to 500 ms: lens collapses into the related chip or recorder event.

Refracted card:

- 0 to 90 ms: card lifts `translateY(-3px)` and scales to `1.006`;
- 90 to 260 ms: layers separate by 2 px to 6 px;
- 260 to 480 ms: light refraction passes between layers;
- drag scrub: layers rotate up to 8 degrees, text layer stays readable;
- release: layers recompose in 180 ms.

Reduced motion:

- no refraction sweep;
- static split layers;
- direct labels;
- same state and recorder events.

### Test Cases

E2E:

- every required probe creates one recorder event with source, target, state,
  visible reaction, and native/mock/fallback status;
- haptic calls are recorded only when available, otherwise fallback is explicit;
- keyboard focus triggers the same proof path as pointer focus;
- Escape closes the lens or layer split before leaving the screen.

Accessibility:

- all interactive regions have accessible names;
- focus ring is visible and not clipped during split state;
- aria snapshot reflects state changes;
- color is not the only state signal.

Visual:

- capture lens open, lens collapse, card split, card recomposed;
- verify text readability or deliberate text-layer isolation;
- verify no overlap at 320 px and RTL.

Reduced motion:

- split state becomes static;
- no transform depth beyond the minimum needed for meaning;
- recorder output matches the full-motion scenario.


## Screen 4: Telegram Runtime Stress

Status: drafted for user review. Do not implement until approved.

Purpose:

Screen 4 proves why a Telegram-specific UIKit exists. Ordinary web UI breaks or
feels fake under Telegram runtime pressure. This screen makes runtime events
visible as physical forces that the UIKit can absorb.

Business reason for TMA:

- Telegram gives distribution, account context, sharing, native chrome,
  chat-adjacent journeys, payments or wallet context, and fast return loops.
- Those advantages come with constraints: safe areas, keyboard viewport changes,
  theme variables, native buttons, BackButton behavior, haptics, and fallback
  clients.
- UIKit should make those constraints reliable enough to sell TMA work to real
  clients.

### Core Visual Motif: Runtime Gravity Well

The active surface enters a pressure chamber. Runtime events arrive as visible
forces from Telegram chrome:

- keyboard rises from the bottom and pushes content with measured clearance;
- safe-area rails squeeze and release the surface;
- BackButton pressure closes the active inspector first;
- MainButton state pulls the primary CTA into native chrome proof;
- haptic event produces a tiny local tick, not a fake device vibration claim;
- permission denial creates a reversible blocked state, not dead UI.

The UI does not panic, jump, or resize arbitrarily. It magnetically avoids
Telegram boundaries.

### Secondary Motif: Theme Shockwave

A `themeChanged` event enters from the top chrome as a controlled wave. It
passes through semantic tokens and remaps the UI:

- background;
- card;
- text;
- muted text;
- accent;
- separator;
- state colors.

This is not a dark/light toggle. It is proof that Telegram theme variables flow
through semantic UIKit tokens.

### Runtime Stressors

Required stressors:

- keyboard open;
- keyboard close;
- viewport height change;
- safe-area top and bottom change;
- native chrome on/off;
- BackButton visible/hidden;
- MainButton loading/success/error/fallback;
- haptic native/mock/unavailable;
- themeChanged;
- permission denied;
- browser fallback;
- runtime absence during SSR or non-Telegram preview.

### UIKit And TMA Proof

Existing UIKit candidates to compose:

- `TKSafeArea`, `TKBottomBar`, `TKMainButton`, `TKButton`;
- `TKHeader`, `TKPage`, `TKSegmented`;
- Telegram runtime re-export from `@tg-mini-app/telegram`;
- `useHasNativeChrome`;
- `TKToastProvider`, `TKBadge`, `TKDot`, `TKProgress`;
- browser fallback states where runtime is missing.

Demo-only composition:

- `RuntimePressureChamber`;
- `ThemeShockwaveOverlay`;
- `NativeButtonMirror`;
- `ViewportPressureMeter`;
- `RuntimeFallbackBadge`.

Future UIKit candidates, not automatically public:

- `TKRuntimeBoundary`;
- `TKViewportLab`;
- `TKSafeAreaRails`;
- `TKNativeButtonMirror`;
- `TKRuntimeEventLog`.

### Motion Detail

Keyboard pressure:

- 0 to 120 ms: bottom pressure rail appears;
- 120 to 260 ms: bottom bar translates to safe position;
- 260 to 420 ms: focused field remains visible and gets a static proof mark;
- no content jumps after the first settled frame.

Theme shockwave:

- 0 to 160 ms: top chrome emits wave;
- 160 to 360 ms: tokens remap in order: surface, text, accent, state;
- 360 to 520 ms: recorder logs `themeChanged` and `tokensMapped`.

BackButton:

- if inspector is open, Back closes inspector;
- if no overlay is open, Back prepares navigation;
- the visual pressure should make priority obvious.

Reduced motion:

- no wave sweep;
- token swatches update in place;
- pressure rails snap through static states.

### Test Cases

Runtime injection:

- inject each stressor from deterministic fixtures;
- assert visible state and recorder event for every fixture;
- assert runtime source is `native`, `mock`, or `fallback`.

Viewport and safe area:

- verify 320 px, 375 px, 430 px, desktop preview;
- verify top and bottom insets;
- verify bottom action never hides behind home indicator or keyboard;
- assert no overlap after each pressure event.

Native controls:

- MainButton state is mirrored honestly in browser mode;
- native mode and fallback mode are visually distinct;
- Back closes overlay before navigation.

Theme:

- Telegram theme values map through semantic tokens;
- no raw color-only state;
- visual snapshots for light, dark, and Telegram theme.

Reduced motion and performance:

- motion alternative preserves meaning;
- only transform, opacity, and token variable interpolation animate;
- no long task or layout shift during pressure changes.


## Screen 5: UIKit Layers / Build Proof

Status: drafted for user review. Do not implement until approved.

Purpose:

Screen 5 converts founder wow into engineering trust. The buyer has seen magic;
now the team must see that the magic is maintainable, testable, and built from
real UIKit layers instead of a one-off demo.

Business reason for TMA:

- A polished TMA is valuable only if the team can keep shipping scenarios after
  the launch.
- UIKit reduces the cost of future TMA surfaces by turning visual polish,
  Telegram runtime behavior, accessibility, docs, tests, and stories into a
  repeatable system.

### Core Visual Motif: Exploded UIKit Lattice

Long press on the active surface lifts it into a 3D-ish lattice. The lattice is
not a decorative exploded product render. Each layer is a real build proof:

- tokens;
- atoms;
- composites;
- templates;
- Telegram runtime hooks;
- accessibility contracts;
- Storybook evidence;
- tests;
- recorder evidence.

The viewer can scrub the lattice with a finger. Each layer can be isolated, then
recomposed into the live TMA surface.

### Secondary Motif: Evidence Pins

Small proof pins attach to real visible UI elements:

- token pin;
- component pin;
- Storybook pin;
- test pin;
- a11y pin;
- runtime fallback pin;
- recorder pin.

Pins must not become a grid or a docs page. They sit on the actual UI and prove
the object under them.

### UIKit And TMA Proof

Existing UIKit candidates to compose:

- all visible components from Screens 1-4;
- `TKAccordion` or `TKSegmented` for layer filters;
- `TKTimeline` for recorder evidence if needed;
- `TKBadge`, `TKDot`, `TKTooltip`, `TKPopper`;
- `TKButton`, `TKIconButton`, `TKBottomBar`.

Data sources must be fixture-backed:

- token names from the current design system;
- component names from known UIKit exports;
- story/test categories from deterministic local fixtures;
- recorder events from the current demo run.

Do not invent evidence. If an item is not yet real, mark it as `candidate` or
`planned`, not `passed`.

Demo-only composition:

- `ExplodedUIKitLattice`;
- `EvidencePinLayer`;
- `BuildProofScrubber`;
- `LayerRecomposeControl`.

Future UIKit candidates, not automatically public:

- `TKLayerStack`;
- `TKTokenTrace`;
- `TKBuildEvidence`;
- `TKA11yContractPanel`;
- `TKTestBadge`.

### Motion Detail

Lattice open:

- 0 to 120 ms: surface lifts by `translateY(-4px)`;
- 120 to 340 ms: layers separate in a shallow stack;
- 340 to 520 ms: evidence pins attach to their source regions;
- 520 to 700 ms: scrub handle becomes active.

Layer scrub:

- horizontal drag moves between layers;
- active layer is fully readable;
- inactive layers stay visible as context but do not steal focus;
- recomposition returns to live surface in 220 ms.

Broken-card refraction option:

- one card can split into refracted pieces here if Screen 3 uses the simpler
  Touch Lens path;
- every fragment must map to a build layer;
- text remains a preserved layer, not shattered glyphs.

Reduced motion:

- show static stacked layers;
- no parallax;
- no refraction sweep;
- preserve focus order and proof pins.

### Test Cases

Evidence integrity:

- every proof pin maps to a fixture item;
- missing evidence appears as `candidate` or `planned`, never `passed`;
- recorder evidence is generated from current session events.

Layer behavior:

- layers can be toggled independently;
- recomposition restores the live surface;
- keyboard can move through layer controls;
- Escape closes the lattice before leaving the screen.

Visual:

- capture closed surface, lattice open, active token layer, active tests layer,
  recomposed surface;
- verify no text overlap and no unreadable evidence pins at 320 px;
- verify RTL and long localized labels.

Reduced motion:

- static stack preserves all layer meanings;
- no required information depends on depth or refraction.


## Screen 6: Shareable Proof / Handoff

Status: drafted for user review. Do not implement until approved.

Purpose:

Screen 6 turns the demo into a shareable artifact. It must answer "what do I
send to the person with budget?" and "what do engineers use next?" without
leaving the TMA.

Business reason for TMA:

- TMA work is sold through Telegram context: chats, channels, founders,
  agencies, investors, and client handoffs.
- The final artifact should be easy to forward, replay, inspect, and implement.
- The proof must stay honest about native versus mock versus browser fallback.

### Core Visual Motif: Proof Compression

All meaningful events from the run compress back into the original center seed.
The seed then opens into a proof capsule:

- templates remixed;
- interactions tested;
- runtime events survived;
- accessibility covered;
- reduced motion covered;
- fallback branch identified;
- UIKit layers exposed;
- share/replay available.

This is not a marketing card. It is a receipt generated from recorder data.

### Secondary Motif: Investor Replay Ribbon

A narrow replay ribbon shows deterministic milestones:

1. token birth;
2. template remix;
3. touch lens;
4. runtime stress;
5. layer proof;
6. proof capsule.

The ribbon is not a video. It is a replay of recorded states, so it can be
tested, paused, and restored.

### UIKit And TMA Proof

Existing UIKit candidates to compose:

- `TKCard`, `TKCardCell`, `TKBadge`, `TKDot`, `TKProgress`;
- `TKTimeline` if it fits the replay ribbon;
- `TKButton`, `TKMainButton`, `TKBottomBar`;
- `TKToastProvider` for share fallback;
- `TKSheet` only if a compact handoff preview needs a focused overlay.

Generated proof fields:

- scenario id;
- template sequence;
- runtime source;
- native capabilities available;
- fallback capabilities used;
- interaction count;
- accessibility status;
- reduced-motion status;
- evidence layer count;
- replay deep link or local replay id;
- deterministic proof hash.

Demo-only composition:

- `ProofCompressionStage`;
- `ProofCapsule`;
- `InvestorReplayRibbon`;
- `ScenarioReceipt`;
- `ShareFallbackPanel`.

Future UIKit candidates, not automatically public:

- `TKProofCard`;
- `TKScenarioReceipt`;
- `TKRecorderTimeline`;
- `TKShareSheetFallback`;
- `TKCapabilityMatrix`.

### Motion Detail

Compression:

- 0 to 160 ms: visible events become small marks around the surface;
- 160 to 360 ms: marks travel back to the seed origin;
- 360 to 620 ms: seed opens into the proof capsule;
- 620 to 820 ms: proof fields settle in groups: founder, developer, agent;
- after 820 ms: replay ribbon becomes interactive.

Share action:

- native share available: primary action maps to native path and logs it;
- browser fallback: open inline fallback panel with copy/replay controls;
- never claim native share when unavailable.

Reduced motion:

- no compression travel;
- show static milestones, then proof capsule;
- keep proof hash and replay id identical.

### Test Cases

Data integrity:

- proof capsule is generated from recorder fixture data;
- identical fixture produces identical proof hash and visual state;
- missing native capability is shown as fallback, not passed.

Replay:

- replay ribbon restores each milestone deterministically;
- deep link or local replay id restores scenario state;
- pause and resume do not mutate proof data.

Share:

- native branch and fallback branch are both testable;
- copy action works in browser fallback;
- proof card remains readable at 320 px and in RTL.

Accessibility and reduced motion:

- proof capsule sections have accessible names;
- replay ribbon is keyboard reachable;
- static reduced-motion milestones preserve the same meaning.


## Cross-Screen Motion System

The demo has one continuous motion language. The center point from Screen 1 is
not a one-time intro. It changes role on every screen:

- Screen 1: seed token that generates the first TMA surface.
- Screen 2: prism origin that remixes templates.
- Screen 3: touch lens origin that exposes interaction state.
- Screen 4: runtime pressure sensor that shows Telegram forces.
- Screen 5: lattice core that separates build layers.
- Screen 6: proof seal that compresses the run into a shareable receipt.

Allowed easing:

- ease-out-quart for common UI feedback;
- ease-out-quint for surface assembly and recomposition;
- ease-out-expo for the rare signature reveal moments;
- no bounce;
- no elastic.

Timing rules:

- immediate tap feedback starts within 70 ms;
- common transitions stay between 150 ms and 260 ms;
- signature reveal moments can run 700 ms to 1200 ms;
- idle breathing can run 2200 ms to 3600 ms, only on one active object;
- no screen blocks user understanding while waiting for choreography.

Allowed animated properties:

- transform;
- opacity;
- small local mask or clip-path only when isolated and measurable;
- semantic CSS variable interpolation for token remap.

Forbidden motion:

- layout property animation: width, height, top, left, margin, padding;
- permanent shimmer;
- generic particle fields;
- generic 3D carousel;
- broken-card effects that look like damage instead of inspection;
- tabbar-style app navigation as the primary structure;
- MainButton, theme, haptics, or safe area as standalone wow.


## Cross-Screen Test Contract

Every animated capability scene must be deterministic enough for automation.

Minimum hooks:

- `data-demo-frame` on the outer capture target.
- `data-demo-screen` with one of:
  `token-singularity`, `template-remix`, `interaction-microscope`,
  `runtime-stress`, `layers-proof`, `shareable-proof`.
- `data-motion-origin="token-singularity"`.
- `data-motion-state` with one of:
  `idle`, `seed`, `rails`, `tokens`, `components`, `runtime`, `entering`,
  `active`, `settling`, `settled`, `reduced`.
- `data-motion-event` with one of:
  `token-birth`, `template-remix`, `tap-lens`, `card-refraction`,
  `runtime-pressure`, `theme-shockwave`, `surface-explode`,
  `proof-compress`.
- `data-demo-recorder-event` on visible recorder rows or chips.
- `data-runtime-mode="native|mock|browser-fallback"`.
- `data-reduced-motion="true|false"`.

Pass criteria:

- triggering any visible effect creates a recorder event with source, target,
  visible reaction, and native/mock/fallback status;
- active animation reaches `settled` or `idle` within the defined budget;
- rapid taps do not leave the surface stuck in `entering` or `active`;
- reduced motion preserves meaning without rotation, long path motion, or depth
  travel;
- 320 px, 375 px, 430 px, desktop preview, RTL, and long localized text do not
  overlap;
- keyboard focus and pointer interaction expose equivalent proof where relevant;
- visual snapshots target deterministic motion states, not arbitrary video
  frames.

Fail criteria:

- an effect can be swapped into another UI library without losing meaning;
- an effect fires but recorder state does not know what happened;
- a Telegram runtime feature is presented as native when only fallback is
  available;
- a layer, test, or proof pin claims evidence that does not exist;
- animation hides the component or token that changed;
- visual polish depends on inaccessible color-only state.


## Role-Agent Review Integration

Five subagents reviewed the direction from different buyer and builder roles:

- Telegram/TON founder: prioritized why TMA matters commercially and pushed
  Screen 2 and Screen 4 as the main business value proof.
- Senior TMA engineer: required deterministic runtime fixtures, honest fallback
  states, reduced-motion paths, and candidate APIs staying internal until
  reviewed.
- Creative director: rejected tabbar navigation, generic carousel, decorative
  shattered cards, and standalone MainButton/theme/safe-area wow.
- Product motion designer: defined the single narrative device where the center
  point changes role across all six screens.
- QA automation lead: required fixed motion states, visual snapshots by state,
  no layout animation, no overlap, recorder evidence, and reduced-motion gates.

The integrated line is:

> token point generates the TMA, remixes it, refracts touch, survives Telegram
> runtime pressure, opens into build proof, and compresses into a shareable
> receipt.


## Surprises & Discoveries

- Observation: The earlier `Launch Echo` idea still centered the demo on a
  custom TMA scene. It did not directly sell the UIKit as the product.
  Evidence: user rejected the direction because it did not fit selling the
  UIKit.

- Observation: The repo already has a broad public UIKit surface that can sell
  composition without inventing many new public APIs.
  Evidence: `packages/uikit/src/index.ts` exports foundation, tokens, atoms,
  composites, overlays, feedback, templates, and Telegram runtime re-exports.

- Observation: `plans.md` already contained a completed ExecPlan. The file's own
  convention says the one active multi-milestone effort lives here, so this plan
  supersedes it.

- Observation: Static premium UI references failed because they showed finished
  screens instead of the system that generates them.
  Evidence: the user rejected the images and proposed a center point that
  gradually creates the first page as token generation.

- Observation: The 5 role-agent reviews converged on the same structure:
  `Token Singularity`, `Template Prism`, `Component Refraction`,
  `Runtime Pressure Chamber`, `Build Tomography`, and `Proof Card Forge`.
  Evidence: founder, engineer, creative, motion, and QA reviews all rejected a
  typical app/navigation flow and required capability scenes.


## Decision Log

- Decision: The demo direction is `UIKit Surface Composer`, not `Living Telegram
  Surface` as a standalone app concept.
  Rationale: the demo must sell reusable UIKit composition, not one custom
  magical TMA.
  Date/Author: 2026-06-16 / Codex.

- Decision: Use `UIKit Surface Composer` as the approved working name.
  Rationale: the name says what the demo sells: composing premium TMA surfaces
  from the UIKit, not presenting a decorative atelier or standalone app.
  Date/Author: 2026-06-16 / User.

- Decision: Use Apple/OpenAI-style product reveal pacing.
  Rationale: the user wants premium presentation, but the demo must not copy a
  brand skin. The relevant pattern is cold open, one strong idea per screen,
  signature motion first, proof immediately after, and sparse exact copy.
  Date/Author: 2026-06-16 / User plus Codex.

- Decision: Reveal `Show UIKit layers` only after the first meaningful touch.
  Rationale: first-frame developer chrome would weaken the Token Singularity
  opening. The user approved the recommendation to let the surface feel alive
  first, then expose the engineering proof.
  Date/Author: 2026-06-16 / User.

- Decision: Detail one screen at a time and wait for user approval before
  expanding the next screen.
  Rationale: previous broad ideation drifted away from the selling goal. A
  screen-by-screen gate keeps the concept aligned.
  Date/Author: 2026-06-16 / Codex.

- Decision: `plans.md` stays exhaustive and agent-facing, while chat responses
  stay human, short, and synchronized through `Human Sync Snapshot`.
  Rationale: the user needs to co-design screen direction in chat, not receive a
  pasted planning file.
  Date/Author: 2026-06-16 / Codex.

- Decision: Screen 1 starts with a live UIKit-composed surface, not a Telegram
  chat, bot comparison, revenue scenario, or component grid.
  Rationale: the buyer needs to feel premium craft while immediately seeing the
  reusable system behind it.
  Date/Author: 2026-06-16 / Codex.

- Decision: Screen 1 opening uses `Token Singularity`.
  Rationale: the previous premium visual references looked like finished UI
  posters. A center seed point makes the first page feel generated from UIKit
  tokens, safe-area rails, component slots, runtime states, and motion rules.
  Date/Author: 2026-06-16 / Codex.

- Decision: Screens 2-6 are capability scenes, not a typical application with
  tabbar or navbar navigation.
  Rationale: the demo must show why TMA and this UIKit matter: remixable
  scenarios, touch physics, Telegram runtime pressure, build proof, and
  shareable recorder evidence.
  Date/Author: 2026-06-16 / Codex.

- Decision: The chosen visual line is `Template Prism`, `Component Refraction`,
  `Runtime Pressure Chamber`, `Build Tomography`, and `Proof Card Forge`.
  Rationale: 5 role-agent reviews converged on this sequence as the strongest
  way to keep the Token Singularity language across the whole demo.
  Date/Author: 2026-06-16 / Codex plus role-agent reviews.

- Decision: Cinematic motion must be deterministic and testable.
  Rationale: the demo is still a UIKit sales surface. Every visible effect needs
  recorder evidence, reduced-motion fallback, no layout animation, fixed
  motion states, and responsive no-overlap tests.
  Date/Author: 2026-06-16 / Codex plus QA automation review.

- Decision: New public UIKit elements are blocked by default.
  Rationale: the product value is stronger if the demo mostly proves existing
  exports. Any new public element must pass API, tests, Storybook, docs,
  accessibility, reduced-motion, and package review.
  Date/Author: 2026-06-16 / Codex.


## Outcomes & Retrospective

This section is intentionally empty until Screen 1 is approved and work proceeds.
