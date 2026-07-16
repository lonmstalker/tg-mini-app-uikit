# Device testing — 2026-07-16 findings (real phone + Telegram Desktop)

Nine issues reported from testing the deployed Trailhead Mini App on an iPhone
and Telegram Desktop on a laptop. Every reproducible one is pinned by
`packages/uikit/test/device-findings.test.tsx`; fixes land at the kit level
where the trap is generic, in the demo where it is product behavior. Related:
[[telegram-runtime]], [[trailhead-demo]].

The single most important lesson, verified against the official
`telegram-web-app.js`: **the bridge defines every method on every client and
THROWS at call time** (`WebAppMethodUnsupported`, `WebAppInlineModeDisabled`,
`WebAppRequestChatOpened`…). Method presence is NOT feature detection. Version
gates + try/catch around every native call are mandatory.

## 1. "Suggest to a chat" does nothing

- **Root cause**: `switchInlineQuery` throws `WebAppInlineModeDisabled` when
  the bot has no inline mode. Not detectable upfront — `initParams.
  tgWebAppBotInline` is private to the script. The hook let the throw escape.
- **Kit**: `useDataTransport` catches and returns `false` (plus a 6.6 version
  gate); `sendData` same treatment.
- **Demo**: the button toasts "bot has no inline mode" on `false`.
- **Follow-up option**: enable inline mode for the bot via BotFather, then the
  button works end-to-end.

## 2. "Create the group chat" does nothing

- **Root cause, revised after "my client is the latest"**: two layers.
  (a) Older clients: `requestChat` exists and THROWS below 9.6 — fixed with a
  version gate + try/catch (`useContactRequest`/`useWriteAccess` got the same
  6.9 treatment).
  (b) **Fresh clients**: the bridge script ships AHEAD of the apps. The call
  posts `web_app_request_chat` and waits for `requested_chat_sent/failed`; a
  client that passes the 9.6 version check but hasn't implemented the event
  handler silently drops it — **the callback never fires, the promise never
  settles**, no toast, nothing. No version gate can catch this.
- **Kit**: `useChatRequest` keeps the gate + catch and now documents the
  client-lag hazard; the generic rule went into the docs Runtime Policy.
- **Demo**: the trip-prep action no longer uses `requestChat` at all. "Invite
  the group" opens `https://t.me/share/url?...` via `openTelegramLink` — the
  one chat-picker mechanism every shipping client implements. The invite text
  carries the hike title/date and the bot link.

## 3. Fingerprint key shows on a laptop and does nothing

- **Root cause**: the official bridge creates `BiometricManager` on EVERY
  platform, desktop included — `isSupported` (presence + version) is a trap.
  Real absence only surfaces as `isBiometricAvailable === false` after
  `init()`.
- **Kit**: `useBiometrics` now exposes reactive `isAvailable`
  (`undefined` until known → init + `biometricManagerUpdated` event).
- **Demo**: `useBiometricKeyAvailable` inits once and renders the key only on
  `isAvailable === true` (progressive reveal — hidden until proven).
- **Expected laptop behavior after redeploy**: the fingerprint key does not
  render at all — PIN is the only path. This holds on BOTH desktop answer
  paths: the client reports `isBiometricAvailable=false` (key stays hidden),
  or the client silently drops the biometry init event (availability stays
  `undefined` → key stays hidden). If a desktop client ever ships Touch ID
  support for Mini Apps, the key appears automatically — availability is read
  from the client, not hardcoded per platform.

## 4. Payment sheet opens too small; dragging shows a grey area

- **Root cause A (demo)**: `snapPoints={[0.55, 0.92]}` opened at 55% and cut
  off the confirm copy + CTA. Removed — the checkout sheet is content-sized.
- **Root cause B (kit)**: with snap points the content box was sized to the
  CURRENT snap and resized only on commit, so a drag-up revealed blank panel
  until release. Fixed (OVL-013): the box is pinned to the full height for the
  duration of the gesture (one imperative write at drag start, cleared at
  end), so revealed area always shows content.

## 5. Should "Reset" close the filter sheet?

- **Call**: yes, closed now. Standard iOS pattern keeps it open (user may keep
  adjusting), but reset's only intent here is "show me everything" — the
  restored feed is the feedback. e2e updated to the new contract.

## 6. On the phone, the pay CTA sits below the visible area, unreachable

- **Root cause, v2 (confirmed by the retest — "still half a button")**: the
  launch classifier. `main.tsx` dropped the bridge whenever `initData` was
  empty — but real clients legitimately launch with an empty `initData`
  (e.g. the main Mini App opened from the bot profile), while ALWAYS stamping
  `platform`. Those launches ran the app in the browser-fallback mode INSIDE
  Telegram: a DOM pay bar instead of the native MainButton, no `expand()`
  (the bridge was already deleted), an unmanaged viewport — the bar landed
  half below the visible area with nothing to scroll.
- **Demo fix**: `isRealTelegramBridge` (telegram/launch.ts) classifies by
  `platform !== "unknown"` — the outside-Telegram stub's default — and
  `initData` goes back to being what it is: a server-side auth artifact, not
  a presence signal. Pinned by `launch.test.ts`. The v1 layer stays too:
  `expand()` on mount + `#root` capped at
  `min(100%, var(--tg-viewport-stable-height, 100%))`.

## 7. "Check in" button is hard to hit

- **Kit**: the booking-card action was a bare text button (`padding: 0`). Now
  a ≥44px hit target (padding extended, negative margins keep the visual
  rhythm) — TCRD-004.

## 8. Buttons feel slow on the phone

- **Kit**: `.tk-press` gets `touch-action: manipulation` — kills the mobile
  double-tap-zoom wait. The demo's viewport meta was already correct, but the
  kit must not rely on host metas. Perceived latency also had a share from #9
  (the keyboard jump landing mid-tap).
- **Residual**: the prep actions await a native permission round-trip before
  toasting — that part is inherent.

## 9. iPhone keyboard: harsh jumps; send does nothing and locks up

- **Root cause A (kit)**: the page height / footer collapse followed
  `--tk-kb-height` in discrete jumps per visualViewport event. Now both ride
  one eased movement (`--tk-t3`, collapses under reduced motion).
- **Root cause B (kit)**: tapping the composer's send button first BLURRED the
  textarea → keyboard began closing → the bar moved out from under the finger
  → the click never landed; repeated taps repeated the cycle ("can't press
  again"). Fixed (CHT-007): the send button prevents the pointerdown default,
  focus stays in the textarea, the click lands, and the composer stays put.
- **Demo**: `GuideThread.send` also catches API failures and toasts (the
  composer clears optimistically, so a silent failure looked like a dead send).

## Verification status

| # | Reproduced by test | Fix level |
|---|--------------------|-----------|
| 1 | device-findings #1 | kit + demo toast |
| 2 | device-findings #2 (throw layer; the client-drop layer is untestable off-device) | kit gate + demo switched to t.me/share |
| 3 | device-findings #3 | kit `isAvailable` + demo gate |
| 4 | device-findings #4 | kit OVL-013 + demo content-sized sheet |
| 5 | booking.spec (updated) | demo UX call |
| 6 | launch.test.ts (classifier); geometry needs the device | demo: platform-based bridge detection + expand + stable-height cap |
| 7 | device-findings #7 | kit hit target |
| 8 | device-findings #8 (CSS contract) | kit touch-action |
| 9 | device-findings #9 + CSS contract | kit (pointerdown + eased shift) + demo toast |
