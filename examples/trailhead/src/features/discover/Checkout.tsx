import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  TKButton,
  TKCard,
  TKConfetti,
  TKEmptyState,
  TKPage,
  TKPaymentSummary,
  TKPinInput,
  TKSheet,
  TKSpinner,
  TKText,
  TKTitle,
  useBiometrics,
  useClosingConfirmation,
  useInvoice,
  useNav,
  useOptionalHaptics,
  useTKToast,
  getTelegramWebApp,
  type TKSheetHandle,
} from "tg-mini-app-uikit";
import { bookingView, type Booking } from "../../data/mockApi";
import { checkoutLineItems, computeCheckout, type Checkout as CheckoutTotals } from "../../data/pricing";
import { useLang, useT } from "../../i18n";
import { useAppDispatch, useAppState } from "../../store";
import { useGoToTab } from "../../tab-nav";
import { useMockBackHeader } from "../../components/MockBackHeader";
import { PrimaryAction } from "../../components/PrimaryAction";
import { useMockHandle } from "../../telegram/mock-context";
import { authenticateWithBiometrics } from "../../telegram/biometric-auth";
import { formatDate, starsLabel } from "./format";

type Phase = "idle" | "confirm" | "pin" | "paying" | "error" | "done";

/** Everything the payment flow needs, captured at pay-time so the cart can be
 *  reset on success without the in-flight UI flashing empty values. */
interface PaySnapshot {
  experienceId: string;
  title: string;
  date: string;
  slot: string;
  checkout: CheckoutTotals;
}

