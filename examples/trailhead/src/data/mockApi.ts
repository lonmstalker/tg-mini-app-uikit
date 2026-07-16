import { createMockGate, type Page } from "@tg-mini-app/async";
import type { Lang } from "../i18n";

// The Page<T> contract + the configurable gate now live in @tg-mini-app/async.
export type { Page };

/*
 * The demo's single data source. Every function is `async`, waits a tunable
 * artificial delay, and throws when the injectable failure flag is set — so
 * skeletons, empty and error/retry states are demonstrable on demand without a
 * backend. Deterministic: no randomness, stable ids, so tests and the README
 * recording reproduce exactly.
 *
 * Fully bilingual: every user-facing text field is stored as `{ en, ru }` and
 * flattened to the active language at the endpoint boundary, so components never
 * see a hardcoded string. Structural fields (ids, prices, hues, slots) are
 * language-neutral and shared.
 *
 * Persona: "Maya, a weekend hiker", one week of her life around a mountain town.
 */

interface Loc {
  en: string;
  ru: string;
}
const L = (en: string, ru: string): Loc => ({ en, ru });
const pick = (loc: Loc, lang: Lang) => loc[lang];

export type Difficulty = "easy" | "moderate" | "hard";
export type ExperienceCategory = "summit" | "forest" | "water" | "sunrise";
export type BookingStatus = "pending" | "paid" | "checkedIn";

export interface SlotInfo {
  time: string;
  soldOut?: boolean;
}

export interface RoutePoint {
  label: string;
  detail: string;
}

export interface Experience {
  id: string;
  title: string;
  location: string;
  summary: string;
  priceStars: number;
  rating: number;
  ratingCount: number;
  durationMin: number;
  distanceKm: number;
  ascentM: number;
  difficulty: Difficulty;
  guideId: string;
  category: ExperienceCategory;
  hue: number;
  emoji: string;
  gallery: string[];
  route: RoutePoint[];
  slots: SlotInfo[];
}

/** A booking stores only language-neutral facts; display text is resolved by id. */
export interface Booking {
  id: string;
  experienceId: string;
  /** ISO date YYYY-MM-DD. */
  date: string;
  slot: string;
  status: BookingStatus;
  priceStars: number;
}

export interface BookingView {
  title: string;
  location: string;
  emoji: string;
  hue: number;
}

export interface TrainingSession {
  id: string;
  title: string;
  week: string;
  dayLabel: string;
  focus: string;
  durationMin: number;
  distanceKm: number;
  done: boolean;
  steps: string[];
}

export interface Person {
  id: string;
  name: string;
  role: string;
  bio: string;
  emoji: string;
  hue: number;
  guides: string[];
  bookedSameTrip?: boolean;
  /** Lifetime trail XP — drives the Train leaderboard (data, not a view formula). */
  xp: number;
}

export type MessageStatus = "sent" | "delivered" | "read";

export interface Message {
  id: string;
  threadId: string;
  authorId: string; // "me" or a person id
  text: string;
  status: MessageStatus;
  offset: number;
}


/* ---------------- Tunable behavior ---------------- */

export interface MockApiConfig {
  delayMs: number;
  fail: boolean;
}

// Delay + failure mechanics come from the kit's createMockGate; this layer
// keeps its own config/error names as the public, e2e-driven contract.
const apiGate = createMockGate({ delayMs: 550 });

export function configureMockApi(next: Partial<MockApiConfig>): void {
  apiGate.configure(next);
}

export function getMockApiConfig(): MockApiConfig {
  return apiGate.getConfig();
}

export class MockApiError extends Error {
  constructor(message = "MOCK_API_FAILURE") {
    super(message);
    this.name = "MockApiError";
  }
}

async function gate(): Promise<void> {
  try {
    await apiGate();
  } catch {
    throw new MockApiError();
  }
}

/* ---------------- Seed data (bilingual) ---------------- */

interface RawRoutePoint {
  label: Loc;
  detail: Loc;
}
interface RawExperience {
  id: string;
  title: Loc;
  location: Loc;
  summary: Loc;
  priceStars: number;
  rating: number;
  ratingCount: number;
  durationMin: number;
  distanceKm: number;
  ascentM: number;
  difficulty: Difficulty;
  guideId: string;
  category: ExperienceCategory;
  hue: number;
  emoji: string;
  route: RawRoutePoint[];
  slots: SlotInfo[];
}

