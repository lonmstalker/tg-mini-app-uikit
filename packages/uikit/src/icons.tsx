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
  star: <path d="M12 3.8l2.4 5 5.5.7-4 3.8 1 5.4L12 16l-4.9 2.7 1-5.4-4-3.8 5.5-.7z" />,
  heart: <path d="M12 20.2S4.9 15.9 3.1 11.5C1.9 8.7 3.8 5.6 7 5.6c2 0 3.3 1.1 5 3.1 1.7-2 3-3.1 5-3.1 3.2 0 5.1 3.1 3.9 5.9-1.8 4.4-8.9 8.7-8.9 8.7z" />,
  bell: <><path d="M18 10a6 6 0 10-12 0c0 5-2 6.2-2 6.2h16S18 15 18 10z" /><path d="M10.4 19.8a1.8 1.8 0 003.2 0" /></>,
  cart: <><circle cx="9.5" cy="19.7" r="1.2" /><circle cx="17.5" cy="19.7" r="1.2" /><path d="M3.5 4.5h2l2.4 11h10.3l2.3-8H7" /></>,
  tune: <><path d="M4 7.5h8M18 7.5h2" /><circle cx="15" cy="7.5" r="2.4" /><path d="M4 16.5h2M12 16.5h8" /><circle cx="9" cy="16.5" r="2.4" /></>,
  user: <><circle cx="12" cy="8" r="3.8" /><path d="M4.5 20.5c.6-3.6 3.7-5.4 7.5-5.4s6.9 1.8 7.5 5.4" /></>,
  home: <path d="M5 10.7L12 4.4l7 6.3v9.3h-4.8v-4.9H9.8V20H5z" />,
  calendar: <><rect x="4" y="5.5" width="16" height="15" rx="2.5" /><path d="M4 10.2h16M8.3 3.2v4M15.7 3.2v4" /></>,
  wallet: <><rect x="3.2" y="6" width="17.6" height="13" rx="3" /><path d="M15.5 12.5h2" /></>,
  arrowRight: <path d="M4.5 12h14M12.5 6l6 6-6 6" />,
  bolt: <path d="M13 2.5L5.5 13H11l-1 8.5L17.5 11H12z" />,
  moon: <path d="M20 14.2A8.2 8.2 0 119.8 4 6.6 6.6 0 0020 14.2z" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4" /></>,
  gift: <><rect x="4" y="9" width="16" height="11.5" rx="2" /><path d="M12 6.5v14M4 13h16M12 6.5c-1.6 0-4.4-.4-4.4-2.3 0-2.1 3.1-2 4.4 2.3zm0 0c1.6 0 4.4-.4 4.4-2.3 0-2.1-3.1-2-4.4 2.3z" /></>,
  ticket: <><path d="M4 8a2 2 0 012-2h12a2 2 0 012 2v2.2a1.8 1.8 0 000 3.6V16a2 2 0 01-2 2H6a2 2 0 01-2-2v-2.2a1.8 1.8 0 000-3.6z" /><path d="M13.5 6v2.2M13.5 11v2M13.5 15.8V18" /></>,
  trash: <path d="M5 7h14M9.5 7V5h5v2M7 7l.8 13h8.4L17 7M10 11v5M14 11v5" />,
  share: <><path d="M12 14.5V4M8.5 7L12 3.6 15.5 7" /><path d="M6.5 11H6a2 2 0 00-2 2v5.5a2 2 0 002 2h12a2 2 0 002-2V13a2 2 0 00-2-2h-.5" /></>,
  location: <><path d="M12 21s-6.7-5.4-6.7-10.3a6.7 6.7 0 0113.4 0C18.7 15.6 12 21 12 21z" /><circle cx="12" cy="10.5" r="2.4" /></>,
  clock: <><circle cx="12" cy="12" r="8.3" /><path d="M12 7.5V12l3.2 2" /></>,
  card: <><rect x="3" y="5.5" width="18" height="13.5" rx="2.5" /><path d="M3 10h18" /></>,
  chat: <path d="M21 11.8a8.4 8.4 0 01-12.3 7.4L4 20.5l1.4-4.4A8.4 8.4 0 1121 11.8z" />,
  grid: <><rect x="4" y="4" width="7" height="7" rx="2" /><rect x="13" y="4" width="7" height="7" rx="2" /><rect x="4" y="13" width="7" height="7" rx="2" /><rect x="13" y="13" width="7" height="7" rx="2" /></>,
  eye: <><path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="3" /></>,
  eyeOff: <><path d="M4 4l16 16" /><path d="M9.9 5.1A9.8 9.8 0 0112 5.8c6 0 9.5 6.2 9.5 6.2a17 17 0 01-3.3 3.9M6 6.7A16.6 16.6 0 002.5 12S6 18.2 12 18.2c1.2 0 2.3-.2 3.3-.6" /><path d="M10 10.2a3 3 0 004 4.1" /></>,
  backspace: <><path d="M8.5 5h10A2.5 2.5 0 0121 7.5v9a2.5 2.5 0 01-2.5 2.5h-10L3 12z" /><path d="M11 9.5l5 5M16 9.5l-5 5" /></>,
  fingerprint: <><path d="M7.5 19.6c-1.2-2-1.9-4-1.9-6.6a6.4 6.4 0 0110.2-5.2" /><path d="M18 9.5c.4.9.6 2 .6 3.5 0 1.3-.1 2.5-.4 3.6" /><path d="M12 9.7a3.3 3.3 0 00-3.3 3.3c0 2.4.6 4.3 1.6 6" /><path d="M15.3 13c0 3-.4 5.2-1.3 7" /><path d="M12 13.1c0 2.9-.4 5.1-1.2 6.9" /></>,
  copy: <><rect x="9" y="9" width="11" height="11" rx="2.5" /><path d="M5.5 14.5A2.5 2.5 0 014 12.2V6.5A2.5 2.5 0 016.5 4h5.7a2.5 2.5 0 012.3 1.5" /></>,
  qr: <><rect x="4" y="4" width="6.5" height="6.5" rx="1.5" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" /><path d="M13.5 13.5h2.8v2.8h-2.8zM17.2 17.2H20V20h-2.8z" /></>,
  send: <path d="M21 3.5L10.2 14.3M21 3.5l-6.8 17-3.9-6.9L3.4 9.7z" />,
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
  settings: <><circle cx="12" cy="12" r="3" /><path d="M12 3.5l1 2.4a6.3 6.3 0 012.2 1.3l2.6-.6 1.5 2.6-1.7 2a6.6 6.6 0 010 2.6l1.7 2-1.5 2.6-2.6-.6a6.3 6.3 0 01-2.2 1.3l-1 2.4-3-.001-1-2.4a6.3 6.3 0 01-2.2-1.3l-2.6.6-1.5-2.6 1.7-2a6.6 6.6 0 010-2.6l-1.7-2 1.5-2.6 2.6.6A6.3 6.3 0 0110 5.9l1-2.4z" /></>,
  logout: <><path d="M14 4.5H7A2.5 2.5 0 004.5 7v10A2.5 2.5 0 007 19.5h7" /><path d="M10.5 12h10M17 8.5l3.5 3.5-3.5 3.5" /></>,
  globe: <><circle cx="12" cy="12" r="8.3" /><path d="M3.7 12h16.6M12 3.7c-4.8 4.9-4.8 11.7 0 16.6 4.8-4.9 4.8-11.7 0-16.6z" /></>,
  bookmark: <path d="M6.5 4.5h11V20L12 16.2 6.5 20z" />,
  flag: <path d="M5.5 21V4.2c4.8-2 8.2 2.2 13 .4V14c-4.8 1.8-8.2-2.4-13-.4" />,
  thumbsUp: <><path d="M7.5 11l4-7c1.6 0 2.7 1.3 2.4 2.9L13.4 10h4.8a2 2 0 012 2.4l-1.2 5.7a2.5 2.5 0 01-2.4 2H7.5z" /><path d="M7.5 11H4v9h3.5" /></>,
  fire: <path d="M12 21c-3.9 0-6.5-2.4-6.5-6 0-2.5 1.6-4.6 2.9-6 .4 1 1 1.8 2 2.4C10.3 8.6 11 5.4 13.6 3c-.3 2.7 1 4 2.4 5.7 1.2 1.4 2.5 3 2.5 6.3 0 3.6-2.6 6-6.5 6z" />,
  sparkles: <><path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6z" /><path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8zM5 16.5l.6 1.7 1.7.6-1.7.6L5 21l-.6-1.6-1.7-.6 1.7-.6z" /></>,
  dots: <path d="M5.2 12h.2M11.9 12h.2M18.6 12h.2" />,
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
  verified: <><path d="M12 3l2.2 1.6 2.7-.2 1 2.5 2.5 1-.2 2.7L21.8 13l-1.6 2.2.2 2.7-2.5 1-1 2.5-2.7-.2L12 22.6l-2.2-1.4-2.7.2-1-2.5-2.5-1 .2-2.7L2.2 13l1.6-2.2-.2-2.7 2.5-1 1-2.5 2.7.2z" /><path d="M8.8 12.4l2.2 2.2 4.2-4.4" /></>,
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
  filled?: boolean;
  /** Rendered as `data-testid`. */
  testId?: string;
}

export function TKIcon({ name, size = 22, strokeWidth = 2, style, className, filled, testId }: TKIconProps) {
  return (
    <svg
      data-testid={testId}
      className={className}
      style={style}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {TK_ICON_PATHS[name] ?? null}
    </svg>
  );
}
