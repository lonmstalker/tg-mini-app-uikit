import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import * as kit from "../src/index";

/* ---------------- M5.1 icons ---------------- */

describe("M5.1 icon set", () => {
  it("ships at least 75 icons including the new essentials", () => {
    expect(kit.TK_ICON_NAMES.length).toBeGreaterThanOrEqual(75);
    for (const name of ["eye", "eyeOff", "copy", "qr", "send", "edit", "filter", "download", "upload", "refresh", "warning", "info", "link", "phone", "mail", "camera", "mic", "play", "pause", "lock", "unlock", "settings", "logout", "globe", "bookmark", "sparkles", "dots", "shield", "document", "pin", "archive", "reply", "forward", "verified"]) {
      expect(kit.TK_ICON_NAMES, `missing icon: ${name}`).toContain(name);
    }
  });

  it("renders every registered icon as a non-empty 24px svg", () => {
    render(
      <div>
        {kit.TK_ICON_NAMES.map((name) => (
          <kit.TKIcon key={name} name={name} testId={`icon-${name}`} />
        ))}
      </div>,
    );

    for (const name of kit.TK_ICON_NAMES) {
      const icon = screen.getByTestId(`icon-${name}`);
      expect(icon.tagName.toLowerCase()).toBe("svg");
      expect(icon).toHaveAttribute("viewBox", "0 0 24 24");
      expect(icon).toHaveAttribute("aria-hidden", "true");
      expect(icon.childElementCount, `empty icon: ${name}`).toBeGreaterThan(0);
    }
  });
});

/* ---------------- M5.2 avatar stack & status ---------------- */

describe("M5.2 TKAvatarStack / TKAvatar status", () => {
  it("overlaps avatars and collapses the tail into +N", () => {
    render(
      <kit.TKAvatarStack
        max={3}
        avatars={[{ initials: "AK" }, { initials: "BL" }, { initials: "CM" }, { initials: "DN" }, { initials: "EO" }]}
        testId="stack"
      />,
    );
    const stack = screen.getByTestId("stack");
    expect(stack.textContent).toContain("AK");
    expect(stack.textContent).toContain("+2");
    expect(stack.textContent).not.toContain("DN");
  });

  it("TKAvatar renders the online status dot", () => {
    render(<kit.TKAvatar initials="AK" status="online" testId="ava" />);
    expect(screen.getByTestId("ava").querySelector("[data-tk-avatar-status]")).not.toBeNull();
  });
});

/* ---------------- M5.3 spoiler ---------------- */

describe("M5.3 TKSpoiler", () => {
  it("hides content from readers until revealed by tap", () => {
    render(<kit.TKSpoiler testId="sp">секрет</kit.TKSpoiler>);
    const spoiler = screen.getByTestId("sp");
    expect(spoiler.querySelector('[aria-hidden="true"]')).not.toBeNull();
    fireEvent.click(spoiler);
    expect(spoiler.querySelector('[aria-hidden="true"]')).toBeNull();
    expect(screen.getByText("секрет")).toBeVisible();
  });

  it("controlled revealed prop wins", () => {
    const { rerender } = render(<kit.TKSpoiler revealed={false} testId="sp">x</kit.TKSpoiler>);
    fireEvent.click(screen.getByTestId("sp"));
    expect(screen.getByTestId("sp").querySelector('[aria-hidden="true"]')).not.toBeNull();
    rerender(<kit.TKSpoiler revealed testId="sp">x</kit.TKSpoiler>);
    expect(screen.getByTestId("sp").querySelector('[aria-hidden="true"]')).toBeNull();
  });
});

/* ---------------- M5.4 blockquote ---------------- */

describe("M5.4 TKBlockquote", () => {
  it("renders a quote with the accent bar", () => {
    render(<kit.TKBlockquote author="Anna" testId="q">Цитата</kit.TKBlockquote>);
    expect(screen.getByText("Цитата")).toBeInTheDocument();
    expect(screen.getByText("Anna")).toBeInTheDocument();
  });
});

/* ---------------- M5.6 skeleton text & empty state media ---------------- */

describe("M5.6 TKSkeletonText / TKEmptyState media", () => {
  it("renders N lines with a shorter last line", () => {
    render(<kit.TKSkeletonText lines={3} testId="sk" />);
    const lines = screen.getByTestId("sk").querySelectorAll(".tk-skel");
    expect(lines).toHaveLength(3);
    const last = lines[lines.length - 1] as HTMLElement;
    expect(parseFloat(last.style.width)).toBeLessThan(100);
  });

  it("TKEmptyState renders the media slot instead of the icon", () => {
    render(<kit.TKEmptyState media={<img alt="art" src="x.png" />} title="Пусто" />);
    expect(screen.getByAltText("art")).toBeInTheDocument();
  });
});

/* ---------------- M5.7 counter max & icon button badge ---------------- */

describe("M5.7 TKCounter max / TKIconButton badge", () => {
  it("truncates past max as N+", () => {
    render(<kit.TKCounter value={120} max={99} />);
    expect(screen.getByText("99+")).toBeInTheDocument();
  });

  it("TKIconButton renders a numeric badge and a dot badge", () => {
    const { rerender } = render(<kit.TKIconButton icon="bell" label="alerts" badge={5} testId="ib" />);
    expect(screen.getByText("5")).toBeInTheDocument();
    rerender(<kit.TKIconButton icon="bell" label="alerts" badge testId="ib" />);
    expect(screen.getByTestId("ib").querySelector("[data-tk-badge-dot]")).not.toBeNull();
  });
});

/* ---------------- M5.8 image srcSet & blur-up ---------------- */

