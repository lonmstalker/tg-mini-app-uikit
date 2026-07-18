import { useEffect } from "react";
import { useWebApp } from "@tg-mini-app/telegram";

/**
 * Paint `html`/`body` (and the native chrome behind them) in the host theme.
 *
 * Why this exists: `--tk-*` tokens are scoped to the `.tk` root and never
 * resolve at `html`/`body` level, so anything that reveals the page behind
 * the app — iOS rubber-band overscroll, a WebKit keyboard pan, the strip
 * under a shrinking `TKAppShell` while the keyboard animates — flashes the
 * UA default (white) unless the page itself is painted. `TKApp` calls this
 * automatically; apps composing bare `TKProvider` must call it themselves
 * with their RESOLVED theme (wiki/ios-debugging.md).
 *
 * Inside Telegram the `--tg-theme-*` globals follow the client theme; the
 * literal fallbacks mirror `--tk-bg` for plain-browser runs. Restores the
 * previous inline styles on unmount.
 */
export function useTKHostBackground(resolvedTheme: "light" | "dark"): void {
  const wa = useWebApp();
  useEffect(() => {
    if (typeof document === "undefined") return;
    const html = document.documentElement;
    const body = document.body;
    // #0e1621/#eef1f6 mirror --tk-bg in tokens.css (pinned by tokens-contract);
    // --tk-bg itself is scoped to .tk and cannot be read from html/body.
    const fallback = resolvedTheme === "dark" ? "#0e1621" : "#eef1f6";
    const bg = `var(--tg-theme-secondary-bg-color, var(--tg-theme-bg-color, ${fallback}))`;
    const previous = [html.style.background, html.style.overscrollBehavior, body.style.background, body.style.overscrollBehavior] as const;
    html.style.background = bg;
    body.style.background = bg;
    // Rubber-band overscroll on the body feeds Telegram's swipe-to-minimize.
    html.style.overscrollBehavior = "none";
    body.style.overscrollBehavior = "none";
    try {
      // Keep the native chrome behind the app in the same color family.
      wa?.setBackgroundColor?.("secondary_bg_color");
    } catch {
      /* older clients throw on unsupported calls */
    }
    return () => {
      html.style.background = previous[0];
      html.style.overscrollBehavior = previous[1];
      body.style.background = previous[2];
      body.style.overscrollBehavior = previous[3];
    };
  }, [wa, resolvedTheme]);
}
