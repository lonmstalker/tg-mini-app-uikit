import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  AsyncBoundary,
  TKAsyncState,
  TKBars,
  TKButton,
  TKEmptyState,
  TKIcon,
  TKNoticeBar,
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

function NoticeBarsPreview() {
  // Real render/unrender so the closing collapse + onClose contract plays live.
  const [open, setOpen] = useState(true);
  return (
    <AppScreen>
      <Narrow>
        <TKNoticeBar icon={<TKIcon name="info" size={18} />}>Payouts arrive within 24 hours.</TKNoticeBar>
        <TKNoticeBar tone="green" icon={<TKIcon name="check" size={18} />}>
          Order confirmed — receipt sent to Saved Messages.
        </TKNoticeBar>
        <TKNoticeBar tone="orange" action={<a href="#renew">Renew</a>}>
          Subscription expires in 3 days.
        </TKNoticeBar>
        <TKNoticeBar tone="red">Payments are temporarily unavailable.</TKNoticeBar>
        {open ? (
          <TKNoticeBar closable onClose={() => setOpen(false)} testId="feedback-notice">
            Closable notice — content below slides up.
          </TKNoticeBar>
        ) : (
          <TKButton variant="surface" onClick={() => setOpen(true)}>
            Show notice again
          </TKButton>
        )}
        <TKNoticeBar marquee icon={<TKIcon name="star" size={18} />}>
          Season sale: −40% on annual plans until Sunday, plus bonus stars for every referred friend who
          completes a first order.
        </TKNoticeBar>
      </Narrow>
    </AppScreen>
  );
}

export const NoticeBars = {
  parameters: { fullBleed: true },
  render: () => <NoticeBarsPreview />,
} satisfies Story;

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

// Cycling values so the fill/stroke transitions actually play on value change.
const PROGRESS_STEPS = [
  { progress: 72, ring: 0.64, bars: [3, 7, 5, 9, 6] },
  { progress: 28, ring: 0.21, bars: [8, 2, 6, 4, 9] },
  { progress: 94, ring: 0.88, bars: [5, 5, 8, 3, 7] },
];

function ProgressPreview() {
  const [step, setStep] = useState(0);
  const { progress, ring, bars } = PROGRESS_STEPS[step % PROGRESS_STEPS.length];
  return (
    <AppScreen>
      <Narrow>
        <TKButton variant="surface" onClick={() => setStep((s) => s + 1)}>
          Change values
        </TKButton>
        <TKProgress value={progress} label="Upload progress" />
      </Narrow>
      <Grid>
        <TKRing value={ring} label="Goal progress">
          {Math.round(ring * 100)}%
        </TKRing>
        <TKBars data={bars} labels={["Mon", "Tue", "Wed", "Thu", "Fri"]} />
      </Grid>
    </AppScreen>
  );
}

export const ProgressAndBars = {
  parameters: { fullBleed: true },
  render: () => <ProgressPreview />,
} satisfies Story;

/** REU-003: `color` recolors the fill per instance — no dist-diving for private CSS vars. */
export const ProgressColors = {
  parameters: { fullBleed: true },
  render: () => (
    <AppScreen>
      <Narrow>
        <TKProgress value={72} label="Food" color="var(--tk-green)" />
        <TKProgress value={45} label="Transport" color="var(--tk-orange)" />
        <TKProgress value={20} label="Fun" color="linear-gradient(90deg, #7c4dff, #448aff)" />
      </Narrow>
      <Grid>
        <TKRing value={0.62} label="Savings" color="var(--tk-green)">
          62%
        </TKRing>
        <TKBars data={[4, 9, 6, 12, 7]} labels={["Mon", "Tue", "Wed", "Thu", "Fri"]} color="var(--tk-orange)" />
      </Grid>
    </AppScreen>
  ),
} satisfies Story;

export const EmptyAndTimeline = {
  parameters: { fullBleed: true },
  render: () => (
    <AppScreen>
      {/* REU-002: the illustration is explicit — no icon/media means no circle. */}
      <TKEmptyState icon="cart" title="No orders" text="Try another filter or create a new order." cta="Reset" />
      <TKEmptyState title="Text-only empty state" text="No invented illustration when icon/media are omitted." />
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
