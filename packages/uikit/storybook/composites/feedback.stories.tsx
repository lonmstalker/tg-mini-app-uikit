import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  AsyncBoundary,
  TKAsyncState,
  TKBars,
  TKEmptyState,
  TKProgress,
  TKRing,
  TKSkeleton,
  TKSkeletonCard,
  TKSkeletonList,
  TKSkeletonTable,
  TKSkeletonText,
  TKTimeline,
} from "tg-mini-app-uikit";
import { AppScreen, Grid, Narrow } from "../story-helpers";

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
  parameters: { fullBleed: true },
  render: () => (
    <AppScreen>
      <Grid>
        <TKSkeletonCard testId="feedback-skeletons" />
        <TKSkeletonList rows={3} />
      </Grid>
      <TKSkeletonTable rows={4} columns={3} />
      <Narrow>
        <TKSkeletonText lines={4} />
        <TKSkeleton width="42%" />
      </Narrow>
    </AppScreen>
  ),
} satisfies Story;

export const ProgressAndBars = {
  parameters: { fullBleed: true },
  render: () => (
    <AppScreen>
      <Narrow>
        <TKProgress value={72} label="Upload progress" />
      </Narrow>
      <Grid>
        <TKRing value={0.64} label="Goal progress">
          64%
        </TKRing>
        <TKBars data={[3, 7, 5, 9, 6]} labels={["Mon", "Tue", "Wed", "Thu", "Fri"]} />
      </Grid>
    </AppScreen>
  ),
} satisfies Story;

export const EmptyAndTimeline = {
  parameters: { fullBleed: true },
  render: () => (
    <AppScreen>
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
    </AppScreen>
  ),
} satisfies Story;

export const AsyncStates = {
  // The one place a screen branches loading → skeleton, error → retry, empty.
  render: () => (
    <Grid>
      <AsyncBoundary loading>
        <div>ready</div>
      </AsyncBoundary>
      <AsyncBoundary error onRetry={() => {}} errorTitle="Couldn't load" errorText="Check your connection and try again." retryLabel="Retry">
        <div>ready</div>
      </AsyncBoundary>
      <AsyncBoundary empty emptyIcon="search" emptyTitle="No results" emptyText="Try another search.">
        <div>ready</div>
      </AsyncBoundary>
      <TKAsyncState status="empty" emptyIcon="ticket" emptyTitle="Nothing here yet" emptyText="It will show up here." />
    </Grid>
  ),
} satisfies Story;
