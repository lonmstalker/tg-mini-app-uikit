import { useEffect, useMemo } from "react";
import {
  TKCalendar,
  TKCard,
  TKEmptyState,
  TKPage,
  TKSkeletonList,
  TKSlotPicker,
  TKText,
  TKTitle,
  useOptionalHaptics,
  useNav,
} from "tg-mini-app-uikit";
import { getExperience } from "../../data/mockApi";
import { useLang, useT } from "../../i18n";
import { computeCheckout } from "../../data/pricing";
import { useAppDispatch, useAppState } from "../../store";
import { useMockBackHeader } from "../../components/MockBackHeader";
import { PrimaryAction } from "../../components/PrimaryAction";
import { formatDate, starsLabel, toIsoDate } from "./format";
import { useAsync } from "./useAsync";

function defaultDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return toIsoDate(d);
}

export function DateSlot({ active }: { active: boolean }) {
  const t = useT();
  const { lang } = useLang();
  const nav = useNav();
  const haptics = useOptionalHaptics();
  const { cart, wallet } = useAppState();
  const dispatch = useAppDispatch();
  const header = useMockBackHeader(t("datetime.title"));

  const exp = useAsync(
    () => (cart.experienceId ? getExperience(lang, cart.experienceId) : Promise.reject(new Error("no cart"))),
    [lang, cart.experienceId],
  );

  // Seed the cart with a sensible default date so "Continue" depends only on
  // picking a time — the user can still change the date on the calendar.
  useEffect(() => {
    if (!cart.date) dispatch({ type: "SET_CART", payload: { date: defaultDate() } });
  }, [cart.date, dispatch]);

  const selectedDate = cart.date ?? defaultDate();
  const calendarValue = useMemo(() => new Date(`${selectedDate}T00:00:00`), [selectedDate]);
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  if (exp.loading) {
    return (
      <TKPage testId="panel-discover-datetime" header={header}>
        <TKSkeletonList rows={5} />
      </TKPage>
    );
  }
  if (exp.error || !exp.data) {
    return (
      <TKPage testId="panel-discover-datetime" header={header}>
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
  const slots = e.slots.map((s) => s.time);
  const busy = e.slots.reduce<string[]>((acc, slot) => {
    if (slot.soldOut) acc.push(slot.time);
    return acc;
  }, []);
  const total = computeCheckout(e.priceStars, wallet.trailPassActive).total;
  const canContinue = Boolean(cart.date && cart.slot && !busy.includes(cart.slot));

  const slotDay = {
    label: formatDate(selectedDate, lang).split(",")[0],
    date: new Date(`${selectedDate}T00:00:00`).getDate(),
  };

  return (
    <TKPage
      testId="panel-discover-datetime"
      header={header}
      gap={10}
      footer={
        <PrimaryAction
          active={active}
          testId="datetime-continue"
          disabled={!canContinue}
          label={canContinue ? t("datetime.continue", { price: starsLabel(t, total) }) : t("datetime.pickSlot")}
          onClick={() => {
            if (canContinue) nav.push("summary");
          }}
        />
      }
    >
      <TKTitle level={2}>{t("datetime.title")}</TKTitle>
      <TKCard testId="datetime-summary" padding={12} style={{ border: "0.5px solid var(--tk-sep)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            aria-hidden
            style={{
              width: 48,
              height: 48,
              flexShrink: 0,
              display: "grid",
              placeItems: "center",
              fontSize: 24,
              borderRadius: "var(--tk-r-md)",
              background: `linear-gradient(135deg, hsl(${e.hue} 52% 62%), hsl(${(e.hue + 40) % 360} 48% 48%))`,
            }}
          >
            {e.emoji}
          </div>
          <div style={{ minWidth: 0, flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            <TKText as="div" weight={600} truncate>
              {e.title}
            </TKText>
            <TKText as="div" tone="secondary" size="footnote" truncate>
              {e.location}
            </TKText>
          </div>
          <TKText weight={700} tone="accent" size="sub" style={{ whiteSpace: "nowrap" }}>
            {starsLabel(t, total)}
          </TKText>
        </div>
      </TKCard>
      <TKCalendar
        testId="datetime-calendar"
        value={calendarValue}
        min={today}
        disabledDates={(d) => d < today}
        onChange={(d) => {
          haptics.selection();
          dispatch({ type: "SET_CART", payload: { date: toIsoDate(d), slot: undefined } });
        }}
        lang={lang}
        partSelectors={false}
        style={{ padding: 8 }}
      />

      <TKTitle level={3}>{t("datetime.slotTitle")}</TKTitle>
      <TKSlotPicker
        testId="datetime-slots"
        days={[slotDay]}
        slots={slots}
        busy={busy}
        slot={cart.slot}
        onSlotChange={(slot) => {
          haptics.selection();
          dispatch({ type: "SET_CART", payload: { slot } });
        }}
      />
      {!cart.slot ? (
        <TKText tone="tertiary" size="footnote">
          {t("datetime.pickSlot")}
        </TKText>
      ) : null}
    </TKPage>
  );
}
