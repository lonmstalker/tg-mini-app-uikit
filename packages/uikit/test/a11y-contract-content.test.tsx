import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import * as kit from "../src";

/* [D-A11Y] Per-component contract pins for the components the C3 sweep found
   without their OWN a11y assertions (an assert about a co-rendered neighbor
   does not count): roles, accessible names, label/description wiring. */

describe("TKVirtualList is a named, keyboard-reachable scroll region", () => {
  const items = Array.from({ length: 30 }, (_, i) => `row ${i}`);
  it("[D-A11Y] aria-label names the region; tabIndex=0 puts it in the tab order (axe: scrollable-region-focusable)", () => {
    render(
      <kit.TKVirtualList
        items={items}
        itemHeight={40}
        height={200}
        aria-label="Orders"
        renderItem={(x) => <span>{String(x)}</span>}
        testId="vl"
      />,
    );
    const region = screen.getByRole("region", { name: "Orders" });
    expect(region).toBe(screen.getByTestId("vl"));
    expect(region).toHaveAttribute("tabindex", "0");
  });
});

describe("TKFormInput keeps TKInput's label/description wiring", () => {
  it("[D-A11Y] label targets the control, hint lands in aria-describedby", () => {
    render(<kit.TKFormInput label="Email" hint="Work address" />);
    const input = screen.getByLabelText("Email");
    expect(input.tagName).toBe("INPUT");
    const describedBy = input.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy!)?.textContent).toContain("Work address");
  });
});

describe("TKNativeField labels the native control", () => {
  it("[D-A11Y] label focuses the native input; error surfaces as role=alert", () => {
    render(<kit.TKNativeField type="date" label="Birthday" error="Required" value="2026-07-01" onChange={() => undefined} />);
    const input = screen.getByLabelText("Birthday");
    expect(input).toHaveAttribute("type", "date");
    expect(screen.getByRole("alert").textContent).toContain("Required");
  });
});

describe("TKWalletConnectButton is a real named button", () => {
  it("[D-A11Y] named by the locale label; loading disables it", () => {
    const { rerender } = render(<kit.TKWalletConnectButton />);
    expect(screen.getByRole("button", { name: /connect wallet/i })).toBeEnabled();
    rerender(<kit.TKWalletConnectButton loading />);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});

describe("TKPaymentSummary rows are readable text", () => {
  it("[D-A11Y] labels and values reach the accessibility tree as text", () => {
    render(
      <kit.TKPaymentSummary
        rows={[
          { label: "Subtotal", value: "$8" },
          { label: "Total", value: "$10", total: true },
        ]}
      />,
    );
    expect(screen.getByText("Subtotal")).toBeInTheDocument();
    expect(screen.getByText("$10")).toBeInTheDocument();
  });
});

describe("TKMessageBubble content is text, not pixels", () => {
  it("[D-A11Y] message text and time are readable", () => {
    render(<kit.TKMessageBubble text="Hello there" time="12:03" status="read" tail out />);
    expect(screen.getByText("Hello there")).toBeInTheDocument();
    expect(screen.getByText("12:03")).toBeInTheDocument();
  });
});

describe("TKStatTile reads as label + value", () => {
  it("[D-A11Y] label, value and delta are plain text", () => {
    render(<kit.TKStatTile label="Revenue" value="$1,200" delta="+4%" />);
    expect(screen.getByText("Revenue")).toBeInTheDocument();
    expect(screen.getByText("$1,200")).toBeInTheDocument();
    expect(screen.getByText("+4%")).toBeInTheDocument();
  });
});

describe("TKBannerCard CTA is an actionable button", () => {
  it("[D-A11Y] cta renders as a button named by its text and fires onCta", async () => {
    const onCta = vi.fn();
    render(<kit.TKBannerCard title="Upgrade" text="Go pro" cta="Try now" onCta={onCta} />);
    expect(screen.getByText("Upgrade")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Try now" }));
    expect(onCta).toHaveBeenCalledTimes(1);
  });
});

describe("TKProductCardB controls carry names and toggle state", () => {
  it("[D-A11Y] favorite is a named toggle with aria-pressed; add-to-cart is a named button", async () => {
    render(<kit.TKProductCardB title="Sneakers" price="$59" />);
    const fav = screen.getByRole("button", { name: "Toggle favorite" });
    expect(fav).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(fav);
    expect(fav).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /add to cart/i })).toBeInTheDocument();
  });
});
