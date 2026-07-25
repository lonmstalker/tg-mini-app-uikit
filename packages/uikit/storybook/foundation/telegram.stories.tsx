import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  TKApp,
  TKBadge,
  TKMainButton,
  TKTelegramProvider,
  TKViewportForensics,
  useMainButton,
  useSafeArea,
  useTelegramTheme,
  useWebApp,
  type TelegramWebApp,
} from "tg-mini-app-uikit";
import { Narrow, Section } from "../story-helpers";

const webApp = {
  version: "test",
  platform: "storybook",
  colorScheme: "dark",
  MainButton: {
    setParams: () => undefined,
    onClick: () => undefined,
    offClick: () => undefined,
    showProgress: () => undefined,
    hideProgress: () => undefined,
    hide: () => undefined,
  },
  HapticFeedback: {
    impactOccurred: () => undefined,
    notificationOccurred: () => undefined,
    selectionChanged: () => undefined,
  },
} satisfies TelegramWebApp;

function RuntimeProbe() {
  const activeWebApp = useWebApp();
  const theme = useTelegramTheme();
  const safeArea = useSafeArea();
  const mainButton = useMainButton({ text: "Native action", visible: false });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
      <TKBadge tone="accent">Telegram runtime v{activeWebApp?.version}</TKBadge>
      <TKBadge tone="gray" soft>
        {theme} theme, native main button {mainButton.isSupported ? "supported" : "unsupported"}, safe top{" "}
        {safeArea.inset.top}
      </TKBadge>
    </div>
  );
}

const meta = {
  title: "Foundation/Telegram",
  parameters: {
    docs: {
      description: {
        component: "Telegram provider contract for injected WebApp runtime, native buttons, and haptics.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const RuntimeProvider = {
  render: () => (
    <TKTelegramProvider webApp={webApp} signalReady={false} haptics>
      <Section>
        <Narrow>
          <RuntimeProbe />
          <TKMainButton label="Use Telegram action" />
        </Narrow>
      </Section>
    </TKTelegramProvider>
  ),
} satisfies Story;

/**
 * `TKApp` is the one-call root: it resolves the launch (vendored bridge, never
 * `initData` presence — B5/device-testing #6), paints `html`/`body` in the host
 * theme (B4) and anchors the kit's overlays. Here it runs against the same mock
 * runtime, inside a frame, so the story shows the wiring without taking over
 * the docs page.
 */
export const AppRoot = {
  render: () => (
    <Section>
      <Narrow>
        <TKApp webApp={webApp} signalReady={false}>
          <RuntimeProbe />
        </TKApp>
      </Narrow>
    </Section>
  ),
} satisfies Story;

/**
 * On-device viewport/keyboard forensics (`?kbdebug=1`, wiki/ios-debugging.md).
 * It portals into the nearest `.tk` / `[data-tk-portal-root]` host and stays
 * `absolute` there, so the panel rides the frame below instead of the page —
 * `fixed` is unreliable in the Telegram iOS webview exactly while the keyboard
 * animates, which is what the panel exists to observe (REU-009/010, OVL-010).
 */
export const ViewportForensics = {
  render: () => (
    <Section>
      <div data-tk-portal-root style={{ position: "relative", height: 260, borderRadius: 12, overflow: "hidden", background: "var(--tk-bg)" }}>
        <TKViewportForensics />
      </div>
    </Section>
  ),
} satisfies Story;
