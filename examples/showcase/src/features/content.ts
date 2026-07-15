import type { SiteLocale } from "../shared/strings";

/*
 * Copy for the standalone feature pages (/telegram/, /motion/, …). Kept out of
 * the main dictionary: these are richer structures (blocks with optional code
 * and links) than the flat string map, and only feature pages load them.
 */
export type FeatureSlug = "telegram" | "motion" | "accessibility" | "architecture" | "theming";

export interface FeatureLink {
  label: string;
  /** Site-relative path appended to BASE_URL ("docs/…", "demo/#…") or absolute URL. */
  href: string;
}

export interface FeatureBlock {
  heading: string;
  body: string;
  code?: string;
  links?: FeatureLink[];
}

export interface FeatureContent {
  eyebrow: string;
  title: string;
  intro: string;
  blocks: FeatureBlock[];
  /** Copy for the live hero demo strip (keys are slug-specific). */
  demo: Record<string, string>;
}

const en: Record<FeatureSlug, FeatureContent> = {
  telegram: {
    eyebrow: "Platform",
    title: "Telegram out of the box",
    intro:
      "The kit ships a typed Bot API 9.6 bridge. Every capability below is a first-class hook with a graceful no-op fallback, so the same code runs inside Telegram and in a plain browser.",
    demo: { button: "Approve expense", success: "Approved", caption: "A real TKMainButton fallback running on the injected WebApp mock — press it." },
    blocks: [
      {
        heading: "Native chrome",
        body: "MainButton, SecondaryButton, BackButton and SettingsButton as hooks with priority stacks. In a plain browser the kit renders in-DOM fallbacks like TKMainButton, so flows stay testable.",
        code: "useMainButton({ text, onClick })",
        links: [{ label: "Platform guide", href: "docs/telegram-platform.html" }],
      },
      {
        heading: "Live theme mapping",
        body: "TKProvider's telegram mode resolves every design token from the user's --tg-theme-* palette and follows colorScheme changes — no manual theming code.",
        code: "<TKProvider telegram>",
        links: [{ label: "Try it in the demo", href: "demo/#features" }],
      },
      {
        heading: "Viewport, safe areas, fullscreen",
        body: "useViewport, useSafeArea, useFullscreen and useKeyboard combine Telegram insets with CSS env() — TKPage, TKSafeArea and TKBottomBar consume them so notches and home bars are handled once.",
        code: "useSafeArea()",
      },
      {
        heading: "Haptics",
        body: "useHaptics with impact, notification and selection patterns. Kit controls fire them automatically where iOS would — PIN errors shake with a haptic, toggles tick.",
        code: "useHaptics().impact(\"medium\")",
      },
      {
        heading: "Client APIs",
        body: "Invoices, share sheets, Telegram links, QR scanning, clipboard, file downloads and data transport — each a typed hook that no-ops cleanly outside Telegram.",
        code: "useInvoice() · useShare() · useQrScanner()",
      },
      {
        heading: "Permissions, identity, storage",
        body: "Contact requests, write access, biometrics, location, home-screen shortcuts, emoji status — plus CloudStorage, DeviceStorage and SecureStorage bindings.",
        code: "useCloudStorage()",
      },
      {
        heading: "Testable without Telegram",
        body: "createMockTelegram() injects a browser-testable WebApp mock — this site's Telegram demo card runs on it. Your unit tests and Storybook get the same mock.",
        code: "createMockTelegram({ colorScheme: \"dark\" })",
        links: [{ label: "Mock in action", href: "demo/#features" }],
      },
    ],
  },
  motion: {
    eyebrow: "Performance",
    title: "Motion with a budget",
    intro:
      "Every animation in the kit is compositor-only and token-driven — and a CI gate keeps it that way. Low-end WebViews stay smooth because layout and paint never animate.",
    demo: { slider: "Springy thumb", caption: "Drag the slider or press the button — transform and opacity only.", press: "Press me" },
    blocks: [
      {
        heading: "Transform and opacity only",
        body: "Transitions and keyframes touch transform and opacity, never height, box-shadow or filter. The check:animatable gate scans the source and fails the build on violations — the rule is enforced, not aspirational.",
        code: "npm run check:animatable",
      },
      {
        heading: "Token-driven timing",
        body: "Durations and easings come from tokens: --tk-t1…t3 for speed tiers, --tk-spring for the bouncy character, --tk-ms as a global speed multiplier. The Tweaks panel on the demo page drives them live.",
        code: "transition: transform var(--tk-t2) var(--tk-spring)",
        links: [{ label: "Tweak it live", href: "demo/#tweaks" }],
      },
      {
        heading: "Gestures without re-renders",
        body: "Sheet drags and gallery swipes move pixels imperatively. A React Profiler in the demo counts commits during a drag — the badge reads zero.",
        links: [{ label: "See the commit counter", href: "demo/#features" }],
      },
      {
        heading: "Reduced motion, both ways",
        body: "The OS prefers-reduced-motion setting and the host-driven reduceMotion prop both quiet every animation — autoplay demos stop, reveals become instant, marquees never start.",
        code: "<TKProvider reduceMotion>",
      },
    ],
  },
  accessibility: {
    eyebrow: "Accessibility",
    title: "Accessible by default",
    intro:
      "Accessibility is part of each component's contract, not an add-on: keyboard operability, focus management, announcements and touch targets ship with every control.",
    demo: { run: "Run async action", hears: "What a screen reader would say", idle: "Run the action — the announcement text appears here.", loading: "Checking the flow…", done: "Action complete.", caption: "The status is written to a polite aria-live region. There is no sound on its own — turn on VoiceOver or NVDA and the same text is spoken; without one, this line shows exactly what they would say." },
    blocks: [
      {
        heading: "Keyboard everywhere",
        body: "Every interactive component is fully keyboard-operable: grids navigate with arrows, segmented controls follow the radio pattern, sliders implement role=\"slider\" with arrow keys.",
      },
      {
        heading: "Focus, trapped and returned",
        body: "Overlays move focus in, trap Tab, close on Escape and return focus to the trigger. Non-modal presentation surfaces (like autoplay demos) opt out cleanly with modal={false}.",
        code: "<TKSheet modal={false}>",
      },
      {
        heading: "Announcements",
        body: "Async flows announce progress and completion through polite live regions — useTKBusyAnnounce turns loading states into screen-reader speech, localized.",
        code: "useTKBusyAnnounce(state)",
        links: [{ label: "Hear it in the demo", href: "demo/#features" }],
      },
      {
        heading: "Touch targets and visible focus",
        body: "Controls respect the --tk-tap-min target size, and focus is always visible through the --tk-ring token — including on custom accents where the ink color is computed for contrast.",
      },
      {
        heading: "Localized strings built in",
        body: "Every built-in string the kit speaks — counters, keypads, close buttons, announcements — ships in English and Russian and switches live via TKLocaleProvider.",
        code: "<TKLocaleProvider locale={ruLocale}>",
        links: [{ label: "Switch it live", href: "demo/#i18n" }],
      },
    ],
  },
  architecture: {
    eyebrow: "Package",
    title: "Zero runtime dependencies",
    intro:
      "The full kit is a single package that stays near 60 kB brotli with nothing but React peers underneath — and the budgets are CI gates, not aspirations.",
    demo: { caption: "The numbers are CI gates, not aspirations." },
    blocks: [
      {
        heading: "Nothing under the hood",
        body: "tg-mini-app-uikit declares zero runtime dependencies. React 18 or 19, ReactDOM and the platform bridge are peers — your lockfile stays yours.",
      },
      {
        heading: "Budgeted size",
        body: "size-limit caps the full ESM and CJS bundles at 60 kB brotli, a single TKButton import at 5.5 kB and TKSpinner at 4 kB. Tree-shaking is verified, not assumed.",
        code: "npm run check:package",
      },
      {
        heading: "Typed and gated",
        body: "Strict TypeScript, 1245 unit tests, a 182-export API-surface baseline, Storybook coverage for every public component and a Playwright floor of 177 collected e2e tests.",
      },
      {
        heading: "Offline-friendly",
        body: "System font stack, no CDNs, no runtime network calls. This site — built on the kit — works offline after the first load.",
      },
    ],
  },
  theming: {
    eyebrow: "Design system",
    title: "Theming and i18n at the root",
    intro:
      "One provider re-themes the whole tree: semantic tokens drive color, radius, type scale and motion, while bundled locales switch every built-in string live.",
    demo: { caption: "Pick an accent — the ink recomputes for contrast.", sample: "Readable ink", action: "Primary action" },
    blocks: [
      {
        heading: "Semantic tokens",
        body: "Components read --tk-* tokens exclusively — surface, text, accent, separators, shadows, z-layers. Restyle the whole kit by setting a handful of custom properties.",
        code: "--tk-accent · --tk-rx · --tk-fz",
      },
      {
        heading: "Provider knobs",
        body: "TKProvider exposes accent, roundness, motion speed and base font size as typed props. The demo's Tweaks panel drives all of them live, including a custom accent with computed readable ink.",
        code: "<TKProvider accent=\"#8774e1\" roundness={1.2}>",
        links: [{ label: "Open the Tweaks panel", href: "demo/#tweaks" }],
      },
      {
        heading: "Light, dark and Telegram",
        body: "Light and dark palettes ship complete; the telegram mode maps every token to the user's live themeParams so the app matches their client exactly.",
        links: [{ label: "Theming guide", href: "docs/theming.html" }],
      },
      {
        heading: "Two locales bundled",
        body: "English and Russian dictionaries cover every kit-owned string. TKLocaleProvider accepts partial overrides, so custom wording is one object away.",
        code: "<TKLocaleProvider locale={{ search: \"Find…\" }}>",
        links: [{ label: "i18n demo", href: "demo/#i18n" }],
      },
    ],
  },
};

