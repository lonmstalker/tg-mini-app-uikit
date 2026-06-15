import { useRef, useState } from "react";
import {
  TKActionSheet,
  TKAvatarStack,
  TKBadge,
  TKPage,
  TKSkeletonList,
  TKText,
  TKTitle,
  TKVirtualList,
  useLongPress,
  useNav,
  useTKToast,
} from "tg-mini-app-uikit";
import { listPeople, type Person } from "../../data/mockApi";
import { useLang, useT } from "../../i18n";
import { useAsync } from "../discover/useAsync";

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
  index,
  onOpen,
  onLongPress,
}: {
  person: Person;
  index: number;
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
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      {...longPress}
      onPointerDown={(e) => {
        suppress.current = false;
        longPress.onPointerDown(e);
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        height: 88,
        padding: "0 14px",
        cursor: "pointer",
        borderTop: index ? "0.5px solid var(--tk-sep)" : "none",
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
  const { data: people } = useAsync(() => listPeople(lang), [lang]);
  const [actionPerson, setActionPerson] = useState<Person | null>(null);

  if (!people) {
    return (
      <TKPage testId="panel-guide-directory">
        <TKTitle level={1}>{t("guide.title")}</TKTitle>
        <TKSkeletonList rows={5} />
      </TKPage>
    );
  }

  const bookedCount = people.filter((p) => p.bookedSameTrip).length;
  const routeCount = new Set(people.flatMap((p) => p.guides)).size;

  return (
    <TKPage testId="panel-guide-directory">
      <TKTitle level={1}>{t("guide.title")}</TKTitle>
      <div
        data-testid="guide-overview"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: 12,
          borderRadius: "var(--tk-r-lg)",
          background: "var(--tk-surface)",
          border: "0.5px solid var(--tk-sep)",
        }}
      >
        <TKAvatarStack avatars={people.map((p) => ({ initials: p.emoji, tone: `hsl(${p.hue} 50% 80%)` }))} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <TKText as="div" weight={700} truncate>
            {t("guide.directory")}
          </TKText>
          <TKText as="div" tone="secondary" size="footnote" truncate>
            {t("guide.directoryHint", { count: people.length })}
          </TKText>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <GuideStat label={t("guide.onTripCount")} value={bookedCount} />
        <GuideStat label={t("guide.coverageCount")} value={routeCount} />
      </div>

      <div
        style={{
          background: "var(--tk-surface)",
          borderRadius: "var(--tk-r-md)",
          border: "0.5px solid var(--tk-sep)",
          overflow: "hidden",
        }}
      >
        <TKVirtualList
          testId="guide-list"
          items={people}
          itemHeight={88}
          height={people.length * 88}
          renderItem={(person, index) => (
            <GuideRow
              person={person}
              index={index}
              onOpen={() => nav.push("profile", { id: person.id })}
              onLongPress={() => setActionPerson(person)}
            />
          )}
        />
      </div>

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
  );
}
