import { useRef, useState } from "react";
import {
  AsyncBoundary,
  TKActionSheet,
  TKAvatarStack,
  TKBadge,
  TKCard,
  TKPage,
  TKPullToRefresh,
  TKText,
  TKTitle,
  TKVirtualList,
  useLongPress,
  useNav,
  useTKToast,
} from "tg-mini-app-uikit";
import { listPeople, type Person } from "../../data/mockApi";
import { useLang, useT } from "../../i18n";
import { useAsync } from "@tg-mini-app/async";

function GuideStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        padding: "9px 10px",
        borderRadius: "var(--tk-r-sm)",
        background: "var(--tk-surface-2)",
      }}
    >
      <TKText as="div" weight={700}>
        {value}
      </TKText>
      <TKText as="div" tone="secondary" size="caption" truncate>
        {label}
      </TKText>
    </div>
  );
}

function GuideRow({
  person,
  onOpen,
  onLongPress,
}: {
  person: Person;
  onOpen: () => void;
  onLongPress: () => void;
}) {
  const t = useT();
  // The kit's long-press doesn't suppress the synthetic click that follows a
  // touch hold, so guard the row's click: a fired long-press skips navigation.
  const suppress = useRef(false);
  const longPress = useLongPress(() => {
    suppress.current = true;
    onLongPress();
  });
  return (
    <div
      role="button"
      tabIndex={0}
      data-testid={`guide-row-${person.id}`}
      onClick={() => {
        if (suppress.current) return;
        onOpen();
      }}
      {...longPress}
      onPointerDown={(e) => {
        suppress.current = false;
        longPress.onPointerDown(e);
      }}
      // Compose with the kit's handler: it owns the ContextMenu-key long-press
      // trigger, the row owns Enter/Space activation.
      onKeyDown={(e) => {
        longPress.onKeyDown(e);
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className="tk-press tk-press-soft"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        height: 88,
        padding: "0 14px",
        cursor: "pointer",
        // Standalone card matching the discover/trips cards: same radius, shadow
        // and hairline — so the directory reads as the same list pattern.
        background: "var(--tk-surface)",
        borderRadius: "var(--tk-r-lg)",
        boxShadow: "var(--tk-shadow-sm)",
        border: ".5px solid var(--tk-sep)",
      }}
    >
      <div
        aria-hidden
        style={{
          width: 46,
          height: 46,
          flexShrink: 0,
          display: "grid",
          placeItems: "center",
          fontSize: 24,
          borderRadius: "var(--tk-r-pill)",
          background: `hsl(${person.hue} 50% 88%)`,
        }}
      >
        {person.emoji}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <TKText as="div" weight={600} truncate>
          {person.name}
        </TKText>
        <TKText as="div" tone="secondary" size="footnote" truncate>
          {person.role}
        </TKText>
        <TKText as="div" tone="tertiary" size="caption" truncate>
          {person.bio}
        </TKText>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5, flexShrink: 0 }}>
        {person.bookedSameTrip ? (
          <TKBadge tone="green" soft>
            {t("guide.bookedSame")}
          </TKBadge>
        ) : null}
        {person.guides.length ? (
          <TKBadge tone="gray" soft>
            {t("guide.routesCount", { count: person.guides.length })}
          </TKBadge>
        ) : null}
      </div>
    </div>
  );
}

export function GuideDirectory() {
  const t = useT();
  const { lang } = useLang();
  const nav = useNav();
  const toast = useTKToast();
  const { data: people, loading, error, reload } = useAsync(() => listPeople(lang), [lang]);
  const [actionPerson, setActionPerson] = useState<Person | null>(null);

  const bookedCount = (people ?? []).filter((p) => p.bookedSameTrip).length;
  const routeCount = new Set((people ?? []).flatMap((p) => p.guides)).size;

  return (
    <TKPullToRefresh onRefresh={reload} testId="guide-refresh">
    <TKPage testId="panel-guide-directory">
      <TKTitle level={1}>{t("guide.title")}</TKTitle>
      <AsyncBoundary
        loading={loading}
        error={error}
        onRetry={reload}
        errorTitle={t("discover.error.title")}
        errorText={t("discover.error.text")}
        retryLabel={t("discover.error.retry")}
      >
        {people ? (
          <>
      <TKCard testId="guide-overview" outlined padding={12} style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <TKAvatarStack avatars={people.map((p) => ({ initials: p.emoji, tone: `hsl(${p.hue} 50% 80%)` }))} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <TKText as="div" weight={700} truncate>
            {t("guide.directory")}
          </TKText>
          <TKText as="div" tone="secondary" size="footnote" truncate>
            {t("guide.directoryHint", { count: people.length })}
          </TKText>
        </div>
      </TKCard>
      <div style={{ display: "flex", gap: 8 }}>
        <GuideStat label={t("guide.onTripCount")} value={bookedCount} />
        <GuideStat label={t("guide.coverageCount")} value={routeCount} />
      </div>

      <TKVirtualList
        testId="guide-list"
        items={people}
        // Row is 88; the extra 10 is the inter-card gap, matching discover/trips.
        itemHeight={98}
        height={people.length * 98}
        renderItem={(person) => (
          <GuideRow
            person={person}
            onOpen={() => nav.push("profile", { id: person.id })}
            onLongPress={() => setActionPerson(person)}
          />
        )}
      />
          </>
        ) : null}
      </AsyncBoundary>

      <TKActionSheet
        open={!!actionPerson}
        onClose={() => setActionPerson(null)}
        ariaLabel={t("guide.actions")}
        testId="guide-actions"
        items={[
          {
            icon: "chat",
            label: t("guide.action.message"),
            onSelect: () => {
              const p = actionPerson;
              setActionPerson(null);
              if (p) nav.push("thread", { id: p.id });
            },
          },
          {
            icon: "share",
            label: t("guide.action.share"),
            onSelect: () => {
              setActionPerson(null);
              toast.show({ text: t("guide.shared"), icon: "share" });
            },
          },
          {
            icon: "mute",
            label: t("guide.action.mute"),
            onSelect: () => {
              const name = actionPerson?.name ?? "";
              setActionPerson(null);
              toast.show({ text: t("guide.muted", { name: String(name) }), icon: "mute" });
            },
          },
        ]}
      />
    </TKPage>
    </TKPullToRefresh>
  );
}
