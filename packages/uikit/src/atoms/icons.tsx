import type { CSSProperties, ReactNode } from "react";

// Minimal stroke icon set (24×24, 2px round strokes).
const paths = {
  chevronRight: <path d="M9.5 6l6 6-6 6" />,
  chevronLeft: <path d="M14.5 6l-6 6 6 6" />,
  chevronDown: <path d="M6 9.5l6 6 6-6" />,
  check: <path d="M5 12.8l4.3 4.3L19 7.3" />,
  plus: <path d="M12 5.5v13M5.5 12h13" />,
  minus: <path d="M5.5 12h13" />,
  close: <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />,
  search: <><circle cx="11" cy="11" r="6.3" /><path d="M15.8 15.8L21 21" /></>,
  star: <path d="M12 3.5l2.65 5.37 5.93.86-4.29 4.18 1.01 5.9L12 17.02l-5.3 2.79 1.01-5.9-4.29-4.18 5.93-.86z" />,
  heart: <path d="M19.47 12.72L12 20.1l-7.47-7.38a4.86 4.86 0 010-6.96 5.06 5.06 0 017.14 0l.33.33.33-.33a5.06 5.06 0 017.14 0 4.86 4.86 0 010 6.96z" />,
  bell: <><path d="M18 8.6a6 6 0 00-12 0c0 6.3-2.4 7.8-2.4 7.8h16.8S18 14.9 18 8.6z" /><path d="M10 20h4" /></>,
  cart: <><circle cx="9" cy="20" r="1.4" /><circle cx="17" cy="20" r="1.4" /><path d="M2.8 4h2.1l2.35 11.3a2 2 0 001.96 1.6h7.97a2 2 0 001.94-1.52L20.8 8H6.05" /></>,
  tune: <><path d="M4 7h6.1M14.9 7H20" /><circle cx="12.5" cy="7" r="2.4" /><path d="M4 17h4.1M12.9 17H20" /><circle cx="10.5" cy="17" r="2.4" /></>,
  user: <><circle cx="12" cy="8" r="3.8" /><path d="M4.5 20.5c.6-3.6 3.7-5.4 7.5-5.4s6.9 1.8 7.5 5.4" /></>,
  home: <><path d="M3.5 11L12 3.8l8.5 7.2" /><path d="M5.5 10.6V20h4.7v-5.4h3.6V20h4.7v-9.4" /></>,
  calendar: <><rect x="4" y="5.5" width="16" height="15" rx="2.5" /><path d="M4 10.2h16M8.3 3.2v4M15.7 3.2v4" /></>,
  wallet: <><path d="M4 7.5A2.5 2.5 0 016.5 5H18a2 2 0 012 2v11a2 2 0 01-2 2H6.5A2.5 2.5 0 014 17.5z" /><path d="M4 9.5h14.5A1.5 1.5 0 0120 11v3.8h-4.3a2.3 2.3 0 010-4.6H20" /><path d="M16.2 12.5h.2" /></>,
  arrowRight: <path d="M4.5 12h14M12.5 6l6 6-6 6" />,
  bolt: <path d="M13 2.5L5.5 13H11l-1 8.5L17.5 11H12z" />,
  moon: <path d="M20 14.2A8.2 8.2 0 119.8 4 6.6 6.6 0 0020 14.2z" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4" /></>,
  gift: <><path d="M20 12v7a2 2 0 01-2 2H6a2 2 0 01-2-2v-7" /><path d="M2.5 8h19v4h-19zM12 8v13" /><path d="M12 8H7.7a2.35 2.35 0 110-4.7C10.6 3.3 12 8 12 8zM12 8h4.3a2.35 2.35 0 100-4.7C13.4 3.3 12 8 12 8z" /></>,
  ticket: <><path d="M4 8.2A2.2 2.2 0 016.2 6h11.6A2.2 2.2 0 0120 8.2v1.5a2.3 2.3 0 000 4.6v1.5a2.2 2.2 0 01-2.2 2.2H6.2A2.2 2.2 0 014 15.8v-1.5a2.3 2.3 0 000-4.6z" /><path d="M13.5 6v2.1M13.5 11v2M13.5 15.9V18" /></>,
  trash: <><path d="M4.5 7h15" /><path d="M9 7V4.8h6V7M7 7l.75 13h8.5L17 7M10 11v5M14 11v5" /></>,
  share: <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.6 10.5l6.8-4M8.6 13.5l6.8 4" /></>,
  location: <><path d="M12 21s-6.7-5.4-6.7-10.3a6.7 6.7 0 0113.4 0C18.7 15.6 12 21 12 21z" /><circle cx="12" cy="10.5" r="2.4" /></>,
  clock: <><circle cx="12" cy="12" r="8.3" /><path d="M12 7.5V12l3.2 2" /></>,
  card: <><rect x="3" y="5.5" width="18" height="13.5" rx="2.5" /><path d="M3 10h18" /></>,
  chat: <path d="M21 11.7a8.5 8.5 0 01-12.18 7.66L4 20.8l1.43-4.46A8.5 8.5 0 1121 11.7z" />,
  grid: <><rect x="4" y="4" width="7" height="7" rx="2" /><rect x="13" y="4" width="7" height="7" rx="2" /><rect x="4" y="13" width="7" height="7" rx="2" /><rect x="13" y="13" width="7" height="7" rx="2" /></>,
  eye: <><path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="3" /></>,
  eyeOff: <><path d="M4 4l16 16" /><path d="M9.9 5.1A9.8 9.8 0 0112 5.8c6 0 9.5 6.2 9.5 6.2a17 17 0 01-3.3 3.9M6 6.7A16.6 16.6 0 002.5 12S6 18.2 12 18.2c1.2 0 2.3-.2 3.3-.6" /><path d="M10 10.2a3 3 0 004 4.1" /></>,
  backspace: <><path d="M8.5 5h10A2.5 2.5 0 0121 7.5v9a2.5 2.5 0 01-2.5 2.5h-10L3 12z" /><path d="M11 9.5l5 5M16 9.5l-5 5" /></>,
  fingerprint: <><path d="M6.7 17.9A11.2 11.2 0 015.5 13a6.5 6.5 0 0111.1-4.6" /><path d="M18.6 10.9c.15.67.22 1.38.22 2.1 0 1.68-.2 3.22-.62 4.62" /><path d="M9.35 20.4A15.2 15.2 0 018 13a4 4 0 018 0c0 2.75-.3 5.05-.9 6.9" /><path d="M12 13c0 3.15-.42 5.62-1.25 7.4M15.05 3.9A8.4 8.4 0 004 13" /><path d="M12 9a4 4 0 014 4" /></>,
  copy: <><rect x="9" y="9" width="11" height="11" rx="2.5" /><path d="M5.5 14.5A2.5 2.5 0 014 12.2V6.5A2.5 2.5 0 016.5 4h5.7a2.5 2.5 0 012.3 1.5" /></>,
  qr: <><rect x="4" y="4" width="6" height="6" rx="1.2" /><rect x="14" y="4" width="6" height="6" rx="1.2" /><rect x="4" y="14" width="6" height="6" rx="1.2" /><path d="M14 14h2.5v2.5H14zM17.5 17.5H20V20h-2.5zM20 14h-2.5M14 20v-2.5" /></>,
  send: <path d="M21.5 2.5L10.2 13.8M21.5 2.5l-6.7 19-4.6-7.7-7.7-4.6z" />,
  edit: <><path d="M16.8 3.8a2.3 2.3 0 013.3 3.3L8.5 18.7 4 20l1.3-4.5z" /></>,
  filter: <path d="M4 6h16M7 12h10M10 18h4" />,
  download: <><path d="M12 4v10.5M8 11l4 4 4-4" /><path d="M4.5 17v1.5A2.5 2.5 0 007 21h10a2.5 2.5 0 002.5-2.5V17" /></>,
  upload: <><path d="M12 15V4.5M8 8l4-4 4 4" /><path d="M4.5 17v1.5A2.5 2.5 0 007 21h10a2.5 2.5 0 002.5-2.5V17" /></>,
  refresh: <><path d="M20 6v5h-5" /><path d="M19.4 13.5A7.6 7.6 0 1118 7.6L20 11" /></>,
  warning: <><path d="M12 4.2L2.8 19.5h18.4z" /><path d="M12 10v4.4M12 17.2v.2" /></>,
  info: <><circle cx="12" cy="12" r="8.3" /><path d="M12 11v5M12 8v.2" /></>,
  link: <><path d="M9.5 14.5l5-5" /><path d="M11 6.5l1.5-1.5a4 4 0 015.7 5.7L16.5 12.4" /><path d="M13 17.5l-1.5 1.5a4 4 0 01-5.7-5.7l1.7-1.7" /></>,
  phone: <path d="M5.5 4h3l1.7 4.2-2 1.6a12.5 12.5 0 006 6l1.6-2L20 15.5v3a2 2 0 01-2.2 2A16.3 16.3 0 013.5 6.2 2 2 0 015.5 4z" />,
  mail: <><rect x="3.5" y="5.5" width="17" height="13" rx="2.5" /><path d="M4.5 7.5l7.5 5.7 7.5-5.7" /></>,
  camera: <><path d="M4 8.5A2.5 2.5 0 016.5 6h1.2l1.5-2h5.6l1.5 2h1.2A2.5 2.5 0 0120 8.5v8a2.5 2.5 0 01-2.5 2.5h-11A2.5 2.5 0 014 16.5z" /><circle cx="12" cy="12.5" r="3.4" /></>,
  mic: <><rect x="9" y="3.5" width="6" height="11" rx="3" /><path d="M5.5 11.5a6.5 6.5 0 0013 0M12 18v2.5" /></>,
  play: <path d="M8 5.5l11 6.5-11 6.5z" />,
  pause: <path d="M8.5 5.5v13M15.5 5.5v13" />,
  volume: <><path d="M4 9.5h3l5-4.2v13.4l-5-4.2H4z" /><path d="M15.5 9a4.5 4.5 0 010 6M18 6.7a8 8 0 010 10.6" /></>,
  volumeOff: <><path d="M4 9.5h3l5-4.2v13.4l-5-4.2H4z" /><path d="M16 9.5l5 5M21 9.5l-5 5" /></>,
  lock: <><rect x="5" y="10.5" width="14" height="10" rx="2.5" /><path d="M8 10.5V8a4 4 0 018 0v2.5" /></>,
  unlock: <><rect x="5" y="10.5" width="14" height="10" rx="2.5" /><path d="M8 10.5V8a4 4 0 017.8-1.2" /></>,
  settings: <><circle cx="12" cy="12" r="3.2" /><path d="M12 2.8h.1a2.05 2.05 0 011.97 1.48l.24.82a7.8 7.8 0 011.44.6l.76-.4a2.05 2.05 0 012.43.38l.07.07a2.05 2.05 0 01.38 2.43l-.4.76c.24.46.44.94.6 1.44l.82.24A2.05 2.05 0 0121.9 12v.1a2.05 2.05 0 01-1.48 1.97l-.82.24a7.8 7.8 0 01-.6 1.44l.4.76a2.05 2.05 0 01-.38 2.43l-.07.07a2.05 2.05 0 01-2.43.38l-.76-.4a7.8 7.8 0 01-1.44.6l-.24.82A2.05 2.05 0 0112.1 21.9H12a2.05 2.05 0 01-1.97-1.48l-.24-.82a7.8 7.8 0 01-1.44-.6l-.76.4a2.05 2.05 0 01-2.43-.38l-.07-.07a2.05 2.05 0 01-.38-2.43l.4-.76a7.8 7.8 0 01-.6-1.44l-.82-.24A2.05 2.05 0 012.1 12.1V12a2.05 2.05 0 011.48-1.97l.82-.24c.16-.5.36-.98.6-1.44l-.4-.76a2.05 2.05 0 01.38-2.43l.07-.07a2.05 2.05 0 012.43-.38l.76.4c.46-.24.94-.44 1.44-.6l.24-.82A2.05 2.05 0 0112 2.8z" /></>,
  logout: <><path d="M14 4.5H7A2.5 2.5 0 004.5 7v10A2.5 2.5 0 007 19.5h7" /><path d="M10.5 12h10M17 8.5l3.5 3.5-3.5 3.5" /></>,
  globe: <><circle cx="12" cy="12" r="8.3" /><path d="M3.7 12h16.6M12 3.7c-4.8 4.9-4.8 11.7 0 16.6 4.8-4.9 4.8-11.7 0-16.6z" /></>,
  bookmark: <path d="M6.5 4.5h11V20L12 16.2 6.5 20z" />,
  flag: <path d="M5.5 21V4.2c4.8-2 8.2 2.2 13 .4V14c-4.8 1.8-8.2-2.4-13-.4" />,
  thumbsUp: <><path d="M7.5 11.2l4-7.2a2.6 2.6 0 012.45 3.35L13.2 10h5.05a2.25 2.25 0 012.2 2.73l-1.2 5.5A2.25 2.25 0 0117.05 20H7.5z" /><path d="M3.8 11.2h3.7V20H3.8z" /></>,
  fire: <path d="M12 21c-3.85 0-6.5-2.55-6.5-6.2 0-2.55 1.45-4.7 3.05-6.28.38 1.14 1.02 2.08 2.05 2.78C10.45 8.25 11.45 5.15 14 3c-.2 2.55.95 3.92 2.2 5.38 1.12 1.32 2.3 2.88 2.3 6.42 0 3.65-2.65 6.2-6.5 6.2z" />,
  sparkles: <><path d="M12 3.5l1.7 4.8 4.8 1.7-4.8 1.7-1.7 4.8-1.7-4.8-4.8-1.7 4.8-1.7z" /><path d="M18.5 15.5l.75 2.25 2.25.75-2.25.75-.75 2.25-.75-2.25-2.25-.75 2.25-.75zM5 16l.6 1.9 1.9.6-1.9.6L5 21l-.6-1.9-1.9-.6 1.9-.6z" /></>,
  dots: <path d="M5 12h.01M12 12h.01M19 12h.01" />,
  externalLink: <><path d="M14 4.5h5.5V10" /><path d="M19.3 4.7L11 13" /><path d="M19.5 13.5v4a2.5 2.5 0 01-2.5 2.5H7a2.5 2.5 0 01-2.5-2.5V7A2.5 2.5 0 017 4.5h4" /></>,
  shield: <path d="M12 3.5l7 2.6v5.4c0 4.5-2.9 7.6-7 9-4.1-1.4-7-4.5-7-9V6.1z" />,
  document: <><path d="M6.5 3.5h7L19 9v9a2.5 2.5 0 01-2.5 2.5h-10A2.5 2.5 0 014 18V6a2.5 2.5 0 012.5-2.5z" /><path d="M13.5 3.5V9H19" /></>,
  image: <><rect x="3.5" y="5" width="17" height="14" rx="2.5" /><circle cx="9" cy="10" r="1.6" /><path d="M3.8 17l4.7-4.5 3.5 3.2 3-3 5.2 4.8" /></>,
  video: <><rect x="3" y="6.5" width="13" height="11" rx="2.5" /><path d="M16 11l5-3v8l-5-3z" /></>,
  smile: <><circle cx="12" cy="12" r="8.3" /><path d="M8.6 14a4.4 4.4 0 006.8 0M9.2 9.6v.2M14.8 9.6v.2" /></>,
  pin: <><path d="M12 21s-6.7-5.4-6.7-10.3a6.7 6.7 0 0113.4 0C18.7 15.6 12 21 12 21z" /><circle cx="12" cy="10.5" r="2.4" /></>,
  mute: <><path d="M18 10a6 6 0 10-12 0c0 5-2 6.2-2 6.2h16S18 15 18 10z" /><path d="M10.4 19.8a1.8 1.8 0 003.2 0" /><path d="M4.5 4.5l15 15" /></>,
  forward: <><path d="M14.5 5.5L20 11l-5.5 5.5v-3.6C9 12.9 6 14.6 4 18c.4-5.4 3.7-8.9 10.5-9.3z" /></>,
  reply: <><path d="M9.5 5.5L4 11l5.5 5.5v-3.6c5.5 0 8.5 1.7 10.5 5.1-.4-5.4-3.7-8.9-10.5-9.3z" /></>,
  archive: <><rect x="3.5" y="4.5" width="17" height="5" rx="1.5" /><path d="M5 9.5V18a2 2 0 002 2h10a2 2 0 002-2V9.5M10 13h4" /></>,
  verified: <><path d="M12 2.9l2.18 1.5 2.64-.12 1.18 2.36 2.36 1.18-.12 2.64 1.5 2.18-1.5 2.18.12 2.64-2.36 1.18-1.18 2.36-2.64-.12L12 22.38l-2.18-1.5-2.64.12L6 18.64l-2.36-1.18.12-2.64-1.5-2.18 1.5-2.18-.12-2.64L6 6.64l1.18-2.36 2.64.12z" /><path d="M8.6 12.5l2.25 2.25 4.55-4.9" /></>,
} satisfies Record<string, ReactNode>;

