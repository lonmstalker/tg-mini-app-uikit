import type { ReactNode } from "react";
import { TKBadge } from "../../atoms/display";
import { TKIcon } from "../../atoms/icons";
import { useTKLocale } from "../../foundation/i18n";

export interface TKWalletConnectButtonProps {
  connected?: boolean;
  label?: ReactNode;
  connectedLabel?: ReactNode;
  address?: ReactNode;
  walletName?: ReactNode;
  loading?: boolean;
  onClick?: () => void;
  testId?: string;
}

export function TKWalletConnectButton({
  connected,
  label,
  connectedLabel,
  address,
  walletName,
  loading,
  onClick,
  testId,
}: TKWalletConnectButtonProps) {
  const locale = useTKLocale();
  return (
    <button
      type="button"
      data-testid={testId}
      className="tk-press"
      onClick={onClick}
      disabled={loading}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 12,
        border: "none",
        borderRadius: "var(--tk-r-lg)",
        padding: "12px 14px",
        background: connected ? "var(--tk-surface)" : "var(--tk-accent)",
        color: connected ? "var(--tk-text)" : "var(--tk-on-accent)",
        boxShadow: connected ? "var(--tk-shadow-sm)" : "0 12px 24px -12px var(--tk-accent-35)",
        fontFamily: "inherit",
        cursor: loading ? "default" : "pointer",
        opacity: loading ? 0.72 : 1,
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 38,
          height: 38,
          borderRadius: "var(--tk-r-sm)",
          background: connected ? "var(--tk-accent-12)" : "rgba(255,255,255,.18)",
          color: connected ? "var(--tk-accent)" : "currentColor",
          flexShrink: 0,
        }}
      >
        <TKIcon name="wallet" size={20} />
      </span>
      <span style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
        <span style={{ display: "block", fontSize: "var(--tk-fz-body)", fontWeight: 700 }}>
          {connected ? (connectedLabel ?? locale.walletConnected) : (label ?? locale.connectWallet)}
        </span>
        {connected && (address || walletName) ? (
          <span
            style={{
              display: "block",
              marginTop: 1,
              fontSize: "var(--tk-fz-caption)",
              color: "var(--tk-text-2)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {walletName ? <>{walletName}</> : null}
            {walletName && address ? " · " : null}
            {address ? <>{address}</> : null}
          </span>
        ) : null}
      </span>
      <TKIcon name={connected ? "chevronRight" : "arrowRight"} size={18} />
    </button>
  );
}

export interface TKWalletStatusCellProps {
  walletName?: ReactNode;
  address?: ReactNode;
  status?: ReactNode;
  connected?: boolean;
  onClick?: () => void;
  testId?: string;
}

export function TKWalletStatusCell({
  walletName,
  address,
  status,
  connected,
  onClick,
  testId,
}: TKWalletStatusCellProps) {
  const locale = useTKLocale();
  return (
    <button
      type="button"
      data-testid={testId}
      onClick={onClick}
      className="tk-press tk-press-soft"
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 12,
        border: "none",
        borderRadius: "var(--tk-r-md)",
        padding: "11px 14px",
        background: "var(--tk-surface)",
        color: "var(--tk-text)",
        boxShadow: "var(--tk-shadow-sm)",
        fontFamily: "inherit",
        textAlign: "left",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 34,
          height: 34,
          borderRadius: "var(--tk-r-xs)",
          background: connected ? "var(--tk-green-12)" : "var(--tk-surface-2)",
          color: connected ? "var(--tk-green)" : "var(--tk-text-2)",
          flexShrink: 0,
        }}
      >
        <TKIcon name="wallet" size={18} />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: "var(--tk-fz-body)", fontWeight: 600 }}>{walletName ?? locale.wallet}</span>
        {address ? (
          <span
            style={{
              display: "block",
              fontSize: "var(--tk-fz-caption)",
              color: "var(--tk-text-2)",
              marginTop: 1,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {address}
          </span>
        ) : null}
      </span>
      {status ?? (
        <TKBadge tone={connected ? "green" : "gray"} soft>
          {connected ? locale.connected : locale.disconnected}
        </TKBadge>
      )}
    </button>
  );
}
