import { TKAccordion, TKBadge, TKEmptyState, TKPage, TKSkeletonList, TKSteps, TKText, TKTitle, useNav } from "tg-mini-app-uikit";
import { listSessions } from "../../data/mockApi";
import { useLang, useT } from "../../i18n";
import { useMockBackHeader } from "../../components/MockBackHeader";
import { useAsync } from "../discover/useAsync";

export function SessionDetail() {
  const t = useT();
  const { lang } = useLang();
  const nav = useNav();
  const id = (nav.params as { id?: string } | undefined)?.id ?? "";
  const sessions = useAsync(() => listSessions(lang), [lang]);
  const session = sessions.data?.find((s) => s.id === id);
  const header = useMockBackHeader(session?.title ?? t("train.sessions"));

  if (sessions.loading) {
    return (
      <TKPage testId="panel-train-session" header={header}>
        <TKSkeletonList rows={5} />
      </TKPage>
    );
  }

  if (!session) {
    return (
      <TKPage testId="panel-train-session" header={header}>
        <TKEmptyState icon="bolt" title={t("train.sessions")} text={t("session.upcoming")} />
      </TKPage>
    );
  }

  return (
    <TKPage testId="panel-train-session" header={header}>
      <TKTitle level={2}>{session.title}</TKTitle>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <TKBadge tone={session.done ? "green" : "accent"} soft>
          {session.done ? t("session.done") : t("session.upcoming")}
        </TKBadge>
        <TKText tone="secondary" size="footnote">
          {session.dayLabel} · {t("unit.min", { count: session.durationMin })}
        </TKText>
      </div>

      <TKTitle level={3}>{t("session.planTitle")}</TKTitle>
      <TKSteps testId="session-steps" steps={session.steps} current={session.done ? session.steps.length : 1} />

      <TKAccordion
        testId="session-details"
        items={[
          {
            id: "focus",
            title: t("session.focus"),
            content: <TKText tone="secondary">{session.focus}</TKText>,
          },
          {
            id: "stats",
            title: t("session.detailsTitle"),
            content: (
              <TKText tone="secondary">
                {t("unit.km", { count: session.distanceKm })} · {t("unit.min", { count: session.durationMin })}
              </TKText>
            ),
          },
        ]}
      />
    </TKPage>
  );
}
