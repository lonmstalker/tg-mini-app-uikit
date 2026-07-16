import type { useCloudStorage } from "@tg-mini-app/telegram";
import type { Booking } from "../data/mockApi";
import type { PersistedState, StreakState, ThemePrefs, WalletState } from "./reducer";

/*
 * The kit's storage hooks all return the same promisified store, but the kit
 * does not (yet) re-export the `TKCloudStorage` interface by name, so we derive
 * it from the hook's return type. (Tracked kit-API gap; see goals.log G1.M1.)
 */
type TKCloudStorage = ReturnType<typeof useCloudStorage>;

/*
 * Mirrors the store to the matching Telegram storage backend and rehydrates on
 * startup, so closing and reopening the Mini App restores bookings, streak,
 * wallet, theme and the onboarding flag. Behind the injected mock these calls go
 * to the mock's CloudStorage/DeviceStorage/SecureStorage (which the mock backs
 * with the browser's localStorage); inside a real client they hit the real
 * Telegram storage. Outside Telegram with no mock, the kit's hooks fall back to
 * localStorage. Net: the same persistence pattern in every environment.
 *
 *  - CloudStorage  → bookings, streak, wallet, onboarding (syncs across devices)
 *  - DeviceStorage → themePrefs (device-local look & feel)
 *  - SecureStorage → pin (a secret, never in cloud)
 */

export interface StorageBackends {
  cloud: TKCloudStorage;
  device: TKCloudStorage;
  secure: TKCloudStorage;
}

export const STORAGE_KEYS = {
  bookings: "th_bookings",
  streak: "th_streak",
  wallet: "th_wallet",
  onboarding: "th_onboarding",
  themePrefs: "th_theme",
  pin: "th_pin",
} as const;

const eq = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

async function readJSON<T>(store: TKCloudStorage, key: string): Promise<T | undefined> {
  try {
    const raw = await store.get(key);
    if (raw == null) return undefined;
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

/** Loads every persisted slice; missing/corrupt entries are simply omitted. */
export async function loadPersisted({ cloud, device, secure }: StorageBackends): Promise<Partial<PersistedState>> {
  const [bookings, streak, wallet, onboardingDone, themePrefs, pinRaw] = await Promise.all([
    readJSON<Booking[]>(cloud, STORAGE_KEYS.bookings),
    readJSON<StreakState>(cloud, STORAGE_KEYS.streak),
    readJSON<WalletState>(cloud, STORAGE_KEYS.wallet),
    readJSON<boolean>(cloud, STORAGE_KEYS.onboarding),
    readJSON<ThemePrefs>(device, STORAGE_KEYS.themePrefs),
    secure
      .get(STORAGE_KEYS.pin)
      .then((v) => v ?? undefined)
      .catch(() => undefined),
  ]);

  const out: Partial<PersistedState> = {};
  if (Array.isArray(bookings)) out.bookings = bookings;
  if (streak) out.streak = streak;
  if (wallet) out.wallet = wallet;
  if (typeof onboardingDone === "boolean") out.onboardingDone = onboardingDone;
  if (themePrefs) out.themePrefs = themePrefs;
  if (pinRaw !== undefined) out.pin = pinRaw;
  return out;
}

/**
 * Writes only the slices that changed between `prev` and `next`. On the first
 * call after hydration `prev` is null, so every slice is written once — this is
 * intentional: it flushes the seed state (e.g. the seed booking) to storage so a
 * brand-new session survives a reload too.
 */
export async function savePersisted(
  prev: PersistedState | null,
  next: PersistedState,
  { cloud, device, secure }: StorageBackends,
): Promise<void> {
  const ops: Promise<unknown>[] = [];
  const swallow = (p: Promise<unknown>) => ops.push(p.catch(() => {}));

  if (!prev || !eq(prev.bookings, next.bookings)) swallow(cloud.set(STORAGE_KEYS.bookings, JSON.stringify(next.bookings)));
  if (!prev || !eq(prev.streak, next.streak)) swallow(cloud.set(STORAGE_KEYS.streak, JSON.stringify(next.streak)));
  if (!prev || !eq(prev.wallet, next.wallet)) swallow(cloud.set(STORAGE_KEYS.wallet, JSON.stringify(next.wallet)));
  if (!prev || prev.onboardingDone !== next.onboardingDone)
    swallow(cloud.set(STORAGE_KEYS.onboarding, JSON.stringify(next.onboardingDone)));
  if (!prev || !eq(prev.themePrefs, next.themePrefs))
    swallow(device.set(STORAGE_KEYS.themePrefs, JSON.stringify(next.themePrefs)));
  if (!prev || prev.pin !== next.pin) {
    swallow(next.pin == null ? secure.remove(STORAGE_KEYS.pin) : secure.set(STORAGE_KEYS.pin, next.pin));
  }

  await Promise.all(ops);
}
