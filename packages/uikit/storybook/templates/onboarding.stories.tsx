import { useRef } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { TKButton, TKConfetti, TKFrame, TKOnboardingTooltip } from "tg-mini-app-uikit";
import { Narrow, Section } from "../story-helpers";

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
  render: () => {
    const ref = useRef<HTMLButtonElement>(null);
    return (
      <TKFrame height={380}>
        <Section>
          <Narrow>
            <TKButton ref={ref}>Connect source</TKButton>
            <TKOnboardingTooltip
              steps={[{ target: ref, title: "Connect source", text: "Start by linking a Telegram-ready data source." }]}
              testId="onboarding-tooltip"
            />
          </Narrow>
        </Section>
      </TKFrame>
    );
  },
} satisfies Story;

export const ConfettiBurst = {
  render: () => (
    <TKFrame height={320}>
      <div style={{ position: "relative", minHeight: "100%" }}>
        <Section>
          <Narrow>
            <div style={{ fontWeight: 700 }}>Payment complete</div>
            <div style={{ color: "var(--tk-text-2)" }}>Reward animation resolves automatically.</div>
          </Narrow>
        </Section>
        <TKConfetti count={24} duration={1200} testId="template-confetti" />
      </div>
    </TKFrame>
  ),
} satisfies Story;
