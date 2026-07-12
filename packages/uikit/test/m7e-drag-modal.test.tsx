import { useRef } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useDragGesture, type TKDragOptions } from "../src/internal/useDragGesture";
import { useModalOverlay } from "../src/composites/overlays/shared";

/* M7-E — useDragGesture {bind,style} composition (INT-DX-002/005) and the
 * composing useModalOverlay (INT-DX-001). */

function DragProbe({ userDown, ...opts }: Partial<TKDragOptions> & { userDown?: (e: React.PointerEvent<HTMLElement>) => void }) {
  const drag = useDragGesture({ axis: "y", ...opts } as TKDragOptions);
  return <div data-testid="d" {...drag.bind(userDown ? { onPointerDown: userDown } : undefined)} style={drag.style} />;
}

describe("INT-DX-002 useDragGesture owns the axis-correct touch-action", () => {
  it("[D-GESTURE] axis 'y' releases vertical → pan-x", () => {
    render(<DragProbe axis="y" />);
    expect(screen.getByTestId("d").style.touchAction).toBe("pan-x");
  });

  it("[D-GESTURE] axis 'x' releases horizontal → pan-y", () => {
    render(<DragProbe axis="x" />);
    expect(screen.getByTestId("d").style.touchAction).toBe("pan-y");
  });
});

describe("INT-DX-005 bind() composes consumer pointer handlers", () => {
  const drive = (el: HTMLElement) => {
    fireEvent.pointerDown(el, { pointerId: 1, clientX: 0, clientY: 0 });
    fireEvent.pointerMove(el, { pointerId: 1, clientX: 0, clientY: 20 }); // past the 6px threshold
  };

  it("[D-API] the consumer handler AND the drag handler both run", () => {
    const userDown = vi.fn();
    const onStart = vi.fn();
    render(<DragProbe axis="y" userDown={userDown} onStart={onStart} />);
    drive(screen.getByTestId("d"));
    expect(userDown).toHaveBeenCalledOnce();
    expect(onStart).toHaveBeenCalledOnce();
  });

  it("[D-API] a consumer preventDefault vetoes the drag handler", () => {
    const userDown = vi.fn((e: React.PointerEvent<HTMLElement>) => e.preventDefault());
    const onStart = vi.fn();
    render(<DragProbe axis="y" userDown={userDown} onStart={onStart} />);
    drive(screen.getByTestId("d"));
    expect(userDown).toHaveBeenCalledOnce();
    expect(onStart).not.toHaveBeenCalled(); // pointerdown vetoed → no drag started
  });
});

describe("INT-DX-001 useModalOverlay composes the modal hooks", () => {
  function ModalProbe() {
    const ref = useRef<HTMLDivElement>(null);
    const { scrimZ, panelZ } = useModalOverlay({ mounted: true, active: true, ref, onClose: () => {} });
    return (
      <div data-testid="probe" data-scrim={scrimZ} data-panel={panelZ}>
        <div ref={ref} role="dialog" aria-modal="true" tabIndex={-1}>
          <button>inside</button>
        </div>
      </div>
    );
  }

  it("[D-A11Y] returns a panel-above-scrim z-stack and moves focus into the panel", () => {
    act(() => {
      render(<ModalProbe />);
    });
    const probe = screen.getByTestId("probe");
    const scrimZ = Number(probe.getAttribute("data-scrim"));
    const panelZ = Number(probe.getAttribute("data-panel"));
    expect(Number.isFinite(scrimZ)).toBe(true);
    expect(panelZ).toBeGreaterThan(scrimZ);
    // focus moved into the panel (useOverlayA11y, sequenced by useModalOverlay)
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "inside" }));
  });

  it("[D-API] panelProps pre-builds role / aria-modal / tabIndex / zIndex", () => {
    function PropProbe() {
      const ref = useRef<HTMLDivElement>(null);
      const { panelProps, scrimProps } = useModalOverlay({
        mounted: true,
        active: true,
        ref,
        onClose: () => {},
        role: "alertdialog",
        labelledBy: "ttl",
      });
      return (
        <div ref={ref} {...panelProps} data-testid="panel" data-scrimattr={scrimProps["data-tk-scrim"] === "" ? "yes" : "no"} />
      );
    }
    act(() => {
      render(<PropProbe />);
    });
    const panel = screen.getByTestId("panel");
    expect(panel.getAttribute("role")).toBe("alertdialog");
    expect(panel.getAttribute("aria-modal")).toBe("true");
    expect(panel.getAttribute("aria-labelledby")).toBe("ttl");
    expect(panel.getAttribute("tabindex")).toBe("-1");
    expect(panel.style.zIndex).toBeTruthy();
    expect(panel.getAttribute("data-scrimattr")).toBe("yes");
  });
});
