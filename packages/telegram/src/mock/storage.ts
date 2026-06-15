import type {
  TelegramCloudStorage,
  TelegramDeviceStorage,
  TelegramSecureStorage,
} from "../types";
import { SECURE_PREFIX } from "./theme";

interface StorageContext {
  log: (text: string) => void;
  notify: () => void;
}

export function makeStorage(
  prefix: string,
  label: string,
  ctx: StorageContext,
): TelegramCloudStorage & TelegramDeviceStorage {
  return {
    setItem: (key, value, cb) => {
      localStorage.setItem(prefix + key, value);
      ctx.log(`${label}.setItem("${key}")`);
      ctx.notify();
      cb?.(null, true);
    },
    getItem: (key, cb) => {
      ctx.log(`${label}.getItem("${key}")`);
      ctx.notify();
      cb(null, localStorage.getItem(prefix + key));
    },
    getItems: (keys, cb) => {
      ctx.log(`${label}.getItems(${keys.length})`);
      cb(null, Object.fromEntries(keys.map((key) => [key, localStorage.getItem(prefix + key)])));
    },
    removeItem: (key, cb) => {
      localStorage.removeItem(prefix + key);
      ctx.log(`${label}.removeItem("${key}")`);
      ctx.notify();
      cb?.(null, true);
    },
    removeItems: (keys, cb) => {
      keys.forEach((key) => localStorage.removeItem(prefix + key));
      ctx.log(`${label}.removeItems(${keys.length})`);
      ctx.notify();
      cb?.(null, true);
    },
    getKeys: (cb) => {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k?.startsWith(prefix)) keys.push(k.slice(prefix.length));
      }
      cb(null, keys);
    },
    clear: (cb) => {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k?.startsWith(prefix)) keys.push(k);
      }
      keys.forEach((key) => localStorage.removeItem(key));
      ctx.log(`${label}.clear()`);
      ctx.notify();
      cb?.(null, true);
    },
  };
}

export function makeSecureStorage(ctx: StorageContext): TelegramSecureStorage {
  return {
    ...makeStorage(SECURE_PREFIX, "SecureStorage", ctx),
    restoreItem: (key, cb) => {
      ctx.log(`SecureStorage.restoreItem("${key}")`);
      cb?.(null, localStorage.getItem(SECURE_PREFIX + key));
    },
  };
}
