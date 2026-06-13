import { act, fireEvent, render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as kit from "../src/index";
import { useNav } from "../src/nav";
import { createStorageApi } from "../src/telegram/storage";
import { useClosingConfirmation, useSettingsButton, useTelegramPopup, type TelegramWebApp } from "../src/telegram";
import { wrapperFor } from "./helpers/telegram";

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("coverage-backed infrastructure behaviours", () => {
  it("createStorageApi covers localStorage prefix, clear and missing window fallback", async () => {
    const api = createStorageApi(undefined, "probe:");

    await api.set("a", "1");
    await api.set("b", "2");
    window.localStorage.setItem("other", "3");

    await expect(api.get("a")).resolves.toBe("1");
    await expect(api.getMany(["a", "missing"])).resolves.toEqual({ a: "1", missing: null });
    await expect(api.keys()).resolves.toEqual(["a", "b"]);

    await api.removeMany(["a"]);
    await expect(api.keys()).resolves.toEqual(["b"]);
    await api.clear?.();
    await expect(api.keys()).resolves.toEqual([]);
    expect(window.localStorage.getItem("other")).toBe("3");
  });

  it("createStorageApi covers native batch, fallback batch, restore and error paths", async () => {
    const stored = new Map<string, string>();
    const native = {
      setItem: vi.fn((key: string, value: string, cb?: (error: Error | null) => void) => {
        stored.set(key, value);
        cb?.(null);
      }),
      getItem: vi.fn((key: string, cb: (error: Error | null, value?: string | null) => void) => cb(null, stored.get(key) ?? null)),
      getItems: vi.fn((keys: string[], cb: (error: Error | null, values?: Record<string, string | null>) => void) =>
        cb(null, Object.fromEntries(keys.map((key) => [key, stored.get(key) ?? null]))),
      ),
      removeItem: vi.fn((key: string, cb?: (error: Error | null) => void) => {
        stored.delete(key);
        cb?.(null);
      }),
      removeItems: vi.fn((keys: string[], cb?: (error: Error | null) => void) => {
        keys.forEach((key) => stored.delete(key));
        cb?.(null);
      }),
      getKeys: vi.fn((cb: (error: Error | null, keys?: string[]) => void) => cb(null, [...stored.keys()])),
      clear: vi.fn((cb?: (error: Error | null) => void) => {
        stored.clear();
        cb?.(null);
      }),
      restoreItem: vi.fn((key: string, cb?: (error: Error | null, value?: string | null) => void) => cb?.(null, `restored:${key}`)),
    };
    const api = createStorageApi(native, "native:");

    await api.set("k", "v");
    await expect(api.get("k")).resolves.toBe("v");
    await expect(api.getMany(["k", "x"])).resolves.toEqual({ k: "v", x: null });
    await expect(api.keys()).resolves.toEqual(["k"]);
    await expect(api.restore?.("lost")).resolves.toBe("restored:lost");
    await api.removeMany(["k"]);
    await expect(api.keys()).resolves.toEqual([]);
    await api.clear?.();

    const fallbackNative = createStorageApi(
      {
        setItem: native.setItem,
        getItem: native.getItem,
        removeItem: native.removeItem,
      },
      "native:",
    );
    await fallbackNative.set("a", "1");
    await fallbackNative.set("b", "2");
    await expect(fallbackNative.getMany(["a", "b"])).resolves.toEqual({ a: "1", b: "2" });
    await fallbackNative.removeMany(["a", "b"]);
    await expect(fallbackNative.keys()).resolves.toEqual([]);

    const failing = createStorageApi(
      {
        setItem: (_key, _value, cb) => cb?.(null),
        getItem: (_key, cb) => cb(null, null),
        getItems: (_keys, cb) => cb(new Error("batch get")),
        removeItems: (_keys, cb) => cb?.(new Error("batch remove")),
        getKeys: (cb) => cb(new Error("keys")),
        clear: (cb) => cb?.(new Error("clear")),
        restoreItem: (_key, cb) => cb?.(new Error("restore")),
      },
      "native:",
    );

    await expect(failing.getMany(["x"])).rejects.toThrow("batch get");
    await expect(failing.removeMany(["x"])).rejects.toThrow("batch remove");
    await expect(failing.keys()).rejects.toThrow("keys");
    await expect(failing.clear?.()).rejects.toThrow("clear");
    await expect(failing.restore?.("x")).rejects.toThrow("restore");
  });

  it("native button hooks cover legacy setters, settings button and closing confirmation", () => {
    const mainCalls: string[] = [];
    const clickHandlers = new Set<() => void>();
    const webApp: TelegramWebApp = {
      MainButton: {
        onClick: (handler) => clickHandlers.add(handler),
        offClick: (handler) => clickHandlers.delete(handler),
        setText: (text) => mainCalls.push(`text:${text}`),
        show: () => mainCalls.push("show"),
        hide: () => mainCalls.push("hide"),
        enable: () => mainCalls.push("enable"),
        disable: () => mainCalls.push("disable"),
        showProgress: () => mainCalls.push("progress:on"),
        hideProgress: () => mainCalls.push("progress:off"),
      },
      SettingsButton: {
        onClick: (handler) => clickHandlers.add(handler),
        offClick: (handler) => clickHandlers.delete(handler),
        show: () => mainCalls.push("settings:show"),
        hide: () => mainCalls.push("settings:hide"),
      },
      enableClosingConfirmation: () => mainCalls.push("closing:on"),
      disableClosingConfirmation: () => mainCalls.push("closing:off"),
    };
    const onMain = vi.fn();
    const onSettings = vi.fn();
    const { rerender, unmount } = renderHook(
      ({ visible, loading }) => {
        kit.useMainButton({ text: "Go", visible, loading, disabled: loading, onClick: onMain });
        useSettingsButton(onSettings, visible);
        useClosingConfirmation(visible);
      },
      { wrapper: wrapperFor(webApp), initialProps: { visible: true, loading: false } },
    );

    expect(mainCalls).toEqual(expect.arrayContaining(["text:Go", "show", "enable", "progress:off", "settings:show", "closing:on"]));
    act(() => clickHandlers.forEach((handler) => handler()));
    expect(onMain).toHaveBeenCalledOnce();
    expect(onSettings).toHaveBeenCalledOnce();

    rerender({ visible: false, loading: true });
    expect(mainCalls).toEqual(expect.arrayContaining(["hide", "disable", "progress:on", "settings:hide", "closing:off"]));

    unmount();
    expect(mainCalls.filter((call) => call === "hide").length).toBeGreaterThanOrEqual(2);
    expect(clickHandlers.size).toBe(0);
  });

  it("popup fallbacks return the matching button id", async () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValueOnce(true).mockReturnValueOnce(false);
    const { result } = renderHook(() => useTelegramPopup());

    await expect(
      result.current.show({
        title: "Delete",
        message: "Sure?",
        buttons: [
          { id: "cancel", type: "cancel", text: "Cancel" },
          { id: "delete", type: "destructive", text: "Delete" },
        ],
      }),
    ).resolves.toBe("delete");
    await expect(
      result.current.show({
        message: "Close?",
        buttons: [{ id: "close", type: "close", text: "Close" }],
      }),
    ).resolves.toBe("close");
    expect(confirm).toHaveBeenCalledWith("Delete\n\nSure?");
  });

  it("popup native paths recover when Telegram throws", async () => {
    const alert = vi.spyOn(window, "alert").mockImplementation(() => {});
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    const { result } = renderHook(() => useTelegramPopup(), {
      wrapper: wrapperFor({
        showAlert: () => {
          throw new Error("busy");
        },
        showConfirm: () => {
          throw new Error("busy");
        },
        showPopup: () => {
          throw new Error("busy");
        },
      }),
    });

    await expect(result.current.alert("fallback")).resolves.toBeUndefined();
    await expect(result.current.confirm("confirm fallback")).resolves.toBe(false);
    await expect(result.current.show({ message: "fallback", buttons: [{ id: "ok", text: "OK" }] })).resolves.toBeUndefined();
    expect(alert).toHaveBeenCalledWith("fallback");
    expect(confirm).toHaveBeenCalledTimes(2);
  });

  it("input, textarea and selectable rows cover clear, password, counters and radio sync", async () => {
    const user = userEvent.setup();
    const onInput = vi.fn();
    const onTextarea = vi.fn();
    const onRadioA = vi.fn();
    const onRadioB = vi.fn();
    render(
      <>
        <kit.TKInput
          label="Password"
          type="password"
          icon="lock"
          defaultValue="secret"
          onChange={onInput}
          maxLength={12}
          prefix={<span>$</span>}
          suffix={<span>USD</span>}
          error="Wrong"
        />
        <kit.TKTextarea id="bio" label="Bio" hint="Short text" maxLength={20} onChange={onTextarea} defaultValue="hi" />
        <kit.TKSelectable type="radio" name="plan" value="basic" label="Basic" onChange={onRadioA} defaultChecked />
        <kit.TKSelectable type="radio" name="plan" value="pro" label="Pro" icon="star" onChange={onRadioB} />
      </>,
    );

    const password = screen.getByDisplayValue("secret") as HTMLInputElement;
    expect(password.type).toBe("password");
    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(password.type).toBe("text");
    await user.click(screen.getByRole("button", { name: "Hide password" }));
    await user.click(password.parentElement!.querySelector(".tk-pop") as HTMLButtonElement);
    expect(onInput).toHaveBeenLastCalledWith("");
    expect(screen.getByText("0/12")).toBeInTheDocument();

    const textarea = screen.getByLabelText("Bio");
    fireEvent.focus(textarea);
    fireEvent.change(textarea, { target: { value: "hello world" } });
    fireEvent.blur(textarea);
    expect(onTextarea).toHaveBeenLastCalledWith("hello world");
    expect(textarea).toHaveAttribute("aria-describedby");

    const proRadio = document.querySelector('input[value="pro"]') as HTMLInputElement;
    fireEvent.change(proRadio, { target: { checked: true } });
    expect(onRadioB).toHaveBeenCalledWith(true);
  });

  it("list group, cells, accordion and virtual list execute interaction branches", async () => {
    const user = userEvent.setup();
    const onCell = vi.fn();
    const onToggle = vi.fn();
    const onAccordion = vi.fn();
    render(
      <>
        <kit.TKListGroup title="Settings" footer="Footer" inset={false} testId="group">
          <kit.TKCell
            title="Danger"
            subtitle="Careful"
            icon="warning"
            iconBg="#f00"
            value="Soon"
            badge="2"
            danger
            chevron
            defaultToggle={false}
            onToggle={onToggle}
            onClick={onCell}
          />
          <kit.TKCell as="a" href="#link" title="Link row" />
        </kit.TKListGroup>
        <kit.TKAccordion
          multiple
          lazy
          title="FAQ"
          footer="Done"
          onChange={onAccordion}
          items={[
            { id: "a", title: "First", subtitle: "Open me", icon: "info", content: "A content" },
            { id: "b", title: "Second", content: "B content", disabled: true },
          ]}
        />
        <kit.TKVirtualList
          items={Array.from({ length: 50 }, (_, i) => `row ${i}`)}
          itemHeight={20}
          height={100}
          overscan={1}
          renderItem={(item, index) => (
            <div>
              {index}:{item}
            </div>
          )}
          testId="virt"
        />
      </>,
    );

    const danger = screen.getByText("Danger").closest("div")!.parentElement!;
    fireEvent.mouseEnter(danger);
    fireEvent.mouseLeave(danger);
    await user.click(screen.getByText("Danger"));
    await user.click(screen.getByRole("switch", { name: "Danger" }));
    expect(onCell).toHaveBeenCalled();
    expect(onToggle).toHaveBeenCalledWith(true);

    await user.click(screen.getByRole("button", { name: /First/ }));
    expect(screen.getByText("A content")).toBeInTheDocument();
    expect(onAccordion).toHaveBeenLastCalledWith(["a"]);
    expect(screen.getByRole("button", { name: /Second/ })).toBeDisabled();

    const virt = screen.getByTestId("virt");
    Object.defineProperty(virt, "scrollTop", { value: 300, configurable: true });
    fireEvent.scroll(virt);
    expect(screen.getByText("14:row 14")).toBeInTheDocument();
  });

  it("sheet, dialog and action sheet cover actions, focus trap and imperative snap API", () => {
    const onClose = vi.fn();
    const onSelect = vi.fn();
    const onOpenChange = vi.fn();
    const sheetRef = createRef<kit.TKSheetHandle>();

    render(
      <kit.TKFrame height={500}>
        <kit.TKSheet open title="Filters" onClose={onClose} onOpenChange={onOpenChange} snapPoints={[0.35, 0.8]} sheetRef={sheetRef}>
          <button type="button">Apply</button>
        </kit.TKSheet>
        <kit.TKDialog open title="Confirm" text="Run?" icon="warning" tone="orange" actions={<button type="button">OK</button>} />
        <kit.TKActionSheet
          open
          cancelLabel="Dismiss"
          onClose={onClose}
          items={[{ icon: "copy", label: "Copy", onSelect }, { label: "Delete", danger: true }]}
        />
      </kit.TKFrame>,
    );

    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(sheetRef.current?.snapIndex).toBe(0);
    act(() => sheetRef.current?.snapTo(9));
    expect(sheetRef.current?.snapIndex).toBe(1);
    act(() => sheetRef.current?.snapTo(-1));
    expect(sheetRef.current?.snapIndex).toBe(0);
    act(() => sheetRef.current?.close());
    expect(onClose).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    expect(onSelect).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalled();
    fireEvent.mouseEnter(screen.getByRole("button", { name: "Delete" }));
    fireEvent.mouseLeave(screen.getByRole("button", { name: "Delete" }));
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onClose).toHaveBeenCalled();

    fireEvent.keyDown(document, { key: "Tab" });
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(screen.getByRole("alertdialog", { name: "Confirm" })).toBeInTheDocument();
  });

  it("nav stack covers push, replace, popTo, pop and swipe-back edge guard", () => {
    const onStackChange = vi.fn();

    function Controls() {
      const nav = useNav();
      return (
        <div>
          {nav.activePanel}:{String((nav.params as { id?: number; tab?: string } | undefined)?.id ?? "")}
          <button type="button" onClick={() => nav.push("details", { id: 1 })}>
            push
          </button>
          <button type="button" onClick={() => nav.replace("settings", { tab: "privacy" })}>
            replace
          </button>
          <button type="button" onClick={() => nav.push("details", { id: 2 })}>
            push again
          </button>
          <button type="button" onClick={() => nav.popTo("settings")}>
            pop to settings
          </button>
          <button type="button" onClick={() => nav.pop()}>
            pop
          </button>
        </div>
      );
    }

    render(
      <kit.TKNavStack initial="home" onStackChange={onStackChange} testId="nav">
        <kit.TKNavPanel id="home">
          <Controls />
        </kit.TKNavPanel>
        <kit.TKNavPanel id="details">Details</kit.TKNavPanel>
        <kit.TKNavPanel id="settings">Settings</kit.TKNavPanel>
      </kit.TKNavStack>,
    );

    fireEvent.click(screen.getByText("push"));
    fireEvent.click(screen.getByText("replace"));
    fireEvent.click(screen.getByText("push again"));
    fireEvent.click(screen.getByText("pop to settings"));
    fireEvent.click(screen.getByText("pop"));

    expect(onStackChange).toHaveBeenCalledWith(["home", "details"]);
    expect(onStackChange).toHaveBeenCalledWith(["home", "settings"]);
    expect(onStackChange).toHaveBeenCalledWith(["home", "settings", "details"]);
    expect(onStackChange).toHaveBeenLastCalledWith(["home"]);

    const navRoot = screen.getByTestId("nav");
    Object.defineProperty(navRoot, "getBoundingClientRect", {
      value: () => ({ left: 0, width: 320, top: 0, right: 320, bottom: 500, height: 500 }),
      configurable: true,
    });
    Object.defineProperty(navRoot, "setPointerCapture", { value: vi.fn(), configurable: true });
    fireEvent.pointerDown(navRoot, { clientX: 80, pointerId: 1 });
    fireEvent.pointerMove(navRoot, { clientX: 180, pointerId: 1 });
    fireEvent.pointerUp(navRoot, { clientX: 180, pointerId: 1 });
    expect(navRoot.querySelectorAll("[data-tk-nav-panel]")).toHaveLength(1);
  });
});