interface RawPerson {
  id: string;
  name: string;
  role: Loc;
  bio: Loc;
  emoji: string;
  hue: number;
  guides: string[];
  bookedSameTrip?: boolean;
  xp: number;
}

interface RawSession {
  id: string;
  title: Loc;
  week: Loc;
  dayLabel: Loc;
  focus: Loc;
  durationMin: number;
  distanceKm: number;
  done: boolean;
  steps: Loc[];
}

interface RawMessage {
  id: string;
  threadId: string;
  authorId: string;
  text: Loc;
  status: MessageStatus;
  offset: number;
}

const RAW_PEOPLE: RawPerson[] = [
  {
    id: "g-sora",
    xp: 2680,
    name: "Sora Voronova",
    role: L("Lead alpine guide", "Старший альпийский гид"),
    bio: L(
      "UIAA-certified, 11 seasons on the ridge. Coffee at the trailhead is non-negotiable.",
      "Сертификат UIAA, 11 сезонов на хребте. Кофе на старте — обязательно.",
    ),
    emoji: "🧗‍♀️",
    hue: 198,
    guides: ["sunrise-ridge", "glacier-rim"],
    bookedSameTrip: true,
  },
  {
    id: "g-ilya",
    xp: 2105,
    name: "Ilya Marsh",
    role: L("Forest & flora guide", "Гид по лесу и флоре"),
    bio: L(
      "Botanist turned guide. Knows every mushroom you should not eat.",
      "Ботаник, ставший гидом. Знает каждый гриб, который не стоит есть.",
    ),
    emoji: "🌲",
    hue: 140,
    guides: ["cedar-loop", "fern-hollow"],
  },
  {
    id: "g-nadia",
    xp: 2320,
    name: "Nadia Brook",
    role: L("Water & canyon guide", "Гид по воде и каньонам"),
    bio: L(
      "Packraft instructor. Will convince you the water is 'refreshing'.",
      "Инструктор по пакрафту. Убедит, что вода «бодрит».",
    ),
    emoji: "🛶",
    hue: 205,
    guides: ["blue-canyon", "mirror-lake"],
    bookedSameTrip: true,
  },
  {
    id: "g-pavel",
    xp: 1990,
    name: "Pavel Stone",
    role: L("Summit & scramble guide", "Гид по вершинам и скрэмблу"),
    bio: L(
      "Ex-search-and-rescue. Calm in a storm, faster than you uphill.",
      "Бывший спасатель. Спокоен в шторм, быстрее вас на подъёме.",
    ),
    emoji: "⛰️",
    hue: 28,
    guides: ["granite-peak", "sunrise-ridge"],
  },
  {
    id: "f-lena",
    xp: 2480,
    name: "Lena Frost",
    role: L("Hiking buddy", "Напарница по походу"),
    bio: L(
      "Booked the same Sunrise Ridge trip. Brings extra trail mix.",
      "Забронировала тот же выход на Sunrise Ridge. Берёт орехи с запасом.",
    ),
    emoji: "🥾",
    hue: 320,
    guides: [],
    bookedSameTrip: true,
  },
];

