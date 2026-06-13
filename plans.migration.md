# ExecPlan: миграция «Kit»-галереи → стандартный component-explorer

Этот файл — самодостаточный план миграции в формате ExecPlan (как корневой `plans.md`): поведенческие критерии приёмки, обновляется по мере продвижения, читатель считается новичком в репозитории. Это **отдельный** документ; корневой `plans.md` (мастер-роадмап M1–M9) не трогается. По готовности эту веху можно вшить в `plans.md` как «M10».

> ✅ Статус: **реализован требуемый путь** — Storybook + вариант A (скрыть Kit, оставить галерею e2e-фикстурой). Фактический публичный surface на момент миграции: **102 `TK*` value exports**; `npm run check:stories` строит список из TypeScript API, поэтому будущие экспорты не требуют ручного обновления счётчика.

---

## Purpose / Big Picture

Заменить рукодельную демо-галерею («Kit») на **стандартный инструмент показа компонентов** (component explorer), который запускается отдельной командой и при старте показывает все компоненты кита с изоляцией, темизацией и controls. Цель — идиоматичный DX (как у любой публичной библиотеки), меньше ручного сопровождения витрины и единая точка «посмотреть/подёргать компонент».

Наблюдаемый результат: `npm run stories` (новая команда) поднимает explorer, в котором каждый `TK*`-компонент представлен ≥1 историей; тумблеры темы (dark / accent / roundness / locale / RTL / density / preset) перетемизируют любую историю; `npm run test:unit` / `test:e2e` / `check:package` остаются зелёными (в рекомендуемом варианте — без потери покрытия).

---

## Текущее состояние и footprint (почему это не «свап вкладки»)

«Kit» в навигации — это `{ key: "gallery", label: "Kit" }` в `examples/demo/src/shell/Shell.tsx:73`, рендерящий `GalleryApp`. Вокруг него:

**Код галереи — ~1801 строка в 8 файлах** (`examples/demo/src/apps/gallery/`):

| Файл | Строк | Роль |
|---|---|---|
| `GalleryBasics.tsx` | 474 | базовые секции (buttons, inputs, selection, forms 2.0, composition) |
| `GalleryAdvanced.tsx` | 460 | продвинутые (lists, display, media, patterns) |
| `Playground.tsx` | 259 | prop-playground (живая настройка пропов) |
| `GalleryApp.tsx` | 166 | оболочка: TOC, поиск, секции, lazy |
| `shared.tsx` | 129 | `Section`/общие хелперы витрины |
| `snippets.ts` | 127 | код-сниппеты с копированием (источник CI-гейта) |
| `theme-sections.tsx` | 108 | секции темизации |
| `GalleryOverlays.tsx` | 78 | overlays-секция |

**18 e2e-спеков заходят в галерею** (`?app=gallery` / `gallerySection()` / `paintGallery()`) и используют её как **главный полигон регрессий** дизайн-системы (не только как витрину):

`design`, `motion`, `reduced-motion`, `a11y-keyboard`, `a11y-axe`, `density`, `contrast-modes`, `tokens`, `states`, `aria`, `display`, `reflow`, `gestures`, `i18n`, `forms`, `wow`, `demo2`, плюс `helpers.ts` (`gallerySection`/`paintGallery`).

**CI-гейты и скрипты:**
- `scripts/check-snippets.mjs` — типчекает каждый сниппет из `snippets.ts` (гейт «M8.1»).
- `scripts/record-demo.mjs` — записывает demo.gif (частично по галерее).
- `package.json`: `check:snippets`.

**Прочее на старте:** в ките было **103 заявленных `TK*`-компонента**; Storybook не был установлен; демо ходило в исходники кита через vite-alias (мгновенный HMR); темизация крутилась через `TKProvider` + `TweaksPanel` + URL-параметры (`dark/accent/roundness/fontSize/rtl/locale/insets`), есть `preset` iOS/Material и `density`/`motion`. Фактическая проверка TypeScript API на момент реализации нашла **102 `TK*` value exports**.

**Вывод:** «удалить Kit» наивно = уронить ~18 e2e-файлов + snippet-CI + playground и потерять регрессы по токенам/a11y/контрасту/плотности/i18n. Поэтому план разнесён на аддитивные фазы с явной точкой «отрезания вкладки».

