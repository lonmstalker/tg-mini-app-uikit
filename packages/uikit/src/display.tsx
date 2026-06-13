import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { useControllable } from "./internal/useControllable";
import { useTKLocale } from "./i18n";

/* ---------------- Badges & status ---------------- */

export type TKTone = "accent" | "green" | "red" | "orange" | "gray";

const BADGE_TONES: Record<TKTone, [solid: string, soft: string, ink: string]> = {
  accent: ["var(--tk-accent)", "var(--tk-accent-12)", "var(--tk-accent-ink)"],
  green: ["var(--tk-green)", "var(--tk-green-12)", "var(--tk-green-ink)"],
  red: ["var(--tk-red)", "var(--tk-red-12)", "var(--tk-red-ink)"],
  orange: ["var(--tk-orange)", "var(--tk-orange-12)", "var(--tk-orange-ink)"],
  gray: ["var(--tk-text-2)", "var(--tk-surface-3)", "var(--tk-text-2)"],
};

export interface TKBadgeProps {
  children?: ReactNode;
  tone?: TKTone;
  soft?: boolean;
  style?: CSSProperties;
  /** Rendered as `data-testid`. */
  testId?: string;
}

export function TKBadge({ children, tone = "accent", soft, style, testId }: TKBadgeProps) {
  const [solid, softBg, ink] = BADGE_TONES[tone] ?? BADGE_TONES.accent;
  return (
    <span
      data-testid={testId}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 9px",
        borderRadius: "var(--tk-r-pill)",
        fontSize: "var(--tk-fz-caption)",
        fontWeight: 600,
        letterSpacing: ".01em",
        background: soft ? softBg : solid,
        color: soft ? ink : "var(--tk-on-accent)",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export interface TKDotProps {
  tone?: TKTone;
  pulse?: boolean;
  testId?: string;
}

export function TKDot({ tone = "green", pulse, testId }: TKDotProps) {
  const map: Record<TKTone, string> = {
    green: "var(--tk-green)",
    red: "var(--tk-red)",
    orange: "var(--tk-orange)",
    accent: "var(--tk-accent)",
    gray: "var(--tk-text-3)",
  };
  return (
    <span
      data-testid={testId}
      className={pulse ? "tk-pulse" : undefined}
      style={{
        width: 9,
        height: 9,
        borderRadius: "50%",
        background: map[tone],
        display: "inline-block",
      }}
    />
  );
}

export interface TKCounterProps {
  value: ReactNode;
  tone?: "red" | "accent" | "gray";
  /** Numeric values above this render as `max+` (e.g. `99+`). */
  max?: number;
  testId?: string;
}

export function TKCounter({ value, tone = "red", max, testId }: TKCounterProps) {
  const map = { red: "var(--tk-red)", accent: "var(--tk-accent)", gray: "var(--tk-text-3)" };
  const shown = typeof value === "number" && max != null && value > max ? `${max}+` : value;
  return (
    <span
      key={String(shown)}
      data-testid={testId}
      className="tk-pop"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 21,
        height: 21,
        padding: "0 6px",
        borderRadius: "var(--tk-r-pill)",
        background: map[tone],
        color: "#fff",
        fontSize: "var(--tk-fz-caption2)",
        fontWeight: 700,
      }}
    >
      {shown}
    </span>
  );
}

/* ---------------- Avatar ---------------- */

export interface TKAvatarProps {
  initials?: string;
  size?: number;
  /** Any CSS background — color or gradient. Defaults to the accent gradient. */
  tone?: string;
  /** Photo URL; falls back to the initials while loading or on error. */
  src?: string;
  alt?: string;
  /** Presence dot: `online` (green), `offline` (gray) or a custom node. */
  status?: "online" | "offline" | ReactNode;
  testId?: string;
}

