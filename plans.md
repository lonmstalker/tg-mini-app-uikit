# ExecPlan: tg-mini-app-uikit — Competitive Parity & Differentiation Roadmap

Этот файл — живой план работ (ExecPlan) по доведению кита до уровня «лучший living UI-kit для Telegram Mini Apps». Формат следует стандарту ExecPlan из соседнего проекта `~/RustroverProjects/tg-mini-app-testkit/plans.md`: самодостаточный документ, поведенческие критерии приёмки, обновляется при каждом продвижении. Читатель считается новичком в репозитории.


## Purpose / Big Picture

После выполнения плана пользователь кита сможет: собрать типовое Telegram Mini App (каталог, чекаут на Stars, онбординг с биометрией, поддержка с чатом) целиком из компонентов кита — включая календарь, pull-to-refresh, свайп-жесты, навигационный стек со свайп-беком и локализацию — не дописывая ни одного «жанрового» компонента руками. Демо превратится из витрины в инструмент: код-сниппеты с копированием, поиск, playground, реальные loading/error-состояния.

Стратегический контекст (ресерч 2026-06-13, два прохода по живым репозиториям и issues): официальный `@telegram-apps/telegram-ui` заброшен (последний пуш 2025-10-14, issue #99/#114 без ответа), ниша «живой, протестированный кит для TMA» свободна. Наши уникальные активы: полный платформенный слой Bot API 9.6 + mock + Platform Lab, 294 e2e + 156 vitest + packaging gates, zero-deps, React 18/19 peerDeps, реальные демо-флоу. План закрывает «Тир-2 стандарт жанра» (date picker, PTR, жесты — то, что пользователи требуют у всех конкурентов в issues) и строит дифференциаторы (NavStack со свайп-беком, авто-хаптика, Stars-чекаут), которых нет ни у одного Telegram-кита.

Наблюдаемый результат каждого милстоуна: новые секции в демо-галерее + зелёные прогоны `npm run test:unit`, `npm run test:e2e`, `npm run check:package`.


## Context and Orientation

Репозиторий: `https://github.com/lonmstalker/tg-mini-app-uikit`, npm workspaces:

- `packages/uikit` — сам кит (`tg-mini-app-uikit`), zero runtime deps, React 18/19 peer. Исходники: `src/{buttons,cards,controls,display,feedback,icons,inputs,layout,lists,navigation,overlays,patterns,service,telegram,theme,typography}.tsx`, токены в `src/styles/tokens.css`, item-модель в `src/options.ts`. Сборка `vite build + tsc + scripts/postbuild-types.mjs` (чинит расширения для attw). Vitest: `src/**/*.test.*` (156 тестов: хуки, SSR-смоук всех экспортов, снапшот публичного API через `expectTypeOf` — ЛЮБОЕ изменение API требует осознанного обновления снапшота).
- `examples/demo` — Vite-демо: `src/apps/{BookingApp,GalleryApp,GameApp,ShopApp,PlatformApp}`, оболочка `src/shell/` (Shell, TweaksPanel, DeviceFrame; URL-параметры `?app=&dark=&accent=&roundness=&fontSize=&rtl=&insets=`), мок Telegram-клиента `src/telegram/mock.ts` (`createMockTelegram`). Демо офлайн-чистое: ноль внешних запросов (см. Decision Log).
- `e2e/` — Playwright 1.60, 7 проектов (chromium 402x874, reduced-motion, visual, visual-webkit, narrow-320, visual-dpr2/3), 294 теста: спеки design/states/tokens/contrast-modes/flows/aria/reflow/density/platform. Скриншот-эталоны коммитятся для darwin и linux; linux генерится в Docker: `npm run test:e2e:update:linux -- <spec> -g "<grep>"` (образ `mcr.microsoft.com/playwright:v1.60.0-noble`). Full-page скриншоты галереи требуют хелпер `paintGallery()` (секции под `content-visibility:auto` плавают по высоте). Контраст-долг заморожен бюджетом `CONTRAST_BUDGET=15` в a11y-спеке.
- Гейты пакета: `npm run check:package` = zero-deps + publint + attw + size-limit (tree-shaking бюджеты).
- Команды из корня: `npm run dev` (демо), `npm run test:unit`, `npm run test:e2e`, `npm run test:e2e:visual`, `npm run typecheck`, `npm run check:package`.

Известные ловушки окружения: глобальный `git core.autocrlf=true` — vitest-снапшоты и свежие чекауты `*.sh` могут показывать фантомные диффы/ломаться (есть `.gitattributes` с `*.sh text eol=lf`; лечение фантомов — `git checkout -- <файл>`); в WebKit табание по кнопкам — `Alt+Tab`; в Playwright 1.60 `reducedMotion` задаётся через `use.contextOptions`.

Сегодняшний публичный API: 78 компонентов TK* + хуки `useWebApp/useMainButton/useBackButton/useHaptics/useViewport/useSafeArea/useTelegramPopup/useCloudStorage/useInitData/useInvoice/useBiometrics/...` (полное покрытие Bot API 9.6, сверка скриптом-диффом против core.telegram.org).


## Research Summary — откуда взяты задачи

Полный конкурентный отчёт выдан в сессии 2026-06-13 и резюмирован в памяти проекта (`uikit-competitive-analysis`). Ключевые источники сигналов, на которые ссылаются задачи ниже:

- TelegramUI issues (все 74): date input #28, search #70, иконки #37/#71/#111, императивное закрытие Modal #85, полиморфный `Component` с выводом типов #68, проброс `onPointerDown` #102, радиусы через переменные #79, форс light/dark #26, кастомные цвета #30/#88/#114, высота Tabbar и перекрытие контента #78/#91/#93, dropdown под модалкой #100, Input в Modal на iOS #29, SSR/React19 #16/#77/#95, «LLM не могут писать код на ките» #57.
- Konsta issues: Calendar #160, PTR #218/#242, Accordion #148, sheet swipe-to-close/step #37/#199, свайп между табами #101, scrollable tabbar #149, expandable cards #38, shadcn-дистрибуция #252, infinite scroll/swipeout #247.
- VKUI [Feature]-issues: скролл внутри Panel #1064 (топ), Longpress #4843, анимация Counter #4256, бейдж в IconButton #6953, ScrollSaver #3750, виртуализация List #3497, data-testid #6219, CustomSelect multiple/«выбрать все» #3480/#6617, sticky-буллеты Gallery #7631.
- Ionic (по реакциям): date range 123, MD3 390 / iOS26 Liquid Glass 114, toast-очередь 31, swipe-back из любой точки 21, динамические breakpoints Sheet 19, Stepper 20, select с поиском/optgroup, long-press 16, Enter/Escape в диалогах 12, `keyboard-showing` класс.
- Статьи TMA 2025–2026 (Turumburum, Хабр 888596, EJAW): haptic-обвязка на каждое действие, скелетоны как стандарт, конфликт iOS edge-свайпов с каруселями, клавиатура iOS ломает layout, слабые WebView → виртуализация и дешёвые анимации, Stars-подписки/paywall, Lottie/конфетти для микро-наград.

Бэклог из production-аудита 2026-06-12 (Booking cancel/reschedule, демо Checkout/Stars и др.) включён в M8–M9.


## Decision Log

- Decision: Zero runtime dependencies сохраняем как жёсткий инвариант (включая новые компоненты: календарь, маски, жесты, конфетти — всё своё).
  Rationale: это измеримый дифференциатор против TGUI (floating-ui, vaul-форк) и страховка от судьбы заброшенных обёрток; гейт уже есть в `check:package`.
  Date/Author: 2026-06-13 / Claude+Nikita

- Decision: Платформенную адаптацию iOS/Material НЕ делаем; вместо неё — пресеты темы (`preset: "ios" | "material"` как наборы knobs) и явная позиция «один выверенный стиль» в README.
  Rationale: полная адаптация удваивает визуальную матрицу тестов (сейчас 185+ эталонов × 2 платформы); TGUI-адаптация всё равно бинарная ios/base и постоянно багует (#42/#75/#83). Пресеты дают 80% ценности за 5% цены.
  Date/Author: 2026-06-13 / Claude (предложение, подтвердить при ревью M10)

- Decision: FAB, Breadcrumbs, страничную Pagination не реализуем.
  Rationale: не-телеграмные паттерны (нет в гайдлайнах TMA и в практике мини-аппов; Breadcrumbs у TGUI есть — и не используется никем).
  Date/Author: 2026-06-13 / Claude

- Decision: TON Connect не реплицируем и не тащим в кит; в демо — мокнутый wallet-флоу на существующих TKWalletConnectButton/TKWalletStatusCell; интеграционный пример с `@tonconnect/ui-react` — отдельной папкой `examples/ton-connect`, исключённой из офлайн-гейтов и size-бюджетов.
  Rationale: офлайн-чистота демо — подтверждённый инвариант; TON Connect требует сети.
  Date/Author: 2026-06-13 / Claude

- Decision: Ломающие API изменения (forwardRef, rest-проброс, i18n-пропсы) идут первыми (M0–M1), до новых компонентов.
  Rationale: новые компоненты сразу пишутся по новым конвенциям; API-снапшот переписывается один раз волной, а не на каждом шаге.
  Date/Author: 2026-06-13 / Claude

- Decision: тест-инфраструктура каждой фичи — vitest (поведение/хуки) + e2e (сценарий) + visual (light+dark, darwin+linux) + при изменении API обновление API-снапшота. Бюджеты size-limit поднимаем осознанно, фиксируя дельту в этом файле (Surprises).
  Date/Author: 2026-06-13 / Claude

- Decision: для тестируемости пользовательских приложений добавляем опциональный проп `testId?: string` (рендерится как `data-testid`) вместо автогенерации или слепого rest-спреда.
  Rationale: запрос жанра (VKUI #6219); rest-спред на корень меняет семантику всех 78 компонентов сразу — делаем его точечно в M0 только там, где это безопасно.
  Date/Author: 2026-06-13 / Claude

- Decision: документацию строим как статический сайт из markdown в `docs/site` (Astro Starlight или аналогичный zero-backend генератор) + автогенерация API-референса из типов; llms.txt обязателен.
  Rationale: TGUI #57 показывает, что AI-агенты — реальные потребители доков; статический сайт деплоится на GitHub Pages без инфраструктуры.
  Date/Author: 2026-06-13 / Claude (генератор подтвердить на M10)

- Decision: `TKTimeInput` реализован как маскированный ввод `##:##` (не колонки-барабан).
  Rationale: дешевле, доступнее с клавиатуры, консистентно с TKMaskedInput; барабан остаётся кандидатом M11 (TKPicker).
  Date/Author: 2026-06-13 / Claude

- Decision: отложено (не в этом плане, отдельное решение при спросе): shadcn-style CLI-дистрибуция (Konsta #252), Vue/Svelte-порты, Figma-кит (внешний артефакт), TKDataTable/TKAutocomplete/TKPicker-барабан/TKColorInput — см. M11.
  Date/Author: 2026-06-13 / Claude


## Definition of Done (для каждой задачи плана)

Задача считается выполненной, когда: (1) компонент/фича экспортированы и типизированы, API-снапшот обновлён осознанно; (2) есть vitest на поведение (controlled/uncontrolled, callbacks, edge cases); (3) есть демо-секция в галерее (`data-demo-section`) или сценарий в демо-приложении; (4) e2e: сценарный тест + visual light/dark + aria-снапшот при необходимости; эталоны darwin и linux перегенерированы; (5) reduced-motion уважается для любой новой анимации (анимации — только transform/opacity); (6) ни одной новой захардкоженной пользовательской строки (всё через пропсы с дефолтами из локали, см. M1); (7) `npm run typecheck && npm run test:unit && npm run test:e2e && npm run check:package` зелёные; (8) `Progress` в этом файле обновлён.


## Milestones

Порядок выбран по зависимостям: фундамент API → i18n → a11y-долг → жестовая инфраструктура → формы → дисплеи → навигационный каркас → паттерны → демо. Внутри милстоуна задачи можно делать в любом порядке, если не указано иное.


### M0 — Фундамент API (ломающая волна)

Цель: все 78 компонентов соответствуют современным API-конвенциям; новые компоненты наследуют их автоматически. Зависимости: нет. Это единственная волна, где API-снапшот переписывается массово.

- [x] M0.1 `forwardRef` на всех компонентах с осмысленным DOM-корнем (кнопки, инпуты, ячейки, карточки, оверлеи-контент). Сигнал: TGUI #56 (react-hook-form), Konsta #258/#260/#272. Vitest: ref достижим у каждого экспорта (параметризованный тест по списку экспортов, по образцу SSR-смоука).
- [x] M0.2 Полиморфизм: `as`/`href` у `TKButton`, `TKCell`, `TKCardCell`, `TKTappable` с корректным выводом типов атрибутов (паттерн `ElementType` + `ComponentPropsWithoutRef<T>`). Сигнал: TGUI #68. `expectTypeOf`-тесты: `<TKButton as="a" href>` типобезопасен, `href` без `as="a"` — ошибка типов.
- [x] M0.3 Проброс нативных DOM-хендлеров и атрибутов (минимум: `onPointerDown/Up/Cancel`, `onFocus/Blur`, `id`, `aria-*`) на интерактивных компонентах. Сигнал: TGUI #102. Решить per-компонент: точечные пропсы, не слепой спред.
- [x] M0.4 `loading` у `TKButton` (спиннер + `aria-busy`, ширина не прыгает) и `disabled` поведение во время загрузки; у `TKIconButton` — size-варианты `sm|md|lg` вместо числа (число оставить как deprecated-ветку типа).
- [x] M0.5 Проп `testId?: string` → `data-testid` на всех компонентах (одним механизмом, см. Decision Log).
- [x] M0.6 Токены: spacing-шкала `--tk-sp-1..8` (4/8/12/16/20/24/32/40) и z-index-шкала `--tk-z-{base,sticky,header,overlay,sheet,dialog,popper,toast}` в `tokens.css`; заменить хардкоды (10/11/12/20/30/40) по всем `*.tsx`. Visual-прогон не должен дать диффов (чистый рефакторинг).
- [x] M0.7 Прототип CSS `@layer tk` вокруг tokens.css (изоляция специфичности от пользовательских стилей; сигнал VKUI #9497, Ionic #30369). Если visual/e2e дают диффы из-за специфичности — откатить и записать в Surprises с обоснованием.
- [x] M0.8 `TKDialog`: закрытие по Escape и подтверждение по Enter (когда есть единственное primary-действие); `TKSheet`/`TKActionSheet`/`TKPopper` — Escape. Сигнал: Ionic #21665. (Если Escape уже работает где-то через focus trap — покрыть тестом, не переписывать.)

Validation M0: `npm run test:unit` содержит новые параметризованные ref/polymorphism-тесты; API-снапшот обновлён одним коммитом; visual-прогон без диффов кроме осознанных; size-limit дельта зафиксирована в Surprises.


### M1 — i18n: TKLocaleProvider и вынос строк

Цель: ни одной захардкоженной пользовательской строки; кит локализуем без форка. У TGUI i18n нет вообще — дешёвое превосходство. Зависимости: M0 (пропсы-оверрайды поверх новых конвенций).

- [x] M1.1 `TKLocaleProvider` (контекст с дефолтным словарём `en`; объект `TKLocale` экспортируется; готовый пресет `ru` в комплекте). Приоритет разрешения: проп компонента → контекст → en-дефолт. Без провайдера всё работает как сейчас.
- [x] M1.2 Вынести все найденные строки (полный список из аудита): `buttons.tsx:275` "Done"; `navigation.tsx:40` aria "Back"; `overlays.tsx:302` "Cancel" (ActionSheet), `overlays.tsx:192` aria "Close"; `inputs.tsx:421` "Select options", `625-626` "Choose file"/"No file selected", `723/728` "Search"/"Cancel", `1032-1034` OTP ("Code verified"/"Didn't get the code?"/"Resend"); `cards.tsx:233` "Add to cart", `544` "Metric"; `controls.tsx:521/529` aria "Decrease"/"Increase", `554` шаблон рейтинга "N of M"; `display.tsx:160` "image"; `patterns.tsx:236` "LVL", `277` "You", `355-356` wallet-строки, `435` "Wallet". Плюс прочесать `grep -nE '"[A-Z][a-z]+ ?'` по src на пропущенные.
- [x] M1.3 Vitest: рендер ключевых компонентов под `TKLocaleProvider locale={ru}` показывает русские строки; без провайдера — английские; точечный проп побеждает провайдер.
- [x] M1.4 Демо: переключатель языка en/ru/ar в TweaksPanel + URL-параметр `?locale=`; `ar` включает RTL (синергия с существующим `?rtl=1`). e2e: смоук переключения.

Validation M1: `grep -rnE '>(Done|Cancel|Back|Search)<'` по `packages/uikit/src` пуст; новая галерея-секция «Localization» в visual-прогоне.


### M2 — A11y-долг

Цель: закрыть известные пробелы доступности до того, как код размножится в новых компонентах. Зависимости: M0.

- [x] M2.1 Roving tabindex + стрелочная навигация: `TKRadioGroup`, `TKChipGroup`, `TKMultiselect` (известный гэп из памяти), `TKCategoryTabs`, `TKInlineButtons`, `TKSegmented`. Паттерн WAI-ARIA radio/toolbar/listbox соответственно. e2e-клавиатурные сценарии в aria-спеке (помнить про Alt+Tab в WebKit).
- [x] M2.2 Контраст-долг `--tk-text-3`: подобрать значения light/dark, проходящие AA на своих поверхностях; снизить `CONTRAST_BUDGET` до 0 и удалить заморозку. Все visual-эталоны перегенерировать (darwin+linux).
- [x] M2.3 Фокус: видимое фокус-кольцо проверено на новых интерактивных элементах M0 (outline, не box-shadow — уже конвенция); `TKPopper`/`TKTooltip` доступны с клавиатуры (focus-открытие уже есть у Tooltip — покрыть тестом).
- [x] M2.4 `TKSegmented`: видимое disabled-состояние опций (сейчас не отличимо).
- [x] M2.5 Аудит-тест: axe-прогон новых компонентов включён в существующий a11y-спек (автоматически через галерею — проверить, что новые секции в неё попадают).

Validation M2: a11y-спек зелёный с `CONTRAST_BUDGET=0`; клавиатурные сценарии для каждого компонента из M2.1.


### M3 — Жесты и оверлеи 2.0

Цель: жестовая инфраструктура кита + закрытие самого горячего кластера запросов жанра (sheet-жесты, PTR, свайпы). Зависимости: M0; M3.1 — фундамент для остальных задач милстоуна и для M6.

- [x] M3.1 Внутренний хук `useDragGesture` (pointer events, rAF-троттлинг как в PlatformApp, пороги, velocity, отмена при скролле, опция оси) — НЕ экспортируется до стабилизации; на нём строятся M3.2/M3.4/M3.5/M6.2. Vitest на математику порогов/velocity.
- [x] M3.2 `TKSheet` 2.0: swipe-to-close за граббер/шапку; snap points (`snapPoints?: number[]`, проценты высоты; программная смена с анимацией — сигнал Ionic #25025); императивное API через ref (`close()/snapTo(i)`) — сигнал TGUI #85; `onOpenChange` колбэк. Reduced-motion: мгновенные переходы.
- [x] M3.3 Фикс слоёв: `TKSelect`/`TKMultiselect`/`TKPopper` внутри `TKSheet`/`TKDialog` рендерятся поверх (z-index шкала из M0.6 + портал-якорь TKProvider). Сигнал: TGUI #100. e2e: дропдаун внутри шита кликабелен.
- [x] M3.4 `TKPullToRefresh` (обёртка скролл-области: resistance-кривая, порог, спиннер на основе TKSpinner, `onRefresh: () => Promise<void>`, авто-скрытие). Хаптика `impact(light)` на взведении порога через optional-haptics (см. M7.4; до M7.4 — без хаптики). Сигнал: Konsta #218/#242, VKUI #2060.
- [x] M3.5 Swipe actions: `TKSwipeCell` (обёртка над TKCell: leading/trailing экшены, частичный и full-swipe, авто-закрытие соседей, клавиатурная альтернатива — кнопки видимы по фокусу). Сигнал: F7 Swipeout, Ionic Item Sliding, Konsta #247.
- [x] M3.6 `useLongPress` (экспортируемый хук: порог 500мс, отмена при движении, неконфликтность с кликом). Сигнал: VKUI #4843, Ionic #19183.
- [x] M3.7 `TKToast`: позиция `top|bottom` у провайдера, `action: {label, onClick}` (паттерн undo). Очередь/стекинг уже есть (`max`) — покрыть тестом переполнения. Сигнал: Ionic #20389.
- [x] M3.8 `TKPopper`: стрелка (`arrow?: boolean`) и auto-flip у краёв вьюпорта (свой расчёт, zero-deps). Сигнал: TGUI #67 (наоборот — у них стрелку нельзя убрать; у нас будет опцией).

Validation M3: e2e-сценарии: свайп закрывает шит (и не закрывает при `dismissible={false}`), PTR триггерит refresh ровно один раз, свайп-экшен открывается/закрывается, full-swipe вызывает действие; visual: шит на snap-точках, открытый свайп-экшен; reduced-motion варианты.


### M4 — Формы 2.0

Цель: формы уровня «жанрового стандарта», закрытие топ-запроса экосистемы (календарь). Зависимости: M0–M2 (конвенции, roving, локаль — названия месяцев/дней из TKLocale).

- [x] M4.1 `TKCalendar` — inline-календарь: месячная сетка, `mode: "single" | "range"` (range — топ-запрос: Ionic #23572, 123 реакции), `min/max`, `disabledDates` (предикат — сигнал VKUI #7749), локализованные месяцы/дни недели (Intl.DateTimeFormat, zero-deps), клавиатурная навигация по сетке (стрелки/Home/End/PageUp/Down), `weekStartsOn`. Без выбора времени в первой итерации.
- [x] M4.2 `TKDateInput` — поле, открывающее `TKCalendar` в `TKSheet` (мобильный паттерн); ручной ввод с маской по локали; controlled/uncontrolled. `TKTimeInput` — часы:минуты (две колонки-список или маскированный ввод — решить при реализации, записать в Decision Log).
- [x] M4.3 `TKMaskedInput` (шаблон `#`-масок, дефис/скобки литералы, каретка не прыгает, paste-поддержка) + пресет `TKPhoneInput` (на базе маски, `defaultCountry?`, без справочника всех стран в первой итерации). Из бэклога аудита.
- [x] M4.4 `TKPinInput` — отличие от TKOTP: экранная цифровая клавиатура (3×4), точки-индикаторы, shake-анимация ошибки, `onBiometricRequest` + интеграция `useBiometrics` (паритет с единственным эксклюзивом TGUI #PinInput, у нас — на живом хуке).
- [x] M4.5 `TKChipsInput` — теги внутри инпута (ввод по Enter/запятой, Backspace удаляет последний, переполнение в скролл). Сигнал: VKUI ChipsInput.
- [x] M4.6 `TKSelect`/`TKMultiselect`: поиск-фильтр внутри списка (`searchable?: boolean`), `TKOptionGroup` (optgroup в item-модели `options.ts`), у Multiselect — «выбрать все» (`selectAllLabel` через локаль). Сигналы: Ionic #30378, VKUI #3480/#6617, TGUI #70.
- [x] M4.7 `TKSlider`: range-режим (два тамба, общий трек, a11y два slider-роля), `marks?: number[]`.
- [x] M4.8 `TKInput`: счётчик `maxLength` (как в Textarea), `type="password"` + встроенный visibility-toggle (иконки eye/eyeOff из M5.1), слоты `prefix/suffix`.
- [x] M4.9 `TKCheckbox`: `indeterminate`. `TKStepper`: автоповтор по удержанию (на useLongPress из M3.6), опциональный прямой ввод значения. `TKRating`: `readonly`, половинки (`allowHalf`).
- [x] M4.10 `TKFileInput`: drag-n-drop зона (`TKDropZone`-режим), `progress?: number` на файл, превью изображений. Из бэклога аудита; сигнал VKUI DropZone.

Validation M4: e2e-флоу «заполнить форму с датой, телефоном, тегами и отправить» в новом Forms-демо (M9.8); visual: календарь single/range/disabled light+dark; vitest: маска (ввод/удаление/paste), календарная клавиатура, range-выбор через край месяца.


### M5 — Дисплеи, медиа, иконки

Цель: добить витринные компоненты и иконографию. Зависимости: M0 (иконки нужны M4.8 — делать M5.1 раньше M4 допустимо).

- [x] M5.1 Иконки 30 → ~80: добавить минимум eye/eyeOff, copy, qr, send, edit, filter, download, upload, refresh, warning, info, link, phone, mail, camera, mic, play, pause, volume/volumeOff, lock/unlock, settings, logout, globe, bookmark, flag, thumbsUp, fire, sparkles, dots(menu), externalLink, creditCard→уже card, shield, eyedropper?, document, image, video, smile, pin, mute, forward, reply, archive, verifiedBadge. Тот же стиль (24×24, stroke 2, round). `TK_ICON_NAMES` уже экспортируется — галерея-секция с поиском по имени и копированием имени по клику. Сигнал: TGUI #37/#71/#111 (иконки — их вечная боль).
- [x] M5.2 `TKAvatarStack` (перекрытие, `max` + «+N», инициалы — сигнал VKUI #2173); `TKAvatar`: `status?: "online" | "offline" | ReactNode` точка-индикатор.
- [x] M5.3 `TKSpoiler` — телеграм-фича: блюр/шум до тапа, `revealed` controlled/uncontrolled, a11y (контент скрыт от ридеров до раскрытия).
- [x] M5.4 `TKBlockquote` (вертикальная полоса-акцент, опциональная иконка цитаты).
- [x] M5.5 `TKGallery` — свайп-карусель: CSS scroll-snap основа (SSR-safe — сигнал VKUI #5808), интеграция TKPageDots, «safe margins» от iOS edge-свайпов Telegram (отступ от краёв + опциональный вызов `disableVerticalSwipes` через optional-telegram контекст — статья Turumburum), поддержка тачпада. 
- [x] M5.6 `TKSkeletonText` (N строк, последняя короче); `TKEmptyState`: слот `media?: ReactNode` под иллюстрацию/Lottie (паттерн Placeholder из TGUI).
- [x] M5.7 `TKCounter`: усечение `max` («99+») и анимация смены значения (roll/fade, transform/opacity-only). Сигнал: VKUI #4256. `TKIconButton`: `badge?: number | boolean`. Сигнал: VKUI #6953, Ionic #18736.
- [x] M5.8 `TKImage`: `srcSet/sizes`, blur-up (`placeholderSrc` → плавная замена).
- [x] M5.9 `TKHeader`: collapsing large title (large → компакт при скролле контейнера TKPage, прозрачная связка через контекст TKPage; iOS-паттерн, есть у Konsta Navbar). Visual-тест двух состояний.
- [x] M5.10 `TKInfiniteList` (IntersectionObserver-сентинел, `onLoadMore`, `hasMore`, слот лоадера) и `TKVirtualList` (фиксированная высота элемента в первой итерации, overscan; сигнал VKUI #3497, слабые WebView из статей). Стресс-секция галереи на 10k элементов.
- [x] M5.11 `TKProgress`: `size sm|md|lg`. `TKAccordion`: ленивый рендер контента (`lazy?: boolean`). `TKTabbar`: высота через CSS-переменную `--tk-tabbar-h` и рецепт «контент не перекрывается» в доке/демо (боль TGUI #78/#91/#93 — у нас TKPage+TKBottomBar уже решают, задача = задокументировать и покрыть e2e).

Validation M5: галерея-секции для каждого нового компонента; visual light+dark; vitest: virtual list рендерит ≤ видимого+overscan, counter анимация уважает reduced-motion (мгновенная смена).


### M6 — Навигационный каркас (главный дифференциатор)

Цель: то, чего нет ни у одного Telegram-кита — стек экранов со свайп-беком, интегрированный с платформенным слоем. Сигнал: VKUI Epic/View/Panel как УТП жанра, VKUI #1064 (скролл внутри Panel), Ionic #27743 (swipe-back из любой точки). Зависимости: M3.1 (жесты), M0.

- [ ] M6.1 `TKNavStack` + `TKNavPanel` + хук `useNav()` (`push/pop/replace/popTo`, params); рендер стека с сохранением state нижних панелей; направленные переходы (slide, reduced-motion → fade/instant); `onStackChange`.
- [ ] M6.2 Свайп-бек: edge-зона (опционально «из любой точки»), интерактивный прогресс перехода на useDragGesture, отмена/доводка по velocity.
- [ ] M6.3 Интеграция платформы: `useBackButton` показывается при глубине >1 и делает `pop()`; открытый `TKSheet`/`TKDialog` перехватывает back раньше стека (приоритетная очередь «кто обрабатывает back» в TKTelegramProvider); `ClosingConfirmation`-рецепт в доке.
- [ ] M6.4 ScrollSaver: автосохранение/восстановление scrollTop панелей при pop (сигнал VKUI #3750); скролл живёт внутри панели, не на body (VKUI #1064).
- [ ] M6.5 `useKeyboard` — keyboard-aware хук (visualViewport: `{visible, height}`), класс `tk-kb-open` на корне TKProvider, рецепт «инпут над клавиатурой» (боль iOS из статей; сигнал Ionic #29887; смежный баг TGUI #93 с safe-area после blur — покрыть тестом в mock).
- [ ] M6.6 Demo: перевести BookingApp на TKNavStack (профиль врача — новый экран в стеке, M8.6) как dogfooding; Platform Lab — карточка back-приоритетов (шит vs стек).

Validation M6: e2e: push→свайп-бек возвращает экран с восстановленным скроллом; back-кнопка mock-клиента закрывает шит, второй тап — pop; visual: середина свайп-бек жеста (drag в Playwright); reduced-motion: переходы мгновенны. Vitest: очередь back-обработчиков.


### M7 — Telegram-паттерны и «вау»-слой

Цель: компоненты, делающие кит узнаваемо-телеграмным. Зависимости: M0–M3, M5.1.

- [ ] M7.1 `TKMessages` + `TKMessageBubble` + `TKWriteBar` — чат-лента (входящие/исходящие, группировка хвостов, время, статусы галочек) и поле ввода (авто-рост textarea, слоты attach/send, safe-area). Сигнал: Konsta Messages, VKUI WriteBar; основа Support-демо M9.4.
- [ ] M7.2 `TKOnboardingTooltip` — coach marks поверх TKPopper: подсветка таргета (вырез в оверлее), шаги (`steps[]`, next/skip из локали), persist «показано» через optional cloud storage. Сигнал: уникум VKUI.
- [ ] M7.3 `TKConfetti` — canvas-салют (одноразовый burst, ~150 частиц, transform-only, reduced-motion → не рендерится, авто-очистка). Сигнал: статьи (микро-награды); использование: Game level-up (M8.7), Stars-оплата (M9.1).
- [ ] M7.4 Optional-haptics: проп `haptics?: boolean` на `TKTelegramProvider` (default false) + внутренний `useOptionalHaptics`; обвязка: TKSwitch/TKCheckbox/TKRadioGroup (selection), TKTabbar/TKSegmented (selection), TKSlider (на шаге, троттлинг), TKMainButton success (notification), PTR порог (impact light), swipe-action full-swipe (impact medium), TKPinInput ошибка (notification error). Сигнал: статья Turumburum «haptic на каждое действие — стандарт TMA». Vitest через createMockTelegram: события хаптики пишутся в event log.
- [ ] M7.5 Theme presets: `preset?: "ios" | "material"` у TKProvider (наборы knobs: радиусы/spring/размеры; material = меньше радиусы, прямее easing) + опциональный `glass`-акцент (полупрозрачные поверхности; iOS26-тренд, Ionic #30466 — 114 реакций) как эксперимент: если контраст-тесты против — отказ записать в Surprises.

Validation M7: visual: чат-лента light+dark+RTL; e2e: onboarding-шаги переключаются и не возвращаются после «показано»; хаптика логируется в Platform Lab event log.


### M8 — Демо 2.0: из витрины в инструмент

Цель: демо продаёт кит и служит документацией. Зависимости: компонентные милстоуны для новых секций; M8.1–M8.5 не зависят от них и могут идти параллельно.

- [ ] M8.1 Код-сниппеты: у каждой галерея-секции кнопка «код» → подсвеченный JSX (мини-хайлайтер строк на 100 без deps, или `<pre>` без подсветки — решить) + copy-to-clipboard (`useClipboard` уже есть в платформенном слое — dogfooding). Сниппеты лежат рядом с секциями как строки-константы; CI-проверка `scripts/check-snippets.mjs`: каждый сниппет компилируется (tsc на временном файле).
- [ ] M8.2 Поиск + оглавление галереи: сайдбар/шторка с якорями по 27+ секциям, фильтр по имени компонента; deep-link `?app=gallery&section=inputs` (расширение существующих URL-параметров). ВНИМАНИЕ: учесть `paintGallery()` и `content-visibility` (скролл к секции должен её отрисовать).
- [ ] M8.3 Prop-playground для 6 компонентов (Button, Input, Sheet, Cell, Calendar, NavStack): панель контролов (сами из кита — switch/select/slider) + live-превью + генерация сниппета с текущими пропсами.
- [ ] M8.4 Persistence через собственный `useCloudStorage` (mock уже хранит в localStorage): корзина Shop, XP/coins/streak Game, выбранные настройки TweaksPanel. Кнопка «сбросить демо-данные» в TweaksPanel.
- [ ] M8.5 Имитация сети: утилита `demoDelay(ms)+demoFail(p)` в демо; каталог Shop грузится со скелетонами (TKSkeletonCard в деле), оплата — с loading у TKMainButton и сценарием ошибки+retry (failure-флоу уже есть — добавить задержки/скелетоны); пустой поиск → TKEmptyState.
- [ ] M8.6 BookingApp: динамические даты от `new Date()` (e2e фиксируют clock через Playwright `clock` API — проверить поддержку в 1.60, иначе инжект "сегодня" через URL-параметр `?today=2026-06-13` — этот же параметр стабилизирует visual-эталоны); cancel/reschedule флоу; экран профиля врача (на TKNavStack, M6.6); permission states (нотификации запрещены → TKEmptyState с действием).
- [ ] M8.7 GameApp: честный daily reward (timestamp в cloud storage, таймер до следующего), level-up с TKConfetti и анимацией TKXPHeader.
- [ ] M8.8 ShopApp: промокод (валидация, error/success у TKFormField), лимит остатков («осталось 2»), бейдж корзины через обновлённый TKCounter.
- [ ] M8.9 Locale-переключатель (готов в M1.4) + RTL: прогнать все приложения, зафиксировать visual ar-RTL эталоны для Shop home.
- [ ] M8.10 Deep links на экраны приложений: `?app=shop&screen=cart` и аналоги (упростит e2e и шаринг).

Validation M8: e2e: поиск находит секцию и доскролливает; сниппет копируется (clipboard mock); корзина переживает reload; флоу Booking cancel/reschedule зелёный; visual: скелетон-состояние каталога.


### M9 — Новые демо-приложения

Цель: продуктовые сценарии, которые не показывает ни один конкурент. Каждое демо — отдельный `?app=` в shell + e2e-флоу. Зависимости указаны per-задача.

- [ ] M9.1 Stars Checkout (`?app=stars`): тарифы (TKCardChip/TKPaymentSummary) → `useInvoice` (XTR) через mock (статусы paid/cancelled/failed) → квитанция + TKConfetti. Paywall-паттерн подписки (статья EJAW). Зависимости: M7.3. Mock: убедиться, что openInvoice-статусы детерминированы.
- [ ] M9.2 Onboarding / Identity (`?app=onboarding`): слайды на TKGallery+TKPageDots → requestContact → requestWriteAccess → установка TKPinInput + биометрия (`useBiometrics`) → emoji-status. Все permission-отказы имеют ветки UI. Зависимости: M4.4, M5.5.
- [ ] M9.3 Storage & Settings restore (`?app=settings`): профиль настроек на cloud/device/secure storage (три колонки-сравнение), «выйти и вернуться» (симуляция перезапуска mock) с восстановлением. Зависимости: нет (хуки есть).
- [ ] M9.4 Support / Bot handoff (`?app=support`): чат на TKMessages/TKWriteBar, быстрые ответы TKChipGroup, эскалация «передать оператору» (openTelegramLink mock), рейтинг диалога TKRating. Зависимости: M7.1.
- [ ] M9.5 Fullscreen mini-game (`?app=arcade`): requestFullscreen + lockOrientation + сенсоры (useMotionSensors — детерминированные показания mock) в простой игре (наклоном собрать точки), пауза при `visibilityChanged`. Зависимости: нет (хуки есть); канвас-игра — простая, без физики.
- [ ] M9.6 Channel/Feed (`?app=feed`): лента постов — TKSpoiler, TKBlockquote, реакции (TKChip+TKCounter анимация), репост через useShare, «прочитано» по IntersectionObserver. Зависимости: M5.3, M5.4, M5.7.
- [ ] M9.7 TON Wallet flow (`?app=wallet`): mock-флоу connect → balance → send (TKMaskedInput суммы) → confirm (TKDialog) → история (TKInfiniteList) на существующих TKWalletConnectButton/TKWalletStatusCell. Плюс отдельный `examples/ton-connect` с реальным `@tonconnect/ui-react` (вне офлайн-гейтов, см. Decision Log). Зависимости: M4.3, M5.10.
- [ ] M9.8 Forms showcase (`?app=forms`): анкета «запись на тест-драйв»: TKDateInput+TKCalendar, TKPhoneInput, TKChipsInput, TKFileInput c прогрессом, TKSlider range — с валидацией и итоговым TKSheet-резюме. Зависимости: M4 целиком. Это приёмочный полигон M4.

Validation M9: каждый app — e2e-флоу (happy + 1 failure) в `e2e/flows.spec.ts` или новых спеках; visual: главный экран каждого демо light+dark (darwin+linux); platform.spec расширен на новые mock-взаимодействия.


### M10 — Документация, позиционирование, дистрибуция

Цель: DX-паритет с порталами конкурентов и AI-friendly доки. Зависимости: стабилизация API (после M6 минимум).

- [ ] M10.1 Сайт документации в `docs/site` (генератор по Decision Log): страницы Getting Started / Theming (knobs+presets+tg-theme) / Telegram platform (хуки+mock+testkit) / Components (страница на компонент: описание, пропсы, сниппеты из M8.1, ссылка на секцию галереи). API-референс автогенерацией из `.d.ts` (typedoc-json → markdown скриптом `scripts/gen-api-docs.mjs`). Деплой GitHub Pages workflow.
- [ ] M10.2 `llms.txt` + `docs/llms-full.md`: компактная карта API для AI-агентов (список компонентов/пропсов/паттернов, anti-patterns). Сигнал: TGUI #57 («LLM не могут писать код на ките») — превращаем в фичу.
- [ ] M10.3 README-позиционирование: сравнение с TGUI/Konsta/VKUI (живость, тесты, zero-deps, платформенный слой, React 19), позиция «один выверенный стиль + knobs + presets», ссылка на сайт доков; бейдж покрытия Bot API 9.6.
- [ ] M10.4 Рецепты (docs): «Tabbar и контент» (боль TGUI #78), «инпут над клавиатурой» (M6.5), «edge-свайпы iOS и карусели», «back-приоритеты», «интеграция с tg-mini-app-testkit» (соседний проект — синергия: наш mock для разработки, их testkit для e2e пользовательских аппов).
- [ ] M10.5 CI: job сборки доков; Lighthouse-смоук демо (perf-бюджет INP из статей — фиксируем не хуже текущего); обновить docs/demo.gif с новыми демо.
- [ ] M10.6 Релиз 0.2.0: CHANGELOG с миграционными заметками M0/M1 (breaking), npm publish dry-run через check:package.

Validation M10: сайт собирается в CI и открывается локально (`npm run docs:dev`); llms.txt валиден (скармливается агенту в смоук-тесте вручную); README-сравнение фактологически сверено с актуальными версиями конкурентов.


### M11 — Опциональный бэклог (вне обязательного объёма)

Решение об активации — отдельно, при спросе. Кандидаты: `TKAutocomplete` (поиск с подсказками), `TKDataTable` (sticky-колонки — VKUI #6605), `TKPicker`-барабан (Ionic #20317), `TKColorInput`, `TKVirtualList` с переменной высотой, expandable cards (Konsta #38), свайп между табами (Konsta #101 — частично закроется TKGallery), Vue/Svelte порты, shadcn-CLI дистрибуция (Konsta #252), Figma-кит (внешний артефакт), отключаемый glass-режим (Konsta #268 — учесть при M7.5).


## Validation and Acceptance (сквозные гейты)

После каждого милстоуна, из корня репозитория:

    npm run typecheck
    npm run test:unit
    npm run test:e2e
    npm run check:package

Ожидаемо: все зелёные; количество тестов растёт (фиксировать в Progress); size-limit в пределах бюджетов (или бюджет повышен осознанно с записью в Surprises). Перегенерация visual-эталонов: darwin локально `npm run test:e2e:update -- <spec> -g "<grep>"`, linux — `npm run test:e2e:update:linux -- <spec> -g "<grep>"` (Docker должен быть запущен). Финальная приёмка плана: все чекбоксы M0–M10 закрыты, демо показывает 13 приложений (5 текущих + 8 новых), README-сравнение с конкурентами актуально.


## Idempotence and Recovery

Все шаги аддитивны или рефакторинги под тестами; визуальные диффы обнаруживаются e2e до коммита. Безопасные практики, проверенные в этом репо: фантомные "modified" vitest-снапшоты при `autocrlf=true` лечатся `git checkout -- <файл>`; новые `*.sh` обязаны попадать под `.gitattributes` (`*.sh text eol=lf`); full-page скриншоты галереи — только через `paintGallery()`; не запускать `test:e2e:update` без `-g`-фильтра при точечных правках (перегенерирует лишнее). Ломающая волна M0/M1 делается в отдельной ветке с одним сводным обновлением API-снапшота; если волна частично смержена — API-снапшот фиксирует фактическое состояние, незавершённые конвенции переносятся чекбоксами в Progress, не «висят» в коде. Прототипы с риском отката: M0.7 (@layer), M7.5 (glass) — у обоих определён путь отката (удалить слой/пресет, записать в Surprises).


## Progress

- [x] (2026-06-13) Ресерч: полный API-аудит кита и демо; конкурентный анализ TGUI/Konsta/VKUI/Ionic/F7/TON; два прохода по issues (74 TelegramUI, 54 Konsta, 50 VKUI [Feature], топ Ionic по реакциям); итоги в памяти проекта и в этом плане.
- [x] (2026-06-13) ExecPlan составлен и сохранён как `plans.md`.
- [x] (2026-06-13) M0 Фундамент API (8/8): forwardRef на 21+ компоненте, полиморфизм as/href (Button/Cell/CardCell/Tappable), точечный DOM-проброс через `internal/dom.ts`, loading у TKButton + size-варианты IconButton, testId на всех компонентах (параметризованный тест), spacing/z-index шкалы + `@layer tk` (visual без диффов), Escape/Enter в оверлеях. +122 vitest (278 всего).
- [x] (2026-06-13) M1 i18n (4/4): `src/i18n.tsx` (TKLocale/TKLocaleProvider/useTKLocale/tkFormat, пресеты en+ru), все строки из аудита вынесены (grep-валидация пуста), vitest-приоритет «проп → провайдер → en», демо: ?locale=en|ru|ar + сегмент Language в Tweaks + ar→RTL + секция галереи Localization (+4 visual эталона darwin+linux), e2e/i18n.spec.ts (4 смоука).
- [x] (2026-06-13) M2 A11y-долг (5/5): roving tabindex + стрелки (RadioGroup/ChipGroup/Multiselect/CategoryTabs/InlineButtons/Segmented, общий `internal/roving.ts`), контраст: AA-значения --tk-text-2/3 + новые `--tk-*-ink` токены для брендового текста на тонированных подложках, CONTRAST_BUDGET=0; tooltip focus-тест; Segmented disabled = text-3; новые клавиатурные e2e; все 189 visual-эталонов перегенерированы (darwin+linux).
- [x] (2026-06-13) M3 Жесты и оверлеи 2.0 (8/8): `internal/useDragGesture` (пороги/velocity/rAF/отмена кросс-оси, экспортируемая математика покрыта vitest), TKSheet 2.0 (snapPoints, sheetRef: close/snapTo/snapIndex, onOpenChange, dismissible, swipe-to-close за граббер), слои: дропдаун внутри шита кликабелен (e2e), TKPullToRefresh, TKSwipeCell (leading/trailing, full-swipe, авто-закрытие соседей, клавиатурная альтернатива), useLongPress, TKToast position top|bottom + тест переполнения, TKPopper arrow + auto-flip. Демо-секция Gestures + e2e/gestures.spec.ts (5 сценариев).
- [x] (2026-06-13) M4 Формы 2.0 (10/10): TKCalendar (single/range, min/max/predicate, Intl-локализация, клавиатурная сетка, weekStartsOn), TKDateInput (календарь в шите) + TKTimeInput (маска ##:## — см. Decision Log), TKMaskedInput/TKPhoneInput, TKPinInput (экранная клавиатура, биометрия, shake), TKChipsInput, searchable Select + TKOptionGroup + select-all у Multiselect, range-slider с marks, TKInput (счётчик/password-toggle/prefix-suffix), Checkbox indeterminate + Stepper autorepeat/editable + Rating readonly/half, TKFileInput dropZone/progress/preview. 31 новый vitest, e2e/forms.spec.ts (6 сценариев), секция Forms 2.0 в галерее.
- [x] (2026-06-13) M5 Дисплеи/медиа/иконки (11/11): 77 иконок (+42, секция Icons с поиском и copy-to-clipboard), TKAvatarStack + Avatar status, TKSpoiler (a11y: скрыт от ридеров, aria-label из локали), TKBlockquote, TKGallery (scroll-snap + PageDots + edgeInset), TKSkeletonText + EmptyState media, TKCounter max + IconButton badge, TKImage srcSet/sizes/blur-up, collapsing TKHeader (контекст скролла TKPage), TKInfiniteList + TKVirtualList (10k стресс в галерее), Progress size + Accordion lazy + --tk-tabbar-h. Секции Icons и Display 2.0, e2e/display.spec.ts (5 сценариев).
- [ ] M6 Навигационный каркас (6 задач)
- [ ] M7 Telegram-паттерны (5 задач)
- [ ] M8 Демо 2.0 (10 задач)
- [ ] M9 Новые демо (8 задач)
- [ ] M10 Документация и дистрибуция (6 задач)
- [ ] M11 Опциональный бэклог — не активирован


## Surprises & Discoveries

- Observation: официальный `@telegram-apps/telegram-ui` фактически без мейнтейнера с 2025-10-14; экосистемные UI-хотелки оседают в его issues и issues Konsta, через tma.js они не идут (0 результатов поиска «UI kit» в их issues/discussions).
  Evidence: TelegramUI #99 («Why the ui is not maintained anymore?», последний коммент 2026-02-22), pushed_at репозитория; поиск по tma.js — отчёт субагента 2026-06-13.
- Observation: в awesome-telegram-mini-apps за 2025–2026 не появилось ни одного нового UI-кита; единственный сторонний datetime-picker для TMA — одиночный `Expented/tgdtp`.
  Evidence: раздел UI Kits актуального main и открытые PR awesome-репо (отчёт субагента 2026-06-13).
- Observation (2026-06-13, M0): переход на `forwardRef` сломал tree-shaking (импорт TKButton тянул 9.5 kB вместо 2): rollup считает top-level вызов `forwardRef(...)` сайд-эффектным. Лечение: `/* @__PURE__ */` перед каждым вызовом — бюджеты size-limit вернулись в норму без повышения.
  Evidence: size-limit до/после аннотаций (2.07 kB TKButton, 1.27 kB TKSpinner).
- Observation (2026-06-13, M0): `forwardRef`-компоненты — объекты, не функции; параметризованные тесты (SSR-смоук) с фильтром `typeof === "function"` молча теряли их. Введён общий хелпер `test/helpers/components.ts` (`$$typeof`-проверка).
- Observation (2026-06-13, M0): visual-тест `gallery — light › media` флакует и на чистом main (~0.01 ratio, шиммер скелетонов); не связан с волной M0 — receipt-регрессию в WebKit вызвала обёртка контента TKButton в span, исправлено рендером без обёртки вне loading.
- Observation (2026-06-13, M0): `@layer tk` вокруг tokens.css прошёл без визуальных диффов — прототип оставлен.
- Observation (2026-06-13, M2): контраст-долг шире, чем text-3: падали и text-2, и брендовый текст на 12%-подложках (tonal-кнопки, soft-бейджи). Введены производные токены `--tk-accent/red/green/orange-ink` (color-mix к --tk-text) — AA в обеих темах при любом акценте. «Белый на сплошном брендовом» (filled-кнопки, счётчики) остаётся осознанным исключением: акцент приходит из темы Telegram, его контраст — решение хост-приложения; блокирующий скан по-прежнему исключает color-contrast, burn-down закреплён на 0.
  Evidence: дамп axe до фикса (15 узлов), после — 0; попытка включить color-contrast в блокирующий скан дала 12 падений только на white-on-brand.
- Observation (2026-06-13, M3): mouse-драг в e2e выделял текст ячейки, и следующий клик уезжал в native drag выделения — флак 50%. Лечение в компоненте (а не тесте): `user-select:none` на корне TKSwipeCell; плюс хелперы centerInView/waitSettled в gestures.spec (ленивые секции смещают геометрию после scrollIntoView, шит анимируется при открытии).
- Observation (2026-06-13, M3/M4): full-kit бюджет size-limit поднят 23→34 kB (esm) и 24→35 kB (cjs): добавлены целые подсистемы — жесты (useDragGesture/PTR/SwipeCell/Sheet 2.0) и формы 2.0 (TKCalendar/TKDateInput/TKTimeInput/TKMaskedInput/TKPhoneInput/TKPinInput/TKChipsInput + searchable select/range slider). Tree-shaking бюджеты не тронуты (TKButton 2.72 kB < 3, TKSpinner 1.9 kB < 2) — потребители платят только за то, что импортируют.
- (далее заполняется по ходу работ)


## Outcomes & Retrospective

(Заполняется после завершения милстоунов: что изменилось, что работает, что осталось, какие уроки.)
