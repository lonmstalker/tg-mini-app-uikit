#!/usr/bin/env node
/*
 * Builds a per-component checklist against docs/component-rules.md.
 *
 *   node scripts/component-rules            # writes docs/component-checklist/
 *   node scripts/component-rules --check    # no writes; exits 1 on any `fail`
 *
 * Static analysis only: `manual` entries are rules a script cannot settle, and
 * `warn` means a detector fired, not that the rule is broken. Treat the report
 * as a worklist, not a verdict.
 */
import fs from "node:fs";
import path from "node:path";
import { collectComponents, collectEvidence } from "./collect.mjs";
import { RULES } from "./checks.mjs";

const MARK = { ok: "✓", fail: "✗", warn: "!", "n/a": "·", manual: "?" };
const OUT = path.join(process.cwd(), "docs/component-checklist");
const checkOnly = process.argv.includes("--check");

const components = collectComponents();
const evidence = collectEvidence();

const results = components.map((c) => ({
  name: c.name,
  file: c.file,
  group: c.group,
  rows: RULES.map((rule) => {
    try {
      return { rule, ...rule.run(c, evidence) };
    } catch (error) {
      return { rule, status: "warn", note: `check crashed: ${error.message}` };
    }
  }),
}));

const count = (rows, status) => rows.filter((r) => r.status === status).length;
const failing = results.filter((r) => count(r.rows, "fail") > 0);

/* ---------------- report ---------------- */

function matrix(rows) {
  const head = `| компонент | ${RULES.map((r) => r.id).join(" | ")} |`;
  const sep = `| --- | ${RULES.map(() => ":-:").join(" | ")} |`;
  const body = rows.map((r) => `| \`${r.name}\` | ${r.rows.map((x) => MARK[x.status]).join(" | ")} |`);
  return [head, sep, ...body].join("\n");
}

function details(rows) {
  return rows
    .filter((r) => r.rows.some((x) => x.status === "fail" || x.status === "warn"))
    .map((r) => {
      const lines = r.rows
        .filter((x) => x.status === "fail" || x.status === "warn")
        .map((x) => `- ${MARK[x.status]} **${x.rule.id}** ${x.rule.title} — ${x.note}`);
      return `### \`${r.name}\`\n\n[${r.file}](../../${r.file})\n\n${lines.join("\n")}`;
    })
    .join("\n\n");
}

const legend = [
  "Легенда: `✓` правило выполнено · `✗` нарушено · `!` сработал детектор, нужен",
  "человеческий взгляд · `·` неприменимо · `?` проверяется вручную.",
  "",
  "Сгенерировано `npm run check:rules` из [docs/component-rules.md](../component-rules.md).",
  "Файл перезаписывается — правьте скрипт в `scripts/component-rules/`, не отчёт.",
].join("\n");

if (!checkOnly) {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  const groups = [...new Set(results.map((r) => r.group))].sort();
  const fileOf = (group) => `${group.replace(/\//g, "-")}.md`;
  for (const group of groups) {
    const rows = results.filter((r) => r.group === group);
    fs.writeFileSync(
      path.join(OUT, fileOf(group)),
      `# Чеклист правил — ${group}\n\n${legend}\n\n## Матрица\n\n${matrix(rows)}\n\n## Замечания\n\n${details(rows) || "Замечаний нет.\n"}\n`,
    );
  }

  const summary = results
    .map((r) => ({ r, f: count(r.rows, "fail"), w: count(r.rows, "warn") }))
    .sort((a, b) => b.f - a.f || b.w - a.w || a.r.name.localeCompare(b.r.name))
    .map(({ r, f, w }) => `| \`${r.name}\` | ${r.group} | ${f} | ${w} | ${count(r.rows, "manual")} |`);

  fs.writeFileSync(
    path.join(OUT, "README.md"),
    [
      "# Чеклист компонентов по правилам кита",
      "",
      legend,
      "",
      `Компонентов: **${results.length}** · правил на компонент: **${RULES.length}** ·`,
      `с нарушениями: **${failing.length}**.`,
      "",
      "Разделы: " + groups.map((g) => `[${g}](${fileOf(g)})`).join(" · "),
      "",
      "## Правила",
      "",
      "| правило | что проверяет | ✗ | ! | ? |",
      "| --- | --- | :-: | :-: | :-: |",
      ...RULES.map((rule, i) => {
        const col = results.map((r) => r.rows[i].status);
        const n = (s) => col.filter((x) => x === s).length;
        return `| **${rule.id}** | ${rule.title} | ${n("fail")} | ${n("warn")} | ${n("manual")} |`;
      }),
      "",
      "## Сводка по компонентам",
      "",
      "| компонент | группа | ✗ | ! | ? |",
      "| --- | --- | :-: | :-: | :-: |",
      ...summary,
      "",
    ].join("\n"),
  );
  console.log(`check:rules → docs/component-checklist/ (${results.length} компонентов, ${failing.length} с нарушениями)`);
}

for (const r of failing) {
  for (const x of r.rows.filter((x) => x.status === "fail")) console.error(`${r.name.padEnd(22)} ${x.rule.id.padEnd(3)} ${x.note}`);
}
console.log(
  `итог: ${results.length} компонентов · ` +
    ["fail", "warn", "manual"].map((s) => `${s}=${results.reduce((n, r) => n + count(r.rows, s), 0)}`).join(" · "),
);

if (checkOnly && failing.length) process.exit(1);
