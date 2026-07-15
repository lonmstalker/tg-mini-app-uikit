import {
  TKButton,
  TKCard,
  TKEmptyState,
  TKPage,
  TKSpinner,
  TKText,
  TKTitle,
  useNav,
  useTKToast,
} from "tg-mini-app-uikit";
import { useShare } from "@tg-mini-app/telegram";
import { bookingView } from "../../data/mockApi";
import { useLang, useT } from "../../i18n";
import { useAppState } from "../../store";
import { useMockBackHeader } from "../../components/MockBackHeader";
import { PrimaryAction } from "../../components/PrimaryAction";
import { formatDate } from "../discover/format";
import { useCheckIn } from "./useCheckIn";
import { TripStatusPill } from "./TripStatusPill";

const PROGRESS: Record<string, string> = {
  scanning: "checkin.scanning",
  verifying: "checkin.verifying",
  locating: "checkin.locating",
};

export function TripDetail({ active }: { active: boolean }) {
  const t = useT();
  const { lang } = useLang();
  const nav = useNav();
  const id = (nav.params as { id?: string } | undefined)?.id ?? "";
  const { bookings } = useAppState();
  const booking = bookings.find((b) => b.id === id);
  const checkin = useCheckIn();
  const share = useShare();
  const toast = useTKToast();
  const headerTitle = booking ? bookingView(booking.experienceId, lang).title : t("trips.title");
  const header = useMockBackHeader(headerTitle);

  if (!booking) {
    return (
      <TKPage testId="panel-trips-detail" header={header}>
        <TKEmptyState icon="ticket" title={t("trips.empty.title")} text={t("trips.empty.text")} />
      </TKPage>
    );
  }

  const view = bookingView(booking.experienceId, lang);
  const justChecked = checkin.phase === "done";
  const wasChecked = booking.status === "checkedIn" && !justChecked;
  const checkedIn = justChecked || wasChecked;
  const busy = checkin.phase === "scanning" || checkin.phase === "verifying" || checkin.phase === "locating";
  const title = justChecked ? t("checkin.doneTitle") : wasChecked ? t("checkin.alreadyTitle") : t("checkin.title");

  /*
   * Share the trip as a Telegram story. `shareToStory` is the one share API a
   * Mini App can call without server support (`shareMessage` needs a
   * server-prepared message id, so it is not faked here). The media is the
   * app's own hosted story cover; the package hook falls back to
   * `navigator.share` in capable browsers and reports unsupported otherwise —
   * the control below is hidden entirely in that case.
   */
  const shareTrip = async () => {
    const mediaUrl = new URL(`${import.meta.env.BASE_URL}story-cover.png`, window.location.origin).toString();
    const ok = await share.shareToStory(mediaUrl, {
      text: `${view.title} — ${formatDate(booking.date, lang)} · ${booking.slot}`,
    });
    if (!ok) toast.error(t("trips.shareFailed"));
  };

  return (
    <TKPage
      testId="panel-trips-detail"
      header={header}
      footer={
        checkedIn ? (
          <PrimaryAction active={active} testId="checkin-back" label={t("checkin.backCta")} onClick={() => nav.pop()} />
        ) : (
          <PrimaryAction
            active={active}
            testId="checkin-cta"
            disabled={busy}
            label={t("checkin.cta")}
            onClick={() => void checkin.run(booking.id)}
          />
        )
      }
    >
      <TKTitle level={2}>{title}</TKTitle>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          aria-hidden
          style={{
            width: 56,
            height: 56,
            display: "grid",
            placeItems: "center",
            fontSize: 28,
            borderRadius: "var(--tk-r-md)",
            background: `linear-gradient(135deg, hsl(${view.hue} 55% 60%), hsl(${(view.hue + 40) % 360} 50% 46%))`,
          }}
        >
          {view.emoji}
        </div>
        <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
          <TKText as="div" weight={600}>
            {view.title}
          </TKText>
          <TKText as="div" tone="secondary" size="footnote">
            {view.location}
          </TKText>
          <TKText as="div" tone="tertiary" size="footnote">
            {t("checkout.when", { date: formatDate(booking.date, lang), slot: booking.slot })}
          </TKText>
        </div>
      </div>

      <TripStatusPill status={checkedIn ? "checkedIn" : booking.status} testId="checkin-status-badge" />

      {share.isSupported ? (
        <TKButton
          variant="tonal"
          icon="share"
          testId="trip-share"
          loading={share.status === "pending"}
          onClick={() => void shareTrip()}
        >
          {t("trips.share")}
        </TKButton>
      ) : null}

      {!checkedIn ? (
        <TKCard padding={12} testId="checkin-test-card" style={{ border: "0.5px solid var(--tk-sep)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ minWidth: 0, flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
              <TKText weight={700}>{t("checkin.test.title")}</TKText>
              <TKText tone="secondary" size="footnote">
                {t("checkin.test.text")}
              </TKText>
            </div>
            <TKButton
              size="sm"
              pill
              variant="surface"
              disabled={busy}
              onClick={() => void checkin.runDemo(booking.id)}
              testId="checkin-demo"
            >
              {t("checkin.test.cta")}
            </TKButton>
          </div>
        </TKCard>
      ) : null}

      {busy ? (
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0" }} data-testid="checkin-progress">
          <TKSpinner />
          <TKText tone="secondary">{t(PROGRESS[checkin.phase] as Parameters<typeof t>[0])}</TKText>
        </div>
      ) : null}

      {checkin.phase === "error" ? (
        <TKText tone="secondary" testId="checkin-error">
          {t("checkin.failed")}
        </TKText>
      ) : null}

      {checkedIn ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }} data-testid="checkin-done">
          <span aria-hidden style={{ fontSize: 28 }}>
            ✅
          </span>
          <TKText tone="secondary">{wasChecked ? t("checkin.already") : t("checkin.done")}</TKText>
        </div>
      ) : null}
    </TKPage>
  );
}
