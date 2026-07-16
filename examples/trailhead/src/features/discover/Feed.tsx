import { useMemo, useReducer, useRef, type ReactNode } from "react";
import {
  TKButton,
  TKCard,
  TKChipGroup,
  TKEmptyState,
  TKInfiniteList,
  TKPage,
  TKPullToRefresh,
  TKSearch,
  TKSheet,
  TKSkeleton,
  TKText,
  TKTitle,
  useNav,
} from "tg-mini-app-uikit";
import { useTKInfiniteData } from "@tg-mini-app/async";
import { useHideKeyboard } from "@tg-mini-app/telegram";
import { listExperiences, type Experience, type ExperienceCategory } from "../../data/mockApi";
import { useLang, useT } from "../../i18n";
import { starsLabel } from "./format";

const CATEGORIES: (ExperienceCategory | "all")[] = ["all", "summit", "forest", "water", "sunrise"];
const DIFFICULTIES = ["easy", "moderate", "hard"] as const;
type FilterOption = { value: string; label: ReactNode };
interface FeedUiState {
  category: number;
  difficulty: string[];
  query: string;
  filtersOpen: boolean;
  searchFocused: boolean;
}
type FeedUiAction =
  | { type: "category"; value: number }
  | { type: "difficulty"; value: string[] }
  | { type: "query"; value: string }
  | { type: "filtersOpen"; value: boolean }
  | { type: "searchFocused"; value: boolean }
  | { type: "reset" };
const initialFeedUi: FeedUiState = {
  category: 0,
  difficulty: [],
  query: "",
  filtersOpen: false,
  searchFocused: false,
};

function feedUiReducer(state: FeedUiState, action: FeedUiAction): FeedUiState {
  switch (action.type) {
    case "category":
      return { ...state, category: action.value };
    case "difficulty":
      return { ...state, difficulty: action.value };
    case "query":
      return { ...state, query: action.value };
    case "filtersOpen":
      return { ...state, filtersOpen: action.value };
    case "searchFocused":
      return { ...state, searchFocused: action.value };
    case "reset":
      return { ...state, category: 0, difficulty: [], query: "" };
  }
}

function ExperienceTile({ exp, onOpen }: { exp: Experience; onOpen: () => void }) {
  const t = useT();
  // The visible content stays outside the full-card button so the row remains a
  // single accessible tap target without nested interactive controls.
  return (
    <div data-trailhead-feed-card="true">
      <TKCard
        padding={10}
        outlined
        // Press feedback: the absolute overlay button is a descendant, so its
        // :active bubbles to this card and the kit's tk-press scales it on tap.
        className="tk-press tk-press-soft"
        style={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: "76px minmax(0, 1fr)",
          gap: "8px 12px",
          alignItems: "center",
        }}
      >
        <button
          type="button"
          data-testid={`feed-card-${exp.id}`}
          aria-label={`${exp.title}, ${starsLabel(t, exp.priceStars)}`}
          onClick={onOpen}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            border: "none",
            background: "transparent",
            borderRadius: "inherit",
            cursor: "pointer",
          }}
        />
        <div
          aria-hidden
          style={{
            width: 76,
            height: 76,
            flexShrink: 0,
            gridRow: "1 / span 2",
            display: "grid",
            placeItems: "center",
            fontSize: 34,
            borderRadius: "var(--tk-r-md)",
            background: `linear-gradient(135deg, hsl(${exp.hue} 55% 62%), hsl(${(exp.hue + 40) % 360} 50% 48%))`,
          }}
        >
          {exp.emoji}
        </div>
        <div style={{ minWidth: 0, display: "flex", alignItems: "flex-start", gap: 8 }}>
          <div style={{ minWidth: 0, flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            <TKText weight={600} truncate>
              {exp.title}
            </TKText>
            <TKText tone="secondary" size="footnote" truncate>
              {exp.location}
            </TKText>
          </div>
          <TKText
            testId={`feed-card-${exp.id}-price`}
            weight={700}
            tone="accent"
            size="sub"
            style={{ whiteSpace: "nowrap", lineHeight: 1.25 }}
          >
            {starsLabel(t, exp.priceStars)}
          </TKText>
        </div>
        <TKText
          testId={`feed-card-${exp.id}-meta`}
          tone="tertiary"
          size="caption"
          weight={600}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            minWidth: 0,
            whiteSpace: "nowrap",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <span aria-hidden style={{ color: "var(--tk-orange)" }}>
            ★
          </span>
          {exp.rating.toFixed(1)} · {exp.ratingCount}
        </TKText>
      </TKCard>
    </div>
  );
}

