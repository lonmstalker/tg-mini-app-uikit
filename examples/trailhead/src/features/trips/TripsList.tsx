import { useMemo } from "react";
import {
  TKBookingCard,
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
        avatarTone={`hsl(${view.hue} 50% 52%)`}
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
        <TKCard padding={10} testId="trips-gesture-hints" style={{ border: "0.5px solid var(--tk-sep)" }}>
          <div style={{ display: "grid", gap: 4 }}>
            <TKText as="div" size="footnote" tone="secondary">
              {t("trips.hint.pull")}
            </TKText>
            <TKText as="div" size="footnote" tone="secondary">
              {t("trips.hint.swipe")}
            </TKText>
          </div>
        </TKCard>
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
                onReschedule={() => toast.show({ text: t("trips.rescheduleToast"), icon: "calendar" })}
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
