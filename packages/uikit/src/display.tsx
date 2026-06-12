import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

/* ---------------- Badges & status ---------------- */

export type TKTone = "accent" | "green" | "red" | "orange" | "gray";

const BADGE_TONES: Record<TKTone, [solid: string, soft: string]> = {
  accent: ["var(--tk-accent)", "var(--tk-accent-12)"],
  green: ["var(--tk-green)", "var(--tk-green-12)"],
  red: ["var(--tk-red)", "var(--tk-red-12)"],
  orange: ["var(--tk-orange)", "var(--tk-orange-12)"],
  gray: ["var(--tk-text-2)", "var(--tk-surface-3)"],
};

export interface TKBadgeProps {
  children?: ReactNode;
  tone?: TKTone;
  soft?: boolean;
  style?: CSSProperties;
}

export function TKBadge({ children, tone = "accent", soft, style }: TKBadgeProps) {
  const [solid, softBg] = BADGE_TONES[tone] ?? BADGE_TONES.accent;
  return (
    <span
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
        color: soft ? solid : "var(--tk-on-accent)",
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
}

export function TKDot({ tone = "green", pulse }: TKDotProps) {
  const map: Record<TKTone, string> = {
    green: "var(--tk-green)",
    red: "var(--tk-red)",
    orange: "var(--tk-orange)",
    accent: "var(--tk-accent)",
    gray: "var(--tk-text-3)",
  };
  return (
    <span
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
}

export function TKCounter({ value, tone = "red" }: TKCounterProps) {
  const map = { red: "var(--tk-red)", accent: "var(--tk-accent)", gray: "var(--tk-text-3)" };
  return (
    <span
      key={String(value)}
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
      {value}
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
}

export function TKAvatar({ initials = "", size = 40, tone, src, alt = "" }: TKAvatarProps) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return (
    <span
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
}

/** Striped wireframe placeholder. For real photos use `TKImage`. */
export function TKImg({ label = "image", ratio = "1 / 1", radius = "var(--tk-r-md)", style }: TKImgProps) {
  return (
    <div className="tk-img-ph" style={{ aspectRatio: ratio, borderRadius: radius, width: "100%", ...style }}>
      {label}
    </div>
  );
}

/* ---------------- Image (real media) ---------------- */

export interface TKImageProps {
  src?: string;
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
}

/**
 * Image with the loading and error states built in: skeleton shimmer while
 * loading, fade-in when ready, striped placeholder when missing or failed.
 */
export function TKImage({
  src,
  alt = "",
  ratio = "1 / 1",
  radius = "var(--tk-r-md)",
  fit = "cover",
  lazy = true,
  fallbackLabel = "image",
  onLoad,
  onError,
  style,
  className,
}: TKImageProps) {
  const [state, setState] = useState<"loading" | "ready" | "error">(src ? "loading" : "error");
  useEffect(() => setState(src ? "loading" : "error"), [src]);

  if (!src || state === "error") {
    return (
      <div
        className={["tk-img-ph", className ?? ""].filter(Boolean).join(" ")}
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        style={{ aspectRatio: ratio, borderRadius: radius, width: "100%", ...style }}
      >
        {fallbackLabel}
      </div>
    );
  }
  return (
    <div
      className={className}
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
        <div className="tk-skel" style={{ position: "absolute", inset: 0, borderRadius: 0 }} />
      ) : null}
      <img
        src={src}
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
