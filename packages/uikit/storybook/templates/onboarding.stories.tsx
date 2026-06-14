import { useRef } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { TKButton, TKConfetti, TKOnboardingTooltip } from "tg-mini-app-uikit";
import { AppScreen, Screen } from "../story-helpers";

const meta = {
  title: "Templates/Onboarding",
  parameters: {
    docs: {
      description: {
        component: "Onboarding coach marks and reward burst templates.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const CoachMark = {
  parameters: { fullBleed: true },
  render: () => {
    const ref = useRef<HTMLButtonElement>(null);
    return (
      <>
        <AppScreen>
          <TKButton ref={ref}>Connect source</TKButton>
        </AppScreen>
        <TKOnboardingTooltip
          steps={[{ target: ref, title: "Connect source", text: "Start by linking a Telegram-ready data source." }]}
          testId="onboarding-tooltip"
        />
      </>
    );
  },
} satisfies Story;

export const ConfettiBurst = {
  parameters: { fullBleed: true },
  render: () => (
    <Screen style={{ position: "relative" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: 16, gap: 6 }}>
        <div style={{ fontWeight: 700 }}>Payment complete</div>
        <div style={{ color: "var(--tk-text-2)" }}>Reward animation resolves automatically.</div>
      </div>
      <TKConfetti count={24} duration={1200} testId="template-confetti" />
    </Screen>
  ),
} satisfies Story;
