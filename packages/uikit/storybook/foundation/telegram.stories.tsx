import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  TKBadge,
  TKMainButton,
  TKTelegramProvider,
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