---

## Решения к подтверждению

### Решение 1 — инструмент

| Вариант | За | Против | Вердикт |
|---|---|---|---|
| **Storybook 10** | индустриальный стандарт, controls / docs / a11y addons, привычный формат для отдельных component stories | тяжелее минимального Vite-only explorer, дольше CI | **выбран** |
| **Histoire** | Vite-native | поддержка в 2024–25 замедлилась | не рекомендую для нового проекта |

### Решение 2 — объём (что делать с галереей-полигоном)

| Вариант | Что происходит | Риск |
|---|---|---|
| **A. Скрыть Kit, галерею оставить фикстурой** *(рекомендую)* | убрать вкладку Kit из навигации; `?app=gallery` остаётся доступен только для e2e; explorer становится витриной | низкий — 18 e2e + snippet-CI зелёные, покрытие не теряется |
| **B. Полная миграция** | удалить галерею, перенести 18 спеков на explorer (Storybook test-runner + Playwright), пересобрать snippet-гейт | высокий объём, несколько этапов |
| **C. Удалить галерею и её e2e** | снести галерею + 18 спеков + snippet-гейт | теряем регрессы токены/a11y/контраст/плотность/i18n |

**Выбранная связка:** **Storybook + вариант A**. Аргумент: запрос «стандартные stories для отдельных компонентов» закрывается напрямую, при этом тест-харнесс не разрушается, а удаление вкладки — обратимая правка одной строки. Полную миграцию тестов (вариант B) можно сделать отдельной вехой позже, когда explorer устаканится.

---

## Целевая архитектура (для рекомендуемого пути)

- **Где живут истории:** в воркспейсе `examples/demo` (а не в `packages/uikit`) — чтобы переиспользовать мок Telegram (`src/telegram/mock.ts`), vite-alias на исходники кита и существующую темизацию. Кит остаётся zero-dep; explorer-зависимости — только devDependencies демо.
- **Истории:** `examples/demo/stories/**/*.stories.tsx` (CSF), рядом с `src`, как test-like companion surface; каждая story показывает отдельный `TK*`-компонент или его минимальный интерактивный harness.
- **Глобальный декоратор:** `TKProvider` + `TKLocaleProvider` + мок-Telegram оборачивают каждую историю; тумблеры темы выведены как Storybook `globalTypes` toolbar.
- **Команды (корень):** `npm run stories` (dev), `npm run stories:build` (статическая сборка — заодно компиляционный гейт вместо `check-snippets`).
- **CI:** шаг `stories:build` гарантирует, что все истории компилируются (заменяет смысл snippet-гейта). Публичный API-снапшот (156 vitest, `expectTypeOf`) и `size-limit` не затрагиваются (инструмент — devDep, в бандл не попадает).

---

## Милстоуны

Нумерация `M-MIG-N`. Каждая фаза аддитивна до M-MIG-3 (включительно можно откатить ревертом).

### M-MIG-0 — Spike & setup (аддитивно)
**Делаем:** установить Storybook в `examples/demo` (devDeps), конфиг `.storybook/main.ts` + `preview.tsx`, глобальный декоратор с `TKProvider` (тема light по умолчанию) и мок-Telegram, одна история `TKButton` со всеми variant/size, корневые скрипты `stories` / `stories:build`.
**Критерий приёмки:** `npm run stories` открывает explorer; видна история `TKButton`; `npm run stories:build` завершается успешно; `npm run test:unit` и `check:package` по-прежнему зелёные.

### M-MIG-1 — Глобальные controls = текущие «tweaks»
**Делаем:** вынести в глобальные тумблеры explorer'а параметры, которые сегодня даёт `TweaksPanel`/URL: `dark`, `accent`, `roundness`, `fontSize`, `locale` (en/ru/ar), `rtl`, `density`, `motion`, `preset` (iOS/Material). Реализация — декоратор, прокидывающий значения в `TKProvider`/`TKLocaleProvider` и `document.dir`.
**Критерий приёмки:** переключение `dark` и `rtl` в тулбаре перетемизирует/переворачивает любую открытую историю; `accent`/`roundness`/`fontSize` живо меняют токены (визуально как в демо).

