// @vitest-environment node
import type { ComponentType } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import * as kit from "../src/index";

/**
 * Minimal props for components whose required props have no defaults.
 * Everything not listed here renders with `{}`.
 */
const MINIMAL_PROPS: Record<string, Record<string, unknown>> = {
  TKIcon: { name: "check" },
  TKIconButton: { icon: "check", label: "act" },
  TKMainButton: { label: "Pay" },
  TKInlineButtons: { items: [{ id: "a", label: "A" }] },
  TKChipGroup: { items: ["a", { value: "b", label: "B" }] },
  TKRadioGroup: { options: ["a", "b"] },
  TKSelect: { options: ["a", "b"] },
  TKMultiselect: { options: ["a", "b"] },
  TKSegmented: { options: ["a", "b"] },
  TKCategoryTabs: { tabs: ["a", "b"] },
  TKTabbar: { tabs: [{ icon: "check", label: "Home" }] },
  TKSteps: { steps: ["one", "two"], current: 0 },
  TKPageDots: { count: 3 },
  TKCounter: { value: 3 },
  TKProgress: { value: 40 },
  TKRing: { value: 0.5 },
  TKBars: { data: [1, 2, 3] },
  TKTimeline: { steps: [{ label: "Ordered", status: "done" }] },
  TKSelectable: { label: "Pick me" },
  TKCell: { title: "Row" },
  TKAccordion: { items: [{ id: "a", title: "T", content: "C" }] },
  TKSheet: { open: true, title: "Sheet" },
  TKDialog: { open: true, title: "Dialog" },
  TKActionSheet: { open: true, items: [{ label: "Do it" }] },
  TKPopper: { open: false, anchorRef: { current: null } },
  TKTooltip: { content: "tip", children: "hover me" },
  TKBookingCard: { name: "Anna" },
  TKXPHeader: { name: "Anna" },
  TKPaymentSummary: { rows: [{ label: "Total", value: "$10", total: true }] },
  TKLeaderboard: { rows: [{ rank: 1, initials: "AK", name: "Anna", points: 120 }] },
  TKSlotPicker: { days: [{ label: "Mon", date: 12 }], slots: ["10:00", "11:00"] },
};

const components: Array<[string, ComponentType<Record<string, unknown>>]> = Object.entries(kit)
  .filter(([name, value]) => typeof value === "function" && /^TK[A-Z]/.test(name))
  .map(([name, value]) => [name, value as unknown as ComponentType<Record<string, unknown>>]);

describe("SSR smoke", () => {
  it("discovers the component exports", () => {
    expect(components.length).toBeGreaterThan(50);
  });

  it.each(components.map(([name]) => name))("renderToString(<%s />) works without window", (name) => {
    expect(typeof window).toBe("undefined");
    const Component = components.find(([n]) => n === name)![1];
    const props = MINIMAL_PROPS[name] ?? {};
    expect(() => renderToString(<Component {...props} />)).not.toThrow();
  });

  it("renders a themed page composition to markup", () => {
    const { TKProvider, TKTelegramProvider, TKToastProvider, TKButton } = kit;
    const html = renderToString(
      <TKTelegramProvider signalReady={false}>
        <TKProvider theme="dark" accent="#ff7755">
          <TKToastProvider>
            <TKButton>Go</TKButton>
          </TKToastProvider>
        </TKProvider>
      </TKTelegramProvider>,
    );
    expect(html).toContain("Go");
    expect(html).toContain('data-theme="dark"');
  });
});
