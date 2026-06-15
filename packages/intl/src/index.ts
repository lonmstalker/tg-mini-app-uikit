/**
 * @tg-mini-app/intl — a tiny localization engine for Telegram Mini Apps.
 * `createI18n` builds a typed provider + `t()` with `Intl.PluralRules` plurals;
 * `resolveLang` maps a Telegram language_code (+ override) to a supported lang;
 * `formatDate`/`toIsoDate` are locale-aware date helpers. No UI, no platform.
 */
export { createI18n } from "./i18n";
export type { CreateI18nConfig, I18nProviderProps, Translator, LangState, I18nApi } from "./i18n";
export { formatMessage, selectPlural } from "./format";
export { resolveLang } from "./lang";
export type { ResolveLangOptions } from "./lang";
export { formatDate, toIsoDate } from "./dates";
