import type { CSSProperties, ReactNode } from "react";

export const options = [
  { value: "one", label: "One" },
  { value: "two", label: "Two" },
  { value: "three", label: "Three", disabled: true },
];

export function Section({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div className="tk-story-section" style={style}>
      {children}
    </div>
  );
}

export function Row({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div className="tk-story-row" style={style}>
      {children}
    </div>
  );
}

export function Grid({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div className="tk-story-grid" style={style}>
      {children}
    </div>
  );
}

export function Narrow({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div className="tk-story-narrow" style={style}>
      {children}
    </div>
  );
}

/**
 * Fills the device screen as an app-shell layout (header at the top, content in
 * the middle, tab/bottom bar at the bottom). Use with `parameters: { fullBleed: true }`.
 */
export function Screen({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div className="tk-story-screen" style={style}>
      {children}
    </div>
  );
}

/**
 * Full-device app screen with a single scrollable, padded content column — the
 * default home for component showcases so they read as a real Mini App page
 * instead of a card floating mid-screen. Use with `parameters: { fullBleed: true }`.
 */
export function AppScreen({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div className="tk-story-screen">
      <div className="tk-story-screenscroll" style={style}>
        {children}
      </div>
    </div>
  );
}

/**
 * Wraps a story in a phone-shaped device mock so demos read as a real Telegram
 * Mini App: bezel, dynamic island, status bar, and a home indicator. The screen
 * grows with its content (no inner clipping), so nothing is hidden.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="tk-phone-stage">
      <div className="tk-phone" aria-hidden={false}>
        <div className="tk-phone-screen">
          <div className="tk-phone-statusbar">
            <span className="tk-phone-time">9:41</span>
            <span className="tk-phone-island" />
            <span className="tk-phone-status-icons">
              <SignalIcon />
              <WifiIcon />
              <BatteryIcon />
            </span>
          </div>
          {/* Portal root: the portaled overlays (REU-009/REU-010) must keep
              anchoring to the Mini App viewport between the status bar and the
              home indicator — exactly where the in-place overlays used to land —
              not escape to the page-level `.tk` root. */}
          <div className="tk-phone-content" data-tk-portal-root>
            {children}
          </div>
          <div className="tk-phone-home" />
        </div>
      </div>
    </div>
  );
}

function SignalIcon() {
  return (
    <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor" aria-hidden="true">
      <rect x="0" y="8" width="3" height="4" rx="1" />
      <rect x="5" y="5" width="3" height="7" rx="1" />
      <rect x="10" y="2.5" width="3" height="9.5" rx="1" />
      <rect x="15" y="0" width="3" height="12" rx="1" />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg width="17" height="12" viewBox="0 0 17 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
      <path d="M1.5 4.2C5.5 1 11.5 1 15.5 4.2" />
      <path d="M4 6.8C6.6 4.7 10.4 4.7 13 6.8" />
      <path d="M6.6 9.3C7.7 8.4 9.3 8.4 10.4 9.3" />
    </svg>
  );
}

function BatteryIcon() {
  return (
    <svg width="26" height="13" viewBox="0 0 26 13" fill="none" aria-hidden="true">
      <rect x="0.5" y="0.5" width="22" height="12" rx="3.5" stroke="currentColor" opacity="0.4" />
      <rect x="2" y="2" width="17" height="9" rx="2" fill="currentColor" />
      <rect x="24" y="4" width="2" height="5" rx="1" fill="currentColor" opacity="0.4" />
    </svg>
  );
}
