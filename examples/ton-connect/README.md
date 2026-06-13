# TON Connect integration reference

This folder shows how to swap `WalletApp`'s in-memory mock for a real TON
wallet using [`@tonconnect/ui-react`](https://github.com/ton-connect/sdk).

The reference code lives **outside** `examples/demo/src/` deliberately — the
demo must stay offline-clean (no CDN calls, no real network). See
[Why outside the demo?](#why-outside-the-demo) for the full rationale.

---

## Quick start

### 1. Install the package

```bash
npm install @tonconnect/ui-react
```

### 2. Create a manifest

Create `public/tonconnect-manifest.json` in your project:

```json
{
  "url": "https://your-app-url.com",
  "name": "My TON App",
  "iconUrl": "https://your-app-url.com/icon.png"
}
```

### 3. Wrap your app root

```tsx
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { TKTelegramProvider } from "tg-mini-app-uikit";

export function AppRoot() {
  return (
    <TonConnectUIProvider manifestUrl="https://your-app.com/tonconnect-manifest.json">
      <TKTelegramProvider haptics>
        <App />
      </TKTelegramProvider>
    </TonConnectUIProvider>
  );
}
```

### 4. Replace the mock connect button

`WalletApp` uses a locally-resolved mock. In a real app, call `tonConnectUI.openModal()`:

```tsx
import { TonConnectButton, useTonConnectUI, useTonWallet } from "@tonconnect/ui-react";
import { TKWalletConnectButton, TKWalletStatusCell } from "tg-mini-app-uikit";

function ConnectSection() {
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();

  if (wallet?.account?.address) {
    const addr = wallet.account.address;
    const short = `${addr.slice(0, 6)}…${addr.slice(-4)}`;
    return (
      <TKWalletStatusCell
        walletName="TON Wallet"
        address={short}
        connected
        onClick={() => tonConnectUI.disconnect()}
      />
    );
  }

  return (
    <TKWalletConnectButton onClick={() => tonConnectUI.openModal()} />
  );
}
```

Alternatively, use the stock `<TonConnectButton />` from the SDK if you don't
need the kit's visual language.

---

## File overview

| File | Purpose |
|---|---|
| `TonConnectExample.tsx` | Drop-in reference — copy integration points into your project |
| `README.md` | This guide |

---

## Mock vs. real wallet

| | `WalletApp` (demo) | Real integration |
|---|---|---|
| Connect | `demoDelay(600)` resolves immediately | Opens WalletConnect / Telegram wallet sheet |
| Address | Hard-coded `EQD4…9f2A` | Live from `wallet.account.address` |
| Balance | In-memory number | Query the TON blockchain via your backend |
| Send | `demoDelay(800)` → prepend to history | Sign & broadcast transaction via `@ton/core` |
| History | Static seeded array | Fetch from TON Center / your indexer API |

The architectural swap is minimal: replace the `connect()` / `executeSend()`
callbacks in `WalletApp` with calls to the TonConnect SDK and your own
blockchain client.

---

## Why outside the demo?

`examples/demo/` is intentionally offline-clean:

- No network requests at runtime or build time.
- The Telegram WebApp is replaced by a `createMockTelegram()` inject.
- All async effects use `demoDelay()` — no real I/O.

`@tonconnect/ui-react` needs:

1. A real internet connection (fetches wallet metadata, opens WalletConnect sessions).
2. A `tonconnect-manifest.json` served from a resolvable URL.
3. A real Telegram WebApp context for `tg://` deep links.

None of those can be satisfied in the offline demo, so this reference lives
here and is only compiled when you `npm install @tonconnect/ui-react` in your
own project.