const ru: Record<FeatureSlug, FeatureContent> = {
  telegram: {
    eyebrow: "Платформа",
    title: "Готов к Telegram из коробки",
    intro:
      "В комплекте — типизированный мост Bot API 9.6. Каждая возможность ниже — полноценный хук с безопасным фолбэком: один и тот же код работает и внутри Telegram, и в обычном браузере.",
    demo: { button: "Согласовать расход", success: "Согласовано", caption: "Настоящий фолбэк TKMainButton на внедрённом моке WebApp — нажмите." },
    blocks: [
      {
        heading: "Нативный интерфейс клиента",
        body: "MainButton, SecondaryButton, BackButton и SettingsButton — хуки с приоритетными стеками. В обычном браузере кит рендерит DOM-фолбэки вроде TKMainButton, поэтому сценарии остаются тестируемыми.",
        code: "useMainButton({ text, onClick })",
        links: [{ label: "Руководство по платформе", href: "docs/telegram-platform.html" }],
      },
      {
        heading: "Живая тема Telegram",
        body: "Режим telegram у TKProvider разрешает все токены из палитры --tg-theme-* пользователя и следует за сменой colorScheme — без ручной темизации.",
        code: "<TKProvider telegram>",
        links: [{ label: "Попробовать в демо", href: "demo/#features" }],
      },
      {
        heading: "Вьюпорт, safe area, фулскрин",
        body: "useViewport, useSafeArea, useFullscreen и useKeyboard объединяют инсеты Telegram с CSS env() — TKPage, TKSafeArea и TKBottomBar используют их, так что чёлки и home-бары обрабатываются один раз.",
        code: "useSafeArea()",
      },
      {
        heading: "Хаптика",
        body: "useHaptics с паттернами impact, notification и selection. Контролы кита вызывают их там же, где это сделал бы iOS: ошибка пина трясётся с хаптикой, переключатели «тикают».",
        code: "useHaptics().impact(\"medium\")",
      },
      {
        heading: "Клиентские API",
        body: "Инвойсы, шаринг, Telegram-ссылки, сканер QR, буфер обмена, загрузка файлов и транспорт данных — типизированные хуки, безопасно бездействующие вне Telegram.",
        code: "useInvoice() · useShare() · useQrScanner()",
      },
      {
        heading: "Разрешения, identity, хранилища",
        body: "Запрос контакта, право писать, биометрия, геолокация, ярлык на домашний экран, эмодзи-статус — плюс привязки CloudStorage, DeviceStorage и SecureStorage.",
        code: "useCloudStorage()",
      },
      {
        heading: "Тестируется без Telegram",
        body: "createMockTelegram() внедряет браузерный мок WebApp — на нём работает Telegram-карточка в демо. Тот же мок доступен юнит-тестам и Storybook.",
        code: "createMockTelegram({ colorScheme: \"dark\" })",
        links: [{ label: "Мок в действии", href: "demo/#features" }],
      },
    ],
  },
  motion: {
    eyebrow: "Производительность",
    title: "Анимация с бюджетом",
    intro:
      "Каждая анимация кита работает только на композиторе и управляется токенами — и это охраняет CI-гейт. Слабые WebView остаются плавными, потому что layout и paint не анимируются никогда.",
    demo: { slider: "Пружинящий ползунок", caption: "Потяните слайдер или нажмите кнопку — только transform и opacity.", press: "Нажми меня" },
    blocks: [
      {
        heading: "Только transform и opacity",
        body: "Переходы и keyframes трогают transform и opacity — не height, box-shadow или filter. Гейт check:animatable сканирует исходники и валит сборку при нарушении: правило принудительное, а не декларативное.",
        code: "npm run check:animatable",
      },
      {
        heading: "Тайминги из токенов",
        body: "Длительности и изинги берутся из токенов: --tk-t1…t3 — ступени скорости, --tk-spring — упругий характер, --tk-ms — глобальный множитель. Панель Tweaks в демо крутит их вживую.",
        code: "transition: transform var(--tk-t2) var(--tk-spring)",
        links: [{ label: "Покрутить вживую", href: "demo/#tweaks" }],
      },
      {
        heading: "Жесты без ре-рендеров",
        body: "Перетаскивание шторки и свайпы галереи двигают пиксели императивно. React Profiler в демо считает коммиты во время жеста — бейдж показывает ноль.",
        links: [{ label: "Счётчик коммитов", href: "demo/#features" }],
      },
      {
        heading: "Reduced motion в обе стороны",
        body: "Системная настройка prefers-reduced-motion и проп reduceMotion от хоста оба глушат все анимации: автодемо останавливаются, появления мгновенны, бегущие строки не стартуют.",
        code: "<TKProvider reduceMotion>",
      },
    ],
  },
  accessibility: {
    eyebrow: "Доступность",
    title: "Доступность по умолчанию",
    intro:
      "Доступность — часть контракта каждого компонента, а не надстройка: клавиатура, управление фокусом, озвучивание и размеры целей входят в каждый контрол.",
    demo: { run: "Запустить действие", hears: "Что произнесёт скринридер", idle: "Запустите действие — здесь появится текст объявления.", loading: "Проверяем сценарий…", done: "Действие выполнено.", caption: "Статус записывается в вежливый aria-live-регион. Сам по себе он не звучит: включите VoiceOver или NVDA — и этот же текст будет произнесён; без них строка показывает ровно то, что они скажут." },
    blocks: [
      {
        heading: "Клавиатура везде",
        body: "Каждый интерактивный компонент полностью управляется с клавиатуры: сетки — стрелками, сегментированные контролы — по паттерну радиогруппы, слайдеры реализуют role=\"slider\".",
      },
      {
        heading: "Фокус: захват и возврат",
        body: "Оверлеи переводят фокус внутрь, зацикливают Tab, закрываются по Escape и возвращают фокус триггеру. Немодальные поверхности (например, автодемо) корректно отключаются через modal={false}.",
        code: "<TKSheet modal={false}>",
      },
      {
        heading: "Озвучивание",
        body: "Асинхронные сценарии сообщают прогресс и завершение через вежливые live-регионы: useTKBusyAnnounce превращает состояния загрузки в речь скринридера, с локализацией.",
        code: "useTKBusyAnnounce(state)",
        links: [{ label: "Послушать в демо", href: "demo/#features" }],
      },
      {
        heading: "Цели касания и видимый фокус",
        body: "Контролы соблюдают минимальный размер цели --tk-tap-min, а фокус всегда видим через токен --tk-ring — включая кастомные акценты, где цвет обводки вычисляется по контрасту.",
      },
      {
        heading: "Локализованные строки",
        body: "Все встроенные строки кита — счётчики, клавиатуры, кнопки закрытия, объявления — идут на английском и русском и переключаются вживую через TKLocaleProvider.",
        code: "<TKLocaleProvider locale={ruLocale}>",
        links: [{ label: "Переключить вживую", href: "demo/#i18n" }],
      },
    ],
  },
  architecture: {
    eyebrow: "Пакет",
    title: "Ноль зависимостей в рантайме",
    intro:
      "Весь кит — один пакет около 60 кБ brotli, под которым нет ничего, кроме peer-зависимостей React. И эти бюджеты — CI-гейты, а не намерения.",
    demo: { caption: "Эти цифры — CI-гейты, а не намерения." },
    blocks: [
      {
        heading: "Ничего под капотом",
        body: "tg-mini-app-uikit не тянет ни одной runtime-зависимости. React 18 или 19, ReactDOM и платформенный мост — peers: ваш lockfile остаётся вашим.",
      },
      {
        heading: "Размер под бюджетом",
        body: "size-limit ограничивает полные ESM- и CJS-сборки 60 кБ brotli, импорт одного TKButton — 5,5 кБ, TKSpinner — 4 кБ. Tree-shaking проверяется, а не предполагается.",
        code: "npm run check:package",
      },
      {
        heading: "Типизировано и защищено",
        body: "Строгий TypeScript, 1245 юнит-тестов, зафиксированная поверхность API из 182 экспортов, Storybook-покрытие всех публичных компонентов и floor из 177 e2e-тестов Playwright.",
      },
      {
        heading: "Дружелюбен к офлайну",
        body: "Системный шрифтовой стек, без CDN и сетевых вызовов в рантайме. Этот сайт, собранный на ките, работает офлайн после первой загрузки.",
      },
    ],
  },
  theming: {
    eyebrow: "Дизайн-система",
    title: "Темизация и i18n на уровне корня",
    intro:
      "Один провайдер перекрашивает всё дерево: семантические токены управляют цветом, радиусами, типографикой и движением, а встроенные локали переключают все строки кита вживую.",
    demo: { caption: "Выберите акцент — цвет текста пересчитается по контрасту.", sample: "Читаемый текст", action: "Основное действие" },
    blocks: [
      {
        heading: "Семантические токены",
        body: "Компоненты читают только токены --tk-*: поверхности, текст, акцент, разделители, тени, z-слои. Перекрасьте весь кит, задав несколько custom properties.",
        code: "--tk-accent · --tk-rx · --tk-fz",
      },
      {
        heading: "Знобы провайдера",
        body: "TKProvider принимает акцент, радиус, скорость движения и базовый размер шрифта типизированными пропсами. Панель Tweaks в демо крутит их все вживую, включая кастомный акцент с вычисляемым контрастным цветом текста.",
        code: "<TKProvider accent=\"#8774e1\" roundness={1.2}>",
        links: [{ label: "Открыть панель Tweaks", href: "demo/#tweaks" }],
      },
      {
        heading: "Светлая, тёмная и Telegram",
        body: "Светлая и тёмная палитры идут в комплекте; режим telegram отображает каждый токен на живые themeParams пользователя — приложение выглядит как его клиент.",
        links: [{ label: "Руководство по темизации", href: "docs/theming.html" }],
      },
      {
        heading: "Две локали в комплекте",
        body: "Английский и русский словари покрывают каждую строку кита. TKLocaleProvider принимает частичные переопределения — своя формулировка в один объект.",
        code: "<TKLocaleProvider locale={{ search: \"Найти…\" }}>",
        links: [{ label: "Демо i18n", href: "demo/#i18n" }],
      },
    ],
  },
};

