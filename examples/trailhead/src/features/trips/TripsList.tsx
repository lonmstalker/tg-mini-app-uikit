import { useEffect, useMemo, useState } from "react";
import {
  TKBookingCard,
  TKButton,
  TKCard,
  TKEmptyState,
  TKPage,
  TKPullToRefresh,
  TKSwipeCell,
  TKText,
  TKTitle,
  useNav,
  useTKToast,
} from "tg-mini-app-uikit";
import { useDeviceStorage } from "@tg-mini-app/telegram";
import { bookingView, type Booking } from "../../data/mockApi";
import { useLang, useT } from "../../i18n";
import { useAppDispatch, useAppState } from "../../store";
import { useGoToTab } from "../../tab-nav";
import { formatDate } from "../discover/format";
import { TripStatusPill } from "./TripStatusPill";

type BookingView = ReturnType<typeof bookingView>;

// Pull-to-refresh re-checks trip status. The kit already guards vertical
// swipes during the pull (useVerticalSwipeGuard), so it never minimizes the
// app. There is no remote source here, so we just resolve after a beat.
const refreshTrips = () => new Promise<void>((resolve) => setTimeout(resolve, 650));

const TRIPS_COACH_KEY = "th_trips_coach";

/*
 * One-time gesture onboarding for the trips list: surfaces the pull/swipe hints
 * once, then persists a "seen" flag so it never returns. Non-blocking on
 * purpose (a card, not a scrim) so the swipe it teaches stays usable right away.
 */
function TripsCoach() {
  const t = useT();
  const device = useDeviceStorage();
  const [seen, setSeen] = useState<boolean | null>(null);
  useEffect(() => {
    let alive = true;
    device
      .get(TRIPS_COACH_KEY)
      .then((v) => alive && setSeen(!!v))
      .catch(() => alive && setSeen(false));
    return () => {
      alive = false;
    };
  }, [device]);

  if (seen !== false) return null;
  const dismiss = () => {
    setSeen(true);
    void device.set(TRIPS_COACH_KEY, "1").catch(() => {});
  };
  return (
    <TKCard outlined padding={12} testId="trips-coach">
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <TKText as="div" weight={700}>
          {t("trips.coach.title")}
        </TKText>
        <TKText as="div" size="footnote" tone="secondary">
          {t("trips.coach.pull.text")}
        </TKText>
        <TKText as="div" size="footnote" tone="secondary">
          {t("trips.coach.swipe.text")}
        </TKText>
        <TKButton size="sm" variant="tonal" onClick={dismiss} testId="trips-coach-dismiss" style={{ alignSelf: "flex-start" }}>
          {t("onboarding.done")}
        </TKButton>
      </div>
    </TKCard>
  );
}

function TripBookingRow({
  booking,
  view,
  date,
  checkInLabel,
  rescheduleLabel,
  cancelLabel,
  onReschedule,
  onCancel,
  onCheckIn,
}: {
  booking: Booking;
  view: BookingView;
  date: string;
  checkInLabel: string;
  rescheduleLabel: string;
  cancelLabel: string;
  onReschedule: () => void;
  onCancel: (booking: Booking) => void;
  onCheckIn: () => void;
}) {
  const checkedIn = booking.status === "checkedIn";
  const status = useMemo(
    () => <TripStatusPill status={booking.status} testId={`trip-status-${booking.id}`} />,
    [booking.id, booking.status],
  );
  return (
    <TKSwipeCell
      testId={`trip-cell-${booking.id}`}
      // Match the booking card's radius so the swipe cell's overflow clip keeps
      // the rounded corners (and the Platform Lab roundness slider shows through).
      radius="var(--tk-r-lg)"
      // No full-swipe: the destructive Cancel must be a deliberate tap on the
      // revealed rail, never auto-fired by an over-swipe.
      fullSwipe={false}
      trailing={[
        {
          label: rescheduleLabel,
          icon: "calendar",
          tone: "orange",
          onAction: onReschedule,
        },
        {
          label: cancelLabel,
          icon: "trash",
          tone: "red",
          onAction: () => onCancel(booking),
        },
      ]}
    >
      <TKBookingCard
        testId={`trip-card-${booking.id}`}
        initials={view.emoji}
        avatarShape="rounded"
        // Same gradient thumbnail formula as the discover feed tile, so the
        // identical hike reads as one card across browse and booked.
        avatarTone={`linear-gradient(135deg, hsl(${view.hue} 55% 62%), hsl(${(view.hue + 40) % 360} 50% 48%))`}
        name={view.title}
        subtitle={view.location}
        date={date}
        time={booking.slot}
        status={status}
        actionLabel={checkedIn ? undefined : checkInLabel}
        onAction={checkedIn ? undefined : onCheckIn}
      />
    </TKSwipeCell>
  );
}

export function TripsList() {
  const t = useT();
  const { lang } = useLang();
  const nav = useNav();
  const { bookings } = useAppState();
  const dispatch = useAppDispatch();
  const toast = useTKToast();
  const goToTab = useGoToTab();

  const cancel = (booking: Booking) => {
    dispatch({ type: "REMOVE_BOOKING", id: booking.id });
    toast.show({
      text: t("trips.undo"),
      icon: "trash",
      action: t("trips.undoAction"),
      onAction: () => dispatch({ type: "ADD_BOOKING", payload: booking }),
    });
  };

  if (bookings.length === 0) {
    return (
      <TKPullToRefresh onRefresh={refreshTrips} testId="trips-refresh">
        <TKPage testId="panel-trips-list">
          <TKTitle level={1}>{t("trips.title")}</TKTitle>
          <TKEmptyState
            testId="trips-empty"
            icon="ticket"
            title={t("trips.empty.title")}
            text={t("trips.empty.text")}
            cta={t("trips.empty.cta")}
            onCta={() => goToTab("discover")}
          />
        </TKPage>
      </TKPullToRefresh>
    );
  }

  return (
    <TKPullToRefresh onRefresh={refreshTrips} testId="trips-refresh">
      <TKPage testId="panel-trips-list">
        <TKTitle level={1}>{t("trips.title")}</TKTitle>
        <TripsCoach />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {bookings.map((booking) => {
            const view = bookingView(booking.experienceId, lang);
            return (
              <TripBookingRow
                key={booking.id}
                booking={booking}
                view={view}
                date={formatDate(booking.date, lang)}
                checkInLabel={t("trips.action.checkIn")}
                rescheduleLabel={t("trips.swipe.reschedule")}
                cancelLabel={t("trips.swipe.cancel")}
                onReschedule={() => nav.push("reschedule", { id: booking.id })}
                onCancel={cancel}
                onCheckIn={() => nav.push("detail", { id: booking.id })}
              />
            );
          })}
        </div>
      </TKPage>
    </TKPullToRefresh>
  );
}
