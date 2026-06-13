# Quality Checklists

Use these checklists when a reusable UIKit element is non-trivial, public, stateful, interactive, Telegram-aware, or likely to affect package API.

## 1. Element classification checklist

- Classify the change as token, CSS variable, primitive, atom, composite, overlay, form control, navigation/layout, pattern/template, Telegram runtime hook/provider/adapter, utility, docs/story/test-only, or unknown/future type.
- Decide whether it is public API, internal infrastructure, or demo/docs support for reusable API.
- Search for the closest analog in `packages/uikit/src`, `packages/uikit/test`, `packages/uikit/storybook/<category>`, and `docs/site/pages`. Atoms use `packages/uikit/storybook/atoms`.
- Prefer extending an existing reusable surface when that is safer than adding a new one.

## 2. API/contract checklist

- Use existing `TK*` naming conventions for public components, hooks, types, and exported helpers.
- Define public vs internal status before editing exports.
- Keep props typed, minimal, and stable; avoid leaking implementation details.
- Define default behavior, events/callbacks, disabled/loading/error/empty/readonly states, and controlled/uncontrolled behavior where applicable.
- Define SSR and non-Telegram fallback behavior explicitly.
- Do not silently change current public semantics.

## 3. Token/style checklist

- Prefer semantic `--tk-*` variables and existing spacing/radius/shadow/z-index/motion scales.
- Add shared variables to `packages/uikit/src/styles/tokens.css`; keep truly local implementation vars local.
- `--tk-sep` is the base separator token; avoid accidental `--tk-separator` drift except where an existing alias is intentionally kept.
- Avoid raw hex/rgb/hsl values in components when a token exists.
- Avoid raw `px` values for shared spacing/radius when a token fits; local geometry may justify fixed values.
- Support light, dark, Telegram `--tg-theme-*`, and high-contrast/reduced-motion contexts as relevant.
- Avoid layout shift from loading states, icons, dynamic text, and overlays.

## 4. Accessibility checklist

- Prefer semantic HTML before ARIA.
- Give every interactive element an accessible name.
- Support keyboard-only use and visible focus that is not clipped.
- Wire field labels, descriptions, helper text, and errors with IDs.
- Manage focus entry, trap/restore, and inert/background behavior for overlays where applicable.
- Do not rely only on color, tooltip, icon, motion, or position to communicate state.
- Use status/live announcements when state changes are not otherwise perceivable.
- Keep mobile hit targets usable.

## 5. Telegram runtime checklist

- Access `window` only behind `typeof window !== "undefined"` or existing wrappers.
- Keep imports SSR-safe and render-safe outside Telegram.
- Use `TKTelegramProvider`, `useWebApp`, `useTelegramEvent`, and existing native button hooks/wrappers.
- Use feature detection by default when matching current hook style; use `isVersionAtLeast` only when the API really requires version gating, and document the choice.
- Clean up Telegram events, native button handlers, sensors, storage callbacks, viewport listeners, and timers.
- Prevent stale callback bugs with stable refs or effect dependencies.
- Treat `initDataUnsafe` as display-only; validate raw `initData` server-side.
- `SecureStorage` browser fallback must not be described as secure.
- Respect safe area, viewport, fullscreen, keyboard, and mobile shell behavior when relevant.

## 6. State machine checklist

- List states before coding: idle, open/closed, loading, success, error, disabled, readonly, empty, pending, unsupported, or selected/active.
- Define legal transitions and ignored transitions.
- Define controlled and uncontrolled authority if the element has state.
- Keep async race behavior explicit: cancellation, stale results, unmount, repeated clicks, and duplicate events.
- Make unsupported Telegram capability states visible in hook return types or no-op behavior.

## 7. Testing checklist

- Add contract/unit tests for pure logic, props, tokens, exports, and state transitions.
- For every source-changing element slice, add or update unit test evidence, Storybook evidence, and e2e evidence before marking the element implemented.
- Add component interaction tests for clicks, typing, keyboard, focus, async, disabled/loading/error states.
- Add SSR import/render tests when code touches browser globals, portals, effects, or Telegram APIs.
- Add Telegram mock tests for runtime hooks/providers/adapters.
- Add a11y tests where existing infrastructure supports it.
- Add API snapshot/export checks when public exports change.
- Use e2e or visual tests only when the repo already has a matching pattern and the risk warrants it.
- Do not update Playwright visual snapshots unless explicitly asked.

## 8. Storybook/docs checklist

- Add or update a Storybook story for each reusable public surface.
- Keep stories in `packages/uikit/storybook/<category>` and follow package-local category/helper patterns. Atoms use `packages/uikit/storybook/atoms`.
- Document public API, runtime behavior, theming, and fallback behavior in `docs/site/pages` when relevant.
- Ensure docs examples are supported by tests or implementation facts.
- Do not add one-off demo data as if it were reusable API.

## 9. Packaging/public export checklist

- Export public APIs through the existing package barrels, especially `packages/uikit/src/index.ts` and domain barrels.
- Update public API tests/snapshots when exports change.
- Keep package CSS side effects intentional through `style.css` and `tokens.css`.
- Run package checks when exports, build output, CSS entrypoints, or package metadata are affected.
- Do not add runtime dependencies unless necessary and justified.

## 10. Performance checklist

- Keep animations on transform/opacity where possible.
- Respect reduced motion and avoid long-running timers.
- Avoid unnecessary re-renders from unstable callbacks, objects, or context values.
- Clean up observers, listeners, intervals, RAFs, promises, and sensors.
- Keep overlay positioning and scroll/resize work throttled or scoped.
- Avoid bundle growth from broad imports or unnecessary dependencies.

## 11. Common gotchas in this repo

- `--tk-sep` is canonical; `--tk-separator` exists as an alias and should not become the new source of truth.
- Some component-local CSS variables are legitimate, but new shared semantic variables belong in `tokens.css`.
- `isVersionAtLeast` exists, but many Telegram hooks use feature detection; be explicit about the chosen strategy for new runtime APIs.
- `SecureStorage` browser fallback is a developer fallback, not secure storage.
- `initDataUnsafe` is display-only; validation of raw init data is server-side.
- Native Telegram buttons should go through existing hooks/wrappers.
- Do not update Playwright visual snapshots unless explicitly asked.
- The root `lint` script may be missing; inspect scripts before claiming lint coverage.
