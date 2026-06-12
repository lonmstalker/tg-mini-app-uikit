import { useState } from "react";
import {
  TKActionSheet,
  TKBars,
  TKButton,
  TKIconButton,
  TKLeaderboard,
  TKMainButton,
  TKStatTile,
  TKToastProvider,
  TKXPHeader,
  useTKToast,
} from "tg-mini-app-uikit";

/* Game — gamified mini-app example: XP, stats, leaderboard, daily reward. */

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

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
  const [coins, setCoins] = useState(2140);
  const [xp, setXp] = useState(64);
  const [streak, setStreak] = useState(6);
  const [claimed, setClaimed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activity, setActivity] = useState([42, 70, 55, 90, 62, 100, 78]);

  const claim = async () => {
    await sleep(1000);
    setCoins((c) => c + 50);
    setXp((v) => Math.min(100, v + 8));
    setStreak((s) => s + 1);
    setClaimed(true);
    toast.show({ icon: "gift", color: "var(--tk-orange)", text: "+50 coins · streak extended!" });
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "64px 16px 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "var(--tk-fz-title1)", fontWeight: 700, letterSpacing: "-.02em" }}>Arena</span>
        <TKIconButton icon="tune" variant="tonal" size={36} label="Options" onClick={() => setMenuOpen(true)} />
      </div>

      <div style={{ flex: 1, overflow: "auto" }}>
        <div style={{ padding: "4px 16px 12px", display: "flex", flexDirection: "column", gap: 14 }}>
        <TKXPHeader
          name="Anna K."
          initials="AK"
          level={12}
          xp={xp}
          hint={`${xp * 10} / 1000 XP to level 13`}
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <TKStatTile label="Coins" value={coins.toLocaleString("en-US")} delta={claimed ? "+50" : "+320"} bars={[4, 6, 5, 9, 8, 11, 13]} />
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
              { rank: 12, initials: "AK", name: "Anna K.", points: (7340 + (claimed ? 50 : 0)).toLocaleString("en-US"), you: true },
            ]}
          />
        </div>
        </div>
      </div>

      <div style={{ padding: "8px 16px 30px" }}>
        {claimed ? (
          <TKButton full size="lg" variant="tonal" disabled>
            Claimed · come back tomorrow
          </TKButton>
        ) : (
          <TKMainButton label="Claim daily reward · +50" successLabel="Claimed" onClick={claim} />
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
            onSelect: () => {
              setCoins(0);
              setXp(0);
              setStreak(0);
              setClaimed(false);
              toast.error("Progress reset");
            },
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
