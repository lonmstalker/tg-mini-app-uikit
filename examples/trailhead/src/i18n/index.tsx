import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { TKLocaleProvider, enLocale, ruLocale, tkFormat, type TKLocale } from "tg-mini-app-uikit";
import { en, type Dict, type DictKey } from "./en";
import { ru } from "./ru";

export type Lang = "en" | "ru";

const DICTS: Record<Lang, Dict> = { en, ru };
/** The kit's own component strings, localized per demo language. */
const KIT_LOCALES: Record<Lang, TKLocale> = { en: enLocale, ru: ruLocale };

/** Maps a Telegram `language_code` (e.g. "ru-RU") to a supported demo language. */
export function resolveInitialLang(languageCode: string | undefined): Lang {
  return languageCode?.toLowerCase().startsWith("ru") ? "ru" : "en";
}

/**
 * Initial language, with a `?lang=ru|en` deep-link override taking precedence
 * over the Telegram client language. Lets the e2e suite run the signature chain
 * in either language before the in-app switcher (Platform Lab) exists.
 */
export function initialLangFor(languageCode: string | undefined): Lang {
  if (typeof window !== "undefined") {
    const override = new URLSearchParams(window.location.search).get("lang");
    if (override === "ru" || override === "en") return override;
  }
  return resolveInitialLang(languageCode);
}

/** Translator: `t("key")` or `t("key", { placeholder })` for templated copy. */
export type T = (key: DictKey, vars?: Record<string, string | number>) => string;

interface LangContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  rtl: boolean;
  setRtl: (rtl: boolean) => void;
  t: T;
}

const LangContext = createContext<LangContextValue | null>(null);

export interface LangProviderProps {
  initialLang?: Lang;
  /** Forces RTL layout (Platform Lab toggle). Defaults to off. */
  initialRtl?: boolean;
  /** Controlled language (Platform Lab persists it via the store). */
  lang?: Lang;
  onLangChange?: (lang: Lang) => void;
  rtl?: boolean;
  onRtlChange?: (rtl: boolean) => void;
  children?: ReactNode;
}

/**
 * Provides the active demo language + the matching kit `TKLocale`, plus an
 * RTL flag. Language may be uncontrolled (default from Telegram) or controlled
 * by the store once persistence lands in M1/M4.
 */
export function LangProvider({
  initialLang = "en",
  initialRtl = false,
  lang: controlledLang,
  onLangChange,
  rtl: controlledRtl,
  onRtlChange,
  children,
}: LangProviderProps) {
  const [uncontrolledLang, setUncontrolledLang] = useState<Lang>(initialLang);
  const [uncontrolledRtl, setUncontrolledRtl] = useState<boolean>(initialRtl);
  const lang = controlledLang ?? uncontrolledLang;
  const rtl = controlledRtl ?? uncontrolledRtl;

  const setLang = useCallback(
    (next: Lang) => {
      setUncontrolledLang(next);
      onLangChange?.(next);
    },
    [onLangChange],
  );
  const setRtl = useCallback(
    (next: boolean) => {
      setUncontrolledRtl(next);
      onRtlChange?.(next);
    },
    [onRtlChange],
  );

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = rtl ? "rtl" : "ltr";
  }, [lang, rtl]);

  const t = useCallback<T>(
    (key, vars) => {
      const template = DICTS[lang][key] ?? en[key];
      return vars ? tkFormat(template, vars) : template;
    },
    [lang],
  );

  const value = useMemo<LangContextValue>(
    () => ({ lang, setLang, rtl, setRtl, t }),
    [lang, setLang, rtl, setRtl, t],
  );

  return (
    <LangContext.Provider value={value}>
      <TKLocaleProvider locale={KIT_LOCALES[lang]}>{children}</TKLocaleProvider>
    </LangContext.Provider>
  );
}

function useLangContext(): LangContextValue {
  const ctx = use(LangContext);
  if (!ctx) throw new Error("useLang/useT must be used inside <LangProvider>");
  return ctx;
}

/** The translator function for the active language. */
export function useT(): T {
  return useLangContext().t;
}

/** Active language + setters (and the RTL flag). */
export function useLang(): Omit<LangContextValue, "t"> {
  const { t: _t, ...rest } = useLangContext();
  return rest;
}

export { en, ru, DICTS, KIT_LOCALES };
export type { Dict, DictKey };
