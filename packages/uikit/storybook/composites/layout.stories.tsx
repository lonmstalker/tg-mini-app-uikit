import type { Meta, StoryObj } from "@storybook/react-vite";
import { TKBottomBar, TKButton, TKFrame, TKPage, TKSafeArea } from "tg-mini-app-uikit";
import { Narrow } from "../story-helpers";

const meta = {
  title: "Composites/Layout",
  parameters: {
    docs: {
      description: {
        component: "Reusable layout composites: safe-area padding, full-height pages, and pinned bottom bars.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const PageShell = {
  render: () => (
    <TKFrame height={520}>
      <TKPage
        safeTop={false}
        header={<div style={{ padding: 16, fontWeight: 700 }}>Orders</div>}
        footer={
          <TKBottomBar>
            <TKButton full>Checkout</TKButton>
          </TKBottomBar>
        }
      >
        <Narrow>
          <div>Order summary</div>
          <div>Delivery window</div>
          <div>Payment method</div>
        </Narrow>
      </TKPage>
    </TKFrame>
  ),
} satisfies Story;

export const SafeArea = {
  render: () => (
    <TKFrame height={320}>
      <TKSafeArea edges={["top", "bottom"]} testId="layout-safe-area" style={{ height: "100%" }}>
        <Narrow>
          <div>Safe area content</div>
          <TKBottomBar blur={false} separator={false}>
            Bottom action
          </TKBottomBar>
        </Narrow>
      </TKSafeArea>
    </TKFrame>
  ),
} satisfies Story;