export type TKIconName = keyof typeof paths;

export const TK_ICON_PATHS: Record<TKIconName, ReactNode> = paths;

export const TK_ICON_NAMES = Object.keys(paths) as TKIconName[];

export interface TKIconProps {
  name: TKIconName;
  size?: number;
  strokeWidth?: number;
  style?: CSSProperties;
  className?: string;
  /**
   * Render the glyph as a solid fill instead of a stroke. Intended for shape
   * glyphs (badges, dots, pins); line-only icons (chevrons, arrows) have no
   * enclosed area and render as a blob when filled. `fill-rule: evenodd` keeps
   * the inner cut-out on overlapping-subpath glyphs like `verified` (SVC-003).
   */
  filled?: boolean;
  /**
   * Accessible name. When set, the icon becomes a labelled `role="img"` (with a
   * `<title>`); without it the icon stays decorative `aria-hidden` (SVC-004).
   */
  label?: string;
  /** Rendered as `data-testid`. */
  testId?: string;
}

export function TKIcon({ name, size = 22, strokeWidth = 2, style, className, filled, label, testId }: TKIconProps) {
  const path = TK_ICON_PATHS[name];
  if (process.env.NODE_ENV !== "production" && path == null) {
    // eslint-disable-next-line no-console
    console.warn(`TKIcon: unknown icon name "${String(name)}" — rendering a placeholder (SVC-007).`);
  }
  return (
    <svg
      data-testid={testId}
      className={className}
      style={{ display: "block", flexShrink: 0, ...style }}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      fillRule={filled ? "evenodd" : undefined}
      clipRule={filled ? "evenodd" : undefined}
      stroke="currentColor"
      strokeWidth={filled ? 0 : strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? "img" : undefined}
      // Single accessible-name source: aria-label only (a <title> alongside it would
      // double-announce on some screen readers) (SVC-004).
      aria-label={label}
      aria-hidden={label ? undefined : "true"}
    >
      {/* A visible placeholder box (not an empty svg) so a typo'd name is noticeable. */}
      {path ?? <rect x="3.5" y="3.5" width="17" height="17" rx="3" />}
    </svg>
  );
}
