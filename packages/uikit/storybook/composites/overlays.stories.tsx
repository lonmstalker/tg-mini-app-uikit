import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, useState } from "react";
import {
  TKActionSheet,
  TKButton,
  TKDialog,
  TKImageViewer,
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
  // Inside Telegram every modal overlay also hides the native Main/Secondary
  // buttons while open (they sit in the client chrome beyond the scrim's
  // reach) and restores them on close — `nativeButtons="keep"` opts a single
  // overlay out when the native button is its own CTA. Not visible here:
  // Storybook runs without native chrome.
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

/* ---------------- Image viewer ---------------- */

const photo = (hue: number, label: string, w = 1200, h = 800) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">` +
      `<rect width="100%" height="100%" fill="hsl(${hue} 55% 42%)"/>` +
      `<circle cx="${w * 0.72}" cy="${h * 0.3}" r="${h * 0.16}" fill="hsl(${hue + 40} 70% 72%)"/>` +
      `<text x="48" y="${h - 56}" font-family="sans-serif" font-size="64" fill="white" opacity=".9">${label}</text>` +
    `</svg>`,
  )}`;

const VIEWER_IMAGES = [
  { src: photo(210, "Harbor"), alt: "Harbor at dusk" },
  { src: photo(20, "Dunes", 900, 1200), alt: "Sand dunes" },
  { src: photo(130, "Forest"), alt: "Forest trail" },
];

function ImageViewerPreview() {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const originRef = useRef<HTMLElement | null>(null);
  return (
    <Section style={{ padding: 16 }}>
      <Row>
        {VIEWER_IMAGES.map((img, i) => (
          <button
            key={img.alt}
            type="button"
            aria-label={img.alt}
            onClick={(e) => {
              originRef.current = e.currentTarget;
              setIndex(i);
              setOpen(true);
            }}
            style={{ appearance: "none", border: "none", padding: 0, background: "none", cursor: "zoom-in", borderRadius: "var(--tk-r-sm)", overflow: "hidden" }}
          >
            <img src={img.src} alt="" style={{ width: 88, height: 66, objectFit: "cover", display: "block" }} />
          </button>
        ))}
      </Row>
      <TKImageViewer
        open={open}
        onClose={() => setOpen(false)}
        images={VIEWER_IMAGES}
        index={index}
        onIndexChange={setIndex}
        originRef={originRef}
        testId="image-viewer"
      />
    </Section>
  );
}

export const ImageViewer = {
  parameters: { fullBleed: true },
  render: () => <ImageViewerPreview />,
} satisfies Story;

function PortaledFromScrollPreview() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ height: "100%", overflowY: "auto" }}>
      <Section style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            style={{ padding: 14, borderRadius: "var(--tk-r-md)", background: "var(--tk-surface)" }}
          >
            Scrolling row {i + 1}
          </div>
        ))}
        {/* transform + overflow:hidden — the classic overlay trap */}
        <div style={{ transform: "translateZ(0)", overflow: "hidden", borderRadius: "var(--tk-r-md)" }}>
          <TKButton variant="surface" onClick={() => setOpen(true)}>
            Open sheet from a clipped, transformed card
          </TKButton>
        </div>
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            style={{ padding: 14, borderRadius: "var(--tk-r-md)", background: "var(--tk-surface)" }}
          >
            More content {i + 1}
          </div>
        ))}
      </Section>
      <TKSheet open={open} onClose={() => setOpen(false)} title="Escaped the trap">
        <Narrow>
          <p style={{ margin: 0 }}>
            The sheet portals to the `.tk` root, so the transformed/overflow ancestor and the
            scroll position cannot clip or displace it.
          </p>
        </Narrow>
      </TKSheet>
    </div>
  );
}

export const PortaledFromScrollingContent = {
  parameters: {
    fullBleed: true,
    docs: {
      description: {
        story:
          "Overlays portal to the nearest `.tk` root or `[data-tk-portal-root]` host (REU-009), so opening one from inside a scrolling, transformed, or `overflow: hidden` ancestor still covers the whole shell.",
      },
    },
  },
  render: () => <PortaledFromScrollPreview />,
} satisfies Story;

function NonModalSheetPreview() {
  const [open, setOpen] = useState(false);
  return (
    <Section style={{ padding: 16 }}>
      <TKButton testId="non-modal-sheet-trigger" variant="surface" onClick={() => setOpen(true)}>
        Play passive preview
      </TKButton>
      <TKSheet modal={false} open={open} onClose={() => setOpen(false)} title="Autoplay preview">
        <Narrow>
          <p style={{ margin: 0 }}>The page stays interactive and keeps document focus.</p>
        </Narrow>
      </TKSheet>
    </Section>
  );
}

export const NonModalSheet = {
  parameters: {
    docs: {
      description: {
        story: "`modal={false}` omits the scrim and all document-modal behavior for passive previews.",
      },
    },
  },
  render: () => <NonModalSheetPreview />,
} satisfies Story;
