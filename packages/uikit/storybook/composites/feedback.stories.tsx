import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  TKBars,
  TKEmptyState,
  TKFrame,
  TKProgress,
  TKRing,
  TKSkeleton,
  TKSkeletonCard,
  TKSkeletonList,
  TKSkeletonText,
  TKTimeline,
} from "tg-mini-app-uikit";
import { Grid, Narrow, Section } from "../story-helpers";

const meta = {
  title: "Composites/Feedback",
  parameters: {
    docs: {
      description: {
        component: "Reusable feedback composites: skeletons, progress, charts, empty states, and timelines.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Skeletons = {
  render: () => (
    <TKFrame height={460}>
      <Section>
        <Grid>
          <TKSkeletonCard testId="feedback-skeletons" />
          <TKSkeletonList rows={3} />
        </Grid>
        <Narrow>
          <TKSkeletonText lines={4} />
          <TKSkeleton width="42%" />
        </Narrow>
      </Section>
    </TKFrame>
  ),
} satisfies Story;

export const ProgressAndBars = {
  render: () => (
    <TKFrame height={440}>
      <Section>
        <Narrow>
          <TKProgress value={72} label="Upload progress" />
        </Narrow>
        <Grid>
          <TKRing value={0.64} label="Goal progress">
            64%
          </TKRing>
          <TKBars data={[3, 7, 5, 9, 6]} labels={["Mon", "Tue", "Wed", "Thu", "Fri"]} />
        </Grid>
      </Section>
    </TKFrame>
  ),
} satisfies Story;

export const EmptyAndTimeline = {
  render: () => (
    <TKFrame height={520}>
      <Section>
        <TKEmptyState title="No orders" text="Try another filter or create a new order." cta="Reset" />
        <Narrow>
          <TKTimeline
            steps={[
              { label: "Ordered", time: "10:00", status: "done" },
              { label: "Packed", time: "10:18", status: "active" },
              { label: "Delivered", status: "pending" },
            ]}
          />
        </Narrow>
      </Section>
    </TKFrame>
  ),
} satisfies Story;
