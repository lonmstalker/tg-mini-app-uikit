import type { ReactNode } from "react";
import { createI18n, resolveLang } from "@tg-mini-app/intl";
import { TKLocaleProvider, enLocale, ruLocale, type TKLocale } from "tg-mini-app-uikit";
import { en, type Dict, type DictKey } from "./en";
import { ru } from "./ru";

export type Lang = "en" | "ru";

/** Translator: `t("key")` or `t("key", { placeholder })` (with Intl plural support). */
export type T = (key: DictKey, vars?: Record<string, string | number>) => string;

const SUPPORTED: readonly Lang[] = ["en", "ru"];
/** The kit's own component strings, localized per demo language. */
const KIT_LOCALES: Record<Lang, TKLocale> = { en: enLocale, ru: ruLocale };

// The localization engine lives in @tg-mini-app/intl; the demo owns only the
// dictionaries (en/ru) and the kit-locale bridge.
const { I18nProvider, useT, useLang } = createI18n<Lang, Dict>({ dicts: { en, ru }, fallback: "en" });

/**
 * Initial language, with a `?lang=ru|en` deep-link override taking precedence
 * over the Telegram client language (lets the e2e suite run either language).
 */
export function initialLangFor(languageCode: string | undefined): Lang {
  const override = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("lang") : null;
  return resolveLang<Lang>({ code: languageCode, supported: SUPPORTED, fallback: "en", override });
}

export interface LangProviderProps {
  initialLang?: Lang;
  /** Controlled language (Platform Lab persists it via the store). */
  lang?: Lang;
  onLangChange?: (lang: Lang) => void;
  children?: ReactNode;
}

/**
 * Provides the active demo language (engine) and bridges it to the kit's
 * `TKLocale`, so kit components localize alongside the app's own strings.
 */
export function LangProvider({ children, ...rest }: LangProviderProps) {
  return (
    <I18nProvider {...rest}>
      <KitLocaleBridge>{children}</KitLocaleBridge>
    </I18nProvider>
  );
}

function KitLocaleBridge({ children }: { children?: ReactNode }) {
  const { lang } = useLang();
  return <TKLocaleProvider locale={KIT_LOCALES[lang]}>{children}</TKLocaleProvider>;
}

export { useT, useLang, en, ru };
export type { Dict, DictKey };
