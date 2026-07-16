import { forwardRef, useState, type HTMLAttributes, type ReactNode } from "react";
import { useTKLocale } from "../../foundation/i18n";

export interface TKAvatarProps extends HTMLAttributes<HTMLSpanElement> {
  initials?: string;
  size?: number;
  /** Any CSS background - color or gradient. Defaults to the accent gradient. */
  tone?: string;
  /** Photo URL; falls back to the initials while loading or on error. */
  src?: string;
  alt?: string;
  /** Presence dot: `online` (green), `offline` (gray) or a custom node. */
  status?: "online" | "offline" | ReactNode;
  /** Silhouette: a circle (people, default) or a rounded square (place/media thumbnails). */
  shape?: "circle" | "rounded";
  testId?: string;
}

export const TKAvatar = /* @__PURE__ */ forwardRef<HTMLSpanElement, TKAvatarProps>(function TKAvatar(
  { initials = "", size = 40, tone, src, alt = "", status, shape = "circle", className, style, testId, ...rest },
  ref,
) {
  const locale = useTKLocale();
  const [failed, setFailed] = useState(false);
  // A new `src` clears a previous failure via the adjust-state-during-render
  // pattern (the nav.tsx prevStack rationale) — an effect would paint one stale
  // frame where the old failure still hides the fresh photo.
  const [prevSrc, setPrevSrc] = useState(src);
  if (prevSrc !== src) {
    setPrevSrc(src);
    setFailed(false);
  }
  const showingPhoto = !!(src && !failed);
  // One accessible name for the whole atom: the photo's `alt`, else the initials
  // when there's no photo. A loaded photo without `alt` is left unnamed rather than
  // announcing the now-stale placeholder initials (DSP-001).
  const accessibleName = alt || (showingPhoto ? undefined : initials) || undefined;
  // Render the dot as a sibling of the body within ONE component instance —
  // never recurse into a second <TKAvatar> (which doubled the failed-state/effect
  // and remounted the <img> — DSP-011).
  const dot =
    status == null ? null : status === "online" || status === "offline" ? (
      <span
        data-tk-avatar-status
        role="img"
        aria-label={status === "online" ? locale.online : locale.offline}
        style={{
          position: "absolute",
          // Logical inset so the presence dot flips to the leading corner under RTL (DSP-010).
          insetInlineEnd: 0,
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
      <span data-tk-avatar-status style={{ position: "absolute", insetInlineEnd: -2, bottom: -2 }}>
        {status}
      </span>
    );
  // The body is the root only when there is no dot; otherwise the wrapper below is,
  // so ref/className/native props land on whichever element is actually returned.
  const bodyIsRoot = !dot;
  const body = (
    <span
      ref={bodyIsRoot ? ref : undefined}
      className={bodyIsRoot ? className : undefined}
      data-testid={bodyIsRoot ? testId : undefined}
      {...(bodyIsRoot ? rest : {})}
      role="img"
      aria-label={accessibleName}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: shape === "rounded" ? "var(--tk-r-md)" : "50%",
        overflow: "hidden",
        background: tone || "var(--tk-accent-grad)",
        color: "var(--tk-on-accent, #fff)",
        fontWeight: 700,
        fontSize: size * 0.38,
        letterSpacing: ".02em",
        flexShrink: 0,
        ...(bodyIsRoot ? style : null),
      }}
    >
      {initials}
      {src && !failed ? (
        <img
          src={src}
          alt=""
          aria-hidden="true"
          loading="lazy"
          onError={() => setFailed(true)}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : null}
    </span>
  );
  if (!dot) return body;
  return (
    <span
      ref={ref}
      className={className}
      data-testid={testId}
      {...rest}
      style={{ position: "relative", display: "inline-flex", width: size, height: size, flexShrink: 0, ...style }}
    >
      {body}
      {dot}
    </span>
  );
});

export interface TKAvatarStackItem {
  /** Stable identity for React keys (CC-11/DSP-007) — falls back to src+initials. */
  id?: string;
  initials?: string;
  src?: string;
  tone?: string;
  alt?: string;
}

export interface TKAvatarStackProps extends HTMLAttributes<HTMLSpanElement> {
  avatars: TKAvatarStackItem[];
  /** Visible avatars before the `+N` tail (default 4). */
  max?: number;
  size?: number;
  testId?: string;
}

/** Overlapping avatar row with a `+N` overflow chip. */
export const TKAvatarStack = /* @__PURE__ */ forwardRef<HTMLSpanElement, TKAvatarStackProps>(function TKAvatarStack(
  { avatars, max = 4, size = 32, className, style, testId, ...rest },
  ref,
) {
  const shown = avatars.slice(0, max);
  const overflow = avatars.length - shown.length;
  return (
    <span
      ref={ref}
      className={className}
      data-testid={testId}
      {...rest}
      style={{ display: "inline-flex", alignItems: "center", ...style }}
    >
      {shown.map((a, i) => (
        <span
          // Key by stable identity so removing/reordering doesn't flash the wrong
          // avatar (CC-11/DSP-007); fall back to src+initials, then index.
          key={a.id ?? (a.src || a.initials ? `${a.src ?? ""}|${a.initials ?? ""}` : i)}
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
      {overflow > 0 ? (
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
          +{overflow}
        </span>
      ) : null}
    </span>
  );
});
