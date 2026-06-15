import { useEffect, useMemo } from "react";
import type { TelegramInitDataUnsafe, TelegramUser } from "./types";
import { useWebApp } from "./provider";
import { TK_MIN_VERSION, tkSupports } from "./version";

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

/* Telegram CloudStorage limits: key shape and value length. The value cap is
   4096 CHARACTERS, not bytes — measuring bytes silently rejected multi-byte
   text (e.g. ~2049 Cyrillic chars) that Telegram would have accepted. */
const KEY_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;
const MAX_VALUE_CHARS = 4096;

/** Length in code points (astral chars count once), matching how Telegram
 *  measures a stored value's character length. */
function charLength(value: string): number {
  return [...value].length;
}

/** Throws a clear `Error` when `key`/`value` fall outside the CloudStorage limits. */
function assertValidEntry(key: string, value?: string): void {
  if (!KEY_PATTERN.test(key)) {
    throw new Error(`Invalid storage key "${key}": expected /^[A-Za-z0-9_-]{1,128}$/.`);
  }
  if (value != null && charLength(value) > MAX_VALUE_CHARS) {
    throw new Error(`Storage value for "${key}" exceeds ${MAX_VALUE_CHARS} characters.`);
  }
}

/**
 * `supported` should fold in version gating (CloudStorage needs Bot API 6.9);
 * when false we fall back to localStorage even if the methods are present, so
 * an old client never throws on an unsupported call. Defaults to true for
 * DeviceStorage/SecureStorage, which are gated by method presence only.
 */
export function createStorageApi(
  storageApi: TelegramStorageApi | undefined,
  localPrefix: string,
  supported: boolean = true,
): TKCloudStorage {
  if (supported && storageApi?.getItem && storageApi.setItem) {
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
        new Promise<void>((resolve, reject) => {
          try {
            assertValidEntry(key, value);
          } catch (err) {
            reject(err);
            return;
          }
          storageApi.setItem!(key, value, (err) => (err ? reject(err) : resolve()));
        }),
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
      // Validate first so the same input rejects in both environments.
      assertValidEntry(key, value);
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
 * CloudStorage needs Bot API 6.9; older clients fall back to localStorage.
 */
export function useCloudStorage(): TKCloudStorage {
  const wa = useWebApp();
  return useMemo(
    () => createStorageApi(wa?.CloudStorage, LOCAL_PREFIX, tkSupports(wa, TK_MIN_VERSION.cloudStorage)),
    [wa],
  );
}

/* ---------------- Init data & misc ---------------- */

export interface TKInitData {
  /** Raw query string — the only thing your backend should trust (after validating the hash). */
  raw: string | undefined;
  /**
   * Convenience copy of `initDataUnsafe.user`. UNVERIFIED — display only.
   * Never use it for client-side security, authorization, or trust decisions:
   * a malicious client can forge it. Send `raw` to your server and authorize
   * off the user it recovers after validating the initData hash.
   */
  user: TelegramUser | undefined;
  startParam: string | undefined;
  /**
   * Parsed but UNVERIFIED launch parameters. Same warning as `user`: never
   * gate access or trust any field here on the client — validate `raw`
   * server-side via its hash first.
   */
  unsafe: TelegramInitDataUnsafe | undefined;
}

/**
 * Launch parameters of the mini app (user, start_param).
 *
 * Display-only. `user`/`unsafe` are UNVERIFIED and trivially forgeable by a
 * hostile client — do NOT use them for client-side security or authorization.
 * The server must validate the raw `initData` via its hash and derive identity
 * from that, never from these convenience fields.
 */
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
