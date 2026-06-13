import { useRef, useState } from "react";
import {
  TKBadge,
  TKButton,
  TKCard,
  TKCardChip,
  TKConfetti,
  TKDialog,
  TKIcon,
  TKListGroup,
  TKCell,
  TKPage,
  TKPaymentSummary,
  TKSwitch,
  TKTimeline,
  TKToastProvider,
  TKTelegramProvider,
  useInvoice,
  useMainButton,
  useTKToast,
} from "tg-mini-app-uikit";
import { createMockTelegram, type MockTelegram } from "../../telegram/mock";
import type { ShellApi } from "../../shell/types";

/*
 * StarsApp (M9.1) — Telegram Stars subscription paywall.
 *
 * Deterministic invoice outcomes
 * ─────────────────────────────
 * The mock's `openInvoice` always resolves "paid" after 300 ms (see mock.ts).
 * To exercise the failure and cancellation paths without touching the mock,
 * this app intercepts the result before acting on it:
 *
 *   • `stars-fail-toggle` ON  → any invoice result is overridden to "failed"
 *   • URL slug contains "cancel" (e.g. `?failSlug=cancel`) → overridden to
 *     "cancelled" (useful in e2e: pass the slug in the invoice URL)
 *   • Default → "paid" (mock hard-codes this)
 *
 * The override happens in `resolvedStatus()` synchronously after the promise
 * settles, so the mock itself stays unchanged.
 */

/* ──── Subscription tiers ──────────────────────────────────────────────── */

interface Tier {
  id: string;
  name: string;
  price: number; // XTR
  period: string;
  features: string[];
  highlight?: boolean;
  invoiceUrl: string;
}

const TIERS: Tier[] = [
  {
    id: "basic",
    name: "Basic",
    price: 75,
    period: "/ month",
    features: ["Unlimited messages", "Standard support", "1 GB cloud storage"],
    invoiceUrl: "https://t.me/invoice/stars-basic",
  },
  {
    id: "pro",
    name: "Pro",
    price: 250,
    period: "/ month",
    features: ["Everything in Basic", "Priority support", "10 GB cloud storage", "Analytics dashboard"],
    highlight: true,
    invoiceUrl: "https://t.me/invoice/stars-pro",
  },
  {
    id: "elite",
    name: "Elite",
    price: 750,
    period: "/ month",
    features: ["Everything in Pro", "Dedicated account manager", "Unlimited storage", "Custom integrations"],
    invoiceUrl: "https://t.me/invoice/stars-elite",
  },
];

/* ──── Inner app (needs TKToastProvider + TKTelegramProvider above) ─────── */

