#!/usr/bin/env node
/*
 * Static gate: transitions and keyframes in packages/uikit/src must animate
 * compositor-friendly properties only (transform/opacity/color/background...).
 * Animating layout (height/width/grid-template-rows/...) or paint-heavy
 * (box-shadow/filter) properties causes jank on low-end devices — the exact
 * "неплавно почти везде" class of bugs from the 2026-07-14 audit.
 *
 * Conscious exceptions live in scripts/animatable-props-allowlist.json with a
 * reason each. The gate is a ratchet: a finding not covered by the allowlist
 * fails, and an allowlist entry whose findings shrank/disappeared also fails
 * (so the list only ever gets shorter). Run: node scripts/check-animatable-props.mjs
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const SRC = join(ROOT, "packages/uikit/src");
const ALLOWLIST_PATH = join(import.meta.dirname, "animatable-props-allowlist.json");

const BANNED_BASES = [
  "height", "width", "left", "top", "right", "bottom",
  "max-width", "max-height", "min-width", "min-height",
  "margin", "padding", "inset", "grid-template-rows", "grid-template-columns",
  "flex-basis", "box-shadow", "filter", "backdrop-filter", "all",
];

function isBanned(prop) {
  const p = prop.toLowerCase();
  return BANNED_BASES.some((b) => p === b || p.startsWith(`${b}-`));
}

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (/\.(css|tsx|ts)$/.test(entry.name)) out.push(full);
  }
  return out;
}

const lineOf = (text, index) => text.slice(0, index).split("\n").length;

/** Split a transition shorthand value on top-level commas (cubic-bezier() has inner commas). */
function splitTopLevel(value) {
  const parts = [];
  let depth = 0;
  let cur = "";
  for (const ch of value) {
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      parts.push(cur);
      cur = "";
    } else cur += ch;
  }
  if (cur.trim()) parts.push(cur);
  return parts.map((p) => p.trim()).filter(Boolean);
}

/** First token of each comma segment of a `transition` shorthand = property name. */
function transitionProps(value) {
  return splitTopLevel(value)
    .map((seg) => seg.split(/\s+/)[0])
    .filter((tok) => tok && !/^(none|\d|\.|var\()/.test(tok));
}

/** Slice the JS expression that follows `transition:` in a style object — up to
 * the first top-level `,` or closing bracket, skipping over string literals. */
function jsExpressionSlice(text, start) {
  let depth = 0;
  let i = start;
  while (i < text.length) {
    const ch = text[i];
    if (ch === '"' || ch === "'" || ch === "`") {
      const q = ch;
      i++;
      while (i < text.length && text[i] !== q) {
        if (text[i] === "\\") i++;
        i++;
      }
    } else if ("([{".includes(ch)) depth++;
    else if (")]}".includes(ch)) {
      if (depth === 0) break;
      depth--;
    } else if (ch === "," && depth === 0) break;
    i++;
  }
  return text.slice(start, i);
}

function scanFile(file) {
  const findings = [];
  const raw = readFileSync(file, "utf8");
  const text = raw.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " ")); // keep line numbers

  // 1) CSS `transition:` / `transition-property:` declarations.
  for (const m of text.matchAll(/(?:^|[;{])\s*(transition|transition-property)\s*:\s*([^;}]+)/g)) {
    const props = m[1] === "transition" ? transitionProps(m[2]) : splitTopLevel(m[2]);
    for (const prop of props) {
      if (isBanned(prop)) findings.push({ file, line: lineOf(text, m.index), prop, kind: m[1] });
    }
  }

  // 2) Inline React styles: transition / transitionProperty values. The whole JS
  //    expression after the colon is sliced (ternaries included) and every string
  //    literal inside it is parsed. `${...}` interpolations are blanked; a property
  //    name hidden entirely inside an interpolation is invisible to this gate —
  //    keep property lists literal.
  if (/\.tsx?$/.test(file)) {
    for (const m of text.matchAll(/\btransition(Property)?\s*:\s*/g)) {
      const expr = jsExpressionSlice(text, m.index + m[0].length);
      for (const lit of expr.matchAll(/["']([^"'\n]*)["']|`([^`]*)`/g)) {
        const value = (lit[1] ?? lit[2] ?? "").replace(/\$\{[^}]*\}/g, "var(--x)");
        const props = m[1] ? splitTopLevel(value) : transitionProps(value);
        for (const prop of props) {
          if (isBanned(prop)) findings.push({ file, line: lineOf(text, m.index), prop, kind: "inline transition" });
        }
      }
    }
  }

  // 3) @keyframes blocks (CSS files and style strings in TSX alike).
  for (const m of text.matchAll(/@keyframes\s+[\w-]+\s*\{/g)) {
    let depth = 1;
    let i = m.index + m[0].length;
    while (i < text.length && depth > 0) {
      if (text[i] === "{") depth++;
      else if (text[i] === "}") depth--;
      i++;
    }
    const block = text.slice(m.index + m[0].length, i);
    for (const decl of block.matchAll(/(?:^|[;{])\s*([a-zA-Z-]+)\s*:/g)) {
      if (isBanned(decl[1])) {
        findings.push({ file, line: lineOf(text, m.index + m[0].length + decl.index), prop: decl[1], kind: "keyframes" });
      }
    }
  }

  return findings;
}

const findings = walk(SRC).flatMap(scanFile);
const allowlist = JSON.parse(readFileSync(ALLOWLIST_PATH, "utf8")).entries;

// Group findings by (file, property) and reconcile with the allowlist ratchet.
const byKey = new Map();
for (const f of findings) {
  const key = `${relative(ROOT, f.file)}::${f.prop}`;
  if (!byKey.has(key)) byKey.set(key, []);
  byKey.get(key).push(f);
}

let failed = false;
for (const [key, group] of byKey) {
  const [file, prop] = key.split("::");
  const entry = allowlist.find((e) => e.file === file && e.property === prop);
  const allowed = entry?.count ?? 0;
  if (group.length > allowed) {
    failed = true;
    console.error(`FAIL ${file}: ${group.length} animated \`${prop}\` (allowed ${allowed}):`);
    for (const f of group) console.error(`  ${file}:${f.line} — ${f.kind}: ${prop}`);
  }
}
for (const entry of allowlist) {
  const key = `${entry.file}::${entry.property}`;
  const actual = byKey.get(key)?.length ?? 0;
  if (actual < entry.count) {
    failed = true;
    console.error(
      `STALE ${entry.file}: allowlist permits ${entry.count} \`${entry.property}\` but only ${actual} remain — ` +
        "shrink the allowlist entry in the same change (the gate is a ratchet).",
    );
  }
}

if (failed) {
  console.error(
    "\ncheck-animatable-props: animate transform/opacity instead, or add a reasoned " +
      "entry to scripts/animatable-props-allowlist.json (reviewed exceptions only).",
  );
  process.exit(1);
}
console.log(`check-animatable-props: ${findings.length} allowlisted, 0 new ✓`);
