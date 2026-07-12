/*
 * Buyer-first copy for the first launch (Principle III, FR-002, SC-002). The
 * promise leads in plain commercial language; the CTA is a commitment. ZERO
 * token/runtime/recorder/test vocabulary — this is what a buyer reads before any
 * touch. The default (shop) surface content lives here too so US1 is
 * independently demoable without the US2 context set.
 */
import type { Lang } from "../../i18n";
import type { SurfaceContent } from "../../surface/SurfaceSlots";

export const firstLaunchPromise: Record<Lang, { title: string; sub: string }> = {
  en: { title: "Your Mini App in Telegram", sub: "Open. Trust. Order." },
  ru: { title: "Ваш Mini App в Telegram", sub: "Открой. Доверься. Закажи." },
};

export const firstLaunchCta: Record<Lang, string> = {
  en: "I want this Mini App",
  ru: "Хочу такой Mini App",
};

export function firstLaunchContent(lang: Lang): SurfaceContent {
  const en = lang === "en";
  return {
    header: { title: firstLaunchPromise[lang].title, subtitle: firstLaunchPromise[lang].sub },
    media: {
      alt: en ? "Aurora storefront" : "Витрина Aurora",
      fallbackLabel: en ? "Aurora" : "Aurora",
    },
    hero: {
      title: en ? "Spring drop is live" : "Весенняя коллекция уже здесь",
      text: en ? "Free delivery on your first order this week." : "Бесплатная доставка на первый заказ на этой неделе.",
    },
    primaryMetric: {
      label: en ? "Loved by shoppers" : "Нравится покупателям",
      value: "4.9",
      delta: en ? "+0.3 this month" : "+0,3 за месяц",
      up: true,
      bars: [40, 52, 47, 63, 70, 66, 82],
    },
    supportingList: {
      title: en ? "Today's picks" : "Выбор дня",
      rows: [
        { id: "p1", icon: "gift", title: en ? "Aurora tote" : "Сумка Aurora", subtitle: en ? "Limited run" : "Лимит", value: "$48" },
        { id: "p2", icon: "sparkles", title: en ? "Glow serum" : "Сияющая сыворотка", subtitle: en ? "Bestseller" : "Хит", value: "$32" },
        { id: "p3", icon: "heart", title: en ? "Linen scarf" : "Льняной шарф", subtitle: en ? "New" : "Новинка", value: "$24" },
      ],
    },
    trustStrip: {
      avatars: [{ initials: "MK" }, { initials: "AÅ" }, { initials: "JS" }, { initials: "РН" }, { initials: "LE" }],
      rating: 4.9,
      badge: en ? "12k happy buyers" : "12k довольных",
    },
  };
}
