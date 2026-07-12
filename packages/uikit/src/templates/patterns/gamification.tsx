import type { ReactNode } from "react";
import { TKAvatar, TKBadge } from "../../atoms/display";
import { useTKLocale } from "../../foundation/i18n";

export interface TKXPHeaderProps {
  name: ReactNode;
  initials?: string;
  level?: ReactNode;
  /** Progress to the next level, 0-100. */
  xp?: number;
  /** Caption under the bar; pass `null` to hide. */
  hint?: ReactNode;
  testId?: string;
}

export function TKXPHeader({ name, initials = "", level, xp = 0, hint, testId }: TKXPHeaderProps) {
  const locale = useTKLocale();
  // Single clamped value for the visual fill AND the announced progress (PTN-003).
  const pct = Number.isFinite(xp) ? Math.min(100, Math.max(0, xp)) : 0;
  return (
    <div
      data-testid={testId}
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "var(--tk-r-lg)",
        padding: 16,
        color: "var(--tk-on-accent, #fff)",
        background: "var(--tk-accent)",
        boxShadow: "0 14px 30px -12px var(--tk-accent-35)",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <TKAvatar initials={initials} size={54} tone="color-mix(in srgb, var(--tk-on-accent) 22%, transparent)" />
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
                background: "color-mix(in srgb, var(--tk-on-accent) 22%, transparent)",
              }}
            >
              {locale.lvl} {level}
            </span>
          ) : null}
        </div>
        <div
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={typeof hint === "string" ? hint : locale.progress}
          style={{ marginTop: 8, height: 7, borderRadius: 4, background: "color-mix(in srgb, var(--tk-on-accent) 25%, transparent)", overflow: "hidden" }}
        >
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              borderRadius: 4,
              background: "var(--tk-on-accent, #fff)",
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

export interface TKLeaderboardRow {
  rank: ReactNode;
  initials: string;
  name: ReactNode;
  points: ReactNode;
  /** Avatar background, e.g. rank tone. */
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
      {rows.map((row, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 14px",
            borderTop: index ? "0.5px solid var(--tk-sep)" : "none",
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
