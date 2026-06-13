import { useRef, useState } from "react";
import {
  TKAvatar,
  TKBadge,
  TKButton,
  TKCard,
  TKCardCell,
  TKCell,
  TKDialog,
  TKIcon,
  TKInfiniteList,
  TKInput,
  TKListGroup,
  TKPage,
  TKSpinner,
  TKToastProvider,
  TKTelegramProvider,
  TKWalletConnectButton,
  TKWalletStatusCell,
  useTKToast,
} from "tg-mini-app-uikit";
import { createMockTelegram, type MockTelegram } from "../../telegram/mock";
import { demoDelay } from "../../shell/boot";
import type { ShellApi } from "../../shell/types";

/*
 * WalletApp (M9.7) — mock TON wallet.
 * No network calls; all async effects use demoDelay from shell/boot.
 *
 * Architecture
 * ────────────
 * connect()   → demoDelay(600ms) → connected = true (address EQD4…9f2A)
 * send()      → confirm dialog → demoDelay(800ms) → tx prepended to history,
 *               balance updated
 * history     → seeded array (no Math.random in render); TKInfiniteList pages
 *               10 rows at a time from SEED_TXS (deterministic)
 *
 * testIds
 * ───────
 * wallet-connect        TKWalletConnectButton (disconnected state)
 * wallet-send-open      "Send" button that opens the send sheet
 * wallet-amount         amount TKInput
 * wallet-send-confirm   confirm button inside TKDialog
 * wallet-history        TKInfiniteList wrapping the tx list
 */

/* ──── Constants ─────────────────────────────────────────────────────────── */

const WALLET_ADDRESS_SHORT = "EQD4…9f2A";
const INITIAL_BALANCE = 14.72; // TON

/* ──── Deterministic seed transactions (no Math.random) ─────────────────── */

interface Tx {
  id: string;
  type: "in" | "out";
  address: string;
  addressShort: string;
  amount: number;
  comment: string;
  ts: number; // unix ms — fixed offsets from epoch so renders are stable
}

