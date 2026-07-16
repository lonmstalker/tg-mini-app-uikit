import {
  TKButton,
  TKCard,
  TKCell,
  TKEmptyState,
  TKIcon,
  TKListGroup,
  TKNoticeBar,
  TKPage,
  TKSpinner,
  TKText,
  TKTitle,
  useNav,
  useTKToast,
} from "tg-mini-app-uikit";
import {
  useClipboard,
  useContactRequest,
  useDownloadFile,
  useEmojiStatus,
  useShare,
  useTelegramEnvironment,
  useTelegramLinks,
  useWebApp,
  useWriteAccess,
} from "@tg-mini-app/telegram";
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

// ponytail: one shared start point for every demo hike — per-experience coords
// belong in mockApi once a real map feature needs them.
const TRAILHEAD_COORDS = "47.5162, 13.6493";
// The link the group invite shares — the bot itself.
const BOT_URL = import.meta.env.VITE_TRAILHEAD_BOT_URL ?? "https://t.me/lonmstalker_bot";
// Demo custom-emoji id for the "on the trail" status; a real client validates
// it against actual emoji, so outside the mock the set can legitimately fail.
const TRAIL_STATUS_EMOJI_ID = "5309832892262654231";

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
  const links = useTelegramLinks();
  const writeAccess = useWriteAccess();
  const contact = useContactRequest();
  const download = useDownloadFile();
  const clipboard = useClipboard();
  const emojiStatus = useEmojiStatus();
  const env = useTelegramEnvironment();
  const headerTitle = booking ? bookingView(booking.experienceId, lang).title : t("trips.title");
  const header = useMockBackHeader(headerTitle);

  // Camera + biometric check-in are mobile-client features; desktop/web (and
  // the plain-browser fallback) get a pointer to the phone instead of dead taps.
  const platform = useWebApp()?.platform;
  const mobileClient = env.inside && (platform === "ios" || platform === "android");

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

  /* Trip-prep actions: each is one native permission/API round-trip with a
   * toast on both outcomes, so a declined dialog never reads as a dead tap. */
  // Group invite via the t.me/share deep link — the one chat-picker mechanism
  // every shipping client implements. `WebApp.requestChat` is NOT usable here:
  // the 9.6 bridge script is ahead of the clients, which silently drop the
  // event and the callback never fires (wiki/device-testing.md #2).
  const inviteGroup = () => {
    const text = t("trip.prep.inviteText", { title: view.title, date: formatDate(booking.date, lang) });
    const ok = links.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(BOT_URL)}&text=${encodeURIComponent(text)}`);
    if (!ok) toast.error(t("trip.prep.declined"));
  };
  const prepRemind = async () =>
    (await writeAccess.request()) ? toast.success(t("trip.prep.remindOk")) : toast.error(t("trip.prep.declined"));
  const prepPhone = async () =>
    (await contact.request()) ? toast.success(t("trip.prep.phoneOk")) : toast.error(t("trip.prep.declined"));
  const prepGpx = async () =>
    (await download.download({ url: `${import.meta.env.BASE_URL}route.gpx`, fileName: `${booking.experienceId}.gpx` }))
      ? toast.success(t("trip.prep.gpxOk"))
      : toast.error(t("trip.prep.gpxFail"));
  const prepCoords = async () => {
    try {
      await navigator.clipboard.writeText(TRAILHEAD_COORDS);
      toast.success(t("trip.prep.coordsOk"));
    } catch {
      toast.error(t("trip.prep.coordsFail"));
    }
  };
  // QR fallback: the trailhead code can arrive in the guide's chat — paste it
  // instead of scanning and the rest of the device chain runs unchanged.
  const pasteCode = async () => {
    const text = (await clipboard.readText())?.trim();
    if (text) void checkin.run(booking.id, text);
    else toast.error(t("checkin.pasteEmpty"));
  };
  const setTrailStatus = async () =>
    (await emojiStatus.set(TRAIL_STATUS_EMOJI_ID, { duration: 6 * 3600 }))
      ? toast.success(t("trip.statusEmojiOk"))
      : toast.error(t("trip.statusEmojiFail"));

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

      {!checkedIn && !mobileClient ? (
        <TKNoticeBar tone="orange" icon={<TKIcon name="info" size={18} />} testId="checkin-desktop-notice">
          {t("checkin.desktopNotice")}
        </TKNoticeBar>
      ) : null}

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
        <TKListGroup title={t("trip.prep.title")} testId="trip-prep">
          {links.isSupported ? (
            <TKCell icon="chat" title={t("trip.prep.invite")} onClick={inviteGroup} testId="prep-invite" />
          ) : null}
          {writeAccess.isSupported ? (
            <TKCell icon="bell" title={t("trip.prep.remind")} onClick={() => void prepRemind()} testId="prep-remind" />
          ) : null}
          {contact.isSupported ? (
            <TKCell icon="phone" title={t("trip.prep.phone")} onClick={() => void prepPhone()} testId="prep-phone" />
          ) : null}
          <TKCell icon="download" title={t("trip.prep.gpx")} onClick={() => void prepGpx()} testId="prep-gpx" />
          <TKCell
            icon="copy"
            title={t("trip.prep.coords")}
            subtitle={TRAILHEAD_COORDS}
            onClick={() => void prepCoords()}
            testId="prep-coords"
          />
        </TKListGroup>
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
        <>
          <TKText tone="secondary" testId="checkin-error">
            {t("checkin.failed")}
          </TKText>
          {clipboard.isSupported ? (
            <TKButton variant="tonal" icon="copy" testId="checkin-paste" onClick={() => void pasteCode()}>
              {t("checkin.paste")}
            </TKButton>
          ) : null}
        </>
      ) : null}

      {checkedIn ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }} data-testid="checkin-done">
          <span aria-hidden style={{ fontSize: 28 }}>
            ✅
          </span>
          <TKText tone="secondary">{wasChecked ? t("checkin.already") : t("checkin.done")}</TKText>
        </div>
      ) : null}

      {checkedIn && emojiStatus.isSupported ? (
        <TKButton
          variant="tonal"
          testId="trip-emoji-status"
          loading={emojiStatus.status === "pending"}
          onClick={() => void setTrailStatus()}
        >
          {t("trip.statusEmoji")}
        </TKButton>
      ) : null}
    </TKPage>
  );
}
