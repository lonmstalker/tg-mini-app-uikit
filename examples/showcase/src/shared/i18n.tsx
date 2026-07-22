import {
  createContext,
  use,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { SITE_LOCALE_STORAGE_KEY, STRINGS, type SiteLocale, type SiteStrings } from "./strings";

interface SiteLocaleContextValue {
  locale: SiteLocale;
  setLocale: (locale: SiteLocale) => void;
  strings: SiteStrings;
}

const SiteLocaleContext = createContext<SiteLocaleContextValue | null>(null);

function browserLocale(): SiteLocale {
  return typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("ru")
    ? "ru"
    : "en";
}

function initialLocale(): SiteLocale {
  if (typeof window === "undefined") return "en";

  try {
    const stored = window.localStorage.getItem(SITE_LOCALE_STORAGE_KEY);
    if (stored === "en" || stored === "ru") return stored;
    if (stored !== null) window.localStorage.removeItem(SITE_LOCALE_STORAGE_KEY);
  } catch {
    // Language detection still works when storage is unavailable.
  }

  return browserLocale();
}

export function SiteLocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<SiteLocale>(initialLocale);

  useLayoutEffect(() => {
    document.documentElement.lang = locale;
    try {
      window.localStorage.setItem(SITE_LOCALE_STORAGE_KEY, locale);
    } catch {
      // Locale remains usable for the current session when storage is unavailable.
    }
  }, [locale]);

  const value = useMemo(
    () => ({ locale, setLocale, strings: STRINGS[locale] }),
    [locale],
  );

  return <SiteLocaleContext.Provider value={value}>{children}</SiteLocaleContext.Provider>;
}

export function useSiteLocale(): SiteLocaleContextValue {
  const value = use(SiteLocaleContext);
  if (!value) throw new Error("useSiteLocale must be used inside SiteLocaleProvider");
  return value;
}
