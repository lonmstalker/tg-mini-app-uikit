import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import * as kit from "../src/index";

/* M8-J — CRS-DX-006: data-driven TKGallery via items + renderItem + getKey. */

describe("CRS-DX-006 data-driven gallery", () => {
  const items = [
    { id: "a", label: "Alpha" },
    { id: "b", label: "Beta" },
    { id: "c", label: "Gamma" },
  ];

  it("[D-API] renders one slide per item; renderItem's item is type-inferred", () => {
    render(
      <kit.TKGallery
        items={items}
        // `it` is inferred as { id: string; label: string } — no annotation needed
        renderItem={(it) => <span>{it.label}</span>}
        getKey={(it) => it.id}
        testId="g"
      />,
    );
    const track = screen.getByTestId("g").querySelector("[tabindex='0']")!;
    expect(track.querySelectorAll("[data-tk-gallery-slide]")).toHaveLength(3);
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Gamma")).toBeInTheDocument();
    // page dots reflect the item count
    expect(screen.getByRole("button", { name: "Page 3" })).toBeInTheDocument();
  });

  it("[D-API] getKey gives stable keys (reorder keeps the same DOM nodes)", () => {
    const { rerender } = render(
      <kit.TKGallery items={items} renderItem={(it) => <span data-tk-slide-id={it.id}>{it.label}</span>} getKey={(it) => it.id} testId="g" />,
    );
    const track = screen.getByTestId("g").querySelector("[tabindex='0']")!;
    const firstBefore = track.querySelector("[data-tk-slide-id='a']");
    expect(firstBefore).not.toBeNull();
    // reverse the items — the same id keeps its node identity (key-stable)
    rerender(
      <kit.TKGallery items={[...items].reverse()} renderItem={(it) => <span data-tk-slide-id={it.id}>{it.label}</span>} getKey={(it) => it.id} testId="g" />,
    );
    const firstAfter = track.querySelector("[data-tk-slide-id='a']");
    expect(firstAfter).toBe(firstBefore); // same DOM node, just reordered
  });

  it("[D-API] the children API still works", () => {
    render(
      <kit.TKGallery testId="g">
        <div>X</div>
        <div>Y</div>
      </kit.TKGallery>,
    );
    expect(screen.getByTestId("g").querySelector("[tabindex='0']")!.querySelectorAll("[data-tk-gallery-slide]")).toHaveLength(2);
  });
});
