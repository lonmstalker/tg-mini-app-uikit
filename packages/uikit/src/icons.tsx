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