const SEED_TXS: Tx[] = [
  { id: "s01", type: "in",  address: "EQBa1…cK3A", addressShort: "EQBa1…cK3A", amount: 5.0,   comment: "Salary",            ts: 1718000000_000 - 1 * 3_600_000 },
  { id: "s02", type: "out", address: "EQCx2…pP9B", addressShort: "EQCx2…pP9B", amount: 1.25,  comment: "Coffee",            ts: 1718000000_000 - 3 * 3_600_000 },
  { id: "s03", type: "in",  address: "EQDr3…mK7C", addressShort: "EQDr3…mK7C", amount: 10.0,  comment: "Freelance payment", ts: 1718000000_000 - 7 * 3_600_000 },
  { id: "s04", type: "out", address: "EQEf4…nL2D", addressShort: "EQEf4…nL2D", amount: 2.5,   comment: "Groceries",         ts: 1718000000_000 - 12 * 3_600_000 },
  { id: "s05", type: "in",  address: "EQFg5…oM1E", addressShort: "EQFg5…oM1E", amount: 0.75,  comment: "Staking reward",    ts: 1718000000_000 - 18 * 3_600_000 },
  { id: "s06", type: "out", address: "EQGh6…pH5F", addressShort: "EQGh6…pH5F", amount: 3.0,   comment: "Subscription",      ts: 1718000000_000 - 24 * 3_600_000 },
  { id: "s07", type: "in",  address: "EQHi7…qI9G", addressShort: "EQHi7…qI9G", amount: 20.0,  comment: "Token sale",        ts: 1718000000_000 - 30 * 3_600_000 },
  { id: "s08", type: "out", address: "EQJj8…rJ4H", addressShort: "EQJj8…rJ4H", amount: 0.5,   comment: "Gas fee",           ts: 1718000000_000 - 36 * 3_600_000 },
  { id: "s09", type: "in",  address: "EQKk9…sK8I", addressShort: "EQKk9…sK8I", amount: 8.0,   comment: "Refund",            ts: 1718000000_000 - 42 * 3_600_000 },
  { id: "s10", type: "out", address: "EQLl0…tL3J", addressShort: "EQLl0…tL3J", amount: 4.25,  comment: "NFT purchase",      ts: 1718000000_000 - 48 * 3_600_000 },
  { id: "s11", type: "in",  address: "EQMm1…uM7K", addressShort: "EQMm1…uM7K", amount: 1.0,   comment: "Tip received",      ts: 1718000000_000 - 54 * 3_600_000 },
  { id: "s12", type: "out", address: "EQNn2…vN2L", addressShort: "EQNn2…vN2L", amount: 6.0,   comment: "Swap",              ts: 1718000000_000 - 60 * 3_600_000 },
  { id: "s13", type: "in",  address: "EQOo3…wO6M", addressShort: "EQOo3…wO6M", amount: 3.5,   comment: "Airdrop",           ts: 1718000000_000 - 66 * 3_600_000 },
  { id: "s14", type: "out", address: "EQPp4…xP1N", addressShort: "EQPp4…xP1N", amount: 1.75,  comment: "Donation",          ts: 1718000000_000 - 72 * 3_600_000 },
  { id: "s15", type: "in",  address: "EQQq5…yQ5O", addressShort: "EQQq5…yQ5O", amount: 50.0,  comment: "Contract reward",   ts: 1718000000_000 - 78 * 3_600_000 },
  { id: "s16", type: "out", address: "EQRr6…zR0P", addressShort: "EQRr6…zR0P", amount: 12.0,  comment: "Exchange",          ts: 1718000000_000 - 84 * 3_600_000 },
  { id: "s17", type: "in",  address: "EQSs7…aS4Q", addressShort: "EQSs7…aS4Q", amount: 2.0,   comment: "Friend transfer",   ts: 1718000000_000 - 90 * 3_600_000 },
  { id: "s18", type: "out", address: "EQTt8…bT9R", addressShort: "EQTt8…bT9R", amount: 0.25,  comment: "Memo fee",          ts: 1718000000_000 - 96 * 3_600_000 },
  { id: "s19", type: "in",  address: "EQUu9…cU3S", addressShort: "EQUu9…cU3S", amount: 7.5,   comment: "Yield",             ts: 1718000000_000 - 102 * 3_600_000 },
  { id: "s20", type: "out", address: "EQVv0…dV8T", addressShort: "EQVv0…dV8T", amount: 9.0,   comment: "Bridge",            ts: 1718000000_000 - 108 * 3_600_000 },
];

const PAGE_SIZE = 10;

