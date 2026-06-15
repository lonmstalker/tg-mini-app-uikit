import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { formatMessage } from "./format";

/**
 * Build a typed i18n engine from per-language dictionaries. The app owns the
 * dictionaries (their key set is the typed contract); `createI18n` supplies the
 * provider, the `t()` translator (with `Intl.PluralRules` plurals), and the
 * language/RTL state. It knows nothing about any UI kit.
 */
export interface CreateI18nConfig<L extends string, D extends Record<string, string>> {
  dicts: Record<L, D>;
  /** Language used when a key (or the active language) is missing. */
  fallback: L;
}

export interface I18nProviderProps<L extends string> {
  /** Uncontrolled initial language (default: the fallback). */
  initialLang?: L;
  /** Controlled language (e.g. persisted by a store). */
  lang?: L;
  onLangChange?: (lang: L) => void;
  initialRtl?: boolean;
  rtl?: boolean;
  onRtlChange?: (rtl: boolean) => void;
  children?: ReactNode;
}

/** `t("key")` / `t("key", { placeholder })` for the active language. */
export type Translator<D extends Record<string, string>> = (
  key: keyof D & string,
  vars?: Record<string, string | number>,
) => string;

/** Active language + setters and the RTL flag (everything `useLang` exposes). */
export interface LangState<L extends string> {
  lang: L;
  setLang: (lang: L) => void;
  rtl: boolean;
  setRtl: (rtl: boolean) => void;
}

export interface I18nApi<L extends string, D extends Record<string, string>> {
  I18nProvider: (props: I18nProviderProps<L>) => ReactElement;
  useT: () => Translator<D>;
  useLang: () => LangState<L>;
}

export function createI18n<L extends string, D extends Record<string, string>>({
  dicts,
  fallback,
}: CreateI18nConfig<L, D>): I18nApi<L, D> {
  type Value = LangState<L> & { t: Translator<D> };
  const I18nContext = createContext<Value | null>(null);

  function I18nProvider({
    initialLang = fallback,
    lang: controlledLang,
    onLangChange,
    initialRtl = false,
    rtl: controlledRtl,
    onRtlChange,
    children,
  }: I18nProviderProps<L>): ReactElement {
    const [uncontrolledLang, setUncontrolledLang] = useState<L>(initialLang);
    const [uncontrolledRtl, setUncontrolledRtl] = useState<boolean>(initialRtl);
    const lang = controlledLang ?? uncontrolledLang;
    const rtl = controlledRtl ?? uncontrolledRtl;

    const setLang = useCallback(
      (next: L) => {
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

    const t = useCallback<Translator<D>>(
      (key, vars) => {
        const template = dicts[lang]?.[key] ?? dicts[fallback]?.[key] ?? key;
        return formatMessage(template, vars ?? {}, lang);
      },
      [lang],
    );

    const value = useMemo<Value>(() => ({ lang, setLang, rtl, setRtl, t }), [lang, setLang, rtl, setRtl, t]);
    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
  }

  function useI18n(): Value {
    const ctx = useContext(I18nContext);
    if (!ctx) throw new Error("useT/useLang must be used inside the I18nProvider returned by createI18n");
    return ctx;
  }

  const useT = (): Translator<D> => useI18n().t;
  const useLang = (): LangState<L> => {
    const { t: _t, ...rest } = useI18n();
    return rest;
  };

  return { I18nProvider, useT, useLang };
}
