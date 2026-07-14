import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, useState } from "react";
import {
  TKActionSheet,
  TKButton,
  TKDialog,
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

function ModalSurfacesPreview() {
  // Real open/close state so the exit animations (tk-fade-out, tk-modal close,
  // tk-sheet-down) and the sheet's drag-to-dismiss are exercisable, not just enter.
  const [dialogOpen, setDialogOpen] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(true);
  return (
    <>
      <Section style={{ padding: 16 }}>
        <Row>
          <TKButton variant="surface" onClick={() => setDialogOpen(true)}>
            Open dialog
          </TKButton>
          <TKButton variant="surface" onClick={() => setSheetOpen(true)}>
            Open sheet
          </TKButton>
        </Row>
      </Section>
      <TKDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Confirm payout"
        text="Review the amount before sending."
        icon="warning"
        tone="orange"
        actions={
          <>
            <TKButton variant="plain" onClick={() => setDialogOpen(false)}>
              Cancel
            </TKButton>
            <TKButton onClick={() => setDialogOpen(false)}>Send</TKButton>
          </>
        }
      />
      <TKSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Transfer details">
        <Section>
          <Narrow>
            <TKButton variant="surface">Account ending 2842</TKButton>
          </Narrow>
        </Section>
      </TKSheet>
    </>
  );
}

export const ModalSurfaces = {
  // Overlays fill the device screen (backdrop, centered dialog, bottom sheet) like a real app.
  parameters: { fullBleed: true },
  render: () => <ModalSurfacesPreview />,
} satisfies Story;

function ActionSheetPreview() {
  const [open, setOpen] = useState(true);
  return (
    <>
      <Section style={{ padding: 16 }}>
        <TKButton variant="surface" onClick={() => setOpen(true)}>
          Open action sheet
        </TKButton>
      </Section>
      <TKActionSheet
        open={open}
        onClose={() => setOpen(false)}
        items={[
          { icon: "share", label: "Share receipt" },
          { icon: "copy", label: "Copy transaction ID" },
          { icon: "trash", label: "Delete draft", danger: true },
        ]}
        cancelLabel="Close"
      />
    </>
  );
}

export const ActionSheet = {
  parameters: { fullBleed: true },
  render: () => <ActionSheetPreview />,
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
  const fire = () => toast.success("Saved to Telegram CloudStorage");
  useEffect(() => {
    fire();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);
  return (
    <TKButton variant="surface" onClick={fire}>
      Show toast
    </TKButton>
  );
}

export const Toasts = {
  parameters: { fullBleed: true },
  render: () => (
    // Real auto-dismiss timing so tk-toast-in AND tk-toast-out both play; the button re-fires it.
    <TKToastProvider duration={2400}>
      <Section style={{ padding: 16 }}>
        <ToastPreview />
      </Section>
    </TKToastProvider>
  ),
} satisfies Story;
