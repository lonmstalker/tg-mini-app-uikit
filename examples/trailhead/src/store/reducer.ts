import type { TKMotion } from "tg-mini-app-uikit";
import type { Lang } from "../i18n";
import { seedBookings, type Booking, type BookingStatus } from "../data/mockApi";

/*
 * The app store: a plain reducer over the slices the milestones read and write.
 * It lives ABOVE every nav stack (see store/index.tsx), so a back-swipe inside
 * the booking funnel never discards the in-progress cart or the streak.
 */

/** The in-progress booking, assembled across the push funnel before payment. */
export interface CartDraft {
  experienceId?: string;
  experienceTitle?: string;
  location?: string;
  date?: string; // ISO YYYY-MM-DD
  slot?: string;
  basePriceStars?: number;
  emoji?: string;
  hue?: number;
}

/** Live theme + locale prefs, all driven by Platform Lab (M4) and persisted. */
export interface ThemePrefs {
  accent: string;
  roundness: number;
  motion: TKMotion;
  fontSize: number;
  lang: Lang;
  /** In-app appearance override; drives the kit theme in mock AND real clients. */
  colorScheme: "light" | "dark";
}

export interface WalletState {
  connected: boolean;
  address: string | null;
  trailPassActive: boolean;
}

export interface StreakState {
  xp: number;
  /** 1 = Mon … 7 = Sun. */
  dayOfWeek: number;
}

export interface AppState {
  /** False until the persisted slices have been loaded from Telegram storage. */
  hydrated: boolean;
  bookings: Booking[];
  cart: CartDraft;
  streak: StreakState;
  wallet: WalletState;
  themePrefs: ThemePrefs;
  /** Secret PIN, mirrored to SecureStorage. Null until the user sets one. */
  pin: string | null;
  onboardingDone: boolean;
}

export const DEFAULT_THEME_PREFS: ThemePrefs = {
  // AA-compliant accent: white-on-accent and accent-on-white both clear 4.5:1
  // (the Telegram default #3390ec is only 3.3:1, which fails axe color-contrast).
  accent: "#1c6fd3",
  roundness: 1,
  motion: "springy",
  fontSize: 16,
  lang: "en",
  colorScheme: "light",
};

/**
 * A fresh session: seeded booking, day-5 streak, wallet disconnected. The
 * appearance is seeded from the surrounding client's theme so a real Mini App
 * opens matching light/dark; hydration then restores any persisted override.
 */
export function createInitialState(initialLang: Lang = "en", colorScheme: "light" | "dark" = "light"): AppState {
  return {
    hydrated: false,
    bookings: seedBookings(),
    cart: {},
    streak: { xp: 1840, dayOfWeek: 5 },
    wallet: { connected: false, address: null, trailPassActive: false },
    themePrefs: { ...DEFAULT_THEME_PREFS, lang: initialLang, colorScheme },
    pin: null,
    onboardingDone: false,
  };
}

/** The slices mirrored to Telegram storage (everything but transient `cart`/`hydrated`). */
export interface PersistedState {
  bookings: Booking[];
  streak: StreakState;
  wallet: WalletState;
  themePrefs: ThemePrefs;
  pin: string | null;
  onboardingDone: boolean;
}

export type Action =
  | { type: "HYDRATE"; payload: Partial<PersistedState> }
  | { type: "SET_CART"; payload: Partial<CartDraft> }
  | { type: "RESET_CART" }
  | { type: "ADD_BOOKING"; payload: Booking }
  | { type: "UPDATE_BOOKING"; id: string; payload: Partial<Booking> }
  | { type: "SET_BOOKING_STATUS"; id: string; status: BookingStatus }
  | { type: "REMOVE_BOOKING"; id: string }
  | { type: "ADD_XP"; amount: number }
  | { type: "SET_WALLET"; payload: Partial<WalletState> }
  | { type: "SET_THEME_PREF"; payload: Partial<ThemePrefs> }
  | { type: "SET_PIN"; pin: string | null }
  | { type: "COMPLETE_ONBOARDING" }
  | { type: "RESET_ONBOARDING" };

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "HYDRATE":
      return {
        ...state,
        ...action.payload,
        // never let persisted data clobber the runtime-only flags
        hydrated: true,
        cart: state.cart,
        themePrefs: { ...state.themePrefs, ...action.payload.themePrefs },
      };
    case "SET_CART":
      return { ...state, cart: { ...state.cart, ...action.payload } };
    case "RESET_CART":
      return { ...state, cart: {} };
    case "ADD_BOOKING":
      // de-dupe by id so a double-submit cannot create twins
      return state.bookings.some((b) => b.id === action.payload.id)
        ? state
        : { ...state, bookings: [action.payload, ...state.bookings] };
    case "UPDATE_BOOKING":
      return {
        ...state,
        bookings: state.bookings.map((b) => (b.id === action.id ? { ...b, ...action.payload } : b)),
      };
    case "SET_BOOKING_STATUS":
      return {
        ...state,
        bookings: state.bookings.map((b) => (b.id === action.id ? { ...b, status: action.status } : b)),
      };
    case "REMOVE_BOOKING":
      return { ...state, bookings: state.bookings.filter((b) => b.id !== action.id) };
    case "ADD_XP":
      return { ...state, streak: { ...state.streak, xp: state.streak.xp + action.amount } };
    case "SET_WALLET":
      return { ...state, wallet: { ...state.wallet, ...action.payload } };
    case "SET_THEME_PREF":
      return { ...state, themePrefs: { ...state.themePrefs, ...action.payload } };
    case "SET_PIN":
      return { ...state, pin: action.pin };
    case "COMPLETE_ONBOARDING":
      return { ...state, onboardingDone: true };
    case "RESET_ONBOARDING":
      return { ...state, onboardingDone: false };
    default:
      return state;
  }
}

/** Projects the persisted slices out of the full state. */
export function toPersisted(state: AppState): PersistedState {
  return {
    bookings: state.bookings,
    streak: state.streak,
    wallet: state.wallet,
    themePrefs: state.themePrefs,
    pin: state.pin,
    onboardingDone: state.onboardingDone,
  };
}