describe("M5.8 TKImage srcSet and blur-up", () => {
  it("passes srcSet/sizes to the img", () => {
    render(<kit.TKImage src="a.png" srcSet="a.png 1x, a@2x.png 2x" sizes="100vw" alt="pic" testId="img" />);
    const img = screen.getByTestId("img").querySelector("img")!;
    expect(img.srcset).toContain("a@2x.png 2x");
    expect(img.sizes).toBe("100vw");
  });

  it("shows the placeholderSrc while the real image loads", () => {
    render(<kit.TKImage src="big.png" placeholderSrc="tiny.png" alt="pic" testId="img" />);
    const imgs = screen.getByTestId("img").querySelectorAll("img");
    expect(Array.from(imgs).some((i) => i.src.includes("tiny.png"))).toBe(true);
  });
});

/* ---------------- M5.10 infinite & virtual lists ---------------- */

describe("M5.10 TKInfiniteList / TKVirtualList", () => {
  it("TKInfiniteList renders children and the sentinel while hasMore", () => {
    const onLoadMore = vi.fn();
    render(
      <kit.TKInfiniteList hasMore onLoadMore={onLoadMore} testId="inf">
        <div>item</div>
      </kit.TKInfiniteList>,
    );
    expect(screen.getByTestId("inf").querySelector("[data-tk-sentinel]")).not.toBeNull();
  });

  it("TKInfiniteList disconnects its observer and does not load after unmount", () => {
    const original = globalThis.IntersectionObserver;
    const instances: Array<{
      disconnected: boolean;
      disconnect: ReturnType<typeof vi.fn>;
      observe: ReturnType<typeof vi.fn>;
      trigger: (isIntersecting?: boolean) => void;
    }> = [];
    class MockIntersectionObserver {
      disconnected = false;
      observe = vi.fn();
      disconnect = vi.fn(() => {
        this.disconnected = true;
      });
      constructor(private readonly callback: IntersectionObserverCallback) {
        instances.push(this);
      }
      trigger(isIntersecting = true) {
        if (!this.disconnected) this.callback([{ isIntersecting } as IntersectionObserverEntry], this as never);
      }
    }
    Object.defineProperty(globalThis, "IntersectionObserver", { value: MockIntersectionObserver, configurable: true });
    const onLoadMore = vi.fn();

    try {
      const { unmount } = render(
        <kit.TKInfiniteList hasMore onLoadMore={onLoadMore} testId="inf">
          <div>item</div>
        </kit.TKInfiniteList>,
      );

      expect(instances[0].observe).toHaveBeenCalledWith(screen.getByTestId("inf").querySelector("[data-tk-sentinel]"));
      instances[0].trigger();
      expect(onLoadMore).toHaveBeenCalledOnce();

      unmount();
      expect(instances[0].disconnect).toHaveBeenCalledOnce();
      instances[0].trigger();
      expect(onLoadMore).toHaveBeenCalledOnce();
    } finally {
      if (original) Object.defineProperty(globalThis, "IntersectionObserver", { value: original, configurable: true });
      else Reflect.deleteProperty(globalThis, "IntersectionObserver");
    }
  });

  it("TKVirtualList renders only the visible window plus overscan", () => {
    const items = Array.from({ length: 10000 }, (_, i) => `row ${i}`);
    render(
      <kit.TKVirtualList
        items={items}
        itemHeight={40}
        height={400}
        overscan={5}
        renderItem={(item) => <div>{item}</div>}
        testId="virt"
      />,
    );
    const rendered = screen.getAllByText(/^row /);
    expect(rendered.length).toBeLessThanOrEqual(400 / 40 + 2 * 5 + 2);
    expect(screen.getByText("row 0")).toBeInTheDocument();
    expect(screen.queryByText("row 5000")).not.toBeInTheDocument();
    // total scroll height accounts for all items
    const spacer = screen.getByTestId("virt").firstElementChild as HTMLElement;
    expect(spacer.style.height).toBe(`${10000 * 40}px`);
  });
});

/* ---------------- M5.11 progress sizes & accordion lazy ---------------- */

describe("M5.11 TKProgress size / TKAccordion lazy", () => {
  it("progress heights follow the size variants", () => {
    const { rerender } = render(<kit.TKProgress value={40} size="sm" testId="p" />);
    const h1 = parseFloat(screen.getByTestId("p").style.height);
    rerender(<kit.TKProgress value={40} size="lg" testId="p" />);
    expect(parseFloat(screen.getByTestId("p").style.height)).toBeGreaterThan(h1);
  });

  it("lazy accordion mounts content only after it opens", () => {
    const probe = vi.fn(() => <div>контент</div>);
    function Probe() {
      probe();
      return <div>контент</div>;
    }
    render(<kit.TKAccordion lazy items={[{ id: "a", title: "T", content: <Probe /> }]} />);
    expect(probe).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: /T/ }));
    expect(probe).toHaveBeenCalled();
  });
});

/* ---------------- M5.9 collapsing header ---------------- */

describe("M5.9 TKHeader collapsing", () => {
  it("collapses the large title when the page content scrolls", () => {
    render(
      <kit.TKPage header={<kit.TKHeader large collapsing title="Orders" back={false} testId="hdr" />} safeTop={false}>
        <div style={{ height: 2000 }}>content</div>
      </kit.TKPage>,
    );
    const header = screen.getByTestId("hdr");
    expect(header.dataset.collapsed).toBe("false");
    const scroller = document.querySelector("[data-tk-page-scroll]")!;
    Object.defineProperty(scroller, "scrollTop", { value: 120, configurable: true });
    fireEvent.scroll(scroller);
    expect(screen.getByTestId("hdr").dataset.collapsed).toBe("true");
  });
});
