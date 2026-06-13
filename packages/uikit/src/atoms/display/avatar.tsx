import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

export interface TKAvatarProps {
  initials?: string;
  size?: number;
  /** Any CSS background - color or gradient. Defaults to the accent gradient. */
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
            width: Math.max(9, size * 0.24),
            height: Math.max(9, size * 0.24),
            borderRadius: "50%",
            background: status === "online" ? "var(--tk-green)" : "var(--tk-text-3)",
            border: "2px solid var(--tk-surface)",
            boxSizing: "border-box",
            transform: "translate(20%, 20%)",
          }}
        />
      ) : (
        <span data-tk-avatar-status style={{ position: "absolute", right: -2, bottom: -2 }}>{status}</span>
      );
    return (
      <span data-testid={testId} style={{ position: "relative", display: "inline-flex", width: size, height: size, flexShrink: 0 }}>
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
