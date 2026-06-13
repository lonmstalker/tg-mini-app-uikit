import { useEffect, useState } from "react";
import {
  TKActionSheet,
  TKBars,
  TKButton,
  TKConfetti,
  TKIconButton,
  TKLeaderboard,
  TKMainButton,
  TKStatTile,
  TKToastProvider,
  TKXPHeader,
  useCloudStorage,
  useTKToast,
} from "tg-mini-app-uikit";
import { bootToday, demoDelay } from "../../shell/boot";

/* Game — gamified mini-app example: XP, stats, leaderboard, daily reward. */

const DAILY_KEY = "game-daily";
const PROGRESS_KEY = "game-progress";
const REWARD_COINS = 50;
const REWARD_XP = 8;

interface GameProgress {
  xp: number;
  level: number;
  coins: number;
  streak: number;
}

const DEFAULT_PROGRESS: GameProgress = { xp: 64, level: 12, coins: 2140, streak: 6 };

/** "Now" that respects the `?today=` stub from boot.ts (M8.6). */
const nowTs = () => bootToday().getTime();

const sameDay = (a: number, b: number) => new Date(a).toDateString() === new Date(b).toDateString();

/** HH:MM left until the start of the next calendar day. */
function untilNextClaim(now: number): string {
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  const left = Math.max(0, next.getTime() - now);
  const hh = Math.floor(left / 3_600_000);
  const mm = Math.floor((left % 3_600_000) / 60_000);
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

function parseProgress(raw: string | null): GameProgress | null {
  if (!raw) return null;
  try {
    const p = JSON.parse(raw) as Partial<GameProgress>;
    if (
      typeof p.xp === "number" &&
      typeof p.level === "number" &&
      typeof p.coins === "number" &&
      typeof p.streak === "number"
    ) {
      return { xp: p.xp, level: p.level, coins: p.coins, streak: p.streak };
    }
  } catch {
    /* corrupt value — ignore */
  }
  return null;
}

export function GameApp() {
  return (
    <TKToastProvider offset={96}>
      <div data-demo-app="game" style={{ height: "100%" }}>
        <GameInner />
      </div>
    </TKToastProvider>
  );
}

function GameInner() {
  const toast = useTKToast();
  const cloud = useCloudStorage();
  const [coins, setCoins] = useState(DEFAULT_PROGRESS.coins);
  const [xp, setXp] = useState(DEFAULT_PROGRESS.xp);
  const [level, setLevel] = useState(DEFAULT_PROGRESS.level);
  const [streak, setStreak] = useState(DEFAULT_PROGRESS.streak);
  const [claimedAt, setClaimedAt] = useState<number | null>(null);
  const [confetti, setConfetti] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [now, setNow] = useState(nowTs);
  const [activity, setActivity] = useState([42, 70, 55, 90, 62, 100, 78]);

  /* Restore persisted progress + last claim; degrade to in-memory if storage fails. */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const values = await cloud.getMany([DAILY_KEY, PROGRESS_KEY]);
        if (cancelled) return;
        const claimed = Number(values[DAILY_KEY]);
        if (Number.isFinite(claimed) && claimed > 0) setClaimedAt(claimed);
        const progress = parseProgress(values[PROGRESS_KEY]);
        if (progress) {
          setXp(progress.xp);
          setLevel(progress.level);
          setCoins(progress.coins);
          setStreak(progress.streak);
        }
      } catch {
        /* cloud storage unavailable — keep in-memory state */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cloud]);

  /* Tick the claim countdown once a minute. */
  useEffect(() => {
    const timer = window.setInterval(() => setNow(nowTs()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const claimedToday = claimedAt !== null && sameDay(claimedAt, now);

  const persist = (claimTs: number | null, progress: GameProgress) => {
    const writes = [
      claimTs === null ? cloud.remove(DAILY_KEY) : cloud.set(DAILY_KEY, String(claimTs)),
      cloud.set(PROGRESS_KEY, JSON.stringify(progress)),
    ];
    for (const write of writes) write.catch(() => {});
  };

  const claim = async () => {
    await demoDelay(1000);
    const ts = nowTs();
    const nextCoins = coins + REWARD_COINS;
    const nextStreak = streak + 1;
    let nextXp = xp + REWARD_XP;
    let nextLevel = level;
    const leveledUp = nextXp >= 100;
    if (leveledUp) {
      nextXp -= 100; // the bar wraps and re-animates from the start
      nextLevel += 1;
      setConfetti(true);
    }
    setCoins(nextCoins);
    setXp(nextXp);
    setLevel(nextLevel);
    setStreak(nextStreak);
    setClaimedAt(ts);
    setNow(ts);
    persist(ts, { xp: nextXp, level: nextLevel, coins: nextCoins, streak: nextStreak });
    toast.show(
      leveledUp
        ? { icon: "star", color: "var(--tk-accent)", text: `Level up! You reached level ${nextLevel}` }
        : { icon: "gift", color: "var(--tk-orange)", text: `+${REWARD_COINS} coins · streak extended!` },
    );
  };

  const resetProgress = () => {
    setCoins(0);
    setXp(0);
    setLevel(1);
    setStreak(0);
    setClaimedAt(null);
    persist(null, { xp: 0, level: 1, coins: 0, streak: 0 });
    toast.error("Progress reset");
  };

  return (
    <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column" }}>
      {confetti ? <TKConfetti testId="demo-game-confetti" onDone={() => setConfetti(false)} /> : null}

      <div style={{ padding: "64px 16px 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "var(--tk-fz-title1)", fontWeight: 700, letterSpacing: "-.02em" }}>Arena</span>
        <TKIconButton icon="tune" variant="tonal" size={36} label="Options" onClick={() => setMenuOpen(true)} />
      </div>

      <div style={{ flex: 1, overflow: "auto" }}>
        <div style={{ padding: "4px 16px 12px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div data-demo-level={level}>
          <TKXPHeader
            name="Anna K."
            initials="AK"
            level={level}
            xp={xp}
            hint={`${xp * 10} / 1000 XP to level ${level + 1}`}
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <TKStatTile label="Coins" value={coins.toLocaleString("en-US")} delta={claimedToday ? `+${REWARD_COINS}` : "+320"} bars={[4, 6, 5, 9, 8, 11, 13]} />
          <TKStatTile label="Streak" value={`${streak} days`} delta="+1" bars={[7, 7, 8, 8, 9, 10, 11]} />
        </div>

        <div>
          <SectionLabel>Weekly activity</SectionLabel>
          <div style={{ background: "var(--tk-surface)", borderRadius: "var(--tk-r-lg)", boxShadow: "var(--tk-shadow-sm)", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            <TKBars data={activity} labels={["M", "T", "W", "T", "F", "S", "S"]} />
            <TKButton
              size="sm"
              variant="tonal"
              pill
              onClick={() => setActivity(activity.map(() => 25 + Math.round(Math.random() * 75)))}
            >
              Shuffle data
            </TKButton>
          </div>
        </div>

        <div>
          <SectionLabel>Weekly leaderboard</SectionLabel>
          <TKLeaderboard
            rows={[
              { rank: 1, initials: "NM", name: "NeonMantis", points: "12,480", tone: "linear-gradient(135deg,#f7c948,#e8a623)" },
              { rank: 2, initials: "VX", name: "Vexa", points: "11,905", tone: "linear-gradient(135deg,#b8c4cf,#8a99a8)" },
              { rank: 3, initials: "OR", name: "Orbit_77", points: "11,210", tone: "linear-gradient(135deg,#e0925c,#c47135)" },
              { rank: 12, initials: "AK", name: "Anna K.", points: (7340 + (claimedToday ? REWARD_COINS : 0)).toLocaleString("en-US"), you: true },
            ]}
          />
        </div>
        </div>
      </div>

      <div style={{ padding: "8px 16px 30px" }}>
        {claimedToday ? (
          <TKButton full size="lg" variant="tonal" disabled data-demo-daily-claim="">
            {`Claimed · next reward in ${untilNextClaim(now)}`}
          </TKButton>
        ) : (
          <div data-demo-daily-claim="">
            <TKMainButton label={`Claim daily reward · +${REWARD_COINS}`} successLabel="Claimed" onClick={claim} />
          </div>
        )}
      </div>

      <TKActionSheet
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={[
          { icon: "share", label: "Share profile", onSelect: () => toast.success("Link copied") },
          { icon: "gift", label: "Invite friends · +200", onSelect: () => toast.success("Invite sent") },
          {
            icon: "trash",
            label: "Reset progress",
            danger: true,
            onSelect: resetProgress,
          },
        ]}
      />
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: "var(--tk-fz-caption)",
        fontWeight: 600,
        letterSpacing: ".05em",
        textTransform: "uppercase",
        color: "var(--tk-text-2)",
        margin: "0 2px 8px",
      }}
    >
      {children}
    </div>
  );
}
