import { describe, expect, it, vi } from "vitest";
import { loadPersisted, savePersisted, STORAGE_KEYS, type StorageBackends } from "./persistence";
import { createInitialState, toPersisted, type PersistedState } from "./reducer";

type FakeStore = StorageBackends["cloud"];

function fakeStore() {
  const map = new Map<string, string>();
  const set = vi.fn(async (k: string, v: string) => {
    map.set(k, v);
  });
  const remove = vi.fn(async (k: string) => {
    map.delete(k);
  });
  const store = {
    get: async (k: string) => map.get(k) ?? null,
    getMany: async (ks: string[]) => Object.fromEntries(ks.map((k) => [k, map.get(k) ?? null])),
    set,
    remove,
    removeMany: async (ks: string[]) => {
      ks.forEach((k) => map.delete(k));
    },
    keys: async () => [...map.keys()],
    clear: async () => map.clear(),
    isSupported: true,
  } as unknown as FakeStore;
  return { store, map, set, remove };
}

function backends() {
  const cloud = fakeStore();
  const device = fakeStore();
  const secure = fakeStore();
  return {
    cloud,
    device,
    secure,
    handle: { cloud: cloud.store, device: device.store, secure: secure.store } as StorageBackends,
  };
}

const persisted = (): PersistedState => toPersisted({ ...createInitialState(), hydrated: true });

describe("persistence", () => {
  it("round-trips every slice through the matching backend", async () => {
    const b = backends();
    const state: PersistedState = {
      ...persisted(),
      onboardingDone: true,
      streak: { xp: 999, dayOfWeek: 6 },
      wallet: { connected: true, address: "EQc…demo", trailPassActive: true },
      themePrefs: { accent: "#e5484d", roundness: 0.6, motion: "smooth", fontSize: 17, lang: "ru", colorScheme: "dark" },
      pin: "4821",
    };
    await savePersisted(null, state, b.handle);
    const loaded = await loadPersisted(b.handle);
    expect(loaded).toEqual(state);
  });

  it("routes slices to the right backend (pin → secure, theme → device, rest → cloud)", async () => {
    const b = backends();
    await savePersisted(null, { ...persisted(), pin: "1234" }, b.handle);
    expect(b.secure.map.get(STORAGE_KEYS.pin)).toBe("1234");
    expect(b.device.map.has(STORAGE_KEYS.themePrefs)).toBe(true);
    expect(b.cloud.map.has(STORAGE_KEYS.bookings)).toBe(true);
    expect(b.cloud.map.has(STORAGE_KEYS.pin)).toBe(false);
  });

  it("writes only the slices that changed between prev and next", async () => {
    const b = backends();
    const prev = persisted();
    await savePersisted(null, prev, b.handle); // initial write of everything
    b.cloud.set.mockClear();
    b.device.set.mockClear();

    const next: PersistedState = { ...prev, onboardingDone: true };
    await savePersisted(prev, next, b.handle);
    // onboarding changed → one cloud write; nothing else.
    expect(b.cloud.set).toHaveBeenCalledTimes(1);
    expect(b.cloud.set).toHaveBeenCalledWith(STORAGE_KEYS.onboarding, JSON.stringify(true));
    expect(b.device.set).not.toHaveBeenCalled();
  });

  it("removes the pin from secure storage when cleared to null", async () => {
    const b = backends();
    await savePersisted(null, { ...persisted(), pin: "1234" }, b.handle);
    expect(b.secure.map.get(STORAGE_KEYS.pin)).toBe("1234");
    await savePersisted({ ...persisted(), pin: "1234" }, { ...persisted(), pin: null }, b.handle);
    expect(b.secure.map.has(STORAGE_KEYS.pin)).toBe(false);
    expect(b.secure.remove).toHaveBeenCalledWith(STORAGE_KEYS.pin);
  });

  it("omits missing or corrupt entries so seed defaults survive", async () => {
    const b = backends();
    // nothing saved yet
    expect(await loadPersisted(b.handle)).toEqual({});
    // corrupt JSON is ignored, not thrown
    await b.cloud.store.set(STORAGE_KEYS.bookings, "{not json");
    expect(await loadPersisted(b.handle)).toEqual({});
  });
});
