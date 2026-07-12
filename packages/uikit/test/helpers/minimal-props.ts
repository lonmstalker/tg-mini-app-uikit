/**
 * Minimal props for components whose required props have no defaults.
 * Shared by the SSR smoke test and the parameterized M0 API tests.
 * Everything not listed here renders with `{}`.
 */
import { createElement } from "react";
import { TKKeepMountTab } from "../../src/composites/navigation/keep-mount-tabs";

export const MINIMAL_PROPS: Record<string, Record<string, unknown>> = {
  TKKeepMountTabs: { active: "a", children: createElement(TKKeepMountTab, { id: "a" }, "tab") },
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
  TKTabView: { tabs: [{ icon: "check", label: "Home" }], panels: [], value: 0, onChange: () => {} },
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
  TKMaskedInput: { mask: "##-##" },
  TKAvatarStack: { avatars: [{ initials: "AK" }, { initials: "BL" }] },
  TKVirtualList: { items: ["a", "b"], itemHeight: 40, height: 200, renderItem: (x: unknown) => String(x) },
  TKMessages: { messages: [{ id: "1", text: "hi" }] },
  TKWriteBar: { onSend: () => {} },
  TKOnboardingTooltip: { steps: [{ target: { current: null } }] },
  TKPullToRefresh: { onRefresh: () => {} },
};
