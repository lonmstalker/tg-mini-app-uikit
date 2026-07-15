import { useRef, useState } from "react";
import {
  TKBadge,
  TKButton,
  TKCard,
  TKCardCell,
  TKConfetti,
  TKGallery,
  TKIcon,
  TKIconButton,
  TKPinInput,
  TKProvider,
  TKSheet,
  useTKLocale,
  useTKToast,
  type TKTheme,
} from "tg-mini-app-uikit";
import { copyText } from "../shared/clipboard";
import { useSiteLocale } from "../shared/i18n";
import { formatSiteString } from "../shared/strings";
import { SectionTitle } from "../shared/layout";
import { SCENARIO_CYCLE_MS, useScenario } from "./useScenario";

const INSTALL_COMMAND = "npm i tg-mini-app-uikit";

interface WalletCard {
  id: "everyday" | "travel" | "reserve";
  digits: string;
  tone: "accent" | "surface" | "green";
}

const walletCards: WalletCard[] = [
  { id: "everyday", digits: "4821", tone: "accent" },
  { id: "travel", digits: "1068", tone: "surface" },
  { id: "reserve", digits: "7349", tone: "green" },
];

export function Hero({ theme }: { theme: TKTheme }) {
  const toast = useTKToast();
  const { strings } = useSiteLocale();
  const copy = strings.demo.hero;
  const base = import.meta.env.BASE_URL;

  const onCopy = async () => {
    if (await copyText(INSTALL_COMMAND)) toast.success(copy.installCopied);
    else toast.error(copy.installCopyError);
  };

  return (
    <div className="hero-grid">
      <div className="hero-copy">
        <SectionTitle
          as="h1"
          className="hero-title"
          id="hero-title"
          aria-label={copy.title}
        >
          <span aria-hidden="true" className="hero-title-line tk-rise" style={{ animationDelay: "0ms" }}>
            {copy.line1}
          </span>
          <span aria-hidden="true" className="hero-title-line tk-rise" style={{ animationDelay: "60ms" }}>
            {copy.line2}
          </span>
          <span aria-hidden="true" className="hero-title-line tk-rise" style={{ animationDelay: "120ms" }}>
            {copy.line3}
          </span>
        </SectionTitle>

        <p className="hero-subtitle">{copy.subline}</p>

        <div className="hero-install" aria-label={`${copy.installWith} ${INSTALL_COMMAND}`}>
          <code>{INSTALL_COMMAND}</code>
          <TKIconButton icon="copy" label={copy.copyInstall} onClick={onCopy} variant="plain" />
        </div>

        <div className="hero-badges" aria-label={copy.packageFacts}>
          <TKBadge soft>~60 kB brotli</TKBadge>
          <TKBadge soft tone="green">1245 tests</TKBadge>
          <TKBadge soft tone="gray">MIT</TKBadge>
        </div>

        <div className="hero-actions">
          <TKButton as="a" href={`${base}docs/`} icon="arrowRight" size="lg">
            {copy.getStarted}
          </TKButton>
          <TKButton as="a" href={`${base}storybook/`} size="lg" variant="outline">
            {copy.browseComponents}
          </TKButton>
        </div>
      </div>

      <WalletPhone theme={theme} />
    </div>
  );
}

