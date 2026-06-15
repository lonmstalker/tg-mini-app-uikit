import type { T } from "../../i18n";

// Locale-aware date helpers now live in @tg-mini-app/intl (de-duped from this
// copy). `formatDate(iso, lang)` keeps working: the demo's Lang ("en"/"ru") is
// a valid BCP-47 locale, and the kit's own calendar/chips-date copies adopt
// these at v1.0 (the first deliberate uikit→intl edge — deferred for now).
export { formatDate, toIsoDate } from "@tg-mini-app/intl";

/** "450 Stars" / "450 Stars" (Stars is a Telegram brand term, kept in both). */
export const starsLabel = (t: T, count: number) => t("unit.stars", { count });

/** "★ 450" compact form for cards. */
export const starsShort = (t: T, count: number) => t("unit.starsShort", { count });