export function TKAvatar({ initials = "", size = 40, tone, src, alt = "", status, testId }: TKAvatarProps) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (status != null) {
    const dot =
      status === "online" || status === "offline" ? (
        <span
          data-tk-avatar-status
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            width: Math.max(8, size * 0.26),
            height: Math.max(8, size * 0.26),
            borderRadius: "50%",
            background: status === "online" ? "var(--tk-green)" : "var(--tk-text-3)",
            boxShadow: "0 0 0 2px var(--tk-surface)",
          }}
        />
      ) : (
        <span data-tk-avatar-status style={{ position: "absolute", right: -2, bottom: -2 }}>{status}</span>
      );
    return (
      <span data-testid={testId} style={{ position: "relative", display: "inline-flex", flexShrink: 0 }}>
        <TKAvatar initials={initials} size={size} tone={tone} src={src} alt={alt} />
        {dot}
      </span>
    );
  }
  return (
    <span
      data-testid={testId}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        background: tone || "var(--tk-accent-grad)",
        color: "#fff",
        fontWeight: 700,
        fontSize: size * 0.38,
        letterSpacing: ".02em",
        flexShrink: 0,
      }}
    >
      {initials}
      {src && !failed ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : null}
    </span>
  );
}

/* ---------------- Image placeholder ---------------- */

export interface TKImgProps {
  label?: string;
  ratio?: string;
  radius?: string;
  style?: CSSProperties;
  testId?: string;
}

/** Striped wireframe placeholder. For real photos use `TKImage`. */
export function TKImg({ label, ratio = "1 / 1", radius = "var(--tk-r-md)", style, testId }: TKImgProps) {
  const locale = useTKLocale();
  return (
    <div className="tk-img-ph" data-testid={testId} style={{ aspectRatio: ratio, borderRadius: radius, width: "100%", ...style }}>
      {label ?? locale.image}
    </div>
  );
}

/* ---------------- Image (real media) ---------------- */

export interface TKImageProps {
  src?: string;
  srcSet?: string;
  sizes?: string;
  /** Tiny placeholder shown blurred until the real image loads (blur-up). */
  placeholderSrc?: string;
  alt?: string;
  ratio?: string;
  radius?: string;
  fit?: "cover" | "contain";
  /** Native lazy loading (default true). */
  lazy?: boolean;
  /** Placeholder text when there is no src or loading failed. */
  fallbackLabel?: string;
  onLoad?: () => void;
  onError?: () => void;
  style?: CSSProperties;
  className?: string;
  testId?: string;
}

/**
 * Image with the loading and error states built in: skeleton shimmer while
 * loading, fade-in when ready, striped placeholder when missing or failed.
 */
export function TKImage({
  src,
  srcSet,
  sizes,
  placeholderSrc,
  alt = "",
  ratio = "1 / 1",
  radius = "var(--tk-r-md)",
  fit = "cover",
  lazy = true,
  fallbackLabel,
  onLoad,
  onError,
  style,
  className,
  testId,
}: TKImageProps) {
  const locale = useTKLocale();
  const [state, setState] = useState<"loading" | "ready" | "error">(src ? "loading" : "error");
  useEffect(() => setState(src ? "loading" : "error"), [src]);

  if (!src || state === "error") {
    return (
      <div
        className={["tk-img-ph", className ?? ""].filter(Boolean).join(" ")}
        data-testid={testId}
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        style={{ aspectRatio: ratio, borderRadius: radius, width: "100%", ...style }}
      >
        {fallbackLabel ?? locale.image}
      </div>
    );
  }
  return (
    <div
      className={className}
      data-testid={testId}
      style={{
        position: "relative",
        aspectRatio: ratio,
        borderRadius: radius,
        overflow: "hidden",
        width: "100%",
        ...style,
      }}
    >
      {state === "loading" ? (
        placeholderSrc ? (
          <img
            src={placeholderSrc}
            alt=""
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: fit,
              filter: "blur(14px)",
              transform: "scale(1.08)",
            }}
          />
        ) : (
          <div className="tk-skel" style={{ position: "absolute", inset: 0, borderRadius: 0 }} />
        )
      ) : null}
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        loading={lazy ? "lazy" : undefined}
        onLoad={() => {
          setState("ready");
          onLoad?.();
        }}
        onError={() => {
          setState("error");
          onError?.();
        }}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          objectFit: fit,
          opacity: state === "ready" ? 1 : 0,
          transition: "opacity var(--tk-t2) var(--tk-ease)",
        }}
      />
    </div>
  );
}

/* ---------------- Avatar stack ---------------- */

export interface TKAvatarStackItem {
  initials?: string;
  src?: string;
  tone?: string;
  alt?: string;
}