const RAW_EXPERIENCES: RawExperience[] = [
  {
    id: "sunrise-ridge",
    title: L("Sunrise Ridge", "Рассветный хребет"),
    location: L("Mt. Aurel · North face", "Гора Аурель · Северная стена"),
    summary: L(
      "Catch first light from the ridgeline before the valley wakes up. The signature trip.",
      "Поймайте первый свет на гребне, пока долина ещё спит. Наш фирменный выход.",
    ),
    priceStars: 450,
    rating: 4.9,
    ratingCount: 284,
    durationMin: 240,
    distanceKm: 8.2,
    ascentM: 760,
    difficulty: "moderate",
    guideId: "g-sora",
    category: "sunrise",
    hue: 18,
    emoji: "🌄",
    route: [
      { label: L("Trailhead", "Старт"), detail: L("Meet at the cedar gate, 05:30", "Встреча у кедровых ворот, 05:30") },
      { label: L("Switchbacks", "Серпантин"), detail: L("Warm up through the pine belt", "Разогрев через сосновый пояс") },
      { label: L("The ridge", "Гребень"), detail: L("Exposed but railed — golden hour", "Открыто, но с перилами — золотой час") },
      { label: L("Summit cairn", "Тур на вершине"), detail: L("Coffee, photos, descent", "Кофе, фото, спуск") },
    ],
    slots: [{ time: "07:00" }, { time: "09:00" }, { time: "11:00", soldOut: true }],
  },
  {
    id: "granite-peak",
    title: L("Granite Peak Scramble", "Скрэмбл на Гранитный пик"),
    location: L("Mt. Aurel · East spur", "Гора Аурель · Восточный отрог"),
    summary: L(
      "A hands-on scramble to a 360° summit. For hikers ready to use their hands.",
      "Скальный скрэмбл к вершине с обзором 360°. Для тех, кто готов работать руками.",
    ),
    priceStars: 620,
    rating: 4.7,
    ratingCount: 142,
    durationMin: 300,
    distanceKm: 10.4,
    ascentM: 1120,
    difficulty: "hard",
    guideId: "g-pavel",
    category: "summit",
    hue: 28,
    emoji: "⛰️",
    route: [
      { label: L("Boulder field", "Курумник"), detail: L("Helmets on", "Каски надеты") },
      { label: L("The chimney", "Камин"), detail: L("Class 3, fully guided", "Категория 3, полностью с гидом") },
      { label: L("Summit", "Вершина"), detail: L("Sign the book", "Распишитесь в книге") },
    ],
    slots: [{ time: "06:00" }, { time: "08:00" }],
  },
  {
    id: "cedar-loop",
    title: L("Cedar Loop Forest Walk", "Кедровое кольцо"),
    location: L("Greenbelt · Lower trails", "Зелёный пояс · Нижние тропы"),
    summary: L(
      "Easy old-growth loop. Mushrooms, mosses, and a slow pace.",
      "Лёгкое кольцо по старому лесу. Грибы, мхи и неспешный темп.",
    ),
    priceStars: 180,
    rating: 4.8,
    ratingCount: 361,
    durationMin: 120,
    distanceKm: 4.1,
    ascentM: 180,
    difficulty: "easy",
    guideId: "g-ilya",
    category: "forest",
    hue: 140,
    emoji: "🌲",
    route: [
      { label: L("Cedar gate", "Кедровые ворота"), detail: L("Boardwalk start", "Старт по настилу") },
      { label: L("Fern hollow", "Папоротниковая лощина"), detail: L("Quiet, shaded", "Тихо, в тени") },
      { label: L("Lookout", "Смотровая"), detail: L("Valley view, turn back", "Вид на долину, разворот") },
    ],
    slots: [{ time: "09:00" }, { time: "13:00" }, { time: "16:00" }],
  },
  {
    id: "blue-canyon",
    title: L("Blue Canyon Packraft", "Пакрафт в Синем каньоне"),
    location: L("River gorge · Put-in 2", "Речное ущелье · Точка старта 2"),
    summary: L(
      "Walk in, paddle out. Gentle water, big walls, one cheeky rapid.",
      "Заходим пешком, выходим на вёслах. Спокойная вода, большие стены, один дерзкий порог.",
    ),
    priceStars: 540,
    rating: 4.6,
    ratingCount: 98,
    durationMin: 270,
    distanceKm: 6.0,
    ascentM: 240,
    difficulty: "moderate",
    guideId: "g-nadia",
    category: "water",
    hue: 205,
    emoji: "🛶",
    route: [
      { label: L("Put-in", "Точка старта"), detail: L("Dry-bag briefing", "Брифинг по гермомешкам") },
      { label: L("The narrows", "Теснина"), detail: L("Flatwater, echoey", "Гладкая вода, эхо") },
      { label: L("Rapid 1", "Порог 1"), detail: L("Grade II, guided line", "Категория II, линия с гидом") },
      { label: L("Take-out", "Финиш"), detail: L("Hot tea waiting", "Горячий чай ждёт") },
    ],
    slots: [{ time: "10:00" }, { time: "14:00", soldOut: true }],
  },
  {
    id: "mirror-lake",
    title: L("Mirror Lake Sunset", "Закат на Зеркальном озере"),
    location: L("Alpine basin · Upper", "Альпийский цирк · Верхний"),
    summary: L(
      "An easy walk to a still lake that doubles the sky at dusk.",
      "Лёгкая прогулка к тихому озеру, что удваивает небо на закате.",
    ),
    priceStars: 260,
    rating: 4.9,
    ratingCount: 210,
    durationMin: 150,
    distanceKm: 5.3,
    ascentM: 320,
    difficulty: "easy",
    guideId: "g-nadia",
    category: "water",
    hue: 210,
    emoji: "🪞",
    route: [
      { label: L("Basin trail", "Тропа цирка"), detail: L("Meadow switchbacks", "Серпантин по лугам") },
      { label: L("Lakeshore", "Берег озера"), detail: L("Golden reflections", "Золотые отражения") },
      { label: L("Return", "Возвращение"), detail: L("Headlamps for the last km", "Фонарики на последний км") },
    ],
    slots: [{ time: "17:00" }, { time: "18:00" }],
  },
  {
    id: "glacier-rim",
    title: L("Glacier Rim Traverse", "Траверс кромки ледника"),
    location: L("Mt. Aurel · Upper ice", "Гора Аурель · Верхний лёд"),
    summary: L(
      "A roped traverse along the glacier's edge. Crampons provided.",
      "Траверс в связке по кромке ледника. Кошки выдаём.",
    ),
    priceStars: 780,
    rating: 4.8,
    ratingCount: 76,
    durationMin: 360,
    distanceKm: 11.8,
    ascentM: 1340,
    difficulty: "hard",
    guideId: "g-sora",
    category: "summit",
    hue: 198,
    emoji: "🏔️",
    route: [
      { label: L("Ice gate", "Ледовые ворота"), detail: L("Crampon fitting", "Подгонка кошек") },
      { label: L("The rim", "Кромка"), detail: L("Roped, stunning seracs", "В связке, потрясающие сераки") },
      { label: L("Col", "Седловина"), detail: L("Lunch with a view", "Обед с видом") },
    ],
    slots: [{ time: "06:30" }, { time: "08:30" }],
  },
  {
    id: "fern-hollow",
    title: L("Fern Hollow Family Hike", "Семейный поход в Папоротниковую лощину"),
    location: L("Greenbelt · East", "Зелёный пояс · Восток"),
    summary: L(
      "A short, buggy-friendly trail with a waterfall finish. Great first hike.",
      "Короткая тропа, удобная с коляской, с водопадом на финише. Отличный первый поход.",
    ),
    priceStars: 140,
    rating: 4.7,
    ratingCount: 415,
    durationMin: 90,
    distanceKm: 2.6,
    ascentM: 90,
    difficulty: "easy",
    guideId: "g-ilya",
    category: "forest",
    hue: 150,
    emoji: "🌿",
    route: [
      { label: L("Trailhead", "Старт"), detail: L("Flat gravel start", "Ровный гравийный старт") },
      { label: L("The falls", "Водопад"), detail: L("Spray and rainbows", "Брызги и радуги") },
    ],
    slots: [{ time: "10:00" }, { time: "12:00" }, { time: "15:00" }],
  },
  {
    id: "night-summit",
    title: L("Night Summit & Stars", "Ночная вершина и звёзды"),
    location: L("Mt. Aurel · South", "Гора Аурель · Юг"),
    summary: L(
      "Headlamp ascent to a dark-sky summit. Meteor showers in season.",
      "Подъём с фонариками к вершине под тёмным небом. В сезон — метеорные потоки.",
    ),
    priceStars: 560,
    rating: 4.9,
    ratingCount: 133,
    durationMin: 300,
    distanceKm: 7.4,
    ascentM: 690,
    difficulty: "moderate",
    guideId: "g-pavel",
    category: "summit",
    hue: 250,
    emoji: "🌌",
    route: [
      { label: L("Dusk start", "Старт в сумерках"), detail: L("Headlamp check", "Проверка фонариков") },
      { label: L("Tree line", "Граница леса"), detail: L("Eyes adjust", "Глаза привыкают") },
      { label: L("Summit", "Вершина"), detail: L("Blankets, thermoses, stars", "Пледы, термосы, звёзды") },
    ],
    slots: [{ time: "20:00" }, { time: "21:00" }],
  },
];

