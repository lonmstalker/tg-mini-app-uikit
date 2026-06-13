/**
 * TonConnectExample.tsx
 * ─────────────────────
 * Standalone reference showing how to swap WalletApp's in-memory mock for a
 * real TON wallet via @tonconnect/ui-react.
 *
 * This file is NOT imported by the demo app (examples/demo/) because:
 *   1. The demo must remain offline-clean (no CDN/network at build or runtime).
 *   2. @tonconnect/ui-react is not listed in the demo's dependencies.
 *
 * To use this pattern in a production mini app:
 *
 *   npm install @tonconnect/ui-react
 *
 * and copy the integration points shown below into your project.
 */

// ─── 1. Install the package ──────────────────────────────────────────────────
//
//   npm install @tonconnect/ui-react
//
// ─── 2. Create a tonconnect-manifest.json in your /public folder ────────────
//
//   {
//     "url": "https://your-app-url.com",
//     "name": "My TON App",
//     "iconUrl": "https://your-app-url.com/icon.png"
//   }
//
// ─── 3. Wrap your app with TonConnectUIProvider ──────────────────────────────

import type { ReactNode } from "react";

// ─── Type stubs ──────────────────────────────────────────────────────────────
// The actual types live in @tonconnect/ui-react. These stubs keep this file
// compilable in the offline-clean demo monorepo without installing the package.
// Remove them in a real project and import from "@tonconnect/ui-react" directly.

interface TonConnectUIProviderProps {
  manifestUrl: string;
  children?: ReactNode;
}

declare function TonConnectUIProvider(props: TonConnectUIProviderProps): JSX.Element;

interface TonConnectButtonProps {
  className?: string;
  style?: React.CSSProperties;
}

declare function TonConnectButton(props: TonConnectButtonProps): JSX.Element;

interface Wallet {
  account?: { address?: string };
}

declare function useTonConnectUI(): [{ wallet: Wallet | null }];
declare function useTonWallet(): Wallet | null;

// ─── End of type stubs ───────────────────────────────────────────────────────

// In a real project replace the stubs above with:
//
//   import {
//     TonConnectUIProvider,
//     TonConnectButton,
//     useTonConnectUI,
//     useTonWallet,
//   } from "@tonconnect/ui-react";

import { TKWalletConnectButton, TKWalletStatusCell } from "tg-mini-app-uikit";

// ─── App root ────────────────────────────────────────────────────────────────

/**
 * Wrap your entire app with `TonConnectUIProvider` once — at the root level,
 * alongside `TKTelegramProvider`.
 *
 * ```tsx
 * import { TonConnectUIProvider } from "@tonconnect/ui-react";
 * import { TKTelegramProvider } from "tg-mini-app-uikit";
 *
 * export function AppRoot() {
 *   return (
 *     <TonConnectUIProvider manifestUrl="https://your-app.com/tonconnect-manifest.json">
 *       <TKTelegramProvider haptics>
 *         <App />
 *       </TKTelegramProvider>
 *     </TonConnectUIProvider>
 *   );
 * }
 * ```
 */
export function TonConnectAppRoot({ children }: { children?: ReactNode }) {
  return (
    <TonConnectUIProvider manifestUrl="https://your-app.com/tonconnect-manifest.json">
      {children}
    </TonConnectUIProvider>
  );
}

// ─── Drop-in replacement for WalletApp's connect button ──────────────────────

/**
 * Replace `WalletApp`'s `TKWalletConnectButton` onClick handler with the
 * `TonConnectButton` from @tonconnect/ui-react.
 *
 * Option A — use the built-in TonConnect button:
 *   <TonConnectButton />
 *
 * Option B — wrap `TKWalletConnectButton` so it matches the kit's visual style:
 */
export function ConnectSection() {
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();

  if (wallet?.account?.address) {
    // Connected — show kit status cell (same as WalletApp's connected state)
    const addr = wallet.account.address;
    const short = addr.length > 10 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr;
    return (
      <TKWalletStatusCell
        walletName="TON Wallet"
        address={short}
        connected
        onClick={() => tonConnectUI[0]?.wallet != null
          ? void 0 // open disconnect modal — call tonConnectUI.disconnect() in real code
          : undefined}
      />
    );
  }

  // Disconnected — kit connect button opens the TonConnect modal
  return (
    <TKWalletConnectButton
      onClick={() => void 0 /* call tonConnectUI.openModal() in real code */}
    />
  );
}

// ─── TonConnect native button (raw) ──────────────────────────────────────────

/**
 * The raw `<TonConnectButton />` component from @tonconnect/ui-react renders
 * its own styled button (a TON-branded CTA). Use it when you don't need the
 * kit's visual language.
 *
 * ```tsx
 * import { TonConnectButton } from "@tonconnect/ui-react";
 * // ...
 * <TonConnectButton />
 * ```
 */
export function NativeTonConnectButton() {
  return <TonConnectButton />;
}

// ─── Why this file is outside examples/demo/src ──────────────────────────────
//
// The demo shell (examples/demo/) is intentionally offline-clean:
//   - no network requests at runtime or build time
//   - no real Telegram WebApp — a mock is injected via TKTelegramProvider
//   - all "external" packages are shimmed or omitted
//
// @tonconnect/ui-react connects to the TON blockchain, fetches wallet metadata,
// and opens a WalletConnect session. These operations require:
//   - a running internet connection
//   - a tonconnect-manifest.json served from a real URL
//   - a real Telegram WebApp context (for tg:// deep links)
//
// None of those preconditions can be satisfied in the offline demo. Therefore
// this reference lives in examples/ton-connect/ — it is compiled only when
// you explicitly install @tonconnect/ui-react in your own project.
