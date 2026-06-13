import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as kit from "../src/index";

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

function installBlobUrlMocks() {
  Object.defineProperty(URL, "createObjectURL", { value: vi.fn(() => "blob:preview"), configurable: true });
  Object.defineProperty(URL, "revokeObjectURL", { value: vi.fn(), configurable: true });
}

describe("coverage-backed component behaviours", () => {
  it("TKGallery syncs page changes from scroll and dot clicks", () => {
    const onPageChange = vi.fn();
    render(
      <kit.TKGallery onPageChange={onPageChange} testId="gallery" height={120}>
        <div>first</div>
        <div>second</div>
        <div>third</div>
      </kit.TKGallery>,
    );

    const track = screen.getByTestId("gallery").querySelector("[tabindex='0']") as HTMLDivElement;
    Object.defineProperty(track, "clientWidth", { value: 100, configurable: true });
    Object.defineProperty(track, "scrollLeft", { value: 100, configurable: true });
    fireEvent.scroll(track);

    expect(onPageChange).toHaveBeenLastCalledWith(1);

    const scrollTo = vi.fn();
    Object.defineProperty(track, "scrollTo", { value: scrollTo, configurable: true });
    fireEvent.click(screen.getByRole("button", { name: "Page 3" }));

    expect(scrollTo).toHaveBeenCalledWith({ left: 200, behavior: "smooth" });
    expect(onPageChange).toHaveBeenLastCalledWith(2);
  });

  it("TKRangeSlider supports keyboard and pointer updates without crossing thumbs", () => {
    const onRangeChange = vi.fn();
    render(
      <kit.TKSlider
        range
        label="Budget"
        min={0}
        max={100}
        step={10}
        suffix="$"
        defaultRange={[30, 70]}
        onRangeChange={onRangeChange}
        marks={[0, 50, 100]}
        testId="range"
      />,
    );

    const [minThumb, maxThumb] = screen.getAllByRole("slider", { name: "Budget" });
    fireEvent.keyDown(minThumb, { key: "End" });
    expect(minThumb).toHaveAttribute("aria-valuenow", "70");
    expect(onRangeChange).toHaveBeenLastCalledWith([70, 70]);

    fireEvent.keyDown(maxThumb, { key: "Home" });
    expect(maxThumb).toHaveAttribute("aria-valuenow", "70");
    expect(onRangeChange).toHaveBeenLastCalledWith([70, 70]);

    const track = screen.getByTestId("range").firstElementChild as HTMLDivElement;
    Object.defineProperty(track, "setPointerCapture", { value: vi.fn(), configurable: true });
    Object.defineProperty(track, "getBoundingClientRect", {
      value: () => ({ left: 0, width: 100, top: 0, right: 100, bottom: 28, height: 28 }),
      configurable: true,
    });

    fireEvent.pointerDown(track, { clientX: 10, pointerId: 1 });
    expect(onRangeChange).toHaveBeenLastCalledWith([10, 70]);
    fireEvent.pointerMove(track, { clientX: 40, pointerId: 1 });
    expect(onRangeChange).toHaveBeenLastCalledWith([40, 70]);
    fireEvent.pointerUp(track, { pointerId: 1 });
  });

  it("TKFileInput handles picker files, previews, progress and drop-zone files", () => {
    installBlobUrlMocks();
    const onFilesChange = vi.fn();
    render(
      <kit.TKFileInput
        label="Upload"
        emptyLabel="No files yet"
        buttonLabel="Pick"
        accept="image/*"
        multiple
        dropZone
        progress={42}
        onFilesChange={onFilesChange}
        testId="file"
      />,
    );

    const input = screen.getByTestId("file").querySelector("input[type='file']") as HTMLInputElement;
    const image = new File(["image"], "photo.png", { type: "image/png" });
    fireEvent.change(input, { target: { files: [image] } });

    expect(onFilesChange).toHaveBeenLastCalledWith([image]);
    expect(screen.getByText("photo.png")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Progress" })).toHaveAttribute("aria-valuenow", "42");
    expect(screen.getByTestId("file").querySelector("img")).toHaveAttribute("src", "blob:preview");

    const row = screen.getByRole("button");
    const text = new File(["text"], "note.txt", { type: "text/plain" });
    fireEvent.dragOver(row);
    fireEvent.drop(row, { dataTransfer: { files: [text, image] } });

    expect(onFilesChange).toHaveBeenLastCalledWith([text, image]);
    expect(screen.getByText("note.txt, photo.png")).toBeInTheDocument();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview");
  });

  it("TKFileInput ignores disabled keyboard and drop interactions", () => {
    const onFilesChange = vi.fn();
    render(<kit.TKFileInput disabled dropZone onFilesChange={onFilesChange} testId="file-disabled" />);

    const row = screen.getByRole("button");
    fireEvent.keyDown(row, { key: "Enter" });
    fireEvent.drop(row, { dataTransfer: { files: [new File(["x"], "x.txt")] } });

    expect(onFilesChange).not.toHaveBeenCalled();
    expect(row).toHaveAttribute("aria-disabled", "true");
  });

  it("TKSearch exposes focus state, change and cancel callbacks", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onCancel = vi.fn();
    render(<kit.TKSearch placeholder="Find" cancelLabel="Close" onChange={onChange} onCancel={onCancel} />);

    const input = screen.getByPlaceholderText("Find");
    await user.type(input, "orders");
    expect(onChange).toHaveBeenLastCalledWith("orders");

    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onChange).toHaveBeenLastCalledWith("");
    expect(onCancel).toHaveBeenCalledOnce();
    expect(input).toHaveValue("");
  });

  it("TKSelect supports search, disabled options and keyboard selection", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <kit.TKSelect
        label="City"
        searchable
        placeholder="Choose"
        options={[
          { label: "Europe", options: [{ value: "paris", label: "Paris", icon: "pin" }] },
          { label: "Asia", options: [{ value: "tokyo", label: "Tokyo" }, { value: "osaka", label: "Osaka", disabled: true }] },
        ]}
        onChange={onChange}
      />,
    );

    const combo = screen.getByRole("combobox", { name: "City" });
    await user.click(combo);
    expect(screen.getByRole("option", { name: "Osaka" })).toBeDisabled();

    await user.type(screen.getByPlaceholderText("Search"), "tok");
    expect(screen.queryByRole("option", { name: "Paris" })).not.toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Tokyo" })).toBeInTheDocument();

    fireEvent.keyDown(combo, { key: "ArrowDown" });
    fireEvent.keyDown(combo, { key: "Enter" });
    expect(onChange).toHaveBeenLastCalledWith("tokyo");
    expect(combo).toHaveAttribute("aria-expanded", "false");
  });

  it("TKSelect closes on outside pointer and Escape", async () => {
    const user = userEvent.setup();
    render(
      <>
        <kit.TKSelect options={["Alpha", "Beta"]} />
        <button type="button">outside</button>
      </>,
    );

    const combo = screen.getByRole("combobox");
    await user.click(combo);
    expect(combo).toHaveAttribute("aria-expanded", "true");
    fireEvent.pointerDown(screen.getByRole("button", { name: "outside" }));
    expect(combo).toHaveAttribute("aria-expanded", "false");

    fireEvent.keyDown(combo, { key: " " });
    expect(combo).toHaveAttribute("aria-expanded", "true");
    fireEvent.keyDown(combo, { key: "Escape" });
    expect(combo).toHaveAttribute("aria-expanded", "false");
  });

  it("card primitives support keyboard activation and visual tones", () => {
    const onCard = vi.fn();
    const onCell = vi.fn();
    const onChip = vi.fn();
    render(
      <>
        <kit.TKCard onClick={onCard} testId="card">
          Card
        </kit.TKCard>
        <kit.TKCardCell title="Cell" subtitle="Sub" before={<span>before</span>} after={<span>after</span>} compact onClick={onCell} />
        <kit.TKCardCell as="a" href="#target" title="Link cell" />
        <kit.TKCardChip selected tone="red" onClick={onChip}>
          Urgent
        </kit.TKCardChip>
        <kit.TKCardChip tone="gray">Muted</kit.TKCardChip>
      </>,
    );

    fireEvent.keyDown(screen.getByTestId("card"), { key: "Enter" });
    fireEvent.keyDown(screen.getByRole("button", { name: /Cell/ }), { key: " " });
    fireEvent.click(screen.getByRole("button", { name: "Urgent" }));

    expect(onCard).toHaveBeenCalledOnce();
    expect(onCell).toHaveBeenCalledOnce();
    expect(onChip).toHaveBeenCalledOnce();
    expect(screen.getByRole("link", { name: "Link cell" })).toHaveAttribute("href", "#target");
  });

  it("product cards handle add, click, favorite, badges and rich metadata", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onAddA = vi.fn();
    const onAddB = vi.fn();
    const onFavChange = vi.fn();
    render(
      <>
        <kit.TKProductCardA title="Camera" price="$199" onClick={onClick} onAdd={onAddA} testId="a" />
        <kit.TKProductCardB
          title="Headphones"
          price="$99"
          oldPrice="$129"
          rating="4.9"
          reviews="12"
          discount="-20%"
          defaultFav={false}
          onFavChange={onFavChange}
          onAdd={onAddB}
          addLabel="Buy"
        />
      </>,
    );

    await user.click(screen.getByTestId("a"));
    expect(onClick).toHaveBeenCalledOnce();

    await user.click(screen.getByRole("button", { name: "Add to cart" }));
    expect(onAddA).toHaveBeenCalledOnce();
    expect(onClick).toHaveBeenCalledOnce();

    await user.click(screen.getByRole("button", { name: "Toggle favorite" }));
    await user.click(screen.getByRole("button", { name: "Buy" }));

    expect(onFavChange).toHaveBeenLastCalledWith(true);
    expect(onAddB).toHaveBeenCalledOnce();
    expect(screen.getByText("-20%")).toBeInTheDocument();
    expect(screen.getByText("4.9")).toBeInTheDocument();
    expect(screen.getByText("$129")).toBeInTheDocument();
  });

  it("TKConfetti animates particles when canvas APIs are available", () => {
    vi.useFakeTimers();
    const ctx = {
      clearRect: vi.fn(),
      save: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      fillRect: vi.fn(),
      restore: vi.fn(),
      fillStyle: "",
    } as unknown as CanvasRenderingContext2D;
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(ctx);
    const raf = vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      window.setTimeout(() => cb(performance.now()), 16);
      return 7;
    });
    const caf = vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
    const onDone = vi.fn();

    render(<kit.TKConfetti count={4} duration={60} colors={["#111", "#222"]} onDone={onDone} testId="boom" />);
    const canvas = screen.getByTestId("boom").querySelector("canvas") as HTMLCanvasElement;
    Object.defineProperty(canvas, "offsetWidth", { value: 320, configurable: true });
    Object.defineProperty(canvas, "offsetHeight", { value: 480, configurable: true });

    act(() => vi.advanceTimersByTime(20));
    expect(ctx.clearRect).toHaveBeenCalled();
    expect(ctx.fillRect).toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(80));
    expect(onDone).toHaveBeenCalledOnce();
    expect(screen.queryByTestId("boom")).not.toBeInTheDocument();
    expect(raf).toHaveBeenCalled();
    expect(caf).toHaveBeenCalledWith(7);
  });

  it("TKChip removal and TKChipGroup roving multi-select execute interaction branches", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onRemove = vi.fn();
    const onChange = vi.fn();
    render(
      <>
        <kit.TKChip selected removable onClick={onClick} onRemove={onRemove} icon="star">
          Selected
        </kit.TKChip>
        <kit.TKChip disabled icon="warning">
          Disabled
        </kit.TKChip>
        <kit.TKChipGroup
          multi
          defaultValue={["a"]}
          onChange={onChange}
          items={[
            { value: "a", label: "Alpha", icon: "check" },
            { value: "b", label: "Beta", disabled: true },
            { value: "c", label: "Gamma" },
          ]}
        />
      </>,
    );

    await user.click(screen.getByText("Selected").parentElement!.querySelector("span:last-child") as HTMLElement);
    expect(onRemove).toHaveBeenCalledOnce();
    expect(onClick).not.toHaveBeenCalled();

    const alpha = screen.getByRole("button", { name: /Alpha/ });
    alpha.focus();
    fireEvent.keyDown(alpha, { key: "ArrowRight" });
    expect(screen.getByRole("button", { name: /Gamma/ })).toHaveFocus();

    await user.click(screen.getByRole("button", { name: /Gamma/ }));
    expect(onChange).toHaveBeenLastCalledWith(["a", "c"]);
    await user.click(alpha);
    expect(onChange).toHaveBeenLastCalledWith(["c"]);
    expect(screen.getByRole("button", { name: /Beta/ })).toBeDisabled();
  });

  it("TKStepper editable input clamps typed values and autorepeats pointer presses", () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    render(<kit.TKStepper editable min={1} max={5} defaultValue={2} onChange={onChange} />);

    const input = screen.getByRole("spinbutton", { name: "Quantity" }) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "9" } });
    fireEvent.blur(input);
    expect(onChange).toHaveBeenLastCalledWith(5);

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "3" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenLastCalledWith(5);

    const decrement = screen.getByRole("button", { name: "Decrease" });
    fireEvent.pointerDown(decrement);
    act(() => vi.advanceTimersByTime(650));
    fireEvent.pointerUp(decrement);
    expect(onChange).toHaveBeenCalledWith(4);
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("TKRating supports hover, half-star clicks and readonly mode", () => {
    const onChange = vi.fn();
    const { rerender } = render(<kit.TKRating allowHalf defaultValue={2.5} onChange={onChange} testId="rating" />);

    const stars = screen.getAllByRole("button");
    Object.defineProperty(stars[2], "getBoundingClientRect", {
      value: () => ({ left: 0, width: 20, top: 0, right: 20, bottom: 20, height: 20 }),
      configurable: true,
    });
    fireEvent.mouseEnter(stars[3]);
    expect(screen.getByTestId("rating").querySelectorAll(".tk-pop").length).toBeGreaterThan(0);
    fireEvent.mouseLeave(stars[3]);
    fireEvent.click(stars[2], { clientX: 5 });
    expect(onChange).toHaveBeenLastCalledWith(2.5);
    fireEvent.click(stars[2], { clientX: 15 });
    expect(onChange).toHaveBeenLastCalledWith(3);

    rerender(<kit.TKRating readonly defaultValue={4} />);
    fireEvent.click(screen.getAllByRole("button")[0]);
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(screen.getAllByRole("button")[0]).toHaveAttribute("aria-disabled", "true");
  });

  it("TKDateInput opens month/year selectors and applies calendar selections", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <kit.TKDateInput
        label="Travel date"
        placeholder="Pick date"
        min={new Date(1980, 0, 1)}
        max={new Date(2026, 11, 31)}
        defaultValue={new Date(2026, 5, 10)}
        onChange={onChange}
        sheetTitle="Choose date"
      />,
    );

    await user.click(screen.getByDisplayValue("06/10/2026"));
    fireEvent.change(screen.getByLabelText("Year"), { target: { value: "1990" } });
    fireEvent.change(screen.getByLabelText("Month"), { target: { value: "0" } });
    await user.click(screen.getByRole("button", { name: "January 5, 1990" }));

    const picked = onChange.mock.lastCall![0] as Date;
    expect([picked.getFullYear(), picked.getMonth(), picked.getDate()]).toEqual([1990, 0, 5]);
    expect(screen.getByDisplayValue("01/05/1990")).toBeInTheDocument();
  });

  it("TKDateInput clears, flags syntax errors and ignores incomplete drafts", () => {
    const onChange = vi.fn();
    render(
      <kit.TKDateInput
        label="Birth date"
        placeholder="DD / MM / YYYY"
        defaultValue={new Date(1990, 1, 17)}
        min={new Date(1900, 0, 1)}
        max={new Date(2026, 5, 15)}
        disabledDates={(date) => date.getDay() === 0}
        invalidText="Bad date"
        onChange={onChange}
      />,
    );

    const input = screen.getByDisplayValue("02/17/1990") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "" } });
    expect(onChange).toHaveBeenLastCalledWith(null);

    fireEvent.change(input, { target: { value: "12/" } });
    expect(screen.queryByText("Bad date")).not.toBeInTheDocument();

    fireEvent.change(input, { target: { value: "abc" } });
    expect(screen.getByText("Bad date")).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "07 / 06 / 2026" } });
    expect(screen.getByText("Bad date")).toBeInTheDocument();
  });

  it("TKSlider single-thumb pointer path snaps, haptics and handles degenerate ranges", () => {
    const onChange = vi.fn();
    const haptics: string[] = [];
    render(
      <kit.TKTelegramProvider
        haptics
        signalReady={false}
        webApp={{
          HapticFeedback: {
            selectionChanged: () => haptics.push("selection"),
          },
        }}
      >
        <kit.TKSlider label="Volume" min={0} max={100} step={10} defaultValue={20} onChange={onChange} marks={[0, 50, 100]} testId="slider" />
        <kit.TKSlider label="Flat" min={5} max={5} defaultValue={5} marks={[5]} />
      </kit.TKTelegramProvider>,
    );

    const slider = screen.getByRole("slider", { name: "Volume" });
    Object.defineProperty(slider, "setPointerCapture", { value: vi.fn(), configurable: true });
    Object.defineProperty(slider, "getBoundingClientRect", {
      value: () => ({ left: 0, width: 200, top: 0, right: 200, bottom: 28, height: 28 }),
      configurable: true,
    });

    fireEvent.pointerDown(slider, { clientX: 55, pointerId: 1 });
    expect(onChange).toHaveBeenLastCalledWith(30);
    expect(haptics).toContain("selection");
    fireEvent.pointerMove(slider, { clientX: 160, pointerId: 1 });
    expect(onChange).toHaveBeenLastCalledWith(80);
    fireEvent.pointerUp(slider, { pointerId: 1 });
    expect(screen.getByRole("slider", { name: "Flat" })).toHaveAttribute("aria-valuenow", "5");
  });

  it("TKSheet drag moves between snap points and closes from the lowest snap", () => {
    const onClose = vi.fn();
    const sheetRef = createRef<kit.TKSheetHandle>();
    render(
      <kit.TKFrame height={500}>
        <kit.TKSheet open title="Panel" onClose={onClose} snapPoints={[0.3, 0.8]} sheetRef={sheetRef} testId="sheet">
          Body
        </kit.TKSheet>
      </kit.TKFrame>,
    );

    const sheet = screen.getByTestId("sheet");
    Object.defineProperty(sheet, "clientHeight", { value: 400, configurable: true });
    const grab = sheet.firstElementChild as HTMLElement;
    Object.defineProperty(grab, "setPointerCapture", { value: vi.fn(), configurable: true });

    fireEvent.pointerDown(grab, { clientY: 220, clientX: 10, pointerId: 1, timeStamp: 0 });
    fireEvent.pointerMove(grab, { clientY: 20, clientX: 10, pointerId: 1, timeStamp: 20 });
    fireEvent.pointerUp(grab, { clientY: 20, clientX: 10, pointerId: 1, timeStamp: 40 });
    expect(sheetRef.current?.snapIndex).toBe(1);

    fireEvent.pointerDown(grab, { clientY: 20, clientX: 10, pointerId: 2, timeStamp: 100 });
    fireEvent.pointerMove(grab, { clientY: 260, clientX: 10, pointerId: 2, timeStamp: 140 });
    fireEvent.pointerUp(grab, { clientY: 260, clientX: 10, pointerId: 2, timeStamp: 160 });
    expect(sheetRef.current?.snapIndex).toBe(0);

    fireEvent.pointerDown(grab, { clientY: 20, clientX: 10, pointerId: 3, timeStamp: 200 });
    fireEvent.pointerMove(grab, { clientY: 280, clientX: 10, pointerId: 3, timeStamp: 240 });
    fireEvent.pointerUp(grab, { clientY: 280, clientX: 10, pointerId: 3, timeStamp: 260 });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("display helpers cover media load/error, bar hover and progress clamps", () => {
    const onLoad = vi.fn();
    const onError = vi.fn();
    const onBarClick = vi.fn();
    const { rerender } = render(
      <>
        <kit.TKBadge tone={"unknown" as never} soft testId="badge">
          Badge
        </kit.TKBadge>
        <kit.TKDot tone="gray" pulse testId="dot" />
        <kit.TKAvatar initials="AK" src="avatar.png" alt="Anna" status={<span>!</span>} testId="avatar" />
        <kit.TKImage src="photo.png" alt="Photo" lazy={false} fit="contain" onLoad={onLoad} onError={onError} testId="image" />
        <kit.TKProgress value={140} testId="progress" />
        <kit.TKRing value={-1} testId="ring" />
        <kit.TKBars data={[2, 4, 1]} labels={["A", "B", "C"]} onBarClick={onBarClick} testId="bars" />
        <kit.TKEmptyState title="Empty" text="Nothing here" cta="Retry" onCta={vi.fn()} tone="red" />
      </>,
    );

    fireEvent.error(screen.getByAltText("Anna"));
    expect(screen.getByTestId("avatar").textContent).toContain("AK");

    fireEvent.load(screen.getByAltText("Photo"));
    expect(onLoad).toHaveBeenCalledOnce();

    const bars = screen.getByTestId("bars").querySelectorAll("div[style*='border-radius']");
    fireEvent.mouseEnter(bars[1]);
    fireEvent.click(bars[1]);
    fireEvent.mouseLeave(bars[1]);
    expect(onBarClick).toHaveBeenCalledWith(1);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "140");

    rerender(<kit.TKImage src="photo.png" alt="Photo" onError={onError} testId="image" />);
    fireEvent.error(screen.getByAltText("Photo"));
    expect(onError).toHaveBeenCalledOnce();
    expect(screen.getByTestId("image")).toHaveTextContent("image");
  });

  it("selection controls cover indeterminate, roving radio and standalone switch branches", () => {
    const onCheck = vi.fn();
    const onRadio = vi.fn();
    const onSwitch = vi.fn();
    render(
      <>
        <kit.TKCheckbox label="All" indeterminate onChange={onCheck} />
        <kit.TKRadioGroup
          defaultValue="a"
          onChange={onRadio}
          options={[
            { value: "a", label: "A" },
            { value: "b", label: "B", disabled: true },
            { value: "c", label: "C" },
          ]}
        />
        <kit.TKSwitch ariaLabel="Standalone" defaultChecked={false} onChange={onSwitch} />
      </>,
    );

    fireEvent.click(screen.getByRole("checkbox", { name: "All" }));
    expect(onCheck).toHaveBeenCalledWith(true);

    const radioA = screen.getByRole("radio", { name: "A" });
    radioA.focus();
    fireEvent.keyDown(radioA, { key: "ArrowRight" });
    expect(onRadio).toHaveBeenCalledWith("c");
    expect(screen.getByRole("radio", { name: "C" })).toHaveFocus();

    fireEvent.click(screen.getByRole("switch", { name: "Standalone" }));
    expect(onSwitch).toHaveBeenCalledWith(true);
  });
});
