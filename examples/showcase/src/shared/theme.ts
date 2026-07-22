import { useState } from "react";
import type { TKTheme } from "tg-mini-app-uikit";

const SITE_THEME_STORAGE_KEY = "showcase-theme";

function getInitialTheme(): TKTheme {
  if (typeof window === "undefined") return "dark";

  try {
    const stored = window.localStorage.getItem(SITE_THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
    if (stored !== null) window.localStorage.removeItem(SITE_THEME_STORAGE_KEY);
  } catch {
    // System theme detection still works when storage is unavailable.
  }

  if (typeof window.matchMedia !== "function") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function useSiteTheme() {
  const [theme, setTheme] = useState<TKTheme>(getInitialTheme);
  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      window.localStorage.setItem(SITE_THEME_STORAGE_KEY, next);
    } catch {
      // The explicit choice still works for this page when storage is unavailable.
    }
  };

  return { theme, toggleTheme };
}
