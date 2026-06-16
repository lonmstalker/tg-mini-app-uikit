import type { ReactNode } from "react";
import { createI18n, resolveLang } from "@tg-mini-app/intl";
import { TKLocaleProvider, enLocale, ruLocale, type TKLocale } from "tg-mini-app-uikit";
import { en, type Dict, type DictKey } from "./enLocale";
import { ru } from "./ruLocale";

export type Lang = "en" | "ru";

/** Translator: `t("key")` or `t("key", { placeholder })`. */
export type T = (key: DictKey, vars?: Record<string, string | number>) => string;

const SUPPORTED: readonly Lang[] = ["en", "ru"];
/** The kit's own component strings, localized per demo language. */
const KIT_LOCALES: Record<Lang, TKLocale> = { en: enLocale, ru: ruLocale };

// The engine lives in @tg-mini-app/intl; the demo owns only the dictionaries
// and the kit-locale bridge (mirrors trailhead).
const { I18nProvider, useT, useLang } = createI18n<Lang, Dict>({ dicts: { en, ru }, fallback: "en" });

/** Initial language; `?lang=ru|en` deep-link overrides the Telegram client language. */
export function initialLangFor(languageCode: string | undefined): Lang {
  const override = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("lang") : null;
  return resolveLang<Lang>({ code: languageCode, supported: SUPPORTED, fallback: "en", override });
}

export interface LangProviderProps {
  initialLang?: Lang;
  children?: ReactNode;
}

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
