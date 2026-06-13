import type { Meta } from "@storybook/react-vite";
import {
  TKBadge,
  TKBars,
  TKConfetti,
  TKCounter,
  TKDot,
  TKEmptyState,
  TKPageDots,
  TKProgress,
  TKRing,
  TKSkeleton,
  TKSkeletonCard,
  TKSkeletonList,
  TKSkeletonText,
  TKSteps,
  TKText,
  TKTimeline,
} from "tg-mini-app-uikit";
import { Grid, Row, Section, noop } from "../story-helpers";

const meta = {
  title: "Tokens/Feedback & Indicators",
  parameters: {
    docs: {
      description: {
        component: "Status indicators, counters, loading skeletons, progress, and empty states.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = Record<string, unknown>;

type SkeletonArgs = {
  kind: "line" | "text" | "card" | "list";
};

export const Indicators = {
  render: () => (
    <Row>
      <TKBadge>New</TKBadge>
      <TKBadge tone="green" soft>
        Paid
      </TKBadge>
      <TKBadge tone="red">Alert</TKBadge>
      <TKDot pulse />
      <TKCounter value={128} max={99} />
    </Row>
  ),
} satisfies Story;

export const Skeletons = {
  args: {
    kind: "text",
  },
  argTypes: {
    kind: { control: "select", options: ["line", "text", "card", "list"] },
  },
  render: ({ kind }: SkeletonArgs) => (
    <Section>
      {kind === "line" ? <TKSkeleton width={180} /> : null}
      {kind === "text" ? <TKSkeletonText lines={3} /> : null}
      {kind === "card" ? <TKSkeletonCard /> : null}
      {kind === "list" ? <TKSkeletonList rows={4} /> : null}
    </Section>
  ),
} satisfies Story;

export const ProgressFeedback = {
  render: () => (
    <Grid>
      <TKProgress value={68} label="Uploading" />
      <TKRing value={72}>
        <TKText weight={700}>72%</TKText>
      </TKRing>
      <TKBars data={[8, 16, 10, 24, 18]} labels={["M", "T", "W", "T", "F"]} />
      <TKSteps steps={["Cart", "Pay", "Done"]} current={1} />
      <TKPageDots count={4} defaultPage={1} />
    </Grid>
  ),
} satisfies Story;

export const EmptyAndTimeline = {
  render: () => (
    <Section>
      <TKEmptyState icon="cart" title="No items" text="Your cart is empty." cta="Browse products" onCta={noop} />
      <TKTimeline
        steps={[
          { label: "Created", time: "09:41", status: "done" },
          { label: "Packing", time: "10:12", status: "active" },
          { label: "Delivery", time: "Today", status: "pending" },
        ]}
      />
      <TKConfetti count={42} />
    </Section>
  ),
} satisfies Story;
