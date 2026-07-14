import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TKIcon, TKLocaleProvider, TKNoticeBar, ruLocale } from "../src/index";

const TEXT = "New: gifts can now be sent to channels";

/** jsdom reports 0 everywhere; shadow the prototype getters to fake a text overflow. */
function mockOverflow(text: number, clip: number) {
  Object.defineProperty(HTMLElement.prototype, "offsetWidth", { configurable: true, get: () => text });
  Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, get: () => clip });
}

afterEach(() => {
  delete (HTMLElement.prototype as { offsetWidth?: unknown }).offsetWidth;
  delete (HTMLElement.prototype as { clientWidth?: unknown }).clientWidth;
});

describe("TKNoticeBar", () => {
  it("renders a polite status strip with the content", () => {
    render(<TKNoticeBar testId="n">{TEXT}</TKNoticeBar>);
    const bar = screen.getByRole("status");
    expect(bar).toHaveTextContent(TEXT);
    expect(bar).toBe(screen.getByTestId("n"));
  });

  it("paints tones from semantic tokens only", () => {
    const { rerender } = render(<TKNoticeBar testId="n">{TEXT}</TKNoticeBar>);
    expect(screen.getByTestId("n").getAttribute("style")).toContain("--tk-accent-12");
    for (const tone of ["green", "orange", "red"] as const) {
      rerender(
        <TKNoticeBar tone={tone} testId="n">
          {TEXT}
        </TKNoticeBar>,
      );
      const style = screen.getByTestId("n").getAttribute("style") ?? "";
      expect(style).toContain(`--tk-${tone}-12`);
      expect(style).toContain(`--tk-${tone}-ink`);
      expect(style).not.toMatch(/#[0-9a-f]{3,8}/i);
    }
  });

  it("renders icon decoratively and the action slot", () => {
    render(
      <TKNoticeBar icon={<TKIcon name="info" />} action={<a href="/promo">Open</a>} testId="n">
        {TEXT}
      </TKNoticeBar>,
    );
    expect(screen.getByRole("link", { name: "Open" })).toBeInTheDocument();
    const icon = screen.getByTestId("n").firstElementChild as HTMLElement;
    expect(icon).toHaveAttribute("aria-hidden", "true");
  });

  it("closable: collapses then reports onClose exactly once (instant without WAAPI)", async () => {
    const onClose = vi.fn();
    render(
      <TKNoticeBar closable onClose={onClose}>
        {TEXT}
      </TKNoticeBar>,
    );
    const close = screen.getByRole("button", { name: "Close" });
    await userEvent.click(close);
    await userEvent.click(close);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("localizes the close button (ru)", () => {
    render(
      <TKLocaleProvider locale={ruLocale}>
        <TKNoticeBar closable>{TEXT}</TKNoticeBar>
      </TKLocaleProvider>,
    );
    expect(screen.getByRole("button", { name: "Закрыть" })).toBeInTheDocument();
  });

  it("marquee stays off while the text fits", () => {
    render(<TKNoticeBar marquee>{TEXT}</TKNoticeBar>);
    expect(document.querySelector(".tk-marquee-track")).toBeNull();
    expect(screen.getAllByText(TEXT)).toHaveLength(1);
  });

  it("marquee runs only on real overflow, duplicates for AT statically", () => {
    mockOverflow(700, 300);
    render(<TKNoticeBar marquee>{TEXT}</TKNoticeBar>);
    const track = document.querySelector(".tk-marquee-track") as HTMLElement;
    expect(track).not.toBeNull();
    expect(track).toHaveAttribute("aria-hidden", "true");
    // static sr-only copy + two scrolling copies inside the hidden track
    expect(screen.getAllByText(TEXT)).toHaveLength(3);
    expect(document.querySelector(".tk-sr-only")).toHaveTextContent(TEXT);
    // duration derives from the measured copy width (700 / 35 = 20s)
    expect(track.getAttribute("style")).toContain("--tk-marquee-dur: 20s");
  });

  it("no marquee without the prop even when overflowing", () => {
    mockOverflow(700, 300);
    render(<TKNoticeBar>{TEXT}</TKNoticeBar>);
    expect(document.querySelector(".tk-marquee-track")).toBeNull();
  });
});
