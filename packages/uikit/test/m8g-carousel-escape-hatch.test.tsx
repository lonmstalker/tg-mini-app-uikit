import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import * as kit from "../src/index";

/* M8-G — CRS-011/CC-13: TKGallery forwards ref + className + native props on its root. */

describe("CRS-011 TKGallery escape hatch", () => {
  it("[D-API] forwards ref, className and native props onto the root container", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <kit.TKGallery ref={ref} className="g" data-x="1" testId="gal">
        <div>1</div>
        <div>2</div>
      </kit.TKGallery>,
    );
    const el = screen.getByTestId("gal");
    expect(ref.current).toBe(el);
    expect(el.classList.contains("g")).toBe(true);
    expect(el.getAttribute("data-x")).toBe("1");
    // the track + dots still render inside the root (no structural regression)
    expect(el.querySelector("[tabindex='0']")).not.toBeNull();
  });
});
