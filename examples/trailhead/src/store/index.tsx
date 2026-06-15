import {
  createContext,
  use,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type Dispatch,
  type ReactNode,
} from "react";
import { useCloudStorage, useDeviceStorage, useInitData, useSecureStorage, useTelegramTheme } from "tg-mini-app-uikit";
import { initialLangFor, type Lang } from "../i18n";
import { loadPersisted, savePersisted, type StorageBackends } from "./persistence";
import { createInitialState, reducer, toPersisted, type Action, type AppState } from "./reducer";

function langQueryOverride(): Lang | null {
  if (typeof window === "undefined") return null;
  const q = new URLSearchParams(window.location.search).get("lang");
  return q === "ru" || q === "en" ? q : null;
}

export * from "./reducer";

interface StoreValue {
  state: AppState;
  dispatch: Dispatch<Action>;
}

const StoreContext = createContext<StoreValue | null>(null);

/**
 * Holds the whole app store above every nav stack and mirrors it to Telegram
 * storage. Hydrates once on mount (so close/reopen restores state) and writes
 * back only the slices that change.
 */
export function StoreProvider({ children }: { children?: ReactNode }) {
  const cloud = useCloudStorage();
  const device = useDeviceStorage();
  const secure = useSecureStorage();
  const { user } = useInitData();
  // Read the client's light/dark once for the seed (synchronous in a real client).
  const clientTheme = useTelegramTheme();
  // Seed the initial language from the ?lang deep-link or the Telegram client,
  // and the appearance from the client's current theme.
  const [state, dispatch] = useReducer(reducer, undefined, () =>
    createInitialState(initialLangFor(user?.language_code), clientTheme),
  );

  const backends = useMemo<StorageBackends>(() => ({ cloud, device, secure }), [cloud, device, secure]);
  const lastPersisted = useRef<ReturnType<typeof toPersisted> | null>(null);

  // Hydrate once: load persisted slices and merge them over the seed state. A
  // ?lang deep-link overrides any persisted language (used by the e2e suite).
  useEffect(() => {
    let alive = true;
    loadPersisted(backends).then((payload) => {
      if (!alive) return;
      const override = langQueryOverride();
      const merged =
        override && payload.themePrefs
          ? { ...payload, themePrefs: { ...payload.themePrefs, lang: override } }
          : payload;
      dispatch({ type: "HYDRATE", payload: merged });
    });
    return () => {
      alive = false;
    };
  }, [backends]);

  // Persist after hydration; `savePersisted` writes only the changed slices.
  useEffect(() => {
    if (!state.hydrated) return;
    const next = toPersisted(state);
    void savePersisted(lastPersisted.current, next, backends);
    lastPersisted.current = next;
  }, [state, backends]);

  const value = useMemo<StoreValue>(() => ({ state, dispatch }), [state]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

function useStoreContext(): StoreValue {
  const ctx = use(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}

/** The whole store: `{ state, dispatch }`. */
export function useStore(): StoreValue {
  return useStoreContext();
}

/** Just the state (re-renders on any change). */
export function useAppState(): AppState {
  return useStoreContext().state;
}

/** Just the dispatch (stable). */
export function useAppDispatch(): Dispatch<Action> {
  return useStoreContext().dispatch;
}
