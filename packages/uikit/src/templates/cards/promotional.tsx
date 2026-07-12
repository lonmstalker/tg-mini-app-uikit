import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { TKAvatar } from "../../atoms/display";
import { TKIcon } from "../../atoms/icons";
import { useTKLocale } from "../../foundation/i18n";

/* ---------------- Banner card ---------------- */

export interface TKBannerCardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: ReactNode;
  text?: ReactNode;
  cta?: ReactNode;
  onCta?: () => void;
  testId?: string;
}

export const TKBannerCard = /* @__PURE__ */ forwardRef<HTMLDivElement, TKBannerCardProps>(function TKBannerCard(
  { title, text, cta, onCta, className, style, testId, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={className}
      data-testid={testId}
      {...rest}
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "var(--tk-r-lg)",
        padding: "18px 18px 16px",
        color: "var(--tk-on-accent, #fff)",
        background:
          "linear-gradient(135deg, color-mix(in srgb, var(--tk-accent) 86%, #fff) 0%, var(--tk-accent) 55%, color-mix(in srgb, var(--tk-accent) 78%, #000) 100%)",
        boxShadow: "0 14px 30px -12px var(--tk-accent-35)",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        ...style,
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
          background: "color-mix(in srgb, var(--tk-on-accent) 12%, transparent)",
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
          background: "color-mix(in srgb, var(--tk-on-accent) 8%, transparent)",
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
              background: "color-mix(in srgb, var(--tk-on-accent) 92%, transparent)",
              color: "var(--tk-accent-ink)",
            }}
          >
            {cta}
          </button>
        </div>
      ) : null}
    </div>
  );
});

/* ---------------- Booking / event card ---------------- */

export interface TKBookingCardProps extends HTMLAttributes<HTMLDivElement> {
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

export const TKBookingCard = /* @__PURE__ */ forwardRef<HTMLDivElement, TKBookingCardProps>(function TKBookingCard(
  {
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
    className,
    style,
    testId,
    ...rest
  },
  ref,
) {
  const hasMeta = date || time || actionLabel;
  return (
    <div
      ref={ref}
      className={className}
      data-testid={testId}
      {...rest}
      style={{
        background: "var(--tk-surface)",
        borderRadius: "var(--tk-r-lg)",
        boxShadow: "var(--tk-shadow-sm)",
        overflow: "hidden",
        ...style,
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
              // A real button — the action carries real handlers (check-in/reschedule)
              // and must be keyboard-operable with role=button, not a bare span (TCRD-003).
              <button
                type="button"
                onClick={onAction}
                className="tk-press"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  marginLeft: "auto",
                  color: "var(--tk-accent-ink)",
                  fontWeight: 600,
                  cursor: "pointer",
                  border: "none",
                  background: "none",
                  font: "inherit",
                  padding: 0,
                }}
              >
                {actionLabel}
              </button>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
});

/* ---------------- Stat tile ---------------- */

export interface TKStatTileProps extends HTMLAttributes<HTMLDivElement> {
  label?: ReactNode;
  value?: ReactNode;
  delta?: ReactNode;
  up?: boolean;
  bars?: number[];
  testId?: string;
}

export const TKStatTile = /* @__PURE__ */ forwardRef<HTMLDivElement, TKStatTileProps>(function TKStatTile(
  { label, value, delta, up = true, bars = [5, 8, 6, 10, 9, 13, 12], className, style, testId, ...rest },
  ref,
) {
  const locale = useTKLocale();
  // Use the real peak (preserving fractional series like [0.2,0.5]) but floor the
  // divisor at 1 only when the peak is non-positive, so all-zero/empty bars give
  // 0% instead of NaN%/-Infinity% (TCRD-002).
  const peak = bars.reduce((m, b) => (Number.isFinite(b) && b > m ? b : m), Number.NEGATIVE_INFINITY);
  const max = peak > 0 ? peak : 1;
  return (
    <div
      ref={ref}
      className={className}
      data-testid={testId}
      {...rest}
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
});
