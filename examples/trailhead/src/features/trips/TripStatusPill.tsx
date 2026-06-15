import type { BookingStatus } from "../../data/mockApi";
import { useT } from "../../i18n";

const STATUS_STYLE: Record<BookingStatus, { dot: string; bg: string; ink: string }> = {
  pending: {
    dot: "var(--tk-orange)",
    bg: "var(--tk-orange-12)",
    ink: "var(--tk-orange-ink)",
  },
  paid: {
    dot: "var(--tk-green)",
    bg: "var(--tk-surface-2)",
    ink: "var(--tk-text-2)",
  },
  checkedIn: {
    dot: "var(--tk-green)",
    bg: "var(--tk-green-12)",
    ink: "var(--tk-green-ink)",
  },
};

export function TripStatusPill({ status, testId }: { status: BookingStatus; testId?: string }) {
  const t = useT();
  const style = STATUS_STYLE[status];
  return (
    <span
      data-testid={testId}
      style={{
        display: "inline-flex",
        alignItems: "center",
        alignSelf: "flex-start",
        gap: 6,
        minHeight: 24,
        maxWidth: "100%",
        padding: "3px 8px",
        borderRadius: 999,
        background: style.bg,
        color: style.ink,
        boxShadow: "inset 0 0 0 0.5px var(--tk-sep)",
        fontSize: "var(--tk-fz-caption)",
        fontWeight: 700,
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
    >
      <span
        aria-hidden
        style={{
          width: 6,
          height: 6,
          flexShrink: 0,
          borderRadius: 999,
          background: style.dot,
          boxShadow: "0 0 0 2px color-mix(in srgb, currentColor 8%, transparent)",
        }}
      />
      <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{t(`trips.status.${status}` as const)}</span>
    </span>
  );
}
