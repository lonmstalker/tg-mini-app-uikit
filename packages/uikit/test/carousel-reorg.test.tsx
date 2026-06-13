import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import * as kit from "../src";
import { TKGallery } from "../src/composites/carousel";

describe("carousel module reorganization", () => {
  it("publishes gallery from the composite category and root package", () => {
    expect(TKGallery).toBe(kit.TKGallery);
  });

  it("renders and pages the gallery from the new composite category", () => {
    const onPageChange = vi.fn();
    render(
      <TKGallery onPageChange={onPageChange} testId="gallery" height={120}>
        <div>Slide one</div>
        <div>Slide two</div>
        <div>Slide three</div>
      </TKGallery>,
    );

    const track = screen.getByTestId("gallery").querySelector("[tabindex='0']") as HTMLDivElement;
    Object.defineProperty(track, "clientWidth", { value: 120, configurable: true });
    Object.defineProperty(track, "scrollLeft", { value: 120, configurable: true });
    fireEvent.scroll(track);
    expect(onPageChange).toHaveBeenLastCalledWith(1);

    const scrollTo = vi.fn();
    Object.defineProperty(track, "scrollTo", { value: scrollTo, configurable: true });
    fireEvent.click(screen.getByRole("button", { name: "Page 3" }));
    expect(scrollTo).toHaveBeenCalledWith({ left: 240, behavior: "smooth" });
    expect(onPageChange).toHaveBeenLastCalledWith(2);
  });
});
