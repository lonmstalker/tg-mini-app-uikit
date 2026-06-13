import { type ReactNode } from "react";
import { TKButton } from "../../atoms/buttons";
import { TKIcon, type TKIconName } from "../../atoms/icons";

/* ---------------- Empty / error states ---------------- */

export interface TKEmptyStateProps {
  icon?: TKIconName;
  /** Custom illustration (Lottie, img ...) shown instead of the icon circle. */
  media?: ReactNode;
  title?: ReactNode;
  text?: ReactNode;
  cta?: ReactNode;
  onCta?: () => void;
  tone?: "accent" | "red";
  testId?: string;
}

export function TKEmptyState({ icon = "cart", media, title, text, cta, onCta, tone = "accent", testId }: TKEmptyStateProps) {
  const color = tone === "red" ? "var(--tk-red)" : "var(--tk-accent)";
  const bg = tone === "red" ? "var(--tk-red-12)" : "var(--tk-accent-12)";
  return (
    <div
      data-testid={testId}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 6,
        padding: "10px 12px",
      }}
    >
      {media ?? (
        <div
          style={{
            width: 68,
            height: 68,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: bg,
            color,
            marginBottom: 6,
          }}
        >
          <TKIcon name={icon} size={30} />
        </div>
      )}
      <div style={{ fontSize: "var(--tk-fz-title3)", fontWeight: 700 }}>{title}</div>
      {text ? (
        <div style={{ fontSize: "var(--tk-fz-sub)", color: "var(--tk-text-2)", maxWidth: 240 }}>{text}</div>
      ) : null}
      {cta ? (
        <div style={{ marginTop: 10 }}>
          <TKButton variant={tone === "red" ? "destructive" : "tonal"} pill size="sm" onClick={onCta}>
            {cta}
          </TKButton>
        </div>
      ) : null}
    </div>
  );
}
