import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import {
  TKAvatar,
  TKBadge,
  TKButton,
  TKCell,
  TKDialog,
  TKIcon,
  TKInput,
  TKListGroup,
  TKPage,
  TKSegmented,
  TKSpinner,
  TKSwitch,
  TKTelegramProvider,
  TKToastProvider,
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
import {
  createMockTelegram,
  resolveMockColors,
  type MockSensorState,
  type MockSensorValues,
  type MockTelegram,
  type MockTelegramState,
} from "../../telegram/mock";
import type { ShellApi } from "../../shell/types";

/*
 * Platform Lab — the kit's Telegram layer running against a mock
 * `window.Telegram.WebApp`. The surrounding "client" (header, chat,
 * bottom buttons, popups) is rendered by the demo from the mock state,
 * so every hook behaves exactly as it would inside Telegram.
 */

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div
        style={{
          fontSize: "var(--tk-fz-caption)",
          fontWeight: 600,
          letterSpacing: ".05em",
          textTransform: "uppercase",
          color: "var(--tk-text-3)",
        }}
      >
        {title}
      </div>
      {children}
    </section>
  );
}

function Card({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        background: "var(--tk-surface)",
        borderRadius: "var(--tk-r-md)",
        boxShadow: "var(--tk-shadow-sm)",
        padding: "12px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {children}
    </div>
  );
}

function KV({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: "var(--tk-fz-sub)" }}>
      <span style={{ color: "var(--tk-text-2)" }}>{label}</span>
      <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{value}</span>
    </div>
  );
}

function ColorKV({ label, value }: { label: string; value?: string }) {
  return (
    <KV
      label={label}
      value={
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span
            aria-hidden
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: value,
              boxShadow: "inset 0 0 0 1px var(--tk-sep)",
            }}
          />
          {value ?? "—"}
        </span>
      }
    />
  );
}

const fmtReading = (n?: number) => (n == null ? "—" : n.toFixed(2));

function SensorRow({
  label,
  sensor,
  format,
  onStart,
  onStop,
  testId,
}: {
  label: string;
  sensor: MockSensorState;
  format: (values: MockSensorValues) => string;
  onStart: () => void;
  onStop: () => void;
  testId: string;
}) {
  return (
    <div data-demo-sensor={testId} style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "var(--tk-fz-sub)", fontWeight: 600 }}>{label}</div>
        <div
          style={{
            fontSize: "var(--tk-fz-caption)",
            color: "var(--tk-text-2)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {sensor.isStarted ? format(sensor.values) : "not started"}
        </div>
      </div>
      <TKButton size="sm" variant={sensor.isStarted ? "tonal" : "filled"} onClick={sensor.isStarted ? onStop : onStart}>
        {sensor.isStarted ? "Stop" : "Start"}
      </TKButton>
    </div>
  );
}

function HookStatus({
  label,
  hook,
}: {
  label: string;
  hook: { isSupported: boolean; status?: ReactNode; error?: ReactNode };
}) {
  return (
    <KV
      label={label}
      value={
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <TKBadge tone={hook.isSupported ? "green" : "gray"} soft>
            {hook.isSupported ? "supported" : "fallback"}
          </TKBadge>
          <span>{hook.status ?? "idle"}</span>
          {hook.error ? <span style={{ color: "var(--tk-red)" }}>{hook.error}</span> : null}
        </span>
      }
    />
  );
}

export function PlatformApp({ shell }: { shell: ShellApi }) {
  const mockRef = useRef<MockTelegram | null>(null);
  // Launch with the page theme, like the real client: a light mock under a
  // dark shell would make the mount-time sync effects fight forever.
  if (!mockRef.current) mockRef.current = createMockTelegram({ colorScheme: shell.dark ? "dark" : "light" });
  const mock = mockRef.current;
  const state = useSyncExternalStore(mock.subscribe, mock.getState);
  const [highlight, setHighlight] = useState(false);

  // Two-way theme sync: the mock plays the Telegram client, the shell owns the page theme.
  useEffect(() => {
    const dark = state.colorScheme === "dark";
    if (shell.dark !== dark) shell.setDark(dark);
  }, [state.colorScheme]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    mock.setColorScheme(shell.dark ? "dark" : "light");
  }, [shell.dark]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <TKTelegramProvider webApp={mock.webApp}>
      <Chrome mock={mock} state={state} highlight={highlight} setHighlight={setHighlight} />
    </TKTelegramProvider>
  );
}

/* ---------------- Telegram client chrome ---------------- */

