import { useEffect, useState } from "react";
import { useTonAddress, useTonConnectUI, useTonWallet } from "@tonconnect/ui-react";
import {
  TKButton,
  TKCell,
  TKDialog,
  TKListGroup,
  TKPage,
  TKSwitch,
  TKText,
  TKTitle,
  TKWalletConnectButton,
  TKWalletStatusCell,
  useClosingConfirmation,
  useInitData,
  useNav,
  useOptionalHaptics,
} from "tg-mini-app-uikit";
import { useT } from "../../i18n";
import { useAppDispatch, useAppState } from "../../store";
import { useMockHandle } from "../../telegram/mock-context";
import { PinGate } from "./PinGate";

const DEMO_ADDRESS = "EQDrjaLahLkMB-hMCmkzOyBuHJ139ZUYmPHu6RRBKnt7hi2";

export function Profile() {
  const t = useT();
  const nav = useNav();
  const { user } = useInitData();
  const { wallet } = useAppState();
  const dispatch = useAppDispatch();
  const haptics = useOptionalHaptics();
  const [tonConnectUI] = useTonConnectUI();
  const tonWallet = useTonWallet();
  const tonAddress = useTonAddress();
  const mock = useMockHandle();

  const [gateOpen, setGateOpen] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [disconnectOpen, setDisconnectOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  // The setting is a mock/demo control; in a real Mini App it is invisible and
  // should not arm a close prompt unexpectedly.
  useClosingConfirmation(mock ? closing : false);

  const onGateSuccess = async () => {
    setGateOpen(false);
    setConnecting(true);
    if (mock) {
      window.setTimeout(() => {
        dispatch({ type: "SET_WALLET", payload: { connected: true, address: DEMO_ADDRESS, trailPassActive: true } });
        haptics.notification("success");
        setConnecting(false);
      }, 500);
      return;
    }
    try {
      await tonConnectUI.openModal();
    } finally {
      setConnecting(false);
    }
  };

  useEffect(() => {
    if (mock) return;
    if (tonAddress) {
      if (!wallet.connected || wallet.address !== tonAddress) {
        dispatch({ type: "SET_WALLET", payload: { connected: true, address: tonAddress, trailPassActive: true } });
      }
      return;
    }
    if (wallet.connected) {
      dispatch({ type: "SET_WALLET", payload: { connected: false, address: null, trailPassActive: false } });
    }
  }, [dispatch, mock, tonAddress, wallet.address, wallet.connected]);

  const disconnect = () => {
    if (!mock && tonWallet) void tonConnectUI.disconnect();
    dispatch({ type: "SET_WALLET", payload: { connected: false, address: null, trailPassActive: false } });
    setDisconnectOpen(false);
  };

  const walletName = tonWallet?.device.appName ?? t("wallet.name");

  return (
    <TKPage testId="panel-profile-home">
      <TKTitle level={1}>{t("profile.title")}</TKTitle>
      {user ? (
        <TKText tone="secondary">{t("profile.greeting", { name: user.first_name ?? "" })}</TKText>
      ) : null}

      <TKListGroup title={t("profile.walletSection")}>
        {wallet.connected ? (
          <>
            <TKWalletStatusCell
              testId="wallet-status"
              connected
              walletName={walletName}
              address={wallet.address ?? ""}
              status={t("wallet.status.active")}
            />
            <TKCell
              testId="trail-pass"
              icon="bolt"
              iconBg="var(--tk-green)"
              title={t("trailPass.title")}
              subtitle={t("trailPass.subtitle")}
            />
          </>
        ) : (
          <div style={{ padding: 12 }}>
            <TKWalletConnectButton
              testId="wallet-connect"
              connected={false}
              label={t("wallet.connect")}
              loading={connecting}
              onClick={() => setGateOpen(true)}
            />
          </div>
        )}
      </TKListGroup>

      {mock || wallet.connected ? (
        <TKListGroup title={t("settings.title")}>
          {mock ? (
            <TKCell
              icon="lock"
              title={t("settings.closing")}
              after={
                <TKSwitch
                  ariaLabel={t("settings.closing")}
                  checked={closing}
                  onChange={setClosing}
                  testId="closing-switch"
                />
              }
            />
          ) : null}
          {wallet.connected ? (
            <TKCell
              testId="wallet-disconnect"
              icon="logout"
              title={t("wallet.disconnect")}
              onClick={() => setDisconnectOpen(true)}
            />
          ) : null}
        </TKListGroup>
      ) : null}
      <TKListGroup title={t("settings.demoSection")}>
        <TKCell
          testId="open-lab"
          icon="tune"
          title={t("settings.lab")}
          subtitle={t("settings.labSub")}
          chevron
          onClick={() => nav.push("lab")}
        />
      </TKListGroup>

      <PinGate open={gateOpen} onClose={() => setGateOpen(false)} onSuccess={onGateSuccess} />

      <TKDialog
        open={disconnectOpen}
        onClose={() => setDisconnectOpen(false)}
        icon="warning"
        tone="red"
        title={t("wallet.disconnectTitle")}
        text={t("wallet.disconnectBody")}
        actions={
          <>
            <TKButton variant="plain" onClick={() => setDisconnectOpen(false)}>
              {t("common.cancel")}
            </TKButton>
            <TKButton variant="destructive" testId="disconnect-confirm" onClick={disconnect}>
              {t("wallet.disconnect")}
            </TKButton>
          </>
        }
      />
    </TKPage>
  );
}
