import { TKBlockquote, TKEmptyState, TKPage, TKSkeletonList, TKText, TKTitle, useNav } from "tg-mini-app-uikit";
import { experienceById, getPerson } from "../../data/mockApi";
import { useLang, useT } from "../../i18n";
import { useMockBackHeader } from "../../components/MockBackHeader";
import { PrimaryAction } from "../../components/PrimaryAction";
import { useAsync } from "../discover/useAsync";

export function GuideProfile({ active }: { active: boolean }) {
  const t = useT();
  const { lang } = useLang();
  const nav = useNav();
  const id = (nav.params as { id?: string } | undefined)?.id ?? "";
  const person = useAsync(() => getPerson(lang, id), [lang, id]);
  const header = useMockBackHeader(person.data?.name);

  if (person.loading) {
    return (
      <TKPage testId="panel-guide-profile" header={header}>
        <TKSkeletonList rows={4} />
      </TKPage>
    );
  }
  if (person.error || !person.data) {
    return (
      <TKPage testId="panel-guide-profile" header={header}>
        <TKEmptyState icon="user" title={t("guide.title")} />
      </TKPage>
    );
  }

  const p = person.data;
  const routes = p.guides.map((routeId) => experienceById(lang, routeId)).filter((route) => route !== undefined);
  return (
    <TKPage
      testId="panel-guide-profile"
      header={header}
      footer={
        <PrimaryAction
          active={active}
          testId="guide-message"
          label={t("guide.action.message")}
          onClick={() => nav.push("thread", { id: p.id })}
        />
      }
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, paddingTop: 8 }}>
        <div
          aria-hidden
          style={{
            width: 96,
            height: 96,
            display: "grid",
            placeItems: "center",
            fontSize: 44,
            borderRadius: "var(--tk-r-pill)",
            background: `hsl(${p.hue} 50% 88%)`,
          }}
        >
          {p.emoji}
        </div>
        <TKTitle level={2}>{p.name}</TKTitle>
        <TKText tone="secondary">{p.role}</TKText>
      </div>
      <TKBlockquote author={p.name}>{p.bio}</TKBlockquote>
      {routes.length ? (
        <div
          data-testid="guide-routes"
          style={{
            background: "var(--tk-surface)",
            borderRadius: "var(--tk-r-md)",
            border: "0.5px solid var(--tk-sep)",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "11px 14px", borderBottom: "0.5px solid var(--tk-sep)" }}>
            <TKText as="div" weight={700}>
              {t("guide.routeSection")}
            </TKText>
          </div>
          {routes.map((route, index) => (
            <div
              key={route.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "11px 14px",
                borderTop: index ? "0.5px solid var(--tk-sep)" : "none",
              }}
            >
              <div
                aria-hidden
                style={{
                  width: 34,
                  height: 34,
                  flexShrink: 0,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "var(--tk-r-xs)",
                  background: `hsl(${route.hue} 54% 88%)`,
                }}
              >
                {route.emoji}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <TKText as="div" weight={600} truncate>
                  {route.title}
                </TKText>
                <TKText as="div" tone="secondary" size="caption" truncate>
                  {route.location}
                </TKText>
              </div>
              <TKText tone="tertiary" size="caption" weight={600} style={{ whiteSpace: "nowrap" }}>
                {route.distanceKm.toFixed(1)} km
              </TKText>
            </div>
          ))}
        </div>
      ) : null}
    </TKPage>
  );
}