function WalletPhone({ theme }: { theme: TKTheme }) {
  const { strings } = useSiteLocale();
  const copy = strings.demo.wallet;
  const frameRef = useRef<HTMLDivElement>(null);
  const scenario = useScenario(frameRef);
  const [manualPage, setManualPage] = useState<number>();
  const [manualSheetOpen, setManualSheetOpen] = useState<boolean>();
  const [manualView, setManualView] = useState<"wallet" | "pin">();
  const [pinOutcome, setPinOutcome] = useState<{
    attempt: number;
    kind: "idle" | "error" | "success";
  }>({ attempt: 0, kind: "idle" });
  const [dismissedAutoConfettiCycle, setDismissedAutoConfettiCycle] = useState(-1);
  const [manualConfettiAttempt, setManualConfettiAttempt] = useState<number>();

  // Auto mode covers the parked-out-of-viewport state too: the automaton may
  // (re)start there, so the frame must stay non-interactive until the visitor
  // explicitly takes control (or reduced motion disables the scenario).
  const autoMode = !scenario.reducedMotion && !scenario.stopped;
  const autoPin = ["pin", "success", "confetti", "pause"].includes(scenario.step);
  const autoSuccess = ["success", "confetti", "pause"].includes(scenario.step);
  const galleryPage = manualPage ?? (scenario.reducedMotion ? 1 : scenario.step === "wallet" ? 0 : 1);
  const sheetOpen = manualSheetOpen ?? scenario.step === "sheet-open";
  const view = manualView ?? (autoPin ? "pin" : "wallet");
  const success =
    pinOutcome.kind === "success" ||
    (pinOutcome.kind === "idle" && manualView === undefined && autoSuccess);
  const autoConfetti =
    scenario.step === "confetti" && dismissedAutoConfettiCycle !== scenario.cycle;
  const showConfetti = autoConfetti || manualConfettiAttempt === pinOutcome.attempt;

  const showWallet = () => {
    setManualSheetOpen(false);
    setManualView("wallet");
    setPinOutcome((current) => ({ attempt: current.attempt + 1, kind: "idle" }));
    setManualConfettiAttempt(undefined);
    setDismissedAutoConfettiCycle(scenario.cycle);
  };

  const showPin = () => {
    setManualSheetOpen(false);
    setManualView("pin");
    setPinOutcome((current) => ({ attempt: current.attempt + 1, kind: "idle" }));
  };

  const verifyPin = (pin: string) => {
    const attempt = pinOutcome.attempt + 1;
    const kind = pin === "1234" ? "success" : "error";
    setPinOutcome({ attempt, kind });
    if (kind === "success") setManualConfettiAttempt(attempt);
  };

  const verifyBiometric = () => {
    const attempt = pinOutcome.attempt + 1;
    setPinOutcome({ attempt, kind: "success" });
    setManualConfettiAttempt(attempt);
  };

  // Deliberate takeover: stop the automaton for the session and reset the
  // wallet to a clean manual state, whatever step the scenario was mid-way
  // through (a grabbed mid-animation state is exactly what broke before).
  const takeControl = () => {
    scenario.stop();
    setManualPage(0);
    setManualSheetOpen(false);
    setManualView("wallet");
    setPinOutcome((current) => ({ attempt: current.attempt + 1, kind: "idle" }));
    setManualConfettiAttempt(undefined);
    setDismissedAutoConfettiCycle(scenario.cycle);
  };

  return (
    <div
      ref={frameRef}
      className="showcase-phone-stage tk-pop-lg"
      data-scenario-autoplay={scenario.autoplay ? "running" : scenario.reducedMotion ? "static" : "stopped"}
      data-scenario-cycle={scenario.cycle}
      data-scenario-cycle-ms={SCENARIO_CYCLE_MS}
      data-scenario-step={scenario.step}
    >
      <div className="showcase-phone">
        <TKProvider theme={theme} className="showcase-phone-screen">
          <PhoneStatusBar />
          {/* While the automaton drives the demo the content is inert — grabbing
              a mid-animation state used to corrupt it. Takeover is the explicit
              button below the frame. */}
          <div className="showcase-phone-content" data-tk-portal-root inert={autoMode}>
            {view === "wallet" ? (
              <WalletHome
                page={galleryPage}
                onPageChange={setManualPage}
                onCardOpen={() => setManualSheetOpen(true)}
              />
            ) : (
              <PinStep
                key={pinOutcome.attempt}
                error={pinOutcome.kind === "error"}
                success={success}
                onBack={showWallet}
                onBiometric={verifyBiometric}
                onComplete={verifyPin}
              />
            )}

            {success ? <SuccessPop onDone={showWallet} /> : null}
            {showConfetti ? (
              <TKConfetti
                count={90}
                duration={1600}
                onDone={() => {
                  if (autoConfetti) setDismissedAutoConfettiCycle(scenario.cycle);
                  if (manualConfettiAttempt === pinOutcome.attempt) setManualConfettiAttempt(undefined);
                }}
                testId="wallet-confetti"
              />
            ) : null}

            <TKSheet
              open={sheetOpen}
              modal={!autoMode}
              onClose={() => setManualSheetOpen(false)}
              title={copy.confirmPayment}
              testId="wallet-sheet"
            >
              <div className="wallet-sheet-body">
                <div>
                  <span className="wallet-sheet-label">Telegram Premium</span>
                  <strong>$4.99</strong>
                </div>
                <p>{copy.everyday} •••• 4821</p>
                <TKButton full icon="lock" onClick={showPin}>
                  {copy.paySecurely}
                </TKButton>
              </div>
            </TKSheet>
          </div>
          <div className="showcase-phone-home" />
        </TKProvider>
      </div>
      {autoMode ? (
        <div className="scenario-hint scenario-hint--actions">
          <span>{copy.liveHint}</span>
          <TKButton size="sm" variant="tonal" onClick={takeControl} testId="wallet-take-control">
            {copy.tryIt}
          </TKButton>
        </div>
      ) : (
        <p className="scenario-hint">
          {scenario.reducedMotion ? copy.staticHint : copy.manualHint}
        </p>
      )}
    </div>
  );
}