const RAW_SESSIONS: RawSession[] = [
  {
    id: "s-1",
    title: L("Base mileage", "Базовый объём"),
    week: L("This week", "Эта неделя"),
    dayLabel: L("Mon", "Пн"),
    focus: L("Easy 5k on flat", "Лёгкие 5 км по ровному"),
    durationMin: 45,
    distanceKm: 5,
    done: true,
    steps: [L("Warm up 10 min", "Разминка 10 мин"), L("Easy 5k", "Лёгкие 5 км"), L("Stretch hips & calves", "Растяжка бёдер и икр")],
  },
  {
    id: "s-2",
    title: L("Hill repeats", "Повторы в гору"),
    week: L("This week", "Эта неделя"),
    dayLabel: L("Wed", "Ср"),
    focus: L("6× short climbs", "6× коротких подъёмов"),
    durationMin: 50,
    distanceKm: 6,
    done: true,
    steps: [L("Warm up", "Разминка"), L("6× 2 min uphill", "6× 2 мин в гору"), L("Easy down between", "Лёгкий спуск между"), L("Cool down", "Заминка")],
  },
  {
    id: "s-3",
    title: L("Stairs & pack", "Лестницы с рюкзаком"),
    week: L("This week", "Эта неделя"),
    dayLabel: L("Fri", "Пт"),
    focus: L("Loaded vert", "Набор с весом"),
    durationMin: 40,
    distanceKm: 3,
    done: true,
    steps: [L("5kg pack", "Рюкзак 5 кг"), L("20 min stairs", "20 мин по лестнице"), L("Mobility", "Мобилити")],
  },
  {
    id: "s-4",
    title: L("Long trail", "Длинный выход"),
    week: L("This week", "Эта неделя"),
    dayLabel: L("Sun", "Вс"),
    focus: L("Sunrise Ridge readiness", "Готовность к Sunrise Ridge"),
    durationMin: 240,
    distanceKm: 8,
    done: false,
    steps: [L("Fuel early", "Заправьтесь заранее"), L("Steady 8k", "Ровные 8 км"), L("Practice ridge pacing", "Отработка темпа на гребне"), L("Recover", "Восстановление")],
  },
  {
    id: "s-5",
    title: L("Recovery walk", "Восстановительная прогулка"),
    week: L("Next week", "Следующая неделя"),
    dayLabel: L("Tue", "Вт"),
    focus: L("Flush the legs", "Разгрузить ноги"),
    durationMin: 30,
    distanceKm: 3,
    done: false,
    steps: [L("Easy flat", "Лёгкое по ровному"), L("No watch", "Без часов"), L("Foam roll", "Раскатка роллом")],
  },
];

