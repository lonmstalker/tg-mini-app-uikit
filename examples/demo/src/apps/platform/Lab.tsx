import { useEffect, useState } from "react";
import {
  TKAvatar,
  TKBadge,
  TKButton,
  TKCell,
  TKInput,
  TKListGroup,
  TKPage,
  TKSegmented,
  TKSwitch,
  useActivity,
  useBiometrics,
  useCloudStorage,
  useClosingConfirmation,
  useBackButton,
  useChatRequest,
  useClipboard,
  useContactRequest,
  useDataTransport,
  useDeviceStorage,
  useDownloadFile,
  useEmojiStatus,
  useFullscreen,
  useHaptics,
  useHideKeyboard,
  useHomeScreen,
  useInitData,
  useInvoice,
  useLocation,
  useMainButton,
  useMotionSensors,
  useOrientationLock,
  useQrScanner,
  useSafeArea,
  useSecureStorage,
  useSecondaryButton,
  useSettingsButton,
  useShare,
  useTelegramColors,
  useTelegramLinks,
  useTelegramPopup,
  useTKToast,
  useVerticalSwipes,
  useViewport,
  useWebApp,
  useWriteAccess,
  type TelegramThemeParams,
} from "tg-mini-app-uikit";
import type { MockTelegram, MockTelegramState } from "../../telegram/mock";
import { LabAdvancedSections } from "./LabAdvancedSections";
import { BackPriorityDemo, Card, ColorKV, KV, Section } from "./shared";

/* ---------------- The mini app content (kit hooks live here) ---------------- */