function WalletHome({
  page,
  onPageChange,
  onCardOpen,
}: {
  page: number;
  onPageChange: (page: number) => void;
  onCardOpen: () => void;
}) {
  const { strings } = useSiteLocale();
  const copy = strings.demo.wallet;

  return (
    <div className="wallet-screen">
      <div className="wallet-toolbar">
        <div className="wallet-heading">
          <span className="wallet-app-icon"><TKIcon name="wallet" size={18} /></span>
          <strong>{copy.wallet}</strong>
        </div>
        <TKIconButton icon="dots" label={copy.walletOptions} size="sm" variant="plain" />
      </div>

      <div className="wallet-balance">
        <span>{copy.totalBalance}</span>
        <strong>$12,480.72</strong>
      </div>

      <TKGallery
        dots
        edgeInset={0}
        gap={10}
        haptics={false}
        items={walletCards}
        page={page}
        onPageChange={onPageChange}
        getKey={(card) => card.id}
        renderItem={(card) => {
          const label = copy[card.id];
          return (
            <TKCard
              className={`wallet-card wallet-card-${card.tone}`}
              onClick={onCardOpen}
              padding="18px"
              aria-label={formatSiteString(copy.payWithCard, { card: label, digits: card.digits })}
              style={{
                background:
                  card.tone === "accent"
                    ? "linear-gradient(135deg, var(--tk-accent), color-mix(in srgb, var(--tk-accent) 68%, var(--tk-surface)))"
                    : card.tone === "green"
                      ? "linear-gradient(135deg, var(--tk-green), color-mix(in srgb, var(--tk-green) 68%, var(--tk-surface)))"
                      : "linear-gradient(135deg, var(--tk-surface-3), var(--tk-surface))",
                boxShadow: "none",
              }}
            >
              <span>{label}</span>
              <TKIcon name="card" size={22} />
              <strong>•••• {card.digits}</strong>
            </TKCard>
          );
        }}
      />

      <div className="wallet-actions" aria-label={copy.shortcuts}>
        <WalletAction icon="send" label={copy.send} />
        <WalletAction icon="plus" label={copy.add} />
        <WalletAction icon="qr" label={copy.scan} />
      </div>

      <div className="wallet-activity-heading">
        <strong>{copy.activity}</strong>
        <span>{copy.today}</span>
      </div>
      <TKCard inset={false} padding={0}>
        <TKCardCell
          before={<span className="wallet-row-icon"><TKIcon name="gift" size={17} /></span>}
          title="Telegram Premium"
          subtitle={copy.subscription}
          after={<strong>−$4.99</strong>}
        />
        <TKCardCell
          before={<span className="wallet-row-icon"><TKIcon name="arrowRight" size={17} /></span>}
          title={copy.transferReceived}
          subtitle="Alex Morgan"
          after={<strong className="wallet-positive">+$280</strong>}
        />
      </TKCard>
    </div>
  );
}

