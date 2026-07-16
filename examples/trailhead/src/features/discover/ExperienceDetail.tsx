import { useEffect } from "react";
import {
  TKBlockquote,
  TKButton,
  TKEmptyState,
  TKGallery,
  TKPage,
  TKSkeletonList,
  TKText,
  TKTimeline,
  TKTitle,
  useNav,
  useTKToast,
} from "tg-mini-app-uikit";
import { useDataTransport, useTelegramColors, useTelegramLinks } from "@tg-mini-app/telegram";
import { getExperience, getPerson } from "../../data/mockApi";
import { useLang, useT } from "../../i18n";
import { useAppDispatch } from "../../store";
import { useMockBackHeader } from "../../components/MockBackHeader";
import { PrimaryAction } from "../../components/PrimaryAction";
import { starsLabel } from "./format";
import { useAsync } from "@tg-mini-app/async";

// The guide's public presence — the demo bot doubles as the "channel".
const GUIDE_CHANNEL_URL = import.meta.env.VITE_TRAILHEAD_BOT_URL ?? "https://t.me/lonmstalker_bot";

// `setHeaderColor` wants #rrggbb; the demo palette is hsl-based.
function hslToHex(h: number, s: number, l: number): string {
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = l / 100 - (s / 100) * Math.min(l / 100, 1 - l / 100) * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(255 * c)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <TKText size="caption" tone="tertiary" weight={600}>
        {label}
      </TKText>
      <TKText weight={600}>{value}</TKText>
    </div>
  );
}

export function ExperienceDetail({ active }: { active: boolean }) {
  const t = useT();
  const { lang } = useLang();
  const nav = useNav();
  const dispatch = useAppDispatch();
  const id = (nav.params as { id?: string } | undefined)?.id ?? "";

  const exp = useAsync(() => getExperience(lang, id), [lang, id]);
  const guide = useAsync(() => (exp.data ? getPerson(lang, exp.data.guideId) : Promise.resolve(null)), [
    lang,
    exp.data?.guideId,
  ]);
  const header = useMockBackHeader(exp.data?.title);
  const dataTransport = useDataTransport();
  const links = useTelegramLinks();
  const colors = useTelegramColors();
  const toast = useTKToast();

  // Route theming: tint the native header to the hike's palette while the
  // detail is the ACTIVE panel (nav keeps inactive panels mounted, so `active`
  // — not unmount — is the "left the screen" signal), restore on leave.
  const hue = exp.data?.hue;
  useEffect(() => {
    if (hue == null || !active) return;
    if (!colors.setHeaderColor(hslToHex(hue, 55, 45))) return;
    return () => void colors.setHeaderColor("bg_color");
    // `colors` regenerates on its own set-calls — depending on it would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hue, active]);

  if (exp.loading) {
    return (
      <TKPage testId="panel-discover-detail" header={header}>
        <TKSkeletonList rows={6} />
      </TKPage>
    );
  }
  if (exp.error || !exp.data) {
    return (
      <TKPage testId="panel-discover-detail" header={header}>
        <TKEmptyState
          icon="warning"
          tone="red"
          title={t("discover.error.title")}
          text={t("discover.error.text")}
          cta={t("discover.error.retry")}
          onCta={exp.reload}
        />
      </TKPage>
    );
  }

  const e = exp.data;
  const book = () => {
    dispatch({ type: "SET_CART", payload: { experienceId: e.id, basePriceStars: e.priceStars } });
    nav.push("datetime");
  };

  return (
    <TKPage
      testId="panel-discover-detail"
      header={header}
      footer={
        <PrimaryAction
          active={active}
          testId="detail-book"
          label={t("detail.book", { price: starsLabel(t, e.priceStars) })}
          onClick={book}
        />
      }
    >
      <TKGallery height={180} testId="detail-gallery">
        {e.gallery.map((g, i) => (
          <div
            key={i}
            style={{
              height: 180,
              borderRadius: "var(--tk-r-lg)",
              display: "grid",
              placeItems: "center",
              fontSize: 72,
              background: `linear-gradient(135deg, hsl(${e.hue} 60% 60%), hsl(${(e.hue + 40) % 360} 55% 45%))`,
            }}
          >
            <span aria-hidden>{g}</span>
          </div>
        ))}
      </TKGallery>

      <TKTitle level={1}>{e.title}</TKTitle>
      <TKText tone="secondary">{e.location}</TKText>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "4px 0" }}>
        <Stat label={t("detail.stat.distance")} value={t("unit.km", { count: e.distanceKm })} />
        <Stat label={t("detail.stat.duration")} value={t("unit.min", { count: e.durationMin })} />
        <Stat label={t("detail.stat.ascent")} value={t("unit.m", { count: e.ascentM })} />
        <Stat label={t("detail.stat.difficulty")} value={t(`detail.difficulty.${e.difficulty}` as const)} />
      </div>

      <TKTitle level={3}>{t("detail.about")}</TKTitle>
      <TKText tone="secondary">{e.summary}</TKText>

      {/* Inline-mode share: picks a chat and drops the bot query there. A bot
          without inline mode is NOT detectable upfront — the client throws at
          call time (the hook returns false), so the failure must speak. */}
      {dataTransport.isSupported ? (
        <TKButton
          variant="tonal"
          icon="send"
          testId="detail-suggest"
          onClick={() => {
            if (!dataTransport.switchInlineQuery(`trail:${e.id}`, ["users", "groups"])) {
              toast.error(t("detail.suggestFailed"));
            }
          }}
        >
          {t("detail.suggest")}
        </TKButton>
      ) : null}

      {guide.data ? (
        <>
          <TKTitle level={3}>{t("detail.guide")}</TKTitle>
          <TKBlockquote author={`${guide.data.name} · ${guide.data.role}`} icon={<span aria-hidden>{guide.data.emoji}</span>}>
            {guide.data.bio}
          </TKBlockquote>
          {links.isSupported ? (
            <TKButton
              size="sm"
              variant="plain"
              icon="externalLink"
              testId="detail-guide-channel"
              style={{ alignSelf: "flex-start" }}
              onClick={() => links.openTelegramLink(GUIDE_CHANNEL_URL)}
            >
              {t("detail.guideChannel")}
            </TKButton>
          ) : null}
        </>
      ) : null}

      <TKTitle level={3}>{t("detail.route")}</TKTitle>
      <TKTimeline
        testId="detail-route"
        steps={e.route.map((p, i) => ({
          label: p.label,
          time: p.detail,
          status: i === 0 ? "active" : "pending",
        }))}
      />
    </TKPage>
  );
}
