import { useCallback, useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import * as kit from "../src/index";

/* M10-E — INP-006: a memoized merged ref must not detach/reattach the forwarded
 * ref on every parent re-render (a stable callback ref is invoked once). */

function refHarness(Comp: (props: { refCb: (el: HTMLElement | null) => void }) => React.ReactElement) {
  const calls: (HTMLElement | null)[] = [];
  function Harness() {
    const [, force] = useState(0);
    const refCb = useCallback((el: HTMLElement | null) => calls.push(el), []);
    return (
      <>
        <button onClick={() => force((n) => n + 1)}>rerender</button>
        <Comp refCb={refCb} />
      </>
    );
  }
  render(<Harness />);
  fireEvent.click(screen.getByText("rerender"));
  fireEvent.click(screen.getByText("rerender"));
  return calls;
}

describe("INP-006 stable forwarded ref across re-renders", () => {
  it("[D-PERF] TKInput attaches the ref once, never detaches on re-render", () => {
    const calls = refHarness(({ refCb }) => <kit.TKInput ref={refCb as never} />);
    expect(calls.filter(Boolean)).toHaveLength(1);
    expect(calls).not.toContain(null);
  });

  it("[D-PERF] TKOTP attaches the ref once", () => {
    const calls = refHarness(({ refCb }) => <kit.TKOTP ref={refCb as never} />);
    expect(calls.filter(Boolean)).toHaveLength(1);
    expect(calls).not.toContain(null);
  });

  it("[D-PERF] TKCheckbox attaches the ref once", () => {
    const calls = refHarness(({ refCb }) => <kit.TKCheckbox ref={refCb as never} />);
    expect(calls.filter(Boolean)).toHaveLength(1);
    expect(calls).not.toContain(null);
  });
});
