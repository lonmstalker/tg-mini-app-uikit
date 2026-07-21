import { act, fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { createMockTelegram } from "@tg-mini-app/telegram/testing";
import { TKGallery, TKImageViewer, TKLocaleProvider, TKTelegramProvider, ruLocale } from "../src/index";

const IMAGES = [
  { src: "https://example.com/a.jpg", alt: "First photo" },
  { src: "https://example.com/b.jpg", alt: "Second photo", thumb: "https://example.com/b-thumb.jpg" },
  { src: "https://example.com/c.jpg", alt: "Third photo" },
];

describe("TKImageViewer", () => {
  it("mounts only while open and restores focus on close", () => {
    const outside = document.createElement("button");
    document.body.appendChild(outside);
    outside.focus();
    const { rerender } = render(<TKImageViewer open={false} images={IMAGES} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    rerender(<TKImageViewer open images={IMAGES} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    // Initial focus lands inside (the close button is the first focusable).
    expect(dialog.contains(document.activeElement)).toBe(true);

    rerender(<TKImageViewer open={false} images={IMAGES} />);
    // the exit animation plays first; unmount lands on animationend
    fireEvent.animationEnd(screen.getByRole("dialog"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.activeElement).toBe(outside);
    outside.remove();
  });

  it("renders the current image with its required alt and preloads neighbours", () => {
    render(<TKImageViewer open images={IMAGES} defaultIndex={1} />);
    expect(screen.getByAltText("Second photo")).toBeInTheDocument();
    // neighbours are in the DOM for instant swipes
    expect(screen.getByAltText("First photo")).toBeInTheDocument();
    expect(screen.getByAltText("Third photo")).toBeInTheDocument();
    // the thumb layer is decorative
    const thumb = document.querySelector('img[src="https://example.com/b-thumb.jpg"]');
    expect(thumb).toHaveAttribute("aria-hidden", "true");
  });

  it("announces the position and steps with arrow keys", () => {
    const onIndexChange = vi.fn();
    render(<TKImageViewer open images={IMAGES} onIndexChange={onIndexChange} />);
    const dialog = screen.getByRole("dialog");
    expect(screen.getByText("1 of 3")).toBeInTheDocument();

    fireEvent.keyDown(dialog, { key: "ArrowRight" });
    expect(onIndexChange).toHaveBeenLastCalledWith(1);
    expect(screen.getByText("2 of 3")).toBeInTheDocument();

    fireEvent.keyDown(dialog, { key: "ArrowLeft" });
    expect(onIndexChange).toHaveBeenLastCalledWith(0);
    expect(screen.getByText("1 of 3")).toBeInTheDocument();

    // clamped at the edges
    fireEvent.keyDown(dialog, { key: "ArrowLeft" });
    expect(screen.getByText("1 of 3")).toBeInTheDocument();
  });

  it("supports a controlled index", () => {
    function Host() {
      const [i, setI] = useState(2);
      return <TKImageViewer open images={IMAGES} index={i} onIndexChange={setI} />;
    }
    render(<Host />);
    expect(screen.getByText("3 of 3")).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "ArrowLeft" });
    expect(screen.getByText("2 of 3")).toBeInTheDocument();
  });

  it("closes on Escape and locks page scroll while open", async () => {
    const onClose = vi.fn();
    render(<TKImageViewer open images={IMAGES} onClose={onClose} />);
    // the body pin deliberately lands one frame after activation
    await act(() => new Promise<void>((r) => requestAnimationFrame(() => r())));
    expect(document.body.style.position).toBe("fixed");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("localizes the counter and close button (ru)", () => {
    render(
      <TKLocaleProvider locale={ruLocale}>
        <TKImageViewer open images={IMAGES} />
      </TKLocaleProvider>,
    );
    expect(screen.getByText("1 из 3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Закрыть" })).toBeInTheDocument();
  });

  it("traps Tab inside the dialog", () => {
    render(<TKImageViewer open images={IMAGES} />);
    const close = screen.getByRole("button", { name: "Close" });
    close.focus();
    // single focusable → Tab wraps onto itself
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(close);
  });

  it("closes through the native Telegram Back button (back-dedup contract)", () => {
    const telegram = createMockTelegram();
    const onClose = vi.fn();
    render(
      <TKTelegramProvider webApp={telegram.webApp} signalReady={false}>
        <TKImageViewer open images={IMAGES} onClose={onClose} />
      </TKTelegramProvider>,
    );
    expect(telegram.webApp.BackButton?.isVisible).toBe(true);
    act(() => telegram.clickBack());
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("is SSR-safe (renderToString, open and closed)", () => {
    expect(() => renderToString(<TKImageViewer open={false} images={IMAGES} />)).not.toThrow();
    // Portaled into the overlay host client-side only (REU-009): server markup
    // carries just the hidden marker, no viewer content.
    const html = renderToString(<TKImageViewer open images={IMAGES} />);
    expect(html).not.toContain("First photo");
  });
});

describe("TKGallery viewer integration", () => {
  const slides = IMAGES.map((img) => ({ ...img, src: img.src.replace(".jpg", "-s.jpg") }));

  it("keeps slides inert without viewerImages (no breaking change)", () => {
    render(
      <TKGallery items={slides} renderItem={(s) => <img src={s.src} alt={s.alt} />} getKey={(s) => s.src} />,
    );
    expect(screen.queryAllByRole("button", { name: "First photo" })).toHaveLength(0);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens the viewer on slide tap at the tapped index", () => {
    render(
      <TKGallery
        items={slides}
        renderItem={(s) => <img src={s.src} alt={`${s.alt} preview`} />}
        getKey={(s) => s.src}
        viewerImages={IMAGES}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Second photo" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("2 of 3")).toBeInTheDocument();
  });

  it("slide tap targets are keyboard-operable and reopen at the new index", () => {
    render(
      <TKGallery
        items={slides}
        renderItem={(s) => <img src={s.src} alt={`${s.alt} preview`} />}
        getKey={(s) => s.src}
        viewerImages={IMAGES}
      />,
    );
    fireEvent.keyDown(screen.getByRole("button", { name: "Third photo" }), { key: "Enter" });
    expect(screen.getByText("3 of 3")).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.animationEnd(screen.getByRole("dialog"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "First photo" }));
    expect(screen.getByText("1 of 3")).toBeInTheDocument();
  });
});
