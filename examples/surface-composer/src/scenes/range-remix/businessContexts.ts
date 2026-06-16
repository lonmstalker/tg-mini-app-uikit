/*
 * US2 — the same surface speaking five businesses (FR-004, D7). Each context
 * supplies slot content + copy only; the structural invariants (tokens,
 * safe-area, theme, origin, primary-action position) stay anchored across remix
 * — that continuity is what sells "one surface, many businesses". Community is
 * supplied here but is only reachable through the remix set, never the switcher.
 *
 * Buyer language only — these strings render in the live (post-touch-optional)
 * surface, so no token/runtime/recorder vocabulary.
 */
import type { BusinessContext } from "../../app/composerReducer";
import type { Lang } from "../../i18n";
import type { SurfaceContent, SurfaceRow } from "../../surface/SurfaceSlots";

type Bilingual = { en: string; ru: string };
const pick = (b: Bilingual, lang: Lang) => b[lang];

interface ContextCopy {
  header: { title: Bilingual; subtitle: Bilingual };
  media: Bilingual; // fallback label / alt
  hero: { title: Bilingual; text: Bilingual };
  metric: { label: Bilingual; value: string; delta: Bilingual; up?: boolean; bars: number[] };
  list: { title: Bilingual; rows: Array<{ id: string; icon: SurfaceRow["icon"]; title: Bilingual; subtitle: Bilingual; value: string }> };
  trust: { rating: number; badge: Bilingual };
  cta: Bilingual;
}

