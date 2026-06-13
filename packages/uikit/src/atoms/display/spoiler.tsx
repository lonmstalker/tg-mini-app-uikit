import type { CSSProperties, ReactNode } from "react";
import { useControllable } from "../../internal/useControllable";
import { useTKLocale } from "../../foundation/i18n";

export interface TKSpoilerProps {
  children?: ReactNode;
  revealed?: boolean;
  defaultRevealed?: boolean;
  onRevealChange?: (revealed: boolean) => void;
  testId?: string;
  style?: CSSProperties;
}

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
