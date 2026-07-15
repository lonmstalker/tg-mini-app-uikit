import { useId } from "react";

interface WordmarkProps {
  href: string;
  size?: "compact" | "footer";
  context?: string;
  tagline?: string;
}

export function Wordmark({
  href,
  size = "compact",
  context,
  tagline,
}: WordmarkProps) {
  const gradientId = `wordmark-gradient-${useId().replace(/:/g, "")}`;

  return (
    <a
      className="site-wordmark"
      data-size={size}
      data-testid={`site-wordmark-${size}`}
      href={href}
      aria-label={context ? `tg-mini-app-uikit — ${context}` : "tg-mini-app-uikit"}
    >
      <svg
        aria-hidden="true"
        className="wordmark-mark"
        focusable="false"
        viewBox="0 0 32 32"
      >
        <defs>
          <linearGradient id={gradientId} x1="5" y1="3" x2="27" y2="29" gradientUnits="userSpaceOnUse">
            <stop stopColor="color-mix(in srgb, var(--tk-accent) 76%, var(--tk-text))" />
            <stop offset="1" stopColor="var(--tk-accent)" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="9" fill={`url(#${gradientId})`} />
        <rect
          x="0.75"
          y="0.75"
          width="30.5"
          height="30.5"
          rx="8.25"
          fill="none"
          stroke="color-mix(in srgb, var(--tk-on-accent) 42%, transparent)"
          strokeWidth="1.5"
        />
        <path
          d="M18.7 5.25 8.9 17.4h6.35l-1.4 9.35 9.25-12.2h-6.2l1.8-9.3Z"
          fill="currentColor"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="0.7"
        />
      </svg>

      <span className="wordmark-copy">
        <span className="wordmark-name" aria-hidden="true">
          <span className="wordmark-prefix">tg-mini-app-</span>
          <span className="wordmark-emphasis">uikit</span>
          {context ? <span className="wordmark-context">{context}</span> : null}
        </span>
        {tagline ? <span className="wordmark-tagline">{tagline}</span> : null}
      </span>
    </a>
  );
}
