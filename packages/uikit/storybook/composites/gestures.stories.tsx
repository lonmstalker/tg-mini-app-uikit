import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type PointerEvent } from "react";
import { TKPullToRefresh, TKSwipeCell, useLongPress } from "tg-mini-app-uikit";
import { AppScreen, Screen } from "../story-helpers";

const meta = {
  title: "Composites/Gestures",
  parameters: {
    docs: {
      description: {
        component: "Reusable gesture composites: pull-to-refresh, swipe actions, and long press handlers.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

const txnRow = (title: string, amount: string, key: string | number) => (
  <div
    key={key}
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "12px 14px",
      background: "var(--tk-surface)",
      borderRadius: "var(--tk-r-md)",
      boxShadow: "var(--tk-shadow-sm)",
    }}
  >
    <span>{title}</span>
    <span style={{ fontVariantNumeric: "tabular-nums", color: "var(--tk-text-2)" }}>{amount}</span>
  </div>
);

function PullToRefreshDemo() {
  const [items, setItems] = useState(() => [
    { id: 0, title: "Coffee Bar", amount: "−$4.20" },
    { id: 1, title: "Salary", amount: "+$2,400" },
    { id: 2, title: "Taxi", amount: "−$11.50" },
  ]);
  const [seq, setSeq] = useState(100);

  const refresh = () =>
    new Promise<void>((resolve) => {
      // A real async refresh so the spinner is actually visible; prepends a row.
      window.setTimeout(() => {
        setItems((prev) => [{ id: seq, title: "New transaction", amount: "−$2.00" }, ...prev]);
        setSeq((n) => n + 1);
        resolve();
      }, 900);
    });

  return (
    <Screen>
      <div style={{ padding: "12px 16px 6px" }}>
        <div style={{ fontWeight: 700 }}>Activity</div>
        <div style={{ fontSize: "var(--tk-fz-caption)", color: "var(--tk-text-3)" }}>Pull feed to refresh</div>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <TKPullToRefresh onRefresh={refresh} style={{ height: "100%" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "6px 14px 16px" }}>
            {items.map((t) => txnRow(t.title, t.amount, t.id))}
          </div>
        </TKPullToRefresh>
      </div>
    </Screen>
  );
}

export const PullToRefresh = {
  parameters: { fullBleed: true },
  render: () => <PullToRefreshDemo />,
} satisfies Story;

export const SwipeActions = {
  parameters: { fullBleed: true },
  render: () => (
    <AppScreen>
      <TKSwipeCell trailing={[{ label: "Delete", icon: "trash", tone: "red", onAction: () => undefined }]}>
        <div style={{ padding: 16, background: "var(--tk-surface)" }}>Swipe row</div>
      </TKSwipeCell>
      <div style={{ fontSize: "var(--tk-fz-caption)", color: "var(--tk-text-3)", padding: "0 4px" }}>
        Swipe the row left to reveal the delete action.
      </div>
    </AppScreen>
  ),
} satisfies Story;

const HOLD_MS = 600;

function LongPressDemo() {
  const [pinned, setPinned] = useState(false);
  const [holding, setHolding] = useState(false);
  const handlers = useLongPress(
    () => {
      setPinned(true);
      setHolding(false);
    },
    { duration: HOLD_MS },
  );

  const start = (e: PointerEvent<HTMLElement>) => {
    handlers.onPointerDown(e);
    setPinned(false);
    setHolding(true);
  };
  const stop = (e: PointerEvent<HTMLElement>, which: "up" | "cancel") => {
    which === "up" ? handlers.onPointerUp(e) : handlers.onPointerCancel(e);
    setHolding(false);
  };

  return (
    <>
      <div style={{ fontSize: "var(--tk-fz-caption)", color: "var(--tk-text-3)" }}>
        Press <strong>and hold</strong> to pin the order — the bar fills as you hold.
      </div>
        <button
          type="button"
          {...handlers}
          onPointerDown={start}
          onPointerUp={(e) => stop(e, "up")}
          onPointerCancel={(e) => stop(e, "cancel")}
          onPointerLeave={(e) => stop(e, "cancel")}
          style={{
            position: "relative",
            overflow: "hidden",
            height: 48,
            width: "100%",
            border: "none",
            borderRadius: "var(--tk-r-md)",
            background: "var(--tk-surface)",
            boxShadow: "var(--tk-shadow-sm)",
            color: "var(--tk-text)",
            fontFamily: "inherit",
            fontSize: "var(--tk-fz-body)",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {/* progress fill animates to full over the hold duration */}
          <span
            aria-hidden
            style={{
              position: "absolute",
              insetBlock: 0,
              insetInlineStart: 0,
              width: holding ? "100%" : 0,
              background: "var(--tk-accent-12)",
              transition: holding ? `width ${HOLD_MS}ms linear` : "width var(--tk-t1) var(--tk-ease)",
            }}
          />
          <span style={{ position: "relative" }}>Hold action</span>
        </button>
        <div
          style={{
            display: "inline-flex",
            alignSelf: "flex-start",
            gap: 6,
            padding: "6px 12px",
            borderRadius: "var(--tk-r-pill)",
            fontSize: "var(--tk-fz-caption)",
            fontWeight: 700,
            background: pinned ? "var(--tk-green-12)" : "var(--tk-surface-2)",
            color: pinned ? "var(--tk-green)" : "var(--tk-text-3)",
          }}
        >
          {pinned ? "📌 Pinned to top" : "Not pinned yet"}
        </div>
    </>
  );
}

export const LongPress = {
  parameters: { fullBleed: true },
  render: () => (
    <AppScreen>
      <LongPressDemo />
    </AppScreen>
  ),
} satisfies Story;
