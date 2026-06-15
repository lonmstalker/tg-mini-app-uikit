import { useMemo, useState } from "react";
import {
  TKCalendar,
  TKEmptyState,
  TKPage,
  TKSkeletonList,
  TKSlotPicker,
  TKText,
  TKTitle,
  useNav,
  useOptionalHaptics,
  useTKToast,
} from "tg-mini-app-uikit";
import { getExperience } from "../../data/mockApi";
import { useLang, useT } from "../../i18n";
import { useAppDispatch, useAppState } from "../../store";
import { useMockBackHeader } from "../../components/MockBackHeader";
import { PrimaryAction } from "../../components/PrimaryAction";
import { formatDate, toIsoDate } from "../discover/format";
import { useAsync } from "@tg-mini-app/async";

/**
 * Reschedule a booked trip: pick a new date/slot and write it straight back to
 * the booking (`UPDATE_BOOKING`). Unlike the Discover funnel's `DateSlot`, this
 * never touches the cart or re-runs payment — the trip is already paid for.
 */
export function RescheduleSlot({ active }: { active: boolean }) {
  const t = useT();
  const { lang } = useLang();
  const nav = useNav();
  const haptics = useOptionalHaptics();
  const toast = useTKToast();
  const dispatch = useAppDispatch();
  const { bookings } = useAppState();
  const id = (nav.params as { id?: string } | undefined)?.id ?? "";
  const booking = bookings.find((b) => b.id === id);
  const header = useMockBackHeader(t("reschedule.title"));

  const exp = useAsync(
    () => (booking ? getExperience(lang, booking.experienceId) : Promise.reject(new Error("no booking"))),
    [lang, booking?.experienceId],
  );

  const [date, setDate] = useState(booking?.date ?? "");
  const [slot, setSlot] = useState<string | undefined>(booking?.slot);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  if (!booking) {
    return (
      <TKPage testId="panel-trips-reschedule" header={header}>
        <TKEmptyState icon="ticket" title={t("trips.empty.title")} text={t("trips.empty.text")} />
      </TKPage>
    );
  }
  if (exp.loading) {
    return (
      <TKPage testId="panel-trips-reschedule" header={header}>
        <TKSkeletonList rows={5} />
      </TKPage>
    );
  }
  if (exp.error || !exp.data) {
    return (
      <TKPage testId="panel-trips-reschedule" header={header}>
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
  const busy = e.slots.filter((s) => s.soldOut).map((s) => s.time);
  const selectedDate = date || booking.date;
  const calendarValue = new Date(`${selectedDate}T00:00:00`);
  // Enable confirm only on a real change to a free slot.
  const canConfirm = Boolean(date && slot && !busy.includes(slot) && (date !== booking.date || slot !== booking.slot));
  const slotDay = {
    label: formatDate(selectedDate, lang).split(",")[0],
    date: new Date(`${selectedDate}T00:00:00`).getDate(),
  };

  const confirm = () => {
    if (!canConfirm) return;
    dispatch({ type: "UPDATE_BOOKING", id: booking.id, payload: { date, slot } });
    haptics.notification("success");
    toast.success(t("reschedule.done"));
    nav.pop();
  };

  return (
    <TKPage
      testId="panel-trips-reschedule"
      header={header}
      gap={10}
      footer={
        <PrimaryAction
          active={active}
          testId="reschedule-confirm"
          disabled={!canConfirm}
          label={t("reschedule.confirm")}
          onClick={confirm}
        />
      }
    >
      <TKTitle level={2}>{t("reschedule.title")}</TKTitle>
      <TKText tone="secondary" size="footnote">
        {t("reschedule.subtitle", { title: e.title })}
      </TKText>
      <TKCalendar
        testId="reschedule-calendar"
        value={calendarValue}
        min={today}
        disabledDates={(d) => d < today}
        onChange={(d) => {
          haptics.selection();
          setDate(toIsoDate(d));
          setSlot(undefined);
        }}
        lang={lang}
        partSelectors={false}
        style={{ padding: 8 }}
      />
      <TKTitle level={3}>{t("datetime.slotTitle")}</TKTitle>
      <TKSlotPicker
        testId="reschedule-slots"
        days={[slotDay]}
        slots={slots}
        busy={busy}
        slot={slot}
        onSlotChange={(s) => {
          haptics.selection();
          setSlot(s);
        }}
      />
    </TKPage>
  );
}