function fmtTs(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function fmtTon(n: number): string {
  return `${n.toFixed(2)} TON`;
}

/* ──── Inner app ─────────────────────────────────────────────────────────── */

function WalletInner({ shell, mock }: { shell?: ShellApi; mock: MockTelegram }) {
  void shell;
  void mock;

  const toast = useTKToast();

  /* connection */
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  /* balance */
  const [balance, setBalance] = useState(INITIAL_BALANCE);

  /* send flow */
  const [sendOpen, setSendOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [amountError, setAmountError] = useState<string | undefined>();

  /* history (user-generated prepended to seed) */
  const [userTxs, setUserTxs] = useState<Tx[]>([]);
  const [pageCount, setPageCount] = useState(1);

  const allTxs = [...userTxs, ...SEED_TXS];
  const visibleTxs = allTxs.slice(0, pageCount * PAGE_SIZE);
  const hasMore = visibleTxs.length < allTxs.length;

  /* ── Connect ──────────────────────────────────────────────────────────── */
  const connect = async () => {
    if (connected || connecting) return;
    setConnecting(true);
    try {
      await demoDelay(600);
      setConnected(true);
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = () => {
    setConnected(false);
    setBalance(INITIAL_BALANCE);
    setUserTxs([]);
    setPageCount(1);
    setSendOpen(false);
  };

  /* ── Send validation ──────────────────────────────────────────────────── */
  const validateAmount = (v: string): string | undefined => {
    const n = parseFloat(v);
    if (!v || isNaN(n)) return "Enter an amount";
    if (n <= 0) return "Amount must be positive";
    if (n > balance) return `Insufficient balance (${fmtTon(balance)})`;
    return undefined;
  };

  const openConfirm = () => {
    const err = validateAmount(amount);
    if (err) {
      setAmountError(err);
      return;
    }
    if (!recipient.trim()) {
      toast.error("Enter a recipient address");
      return;
    }
    setAmountError(undefined);
    setConfirmOpen(true);
  };

  /* ── Send execution ───────────────────────────────────────────────────── */
  const executeSend = async () => {
    const n = parseFloat(amount);
    if (isNaN(n) || n <= 0) return;

    setConfirmOpen(false);
    setSendOpen(false);
    setSending(true);

    try {
      await demoDelay(800);

      const newTx: Tx = {
        id: `u${Date.now()}`,
        type: "out",
        address: recipient.trim(),
        addressShort: recipient.trim().length > 10
          ? `${recipient.trim().slice(0, 6)}…${recipient.trim().slice(-4)}`
          : recipient.trim(),
        amount: n,
        comment: "Sent",
        ts: Date.now(),
      };
      setUserTxs((prev) => [newTx, ...prev]);
      setBalance((b) => parseFloat((b - n).toFixed(6)));
      setAmount("");
      setRecipient("");
      toast.success(`Sent ${fmtTon(n)} successfully`);
    } catch {
      toast.error("Transaction failed");
    } finally {
      setSending(false);
    }
  };

  /* ── Disconnected state ───────────────────────────────────────────────── */
  if (!connected) {
    return (
      <div data-demo-app="wallet" style={{ height: "100%" }}>
        <TKPage padding={16} gap={20}>
          <div style={{ textAlign: "center", padding: "24px 0 8px" }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "var(--tk-accent-12)",
                color: "var(--tk-accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px",
              }}
            >
              <TKIcon name="wallet" size={32} />
            </div>
            <div style={{ fontSize: "var(--tk-fz-title2)", fontWeight: 700 }}>TON Wallet</div>
            <div style={{ fontSize: "var(--tk-fz-sub)", color: "var(--tk-text-2)", marginTop: 4 }}>
              Connect your wallet to send and receive TON
            </div>
          </div>

          <TKWalletConnectButton
            testId="wallet-connect"
            loading={connecting}
            onClick={connect}
          />

          {connecting ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", color: "var(--tk-text-2)", fontSize: "var(--tk-fz-sub)" }}>
              <TKSpinner size={16} />
              Connecting…
            </div>
          ) : null}

          <TKListGroup footer="This demo uses an in-memory mock. No real TON transactions are made.">
            <TKCell
              icon="bolt"
              iconBg="var(--tk-orange)"
              title="Offline-clean demo"
              subtitle="No network, no real wallet required"
            />
          </TKListGroup>
        </TKPage>
      </div>
    );
  }

  /* ── Connected state ──────────────────────────────────────────────────── */
  return (
    <div data-demo-app="wallet" style={{ height: "100%", position: "relative" }}>
      <TKPage padding={16} gap={16}>
        {/* Wallet status cell */}
        <TKWalletStatusCell
          walletName="TON Wallet"
          address={WALLET_ADDRESS_SHORT}
          connected
          onClick={disconnect}
        />

        {/* Balance card */}
        <TKCard padding={20}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "var(--tk-fz-caption)", color: "var(--tk-text-2)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em" }}>
              Balance
            </div>
            <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-.02em", marginTop: 4, fontVariantNumeric: "tabular-nums" }}>
              {fmtTon(balance)}
            </div>
            <div style={{ fontSize: "var(--tk-fz-caption)", color: "var(--tk-text-2)", marginTop: 2 }}>
              {WALLET_ADDRESS_SHORT}
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 14 }}>
              <TKButton
                testId="wallet-send-open"
                variant="filled"
                size="sm"
                icon="arrowRight"
                onClick={() => setSendOpen(true)}
                disabled={sending}
              >
                {sending ? "Sending…" : "Send"}
              </TKButton>
              <TKButton variant="tonal" size="sm" icon="arrowRight" style={{ transform: "rotate(180deg) scaleY(-1)" }} onClick={() => toast.show({ icon: "check", text: "Receive address copied" })}>
                Receive
              </TKButton>
            </div>
          </div>
        </TKCard>

        {/* Send form (inline, shown when sendOpen) */}
        {sendOpen ? (
          <TKCard padding={16}>
            <div style={{ fontSize: "var(--tk-fz-body)", fontWeight: 700, marginBottom: 12 }}>Send TON</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <TKInput
                testId="wallet-amount"
                label="Amount (TON)"
                placeholder="0.00"
                inputMode="decimal"
                value={amount}
                onChange={(v) => {
                  setAmount(v);
                  if (amountError) setAmountError(validateAmount(v));
                }}
                error={amountError}
                clearable={false}
              />
              <TKInput
                label="Recipient address"
                placeholder="EQ…"
                value={recipient}
                onChange={setRecipient}
                clearable={false}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <TKButton variant="tonal" full onClick={() => { setSendOpen(false); setAmount(""); setRecipient(""); setAmountError(undefined); }}>
                  Cancel
                </TKButton>
                <TKButton variant="filled" full onClick={openConfirm}>
                  Review
                </TKButton>
              </div>
            </div>
          </TKCard>
        ) : null}

        {/* Transaction history */}
        <TKListGroup title="History">
          <TKInfiniteList
            testId="wallet-history"
            hasMore={hasMore}
            onLoadMore={() => setPageCount((p) => p + 1)}
          >
            {visibleTxs.length === 0 ? (
              <TKCell
                icon="clock"
                iconBg="var(--tk-text-3)"
                title="No transactions yet"
                subtitle="Send or receive TON to see history"
              />
            ) : (
              visibleTxs.map((tx) => (
                <TKCardCell
                  key={tx.id}
                  before={
                    <TKAvatar
                      initials={tx.type === "in" ? "↓" : "↑"}
                      size={38}
                      tone={tx.type === "in" ? "var(--tk-green-12)" : "var(--tk-red-12)"}
                    />
                  }
                  title={tx.comment}
                  subtitle={`${tx.addressShort} · ${fmtTs(tx.ts)}`}
                  after={
                    <TKBadge
                      tone={tx.type === "in" ? "green" : "red"}
                      soft
                    >
                      {tx.type === "in" ? "+" : "−"}{fmtTon(tx.amount)}
                    </TKBadge>
                  }
                />
              ))
            )}
          </TKInfiniteList>
        </TKListGroup>
      </TKPage>

      {/* Confirm send dialog */}
      <TKDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={executeSend}
        icon="arrowRight"
        tone="accent"
        title="Confirm transaction"
        text={`Send ${fmtTon(parseFloat(amount) || 0)} to ${recipient.trim().length > 12 ? `${recipient.trim().slice(0, 8)}…${recipient.trim().slice(-4)}` : recipient.trim() || "—"}?`}
        actions={
          <>
            <TKButton variant="tonal" onClick={() => setConfirmOpen(false)}>
              Cancel
            </TKButton>
            <TKButton
              testId="wallet-send-confirm"
              variant="filled"
              onClick={executeSend}
            >
              Confirm
            </TKButton>
          </>
        }
      />
    </div>
  );
}

/* ──── Root export ──────────────────────────────────────────────────────── */

export function WalletApp({ shell }: { shell?: ShellApi }) {
  const mockRef = useRef<MockTelegram | null>(null);
  if (!mockRef.current) {
    mockRef.current = createMockTelegram({ colorScheme: shell?.dark ? "dark" : "light" });
  }
  const mock = mockRef.current;

  return (
    <TKTelegramProvider webApp={mock.webApp} haptics>
      <TKToastProvider offset={80}>
        <WalletInner shell={shell} mock={mock} />
      </TKToastProvider>
    </TKTelegramProvider>
  );
}
