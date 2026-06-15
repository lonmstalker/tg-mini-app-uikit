/**
 * Locale-aware date helpers. `toIsoDate` avoids the UTC off-by-one of
 * `toISOString()` (it reads local Y/M/D); `formatDate` is `Intl.DateTimeFormat`
 * over a `YYYY-MM-DD` string, defaulting to a medium weekday form.
 */

/** `YYYY-MM-DD` in local time. */
export function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const MEDIUM: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" };

/** e.g. "Sun, Jun 21" / "вс, 21 июн." — `locale` is BCP-47 ("en", "ru", "ru-RU"). */
export function formatDate(iso: string, locale: string, opts: Intl.DateTimeFormatOptions = MEDIUM): string {
  return new Intl.DateTimeFormat(locale, opts).format(new Date(`${iso}T00:00:00`));
}