export function Lab({
  mock,
  state,
  highlight,
  setHighlight,
}: {
  mock: MockTelegram;
  state: MockTelegramState;
  highlight: boolean;
  setHighlight: (on: boolean) => void;
}) {
  const toast = useTKToast();
  const webApp = useWebApp();
  const { user, startParam } = useInitData();
  const viewport = useViewport();
  const activity = useActivity();
  const fullscreen = useFullscreen();
  const { inset, contentInset } = useSafeArea();
  const haptics = useHaptics();
  const popup = useTelegramPopup();
  const cloud = useCloudStorage();
  const deviceStorage = useDeviceStorage();
  const secureStorage = useSecureStorage();
  const links = useTelegramLinks();
  const colors = useTelegramColors();
  const invoice = useInvoice();
  const share = useShare();
  const transport = useDataTransport();
  const contact = useContactRequest();
  const writeAccess = useWriteAccess();
  const clipboard = useClipboard();
  const qr = useQrScanner();
  const homeScreen = useHomeScreen();
  const emojiStatus = useEmojiStatus();
  const downloadFile = useDownloadFile();
  const chatRequest = useChatRequest();
  const keyboard = useHideKeyboard();
  const biometrics = useBiometrics();
  const location = useLocation();
  const sensors = useMotionSensors();
  const verticalSwipes = useVerticalSwipes();
  const orientation = useOrientationLock();

  // Native buttons — fully driven by the declarative hooks.
  const [mainText, setMainText] = useState("CONTINUE");
  const [mainVisible, setMainVisible] = useState(true);
  const [mainLoading, setMainLoading] = useState(false);
  const [mainDisabled, setMainDisabled] = useState(false);
  const [secondaryVisible, setSecondaryVisible] = useState(false);
  const [backVisible, setBackVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [needAbsolute, setNeedAbsolute] = useState(false);

  useMainButton({
    text: mainText,
    visible: mainVisible,
    loading: mainLoading,
    disabled: mainDisabled,
    onClick: () => {
      haptics.notification("success");
      toast.success("MainButton.onClick fired");
    },
  });
  useSecondaryButton({
    text: "Cancel",
    visible: secondaryVisible,
    onClick: () => toast.show({ icon: "close", text: "SecondaryButton.onClick fired" }),
  });
  useBackButton(() => toast.show({ icon: "chevronLeft", text: "BackButton.onClick fired" }), backVisible);
  useSettingsButton(() => toast.show({ icon: "tune", text: "SettingsButton.onClick fired" }), settingsVisible);
  useClosingConfirmation(confirmClose);

  // Cloud storage: restore on mount, the same pattern a real app would use.
  const [note, setNote] = useState("");
  const [storedNote, setStoredNote] = useState<string | null>(null);
  const [deviceValue, setDeviceValue] = useState<string | null>(null);
  const [secureValue, setSecureValue] = useState<string | null>(null);
  useEffect(() => {
    cloud.get("note").then((v) => {
      setStoredNote(v);
      if (v != null) setNote(v);
    });
  }, [cloud]);

  return (
    <TKPage padding={16} gap={20}>
      {!state.isExpanded ? (
        <TKListGroup>
          <TKCell
            icon="bolt"
            iconBg="var(--tk-orange)"
            title="Compact launch height"
            subtitle="Mini apps open half-screen — drag the grabber up or call expand()"
          />
        </TKListGroup>
      ) : null}

      <Section title="Back priorities · sheet beats stack">
        <Card>
          <div style={{ fontSize: "var(--tk-fz-caption)", color: "var(--tk-text-2)" }}>
            The kit keeps a LIFO back-handler queue: an open sheet consumes the native Back press first; the next press pops the nav stack.
          </div>
          <BackPriorityDemo onPressBack={mock.clickBack} backVisible={state.back.visible} />
        </Card>
      </Section>

      <Section title="Init data · user">
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <TKAvatar initials={`${user?.first_name?.[0] ?? "?"}${user?.last_name?.[0] ?? ""}`} size={46} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700 }}>
                {user?.first_name} {user?.last_name}{" "}
                {user?.is_premium ? <TKBadge soft style={{ marginLeft: 2 }}>Premium</TKBadge> : null}
              </div>
              <div style={{ fontSize: "var(--tk-fz-caption)", color: "var(--tk-text-2)" }}>
                @{user?.username} · id {user?.id}
              </div>
            </div>
          </div>
          <KV label="start_param" value={startParam ?? "—"} />
          <KV label="platform / version" value={`${webApp?.platform} · ${webApp?.version}`} />
        </Card>
      </Section>

      <Section title="Theme · themeChanged">
        <TKSegmented
          full
          options={[
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
          ]}
          value={state.colorScheme}
          onChange={(v) => mock.setColorScheme(v as "light" | "dark")}
        />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {(["bg_color", "secondary_bg_color", "button_color", "text_color", "hint_color", "destructive_text_color"] as const).map(
            (key) => (
              <span
                key={key}
                title={key}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: "var(--tk-fz-caption2)",
                  color: "var(--tk-text-2)",
                  background: "var(--tk-surface)",
                  borderRadius: "var(--tk-r-pill)",
                  padding: "3px 8px 3px 4px",
                  boxShadow: "var(--tk-shadow-sm)",
                }}
              >
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: (state.themeParams as TelegramThemeParams)[key],
                    boxShadow: "inset 0 0 0 1px var(--tk-sep)",
                  }}
                />
                {key.replace(/_color$/, "")}
              </span>
            ),
          )}
        </div>
      </Section>

      <Section title="Appearance · setHeaderColor">
        <Card>
          <ColorKV label="headerColor" value={colors.headerColor} />
          <ColorKV label="backgroundColor" value={colors.backgroundColor} />
          <ColorKV label="bottomBarColor" value={colors.bottomBarColor} />
          <div style={{ display: "flex", gap: 8 }}>
            <TKButton size="sm" full onClick={() => colors.setHeaderColor("#3390ec")}>
              Accent header
            </TKButton>
            <TKButton size="sm" full variant="tonal" onClick={() => colors.setHeaderColor("bg_color")}>
              Reset header
            </TKButton>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <TKButton size="sm" full variant="surface" onClick={() => colors.setBackgroundColor("secondary_bg_color")}>
              Tint background
            </TKButton>
            <TKButton size="sm" full variant="surface" onClick={() => colors.setBottomBarColor("#1c93e3")}>
              Accent bottom bar
            </TKButton>
          </div>
        </Card>
      </Section>

      <Section title="Viewport · expand()">
        <Card>
          <KV label="viewportHeight" value={`${Math.round(viewport.height ?? 0)} px`} />
          <KV label="viewportStableHeight" value={`${Math.round(viewport.stableHeight ?? 0)} px`} />
          <KV label="isExpanded" value={String(viewport.isExpanded)} />
          <div style={{ display: "flex", gap: 8 }}>
            <TKButton size="sm" full onClick={() => viewport.expand()} disabled={viewport.isExpanded}>
              Expand
            </TKButton>
            <TKButton size="sm" full variant="tonal" onClick={mock.collapse} disabled={!viewport.isExpanded}>
              Collapse
            </TKButton>
          </div>
        </Card>
      </Section>

      <Section title="Safe area · TKPage insets">
        <Card>
          <TKSwitch label="Device cutouts (notch, home bar)" checked={state.safeAreaInset.top > 0} onChange={mock.setDeviceCutouts} />
          <TKSwitch label="Telegram chrome (fullscreen)" checked={state.contentSafeAreaInset.top > 0} onChange={mock.setChromeInset} />
          <TKSwitch label="Highlight zones" checked={highlight} onChange={setHighlight} />
          <KV label="safeAreaInset" value={`${inset.top} / ${inset.bottom}`} />
          <KV label="contentSafeAreaInset" value={`${contentInset.top} / ${contentInset.bottom}`} />
        </Card>
      </Section>

      <Section title="Fullscreen · activity">
        <Card>
          <KV label="isActive" value={String(activity.isActive)} />
          <KV label="isFullscreen" value={String(fullscreen.isFullscreen)} />
          {fullscreen.lastError ? <KV label="fullscreen error" value={fullscreen.lastError} /> : null}
          <div style={{ display: "flex", gap: 8 }}>
            <TKButton size="sm" full onClick={() => fullscreen.request()} disabled={fullscreen.isFullscreen}>
              Fullscreen
            </TKButton>
            <TKButton size="sm" full variant="tonal" onClick={() => fullscreen.exit()} disabled={!fullscreen.isFullscreen}>
              Exit
            </TKButton>
          </div>
          <TKSwitch
            label="Vertical swipes to close"
            checked={verticalSwipes.isEnabled}
            onChange={(on) => (on ? verticalSwipes.enable() : verticalSwipes.disable())}
          />
          <TKSwitch
            label="Lock orientation"
            checked={orientation.isLocked}
            onChange={(on) => (on ? orientation.lock() : orientation.unlock())}
          />
        </Card>
      </Section>

      <Section title="Main button · useMainButton">
        <Card>
          <TKInput label="Text" value={mainText} onChange={setMainText} clearable={false} />
          <TKSwitch label="Visible" checked={mainVisible} onChange={setMainVisible} />
          <TKSwitch label="Loading (showProgress)" checked={mainLoading} onChange={setMainLoading} />
          <TKSwitch label="Disabled" checked={mainDisabled} onChange={setMainDisabled} />
        </Card>
      </Section>

      <Section title="Other native buttons">
        <Card>
          <TKSwitch label="Secondary button" checked={secondaryVisible} onChange={setSecondaryVisible} />
          <TKSwitch label="Back button (in the header)" checked={backVisible} onChange={setBackVisible} />
          <TKSwitch label="Settings button (⚙ in the header)" checked={settingsVisible} onChange={setSettingsVisible} />
        </Card>
      </Section>

      <Section title="Haptics · useHaptics">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <TKButton size="sm" variant="tonal" onClick={() => haptics.impact("light")}>impact light</TKButton>
          <TKButton size="sm" variant="tonal" onClick={() => haptics.impact("medium")}>medium</TKButton>
          <TKButton size="sm" variant="tonal" onClick={() => haptics.impact("heavy")}>heavy</TKButton>
          <TKButton size="sm" variant="tonal" onClick={() => haptics.selection()}>selection</TKButton>
          <TKButton size="sm" variant="tonal" onClick={() => haptics.notification("success")}>success</TKButton>
          <TKButton size="sm" variant="tonal" onClick={() => haptics.notification("error")}>error</TKButton>
        </div>
        <div key={state.haptic?.seq ?? 0} className="tk-pop" style={{ fontSize: "var(--tk-fz-caption)", color: "var(--tk-text-2)" }}>
          {state.haptic ? `last: ${state.haptic.kind}` : "no haptic feedback yet"}
        </div>
      </Section>

      <Section title="Popups · useTelegramPopup">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <TKButton size="sm" variant="surface" onClick={() => popup.alert("Saved to your Telegram account.")}>
            Alert
          </TKButton>
          <TKButton
            size="sm"
            variant="surface"
            onClick={async () => {
              const ok = await popup.confirm("Delete this draft?");
              toast.show({ icon: ok ? "check" : "close", text: `confirm → ${ok}` });
            }}
          >
            Confirm
          </TKButton>
          <TKButton
            size="sm"
            variant="surface"
            onClick={async () => {
              const id = await popup.show({
                title: "Share order",
                message: "Send the receipt to the chat?",
                buttons: [
                  { id: "send", type: "default", text: "Send" },
                  { id: "copy", type: "default", text: "Copy link" },
                  { id: "cancel", type: "cancel" },
                ],
              });
              toast.show({ icon: "share", text: `popup → ${id ?? "dismissed"}` });
            }}
          >
            3-button popup
          </TKButton>
        </div>
      </Section>

      <Section title="Client APIs · links, invoice, share">
        <Card>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
            <TKButton size="sm" variant="surface" onClick={() => links.openLink("https://core.telegram.org/bots/webapps")}>
              Open link
            </TKButton>
            <TKButton size="sm" variant="surface" onClick={() => links.openTelegramLink("https://t.me/telegram")}>
              Telegram link
            </TKButton>
            <TKButton
              size="sm"
              variant="surface"
              onClick={async () => toast.show({ icon: "card", text: `invoice → ${await invoice.open("https://t.me/invoice/demo")}` })}
            >
              Invoice
            </TKButton>
            <TKButton
              size="sm"
              variant="surface"
              disabled={!share.isSupported}
              onClick={async () => toast.show({ icon: "share", text: `share → ${await share.shareMessage("demo-message")}` })}
            >
              Share
            </TKButton>
            <TKButton size="sm" variant="surface" onClick={() => transport.sendData(JSON.stringify({ ok: true }))}>
              sendData
            </TKButton>
            <TKButton size="sm" variant="surface" onClick={() => transport.switchInlineQuery("uikit demo", ["users", "groups"])}>
              Inline query
            </TKButton>
            <TKButton size="sm" variant="surface" onClick={() => colors.setBottomBarColor(state.themeParams.bottom_bar_bg_color ?? "#f2f4f8")}>
              Bottom color
            </TKButton>
            <TKButton size="sm" variant="surface" onClick={() => keyboard.hide()}>
              Hide keyboard
            </TKButton>
          </div>
        </Card>
      </Section>

      <LabAdvancedSections
        state={state}
        toast={toast}
        webApp={webApp}
        cloud={cloud}
        deviceStorage={deviceStorage}
        secureStorage={secureStorage}
        share={share}
        contact={contact}
        writeAccess={writeAccess}
        clipboard={clipboard}
        qr={qr}
        homeScreen={homeScreen}
        emojiStatus={emojiStatus}
        downloadFile={downloadFile}
        chatRequest={chatRequest}
        biometrics={biometrics}
        location={location}
        sensors={sensors}
        needAbsolute={needAbsolute}
        setNeedAbsolute={setNeedAbsolute}
        note={note}
        setNote={setNote}
        storedNote={storedNote}
        setStoredNote={setStoredNote}
        deviceValue={deviceValue}
        setDeviceValue={setDeviceValue}
        secureValue={secureValue}
        setSecureValue={setSecureValue}
        confirmClose={confirmClose}
        setConfirmClose={setConfirmClose}
      />

    </TKPage>
  );
}