export interface TKAvatarStackProps {
  avatars: TKAvatarStackItem[];
  /** Visible avatars before the `+N` tail (default 4). */
  max?: number;
  size?: number;
  testId?: string;
  style?: CSSProperties;
}

/** Overlapping avatar row with a `+N` overflow chip. */
export function TKAvatarStack({ avatars, max = 4, size = 32, testId, style }: TKAvatarStackProps) {
  const shown = avatars.slice(0, max);
  const rest = avatars.length - shown.length;
  return (
    <span data-testid={testId} style={{ display: "inline-flex", alignItems: "center", ...style }}>
      {shown.map((a, i) => (
        <span
          key={i}
          style={{
            display: "inline-flex",
            marginLeft: i ? -size * 0.3 : 0,
            borderRadius: "50%",
            boxShadow: "0 0 0 2px var(--tk-surface)",
            zIndex: shown.length - i,
          }}
        >
          <TKAvatar initials={a.initials} src={a.src} tone={a.tone} alt={a.alt} size={size} />
        </span>
      ))}
      {rest > 0 ? (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: size,
            height: size,
            marginLeft: -size * 0.3,
            borderRadius: "50%",
            background: "var(--tk-surface-3)",
            color: "var(--tk-text-2)",
            fontSize: size * 0.36,
            fontWeight: 700,
            boxShadow: "0 0 0 2px var(--tk-surface)",
          }}
        >
          +{rest}
        </span>
      ) : null}
    </span>
  );
}

/* ---------------- Spoiler ---------------- */

export interface TKSpoilerProps {
  children?: ReactNode;
  revealed?: boolean;
  defaultRevealed?: boolean;
  onRevealChange?: (revealed: boolean) => void;
  testId?: string;
  style?: CSSProperties;
}

/**
 * Telegram-style spoiler: the content is blurred and hidden from assistive
 * tech until tapped (or controlled via `revealed`).
 */
export function TKSpoiler({ children, revealed, defaultRevealed = false, onRevealChange, testId, style }: TKSpoilerProps) {
  const [open, setOpen] = useControllable(revealed, defaultRevealed, onRevealChange);
  const locale = useTKLocale();
  return (
    <span
      data-testid={testId}
      role={open ? undefined : "button"}
      aria-label={open ? undefined : locale.revealSpoiler}
      tabIndex={open ? undefined : 0}
      onClick={() => !open && setOpen(true)}
      onKeyDown={(e) => {
        if (!open && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          setOpen(true);
        }
      }}
      style={{ display: "inline", cursor: open ? "inherit" : "pointer", ...style }}
    >
      <span
        aria-hidden={open ? undefined : "true"}
        style={{
          filter: open ? "none" : "blur(6px)",
          background: open ? "transparent" : "var(--tk-surface-3)",
          borderRadius: "var(--tk-r-xs)",
          transition: "filter var(--tk-t2) var(--tk-ease), background var(--tk-t2) var(--tk-ease)",
          userSelect: open ? undefined : "none",
          WebkitUserSelect: open ? undefined : "none",
        }}
      >
        {children}
      </span>
    </span>
  );
}

/* ---------------- Blockquote ---------------- */

export interface TKBlockquoteProps {
  children?: ReactNode;
  author?: ReactNode;
  /** Optional leading icon name shown next to the author line. */
  icon?: ReactNode;
  testId?: string;
  style?: CSSProperties;
}

/** Quote block with the Telegram-style vertical accent bar. */
export function TKBlockquote({ children, author, icon, testId, style }: TKBlockquoteProps) {
  return (
    <blockquote
      data-testid={testId}
      style={{
        margin: 0,
        padding: "8px 12px",
        borderLeft: "3px solid var(--tk-accent)",
        borderRadius: "var(--tk-r-xs)",
        background: "var(--tk-accent-06)",
        display: "flex",
        flexDirection: "column",
        gap: 3,
        ...style,
      }}
    >
      {author ? (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--tk-accent-ink)", fontWeight: 700, fontSize: "var(--tk-fz-sub)" }}>
          {icon}
          {author}
        </span>
      ) : null}
      <span style={{ fontSize: "var(--tk-fz-sub)", lineHeight: 1.4, color: "var(--tk-text)" }}>{children}</span>
    </blockquote>
  );
}
