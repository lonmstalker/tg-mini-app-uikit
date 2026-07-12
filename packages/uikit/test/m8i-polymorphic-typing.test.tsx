import { useRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import * as kit from "../src/index";

/* M8-I — CC-12 (BTN-010 / SVC-010): polymorphic impls typed without
 * Record<string,unknown>/`ref as never`; the public ref is generic over `as`. */

describe("CC-12 polymorphic ref + per-`as` typing", () => {
  it("[D-TYPES] TKTappable as='a' yields an HTMLAnchorElement ref + forwards href", () => {
    function Probe() {
      // SVC-010 'Done when': this typechecks WITHOUT a cast (ref is HTMLAnchorElement).
      const r = useRef<HTMLAnchorElement>(null);
      return (
        <kit.TKTappable as="a" ref={r} href="#x" testId="t">
          link
        </kit.TKTappable>
      );
    }
    render(<Probe />);
    const el = screen.getByTestId("t");
    expect(el.tagName).toBe("A");
    expect(el.getAttribute("href")).toBe("#x");
  });

  it("[D-TYPES] TKButton as='a' renders a styled anchor with href", () => {
    render(
      <kit.TKButton as="a" href="#y" testId="b">
        go
      </kit.TKButton>,
    );
    const el = screen.getByTestId("b");
    expect(el.tagName).toBe("A");
    expect(el.getAttribute("href")).toBe("#y");
  });
});

/* Type-level assertions — never rendered; verified by `tsc --noEmit`. A wrong
 * attribute for the chosen `as` must be a compile error (BTN-010 'Done when'). */
function _typeChecks() {
  const anchorRef = useRef<HTMLAnchorElement>(null);
  return (
    <>
      <kit.TKTappable as="a" ref={anchorRef} href="#ok" />
      {/* @ts-expect-error href is not a valid attribute on the default <button> element */}
      <kit.TKButton href="#nope">x</kit.TKButton>
      {/* @ts-expect-error href is not valid on TKTappable's default <button> */}
      <kit.TKTappable href="#nope" />
    </>
  );
}
void _typeChecks;
