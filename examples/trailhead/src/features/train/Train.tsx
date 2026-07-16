import { useEffect, useMemo, useState } from "react";
import {
  TKBadge,
  TKButton,
  TKCell,
  TKLeaderboard,
  TKListGroup,
  TKPage,
  TKProgress,
  TKPullToRefresh,
  TKRing,
  TKSkeletonList,
  TKStatTile,
  TKText,
  TKTitle,
  TKXPHeader,
  useNav,
} from "tg-mini-app-uikit";
import { useActivity, useInitData, useMotionSensors } from "@tg-mini-app/telegram";
import { listPeople, listSessions, type TrainingSession } from "../../data/mockApi";
import { useLang, useT } from "../../i18n";
import { useAppState } from "../../store";
import { useAsync } from "@tg-mini-app/async";

const initialsOf = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const CARDINALS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

/*
 * Trail compass: DeviceOrientation → heading. Telegram mutates the sensor
 * object in place (no per-reading events), so a small poll IS the render loop.
 * The sensor and the poll both pause while the app is backgrounded
 * (useActivity) and stop on unmount via the hook's own cleanup.
 */
function CompassCard() {
  const t = useT();
  const { deviceOrientation } = useMotionSensors();
  const activity = useActivity();
  const [on, setOn] = useState(false);
  const [heading, setHeading] = useState<number | null>(null);

  useEffect(() => {
    if (!on || !activity.isActive) return;
    void deviceOrientation.start(250, { needAbsolute: true });
    const id = window.setInterval(() => {
      const alpha = deviceOrientation.sensor?.alpha;
      // alpha is radians CCW; a compass heading is degrees CW from north.
      if (alpha != null) setHeading((360 - (alpha * 180) / Math.PI + 360) % 360);
    }, 250);
    return () => {
      window.clearInterval(id);
      void deviceOrientation.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on, activity.isActive]);

  if (!deviceOrientation.isSupported) return null;
  return (
    <TKListGroup title={t("train.compass")}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: 16 }} data-testid="train-compass">
        <TKText weight={700} style={{ fontSize: 26, fontVariantNumeric: "tabular-nums", minWidth: 92 }}>
          {on && heading != null ? `${Math.round(heading)}° ${CARDINALS[Math.round(heading / 45) % 8]}` : "—"}
        </TKText>
        <TKText as="div" tone="secondary" size="footnote" style={{ flex: 1 }}>
          {t("train.compassHint")}
        </TKText>
        <TKButton
          size="sm"
          pill
          variant={on ? "tonal" : "surface"}
          onClick={() => setOn((v) => !v)}
          testId="train-compass-toggle"
        >
          {on ? t("train.compassStop") : t("train.compassStart")}
        </TKButton>
      </div>
    </TKListGroup>
  );
}

