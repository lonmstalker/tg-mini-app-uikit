/**
 * Dependency-graph guardrails for the monorepo. Two jobs:
 *  - `no-circular`: catch import cycles before they break tree-shaking.
 *  - package-boundary rules: keep the DDD edges acyclic and one-directional
 *    (UI → platform/engine, never the reverse; `async` free of `intl`/`telegram`).
 *    The boundary rules are added as the leaf packages land (M4–M6).
 *
 * @type {import('dependency-cruiser').IConfiguration}
 */
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      comment: "Circular imports break tree-shaking and make load order undefined.",
      from: {},
      to: { circular: true },
    },
    // DDD package boundaries (the target graph): edges point UI → platform/engine,
    // never the reverse; async and intl have no edge between them; the leaf
    // engines stay platform/UI-free. uikit→intl/async is deferred to v1.0.
    {
      name: "async-is-engine-pure",
      severity: "error",
      comment: "@tg-mini-app/async must import neither intl, telegram, nor uikit.",
      from: { path: "^packages/async/src" },
      to: { path: "(@tg-mini-app/(intl|telegram)|packages/(intl|telegram|uikit)/|tg-mini-app-uikit)" },
    },
    {
      name: "intl-is-platform-free",
      severity: "error",
      comment: "@tg-mini-app/intl must import neither telegram, async, nor uikit.",
      from: { path: "^packages/intl/src" },
      to: { path: "(@tg-mini-app/(telegram|async)|packages/(telegram|async|uikit)/|tg-mini-app-uikit)" },
    },
    {
      name: "telegram-is-a-leaf",
      severity: "error",
      comment: "@tg-mini-app/telegram is a true leaf — no intl, async, or uikit imports.",
      from: { path: "^packages/telegram/src" },
      to: { path: "(@tg-mini-app/(intl|async)|packages/(intl|async|uikit)/|tg-mini-app-uikit)" },
    },
    {
      name: "uikit-engine-edges-deferred",
      severity: "error",
      comment: "uikit→intl/async edges are deferred to v1.0; uikit may only peer on @tg-mini-app/telegram.",
      from: { path: "^packages/uikit/src" },
      to: { path: "(@tg-mini-app/(intl|async)|packages/(intl|async)/)" },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    // Post-compilation deps: TS elides `import type`, so a type-only edge (e.g.
    // the old TKTheme reference) is NOT a runtime cycle and must not be flagged.
    tsPreCompilationDeps: false,
    enhancedResolveOptions: {
      extensions: [".ts", ".tsx", ".js", ".jsx"],
      mainFields: ["module", "main", "types"],
    },
  },
};
