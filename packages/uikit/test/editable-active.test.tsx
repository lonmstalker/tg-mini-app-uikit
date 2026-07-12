import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useKeyboard } from "@tg-mini-app/telegram";

/* KB-1.8 · tkIsEditableActive contract, pinned through the public pre-shrink
   gate: focusin pre-shrinks ONLY when the focused element can raise an
   on-screen keyboard. A stored kb height arms the pre-shrink; whether it
   fires is exactly tkIsEditableActive(document.activeElement). */

function installVV(innerHeight = 800) {
  const listeners = new Map<string, Set<() => void>>();
  const vv = {
    height: innerHeight,
    offsetTop: 0,
    addEventListener: (e: string, cb: () => void) => {
      if (!listeners.has(e)) listeners.set(e, new Set());
      listeners.get(e)!.add(cb);
    },
    removeEventListener: (e: string, cb: () => void) => listeners.get(e)?.delete(cb),
  };
  Object.defineProperty(window, "innerHeight", { value: innerHeight, configurable: true });
  Object.defineProperty(window, "visualViewport", { value: vv, configurable: true });
}

beforeEach(() => {
  vi.useFakeTimers();
  window.localStorage.setItem("tk:kbHeight", "264");
  Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  installVV();
});

afterEach(() => {
  Reflect.deleteProperty(window, "visualViewport");
  window.localStorage.removeItem("tk:kbHeight");
  vi.useRealTimers();
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

/** true, если фокус на el взводит pre-shrink (= tkIsEditableActive). */
function preShrinksOnFocus(el: HTMLElement): boolean {
  document.body.append(el);
  const { result, unmount } = renderHook(() => useKeyboard(80));
  act(() => {
    el.focus();
    document.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
  });
  const visible = result.current.visible;
  unmount();
  el.remove();
  return visible;
}

function inputOf(type: string): HTMLInputElement {
  const el = document.createElement("input");
  el.type = type;
  return el;
}

describe("KB-1.8 non-text controls never pre-shrink", () => {
  for (const type of ["checkbox", "radio", "range", "button", "submit", "reset", "color", "file", "image"]) {
    it(`input[type=${type}] is not editable`, () => {
      expect(preShrinksOnFocus(inputOf(type))).toBe(false);
    });
  }

  it("input[type=hidden] cannot even take focus — not editable", () => {
    expect(preShrinksOnFocus(inputOf("hidden"))).toBe(false);
  });

  it("a <button> element is not editable", () => {
    expect(preShrinksOnFocus(document.createElement("button"))).toBe(false);
  });

  it('contenteditable="false" is not editable', () => {
    const el = document.createElement("div");
    el.setAttribute("contenteditable", "false");
    el.tabIndex = -1;
    expect(preShrinksOnFocus(el)).toBe(false);
  });

  it("no editable focus at all (body) does not pre-shrink", () => {
    const el = document.createElement("div");
    // не фокусируемый div: activeElement остаётся body
    expect(preShrinksOnFocus(el)).toBe(false);
  });
});

describe("KB-1.8 text-entry surfaces pre-shrink", () => {
  for (const type of ["text", "search", "tel", "url", "email", "password", "number"]) {
    it(`input[type=${type}] is editable`, () => {
      expect(preShrinksOnFocus(inputOf(type))).toBe(true);
    });
  }

  it("a <textarea> is editable", () => {
    expect(preShrinksOnFocus(document.createElement("textarea"))).toBe(true);
  });

  it('contenteditable="true" is editable', () => {
    const el = document.createElement("div");
    el.setAttribute("contenteditable", "true");
    el.tabIndex = -1;
    expect(preShrinksOnFocus(el)).toBe(true);
  });
});

describe("KB-1.8 date/time pickers: pinned as editable", () => {
  // Решение: date/time-инпуты СЧИТАЮТСЯ editable. iOS Telegram показывает
  // для них выезжающий снизу пикер, геометрически похожий на клавиатуру, и
  // pre-shrink спекулятивен: если resize не подтвердит его, ревертится за
  // ~600мс (KB-1.5c) — цена ложного срабатывания мала, пропущенный шринк
  // под реальным пикером хуже. Смена этого поведения — осознанное решение,
  // не случайный дрейф регэкспа TK_NON_TEXT_INPUT.
  for (const type of ["date", "time", "datetime-local", "month", "week"]) {
    it(`input[type=${type}] pre-shrinks`, () => {
      expect(preShrinksOnFocus(inputOf(type))).toBe(true);
    });
  }
});
