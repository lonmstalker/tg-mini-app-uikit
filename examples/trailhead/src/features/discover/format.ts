import type { Lang } from "../../i18n";
import type { T } from "../../i18n";

/** "450 Stars" / "450 Stars" (Stars is a Telegram brand term, kept in both). */
export const starsLabel = (t: T, count: number) => t("unit.stars", { count });

/** "★ 450" compact form for cards. */
export const starsShort = (t: T, count: number) => t("unit.starsShort", { count });

/** Localized medium date, e.g. "Sun, Jun 21" / "вс, 21 июн.". */
export function formatDate(iso: string, lang: Lang): string {
  const d = new Date(`${iso}T00:00:00`);
  return new Intl.DateTimeFormat(lang === "ru" ? "ru-RU" : "en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(d);
}

/** YYYY-MM-DD in local time (avoids the UTC off-by-one of toISOString). */
export function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
