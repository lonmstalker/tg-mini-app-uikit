import { type CSSProperties, type ReactNode } from "react";
import { TKAvatar } from "../../atoms/display";
import { TKIcon } from "../../atoms/icons";
import { useTKLocale } from "../../foundation/i18n";

/* ---------------- Banner card ---------------- */

export interface TKBannerCardProps {
  title?: ReactNode;
  text?: ReactNode;
  cta?: ReactNode;
  onCta?: () => void;
  testId?: string;
}

export function TKBannerCard({ title, text, cta, onCta, testId }: TKBannerCardProps) {
  return (
    <div
      data-testid={testId}
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "var(--tk-r-lg)",
        padding: "18px 18px 16px",
        color: "#fff",
        background:
          "linear-gradient(135deg, color-mix(in srgb, var(--tk-accent) 86%, #fff) 0%, var(--tk-accent) 55%, color-mix(in srgb, var(--tk-accent) 78%, #000) 100%)",
        boxShadow: "0 14px 30px -12px var(--tk-accent-35)",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -36,
          right: -28,
          width: 130,
          height: 130,
          borderRadius: "50%",
          background: "rgba(255,255,255,.12)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -50,
          right: 36,
          width: 90,
          height: 90,
          borderRadius: "50%",
          background: "rgba(255,255,255,.08)",
        }}
      />
      <div style={{ fontSize: "var(--tk-fz-title2)", fontWeight: 700, letterSpacing: "-.01em" }}>{title}</div>
      <div style={{ fontSize: "var(--tk-fz-sub)", opacity: 0.86, maxWidth: "85%" }}>{text}</div>
      {cta ? (
        <div style={{ marginTop: 8 }}>
          <button
            type="button"
            className="tk-press"
            onClick={onCta}
            style={{
              border: "none",
              borderRadius: "var(--tk-r-pill)",
              padding: "9px 16px",
              fontSize: "var(--tk-fz-sub)",
              fontWeight: 600,
              fontFamily: "inherit",
              background: "rgba(255,255,255,.92)",
              color: "var(--tk-accent-ink)",
            }}
          >
            {cta}
          </button>
        </div>
      ) : null}
    </div>
  );
}

/* ---------------- Booking / event card ---------------- */

export interface TKBookingCardProps {
  initials?: string;
  avatarTone?: string;
  /** Avatar silhouette: circle for people (default), rounded for place/media thumbnails. */
  avatarShape?: "circle" | "rounded";
  name: ReactNode;
  subtitle?: ReactNode;
  /** Trailing status node, e.g. `<TKBadge tone="green" soft>Confirmed</TKBadge>`. */
  status?: ReactNode;
  date?: ReactNode;
  time?: ReactNode;
  actionLabel?: ReactNode;
  onAction?: () => void;
  testId?: string;
}

export function TKBookingCard({
  initials = "",
  avatarTone,
  avatarShape = "circle",
  name,
  subtitle,
  status,
  date,
  time,
  actionLabel,
  onAction,
  testId,
}: TKBookingCardProps) {
  const hasMeta = date || time || actionLabel;
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
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 14 }}>
        <TKAvatar initials={initials} size={44} tone={avatarTone} shape={avatarShape} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "var(--tk-fz-body)", fontWeight: 600 }}>{name}</div>
          {subtitle ? (
            <div style={{ fontSize: "var(--tk-fz-caption)", color: "var(--tk-text-2)" }}>{subtitle}</div>
          ) : null}
        </div>
        {status}
      </div>
      {hasMeta ? (
        <>
          <div style={{ height: 0.5, background: "var(--tk-sep)" }} />
          <div
            style={{
              display: "flex",
              gap: 16,
              padding: "12px 14px",
              color: "var(--tk-text-2)",
              fontSize: "var(--tk-fz-sub)",
            }}
          >
            {date ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <TKIcon name="calendar" size={16} /> {date}
              </span>
            ) : null}
            {time ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <TKIcon name="clock" size={16} /> {time}
              </span>
            ) : null}
            {actionLabel ? (
              <span
                onClick={onAction}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  marginLeft: "auto",
                  color: "var(--tk-accent-ink)",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {actionLabel}
              </span>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}

/* ---------------- Stat tile ---------------- */

export interface TKStatTileProps {
  label?: ReactNode;
  value?: ReactNode;
  delta?: ReactNode;
  up?: boolean;
  bars?: number[];
  testId?: string;
  style?: CSSProperties;
}

export function TKStatTile({
  label,
  value,
  delta,
  up = true,
  bars = [5, 8, 6, 10, 9, 13, 12],
  testId,
  style,
}: TKStatTileProps) {
  const locale = useTKLocale();
  const max = Math.max(...bars);
  return (
    <div
      data-testid={testId}
      style={{
        background: "var(--tk-surface)",
        borderRadius: "var(--tk-r-lg)",
        boxShadow: "var(--tk-shadow-sm)",
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        ...style,
      }}
    >
      <div
        style={{
          fontSize: "var(--tk-fz-caption)",
          fontWeight: 600,
          color: "var(--tk-text-2)",
          textTransform: "uppercase",
          letterSpacing: ".04em",
        }}
      >
        {label ?? locale.metric}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: "var(--tk-fz-title2)", fontWeight: 700, letterSpacing: "-.02em" }}>{value}</span>
        {delta ? (
          <span
            style={{
              fontSize: "var(--tk-fz-caption)",
              fontWeight: 700,
              color: up ? "var(--tk-green)" : "var(--tk-red)",
            }}
          >
            {delta}
          </span>
        ) : null}
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 34 }}>
        {bars.map((b, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              borderRadius: 3,
              height: `${(b / max) * 100}%`,
              background: i === bars.length - 1 ? "var(--tk-accent)" : "var(--tk-accent-20)",
              transition: "height var(--tk-t3) var(--tk-spring)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
