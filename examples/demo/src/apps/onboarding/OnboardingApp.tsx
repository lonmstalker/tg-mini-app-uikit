import { useEffect, useRef, useState } from "react";
import {
  TKBadge,
  TKButton,
  TKCell,
  TKConfetti,
  TKEmptyState,
  TKGallery,
  TKListGroup,
  TKPage,
  TKPinInput,
  TKSteps,
  TKSwitch,
  TKTelegramProvider,
  useBiometrics,
  useContactRequest,
  useEmojiStatus,
  useWriteAccess,
} from "tg-mini-app-uikit";
import { createMockTelegram } from "../../telegram/mock";

/* ------------------------------------------------------------------ */
/*  Wizard step indices                                                 */
/* ------------------------------------------------------------------ */
const STEP_COUNT = 5; // 0 Welcome, 1 Contact, 2 WriteAccess, 3 PIN, 4 Done

/* ------------------------------------------------------------------ */
/*  Step 0 — Welcome gallery                                           */
/* ------------------------------------------------------------------ */
function SlideCard({ emoji, title, text }: { emoji: string; title: string; text: string }) {
  return (
    <div
      style={{
        height: 220,
        borderRadius: "var(--tk-r-lg)",
        background: "var(--tk-accent-12)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: "0 24px",
        textAlign: "center",
      }}
    >
      <span style={{ fontSize: 48 }}>{emoji}</span>
      <div style={{ fontSize: "var(--tk-fz-title3)", fontWeight: 700 }}>{title}</div>
      <div style={{ fontSize: "var(--tk-fz-sub)", color: "var(--tk-text-2)" }}>{text}</div>
    </div>
  );
}

