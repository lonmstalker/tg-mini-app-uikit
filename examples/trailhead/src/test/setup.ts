import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

/*
 * jsdom under Vitest does not always expose a writable `localStorage`. The kit's
 * storage fallback (and our persistence layer) lean on it, so install a
 * spec-like in-memory Storage — items live as own enumerable properties, so
 * `Object.keys`, `length` and `key(i)` behave like the real thing.
 */
function createMemoryStorage(): Storage {
  const data = new Map<string, string>();
  const methods: Record<PropertyKey, unknown> = {
    getItem: (key: string) => (data.has(String(key)) ? data.get(String(key))! : null),
    setItem: (key: string, value: string) => void data.set(String(key), String(value)),
    removeItem: (key: string) => void data.delete(String(key)),
    clear: () => void data.clear(),
    key: (index: number) => [...data.keys()][index] ?? null,
  };
  return new Proxy({} as Storage, {
    get(_t, prop) {
      if (prop === "length") return data.size;
      if (prop in methods) return methods[prop];
      return data.has(String(prop)) ? data.get(String(prop)) : undefined;
    },
    set(_t, prop, value) {
      data.set(String(prop), String(value));
      return true;
    },
    deleteProperty(_t, prop) {
      data.delete(String(prop));
      return true;
    },
    has(_t, prop) {
      return prop === "length" || prop in methods || data.has(String(prop));
    },
    ownKeys() {
      return [...data.keys()];
    },
    getOwnPropertyDescriptor(_t, prop) {
      if (!data.has(String(prop))) return undefined;
      return { enumerable: true, configurable: true, writable: true, value: data.get(String(prop)) };
    },
  });
}

if (typeof window !== "undefined" && !window.localStorage) {
  const storage = createMemoryStorage();
  Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true, writable: true });
  if ((window as unknown) !== globalThis) {
    Object.defineProperty(window, "localStorage", { value: storage, configurable: true, writable: true });
  }
}

afterEach(() => {
  cleanup();
  if (typeof window !== "undefined") window.localStorage?.clear();
});