const CONTEXTS: Record<BusinessContext, ContextCopy> = {
  shop: {
    header: { title: { en: "Aurora Store", ru: "Магазин Aurora" }, subtitle: { en: "Spring collection", ru: "Весенняя коллекция" } },
    media: { en: "Aurora", ru: "Aurora" },
    hero: { title: { en: "Spring drop is live", ru: "Весенняя коллекция здесь" }, text: { en: "Free delivery this week.", ru: "Бесплатная доставка на этой неделе." } },
    metric: { label: { en: "Loved by shoppers", ru: "Нравится покупателям" }, value: "4.9", delta: { en: "+0.3", ru: "+0,3" }, bars: [40, 52, 47, 63, 70, 66, 82] },
    list: {
      title: { en: "Today's picks", ru: "Выбор дня" },
      rows: [
        { id: "p1", icon: "gift", title: { en: "Aurora tote", ru: "Сумка Aurora" }, subtitle: { en: "Limited run", ru: "Лимит" }, value: "$48" },
        { id: "p2", icon: "sparkles", title: { en: "Glow serum", ru: "Сыворотка" }, subtitle: { en: "Bestseller", ru: "Хит" }, value: "$32" },
        { id: "p3", icon: "heart", title: { en: "Linen scarf", ru: "Льняной шарф" }, subtitle: { en: "New", ru: "Новинка" }, value: "$24" },
      ],
    },
    trust: { rating: 4.9, badge: { en: "12k happy buyers", ru: "12k довольных" } },
    cta: { en: "Order now", ru: "Заказать" },
  },
  booking: {
    header: { title: { en: "Lumen Spa", ru: "Спа Lumen" }, subtitle: { en: "Book in seconds", ru: "Запись за секунды" } },
    media: { en: "Lumen", ru: "Lumen" },
    hero: { title: { en: "Evening slots open", ru: "Открыты вечерние слоты" }, text: { en: "Pick a time, we confirm instantly.", ru: "Выберите время — подтвердим сразу." } },
    metric: { label: { en: "On-time rate", ru: "Вовремя" }, value: "98%", delta: { en: "+2%", ru: "+2%" }, bars: [60, 64, 70, 72, 80, 86, 98] },
    list: {
      title: { en: "Available today", ru: "Сегодня доступно" },
      rows: [
        { id: "b1", icon: "clock", title: { en: "Deep tissue", ru: "Глубокий массаж" }, subtitle: { en: "60 min", ru: "60 мин" }, value: "18:00" },
        { id: "b2", icon: "sparkles", title: { en: "Facial glow", ru: "Уход за лицом" }, subtitle: { en: "45 min", ru: "45 мин" }, value: "19:30" },
        { id: "b3", icon: "heart", title: { en: "Aroma ritual", ru: "Аромаритуал" }, subtitle: { en: "90 min", ru: "90 мин" }, value: "21:00" },
      ],
    },
    trust: { rating: 4.8, badge: { en: "Rated by 3k guests", ru: "3k гостей" } },
    cta: { en: "Book a slot", ru: "Записаться" },
  },
  wallet: {
    header: { title: { en: "Orbit Wallet", ru: "Кошелёк Orbit" }, subtitle: { en: "Money that moves", ru: "Деньги в движении" } },
    media: { en: "Orbit", ru: "Orbit" },
    hero: { title: { en: "Send in one tap", ru: "Перевод в один тап" }, text: { en: "Zero fees inside Telegram.", ru: "Без комиссии внутри Telegram." } },
    metric: { label: { en: "Balance", ru: "Баланс" }, value: "$1,240", delta: { en: "+$84", ru: "+$84" }, bars: [30, 44, 40, 58, 62, 74, 90] },
    list: {
      title: { en: "Recent", ru: "Недавнее" },
      rows: [
        { id: "w1", icon: "arrowRight", title: { en: "To Mira", ru: "Мире" }, subtitle: { en: "Lunch", ru: "Обед" }, value: "-$12" },
        { id: "w2", icon: "download", title: { en: "From Leo", ru: "От Лео" }, subtitle: { en: "Refund", ru: "Возврат" }, value: "+$30" },
        { id: "w3", icon: "card", title: { en: "Top up", ru: "Пополнение" }, subtitle: { en: "Card", ru: "Карта" }, value: "+$100" },
      ],
    },
    trust: { rating: 4.9, badge: { en: "Bank-grade secure", ru: "Банковская защита" } },
    cta: { en: "Top up", ru: "Пополнить" },
  },
  support: {
    header: { title: { en: "Helpdesk", ru: "Поддержка" }, subtitle: { en: "Answers, fast", ru: "Ответы быстро" } },
    media: { en: "Help", ru: "Help" },
    hero: { title: { en: "We reply in minutes", ru: "Отвечаем за минуты" }, text: { en: "A real human, right here.", ru: "Живой человек, прямо здесь." } },
    metric: { label: { en: "First reply", ru: "Первый ответ" }, value: "2 min", delta: { en: "-30s", ru: "-30с" }, up: false, bars: [80, 72, 66, 60, 52, 44, 30] },
    list: {
      title: { en: "Popular topics", ru: "Популярное" },
      rows: [
        { id: "s1", icon: "document", title: { en: "Order status", ru: "Статус заказа" }, subtitle: { en: "Track it", ru: "Отследить" }, value: "›" },
        { id: "s2", icon: "refresh", title: { en: "Returns", ru: "Возвраты" }, subtitle: { en: "How it works", ru: "Как это работает" }, value: "›" },
        { id: "s3", icon: "shield", title: { en: "Account safety", ru: "Безопасность" }, subtitle: { en: "Protect it", ru: "Защитить" }, value: "›" },
      ],
    },
    trust: { rating: 4.7, badge: { en: "Helped 40k people", ru: "Помогли 40k" } },
    cta: { en: "Get help", ru: "Получить помощь" },
  },
  community: {
    header: { title: { en: "Makers Circle", ru: "Клуб мейкеров" }, subtitle: { en: "Build together", ru: "Создаём вместе" } },
    media: { en: "Circle", ru: "Circle" },
    hero: { title: { en: "Tonight's meetup", ru: "Сегодняшняя встреча" }, text: { en: "120 makers are going.", ru: "Идут 120 участников." } },
    metric: { label: { en: "Members", ru: "Участники" }, value: "8,420", delta: { en: "+210", ru: "+210" }, bars: [50, 55, 60, 64, 70, 78, 88] },
    list: {
      title: { en: "Happening now", ru: "Сейчас" },
      rows: [
        { id: "c1", icon: "chat", title: { en: "Design jam", ru: "Дизайн-джем" }, subtitle: { en: "Live", ru: "Эфир" }, value: "42" },
        { id: "c2", icon: "star", title: { en: "Showcase", ru: "Витрина" }, subtitle: { en: "New work", ru: "Новые работы" }, value: "18" },
        { id: "c3", icon: "bell", title: { en: "Q&A", ru: "Вопросы" }, subtitle: { en: "Starts 20:00", ru: "Старт 20:00" }, value: "•" },
      ],
    },
    trust: { rating: 4.9, badge: { en: "8k makers inside", ru: "8k мейкеров" } },
    cta: { en: "Join the circle", ru: "Вступить" },
  },
};

const AVATARS = [{ initials: "MK" }, { initials: "AÅ" }, { initials: "JS" }, { initials: "РН" }, { initials: "LE" }];

export function businessContent(context: BusinessContext, lang: Lang): SurfaceContent {
  const c = CONTEXTS[context];
  return {
    header: { title: pick(c.header.title, lang), subtitle: pick(c.header.subtitle, lang) },
    media: { alt: pick(c.media, lang), fallbackLabel: pick(c.media, lang) },
    hero: { title: pick(c.hero.title, lang), text: pick(c.hero.text, lang) },
    primaryMetric: {
      label: pick(c.metric.label, lang),
      value: c.metric.value,
      delta: pick(c.metric.delta, lang),
      up: c.metric.up ?? true,
      bars: c.metric.bars,
    },
    supportingList: {
      title: pick(c.list.title, lang),
      rows: c.list.rows.map((r) => ({ id: r.id, icon: r.icon, title: pick(r.title, lang), subtitle: pick(r.subtitle, lang), value: r.value })),
    },
    trustStrip: { avatars: AVATARS, rating: c.trust.rating, badge: pick(c.trust.badge, lang) },
  };
}

export function businessCta(context: BusinessContext, lang: Lang): string {
  return pick(CONTEXTS[context].cta, lang);
}
