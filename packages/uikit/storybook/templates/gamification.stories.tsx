import type { Meta, StoryObj } from "@storybook/react-vite";
import { TKLeaderboard, TKXPHeader } from "tg-mini-app-uikit";
import { AppScreen } from "../story-helpers";

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
  parameters: { fullBleed: true },
  render: () => (
    <AppScreen>
      <TKXPHeader name="Anna" initials="AK" level={7} xp={68} hint="320 XP to next level" />
      <TKLeaderboard
        rows={[
          { rank: 1, initials: "MK", name: "Mira", points: "9,420" },
          { rank: 2, initials: "AK", name: "Anna", points: "8,880", you: true },
          { rank: 3, initials: "DS", name: "Dan", points: "7,910" },
        ]}
      />
    </AppScreen>
  ),
} satisfies Story;
