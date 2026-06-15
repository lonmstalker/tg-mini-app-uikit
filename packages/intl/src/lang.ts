/**
 * Resolve the active language from a Telegram `language_code` and an optional
 * explicit override (e.g. a `?lang=` deep link). Pure — no window access — so
 * it is trivially testable; read the override at the call site and pass it in.
 */
export interface ResolveLangOptions<L extends string> {
  /** Telegram `language_code`, e.g. "ru-RU". */
  code?: string | null;
  /** Supported languages, most-preferred first. */
  supported: readonly L[];
  /** Returned when nothing matches. */
  fallback: L;
  /** Explicit choice (deep link / stored pref) — wins when it is supported. */
  override?: string | null;
}

export function resolveLang<L extends string>({ code, supported, fallback, override }: ResolveLangOptions<L>): L {
  const pick = (candidate: string | null | undefined): L | undefined => {
    if (!candidate) return undefined;
    const lc = candidate.toLowerCase();
    return (
      supported.find((s) => s.toLowerCase() === lc) ?? // exact (ru === ru)
      supported.find((s) => lc.startsWith(`${s.toLowerCase()}-`)) ?? // ru-RU → ru
      supported.find((s) => lc.startsWith(s.toLowerCase())) // loose prefix
    );
  };
  return pick(override) ?? pick(code) ?? fallback;
}
