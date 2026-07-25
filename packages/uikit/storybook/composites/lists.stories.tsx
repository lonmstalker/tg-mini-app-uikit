import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ReactNode } from "react";
import { TKAccordion, TKCell, TKInfiniteList, TKListGroup, TKVirtualList } from "tg-mini-app-uikit";
import { Screen } from "../story-helpers";

const meta = {
  title: "Composites/Lists",
  parameters: {
    docs: {
      description: {
        component: "Reusable list composites: grouped cells, accordions, infinite loading, and fixed-height virtualization.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

const scrollArea = (children: ReactNode) => (
  // Once the stress content makes this actually scroll, it must be keyboard-
  // reachable and named (axe: scrollable-region-focusable) — same contract a
  // real app scroller carries.
  <div
    tabIndex={0}
    role="region"
    aria-label="List scroll area"
    style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 14 }}
  >
    {children}
  </div>
);

export const GroupedCells = {
  parameters: { fullBleed: true },
  render: () => (
    <Screen>
      {scrollArea(
        <TKListGroup title="Settings" footer="Changes sync with Telegram CloudStorage.">
          <TKCell icon="user" title="Profile" subtitle="Name, avatar, identity" chevron />
          <TKCell icon="bell" title="Notifications" value="On" defaultToggle />
          <TKCell icon="trash" title="Delete account" danger chevron />
        </TKListGroup>,
      )}
    </Screen>
  ),
} satisfies Story;

export const AccordionList = {
  parameters: { fullBleed: true },
  render: () => (
    <Screen>
      {scrollArea(
        <TKAccordion
          title="FAQ"
          defaultValue={["shipping"]}
          items={[
            { id: "shipping", title: "Delivery window", content: "Orders arrive within the selected time slot." },
            { id: "payment", title: "Payment method", content: "Telegram invoice or saved wallet can be used." },
          ]}
        />,
      )}
    </Screen>
  ),
} satisfies Story;

export const LoadingAndVirtualization = {
  parameters: { fullBleed: true },
  render: () => (
    <Screen>
      {scrollArea(
        <>
          <TKInfiniteList hasMore onLoadMore={() => undefined}>
            <TKCell title="Feed item" subtitle="Infinite list sentinel below" />
          </TKInfiniteList>
          <TKVirtualList
            items={Array.from({ length: 80 }, (_, index) => `Virtual row ${index + 1}`)}
            itemHeight={36}
            height={180}
            renderItem={(item) => <TKCell title={item} />}
          />
        </>,
      )}
    </Screen>
  ),
} satisfies Story;

// A7: unbroken titles and missing fields — the cell grid must shrink
// (minmax(0,1fr), REU-001/008) and ellipsize, never push the screen sideways.
const UNBROKEN = "Grundstücksverkehrsgenehmigungszuständigkeitsübertragungsverordnung";

export const StressContent = {
  parameters: { fullBleed: true },
  render: () => (
    <Screen>
      {scrollArea(
        <TKListGroup title={UNBROKEN} footer="Строки выше — с неразрывным заголовком, без иконки, без значения.">
          <TKCell icon="user" title={UNBROKEN} subtitle={`${UNBROKEN} ${UNBROKEN}`} chevron />
          <TKCell title="Без иконки и значения" />
          <TKCell icon="bell" title="Уведомления" value={UNBROKEN} />
        </TKListGroup>,
      )}
    </Screen>
  ),
} satisfies Story;
