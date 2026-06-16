/*
 * Thin continuity bridge over the kit's existing `useTelegramTheme` +
 * `useSafeArea` (D6 / Principle VI). No new event subscriptions — it just
 * surfaces the active theme and safe-area bounds so the surface frame can keep
 * theme/safe-area anchored across remix. Telegram constraints are the value.
 */
import { useSafeArea, useTelegramTheme, type TKSafeAreaInsets, type TKTheme } from "@tg-mini-app/telegram";

export interface ThemeBridge {
  theme: TKTheme;
  inset: TKSafeAreaInsets["inset"];
  contentInset: TKSafeAreaInsets["contentInset"];
}

export function useTelegramThemeBridge(): ThemeBridge {
  const theme = useTelegramTheme("light");
  const { inset, contentInset } = useSafeArea();
  return { theme, inset, contentInset };
}
