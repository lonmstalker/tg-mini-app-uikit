import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef } from "react";
import {
  TKActionSheet,
  TKButton,
  TKDialog,
  TKFrame,
  TKPopper,
  TKSheet,
  TKToastProvider,
  TKTooltip,
  useTKToast,
} from "tg-mini-app-uikit";
import { Narrow, Row, Section } from "../story-helpers";

const meta = {
  title: "Composites/Overlays",
  parameters: {
    docs: {
      description: {
        component: "Reusable overlay composites: sheets, dialogs, action sheets, tooltips, frames, and toasts.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const ModalSurfaces = {
  render: () => (
    <TKFrame height={420}>
      <TKDialog
        open
        title="Confirm payout"
        text="Review the amount before sending."
        icon="warning"
        tone="orange"
        actions={
          <>
            <TKButton variant="plain">Cancel</TKButton>
            <TKButton>Send</TKButton>
          </>
        }
      />
      <TKSheet open title="Transfer details" noGrabber>
        <Section>
          <Narrow>
            <TKButton variant="surface">Account ending 2842</TKButton>
          </Narrow>
        </Section>
      </TKSheet>
    </TKFrame>
  ),
} satisfies Story;

export const ActionSheet = {
  render: () => (
    <TKFrame height={360}>
      <TKActionSheet
        open
        items={[
          { icon: "share", label: "Share receipt" },
          { icon: "copy", label: "Copy transaction ID" },
          { icon: "trash", label: "Delete draft", danger: true },
        ]}
        cancelLabel="Close"
      />
    </TKFrame>
  ),
} satisfies Story;

export const Tooltip = {
  render: () => (
    <Section>
      <Row>
        <TKTooltip content="Available after Telegram confirms the payment.">
          <TKButton variant="surface">Settlement status</TKButton>
        </TKTooltip>
      </Row>
    </Section>
  ),
} satisfies Story;

function PopperPreview() {
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  return (
    <Section>
      <Row>
        <TKButton ref={anchorRef} variant="surface">
          More actions
        </TKButton>
        <TKPopper open anchorRef={anchorRef} placement="bottom" arrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <TKButton variant="plain">Archive</TKButton>
            <TKButton variant="plain">Pin</TKButton>
          </div>
        </TKPopper>
      </Row>
    </Section>
  );
}

export const AnchoredPopper = {
  render: () => <PopperPreview />,
} satisfies Story;

function ToastPreview() {
  const toast = useTKToast();
  useEffect(() => {
    toast.success("Saved to Telegram CloudStorage");
  }, [toast]);
  return <TKButton variant="surface">Toast trigger</TKButton>;
}

export const Toasts = {
  render: () => (
    <TKFrame height={240}>
      <TKToastProvider duration={6000}>
        <Section style={{ padding: 16 }}>
          <ToastPreview />
        </Section>
      </TKToastProvider>
    </TKFrame>
  ),
} satisfies Story;