function Chrome({
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
  const tp = state.themeParams;
  const chromeColors = resolveMockColors(state);
  const chatRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startY: number; startH: number; moved: boolean } | null>(null);
  const rafRef = useRef<number | null>(null);
  const targetHRef = useRef(0);
  const [dragging, setDragging] = useState(false);

  const toggleViewport = () => {
    if (state.isExpanded) mock.collapse();
    else mock.webApp.expand?.();
  };

  const onGrabberDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* no active pointer (e.g. synthetic events) — dragging still works */
    }
    dragRef.current = { startY: e.clientY, startH: state.viewportHeight, moved: false };
    setDragging(true);
  };
  // One state commit per frame, however many pointermoves the browser delivers.
  const onGrabberMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d) return;
    const dy = d.startY - e.clientY; // up = positive = taller
    if (Math.abs(dy) > 4) d.moved = true;
    if (!d.moved) return;
    targetHRef.current = d.startH + dy;
    if (rafRef.current == null) {
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        mock.dragViewport(targetHRef.current);
      });
    }
  };
  // A pending frame firing after the snap would yank the sheet — flush first.
  const flushDrag = () => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      mock.dragViewport(targetHRef.current);
    }
  };
  const onGrabberUp = () => {
    const d = dragRef.current;
    dragRef.current = null;
    setDragging(false);
    if (!d) return;
    if (d.moved) {
      flushDrag();
      mock.endViewportDrag();
    } else {
      toggleViewport(); // a plain tap toggles, like tapping the sheet edge
    }
  };
  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    const el = chatRef.current;
    if (!el) return;
    const sync = () => mock.setViewportBounds(Math.round(el.getBoundingClientRect().height));
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, [mock]);

  const chromeButton = (label: string, onClick: () => void, active = false) => (
    <button
      type="button"
      aria-label={label === "✕" ? "Close mini app" : "Menu"}
      onClick={onClick}
      style={{
        width: 30,
        height: 30,
        border: "none",
        borderRadius: "50%",
        background: active ? `color-mix(in srgb, ${tp.link_color} 18%, transparent)` : "transparent",
        color: active ? tp.link_color : tp.hint_color,
        fontSize: 15,
        fontWeight: 700,
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      {label}
    </button>
  );

  return (
    <div data-demo-app="platform" style={{ height: "100%", display: "flex", flexDirection: "column", position: "relative", background: tp.secondary_bg_color }}>
      {/* Telegram header (the client's own chrome, not the mini app) */}
      <div
        data-demo-platform-header
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "56px 10px 8px",
          background: chromeColors.header, // setHeaderColor() repaints the client header
          transition: "background-color .25s ease",
          borderBottom: `0.5px solid ${tp.section_separator_color}`,
          color: tp.text_color,
        }}
      >
        <span style={{ width: 28, display: "inline-flex", justifyContent: "center" }}>
          {state.back.visible ? (
            <button
              type="button"
              aria-label="Back"
              onClick={mock.clickBack}
              style={{ border: "none", background: "transparent", color: tp.link_color, display: "inline-flex", padding: 0, cursor: "pointer" }}
            >
              <TKIcon name="chevronLeft" size={24} strokeWidth={2.3} />
            </button>
          ) : null}
        </span>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Platform Lab</div>
          <div style={{ fontSize: 11.5, color: tp.hint_color }}>mini app</div>
        </div>
        {state.settings.visible ? chromeButton("⚙", mock.clickSettings, true) : null}
        {chromeButton("⋯", () => mock.clickSettings(), false)}
        {chromeButton("✕", () => mock.webApp.close?.(), false)}
      </div>

      {/* Chat area behind the mini app */}
      <div ref={chatRef} style={{ flex: 1, minHeight: 0, position: "relative", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            top: 14,
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: 12,
            color: tp.hint_color,
          }}
        >
          chat with @uikit_demo_bot
        </div>

        {state.closed ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              color: tp.text_color,
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 600 }}>Mini app closed</div>
            <div style={{ fontSize: 13, color: tp.hint_color, maxWidth: 220, textAlign: "center" }}>
              `close()` was called — in Telegram the panel slides away.
            </div>
            <TKButton size="sm" pill onClick={mock.relaunch}>
              Relaunch
            </TKButton>
          </div>
        ) : (
          <div
            data-demo-platform-sheet
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: state.viewportHeight,
              transition: dragging ? "none" : "height 340ms cubic-bezier(.3, .8, .3, 1)",
              contain: "layout paint", // scope the height-animation reflow to the sheet
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              background: "var(--tk-bg)",
              borderRadius: state.isExpanded ? 0 : "14px 14px 0 0",
              boxShadow: "0 -10px 30px rgba(0,0,0,.18)",
            }}
          >
            {/* Grabber: drag to resize the mini app, tap to toggle — like the real sheet edge */}
            <div
              role="button"
              data-demo-platform-grabber
              tabIndex={0}
              aria-label={state.isExpanded ? "Collapse the mini app" : "Expand the mini app"}
              onPointerDown={onGrabberDown}
              onPointerMove={onGrabberMove}
              onPointerUp={onGrabberUp}
              onPointerCancel={onGrabberUp}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleViewport();
                }
              }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 24,
                zIndex: 9,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                paddingTop: 6,
                gap: 3,
                cursor: dragging ? "grabbing" : "grab",
                touchAction: "none",
                outline: "none",
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 4,
                  borderRadius: 2,
                  background: tp.hint_color,
                  opacity: dragging ? 0.85 : state.isExpanded ? 0.3 : 0.55,
                  transition: "opacity .2s ease",
                }}
              />
              {!state.isExpanded && !dragging ? (
                <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: ".05em", textTransform: "uppercase", color: tp.hint_color }}>
                  drag up to expand
                </div>
              ) : null}
            </div>

            {/* The mini app itself */}
            <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
              <TKToastProvider offset={14}>
                <Lab mock={mock} state={state} highlight={highlight} setHighlight={setHighlight} />
              </TKToastProvider>

              {/* Safe-area visualizer */}
              {highlight ? (
                <>
                  {state.contentSafeAreaInset.top ? (
                    <Zone top={state.safeAreaInset.top} height={state.contentSafeAreaInset.top} color="#e89623" label="content inset (chrome)" />
                  ) : null}
                  {state.safeAreaInset.top ? (
                    <Zone top={0} height={state.safeAreaInset.top} color="#e5484d" label="safe-area top" />
                  ) : null}
                  {state.safeAreaInset.bottom ? (
                    <Zone bottom={0} height={state.safeAreaInset.bottom} color="#e5484d" label="safe-area bottom" />
                  ) : null}
                </>
              ) : null}
            </div>

            {/* Native bottom buttons rendered by the "client" */}
            {state.main.visible || state.secondary.visible ? (
              <div
                data-demo-platform-bottombar
                style={{
                  flexShrink: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 7,
                  padding: "7px 12px 10px",
                  background: chromeColors.bottomBar, // setBottomBarColor() repaints the bar
                  transition: "background-color .25s ease",
                  borderTop: `0.5px solid ${tp.section_separator_color}`,
                }}
              >
                {state.secondary.visible ? (
                  <NativeButton
                    text={state.secondary.text}
                    active={state.secondary.active}
                    progress={state.secondary.progress}
                    background={`color-mix(in srgb, ${tp.button_color ?? "#3390ec"} 14%, transparent)`}
                    color={state.secondary.textColor ?? tp.button_color ?? "#3390ec"}
                    onClick={mock.clickSecondary}
                  />
                ) : null}
                {state.main.visible ? (
                  <NativeButton
                    text={state.main.text}
                    active={state.main.active}
                    progress={state.main.progress}
                    background={state.main.color ?? tp.button_color ?? "#3390ec"}
                    color={state.main.textColor ?? tp.button_text_color ?? "#fff"}
                    onClick={mock.clickMain}
                  />
                ) : null}
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Native popup, rendered by the "client" on top of everything */}
      <TKDialog
        open={state.popup !== null}
        onClose={() => mock.resolvePopup(undefined)}
        title={state.popup?.params.title}
        text={state.popup?.params.message}
        actions={state.popup?.params.buttons?.map((b, i) => (
          <TKButton
            key={b.id ?? i}
            variant={b.type === "destructive" ? "destructive" : b.type === "cancel" || b.type === "close" ? "tonal" : "filled"}
            onClick={() => mock.resolvePopup(b.id)}
          >
            {b.text ?? (b.type === "ok" ? "OK" : b.type === "cancel" ? "Cancel" : "Close")}
          </TKButton>
        ))}
      />
    </div>
  );
}