function FeaturedRecommendation({ onOpen }: { onOpen: () => void }) {
  const t = useT();
  return (
    <TKCard testId="feed-banner" padding="12px 14px" outlined>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ minWidth: 0, flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
          <TKText weight={700} truncate>
            {t("discover.banner.title")}
          </TKText>
          <TKText tone="secondary" size="footnote" truncate>
            {t("discover.banner.text")}
          </TKText>
        </div>
        <TKButton size="sm" pill onClick={onOpen}>
          {t("discover.banner.cta")}
        </TKButton>
      </div>
    </TKCard>
  );
}

function FeedSkeleton({ rows = 4, testId }: { rows?: number; testId?: string }) {
  return (
    <div data-testid={testId} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <TKCard
          key={i}
          padding={10}
          outlined
          testId={i === 0 ? "feed-skeleton-card" : undefined}
          style={{
            display: "grid",
            gridTemplateColumns: "76px minmax(0, 1fr)",
            gap: "8px 12px",
            alignItems: "center",
          }}
        >
          <TKSkeleton width={76} height={76} radius="var(--tk-r-md)" style={{ gridRow: "1 / span 2" }} />
          <div style={{ minWidth: 0, display: "flex", alignItems: "flex-start", gap: 8 }}>
            <div style={{ minWidth: 0, flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              <TKSkeleton width={i % 2 ? "66%" : "78%"} height={15} />
              <TKSkeleton width={i % 2 ? "54%" : "62%"} height={12} />
            </div>
            <TKSkeleton width={70} height={14} />
          </div>
          <TKSkeleton width={92} height={12} />
        </TKCard>
      ))}
    </div>
  );
}

function FilterSheet({
  open,
  onClose,
  category,
  categoryTabs,
  onCategory,
  difficulty,
  difficultyChips,
  onDifficulty,
  activeCount,
  onReset,
}: {
  open: boolean;
  onClose: () => void;
  category: number;
  categoryTabs: FilterOption[];
  onCategory: (index: number) => void;
  difficulty: string[];
  difficultyChips: FilterOption[];
  onDifficulty: (value: string[]) => void;
  activeCount: number;
  onReset: () => void;
}) {
  const t = useT();
  return (
    <TKSheet open={open} onClose={onClose} title={t("discover.filters.title")} testId="feed-filter-sheet">
      <div style={{ display: "flex", flexDirection: "column", gap: 18, paddingBottom: 8 }}>
        <section style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <TKText weight={700}>{t("discover.filters.category")}</TKText>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {categoryTabs.map((item, index) => {
              const selected = index === category;
              return (
                <button
                  key={item.value}
                  type="button"
                  data-testid={`feed-filter-cat-${item.value}`}
                  aria-pressed={selected}
                  onClick={() => onCategory(index)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    minHeight: 42,
                    padding: "0 12px",
                    border: "none",
                    borderRadius: "var(--tk-r-md)",
                    background: selected ? "var(--tk-accent-12)" : "var(--tk-surface-2)",
                    color: selected ? "var(--tk-accent-ink)" : "var(--tk-text)",
                    boxShadow: selected ? "inset 0 0 0 1px var(--tk-accent-35)" : "inset 0 0 0 0.5px var(--tk-sep)",
                    font: "inherit",
                    fontWeight: selected ? 700 : 500,
                    cursor: "pointer",
                  }}
                >
                  <span>{item.label}</span>
                  {selected ? <span aria-hidden>✓</span> : null}
                </button>
              );
            })}
          </div>
        </section>
        <section style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <TKText weight={700}>{t("discover.filters.difficulty")}</TKText>
          <TKChipGroup
            multi
            items={difficultyChips}
            value={difficulty}
            onChange={(value) => onDifficulty(Array.isArray(value) ? value : [value])}
            testId="feed-filter-difficulty"
          />
        </section>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 8 }}>
          <TKButton full variant="plain" disabled={activeCount === 0} onClick={onReset} testId="feed-filter-reset-sheet">
            {t("discover.filters.reset")}
          </TKButton>
          <TKButton full onClick={onClose} testId="feed-filter-apply">
            {t("discover.filters.apply")}
          </TKButton>
        </div>
      </div>
    </TKSheet>
  );
}

