# Debugging Mini Apps on a real iOS device


**Summary**: How to see what actually happens inside Telegram iOS when a bug
does not reproduce anywhere else: the Trailhead `?kbdebug=1` forensics
overlay, how to read its timeline, the branch-push production loop that makes
device iteration fast, and the iOS keyboard event order this workflow
uncovered (bridge signal first, visualViewport second, WKWebView resize last).
**Status**: verified (used to close the 2026-07-17/18 keyboard saga)
**Updated**: 2026-07-18

---

## Why this exists

Safari remote inspector does not attach to Telegram's in-app WKWebView, the
desktop mock cannot reproduce client-driven viewport behavior, and three
plausible keyboard fixes (KB-1..KB-3) shipped without curing the reported
symptom. The overlay replaced hypothesis-driven fixes with data: ONE
screenshot after a failed interaction reconstructs the whole event timeline.
Related: [[device-testing]], [[telegram-runtime]], [[trailhead-demo]].

## The kbdebug overlay

`examples/trailhead/src/components/KeyboardDebug.tsx`, mounted from
`AppFrame`. Renders nothing unless activated, ships in production builds.

**Activation** (either):
- append `?kbdebug=1` to the Mini App URL — in practice: BotFather → Bot
  Settings → Menu Button → set
  `https://…workers.dev/trailhead/?kbdebug=1`, retest, then set the clean
  URL back;
- launch with start_param `kbdebug` (direct-link Mini App:
  `t.me/<bot>/<app>?startapp=kbdebug`).

**What it logs** — every signal the keyboard controller acts on, newest line
FIRST (overflow clipping eats the oldest lines):
- `vv.resize` / `vv.scroll` — visualViewport geometry events;
- `tg.vp` — the bridge's `viewportChanged`;
- `root.size` — a `.tk` root box change (ResizeObserver — catches the host
  resizing the root with no vv event at all);
- `root.attr` — any `--tk-kb-height`/`tk-kb-open` write (MutationObserver on
  `style`/`class`), exactly when it lands;
- `focusin` / `focusout` — focus moves;
- `scrollTo(x,y)` — every `window.scrollTo` call (monkey-patched), i.e. the
  kit's settle scroll and anything else yanking the page.

**Line format**: `  8507 vv.resize inH824 vv479+68 sy345 rt824 var345 open tg479/479 ae=TEXTAREA#`
- leading number — ms since overlay mount;
- `inH` — `window.innerHeight` (the LAYOUT viewport / WKWebView height);
- `vvH+O` — `visualViewport.height` + `offsetTop` (the WebKit pan);
- `sy` — `window.scrollY`;
- `rt` — the first `.tk` root's `getBoundingClientRect().height`;
- `var` / `open|shut` — applied `--tk-kb-height` and the `tk-kb-open` class;
- `tgH/S` — `WebApp.viewportHeight` / `viewportStableHeight`;
- `ae` — `document.activeElement` tag + `data-testid`.

**Workflow**: point the bot at the `?kbdebug=1` URL → fully close the Mini
App (swipe away) → reproduce the failure → screenshot → read the timeline
bottom-up. The user pastes one screenshot; that is the entire debug session.

## The fast device loop

Cloudflare **Workers Builds deploys EVERY branch push to production**, not
just `main` (verified: PR-branch bundles served from the prod URL minutes
after push). That makes device iteration a push-and-retest loop with no merge
needed — and it also means an unmerged branch IS live: don't leave a broken
branch as the last push. Verify what is actually deployed by fetching
`/trailhead/` and grepping the hashed bundle for a distinctive string of the
commit (`curl -s <url> | grep -c "<marker>"`); check-run timestamps alone
have been misread twice in this repo.

## What the timeline proved: iOS keyboard event order

On Telegram iOS (fullsize Mini App, 2026-07), opening the keyboard emits, in
order (real capture, ms since mount):

```
13795 focusin                      all quiet: inH824 vv824 rt824
13843 tg.vp     tg 824→479         bridge KNOWS first (~50ms after focus)
14269 vv.resize vv 824→479, inH824 WebKit follows ~430ms later
~14290          inH 824→479        the client resizes the WKWebView LAST
14309 root.size rt 824→479         stable-height cap propagates
```

Consequences, each of which was a shipped bug until measured:
- `innerHeight − vv.height` reads a full keyboard for ~20ms, then 0 with the
  keyboard open — any lift keyed on it double-moves and then strands the
  composer (kit fix: KB-4 in `useKeyboard` — when
  `viewportStableHeight` is a keyboard smaller than `innerHeight`, the HOST
  manages the keyboard: no lift, no height memory, no settle scroll);
- bare `100dvh` tracks the LAYOUT viewport, which shrinks LAST — cap app
  shells with `min(100dvh, var(--tg-viewport-stable-height, 100dvh))` and
  ease the change (`var(--tk-t3) var(--tk-ease)`) so the shell rides the
  keyboard animation instead of teleporting;
- there is NO per-frame keyboard position on iOS WebKit (one `vv.resize` at
  the end) — "glue the composer to the keyboard edge" is impossible for web;
  an eased height change of matching duration is the ceiling;
- the strip revealed under a shrinking shell is painted by `html`/`body` —
  `--tk-*` vars do NOT resolve there (scoped to `.tk`); paint them with the
  host's `--tg-theme-secondary-bg-color`/`--tg-theme-bg-color` so the strip
  follows the client theme instead of flashing #fff.

## Reading discipline

The saga took three wrong fixes because each hypothesis was plausible and
untestable. The rule this page encodes: when a symptom survives a fix on a
device you cannot inspect, STOP fixing and instrument — the overlay costs
~130 lines and one deploy, less than any second wrong hypothesis.