function Zone({ top, bottom, height, color, label }: { top?: number; bottom?: number; height: number; color: string; label: string }) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top,
        bottom,
        height,
        background: `color-mix(in srgb, ${color} 22%, transparent)`,
        borderBottom: top != null ? `1.5px dashed ${color}` : undefined,
        borderTop: bottom != null ? `1.5px dashed ${color}` : undefined,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: ".04em",
        textTransform: "uppercase",
        color,
        pointerEvents: "none",
        zIndex: 8,
      }}
    >
      {height >= 16 ? label : null}
    </div>
  );
}

function NativeButton({
  text,
  active,
  progress,
  background,
  color,
  onClick,
}: {
  text: string;
  active: boolean;
  progress: boolean;
  background: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        height: 50,
        border: "none",
        borderRadius: 12,
        background,
        color,
        fontSize: 16,
        fontWeight: 600,
        fontFamily: "inherit",
        cursor: active && !progress ? "pointer" : "default",
        opacity: active || progress ? 1 : 0.55,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        transition: "opacity .2s ease, background .2s ease",
      }}
    >
      {progress ? <TKSpinner color={color} size={20} /> : text}
    </button>
  );
}

/* ---------------- The mini app content (kit hooks live here) ---------------- */

function Lab({
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

      <Section title="Permissions · QR, clipboard, access">
        <Card>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
            <TKButton
              size="sm"
              variant="surface"
              disabled={!contact.isSupported}
              onClick={async () => toast.show({ icon: "user", text: `contact → ${await contact.request()}` })}
            >
              Contact
            </TKButton>
            <TKButton
              size="sm"
              variant="surface"
              disabled={!writeAccess.isSupported}
              onClick={async () => toast.show({ icon: "chat", text: `write → ${await writeAccess.request()}` })}
            >
              Write access
            </TKButton>
            <TKButton
              size="sm"
              variant="surface"
              disabled={!qr.isSupported}
              onClick={async () => toast.show({ icon: "grid", text: (await qr.open({ text: "Scan demo QR" })) ?? "no QR" })}
            >
              QR scan
            </TKButton>
            <TKButton
              size="sm"
              variant="surface"
              disabled={!clipboard.isSupported}
              onClick={async () => toast.show({ icon: "check", text: (await clipboard.readText()) ?? "empty clipboard" })}
            >
              Clipboard
            </TKButton>
            <TKButton
              size="sm"
              variant="surface"
              onClick={async () => toast.show({ icon: "home", text: `home → ${await homeScreen.check()}` })}
            >
              Home status
            </TKButton>
            <TKButton size="sm" variant="surface" onClick={() => homeScreen.add()}>
              Add home
            </TKButton>
            <TKButton
              size="sm"
              variant="surface"
              disabled={!emojiStatus.isSupported}
              onClick={async () => toast.show({ icon: "star", text: `emoji → ${await emojiStatus.set("5368324170671202286")}` })}
            >
              Emoji status
            </TKButton>
            <TKButton
              size="sm"
              variant="surface"
              disabled={!downloadFile.isSupported}
              onClick={async () => toast.show({ icon: "share", text: `download → ${await downloadFile.download({ url: "/demo.txt", fileName: "demo.txt" })}` })}
            >
              Download
            </TKButton>
            <TKButton
              size="sm"
              variant="surface"
              disabled={!chatRequest.isSupported}
              onClick={async () => toast.show({ icon: "chat", text: `chat → ${await chatRequest.request("prepared-demo-chat")}` })}
            >
              Request chat
            </TKButton>
            <TKButton
              size="sm"
              variant="surface"
              disabled={!location.isSupported}
              onClick={async () => toast.show({ icon: "location", text: (await location.getLocation()) ? "location ok" : "no location" })}
            >
              Location
            </TKButton>
            <TKButton
              size="sm"
              variant="surface"
              disabled={!biometrics.isSupported}
              onClick={async () => toast.show({ icon: "bolt", text: `biometric → ${(await biometrics.authenticate("Demo auth")).ok}` })}
            >
              Biometrics
            </TKButton>
            <TKButton
              size="sm"
              variant="surface"
              disabled={!sensors.accelerometer.isSupported}
              onClick={async () => toast.show({ icon: "tune", text: `sensor → ${await sensors.accelerometer.start(30)}` })}
            >
              Sensor
            </TKButton>
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            <HookStatus label="share" hook={share} />
            <HookStatus label="contact" hook={contact} />
            <HookStatus label="write access" hook={writeAccess} />
            <HookStatus label="qr" hook={qr} />
            <HookStatus label="clipboard" hook={clipboard} />
            <HookStatus label="emoji" hook={emojiStatus} />
            <HookStatus label="download" hook={downloadFile} />
            <HookStatus label="chat" hook={chatRequest} />
            <HookStatus label="location" hook={location} />
            <HookStatus label="biometrics" hook={biometrics} />
            <HookStatus label="accelerometer" hook={sensors.accelerometer} />
          </div>
        </Card>
      </Section>

      <Section title="Sensors · useMotionSensors">
        <Card>
          <SensorRow
            label="Accelerometer"
            sensor={state.sensors.accelerometer}
            format={(v) => `x ${fmtReading(v.x)} · y ${fmtReading(v.y)} · z ${fmtReading(v.z)} m/s²`}
            onStart={() => sensors.accelerometer.start(30)}
            onStop={() => sensors.accelerometer.stop()}
            testId="accelerometer"
          />
          <SensorRow
            label="Device orientation"
            sensor={state.sensors.deviceOrientation}
            format={(v) =>
              `α ${fmtReading(v.alpha)} · β ${fmtReading(v.beta)} · γ ${fmtReading(v.gamma)}${
                state.sensors.deviceOrientation.absolute ? " · absolute" : ""
              }`
            }
            onStart={() => sensors.deviceOrientation.start(60, { needAbsolute })}
            onStop={() => sensors.deviceOrientation.stop()}
            testId="orientation"
          />
          <SensorRow
            label="Gyroscope"
            sensor={state.sensors.gyroscope}
            format={(v) => `x ${fmtReading(v.x)} · y ${fmtReading(v.y)} · z ${fmtReading(v.z)} rad/s`}
            onStart={() => sensors.gyroscope.start(60)}
            onStop={() => sensors.gyroscope.stop()}
            testId="gyroscope"
          />
          <TKSwitch label="Absolute orientation (need_absolute)" checked={needAbsolute} onChange={setNeedAbsolute} />
        </Card>
      </Section>

      <Section title="Cloud storage · restore on launch">
        <Card>
          <TKInput label="Note" placeholder="Anything to remember" value={note} onChange={setNote} />
          <div style={{ display: "flex", gap: 8 }}>
            <TKButton
              size="sm"
              full
              onClick={async () => {
                await cloud.set("note", note);
                setStoredNote(note);
                toast.success("Saved to CloudStorage");
              }}
            >
              Save
            </TKButton>
            <TKButton
              size="sm"
              full
              variant="tonal"
              onClick={async () => {
                const v = await cloud.get("note");
                setStoredNote(v);
                setNote(v ?? "");
                toast.show({ text: v != null ? "Restored" : "Nothing stored yet" });
              }}
            >
              Load
            </TKButton>
            <TKButton
              size="sm"
              full
              variant="destructive"
              onClick={async () => {
                await cloud.remove("note");
                setStoredNote(null);
                toast.show({ icon: "trash", text: "Removed" });
              }}
            >
              Clear
            </TKButton>
          </div>
          <KV label="stored value" value={storedNote ?? "—"} />
          <KV label="backend" value={cloud.isSupported ? "Telegram CloudStorage" : "localStorage fallback"} />
        </Card>
      </Section>

      <Section title="Device & secure storage">
        <Card>
          <div style={{ display: "flex", gap: 8 }}>
            <TKButton
              size="sm"
              full
              variant="surface"
              onClick={async () => {
                await deviceStorage.set("draft", "local device draft");
                setDeviceValue(await deviceStorage.get("draft"));
                toast.success("DeviceStorage saved");
              }}
            >
              Device set
            </TKButton>
            <TKButton
              size="sm"
              full
              variant="surface"
              onClick={async () => {
                await secureStorage.set("token", "secure-demo-token");
                setSecureValue(await secureStorage.get("token"));
                toast.success("SecureStorage saved");
              }}
            >
              Secure set
            </TKButton>
          </div>
          <KV label="device value" value={deviceValue ?? "—"} />
          <KV label="secure value" value={secureValue ? "••••••••" : "—"} />
        </Card>
      </Section>

      <Section title="Closing · confirmation">
        <Card>
          <TKSwitch label="Ask before closing" checked={confirmClose} onChange={setConfirmClose} />
          <KV label="isClosingConfirmationEnabled" value={String(webApp?.isClosingConfirmationEnabled ?? false)} />
          <TKButton variant="destructive" full onClick={() => webApp?.close?.()}>
            Close mini app
          </TKButton>
        </Card>
      </Section>

      <Section title="Event log">
        <TKListGroup footer="Every WebApp call and event the mock receives, newest first.">
          <div
            role="log"
            aria-label="Event log"
            tabIndex={0}
            style={{ padding: "10px 14px", maxHeight: 180, overflowY: "auto" }}
          >
            {state.log.length === 0 ? (
              <div style={{ fontSize: "var(--tk-fz-caption)", color: "var(--tk-text-3)" }}>quiet so far…</div>
            ) : (
              state.log.map((line) => (
                <div
                  key={line.id}
                  style={{
                    fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
                    fontSize: "var(--tk-fz-caption)",
                    color: "var(--tk-text-2)",
                    padding: "2px 0",
                  }}
                >
                  {line.text}
                </div>
              ))
            )}
          </div>
        </TKListGroup>
      </Section>

    </TKPage>
  );
}
