/*
 * Demo dictionary — Russian. Intentionally includes long labels
 * ("Бронирование") so the no-overflow / no-clip responsive gate (SC-006) is
 * exercised against real long-label copy, not just English.
 */
import type { Dict } from "./enLocale";

export const ru: Dict = {
  "stage.aria": "Сцена Surface Composer",
  "surface.aria": "Живая поверхность Mini App",

  "switcher.aria": "Тип бизнеса",
  "switcher.shop": "Магазин",
  "switcher.booking": "Бронирование",
  "switcher.wallet": "Кошелёк",
  "switcher.support": "Поддержка",

  "inspector.title": "Почему это ощущается премиально",
  "inspector.subtitle": "UIKit-доказательства появляются после интереса покупателя",
  "inspector.close": "Закрыть",
  "proof.strip.aria": "Из чего собрана поверхность",
  "runtime.native": "Нативно",
  "runtime.mock": "Симуляция",
  "runtime.fallback": "Браузер",
};
