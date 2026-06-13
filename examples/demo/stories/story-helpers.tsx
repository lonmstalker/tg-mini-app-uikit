import type { CSSProperties, ReactNode } from "react";

export const noop = () => undefined;

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

export function FrameStory({ children }: { children: ReactNode }) {
  return <div className="tk-story-frame">{children}</div>;
}