function WalletAction({ icon, label }: { icon: "send" | "plus" | "qr"; label: string }) {
  return (
    <div>
      <TKIconButton icon={icon} label={label} variant="tonal" />
      <span>{label}</span>
    </div>
  );
}

function PinStep({
  error,
  success,
  onBack,
  onBiometric,
  onComplete,
}: {
  error: boolean;
  success: boolean;
  onBack: () => void;
  onBiometric: () => void;
  onComplete: (pin: string) => void;
}) {
  const locale = useTKLocale();
  const { strings } = useSiteLocale();
  const copy = strings.demo.wallet;

  return (
    <div className="wallet-pin-screen">
      <div className="wallet-pin-toolbar">
        <TKIconButton icon="chevronLeft" label={copy.backToWallet} onClick={onBack} size="sm" variant="plain" />
        <span>{copy.securePayment}</span>
      </div>
      <TKPinInput
        error={error}
        success={success}
        onBiometricRequest={onBiometric}
        onComplete={onComplete}
        title={
          <div className="wallet-pin-title">
            <span className="wallet-lock"><TKIcon name="lock" size={20} /></span>
            <strong>{locale.wallet}</strong>
            <span>{locale.oneTimeCode}: 1234</span>
          </div>
        }
      />
    </div>
  );
}

function SuccessPop({ onDone }: { onDone: () => void }) {
  const { strings } = useSiteLocale();
  const copy = strings.demo.wallet;

  return (
    <div className="wallet-success" role="status" aria-live="polite">
      <div className="wallet-success-card tk-pop-lg">
        <span className="wallet-success-icon"><TKIcon name="check" size={28} strokeWidth={3} /></span>
        <strong>{copy.paymentComplete}</strong>
        <span>{copy.paymentSent}</span>
        <TKButton onClick={onDone} size="sm" variant="tonal">{copy.done}</TKButton>
      </div>
    </div>
  );
}

function PhoneStatusBar() {
  return (
    <div className="showcase-phone-statusbar" aria-hidden="true">
      <span className="showcase-phone-time">9:41</span>
      <span className="showcase-phone-island" />
      <span className="showcase-phone-status-icons">
        <SignalIcon />
        <WifiIcon />
        <BatteryIcon />
      </span>
    </div>
  );
}

function SignalIcon() {
  return (
    <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
      <rect x="0" y="8" width="3" height="4" rx="1" />
      <rect x="5" y="5" width="3" height="7" rx="1" />
      <rect x="10" y="2.5" width="3" height="9.5" rx="1" />
      <rect x="15" y="0" width="3" height="12" rx="1" />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg width="17" height="12" viewBox="0 0 17 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M1.5 4.2C5.5 1 11.5 1 15.5 4.2" />
      <path d="M4 6.8C6.6 4.7 10.4 4.7 13 6.8" />
      <path d="M6.6 9.3C7.7 8.4 9.3 8.4 10.4 9.3" />
    </svg>
  );
}

function BatteryIcon() {
  return (
    <svg width="26" height="13" viewBox="0 0 26 13" fill="none">
      <rect x="0.5" y="0.5" width="22" height="12" rx="3.5" stroke="currentColor" opacity="0.4" />
      <rect x="2" y="2" width="17" height="9" rx="2" fill="currentColor" />
      <rect x="24" y="4" width="2" height="5" rx="1" fill="currentColor" opacity="0.4" />
    </svg>
  );
}
