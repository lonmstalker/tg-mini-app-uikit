import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TKEllipsis, TKLocaleProvider, ruLocale } from "../src/index";
import { tkAnimateHeight } from "../src/internal/useCollapse";

const LONG = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.";

/** jsdom reports 0 for both; shadow the prototype getters to simulate a clamped overflow. */
function mockSize(scroll: number, client: number) {
  Object.defineProperty(HTMLElement.prototype, "scrollHeight", { configurable: true, get: () => scroll });
  Object.defineProperty(HTMLElement.prototype, "clientHeight", { configurable: true, get: () => client });
}

afterEach(() => {
  delete (HTMLElement.prototype as { scrollHeight?: unknown }).scrollHeight;
  delete (HTMLElement.prototype as { clientHeight?: unknown }).clientHeight;
});

describe("TKEllipsis", () => {
  it("shows no toggle button when the text does not overflow the clamp", () => {
    render(<TKEllipsis testId="e">{LONG}</TKEllipsis>);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("clamps visually but keeps the full text readable in the DOM", () => {
    render(<TKEllipsis testId="e">{LONG}</TKEllipsis>);
    const text = screen.getByTestId("e").firstChild as HTMLElement;
    expect(text).toHaveTextContent(LONG);
    expect(text.style.overflow).toBe("hidden");
    expect(text.getAttribute("style")).toContain("-webkit-line-clamp: 3");
  });

  it("honors the lines prop", () => {
    render(<TKEllipsis lines={5} testId="e">{LONG}</TKEllipsis>);
    const text = screen.getByTestId("e").firstChild as HTMLElement;
    expect(text.getAttribute("style")).toContain("-webkit-line-clamp: 5");
  });

  it("shows the expand button on overflow and hides it after a one-way expand", async () => {
    mockSize(100, 50);
    const onToggle = vi.fn();
    render(<TKEllipsis onToggle={onToggle} testId="e">{LONG}</TKEllipsis>);
    const button = screen.getByRole("button", { name: "Show more" });
    expect(button).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(button);
    expect(onToggle).toHaveBeenCalledWith(true);
    const text = screen.getByTestId("e").firstChild as HTMLElement;
    expect(text.style.overflow).not.toBe("hidden");
    // default is one-way, like Telegram's "more" — no collapse affordance
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("collapsible: toggles back with aria-expanded and re-applies the clamp", async () => {
    mockSize(100, 50);
    const onToggle = vi.fn();
    render(
      <TKEllipsis collapsible onToggle={onToggle} testId="e">
        {LONG}
      </TKEllipsis>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Show more" }));
    const collapse = screen.getByRole("button", { name: "Show less" });
    expect(collapse).toHaveAttribute("aria-expanded", "true");

    await userEvent.click(collapse);
    expect(onToggle).toHaveBeenLastCalledWith(false);
    const text = screen.getByTestId("e").firstChild as HTMLElement;
    // jsdom has no WAAPI → the clamp re-applies instantly
    expect(text.style.overflow).toBe("hidden");
    expect(screen.getByRole("button", { name: "Show more" })).toHaveAttribute("aria-expanded", "false");
  });

  it("is keyboard operable", async () => {
    mockSize(100, 50);
    render(<TKEllipsis collapsible>{LONG}</TKEllipsis>);
    await userEvent.tab();
    expect(screen.getByRole("button")).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "true");
  });

  it("localizes labels (ru preset) and lets explicit labels win", () => {
    mockSize(100, 50);
    render(
      <TKLocaleProvider locale={ruLocale}>
        <TKEllipsis>{LONG}</TKEllipsis>
        <TKEllipsis expandLabel="Развернуть">{LONG}</TKEllipsis>
      </TKLocaleProvider>,
    );
    expect(screen.getByRole("button", { name: "Ещё" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Развернуть" })).toBeInTheDocument();
  });

  it("respects defaultExpanded", () => {
    mockSize(100, 50);
    render(<TKEllipsis defaultExpanded collapsible testId="e">{LONG}</TKEllipsis>);
    const text = screen.getByTestId("e").firstChild as HTMLElement;
    expect(text.style.overflow).not.toBe("hidden");
    expect(screen.getByRole("button", { name: "Show less" })).toBeInTheDocument();
  });
});

describe("tkAnimateHeight overflow ownership", () => {
  /** Minimal WAAPI stand-in: an EventTarget with manual finish/cancel triggers. */
  function fakeAnimate(this: HTMLElement) {
    const target = new EventTarget();
    return Object.assign(target, {
      finish: () => target.dispatchEvent(new Event("finish")),
      cancel: () => target.dispatchEvent(new Event("cancel")),
    }) as unknown as Animation;
  }

  it("a stale cancel from a superseded run does not strip the live clip", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    (el as { animate?: unknown }).animate = fakeAnimate;

    const a1 = tkAnimateHeight(el, 100, 0)!;
    expect(el.style.overflow).toBe("hidden");
    (a1 as unknown as { finish(): void }).finish();
    expect(el.style.overflow).toBe("");

    const a2 = tkAnimateHeight(el, 100, 40)!;
    expect(el.style.overflow).toBe("hidden");
    // The late cancel event a real Animation queues when cancel() is called on
    // an already-finished player — it must not touch the newer run's clip.
    (a1 as unknown as { cancel(): void }).cancel();
    expect(el.style.overflow).toBe("hidden");

    (a2 as unknown as { finish(): void }).finish();
    expect(el.style.overflow).toBe("");
    el.remove();
  });
});
