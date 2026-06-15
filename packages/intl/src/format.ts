/**
 * Message formatting: `{placeholder}` substitution plus an ICU-lite `plural`
 * sub-syntax backed by `Intl.PluralRules` — the piece the kit's `{placeholder}`
 * formatter lacks, so Slavic forms (1 гид / 2 гида / 5 гидов) come out right.
 *
 *   "{count, plural, one {# гид} few {# гида} many {# гидов} other {# гида}}"
 *   "{count, plural, =0 {no guides} one {# guide} other {# guides}}"
 *
 * `#` inside a chosen branch is the number; `{name}` anywhere substitutes a var.
 */

/** CLDR plural category for `n` in `locale` (ru: 1→one, 2→few, 5→many). */
export function selectPlural(locale: string, n: number): Intl.LDMLPluralRule {
  return new Intl.PluralRules(locale).select(n);
}

/** Index of the `}` that closes the `{` at `open` (brace-balanced). */
function matchBrace(s: string, open: number): number {
  let depth = 0;
  for (let i = open; i < s.length; i++) {
    if (s[i] === "{") depth++;
    else if (s[i] === "}" && --depth === 0) return i;
  }
  return s.length;
}

/** Parse a plural body `cat {msg} cat {msg} …` into category → raw message. */
function parsePluralForms(body: string): Record<string, string> {
  const forms: Record<string, string> = {};
  let i = 0;
  while (i < body.length) {
    while (i < body.length && /\s/.test(body[i])) i++;
    const head = /^(=\d+|\w+)\s*\{/.exec(body.slice(i));
    if (!head) break;
    const braceStart = i + head[0].length - 1;
    const end = matchBrace(body, braceStart);
    forms[head[1]] = body.slice(braceStart + 1, end);
    i = end + 1;
  }
  return forms;
}

function renderGroup(inner: string, vars: Record<string, string | number>, locale: string): string {
  const plural = /^(\w+)\s*,\s*plural\s*,\s*([\s\S]*)$/.exec(inner);
  if (plural) {
    const [, name, body] = plural;
    const n = Number(vars[name] ?? 0);
    const forms = parsePluralForms(body);
    const chosen = forms[`=${n}`] ?? forms[selectPlural(locale, n)] ?? forms.other ?? "";
    // Sub-message may carry `#` (the number) and further `{name}` placeholders.
    return formatMessage(chosen.replace(/#/g, String(n)), vars, locale);
  }
  return String(vars[inner.trim()] ?? "");
}

/** Substitute `{placeholder}` and resolve `{var, plural, …}` groups. */
export function formatMessage(template: string, vars: Record<string, string | number> = {}, locale = "en"): string {
  let out = "";
  let i = 0;
  while (i < template.length) {
    if (template[i] === "{") {
      const end = matchBrace(template, i);
      out += renderGroup(template.slice(i + 1, end), vars, locale);
      i = end + 1;
    } else {
      out += template[i++];
    }
  }
  return out;
}
