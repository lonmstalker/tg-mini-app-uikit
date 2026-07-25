import { useEffect, useState } from "react";
import { useTonAddress, useTonConnectUI, useTonWallet } from "@tonconnect/ui-react";
import {
  TKButton,
  TKCell,
  TKDialog,
  TKInput,
  TKListGroup,
  TKPage,
  TKSwitch,
  TKText,
  TKTitle,
  TKWalletConnectButton,
  TKWalletStatusCell,
  useNav,
} from "tg-mini-app-uikit";
import { useClosingConfirmation, useInitData, useOptionalHaptics, useTelegramPopup } from "@tg-mini-app/telegram";
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
  // Device check for the KB-4 dialog fix: a dialog with a text field must stay
  // centered in the VISIBLE viewport while the on-screen keyboard is open —
  // and must not jump under a host-managed viewport (Telegram iOS).
  const [renameOpen, setRenameOpen] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");

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

  const popup = useTelegramPopup();
  // Native confirm where the real client provides one; the in-DOM TKDialog
  // covers browsers AND the mock (whose popups wait for a manual resolve).
  const askDisconnect = async () => {
    if (!mock && popup.isSupported) {
      const pressed = await popup.show({
        title: t("wallet.disconnectTitle"),
        message: t("wallet.disconnectBody"),
        buttons: [
          { id: "disconnect", type: "destructive", text: t("wallet.disconnect") },
          { id: "cancel", type: "cancel" },
        ],
      });
      if (pressed === "disconnect") disconnect();
      return;
    }
    setDisconnectOpen(true);
  };

  const walletName = tonWallet?.device.appName ?? t("wallet.name");

  return (
    <TKPage testId="panel-profile-home">
      <TKTitle level={1}>{t("profile.title")}</TKTitle>
      {user || displayName ? (
        <TKText tone="secondary">{t("profile.greeting", { name: displayName ?? user?.first_name ?? "" })}</TKText>
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
              onClick={() => void askDisconnect()}
            />
          ) : null}
        </TKListGroup>
      ) : null}
      <TKListGroup title={t("settings.demoSection")}>
        <TKCell
          testId="profile-rename"
          icon="user"
          title={t("profile.rename")}
          subtitle={t("profile.renameSub")}
          chevron
          onClick={() => {
            setDraftName(displayName ?? user?.first_name ?? "");
            setRenameOpen(true);
          }}
        />
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
        open={renameOpen}
        onClose={() => setRenameOpen(false)}
        title={t("profile.rename")}
        onConfirm={() => {
          setDisplayName(draftName.trim() || null);
          setRenameOpen(false);
        }}
        testId="rename-dialog"
        actions={
          <>
            <TKButton variant="plain" onClick={() => setRenameOpen(false)}>
              {t("common.cancel")}
            </TKButton>
            <TKButton
              testId="rename-save"
              onClick={() => {
                setDisplayName(draftName.trim() || null);
                setRenameOpen(false);
              }}
            >
              {t("common.save")}
            </TKButton>
          </>
        }
      >
        <TKInput label={t("profile.renameLabel")} value={draftName} onChange={setDraftName} testId="rename-input" />
      </TKDialog>

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
