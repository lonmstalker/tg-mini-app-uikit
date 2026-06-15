import { AsyncBoundary, TKAccordion, TKBadge, TKPage, TKSteps, TKText, TKTitle, useNav } from "tg-mini-app-uikit";
import { listSessions } from "../../data/mockApi";
import { useLang, useT } from "../../i18n";
import { useMockBackHeader } from "../../components/MockBackHeader";
import { useAsync } from "@tg-mini-app/async";

export function SessionDetail() {
  const t = useT();
  const { lang } = useLang();
  const nav = useNav();
  const id = (nav.params as { id?: string } | undefined)?.id ?? "";
  const sessions = useAsync(() => listSessions(lang), [lang]);
  const session = sessions.data?.find((s) => s.id === id);
  const header = useMockBackHeader(session?.title ?? t("train.sessions"));

  return (
    <TKPage testId="panel-train-session" header={header}>
      <AsyncBoundary
        loading={sessions.loading}
        error={sessions.error}
        empty={!sessions.loading && !sessions.error && !session}
        onRetry={sessions.reload}
        errorTitle={t("discover.error.title")}
        errorText={t("discover.error.text")}
        retryLabel={t("discover.error.retry")}
        emptyIcon="bolt"
        emptyTitle={t("train.sessions")}
        emptyText={t("session.upcoming")}
      >
        {session ? (
          <>
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
          </>
        ) : null}
      </AsyncBoundary>
    </TKPage>
  );
}
