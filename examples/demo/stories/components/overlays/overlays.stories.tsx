import { useRef, useState } from "react";
import type { Meta } from "@storybook/react-vite";
import {
  TKActionSheet,
  TKButton,
  TKDialog,
  TKOnboardingTooltip,
  TKPage,
  TKPopper,
  TKSheet,
  TKText,
  TKTooltip,
} from "tg-mini-app-uikit";
import { FrameStory, Row, Section, noop } from "../../story-helpers";

const meta = {
  title: "Components/Overlays",
  parameters: {
    docs: {
      description: {
        component: "Controlled React overlays: sheet, dialog, action sheet, anchored popper, tooltip, and onboarding coach marks.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = Record<string, unknown>;

type ModalOverlayArgs = {
  kind: "sheet" | "dialog" | "action";
};

type AnchoredOverlayArgs = {
  placement: "top" | "bottom";
};

function OverlayExample({ kind }: { kind: "sheet" | "dialog" | "action" }) {
  const [open, setOpen] = useState(true);
  return (
    <FrameStory>
      <TKPage>
        <TKButton onClick={() => setOpen(true)}>Open overlay</TKButton>
      </TKPage>
      <TKSheet open={kind === "sheet" && open} onClose={() => setOpen(false)} title="Sheet">
        <TKText>Bottom sheet content.</TKText>
      </TKSheet>
      <TKDialog
        open={kind === "dialog" && open}
        onClose={() => setOpen(false)}
        icon="check"
        title="Payment ready"
        text="Confirm to continue."
        actions={<TKButton onClick={() => setOpen(false)}>OK</TKButton>}
      />
      <TKActionSheet
        open={kind === "action" && open}
        onClose={() => setOpen(false)}
        items={[
          { icon: "share", label: "Share", onSelect: noop },
          { icon: "trash", label: "Remove", danger: true, onSelect: noop },
        ]}
      />
    </FrameStory>
  );
}

function AnchoredExample({ placement }: { placement: "top" | "bottom" }) {
  const popperRef = useRef<HTMLButtonElement | null>(null);
  const tourRef = useRef<HTMLButtonElement | null>(null);
  return (
    <Section>
      <Row style={{ minHeight: 130, alignItems: "center" }}>
        <button ref={popperRef} type="button" className="tk-story-anchor">
          Popper anchor
        </button>
        <TKPopper open anchorRef={popperRef} placement={placement} arrow>
          <TKText>Anchored content</TKText>
        </TKPopper>
      </Row>
      <Row style={{ minHeight: 90, alignItems: "center" }}>
        <TKTooltip content="Tooltip content" placement={placement}>
          <TKButton>Focusable tooltip</TKButton>
        </TKTooltip>
      </Row>
      <Row style={{ minHeight: 190, alignItems: "center" }}>
        <button ref={tourRef} type="button" className="tk-story-anchor">
          Tour target
        </button>
        <TKOnboardingTooltip
          steps={[
            {
              target: tourRef,
              title: "Coach mark",
              text: "Anchored onboarding overlay",
              placement,
            },
          ]}
        />
      </Row>
    </Section>
  );
}

export const ModalOverlays = {
  args: {
    kind: "sheet",
  },
  argTypes: {
    kind: { control: "select", options: ["sheet", "dialog", "action"] },
  },
  render: ({ kind }: ModalOverlayArgs) => <OverlayExample kind={kind} />,
} satisfies Story;

export const AnchoredOverlays = {
  args: {
    placement: "bottom",
  },
  argTypes: {
    placement: { control: "select", options: ["top", "bottom"] },
  },
  render: ({ placement }: AnchoredOverlayArgs) => <AnchoredExample placement={placement} />,
} satisfies Story;
