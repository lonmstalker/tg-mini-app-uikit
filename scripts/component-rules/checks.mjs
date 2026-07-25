/*
 * One entry per rule in docs/component-rules.md. `run` returns a status:
 *
 *   ok     — the rule is satisfied (statically provable)
 *   fail   — the rule is broken
 *   warn   — a detector fired; a human has to look (heuristic, not a verdict)
 *   n/a    — the rule does not apply to this component
 *   manual — the rule cannot be proven statically (device/behavior/judgement)
 *
 * Keep every check cheap and textual: this file runs on every checklist build.
 */

const ok = (note) => ({ status: "ok", note });
const fail = (note) => ({ status: "fail", note });
const warn = (note) => ({ status: "warn", note });
const na = (note) => ({ status: "n/a", note });
const manual = (note) => ({ status: "manual", note });

/** Detectors read `code` — the file with comments stripped — never prose. */
const has = (c, re) => re.test(c.code);
const isProvider = (c) => /Provider$/.test(c.name);
/** Components the A3 rule names explicitly. */
const A3_TARGETS = /^TK(Progress|ProgressRing|Bars|Sparkline|Slider|RangeSlider|Switch|Checkbox|Rating|SwipeCell)$/;
const DRAGGY = /useDragGesture|onPointerDown|onTouchStart|pointermove|touchmove/;
const DATA_PROP = /^(title|subtitle|text|name|price|items|images|bars|data|rows|messages|description|author|steps|tabs|options)$/i;

