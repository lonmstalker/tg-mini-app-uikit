import { useState } from "react";
import type { Meta } from "@storybook/react-vite";
import {
  TKAccordion,
  TKBadge,
  TKCell,
  TKInfiniteList,
  TKListGroup,
  TKPullToRefresh,
  TKSelectable,
  TKSwipeCell,
  TKVirtualList,
} from "tg-mini-app-uikit";
import { Narrow, Section } from "../../story-helpers";

const meta = {
  title: "Components/Lists",
  parameters: {
    docs: {
      description: {
        component: "List rows, grouped lists, expandable rows, selection rows, and list behavior variants.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = Record<string, unknown>;

function InfiniteListExample() {
  const [items, setItems] = useState(() => Array.from({ length: 4 }, (_, i) => `Loaded item ${i + 1}`));
  return (
    <TKInfiniteList
      hasMore={items.length < 8}
      onLoadMore={() => setItems((current) => [...current, `Loaded item ${current.length + 1}`, `Loaded item ${current.length + 2}`])}
    >
      <TKListGroup inset={false}>
        {items.map((item) => (
          <TKCell key={item} title={item} subtitle="IntersectionObserver load-more row" />
        ))}
      </TKListGroup>
    </TKInfiniteList>
  );
}

function PullToRefreshExample() {
  const [refreshes, setRefreshes] = useState(0);
  return (
    <TKPullToRefresh
      style={{ height: 260, borderRadius: "var(--tk-r-md)", background: "var(--tk-surface-2)" }}
      onRefresh={() => {
        setRefreshes((n) => n + 1);
      }}
    >
      <TKListGroup inset={false} title="Inbox">
        <TKCell title="Order #4821" subtitle={`Refreshes: ${refreshes}`} icon="cart" />
        <TKCell title="Promo credit" subtitle="Swipe or pull gestures stay in the list domain" icon="star" />
      </TKListGroup>
    </TKPullToRefresh>
  );
}

function SwipeCellExample() {
  const [archived, setArchived] = useState(false);
  return (
    <TKSwipeCell trailing={[{ label: "Archive", icon: "archive", tone: "gray", onAction: () => setArchived(true) }]}>
      <TKCell title={archived ? "Archived" : "Swipe row"} subtitle="Keyboard action is reachable without a gesture" />
    </TKSwipeCell>
  );
}

export const ListVariants = {
  render: () => (
    <Section>
      <Narrow>
        <TKListGroup title="Settings">
          <TKCell title="Notifications" subtitle="Push and email" icon="bell" toggle defaultToggle />
          <TKCell title="Privacy" icon="lock" chevron />
          <TKCell title="Storage" value="2.4 GB" badge={<TKBadge>New</TKBadge>} />
        </TKListGroup>
      </Narrow>
      <Narrow>
        <TKSelectable label="Pickup today" subtitle="Ready in 20 minutes" defaultChecked icon="calendar" />
      </Narrow>
      <Narrow>
        <TKAccordion
          title="FAQ"
          defaultValue={["shipping"]}
          items={[
            { id: "shipping", title: "Shipping", content: "Courier delivery in 1-2 days.", icon: "send" },
            { id: "returns", title: "Returns", content: "Free returns within 14 days.", icon: "refresh" },
          ]}
        />
      </Narrow>
    </Section>
  ),
} satisfies Story;

export const ListBehaviors = {
  render: () => (
    <Section>
      <Narrow>
        <InfiniteListExample />
      </Narrow>
      <Narrow>
        <TKVirtualList
          height={220}
          itemHeight={54}
          items={Array.from({ length: 80 }, (_, i) => `Virtual item ${i + 1}`)}
          renderItem={(item) => <TKCell title={item} />}
        />
      </Narrow>
      <Narrow>
        <PullToRefreshExample />
      </Narrow>
      <Narrow>
        <SwipeCellExample />
      </Narrow>
    </Section>
  ),
} satisfies Story;
