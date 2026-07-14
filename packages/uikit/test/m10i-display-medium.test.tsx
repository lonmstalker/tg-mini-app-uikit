import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as kit from "../src/index";

/* M10-I — display MEDIUM: DSP-004 (reversible spoiler), DSP-005 (self-sufficient
 * focus/motion), DSP-010 (badge overflow + avatar dot RTL). */

const mockMatchMedia = (reduced: boolean) => {
  window.matchMedia = vi.fn().mockImplementation((q: string) => ({
    matches: q.includes("prefers-reduced-motion") ? reduced : false,
    media: q,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
};
afterEach(() => {
  // @ts-expect-error reset the jsdom default (undefined)
  delete window.matchMedia;
});

describe("DSP-004 TKSpoiler reversible reveal", () => {
  it("[D-STATE] controlled revealed true→false re-blurs and restores the button", () => {
    const { rerender } = render(<kit.TKSpoiler revealed>secret</kit.TKSpoiler>);
    expect(screen.getByText("secret").style.filter).toBe("none");
    rerender(<kit.TKSpoiler revealed={false}>secret</kit.TKSpoiler>);
    expect(screen.getByText("secret").style.filter).toBe("blur(6px)");
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("[D-STATE] toggle flips both ways and emits true then false", () => {
    const onRevealChange = vi.fn();
    render(
      <kit.TKSpoiler toggle onRevealChange={onRevealChange}>
        secret
      </kit.TKSpoiler>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onRevealChange).toHaveBeenNthCalledWith(1, true);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button"));
    expect(onRevealChange).toHaveBeenNthCalledWith(2, false);
    expect(screen.getByText("secret").style.filter).toBe("blur(6px)");
  });

  it("[D-EDGE] non-toggle keeps the legacy one-way reveal (no aria-pressed)", () => {
    render(<kit.TKSpoiler>secret</kit.TKSpoiler>);
    const btn = screen.getByRole("button");
    expect(btn).not.toHaveAttribute("aria-pressed");
    fireEvent.click(btn);
    expect(screen.queryByRole("button")).toBeNull();
  });
});

describe("DSP-005 TKSpoiler is self-sufficient outside .tk", () => {
  it("[D-A11Y] shows an inline focus ring on focus, none on blur (no provider)", () => {
    render(<kit.TKSpoiler>secret</kit.TKSpoiler>);
    const btn = screen.getByRole("button");
    expect(btn.style.outline === "" || btn.style.outline === "none").toBe(true);
    fireEvent.focus(btn);
    expect(btn.style.outline).not.toBe("");
    fireEvent.blur(btn);
    expect(btn.style.outline === "" || btn.style.outline === "none").toBe(true);
  });

  it("[D-MOTION] reduced motion disables the reveal transition; otherwise it fades opacity, never filter", () => {
    mockMatchMedia(true);
    const { unmount } = render(<kit.TKSpoiler>secret</kit.TKSpoiler>);
    expect(["none", ""]).toContain(screen.getByText("secret").style.transition);
    unmount();
    mockMatchMedia(false);
    render(<kit.TKSpoiler>secret2</kit.TKSpoiler>);
    // The blur is static per state; interpolating `filter` re-rendered the
    // blur every frame (2026-07-14 smoothness plan, phase 3).
    expect(screen.getByText("secret2").style.transition).toContain("opacity");
    expect(screen.getByText("secret2").style.transition).not.toContain("filter");
  });
});

describe("DSP-010 badge overflow + avatar dot RTL", () => {
  it("[D-RESP] long badge label is wrapped in an ellipsizing span", () => {
    render(<kit.TKBadge testId="b">{"x".repeat(40)}</kit.TKBadge>);
    const label = screen.getByTestId("b").querySelector("span") as HTMLElement;
    expect(label.style.display).toBe("block"); // ellipsis is a no-op on inline
    expect(label.style.overflow).toBe("hidden");
    expect(label.style.textOverflow).toBe("ellipsis");
    expect(label.style.whiteSpace).toBe("nowrap");
    expect(label.style.maxWidth).not.toBe("");
  });

  it("[D-API] consumer style.maxWidth overrides the default clamp on the root", () => {
    render(
      <kit.TKBadge testId="b" style={{ maxWidth: 120 }}>
        tag
      </kit.TKBadge>,
    );
    expect(screen.getByTestId("b").style.maxWidth).toBe("120px");
  });

  it("[D-RTL] avatar presence dot uses logical insetInlineEnd, not physical right", () => {
    render(<kit.TKAvatar initials="NK" status="online" testId="a" />);
    const dot = document.querySelector("[data-tk-avatar-status]") as HTMLElement;
    expect(dot.style.insetInlineEnd).not.toBe("");
    expect(dot.style.right).toBe("");
  });
});