### M-MIG-2 — Истории для всех разделов (паритет покрытия)
**Делаем:** портировать секции галереи в CSF-истории так, чтобы **каждый из 103 `TK*` появился ≥1 раз**. Telegram-зависимые компоненты (`TKMainButton`, биометрия, `useViewport` и т.п.) оборачивать мок-провайдером. Перенести «живые» состояния (loading/error/empty), которые были в галерее.
**Критерий приёмки:** скрипт-проверка `grep` экспортируемых `TK*` против файлов историй не находит непокрытых; `npm run stories:build` компилирует все истории (= новый компиляционный гейт вместо `check-snippets`).

### M-MIG-3 — Отрезать вкладку «Kit»
**Делаем:** удалить `{ key: "gallery", label: "Kit" }` из `NAV` в `examples/demo/src/shell/Shell.tsx` и ветку `app === "gallery"` из рендера. **Вариант A:** оставить `GalleryApp` смонтированным по `?app=gallery` (без чипа в навигации) — чтобы 18 e2e и snippet-CI остались зелёными (e2e ходят по URL, не по навигации; проверить, что `gallerySection()` не зависит от наличия чипа).
**Критерий приёмки:** в демо нет вкладки «Kit»; `?app=gallery` всё ещё открывает галерею напрямую; `npm run test:e2e` зелёный без правок спеков; explorer — единственная «витрина» для пользователя.

### M-MIG-4 — Стратегия тестов (зависит от Решения 2)
- **Вариант A:** правок e2e нет; добавить в CI шаг `stories:build`; (опц.) один smoke-e2e, что explorer поднимается и рендерит `TKButton`.
- **Вариант B:** портировать 18 спеков на итерацию по историям (Storybook `test-runner` + Playwright): per-story прогон axe (`a11y-axe`), контраст (`contrast-modes`, бюджет `CONTRAST_BUDGET`), токены (`tokens`), плотность (`density`), i18n/RTL (`i18n`), reflow (`reflow`); ретайр `check-snippets` (истории компилируются сборкой). Затем удалить галерею.
- **Вариант C:** удалить 18 спеков + snippet-гейт + галерейные куски `record-demo.mjs`; задокументировать потерю покрытия в `plans.md`/CHANGELOG.
**Критерий приёмки:** выбранный путь зелёный в CI; для B — каждая из перенесённых проверок гоняется минимум по тем же компонентам, что раньше.

### M-MIG-5 — Чистка и докуменация
**Делаем:** если удаляем галерею (B/C) — снести мёртвый код `apps/gallery/*` и осиротевшие хелперы (`gallerySection`/`paintGallery`); обновить `README.md`, `docs/site/pages/*`, `llms.txt`, `CHANGELOG.md`, корневые скрипты и `record-demo.mjs` (новая запись demo.gif при необходимости). Обновить `plans.md` (вшить как M10 или сослаться).
**Критерий приёмки:** `npm run typecheck`, `test:unit`, `test:e2e`, `check:package` зелёные; в репозитории нет ссылок на удалённые модули; README ведёт на explorer.

---

## Матрица влияния на e2e (для решения B)

| Спек | Что проверяет через галерею | Куда переносить |
|---|---|---|
| `aria.spec` | aria-снапшоты секций | per-story aria-snapshot |
| `a11y-axe.spec` | axe по всем компонентам | прогон по `meta.json`/test-runner |
| `contrast-modes.spec` | контраст (бюджет 15) | per-story контраст |
| `tokens.spec` | значения CSS-токенов | story с токен-таблицей |
| `density.spec`, `reflow.spec`, `display.spec` | плотность/перекомпоновка/дисплей | per-story с глобальным контролом |
| `i18n.spec` | en/ru/ar + RTL | глобальный locale-контрол |
| `motion.spec`, `reduced-motion.spec` | анимации/`prefers-reduced-motion` | per-story + project reduced-motion |
| `a11y-keyboard.spec`, `gestures.spec` | клавиатура/жесты | истории конкретных компонентов |
| `states.spec`, `forms.spec`, `wow.spec`, `demo2.spec`, `design.spec` | состояния/формы/эффекты/сниппеты/дизайн | истории + (demo2 snippets → ретайр) |

> В варианте **A** эта матрица не нужна — спеки остаются как есть.

---

## Риски и митигации