function StarsInner({ shell, mock }: { shell?: ShellApi; mock: MockTelegram }) {
  void shell; // shell is threaded in for potential future theme sync
  void mock;

  const toast = useTKToast();
  const invoice = useInvoice();

  const [selectedId, setSelectedId] = useState<string>("pro");
  const [paying, setPaying] = useState(false);
  const [receipt, setReceipt] = useState<{ tier: Tier; txId: string } | null>(null);
  const [failOpen, setFailOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Determinism switch: when ON every invoice result is forced to "failed".
  const [forceFail, setForceFail] = useState(false);
  const forceFailRef = useRef(forceFail);
  forceFailRef.current = forceFail;

  const selectedTier = TIERS.find((t) => t.id === selectedId) ?? TIERS[1];

  /* ── Pay handler ─────────────────────────────────────────────────────── */
  const pay = async () => {
    if (paying) return;
    setPaying(true);
    try {
      const rawStatus = await invoice.open(selectedTier.invoiceUrl);

      // Deterministic override: forceFail switch wins first; then URL slug check.
      const slug = selectedTier.invoiceUrl.split("/").pop() ?? "";
      const status =
        forceFailRef.current
          ? "failed"
          : slug.includes("cancel")
            ? "cancelled"
            : rawStatus;

      if (status === "paid") {
        // Generate a stable-looking transaction ID from the tier + timestamp
        const txId = `TX-${selectedTier.id.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
        setReceipt({ tier: selectedTier, txId });
        setShowConfetti(true);
      } else if (status === "cancelled") {
        toast.show({ icon: "close", text: "Payment cancelled" });
      } else {
        // "failed" or any other status
        setFailOpen(true);
      }
    } finally {
      setPaying(false);
    }
  };

  /* ── Native Main button ──────────────────────────────────────────────── */
  useMainButton({
    text: receipt ? "✓ Subscribed" : `Pay ${selectedTier.price} ★`,
    loading: paying,
    disabled: paying || !!receipt,
    visible: true,
    onClick: pay,
  });

  /* ── Receipt view ────────────────────────────────────────────────────── */
  if (receipt) {
    return (
      <div data-demo-app="stars" style={{ height: "100%", position: "relative", overflow: "hidden" }}>
        {showConfetti ? (
          <TKConfetti testId="stars-confetti" onDone={() => setShowConfetti(false)} />
        ) : null}
        <TKPage padding={16} gap={16}>
          <div style={{ textAlign: "center", padding: "12px 0 4px" }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "var(--tk-green-12)",
                color: "var(--tk-green)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 10px",
              }}
            >
              <TKIcon name="check" size={28} strokeWidth={2.6} />
            </div>
            <div style={{ fontSize: "var(--tk-fz-title2)", fontWeight: 700 }}>Payment successful!</div>
            <div style={{ fontSize: "var(--tk-fz-sub)", color: "var(--tk-text-2)", marginTop: 4 }}>
              Your {receipt.tier.name} subscription is now active.
            </div>
          </div>

          <TKPaymentSummary
            testId="stars-receipt"
            rows={[
              { label: "Plan", value: receipt.tier.name },
              { label: "Billing period", value: `Monthly` },
              { label: "Transaction ID", value: receipt.txId },
              { label: "Total", value: `${receipt.tier.price} ★`, total: true },
            ]}
          />

          <TKListGroup title="What's included">
            <TKTimeline
              steps={receipt.tier.features.map((f, i) => ({
                label: f,
                status: i === 0 ? "active" : "done",
              }))}
            />
          </TKListGroup>

          <TKButton
            variant="tonal"
            full
            onClick={() => {
              setReceipt(null);
              setShowConfetti(false);
            }}
          >
            Back to plans
          </TKButton>
        </TKPage>
      </div>
    );
  }

  /* ── Checkout view ───────────────────────────────────────────────────── */
  return (
    <div data-demo-app="stars" style={{ height: "100%", position: "relative" }}>
      <TKPage padding={16} gap={16}>
        {/* Header */}
        <div style={{ textAlign: "center", padding: "4px 0 8px" }}>
          <div style={{ fontSize: 36, lineHeight: 1.2 }}>⭐</div>
          <div style={{ fontSize: "var(--tk-fz-title2)", fontWeight: 700, marginTop: 6 }}>
            Unlock with Telegram Stars
          </div>
          <div style={{ fontSize: "var(--tk-fz-sub)", color: "var(--tk-text-2)", marginTop: 4 }}>
            Choose a plan that fits your needs
          </div>
        </div>

        {/* Tier chips */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          {TIERS.map((tier) => (
            <TKCardChip
              key={tier.id}
              selected={selectedId === tier.id}
              tone={tier.highlight ? "accent" : "gray"}
              onClick={() => setSelectedId(tier.id)}
            >
              {tier.name}
              {tier.highlight ? " ✦" : ""}
            </TKCardChip>
          ))}
        </div>

        {/* Selected tier card */}
        <TKCard padding={16}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: "var(--tk-fz-title3)", fontWeight: 700 }}>{selectedTier.name}</span>
                {selectedTier.highlight ? (
                  <TKBadge tone="accent" soft>Most popular</TKBadge>
                ) : null}
              </div>
              <div style={{ marginTop: 4 }}>
                <span style={{ fontSize: "var(--tk-fz-title2)", fontWeight: 800 }}>{selectedTier.price} ★</span>
                <span style={{ fontSize: "var(--tk-fz-caption)", color: "var(--tk-text-2)", marginLeft: 4 }}>
                  {selectedTier.period}
                </span>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            {selectedTier.features.map((f) => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "var(--tk-fz-sub)" }}>
                <TKIcon name="check" size={15} strokeWidth={2.8} style={{ color: "var(--tk-green)", flexShrink: 0 }} />
                {f}
              </div>
            ))}
          </div>
        </TKCard>

        {/* Payment summary */}
        <TKPaymentSummary
          rows={[
            { label: "Plan", value: selectedTier.name },
            { label: "Billing", value: "Monthly, cancel anytime" },
            { label: "Total", value: `${selectedTier.price} ★`, total: true },
          ]}
        />

        {/* In-app pay button (visible when native button isn't shown / browser) */}
        <TKButton
          testId="stars-pay"
          variant="filled"
          full
          loading={paying}
          disabled={paying}
          onClick={pay}
          icon="star"
        >
          {`Pay ${selectedTier.price} ★`}
        </TKButton>

        {/* Testing controls */}
        <TKListGroup title="Testing controls" footer="Use these to exercise error paths in e2e tests.">
          <TKCell
            icon="tune"
            iconBg="var(--tk-orange)"
            title="Simulate failure"
            subtitle="Forces every payment to return 'failed'"
            after={
              <TKSwitch
                small
                checked={forceFail}
                onChange={setForceFail}
                ariaLabel="Simulate failure"
              />
            }
            testId="stars-fail-toggle"
          />
        </TKListGroup>
      </TKPage>

      {/* Failure dialog */}
      <TKDialog
        open={failOpen}
        onClose={() => setFailOpen(false)}
        onConfirm={pay}
        icon="close"
        tone="red"
        title="Payment failed"
        text="The Stars payment could not be completed. Please try again."
        actions={
          <>
            <TKButton variant="tonal" onClick={() => setFailOpen(false)}>
              Cancel
            </TKButton>
            <TKButton
              testId="stars-retry"
              variant="filled"
              onClick={() => {
                setFailOpen(false);
                pay();
              }}
            >
              Retry
            </TKButton>
          </>
        }
      />
    </div>
  );
}

/* ──── Root export ──────────────────────────────────────────────────────── */

export function StarsApp({ shell }: { shell?: ShellApi }) {
  const mockRef = useRef<MockTelegram | null>(null);
  if (!mockRef.current) {
    mockRef.current = createMockTelegram({ colorScheme: shell?.dark ? "dark" : "light" });
  }
  const mock = mockRef.current;

  return (
    <TKTelegramProvider webApp={mock.webApp} haptics>
      <TKToastProvider offset={80}>
        <StarsInner shell={shell} mock={mock} />
      </TKToastProvider>
    </TKTelegramProvider>
  );
}