const RAW_MESSAGES: Record<string, RawMessage[]> = {
  "g-sora": [
    {
      id: "m1",
      threadId: "g-sora",
      authorId: "g-sora",
      text: L("Hi Maya! Excited for Sunrise Ridge. Weather looks clear. 🌄", "Привет, Майя! Жду Sunrise Ridge. Погода ясная. 🌄"),
      status: "read",
      offset: 0,
    },
    {
      id: "m2",
      threadId: "g-sora",
      authorId: "me",
      text: L("Same! Do I need trekking poles?", "Я тоже! Нужны треккинговые палки?"),
      status: "read",
      offset: 3,
    },
    {
      id: "m3",
      threadId: "g-sora",
      authorId: "g-sora",
      text: L("Optional — I bring spares. Layers + headlamp are the musts.", "По желанию — у меня есть запасные. Слои одежды и фонарик обязательны."),
      status: "read",
      offset: 5,
    },
  ],
  "g-nadia": [
    {
      id: "m4",
      threadId: "g-nadia",
      authorId: "g-nadia",
      text: L("Packraft trip confirmed. Can you swim 50m?", "Пакрафт подтверждён. Проплывёте 50 м?"),
      status: "delivered",
      offset: 0,
    },
  ],
};

/* ---------------- Flatteners ---------------- */

function flattenExperience(raw: RawExperience, lang: Lang): Experience {
  return {
    id: raw.id,
    title: pick(raw.title, lang),
    location: pick(raw.location, lang),
    summary: pick(raw.summary, lang),
    priceStars: raw.priceStars,
    rating: raw.rating,
    ratingCount: raw.ratingCount,
    durationMin: raw.durationMin,
    distanceKm: raw.distanceKm,
    ascentM: raw.ascentM,
    difficulty: raw.difficulty,
    guideId: raw.guideId,
    category: raw.category,
    hue: raw.hue,
    emoji: raw.emoji,
    gallery: [raw.emoji, "🏞️", "🌄", "🗺️"],
    route: raw.route.map((p) => ({ label: pick(p.label, lang), detail: pick(p.detail, lang) })),
    slots: raw.slots.map((s) => ({ ...s })),
  };
}

