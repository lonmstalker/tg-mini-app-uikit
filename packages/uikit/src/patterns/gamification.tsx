import type { ReactNode } from "react";
import { TKAvatar, TKBadge } from "../display";
import { useTKLocale } from "../i18n";

/* ---------------- Gamification: XP header ---------------- */

export interface TKXPHeaderProps {
  name: ReactNode;
  initials?: string;
  level?: ReactNode;
  /** Progress to the next level, 0–100. */
  xp?: number;
  /** Caption under the bar; pass `null` to hide. */
  hint?: ReactNode;
  testId?: string;
}

export function TKXPHeader({ name, initials = "", level, xp = 0, hint, testId }: TKXPHeaderProps) {
  const locale = useTKLocale();
  return (
    <div
      data-testid={testId}
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "var(--tk-r-lg)",
        padding: 16,
        color: "#fff",
        background:
          "linear-gradient(135deg, color-mix(in srgb, var(--tk-accent) 85%, #fff) 0%, var(--tk-accent) 50%, color-mix(in srgb, var(--tk-accent) 72%, #000) 100%)",
        boxShadow: "0 14px 30px -12px var(--tk-accent-35)",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -30,
          right: -20,
          width: 110,
          height: 110,
          borderRadius: "50%",
          background: "rgba(255,255,255,.1)",
        }}
      />
      <TKAvatar initials={initials} size={54} tone="rgba(255,255,255,.22)" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "var(--tk-fz-body)", fontWeight: 700 }}>{name}</span>
          {level != null ? (
            <span
              style={{
                fontSize: "var(--tk-fz-caption2)",
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "var(--tk-r-pill)",
                background: "rgba(255,255,255,.22)",
              }}
            >
              {locale.lvl} {level}
            </span>
          ) : null}
        </div>
        <div style={{ marginTop: 8, height: 7, borderRadius: 4, background: "rgba(255,255,255,.25)", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${Math.min(100, Math.max(0, xp))}%`,
              borderRadius: 4,
              background: "#fff",
              transition: "width var(--tk-t3) var(--tk-spring)",
            }}
          />
        </div>
        {hint !== null ? (
          <div style={{ marginTop: 5, fontSize: "var(--tk-fz-caption2)", opacity: 0.85 }}>{hint}</div>
        ) : null}
      </div>
    </div>
  );
}

/* ---------------- Gamification: leaderboard ---------------- */

export interface TKLeaderboardRow {
  rank: ReactNode;
  initials: string;
  name: ReactNode;
  points: ReactNode;
  /** Avatar background (e.g. gold/silver/bronze gradients for the podium). */
  tone?: string;
  /** Highlight this row as the current user. */
  you?: boolean;
}

export interface TKLeaderboardProps {
  rows: TKLeaderboardRow[];
  youLabel?: ReactNode;
  testId?: string;
}

export function TKLeaderboard({ rows, youLabel, testId }: TKLeaderboardProps) {
  const locale = useTKLocale();
  return (
    <div
      data-testid={testId}
      style={{
        background: "var(--tk-surface)",
        borderRadius: "var(--tk-r-lg)",
        boxShadow: "var(--tk-shadow-sm)",
        overflow: "hidden",
      }}
    >
      {rows.map((row, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 14px",
            borderTop: i ? "0.5px solid var(--tk-sep)" : "none",
            background: row.you ? "var(--tk-accent-06)" : "transparent",
          }}
        >
          <span
            style={{
              width: 24,
              textAlign: "center",
              fontWeight: 800,
              fontSize: "var(--tk-fz-sub)",
              color: row.you ? "var(--tk-accent-ink)" : "var(--tk-text-2)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {row.rank}
          </span>
          <TKAvatar initials={row.initials} size={38} tone={row.tone} />
          <span
            style={{
              flex: 1,
              fontSize: "var(--tk-fz-body)",
              fontWeight: row.you ? 700 : 500,
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {row.name} {row.you ? <TKBadge soft>{youLabel ?? locale.you}</TKBadge> : null}
          </span>
          <span
            style={{
              fontWeight: 700,
              fontSize: "var(--tk-fz-sub)",
              fontVariantNumeric: "tabular-nums",
              color: row.you ? "var(--tk-accent-ink)" : "var(--tk-text)",
            }}
          >
            {row.points}
          </span>
        </div>
      ))}
    </div>
  );
}
