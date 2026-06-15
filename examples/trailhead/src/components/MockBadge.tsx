import { useT } from "../i18n";
import { useMockHandle } from "../telegram/mock-context";

/**
 * Fixed "MOCK" badge, shown only when the app actually injected the mock
 * bridge. Production browser fallback may have no Telegram bridge, but it is
 * not a fake Telegram runtime and must not be labelled as one.
 */
export function MockBadge() {
  const t = useT();
  const mock = useMockHandle();
  if (!mock) return null;
  return (
    <div
      data-testid="mock-badge"
      role="status"
      aria-label={t("shell.mockBadgeAria")}
      style={{
        position: "fixed",
        top: "calc(var(--tk-safe-top, 0px) + 8px)",
        right: 10,
        zIndex: 9999,
        pointerEvents: "none",
        padding: "3px 8px",
        borderRadius: "var(--tk-r-pill, 999px)",
        background: "var(--tk-warn, #e8a33d)",
        color: "#1a1205",
        fontFamily: "var(--tk-font, system-ui), sans-serif",
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.06em",
        boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
      }}
    >
      {t("shell.mockBadge")}
    </div>
  );
}