function WelcomeStep({ onContinue }: { onContinue: () => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <TKGallery dots height={220}>
        <SlideCard emoji="👋" title="Welcome" text="Set up your identity in just a few steps." />
        <SlideCard emoji="🔒" title="Private & Secure" text="Your data stays on Telegram — zero servers." />
        <SlideCard emoji="🚀" title="Ready in 60 s" text="Contact, write access, PIN — done." />
      </TKGallery>
      <TKButton testId="onb-continue" full onClick={onContinue}>
        Get started
      </TKButton>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 1 — Contact                                                   */
/* ------------------------------------------------------------------ */
function ContactStep({ onContinue }: { onContinue: () => void }) {
  const contact = useContactRequest();
  const [phone, setPhone] = useState<string | null>(null);
  const [deny, setDeny] = useState(false);
  const [denied, setDenied] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleRequest = async () => {
    if (deny) {
      setPhone(null);
      setDenied(true);
      return;
    }
    setDenied(false);
    setBusy(true);
    const ok = await contact.request();
    setBusy(false);
    if (ok) setPhone("+7 (999) 000-00-00");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <TKListGroup title="Step 1 — Phone">
        <TKCell
          icon="user"
          testId="onb-contact"
          title="Share phone number"
          subtitle="Used to identify you in the app"
          chevron
          onClick={handleRequest}
        />
        <TKCell
          icon="close"
          iconBg="var(--tk-red)"
          title="Simulate denial"
          after={
            <TKSwitch
              checked={deny}
              onChange={(value) => {
                setDeny(value);
                if (!value) setDenied(false);
              }}
              testId="onb-deny-toggle"
            />
          }
        />
      </TKListGroup>

      {contact.status === "pending" || busy ? (
        <TKBadge tone="accent" soft>Requesting…</TKBadge>
      ) : null}

      {phone && !deny ? (
        <TKListGroup footer="Contact shared successfully.">
          <TKCell icon="phone" title="Phone" value={phone} />
        </TKListGroup>
      ) : null}

      {denied ? (
        <TKEmptyState
          icon="close"
          tone="red"
          title="Permission denied"
          text="Toggle the switch above to allow contact sharing."
          cta="Try again"
          onCta={() => {
            setDeny(false);
            setDenied(false);
          }}
        />
      ) : null}

      {phone && !deny ? (
        <TKButton testId="onb-continue" full onClick={onContinue}>
          Continue
        </TKButton>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 2 — Write access                                              */
/* ------------------------------------------------------------------ */
function WriteAccessStep({ onContinue }: { onContinue: () => void }) {
  const writeAccess = useWriteAccess();
  const [granted, setGranted] = useState(false);
  const [deny, setDeny] = useState(false);
  const [denied, setDenied] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleRequest = async () => {
    if (deny) {
      setGranted(false);
      setDenied(true);
      return;
    }
    setDenied(false);
    setBusy(true);
    const ok = await writeAccess.request();
    setBusy(false);
    if (ok) setGranted(true);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <TKListGroup title="Step 2 — Write access">
        <TKCell
          icon="chat"
          testId="onb-write"
          title="Allow write access"
          subtitle="So the bot can send you messages"
          chevron
          onClick={handleRequest}
        />
        <TKCell
          icon="close"
          iconBg="var(--tk-red)"
          title="Simulate denial"
          after={
            <TKSwitch
              checked={deny}
              onChange={(value) => {
                setDeny(value);
                if (!value) setDenied(false);
              }}
              testId="onb-deny-toggle"
            />
          }
        />
      </TKListGroup>

      {busy ? (
        <TKBadge tone="accent" soft>Requesting…</TKBadge>
      ) : null}

      {granted && !deny ? (
        <TKBadge tone="green" soft>Write access granted</TKBadge>
      ) : null}

      {denied ? (
        <TKEmptyState
          icon="chat"
          tone="red"
          title="Write access denied"
          text="Toggle the switch above to simulate granting access."
          cta="Retry"
          onCta={() => {
            setDeny(false);
            setDenied(false);
          }}
        />
      ) : null}

      {granted && !deny ? (
        <TKButton testId="onb-continue" full onClick={onContinue}>
          Continue
        </TKButton>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 3 — PIN + biometrics                                          */
/* ------------------------------------------------------------------ */
type PinPhase = "enter" | "confirm" | "done";
type BioPhase = "idle" | "initing" | "requesting" | "authenticating" | "ok" | "error";

function PinStep({ onContinue, onSkip }: { onContinue: () => void; onSkip: () => void }) {
  const biometrics = useBiometrics();

  const [pinPhase, setPinPhase] = useState<PinPhase>("enter");
  const [firstPin, setFirstPin] = useState("");
  const [pinError, setPinError] = useState(false);

  const [bioPhase, setBioPhase] = useState<BioPhase>("idle");
  const [bioToken, setBioToken] = useState<string | undefined>();

  // Clear error after one render cycle (TKPinInput reacts to the `error` prop change)
  useEffect(() => {
    if (pinError) {
      const t = window.setTimeout(() => setPinError(false), 800);
      return () => window.clearTimeout(t);
    }
  }, [pinError]);

  const handlePinComplete = (pin: string) => {
    if (pinPhase === "enter") {
      setFirstPin(pin);
      setPinPhase("confirm");
    } else {
      // confirm phase
      if (pin === firstPin) {
        setPinPhase("done");
      } else {
        setPinError(true);
        setPinPhase("enter");
        setFirstPin("");
      }
    }
  };

  const handleBiometrics = async () => {
    setBioPhase("initing");
    await biometrics.init();

    setBioPhase("requesting");
    const accessOk = await biometrics.requestAccess("Confirm your identity");

    if (!accessOk) {
      setBioPhase("error");
      return;
    }

    setBioPhase("authenticating");
    const result = await biometrics.authenticate("Verify biometric");

    if (result.ok) {
      setBioToken(result.token);
      setBioPhase("ok");
    } else {
      setBioPhase("error");
    }
  };

  const bioBadgeTone = bioPhase === "ok" ? "green" : bioPhase === "error" ? "red" : bioPhase === "idle" ? "gray" : "accent";
  const bioBadgeText: Record<BioPhase, string> = {
    idle: "not started",
    initing: "initialising",
    requesting: "requesting access",
    authenticating: "authenticating",
    ok: "success",
    error: "failed",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {pinPhase !== "done" ? (
        <TKPinInput
          testId="onb-pin"
          length={4}
          error={pinError}
          onComplete={handlePinComplete}
          onBiometricRequest={pinPhase === "enter" ? handleBiometrics : undefined}
          title={
            <div style={{ textAlign: "center", fontWeight: 700, fontSize: "var(--tk-fz-title3)" }}>
              {pinPhase === "enter" ? "Set a PIN" : "Confirm your PIN"}
            </div>
          }
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <TKBadge tone="green" soft>PIN set successfully</TKBadge>

          <TKListGroup title="Biometrics (optional)">
            <TKCell
              icon="fingerprint"
              title="Enable biometrics"
              subtitle="Authenticate with Face ID or fingerprint"
              testId="onb-bio"
              chevron
              onClick={handleBiometrics}
              value={<TKBadge tone={bioBadgeTone} soft>{bioBadgeText[bioPhase]}</TKBadge>}
            />
          </TKListGroup>

          {bioPhase === "ok" && bioToken ? (
            <TKBadge tone="green" soft>Token: {bioToken.slice(0, 10)}…</TKBadge>
          ) : null}

          <div style={{ display: "flex", gap: 10 }}>
            <TKButton
              testId="onb-skip-bio"
              full
              variant="tonal"
              onClick={onSkip}
            >
              Skip biometrics
            </TKButton>
            {bioPhase === "ok" ? (
              <TKButton testId="onb-continue" full onClick={onContinue}>
                Continue
              </TKButton>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 4 — Emoji status + done                                       */
/* ------------------------------------------------------------------ */
function DoneStep() {
  const emojiStatus = useEmojiStatus();
  const [emojiSet, setEmojiSet] = useState(false);
  const [confetti, setConfetti] = useState(true);

  const handleSetEmoji = async () => {
    const ok = await emojiStatus.set("5368324170671202286", { duration: 3600 });
    if (ok) setEmojiSet(true);
  };

  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 20 }}>
      {confetti ? <TKConfetti testId="onb-confetti" onDone={() => setConfetti(false)} /> : null}

      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <div style={{ fontSize: 56 }}>🎉</div>
        <div style={{ fontSize: "var(--tk-fz-title2)", fontWeight: 700, marginTop: 8 }}>All set!</div>
        <div style={{ fontSize: "var(--tk-fz-sub)", color: "var(--tk-text-2)", marginTop: 4 }}>
          Your identity is ready.
        </div>
      </div>

      <TKListGroup title="Final touch">
        <TKCell
          icon="star"
          title="Set emoji status"
          subtitle={emojiSet ? "Status applied" : "Optional — personalise your profile"}
          value={emojiSet ? <TKBadge tone="green" soft>Done</TKBadge> : undefined}
          chevron={!emojiSet}
          onClick={!emojiSet ? handleSetEmoji : undefined}
        />
      </TKListGroup>

      <TKBadge testId="onb-done" tone="green" soft style={{ alignSelf: "center" }}>
        Setup complete
      </TKBadge>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Root                                                               */
/* ------------------------------------------------------------------ */
export function OnboardingApp() {
  const mockRef = useRef(createMockTelegram());
  const mock = mockRef.current;

  const [step, setStep] = useState(0);
  const next = () => setStep((s) => Math.min(s + 1, STEP_COUNT - 1));
  const skip = () => setStep(4); // skip biometrics → done

  const stepLabels = ["Welcome", "Contact", "Access", "PIN", "Done"];

  return (
    <TKTelegramProvider webApp={mock.webApp}>
      <div
        data-demo-app="onboarding"
        style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}
      >
        <TKPage
          gap={20}
          padding={16}
          header={
            step > 0 ? (
              <div style={{ padding: "58px 16px 0" }}>
                <TKSteps
                  steps={stepLabels}
                  current={step}
                  testId="onb-steps"
                />
              </div>
            ) : null
          }
        >
          {step === 0 ? <WelcomeStep onContinue={next} /> : null}
          {step === 1 ? <ContactStep onContinue={next} /> : null}
          {step === 2 ? <WriteAccessStep onContinue={next} /> : null}
          {step === 3 ? <PinStep onContinue={next} onSkip={skip} /> : null}
          {step === 4 ? <DoneStep /> : null}
        </TKPage>
      </div>
    </TKTelegramProvider>
  );
}
