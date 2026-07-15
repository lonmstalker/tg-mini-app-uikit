import { useState } from "react";
import type { TKTheme } from "tg-mini-app-uikit";

export function getInitialTheme(): TKTheme {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "dark";
  }

  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function useSiteTheme() {
  const [theme, setTheme] = useState<TKTheme>(getInitialTheme);
  const toggleTheme = () => setTheme((current) => (current === "dark" ? "light" : "dark"));

  return { theme, toggleTheme };
}
