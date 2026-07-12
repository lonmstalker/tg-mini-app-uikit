import type { Meta, StoryObj } from "@storybook/react-vite";
import { useMemo, type CSSProperties, type ReactNode } from "react";
import {
  TKBottomBar,
  TKButton,
  TKCard,
  TKCardCell,
  TKFrame,
  TKPage,
  TKSafeArea,
  TKTelegramProvider,
} from "tg-mini-app-uikit";
import { createMockTelegram } from "@tg-mini-app/telegram/testing";

const meta = {
  title: "Foundation/Layout",
  // These stories simulate their own device frame, so skip the global phone mock.
  parameters: {
    phone: false,
    docs: {
      description: {
        component:
          "App-shell scaffolding: TKSafeArea pads content past the device notch and home indicator; TKPage is a full-height page with a pinned header/footer; TKBottomBar is a pinned action bar. The frames below simulate a device with safe-area insets so the padding is visible.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

/**
 * Wraps the demo in a Telegram mock that reports device safe-area insets
 * (notch 59px, home indicator 34px) and paints those "unsafe" zones, so the
 * effect of TKSafeArea / TKPage is actually visible in the browser.
 */
function DeviceFrame({ children, height }: { children: ReactNode; height: number }) {
  const tg = useMemo(() => {
    const mock = createMockTelegram({});
    mock.setDeviceCutouts(true);
    return mock;
  }, []);
  return (
    <TKFrame height={height}>
      <TKTelegramProvider webApp={tg.webApp}>
        <div style={{ position: "relative", height: "100%" }}>
          {/* faux device chrome marking the unsafe zones */}
          <div aria-hidden style={unsafeZone("top")}>
            <span style={notch} />
          </div>
          <div aria-hidden style={unsafeZone("bottom")}>
            <span style={homeIndicator} />
          </div>
          {children}
        </div>
      </TKTelegramProvider>
    </TKFrame>
  );
}

export const PageShell = {
  render: () => (
    <DeviceFrame height={560}>
      <TKPage
        header={<div style={{ padding: "12px 16px", fontWeight: 700, fontSize: "var(--tk-fz-title3)" }}>Orders</div>}
        footer={
          <TKBottomBar>
            <TKButton full>Checkout · $42.00</TKButton>
          </TKBottomBar>
        }
      >
        <TKCard>
          <TKCardCell title="Order summary" subtitle="3 items" after="$42.00" />
          <TKCardCell title="Delivery window" subtitle="Today, 18:00–20:00" />
          <TKCardCell title="Payment method" subtitle="Telegram Stars" />
        </TKCard>
        <div style={{ color: "var(--tk-text-3)", fontSize: "var(--tk-fz-caption)", textAlign: "center" }}>
          Header clears the notch · bottom bar clears the home indicator
        </div>
      </TKPage>
    </DeviceFrame>
  ),
} satisfies Story;

export const PageWithRefresh = {
  parameters: {
    docs: {
      description: {
        story:
          "TKPage onRefresh wires pull-to-refresh to the page's OWN scroller (the pit of success). Wrapping page content in TKPullToRefresh by hand puts the gesture inside the scroll container, where it can't see the scroll position — a mid-list swipe then hijacks scrolling and fires hidden refreshes.",
      },
    },
  },
  render: () => (
    <DeviceFrame height={560}>
      <TKPage
        header={<div style={{ padding: "12px 16px", fontWeight: 700, fontSize: "var(--tk-fz-title3)" }}>Feed</div>}
        onRefresh={() => new Promise((resolve) => setTimeout(resolve, 900))}
      >
        <TKCard>
          {Array.from({ length: 12 }, (_, i) => (
            <TKCardCell key={i} title={`Item ${i + 1}`} subtitle="Pull from the very top to refresh" />
          ))}
        </TKCard>
      </TKPage>
    </DeviceFrame>
  ),
} satisfies Story;

export const SafeArea = {
  render: () => (
    <DeviceFrame height={360}>
      <TKSafeArea edges={["top", "bottom"]} testId="layout-safe-area" style={{ height: "100%", display: "flex", flexDirection: "column", gap: 12, paddingLeft: 16, paddingRight: 16 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", background: "var(--tk-surface)", borderRadius: "var(--tk-r-lg)", padding: 16, color: "var(--tk-text-2)" }}>
          This box sits inside the safe area — clear of the notch above and the home indicator below.
        </div>
        <TKBottomBar blur={false} separator={false} style={{ borderRadius: "var(--tk-r-lg)" }}>
          <TKButton full variant="surface">
            Pinned action
          </TKButton>
        </TKBottomBar>
      </TKSafeArea>
    </DeviceFrame>
  ),
} satisfies Story;

function unsafeZone(edge: "top" | "bottom"): CSSProperties {
  return {
    position: "absolute",
    left: 0,
    right: 0,
    [edge]: 0,
    height: edge === "top" ? 59 : 34,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "repeating-linear-gradient(45deg, var(--tk-red-12) 0 8px, transparent 8px 16px)",
    pointerEvents: "none",
  };
}

const notch: CSSProperties = {
  width: 120,
  height: 26,
  borderRadius: 14,
  background: "var(--tk-text)",
  opacity: 0.85,
};

const homeIndicator: CSSProperties = {
  width: 120,
  height: 5,
  borderRadius: 3,
  background: "var(--tk-text)",
  opacity: 0.5,
};
