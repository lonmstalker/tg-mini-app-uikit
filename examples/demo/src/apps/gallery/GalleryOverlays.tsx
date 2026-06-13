import { TKActionSheet, TKButton, TKCaption, TKCell, TKDialog, TKListGroup, TKRadioGroup, TKSelect, TKSheet } from "tg-mini-app-uikit";
import type { useTKToast } from "tg-mini-app-uikit";

interface GalleryOverlaysProps {
  toast: ReturnType<typeof useTKToast>;
  snapSheetOpen: boolean;
  setSnapSheetOpen: (open: boolean) => void;
  sheetOpen: boolean;
  setSheetOpen: (open: boolean) => void;
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  actionsOpen: boolean;
  setActionsOpen: (open: boolean) => void;
}

export function GalleryOverlays({
  toast,
  snapSheetOpen,
  setSnapSheetOpen,
  sheetOpen,
  setSheetOpen,
  dialogOpen,
  setDialogOpen,
  actionsOpen,
  setActionsOpen,
}: GalleryOverlaysProps) {
  return (
    <>
      <TKSheet
        open={snapSheetOpen}
        onClose={() => setSnapSheetOpen(false)}
        title="Snap points"
        snapPoints={[0.45, 0.85]}
        testId="demo-snap-sheet"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 4 }}>
          <TKCaption>Drag the grabber up/down to switch between 45% and 85% height; drag down from the lowest point to close.</TKCaption>
          <TKSelect label="City" options={["Lisbon", "Berlin", "Belgrade"]} />
          <TKListGroup>
            <TKCell icon="location" title="Dropdowns layer above the sheet" subtitle="z-index scale + select inside a dialog" />
          </TKListGroup>
        </div>
      </TKSheet>
      <TKSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Delivery time">
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
          <TKRadioGroup options={["As soon as possible · 25–35 min", "Today, 18:00–18:30", "Schedule for tomorrow"]} />
        </div>
        <TKButton full onClick={() => setSheetOpen(false)}>Confirm</TKButton>
      </TKSheet>

      <TKDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        icon="trash"
        tone="red"
        title="Delete account?"
        text="This will erase your data and order history. This action can't be undone."
        actions={
          <>
            <TKButton variant="tonal" onClick={() => setDialogOpen(false)}>Cancel</TKButton>
            <TKButton variant="destructive" onClick={() => { setDialogOpen(false); toast.error("Deleted"); }}>Delete</TKButton>
          </>
        }
      />

      <TKActionSheet
        open={actionsOpen}
        onClose={() => setActionsOpen(false)}
        items={[
          { icon: "share", label: "Share", onSelect: () => toast.success("Shared") },
          { icon: "ticket", label: "Copy promo code", onSelect: () => toast.success("Copied") },
          { icon: "trash", label: "Remove from list", danger: true, onSelect: () => toast.error("Removed") },
        ]}
      />

    </>
  );
}
