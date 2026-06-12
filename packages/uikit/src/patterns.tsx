import type { ReactNode } from "react";
import { TKAvatar, TKBadge } from "./display";
import { useControllable } from "./internal/useControllable";

/* ---------------- Slot picker (booking) ---------------- */

export interface TKSlotDay {
  label: string;
  date: ReactNode;
}

export interface TKSlotPickerProps {
  days: TKSlotDay[];
  slots: string[];
  /** Slots rendered as unavailable. */
  busy?: string[];
  day?: number;
  defaultDay?: number;
  onDayChange?: (index: number) => void;
  slot?: string;
  defaultSlot?: string;
  onSlotChange?: (slot: string) => void;
  columns?: number;
}

export function TKSlotPicker({
  days,
  slots,
  busy = [],
  day,
  defaultDay = 0,
  onDayChange,
  slot,
  defaultSlot,
  onSlotChange,
  columns = 3,
}: TKSlotPickerProps) {
  const [dayIdx, setDayIdx] = useControllable(day, defaultDay, onDayChange);
  const [slotVal, setSlotVal] = useControllable(slot, defaultSlot ?? "", onSlotChange);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 7 }}>
        {days.map((d, i) => {
          const on = i === dayIdx;
          return (
            <button
              type="button"
              key={`${d.label}-${i}`}
              className="tk-press"
              onClick={() => setDayIdx(i)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                padding: "8px 0",
                border: "none",
                borderRadius: "var(--tk-r-sm)",
                background: on ? "var(--tk-accent)" : "var(--tk-surface)",
                color: on ? "var(--tk-on-accent)" : "var(--tk-text)",
                boxShadow: on ? "0 5px 14px -5px var(--tk-accent-35)" : "var(--tk-shadow-sm)",
                fontFamily: "inherit",
                transition:
                  "background var(--tk-t2) var(--tk-ease), color var(--tk-t2) var(--tk-ease), box-shadow var(--tk-t2) var(--tk-ease)",
              }}
            >
              <span
                style={{
                  fontSize: "var(--tk-fz-caption2)",
                  fontWeight: 600,
                  opacity: on ? 0.8 : 0.55,
                  textTransform: "uppercase",
                  letterSpacing: ".04em",
                }}
              >
                {d.label}
              </span>
              <span style={{ fontSize: "var(--tk-fz-body)", fontWeight: 700 }}>{d.date}</span>
            </button>
          );
        })}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 8 }}>
        {slots.map((s) => {
          const dis = busy.includes(s);
          const on = s === slotVal;
          return (
            <button
              type="button"
              key={s}
              className={dis ? undefined : "tk-press"}
              disabled={dis}
              onClick={() => setSlotVal(s)}
              style={{
                padding: "10px 0",
                border: "none",
                borderRadius: "var(--tk-r-sm)",
                background: on ? "var(--tk-accent)" : "var(--tk-surface)",
                color: dis ? "var(--tk-text-3)" : on ? "var(--tk-on-accent)" : "var(--tk-text)",
                boxShadow: on ? "0 5px 14px -5px var(--tk-accent-35)" : dis ? "none" : "var(--tk-shadow-sm)",
                fontSize: "var(--tk-fz-sub)",
                fontWeight: 600,
                fontFamily: "inherit",
                fontVariantNumeric: "tabular-nums",
                textDecoration: dis ? "line-through" : "none",
                cursor: dis ? "default" : "pointer",
                transition:
                  "background var(--tk-t2) var(--tk-ease), color var(--tk-t2) var(--tk-ease), box-shadow var(--tk-t2) var(--tk-ease)",
              }}
            >
              {s}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Payment summary ---------------- */

export interface TKSummaryRow {
  label: ReactNode;
  value: ReactNode;
  /** Render the value in green (discounts, promos). */
  accent?: boolean;
  /** Total row: bigger type and a divider above. */
  total?: boolean;
}

export interface TKPaymentSummaryProps {
  rows: TKSummaryRow[];
  children?: ReactNode;
}

export function TKPaymentSummary({ rows, children }: TKPaymentSummaryProps) {
  return (
    <div
      style={{
        background: "var(--tk-surface)",
        borderRadius: "var(--tk-r-lg)",
        boxShadow: "var(--tk-shadow-sm)",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {rows.map((row, i) => (
        <span key={i} style={{ display: "contents" }}>
          {row.total ? <div style={{ height: 0.5, background: "var(--tk-sep)", margin: "2px 0" }} /> : null}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              fontSize: row.total ? "var(--tk-fz-title3)" : "var(--tk-fz-sub)",
              fontWeight: row.total ? 700 : 400,
              color: row.accent ? "var(--tk-green)" : row.total ? "var(--tk-text)" : "var(--tk-text-2)",
            }}
          >
            <span>{row.label}</span>
            <span
              style={{
                fontVariantNumeric: "tabular-nums",
                fontWeight: row.total ? 700 : 600,
                color: row.accent ? "var(--tk-green)" : "var(--tk-text)",
              }}
            >
              {row.value}
            </span>
          </div>
        </span>
      ))}
      {children}
    </div>
  );
}

/* ---------------- Gamification: XP header ---------------- */

export interface TKXPHeaderProps {
  name: ReactNode;
  initials?: string;
  level?: ReactNode;
  /** Progress to the next level, 0–100. */
  xp?: number;
  /** Caption under the bar; pass `null` to hide. */
  hint?: ReactNode;
}

export function TKXPHeader({ name, initials = "", level, xp = 0, hint }: TKXPHeaderProps) {
  return (
    <div
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
              LVL {level}
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
}

export function TKLeaderboard({ rows, youLabel = "You" }: TKLeaderboardProps) {
  return (
    <div
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
              color: row.you ? "var(--tk-accent)" : "var(--tk-text-2)",
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
            {row.name} {row.you ? <TKBadge soft>{youLabel}</TKBadge> : null}
          </span>
          <span
            style={{
              fontWeight: 700,
              fontSize: "var(--tk-fz-sub)",
              fontVariantNumeric: "tabular-nums",
              color: row.you ? "var(--tk-accent)" : "var(--tk-text)",
            }}
          >
            {row.points}
          </span>
        </div>
      ))}
    </div>
  );
}
