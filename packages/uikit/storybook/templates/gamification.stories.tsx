import type { Meta, StoryObj } from "@storybook/react-vite";
import { TKFrame, TKLeaderboard, TKXPHeader } from "tg-mini-app-uikit";
import { Narrow, Section } from "../story-helpers";

const meta = {
  title: "Templates/Gamification",
  parameters: {
    docs: {
      description: {
        component: "Progress and leaderboard templates for lightweight reward loops.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const ProgressAndLeaderboard = {
  render: () => (
    <TKFrame height={460}>
      <Section>
        <Narrow>
          <TKXPHeader name="Anna" initials="AK" level={7} xp={68} hint="320 XP to next level" />
          <TKLeaderboard
            rows={[
              { rank: 1, initials: "MK", name: "Mira", points: "9,420" },
              { rank: 2, initials: "AK", name: "Anna", points: "8,880", you: true },
              { rank: 3, initials: "DS", name: "Dan", points: "7,910" },
            ]}
          />
        </Narrow>
      </Section>
    </TKFrame>
  ),
} satisfies Story;