export function Feed() {
  const t = useT();
  const nav = useNav();
  const { lang } = useLang();
  // The pagination FSM is now the kit's @tg-mini-app/async; lang lives in the
  // fetcher (and its deps), keeping the engine i18n-free.
  const feed = useTKInfiniteData<Experience>((cursor) => listExperiences(lang, cursor), [lang], {
    getKey: (e) => e.id,
  });
  const [ui, dispatchUi] = useReducer(feedUiReducer, initialFeedUi);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const keyboard = useHideKeyboard();
  const { category, difficulty, query, filtersOpen, searchFocused } = ui;

  const open = (id: string) => nav.push("detail", { id });

  const filtered = useMemo(() => {
    const cat = CATEGORIES[category];
    const q = query.trim().toLowerCase();
    return feed.items.filter(
      (e) =>
        (cat === "all" || e.category === cat) &&
        (difficulty.length === 0 || difficulty.includes(e.difficulty)) &&
        (q === "" || `${e.title} ${e.location} ${e.summary}`.toLowerCase().includes(q)),
    );
  }, [feed.items, category, difficulty, query]);

  const categoryTabs = CATEGORIES.map((c) => ({ value: c, label: t(`discover.cat.${c}` as const) }));
  const difficultyChips = DIFFICULTIES.map((d) => ({ value: d, label: t(`discover.chip.${d}` as const) }));
  const filtersActive = category !== 0 || difficulty.length > 0 || query.trim() !== "";
  const filterCount = (category === 0 ? 0 : 1) + difficulty.length;
  const searchActive = searchFocused || query.trim().length > 0;
  const filterLabel = filterCount ? t("discover.filters.active", { count: filterCount }) : t("discover.filters.cta");
  const filterButtonWidth = searchActive ? 44 : filterCount ? 136 : 116;
  const resetFilters = () => dispatchUi({ type: "reset" });

  let content: ReactNode;
  if (feed.phase === "first-loading") {
    content = <FeedSkeleton rows={5} testId="feed-skeleton" />;
  } else if (feed.phase === "first-error") {
    content = (
      <TKEmptyState
        testId="feed-error"
        icon="warning"
        tone="red"
        title={t("discover.error.title")}
        text={t("discover.error.text")}
        cta={t("discover.error.retry")}
        onCta={() => void feed.retry()}
      />
    );
  } else if (filtered.length === 0) {
    content = (
      <TKEmptyState
        testId="feed-empty"
        icon="search"
        title={t("discover.empty.title")}
        text={t("discover.empty.text")}
        cta={filtersActive ? t("discover.empty.cta") : undefined}
        onCta={filtersActive ? resetFilters : undefined}
      />
    );
  } else {
    content = (
      <>
        <TKInfiniteList
          testId="feed-list"
          onLoadMore={() => void feed.loadMore()}
          // Stop feeding the auto-loading sentinel while a page errored, so the
          // next fetch only happens on an explicit retry (never in a loop).
          hasMore={feed.hasMore && feed.phase !== "page-error"}
          loading={feed.loading}
          loader={<FeedSkeleton rows={2} />}
          style={{ display: "flex", flexDirection: "column", gap: 10 }}
        >
          {filtered.map((exp) => (
            <ExperienceTile key={exp.id} exp={exp} onOpen={() => open(exp.id)} />
          ))}
        </TKInfiniteList>
        {feed.phase === "page-error" ? (
          <div
            data-testid="feed-page-error"
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "8px 0 4px" }}
          >
            <TKText tone="secondary" size="footnote" style={{ textAlign: "center" }}>
              {t("discover.error.text")}
            </TKText>
            <TKButton size="sm" variant="tonal" onClick={() => void feed.retryPage()} testId="feed-page-retry">
              {t("discover.error.retry")}
            </TKButton>
          </div>
        ) : null}
      </>
    );
  }

  return (
    <TKPullToRefresh onRefresh={feed.retry} testId="discover-refresh">
      <TKPage testId="panel-discover-feed" gap={10}>
        <TKTitle level={1}>{t("discover.feedTitle")}</TKTitle>
        <FeaturedRecommendation onOpen={() => open("sunrise-ridge")} />
      <div
        data-testid="feed-search-toolbar"
        data-search-active={searchActive}
        style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 40, width: "100%" }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <TKSearch
            ref={searchInputRef}
            placeholder={t("discover.searchPlaceholder")}
            value={query}
            onChange={(value) => dispatchUi({ type: "query", value })}
            onFocusChange={(value) => dispatchUi({ type: "searchFocused", value })}
            showCancelAction={false}
            testId="feed-search"
          />
        </div>
        <TKButton
          size="sm"
          pill
          icon="filter"
          aria-label={filterLabel}
          variant={filterCount ? "tonal" : "surface"}
          onClick={() => {
            searchInputRef.current?.blur();
            keyboard.hide(); // native soft-keyboard dismissal (Bot API 9.1); the blur covers browsers
            dispatchUi({ type: "searchFocused", value: false });
            dispatchUi({ type: "filtersOpen", value: true });
          }}
          testId="feed-filter-open"
          style={{
            position: "relative",
            width: filterButtonWidth,
            minWidth: 44,
            flexShrink: 0,
            overflow: "hidden",
            gap: searchActive ? 0 : 8,
            padding: searchActive ? 0 : "0 12px",
            transition:
              "width var(--tk-t3) var(--tk-ease), padding var(--tk-t3) var(--tk-ease), gap var(--tk-t3) var(--tk-ease)",
          }}
        >
          <span
            data-testid="feed-filter-label"
            data-collapsed={searchActive}
            style={{
              display: "inline-block",
              maxWidth: searchActive ? 0 : 96,
              opacity: searchActive ? 0 : 1,
              overflow: "hidden",
              whiteSpace: "nowrap",
              transform: searchActive ? "translateX(8px)" : "translateX(0)",
              transition:
                "max-width var(--tk-t3) var(--tk-ease), opacity var(--tk-t2) var(--tk-ease), transform var(--tk-t3) var(--tk-ease)",
            }}
          >
            {filterLabel}
          </span>
          {filterCount && searchActive ? (
            <span
              aria-hidden
              data-testid="feed-filter-count"
              style={{
                position: "absolute",
                top: 1,
                right: 1,
                minWidth: 16,
                height: 16,
                padding: "0 4px",
                borderRadius: "var(--tk-r-pill)",
                background: "var(--tk-accent)",
                color: "var(--tk-on-accent)",
                fontSize: 12,
                lineHeight: "16px",
                fontWeight: 800,
              }}
            >
              {filterCount}
            </span>
          ) : null}
        </TKButton>
      </div>
      {content}
      <FilterSheet
        open={filtersOpen}
        onClose={() => dispatchUi({ type: "filtersOpen", value: false })}
        category={category}
        categoryTabs={categoryTabs}
        onCategory={(value) => dispatchUi({ type: "category", value })}
        difficulty={difficulty}
        difficultyChips={difficultyChips}
        onDifficulty={(value) => dispatchUi({ type: "difficulty", value })}
        activeCount={filterCount}
        onReset={resetFilters}
      />
      </TKPage>
    </TKPullToRefresh>
  );
}
