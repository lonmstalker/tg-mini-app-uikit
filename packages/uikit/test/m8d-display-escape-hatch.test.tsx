import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import * as kit from "../src/index";

/* M8-D — DSP-008/CC-13: display atoms forward refs, accept className, and pass
 * native DOM props (title/data-*) onto the root without a wrapper span. */

describe("DSP-008 display atoms forward ref + className + native props", () => {
  it("[D-API] TKBadge", () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      <kit.TKBadge ref={ref} className="x" data-foo="bar" title="t" testId="b">
        hi
      </kit.TKBadge>,
    );
    const el = screen.getByTestId("b");
    expect(ref.current).toBe(el);
    expect(el.classList.contains("x")).toBe(true);
    expect(el.getAttribute("data-foo")).toBe("bar");
    expect(el.getAttribute("title")).toBe("t");
  });

  it("[D-API] TKCounter merges className with its tk-pop class", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<kit.TKCounter ref={ref} className="mine" value={3} testId="c" />);
    const el = screen.getByTestId("c");
    expect(ref.current).toBe(el);
    expect(el.classList.contains("tk-pop")).toBe(true);
    expect(el.classList.contains("mine")).toBe(true);
  });

  it("[D-API] TKBlockquote", () => {
    const ref = createRef<HTMLQuoteElement>();
    render(
      <kit.TKBlockquote ref={ref} className="q" data-x="1" testId="bq">
        quote
      </kit.TKBlockquote>,
    );
    const el = screen.getByTestId("bq");
    expect(ref.current).toBe(el);
    expect(el.classList.contains("q")).toBe(true);
    expect(el.getAttribute("data-x")).toBe("1");
  });

  it("[D-API] TKImg merges className with tk-img-ph", () => {
    const ref = createRef<HTMLDivElement>();
    render(<kit.TKImg ref={ref} className="mine" testId="img" />);
    const el = screen.getByTestId("img");
    expect(ref.current).toBe(el);
    expect(el.classList.contains("tk-img-ph")).toBe(true);
    expect(el.classList.contains("mine")).toBe(true);
  });

  it("[D-API] TKSpoiler", () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      <kit.TKSpoiler ref={ref} className="sp" data-y="2" testId="sp">
        secret
      </kit.TKSpoiler>,
    );
    const el = screen.getByTestId("sp");
    expect(ref.current).toBe(el);
    expect(el.classList.contains("sp")).toBe(true);
    expect(el.getAttribute("data-y")).toBe("2");
  });

  it("[D-API] TKAvatar forwards ref to the body when there is no status dot", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<kit.TKAvatar ref={ref} initials="AB" className="av" data-z="3" testId="av" />);
    const el = screen.getByTestId("av");
    expect(ref.current).toBe(el);
    expect(el.classList.contains("av")).toBe(true);
    expect(el.getAttribute("data-z")).toBe("3");
  });

  it("[D-API] TKAvatar forwards ref to the wrapper when a status dot is present", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<kit.TKAvatar ref={ref} initials="AB" status="online" className="av2" testId="av2" />);
    const el = screen.getByTestId("av2");
    expect(ref.current).toBe(el);
    expect(el.classList.contains("av2")).toBe(true);
    // the dot is a descendant of the wrapper root
    expect(el.querySelector("[data-tk-avatar-status]")).not.toBeNull();
  });
});