export const RULES = [
  {
    id: "M1",
    title: "Three anchors per absorbed trap",
    run(c, ev) {
      const ids = [...new Set([...c.text.matchAll(/\b(REU|OVL|KB|INT|LST|INP|CC|ONB|NAV|FRM|GES|DEV|SEC|A11Y|CAR|TBL|BTN)-\d+\b/g)].map((m) => m[0]))];
      if (!ids.length) return na("no incident ID cited in this file");
      const noTest = ids.filter((id) => !ev.incidents.test.has(id));
      const noDocs = ids.filter((id) => !ev.incidents.docs.has(id));
      if (!noTest.length && !noDocs.length) return ok(`${ids.length} ID, all pinned + documented`);
      const parts = [];
      if (noTest.length) parts.push(`no pinned test: ${noTest.join(", ")}`);
      if (noDocs.length) parts.push(`no docs line: ${noDocs.join(", ")}`);
      return noTest.length ? fail(parts.join(" · ")) : warn(parts.join(" · "));
    },
  },
  { id: "M2", title: "Warn when you cannot absorb", run: (c) => (has(c, /useAnchorGuard|console\.warn/) ? ok("dev warning present") : manual("no dev warning — confirm nothing needs one")) },
  // M3/M4 bind the *workflow* — PR review promotes app learnings into the kit,
  // and the third device fix starts with TKViewportForensics — not any static
  // property of a component. Per-component `manual` on them was 232 identical
  // rows drowning the real questions, so they report n/a here; the rules live
  // in docs/component-rules.md and are enforced in review.
  { id: "M3", title: "Promote learnings into the kit", run: () => na("process rule — enforced in review, not a component property") },
  { id: "M4", title: "Instrument before the third fix", run: () => na("process rule — a device workflow, not a component property") },

  {
    id: "A1",
    title: "className/style reach the root, consumer style last",
    run(c) {
      if (isProvider(c)) return na("provider renders no root of its own");
      if (!c.rendersDom) return na("renders no DOM root (native chrome or pure delegation)");
      if (c.polymorphic) return ok("polymorphic: className/style ride ComponentProps<T>");
      const missing = ["className", "style"].filter((p) => !c.props.has(p));
      if (missing.length) return fail(`props type has no ${missing.join("/")}`);
      // Three shapes satisfy "consumer wins": spread last into the root's own
      // style object, handed straight to the root, or forwarded wholesale to a
      // child that merges it. A component that owns an inline root style AND
      // rest-spreads without `...style` is the REU-007 shape — the pinned
      // style/className sweep in test/reuse-audit-wave2 is the real check.
      const MERGED = /\.\.\.style|style=\{style\}|\{\.\.\.(rest|props|state)\}/;
      if (MERGED.test(c.declCode)) return ok("consumer style reaches the root");
      // `forwardRef(XImpl)` exports keep the JSX in a sibling function, so fall
      // back to the file before calling it a miss.
      if (MERGED.test(c.code)) return ok("consumer style merged in this file's implementation");
      return warn("style prop declared but no `...style` merge found");
    },
  },
  {
    id: "A2",
    title: "Icon escape hatch (TKIconProp)",
    run(c) {
      const icons = [...c.propTypes].filter(([n]) => /^(icon|.*Icon)$/i.test(n) && !/Bg$/.test(n));
      if (!icons.length) return na("no icon-shaped prop");
      const bad = icons.filter(([, t]) => !/TKIconProp|TKIconName/.test(t));
      return bad.length ? fail(`${bad.map(([n]) => n).join(", ")} typed ${bad[0][1].slice(0, 40)} — not TKIconProp`) : ok(icons.map(([n]) => n).join(", "));
    },
  },
  {
    id: "A3",
    title: "Per-instance color prop",
    run(c) {
      if (!A3_TARGETS.test(c.name)) return na("not a color-bearing component");
      if (c.props.has("color")) return ok("color prop");
      return has(c, /background|color/) && c.name === "TKSwipeCell" ? ok("color lives on each action") : fail("no per-instance color prop");
    },
  },
  {
    id: "A4",
    title: "Never invent demo data",
    run(c) {
      const bad = [...c.defaults].filter(([n, init]) => DATA_PROP.test(n) && /^("[^"]{3,}"|\[\s*[{"'])/.test(init));
      return bad.length ? fail(`placeholder default: ${bad.map(([n, i]) => `${n}=${i.slice(0, 24)}`).join(", ")}`) : ok("no invented content");
    },
  },
  {
    id: "A5",
    title: "No invisible regional defaults",
    run(c) {
      const copy = [...c.defaults].filter(([n, init]) => /label|placeholder|title|text/i.test(n) && /^"[A-Za-z]/.test(init));
      if (!copy.length) return ok("no built-in copy, or all via TKLocale");
      return fail(`hardcoded copy: ${copy.map(([n, i]) => `${n}=${i}`).join(", ")}`);
    },
  },
  {
    id: "A6",
    title: "Controlled AND uncontrolled",
    run(c) {
      const defaults = [...c.own].filter((p) => /^default[A-Z]|^defaultValue$/.test(p));
      if (!defaults.length) return na("stateless or fully controlled");
      if (has(c, /useControllable/)) return ok(`${defaults.join(", ")} via useControllable`);
      // Delegation counts: the child that renders the state owns the helper.
      if (defaults.some((d) => new RegExp(`default(Value|Checked|Snap|Expanded|Toggle|Index|Page)=\\{${d}\\}`).test(c.code)))
        return ok(`${defaults.join(", ")} delegated to a controllable child`);
      if (has(c, /useState/)) return fail(`${defaults.join(", ")} mirrored by hand — no authority-switch warning`);
      return warn(`${defaults.join(", ")} — verify the controlled path`);
    },
  },
  { id: "A7", title: "Survive real content", run: () => manual("long labels / i18n expansion — story or e2e evidence") },
  {
    id: "A8",
    title: "Public API is deliberate",
    run(c) {
      // A kept-for-compat alias is deliberate API, not a naming slip.
      if (!/^TK/.test(c.name) && c.deprecated) return na("deprecated alias — the TK-prefixed export is the public name");
      if (!/^TK/.test(c.name)) return fail(`exported as \`${c.name}\` — no TK prefix`);
      if (c.props.has("testId")) return ok("TK-prefixed, testId exposed");
      if (isProvider(c) || !c.rendersDom) return ok("TK-prefixed; no DOM root to hang a testId on");
      return warn("TK-prefixed but no testId hook");
    },
  },

  {
    id: "B1",
    title: "Overlays portal; absolute inside the host",
    run(c) {
      const portals = has(c, /createPortal|position: *"fixed"|position: *fixed/);
      if (!portals) return na("renders no overlay layer");
      if (has(c, /useOverlayPortal|useDropdownPortal|portal\.fixed/)) return ok("shared portal host");
      // Same contract, resolved inline — the telegram package cannot import the
      // uikit hook (the dependency runs the other way).
      if (has(c, /closest<HTMLElement>\("\.tk, \[data-tk-portal-root\]"\)/)) return ok("inlined host resolver (.tk / [data-tk-portal-root])");
      if (has(c, /closest<HTMLElement>\("\.tk"\)|closest\("\.tk"\)/)) return warn("own `.tk` lookup — misses [data-tk-portal-root]");
      return fail("fixed/portal without the shared host resolver");
    },
  },
  { id: "B2", title: "One TKAppShell at the stable viewport", run: (c) => (has(c, /(height|inset|top|bottom|flexBasis)[^,;\n]*100d?vh/) ? warn("sizes itself with raw dvh/vh — must cap at the stable viewport") : na("owns no app-level column")) },
  {
    id: "B3",
    title: "Never fight the host over the keyboard",
    // The old `/keyboard/i` matched React's `KeyboardEvent` type: 20 of 31
    // flags were arrow-key/Escape handlers — C3 territory, nothing to do with
    // the on-screen keyboard. B3 is about the viewport the keyboard resizes:
    // raw signals (scrollIntoView, visualViewport geometry) can fight the
    // host in host-managed mode (KB-3/KB-4) and need a human; going through
    // the kit's controller (useKeyboard / kbHostAbsorbs) is the sanctioned path.
    run(c) {
      if (has(c, /scrollIntoView|visualViewport|viewportStableHeight/)) return manual("raw viewport/scroll signal — check host-managed mode (KB-3/KB-4)");
      if (has(c, /useKeyboard\(|kbHostAbsorbs/)) return ok("keyboard state via the kit's controller");
      return na("no keyboard handling");
    },
  },
  { id: "B4", title: "Paint html/body in the host theme", run: (c) => (has(c, /useTKHostBackground/) ? ok("host background applied") : na("not an app root")) },
  { id: "B5", title: "Bridge vendored, classified by platform", run: (c) => (has(c, /tkResolveTelegramBridge|isRealTelegramBridge/) ? ok("uses the launch resolver") : na("does not resolve the bridge")) },
  {
    id: "B6",
    title: "Method presence is not feature detection",
    run(c) {
      // Subscriptions (onEvent/offEvent) exist on every client and need no gate.
      if (!/\bwa\.(?!onEvent|offEvent)[a-zA-Z]+\(/.test(c.code)) return na("makes no gated native call");
      return has(c, /tkSupports/) && has(c, /try\s*{/) ? ok("version gate + try/catch") : warn("native call without a visible tkSupports gate — check the call site");
    },
  },
  {
    id: "B7",
    title: "Native chrome goes through arbitration",
    run(c) {
      if (!has(c, /\bwa\.[a-zA-Z]+\(|window\.Telegram\.WebApp\./)) return ok("no ad hoc bridge call");
      return has(c, /useBackIntercept|useSuppressNativeButtons|Registry|registry/) ? ok("goes through the registries") : fail("direct wa.* call outside the registries");
    },
  },
  {
    id: "B8",
    title: "Own the vertical axis explicitly",
    run(c) {
      // A tap handler is not a dragged surface; a real drag tracks movement.
      if (!has(c, /useDragGesture|pointermove|touchmove|onPointerMove/)) return na("no dragged surface");
      if (has(c, /useVerticalSwipeGuard|useModalOverlay|useScrollLock/)) return ok("guard/lock wired");
      // A horizontal drag deliberately releases the vertical axis to the host
      // (touch-action: pan-y) — guarding it would break native scrolling.
      if (has(c, /axis: *"x"|touchAction: *"pan-y"/)) return ok("horizontal drag; vertical axis released to the host");
      return warn("drag handlers without a vertical-swipe guard — confirm the axis is not vertical");
    },
  },
  { id: "B9", title: "Trust boundary", run: (c) => (has(c, /initDataUnsafe|initData\b|SecureStorage/) ? manual("touches initData — display-only, validate server-side") : na("handles no init data")) },

  {
    id: "C1",
    title: "SSR-safe",
    run(c) {
      const top = c.text.split("\n").filter((l) => /^(export )?(const|let|var) /.test(l) && /\b(document|window)\./.test(l) && !/typeof/.test(l));
      return top.length ? fail(`module-scope DOM access: ${top[0].trim().slice(0, 60)}`) : ok("no import-time DOM access");
    },
  },
  {
    id: "C2",
    title: "Everything cleans up",
    run(c) {
      const add = (c.code.match(/addEventListener/g) ?? []).length;
      const rm = (c.code.match(/removeEventListener/g) ?? []).length + (c.code.match(/once: true/g) ?? []).length;
      const notes = [];
      if (add > rm) notes.push(`${add} addEventListener vs ${rm} remove/once`);
      // A fire-and-forget WAAPI tween dies with its element; a retained one
      // (kept in a ref, or carrying a finish listener) must be cancelled.
      if (has(c, /tkAnimateHeight|AnimRef|animRef/) && !has(c, /\.cancel\(\)/)) notes.push("retained animation never cancelled");
      if (notes.length) return fail(notes.join(" · "));
      if (!add && !has(c, /setTimeout|setInterval|requestAnimationFrame|Observer\(|\.animate\(/)) return na("no subscriptions");
      return ok("listeners/animations released");
    },
  },
  {
    id: "C3",
    title: "A11y is the contract",
    run(c, ev) {
      if (ev.mentions("a11y", c.name)) return ok("a11y-asserted in tests (role/name/aria/focus/keyboard)");
      return manual("no a11y assertion near any test mention — verify name/keyboard/focus by hand");
    },
  },
  {
    id: "C4",
    title: "Motion on transform/opacity",
    run(c, ev) {
      if (!has(c, /transition|animate|animation/i)) return na("no motion");
      // `tkAnimateHeight` IS the kit's audited size-animation path (useCollapse:
      // WAAPI, reduced-motion aware, cancelled on unmount) — the exception C4
      // allows. A raw CSS transition on height/width needs a reviewed
      // `check:animatable` entry instead.
      if (has(c, /tkAnimateHeight/)) return ok("size animated through the audited useCollapse helper");
      if (has(c, /transition:[^;"\n]*\b(height|width)\b|\b(height|width)[^;"\n]*transition/)) {
        return ev.animatable.has(c.file) ? ok("animated size, reviewed on the check:animatable allowlist") : warn("animates size — add a reviewed check:animatable entry or move to transform");
      }
      // Reduced motion is global: TKProvider stamps data-tk-motion="off" and the
      // kit stylesheet quiets --tk-dur. Only hand-rolled JS timing needs a check.
      if (has(c, /ReducedMotion|data-tk-motion|--tk-dur/)) return ok("reduced-motion honored explicitly");
      return has(c, /\.animate\(/) ? warn("JS-driven animation — confirm it quiets under data-tk-motion=\"off\"") : ok("CSS motion on transform/opacity, quieted by the root");
    },
  },

  {
    id: "D",
    title: "Definition of done evidence",
    // e2e runs the Storybook groups (e2e/*.storybook.spec.ts), not named
    // components — a story IS the e2e entry point, so it stands in for both.
    run(c, ev) {
      if (c.deprecated) return na("deprecated alias — evidence is tracked under the current name");
      const miss = ["unit", "story", "docs"].filter((b) => !ev.mentions(b, c.name));
      if (!miss.length) return ok("unit + story (e2e via the group spec) + docs");
      if (miss.includes("unit") || miss.includes("story")) return fail(`missing ${miss.join(", ")}`);
      return warn("no docs mention");
    },
  },
];
