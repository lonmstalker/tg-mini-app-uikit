import { useEffect, useMemo } from "react";
import type { TelegramInitDataUnsafe, TelegramUser } from "./types";
import { useWebApp } from "./provider";

/* ---------------- Cloud storage ---------------- */

export interface TKCloudStorage {
  get: (key: string) => Promise<string | null>;
  getMany: (keys: string[]) => Promise<Record<string, string | null>>;
  set: (key: string, value: string) => Promise<void>;
  remove: (key: string) => Promise<void>;
  removeMany: (keys: string[]) => Promise<void>;
  keys: () => Promise<string[]>;
  clear?: () => Promise<void>;
  restore?: (key: string) => Promise<string | null>;
  /** True when backed by Telegram CloudStorage rather than localStorage. */
  isSupported: boolean;
}

const LOCAL_PREFIX = "tk-cloud:";

interface TelegramStorageApi {
  setItem?: (key: string, value: string, callback?: (error: Error | null, ok?: boolean) => void) => unknown;
  getItem?: (key: string, callback: (error: Error | null, value?: string | null, canRestore?: boolean) => void) => unknown;
  getItems?: (keys: string[], callback: (error: Error | null, values?: Record<string, string | null>) => void) => unknown;
  removeItem?: (key: string, callback?: (error: Error | null, ok?: boolean) => void) => unknown;
  removeItems?: (keys: string[], callback?: (error: Error | null, ok?: boolean) => void) => unknown;
  getKeys?: (callback: (error: Error | null, keys?: string[]) => void) => unknown;
  clear?: (callback?: (error: Error | null, ok?: boolean) => void) => unknown;
  restoreItem?: (key: string, callback?: (error: Error | null, value?: string | null) => void) => unknown;
}

function getLocalStorage(): Storage | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

export function createStorageApi(storageApi: TelegramStorageApi | undefined, localPrefix: string): TKCloudStorage {
  if (storageApi?.getItem && storageApi.setItem) {
    return {
      get: (key: string) =>
        new Promise<string | null>((resolve, reject) =>
          storageApi.getItem!(key, (err, value) => (err ? reject(err) : resolve(value ?? null))),
        ),
      getMany: (keys: string[]) =>
        new Promise<Record<string, string | null>>((resolve, reject) => {
          if (storageApi.getItems) {
            storageApi.getItems(keys, (err, values) => (err ? reject(err) : resolve(values ?? {})));
            return;
          }
          Promise.all(keys.map((key) => new Promise<[string, string | null]>((res, rej) =>
            storageApi.getItem!(key, (err, value) => (err ? rej(err) : res([key, value ?? null]))),
          )))
            .then((entries) => resolve(Object.fromEntries(entries)))
            .catch(reject);
        }),
      set: (key: string, value: string) =>
        new Promise<void>((resolve, reject) =>
          storageApi.setItem!(key, value, (err) => (err ? reject(err) : resolve())),
        ),
      remove: (key: string) =>
        new Promise<void>((resolve, reject) =>
          storageApi.removeItem ? storageApi.removeItem(key, (err) => (err ? reject(err) : resolve())) : resolve(),
        ),
      removeMany: (keys: string[]) =>
        new Promise<void>((resolve, reject) => {
          if (storageApi.removeItems) {
            storageApi.removeItems(keys, (err) => (err ? reject(err) : resolve()));
            return;
          }
          Promise.all(keys.map((key) => new Promise<void>((res, rej) =>
            storageApi.removeItem ? storageApi.removeItem(key, (err) => (err ? rej(err) : res())) : res(),
          )))
            .then(() => resolve())
            .catch(reject);
        }),
      keys: () =>
        new Promise<string[]>((resolve, reject) =>
          storageApi.getKeys ? storageApi.getKeys((err, keys) => (err ? reject(err) : resolve(keys ?? []))) : resolve([]),
        ),
      clear: storageApi.clear
        ? () => new Promise<void>((resolve, reject) => storageApi.clear!((err) => (err ? reject(err) : resolve())))
        : undefined,
      restore: storageApi.restoreItem
        ? (key: string) =>
            new Promise<string | null>((resolve, reject) =>
              storageApi.restoreItem!(key, (err, value) => (err ? reject(err) : resolve(value ?? null))),
            )
        : undefined,
      isSupported: true,
    };
  }
  return {
    get: async (key: string) => {
      try {
        return getLocalStorage()?.getItem(localPrefix + key) ?? null;
      } catch {
        return null;
      }
    },
    getMany: async (keys: string[]) =>
      Object.fromEntries(
        keys.map((key) => {
          try {
            return [key, getLocalStorage()?.getItem(localPrefix + key) ?? null];
          } catch {
            return [key, null];
          }
        }),
      ),
    set: async (key: string, value: string) => {
      try {
        getLocalStorage()?.setItem(localPrefix + key, value);
      } catch {
        /* best-effort local fallback */
      }
    },
    remove: async (key: string) => {
      try {
        getLocalStorage()?.removeItem(localPrefix + key);
      } catch {
        /* best-effort local fallback */
      }
    },
    removeMany: async (keys: string[]) => {
      keys.forEach((key) => {
        try {
          getLocalStorage()?.removeItem(localPrefix + key);
        } catch {
          /* best-effort local fallback */
        }
      });
    },
    keys: async () => {
      const storage = getLocalStorage();
      if (!storage) return [];
      const out: string[] = [];
      try {
        for (let i = 0; i < storage.length; i++) {
          const k = storage.key(i);
          if (k?.startsWith(localPrefix)) out.push(k.slice(localPrefix.length));
        }
      } catch {
        return [];
      }
      return out;
    },
    clear: async () => {
      const storage = getLocalStorage();
      if (!storage) return;
      try {
        const keys = Object.keys(storage).filter((key) => key.startsWith(localPrefix));
        keys.forEach((key) => storage.removeItem(key));
      } catch {
        /* best-effort local fallback */
      }
    },
    isSupported: false,
  };
}

/**
 * Telegram CloudStorage promisified, with a localStorage fallback outside
 * Telegram — the persistence pattern stays identical in both environments.
 */
export function useCloudStorage(): TKCloudStorage {
  const wa = useWebApp();
  return useMemo(() => createStorageApi(wa?.CloudStorage, LOCAL_PREFIX), [wa]);
}

/* ---------------- Init data & misc ---------------- */

export interface TKInitData {
  /** Raw query string — the only thing your backend should trust (after validating the hash). */
  raw: string | undefined;
  user: TelegramUser | undefined;
  startParam: string | undefined;
  unsafe: TelegramInitDataUnsafe | undefined;
}

/** Launch parameters of the mini app (user, start_param). Display-only — validate `raw` server-side. */
export function useInitData(): TKInitData {
  const wa = useWebApp();
  return useMemo(
    () => ({
      raw: wa?.initData,
      user: wa?.initDataUnsafe?.user,
      startParam: wa?.initDataUnsafe?.start_param,
      unsafe: wa?.initDataUnsafe,
    }),
    [wa],
  );
}

/** Asks Telegram to confirm before the user closes the app, while `enabled`. */
export function useClosingConfirmation(enabled: boolean): void {
  const wa = useWebApp();
  useEffect(() => {
    if (!wa || !enabled) return;
    wa.enableClosingConfirmation?.();
    return () => {
      wa.disableClosingConfirmation?.();
    };
  }, [wa, enabled]);
}
