import type { Meta, StoryObj } from "@storybook/react-vite";
import { TKAccordion, TKCell, TKFrame, TKInfiniteList, TKListGroup, TKVirtualList } from "tg-mini-app-uikit";
import { Narrow, Section } from "../story-helpers";

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

export const GroupedCells = {
  render: () => (
    <TKFrame height={420}>
      <Section>
        <TKListGroup title="Settings" footer="Changes sync with Telegram CloudStorage.">
          <TKCell icon="user" title="Profile" subtitle="Name, avatar, identity" chevron />
          <TKCell icon="bell" title="Notifications" value="On" defaultToggle />
          <TKCell icon="trash" title="Delete account" danger chevron />
        </TKListGroup>
      </Section>
    </TKFrame>
  ),
} satisfies Story;

export const AccordionList = {
  render: () => (
    <TKFrame height={360}>
      <Section>
        <TKAccordion
          title="FAQ"
          defaultValue={["shipping"]}
          items={[
            { id: "shipping", title: "Delivery window", content: "Orders arrive within the selected time slot." },
            { id: "payment", title: "Payment method", content: "Telegram invoice or saved wallet can be used." },
          ]}
        />
      </Section>
    </TKFrame>
  ),
} satisfies Story;

export const LoadingAndVirtualization = {
  render: () => (
    <TKFrame height={480}>
      <Section>
        <Narrow>
          <TKInfiniteList hasMore onLoadMore={() => undefined}>
            <TKCell title="Feed item" subtitle="Infinite list sentinel below" />
          </TKInfiniteList>
          <TKVirtualList
            items={Array.from({ length: 80 }, (_, index) => `Virtual row ${index + 1}`)}
            itemHeight={36}
            height={180}
            renderItem={(item) => <TKCell title={item} />}
          />
        </Narrow>
      </Section>
    </TKFrame>
  ),
} satisfies Story;