export const FEATURE_SLUGS: readonly FeatureSlug[] = [
  "telegram",
  "motion",
  "accessibility",
  "architecture",
  "theming",
];

export const FEATURE_CONTENT: Record<SiteLocale, Record<FeatureSlug, FeatureContent>> = { en, ru };

/** Locale-independent block presentation: kit icon + tinted chip tone, zipped with blocks by index. */
export interface FeatureBlockMeta {
  icon: string;
  tone: "accent" | "green" | "orange";
}

export const BLOCK_META: Record<FeatureSlug, FeatureBlockMeta[]> = {
  telegram: [
    { icon: "phone", tone: "accent" },
    { icon: "sun", tone: "orange" },
    { icon: "tune", tone: "accent" },
    { icon: "bolt", tone: "green" },
    { icon: "send", tone: "accent" },
    { icon: "lock", tone: "orange" },
    { icon: "verified", tone: "green" },
  ],
  motion: [
    { icon: "bolt", tone: "accent" },
    { icon: "clock", tone: "orange" },
    { icon: "fingerprint", tone: "green" },
    { icon: "moon", tone: "accent" },
  ],
  accessibility: [
    { icon: "shield", tone: "green" },
    { icon: "lock", tone: "accent" },
    { icon: "bell", tone: "orange" },
    { icon: "eye", tone: "accent" },
    { icon: "globe", tone: "green" },
  ],
  architecture: [
    { icon: "document", tone: "accent" },
    { icon: "tune", tone: "orange" },
    { icon: "verified", tone: "green" },
    { icon: "download", tone: "accent" },
  ],
  theming: [
    { icon: "sun", tone: "accent" },
    { icon: "tune", tone: "orange" },
    { icon: "moon", tone: "accent" },
    { icon: "globe", tone: "green" },
  ],
};