function flattenPerson(raw: RawPerson, lang: Lang): Person {
  return {
    id: raw.id,
    name: raw.name,
    role: pick(raw.role, lang),
    bio: pick(raw.bio, lang),
    emoji: raw.emoji,
    hue: raw.hue,
    guides: [...raw.guides],
    bookedSameTrip: raw.bookedSameTrip,
    xp: raw.xp,
  };
}

function flattenSession(raw: RawSession, lang: Lang): TrainingSession {
  return {
    id: raw.id,
    title: pick(raw.title, lang),
    week: pick(raw.week, lang),
    dayLabel: pick(raw.dayLabel, lang),
    focus: pick(raw.focus, lang),
    durationMin: raw.durationMin,
    distanceKm: raw.distanceKm,
    done: raw.done,
    steps: raw.steps.map((s) => pick(s, lang)),
  };
}

function flattenMessage(raw: RawMessage, lang: Lang): Message {
  return { id: raw.id, threadId: raw.threadId, authorId: raw.authorId, text: pick(raw.text, lang), status: raw.status, offset: raw.offset };
}

/* ---------------- Endpoints ---------------- */

const PAGE_SIZE = 4;

export async function listExperiences(lang: Lang, cursor = 0): Promise<Page<Experience>> {
  await gate();
  const items = RAW_EXPERIENCES.slice(cursor, cursor + PAGE_SIZE).map((e) => flattenExperience(e, lang));
  const next = cursor + PAGE_SIZE;
  return { items, nextCursor: next < RAW_EXPERIENCES.length ? next : null };
}

export async function getExperience(lang: Lang, id: string): Promise<Experience> {
  await gate();
  const found = RAW_EXPERIENCES.find((e) => e.id === id);
  if (!found) throw new MockApiError("NOT_FOUND");
  return flattenExperience(found, lang);
}

/** The seed booking a fresh session starts with (paid Cedar Loop, two days ago). */
export function seedBookings(): Booking[] {
  return [{ id: "bk-seed", experienceId: "cedar-loop", date: "2026-06-13", slot: "09:00", status: "paid", priceStars: 180 }];
}

export async function listBookings(): Promise<Booking[]> {
  await gate();
  return seedBookings();
}

export async function listSessions(lang: Lang): Promise<TrainingSession[]> {
  await gate();
  return RAW_SESSIONS.map((s) => flattenSession(s, lang));
}

export async function listPeople(lang: Lang): Promise<Person[]> {
  await gate();
  return RAW_PEOPLE.map((p) => flattenPerson(p, lang));
}

export async function getPerson(lang: Lang, id: string): Promise<Person> {
  await gate();
  const found = RAW_PEOPLE.find((p) => p.id === id);
  if (!found) throw new MockApiError("NOT_FOUND");
  return flattenPerson(found, lang);
}

export async function listMessages(lang: Lang, threadId: string): Promise<Message[]> {
  await gate();
  return (RAW_MESSAGES[threadId] ?? []).map((m) => flattenMessage(m, lang));
}

let sendSeq = 0;

export async function sendMessage(threadId: string, text: string): Promise<Message> {
  await gate();
  return {
    // Monotonic id so two same-length messages never collide on a React key.
    id: `m-${threadId}-out-${++sendSeq}`,
    threadId,
    authorId: "me",
    text,
    status: "sent",
    offset: 999,
  };
}

/* ---------------- Synchronous, language-aware resolvers ---------------- */

/** Resolve a booking's display fields (title/location/emoji/hue) from its experience id. */
export function bookingView(experienceId: string, lang: Lang): BookingView {
  const raw = RAW_EXPERIENCES.find((e) => e.id === experienceId);
  if (!raw) return { title: experienceId, location: "", emoji: "🏔️", hue: 200 };
  return { title: pick(raw.title, lang), location: pick(raw.location, lang), emoji: raw.emoji, hue: raw.hue };
}

export function experienceById(lang: Lang, id: string): Experience | undefined {
  const raw = RAW_EXPERIENCES.find((e) => e.id === id);
  return raw ? flattenExperience(raw, lang) : undefined;
}

export const TOTAL_EXPERIENCES = RAW_EXPERIENCES.length;