export function Checkout({ active }: { active: boolean }) {
  const t = useT();
  const { lang } = useLang();
  const nav = useNav();
  const { cart, wallet, pin } = useAppState();
  const dispatch = useAppDispatch();
  const toast = useTKToast();
  const biometrics = useBiometrics();
  const invoice = useInvoice();
  const haptics = useOptionalHaptics();
  const goToTab = useGoToTab();
  const header = useMockBackHeader(t("checkout.title"));
  const mock = useMockHandle();

  const [phase, setPhase] = useState<Phase>("idle");
  const [pinError, setPinError] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [snap, setSnap] = useState<PaySnapshot | null>(null);
  const sheetRef = useRef<TKSheetHandle>(null);
  // Synchronous re-entry latch: state updates are async, so a double biometric
  // tap (or the biometric+PIN cross-path) could otherwise both pass through
  // `settle` and book twice. A ref blocks the second caller immediately.
  const paying = useRef(false);
  // `?failpay=1` fakes a cancelled first payment so the error/retry state is
  // demonstrable; the retry then succeeds.
  const failNext = useRef(
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("failpay") === "1",
  );

  // Declarative: warn before closing the app while the success state is up.
  useClosingConfirmation(phase === "done");

  const liveCheckout = computeCheckout(cart.basePriceStars ?? 0, wallet.trailPassActive);
  const liveView = cart.experienceId ? bookingView(cart.experienceId, lang) : null;
  const ready = Boolean(cart.experienceId && cart.date && cart.slot);

  // Idle page shows the live cart; the in-flight sheet shows the snapshot.
  const show = phase === "idle" || !snap
    ? { title: liveView?.title ?? "", date: cart.date, slot: cart.slot, checkout: liveCheckout }
    : { title: snap.title, date: snap.date, slot: snap.slot, checkout: snap.checkout };

  const rows = [
    ...checkoutLineItems(show.title, show.checkout).map((li) => ({
      label: t(li.labelKey as Parameters<typeof t>[0], li.vars),
      value: starsLabel(t, li.stars),
      accent: li.stars < 0,
    })),
    { label: t("checkout.total"), value: starsLabel(t, show.checkout.total), total: true },
  ];

  const startPay = () => {
    if (!cart.experienceId || !cart.date || !cart.slot) return;
    setSnap({
      experienceId: cart.experienceId,
      title: liveView?.title ?? "",
      date: cart.date,
      slot: cart.slot,
      checkout: liveCheckout,
    });
    haptics.selection();
    setPhase("confirm");
  };

  const completeBooking = (snapshot: PaySnapshot) => {
    const booking: Booking = {
      // Stable id (experience+date+slot) so the reducer's id de-dupe is a
      // real second line of defense against a double submit.
      id: `bk-${snapshot.experienceId}-${snapshot.date}-${snapshot.slot}`,
      experienceId: snapshot.experienceId,
      date: snapshot.date,
      slot: snapshot.slot,
      status: "paid",
      priceStars: snapshot.checkout.total,
    };
    dispatch({ type: "ADD_BOOKING", payload: booking });
    dispatch({ type: "RESET_CART" });
    setConfetti(true);
    haptics.notification("success");
    toast.success(t("checkout.successToast"));
    setPhase("done");
  };

  const openStarsInvoice = async (snapshot: PaySnapshot) => {
    if (mock) {
      return invoice.open(`https://t.me/$trailhead-${snapshot.experienceId}-${snapshot.checkout.total}`);
    }
    const response = await fetch("/api/trailhead/invoice", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(getTelegramWebApp()?.initData ? { authorization: `tma ${getTelegramWebApp()?.initData}` } : {}),
      },
      body: JSON.stringify({
        experienceId: snapshot.experienceId,
        title: snapshot.title,
        date: snapshot.date,
        slot: snapshot.slot,
        totalStars: snapshot.checkout.total,
      }),
    });
    if (!response.ok) return "failed";
    const data = (await response.json()) as { invoiceUrl?: string };
    if (!data.invoiceUrl) return "failed";
    return invoice.open(data.invoiceUrl);
  };

  const settle = async () => {
    if (!snap || paying.current) return;
    paying.current = true;
    setPhase("paying");
    haptics.impact("medium");
    try {
      let status = await openStarsInvoice(snap);
      if (failNext.current) {
        failNext.current = false; // only the first attempt fails
        status = "cancelled";
      }
      if (status === "paid") {
        completeBooking(snap);
      } else {
        haptics.notification("error");
        setPhase("error");
      }
    } finally {
      paying.current = false;
    }
  };

  const onPinComplete = (entered: string) => {
    if (!pin) {
      dispatch({ type: "SET_PIN", pin: entered });
      void settle();
      return;
    }
    if (entered === pin) {
      void settle();
    } else {
      setPinError(true);
      haptics.notification("error");
      window.setTimeout(() => setPinError(false), 600);
    }
  };

  const onBiometric = async () => {
    if (await authenticateWithBiometrics(biometrics, t("checkout.pinTitle"))) void settle();
  };

  const completeDemoPayment = () => {
    if (!snap || paying.current) return;
    completeBooking(snap);
  };

  const closeSheet = () => {
    if (phase === "paying") return; // don't interrupt the invoice round-trip
    if (phase === "done") {
      finishToTrips();
      return;
    }
    setPhase("idle");
  };

  const finishToTrips = () => {
    setConfetti(false);
    setPhase("idle");
    nav.popTo("feed"); // unwind the funnel so Discover isn't left on a dead summary
    goToTab("trips");
  };

  const sheetOpen = phase !== "idle";

  useEffect(() => {
    if (!sheetOpen) return;
    sheetRef.current?.snapTo(phase === "pin" ? 1 : 0);
  }, [phase, sheetOpen]);

  const pinTitle = (headline: string): ReactNode => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <TKText as="div" weight={700}>
        {headline}
      </TKText>
      <TKText as="div" size="footnote" tone="secondary">
        {t(pin ? "checkout.pinHelp" : "checkout.pinSetHelp")}
      </TKText>
    </div>
  );

  if (!ready && phase === "idle") {
    return (
      <TKPage testId="panel-discover-summary" header={header} gap={10}>
        <TKTitle level={2}>{t("checkout.title")}</TKTitle>
        <TKEmptyState
          testId="checkout-empty"
          icon="ticket"
          title={t("checkout.empty.title")}
          text={t("checkout.empty.text")}
          cta={t("checkout.empty.cta")}
          onCta={finishToTrips}
        />
      </TKPage>
    );
  }

  return (
    <TKPage
      testId="panel-discover-summary"
      header={header}
      gap={10}
      footer={
        <PrimaryAction
          active={active && !sheetOpen}
          testId="summary-pay"
          disabled={!ready}
          label={t("checkout.pay", { price: starsLabel(t, liveCheckout.total) })}
          onClick={startPay}
        />
      }
    >
      <TKTitle level={2}>{t("checkout.title")}</TKTitle>
      {liveView ? (
        <>
          <TKText weight={600}>{liveView.title}</TKText>
          {cart.date && cart.slot ? (
            <TKText tone="secondary">{t("checkout.when", { date: formatDate(cart.date, lang), slot: cart.slot })}</TKText>
          ) : null}
        </>
      ) : null}

      <TKPaymentSummary testId="summary-rows" rows={rows} />

      <TKSheet
        open={sheetOpen}
        onClose={closeSheet}
        snapPoints={[0.55, 0.92]}
        sheetRef={sheetRef}
        title={phase === "done" ? t("checkout.successTitle") : t("checkout.confirmTitle")}
        testId="checkout-sheet"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingBottom: "calc(var(--tk-safe-bottom, 0px) + 8px)" }}>
          {phase === "confirm" ? (
            <>
              <TKText tone="secondary">
                {t("checkout.confirmBody", {
                  title: show.title,
                  date: show.date ? formatDate(show.date, lang) : "",
                  slot: show.slot ?? "",
                })}
              </TKText>
              <TKCard padding={12} testId="checkout-safety" style={{ border: "0.5px solid var(--tk-sep)" }}>
                <TKText as="div" weight={700}>
                  {t("checkout.safety.title")}
                </TKText>
                <TKText as="div" tone="secondary" size="footnote" style={{ marginTop: 4 }}>
                  {t("checkout.safety.text")}
                </TKText>
              </TKCard>
              <TKPaymentSummary rows={rows} />
              <TKButton full testId="confirm-pay" onClick={() => setPhase("pin")}>
                {t("checkout.confirmCta")}
              </TKButton>
            </>
          ) : null}

          {phase === "pin" ? (
            <TKPinInput
              testId="checkout-pin"
              length={4}
              maxLength={8}
              title={pinTitle(pin ? t("checkout.pinTitle") : t("checkout.pinSetTitle"))}
              error={pinError}
              onBiometricRequest={() => void onBiometric()}
              onComplete={onPinComplete}
            />
          ) : null}

          {phase === "paying" ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 0" }} data-testid="checkout-paying">
              <TKSpinner />
              <TKText tone="secondary">{t("checkout.paying")}</TKText>
            </div>
          ) : null}

          {phase === "error" ? (
            <>
              <TKText tone="secondary" testId="checkout-error">
                {t("checkout.payError")}
              </TKText>
              <TKButton full testId="checkout-retry" onClick={() => setPhase("pin")}>
                {t("checkout.retry")}
              </TKButton>
              {snap ? (
                <TKButton full variant="tonal" testId="checkout-demo-paid" onClick={completeDemoPayment}>
                  {t("checkout.demoPaidCta")}
                </TKButton>
              ) : null}
            </>
          ) : null}

          {phase === "done" ? (
            <>
              <div aria-hidden style={{ fontSize: 48, textAlign: "center" }}>
                🎉
              </div>
              <TKText align="center" tone="secondary" testId="checkout-success">
                {t("checkout.successToast")}
              </TKText>
              <TKButton full testId="checkout-view-trips" onClick={finishToTrips}>
                {t("checkout.successCta")}
              </TKButton>
            </>
          ) : null}
        </div>
      </TKSheet>

      {confetti ? <TKConfetti onDone={() => setConfetti(false)} /> : null}
    </TKPage>
  );
}