export function Train() {
  const t = useT();
  const { lang } = useLang();
  const nav = useNav();
  const { user } = useInitData();
  const { streak } = useAppState();
  const userName = user?.first_name ?? t("train.you");

  const sessions = useAsync(() => listSessions(lang), [lang]);
  const people = useAsync(() => listPeople(lang), [lang]);

  const level = Math.floor(streak.xp / 1000) + 1;
  const xpInLevel = streak.xp % 1000;

  const byWeek = useMemo(() => {
    const groups = new Map<string, TrainingSession[]>();
    for (const s of sessions.data ?? []) {
      if (!groups.has(s.week)) groups.set(s.week, []);
      groups.get(s.week)!.push(s);
    }
    return [...groups.entries()];
  }, [sessions.data]);

  const done = (sessions.data ?? []).filter((s) => s.done);
  const totalKm = done.reduce((sum, s) => sum + s.distanceKm, 0);
  const totalMin = done.reduce((sum, s) => sum + s.durationMin, 0);
  const goalPct = sessions.data?.length ? Math.round((done.length / sessions.data.length) * 100) : 0;

  const leaderboard = useMemo(() => {
    const friends = (people.data ?? []).filter((p) => p.bookedSameTrip);
    const rows = [
      // Points come from each persona's own XP (data), not their position in the
      // list. Ties break by name so the order is stable across renders.
      ...friends.map((p) => ({ name: p.name, points: p.xp, you: false })),
      { name: userName, points: streak.xp, you: true },
    ]
      .sort((a, b) => b.points - a.points || String(a.name).localeCompare(String(b.name)))
      .map((r, i) => ({
        rank: i + 1,
        initials: initialsOf(String(r.name)),
        name: r.name,
        points: `${r.points}`,
        you: r.you,
      }));
    return rows;
  }, [people.data, streak.xp, userName]);

  return (
    <TKPullToRefresh
      onRefresh={() => Promise.all([sessions.reload(), people.reload()])}
      testId="train-refresh"
    >
    <TKPage testId="panel-train-home">
      <TKTitle level={1}>{t("train.title")}</TKTitle>

      <TKXPHeader
        name={userName}
        initials={initialsOf(userName)}
        level={level}
        xp={Math.round(xpInLevel / 10)}
        hint={t("train.xpHint", { xp: 1000 - xpInLevel })}
        testId="train-xp"
      />

      {/* Streak ring */}
      <TKListGroup title={t("train.streakTitle")}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, padding: 16 }}>
          <TKRing value={streak.dayOfWeek / 7} size={92} label={t("train.streakRing", { day: streak.dayOfWeek })} testId="train-ring">
            <TKText weight={700} style={{ fontSize: 20 }}>
              {streak.dayOfWeek}/7
            </TKText>
          </TKRing>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <TKText as="div" weight={600}>
              {t("train.streakRing", { day: streak.dayOfWeek })}
            </TKText>
            <TKText as="div" tone="secondary" size="footnote">
              {t("train.streakHint")}
            </TKText>
          </div>
        </div>
      </TKListGroup>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <TKStatTile label={t("train.stat.sessions")} value={`${done.length}/${sessions.data?.length ?? 0}`} bars={[2, 3, 1, 4, 3]} up testId="stat-sessions" />
        <TKStatTile label={t("train.stat.distance")} value={t("unit.km", { count: totalKm })} bars={[1, 2, 2, 3, 4]} up />
        <TKStatTile label={t("train.stat.minutes")} value={`${totalMin}`} bars={[3, 2, 4, 3, 5]} up />
        <TKStatTile label={t("train.streakTitle")} value={`${streak.dayOfWeek}`} bars={[1, 1, 2, 3, 5]} up />
      </div>

      <CompassCard />

      <TKListGroup title={t("train.weeklyGoal")}>
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          <TKProgress value={goalPct} label={t("train.weeklyGoal")} testId="train-goal" />
          <TKText tone="secondary" size="footnote">
            {goalPct}%
          </TKText>
        </div>
      </TKListGroup>

      <TKTitle level={3}>{t("train.leaderboard")}</TKTitle>
      <TKLeaderboard rows={leaderboard} youLabel={t("train.you")} testId="train-leaderboard" />

      {/* Sessions grouped by week */}
      {sessions.loading ? (
        <TKSkeletonList rows={4} />
      ) : (
        byWeek.map(([week, items]) => (
          <TKListGroup key={week} title={week}>
            {items.map((s) => (
              <TKCell
                key={s.id}
                testId={`session-${s.id}`}
                icon={s.done ? "check" : "bolt"}
                iconBg={s.done ? "var(--tk-green)" : "var(--tk-accent)"}
                title={s.title}
                subtitle={`${s.dayLabel} · ${t("unit.km", { count: s.distanceKm })}`}
                value={
                  <TKBadge tone={s.done ? "green" : "accent"} soft>
                    {s.done ? t("session.done") : t("session.upcoming")}
                  </TKBadge>
                }
                chevron
                onClick={() => nav.push("session", { id: s.id })}
              />
            ))}
          </TKListGroup>
        ))
      )}
    </TKPage>
    </TKPullToRefresh>
  );
}
