import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TKKeepMountTab, TKKeepMountTabs, TKPage, useTabActive } from "../src";

/* TKKeepMountTabs + useTabActive (extracted consumer keep-mount pattern). */

function ActiveProbe({ label }: { label: string }) {
  const active = useTabActive();
  return <div data-testid={`probe-${label}`}>{active ? "active" : "inactive"}</div>;
}

function host(active: string) {
  return (
    <TKKeepMountTabs active={active}>
      <TKKeepMountTab id="home">
        <input aria-label="search" />
        <ActiveProbe label="home" />
      </TKKeepMountTab>
      <TKKeepMountTab id="stats">
        <ActiveProbe label="stats" />
      </TKKeepMountTab>
    </TKKeepMountTabs>
  );
}

describe("TKKeepMountTabs", () => {
  it("keeps input state of a visited tab across switches", () => {
    const { rerender } = render(host("home"));
    const input = screen.getByLabelText("search") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "durov" } });
    rerender(host("stats"));
    // home stays mounted, merely hidden
    expect((screen.getByLabelText("search") as HTMLInputElement).value).toBe("durov");
    rerender(host("home"));
    expect((screen.getByLabelText("search") as HTMLInputElement).value).toBe("durov");
  });

  it("hides inactive tabs via display:none and exposes useTabActive()=false to them", () => {
    const { rerender } = render(host("home"));
    rerender(host("stats"));
    const homeWrap = document.querySelector<HTMLElement>('[data-tk-keep-tab="home"]')!;
    const statsWrap = document.querySelector<HTMLElement>('[data-tk-keep-tab="stats"]')!;
    expect(homeWrap.style.display).toBe("none");
    expect(statsWrap.style.display).toBe("contents");
    expect(screen.getByTestId("probe-home").textContent).toBe("inactive");
    expect(screen.getByTestId("probe-stats").textContent).toBe("active");
  });

  it("mounts unvisited tabs lazily", () => {
    render(host("home"));
    expect(document.querySelector('[data-tk-keep-tab="stats"]')).toBeNull();
    expect(screen.queryByTestId("probe-stats")).toBeNull();
  });

  it("useTabActive() defaults to true outside any keep-mount host", () => {
    render(<ActiveProbe label="solo" />);
    expect(screen.getByTestId("probe-solo").textContent).toBe("active");
  });

  it("scrolls the enclosing page scroller to the top on switch", () => {
    function Page({ active }: { active: string }) {
      return (
        <TKPage testId="page">
          <TKKeepMountTabs active={active}>
            <TKKeepMountTab id="home">
              <div style={{ height: 2000 }} />
            </TKKeepMountTab>
            <TKKeepMountTab id="stats">
              <div />
            </TKKeepMountTab>
          </TKKeepMountTabs>
        </TKPage>
      );
    }
    const { rerender } = render(<Page active="home" />);
    const scroller = screen.getByTestId("page").querySelector<HTMLElement>("[data-tk-page-scroll]")!;
    scroller.scrollTop = 400;
    rerender(<Page active="stats" />);
    expect(scroller.scrollTop).toBe(0);
  });
});