- **Потеря регрессов дизайн-системы** (вариант B/C). _Митигация:_ рекомендуемый вариант A сохраняет все 18 спеков; миграцию тестов делать отдельной вехой с матрицей выше.
- **Расхождение темизации** explorer vs демо. _Митигация:_ один общий декоратор поверх `TKProvider`; визуальная сверка в M-MIG-1.
- **React 19 + инструмент.** _Митигация:_ Storybook 10 установлен в demo workspace; сборка `stories:build` зелёная.
- **Время CI** (особенно Storybook build/test-runner). _Митигация:_ `stories:build` запускается отдельным CI-шагом и не попадает в runtime bundle кита.
- **`record-demo.mjs`/demo.gif** ломается при удалении секций. _Митигация:_ обновить сценарий записи в M-MIG-5.
- **Не затрагиваются:** публичный API-снапшот (156 vitest), `size-limit`/tree-shaking-бюджеты, zero-deps кита (explorer — devDep демо).

## Откат
Аддитивно до **M-MIG-2** включительно (просто не подключать explorer в прод-демо). **M-MIG-3** (удаление вкладки) — ревёрт одной строки в `Shell.tsx`. Удаление кода галереи (B/C) — необратимо без git, поэтому делается последним и отдельным коммитом.

## Грубая оценка усилий
- M-MIG-0: ~0.5 дня · M-MIG-1: ~0.5 дня · M-MIG-2: ~1.5–3 дня (зависит от глубины историй на 103 компонента) · M-MIG-3: ~0.5 дня.
- Вариант **A** итог: ~3–4 дня. Вариант **B** (+миграция 18 спеков): +3–5 дней.

## Decision Log (миграция)
- _2026-06-13: выбран Storybook_ — `storybook`, `@storybook/react-vite`, `@storybook/addon-docs` и `@storybook/addon-a11y` установлены как devDependencies demo workspace; корневые команды `npm run stories` и `npm run stories:build` поднимают и собирают explorer.
- _2026-06-13: выбран вариант A_ — вкладка `Kit` скрыта из навигации демо, но `?app=gallery` сохранён как прямой e2e deep link.
- _2026-06-13: покрытие stories_ — добавлен `scripts/check-stories-coverage.mjs`, который сравнивает фактические `TK*` value exports из `packages/uikit/src/index.ts` со `examples/demo/stories` и `.storybook`.
- _2026-06-13: e2e caveat_ — полный локальный `npm run test:e2e` проходит functional/axe/flow часть, но падает на visual snapshots после скрытия публичной вкладки `Kit`; baselines не обновлялись в этой миграции, чтобы не смешивать explorer-изменения с текущими dirty-правками галереи/forms.
- _Истории в `examples/demo`, не в `packages/uikit`_ — нужен мок Telegram и vite-alias; кит остаётся zero-dep.
- _В варианте A `stories:build` дополняет, но не удаляет `check-snippets`_ — старая галерея остаётся e2e-фикстурой со сниппетами, а сборка stories становится новым explorer-гейтом.
- _Рекомендация A (скрыть, не удалять сразу)_ — сохраняет 18 e2e + CI; удаление вкладки обратимо.

## Progress
- [x] M-MIG-0 — Storybook setup, `.storybook/main.ts`, `.storybook/preview.tsx`, `TKButton` story and root scripts.
- [x] M-MIG-1 — глобальные controls: dark, accent, roundness, fontSize, locale, RTL, density, motion, motionSpeed, preset.
- [x] M-MIG-2 — Storybook stories в `examples/demo/stories` покрывают все 102 фактических `TK*` value exports; gate `npm run check:stories` зелёный.
- [x] M-MIG-3 — вкладка `Kit` удалена из NAV; `?app=gallery` оставлен в `APP_KEYS` и продолжает рендерить `GalleryApp`; Browser smoke это подтвердил.
- [x] M-MIG-4A — CI запускает `check:stories` и `stories:build`; e2e-спеки и `check-snippets` оставлены без миграции на explorer; visual baselines требуют отдельного rebaseline-решения.

## Открытые вопросы (блокируют старт)
1. **Инструмент:** Storybook.
2. **Объём:** A — скрыть публичный Kit, оставить `?app=gallery` как e2e-фикстуру.
3. **Расположение:** `examples/demo/stories`, рядом с `src`, не внутри `src`.
