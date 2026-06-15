import { getTelegramWebApp } from "@tg-mini-app/telegram";

/**
 * True when a real Telegram client hosts the app — i.e. native chrome (the
 * MainButton / BackButton) is available. False in a plain browser or under an
 * injected mock, where the kit's in-DOM fallbacks (`TKMainButton`, a back
 * `TKHeader`) should render instead. One predicate so every shell makes the
 * native-vs-fallback decision the same way.
 */
export function useHasNativeChrome(): boolean {
  return getTelegramWebApp() !== null;
}
