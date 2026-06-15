import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  TelegramBiometricError,
  TelegramBiometricManager,
  TelegramLocationData,
  TelegramLocationError,
  TelegramLocationManager,
  TelegramMotionSensor,
  TelegramMotionSensorError,
  TKTelegramAsyncState,
} from "./types";
import { useWebApp } from "./provider";
import { TK_MIN_VERSION, tkSupports } from "./version";

export interface TKKeyboardState {
  /** True while the on-screen keyboard overlaps the layout. */
  visible: boolean;
  /** Height covered by the keyboard, px (0 when hidden). */
  height: number;
}

/**
 * Keyboard-aware layout hook driven by `visualViewport` (M6.5): returns the
 * overlap height so inputs can stay above the keyboard. SSR- and
 * plain-browser-safe (reports hidden when `visualViewport` is missing).
 */
export function useKeyboard(threshold = 80): TKKeyboardState {
  const [state, setState] = useState<TKKeyboardState>({ visible: false, height: 0 });
  useEffect(() => {
    const vv = typeof window !== "undefined" ? window.visualViewport : undefined;
    if (!vv) return;
    tkKbConsumers += 1;
    const sync = () => {
      const covered = Math.max(0, window.innerHeight - vv.height - (vv.offsetTop ?? 0));
      const editableFocused = tkIsEditableActive();
      setState((prev) => {
        const open = editableFocused && covered > threshold;
        const next = { visible: open, height: open ? Math.round(covered) : 0 };
        return prev.visible === next.visible && prev.height === next.height ? prev : next;
      });
      // recipe hook: `.tk-kb-open` lets CSS lift bottom bars above the keyboard
      tkSetKeyboardOpenClass(editableFocused && covered > threshold);
    };
    const syncFocus = () => {
      sync();
      window.setTimeout(sync);
    };
    sync();
    vv.addEventListener("resize", sync);
    vv.addEventListener("scroll", sync);
    document.addEventListener("focusin", syncFocus);
    document.addEventListener("focusout", syncFocus);
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("focus", sync);
    return () => {
      vv.removeEventListener("resize", sync);
      vv.removeEventListener("scroll", sync);
      document.removeEventListener("focusin", syncFocus);
      document.removeEventListener("focusout", syncFocus);
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("focus", sync);
      tkKbConsumers -= 1;
      // Clear the global class once the LAST keyboard consumer unmounts, so a
      // screen that navigates away while the keyboard is still up doesn't leave
      // `.tk-kb-open` stuck on and lift the next screen by a phantom keyboard.
      if (tkKbConsumers <= 0) {
        tkKbConsumers = 0;
        tkSetKeyboardOpenClass(false);
      }
    };
  }, [threshold]);
  return state;
}

function tkIsEditableActive(): boolean {
  if (typeof document === "undefined") return false;
  const el = document.activeElement;
  return el instanceof HTMLElement && el.matches("input,textarea,[contenteditable]");
}

// Process-wide because the class is toggled on every `.tk` root; ref-counted so
// concurrent consumers don't fight and the class is cleared only once they have
// all unmounted.
let tkKbConsumers = 0;
function tkSetKeyboardOpenClass(open: boolean): void {
  if (typeof document === "undefined") return;
  document.querySelectorAll(".tk").forEach((el) => el.classList.toggle("tk-kb-open", open));
}

export function useHideKeyboard(): { hide: () => boolean; isSupported: boolean } {
  const wa = useWebApp();
  return useMemo(
    () => ({
      hide: () => {
        if (wa?.hideKeyboard) {
          wa.hideKeyboard();
          return true;
        }
        if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
          return true;
        }
        return false;
      },
      isSupported: !!wa?.hideKeyboard,
    }),
    [wa],
  );
}

export interface TKBiometrics extends TKTelegramAsyncState<TelegramBiometricError> {
  manager: TelegramBiometricManager | undefined;
  init: () => Promise<boolean>;
  requestAccess: (reason?: string) => Promise<boolean>;
  authenticate: (reason?: string) => Promise<{ ok: boolean; token?: string }>;
  updateToken: (token: string) => Promise<boolean>;
  openSettings: () => boolean;
  isSupported: boolean;
}

export function useBiometrics(): TKBiometrics {
  const wa = useWebApp();
  const manager = wa?.BiometricManager;
  const [state, setState] = useState<TKTelegramAsyncState<TelegramBiometricError>>({ status: "idle" });
  const isSupported = !!manager && tkSupports(wa, TK_MIN_VERSION.biometric);
  return useMemo(
    () => ({
      manager,
      init: () => {
        setState({ status: "pending" });
        return new Promise<boolean>((resolve) => {
          if (!isSupported || !manager?.init) {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve(false);
            return;
          }
          try {
            manager.init(() => {
              setState({ status: "success" });
              resolve(true);
            });
          } catch {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve(false);
          }
        });
      },
      requestAccess: (reason) => {
        setState({ status: "pending" });
        return new Promise<boolean>((resolve) => {
          if (!isSupported || !manager?.requestAccess) {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve(false);
            return;
          }
          try {
            manager.requestAccess(reason ? { reason } : undefined, (ok) => {
              setState(ok ? { status: "success" } : { status: "error", error: "ACCESS_DENIED" });
              resolve(!!ok);
            });
          } catch {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve(false);
          }
        });
      },
      authenticate: (reason) => {
        setState({ status: "pending" });
        return new Promise<{ ok: boolean; token?: string }>((resolve) => {
          if (!isSupported || !manager?.authenticate) {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve({ ok: false });
            return;
          }
          try {
            manager.authenticate(reason ? { reason } : undefined, (ok, token) => {
              setState(ok ? { status: "success" } : { status: "error", error: "AUTH_FAILED" });
              resolve({ ok: !!ok, token });
            });
          } catch {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve({ ok: false });
          }
        });
      },
      updateToken: (token) => {
        setState({ status: "pending" });
        return new Promise<boolean>((resolve) => {
          if (!isSupported || !manager?.updateBiometricToken) {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve(false);
            return;
          }
          try {
            manager.updateBiometricToken(token, (ok) => {
              setState(ok ? { status: "success" } : { status: "error", error: "TOKEN_UPDATE_FAILED" });
              resolve(!!ok);
            });
          } catch {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve(false);
          }
        });
      },
      openSettings: () => {
        if (!isSupported || !manager?.openSettings) {
          setState({ status: "error", error: "UNSUPPORTED" });
          return false;
        }
        try {
          manager.openSettings();
          return true;
        } catch {
          setState({ status: "error", error: "UNSUPPORTED" });
          return false;
        }
      },
      status: isSupported ? state.status : "unsupported",
      error: isSupported ? state.error : "UNSUPPORTED",
      isSupported,
    }),
    [isSupported, manager, state.error, state.status],
  );
}

export interface TKLocation extends TKTelegramAsyncState<TelegramLocationError> {
  manager: TelegramLocationManager | undefined;
  init: () => Promise<boolean>;
  getLocation: () => Promise<TelegramLocationData | null>;
  openSettings: () => boolean;
  isSupported: boolean;
}

export function useLocation(): TKLocation {
  const wa = useWebApp();
  const manager = wa?.LocationManager;
  const [state, setState] = useState<TKTelegramAsyncState<TelegramLocationError>>({ status: "idle" });
  const isSupported = !!manager && tkSupports(wa, TK_MIN_VERSION.location);
  return useMemo(
    () => ({
      manager,
      init: () => {
        setState({ status: "pending" });
        return new Promise<boolean>((resolve) => {
          if (!isSupported || !manager?.init) {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve(false);
            return;
          }
          try {
            manager.init(() => {
              setState({ status: "success" });
              resolve(true);
            });
          } catch {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve(false);
          }
        });
      },
      getLocation: () => {
        setState({ status: "pending" });
        return new Promise<TelegramLocationData | null>((resolve) => {
          if (!isSupported || !manager?.getLocation) {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve(null);
            return;
          }
          try {
            manager.getLocation((locationData) => {
              setState(locationData ? { status: "success" } : { status: "error", error: "LOCATION_UNAVAILABLE" });
              resolve(locationData ?? null);
            });
          } catch {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve(null);
          }
        });
      },
      openSettings: () => {
        if (!isSupported || !manager?.openSettings) {
          setState({ status: "error", error: "UNSUPPORTED" });
          return false;
        }
        try {
          manager.openSettings();
          return true;
        } catch {
          setState({ status: "error", error: "UNSUPPORTED" });
          return false;
        }
      },
      status: isSupported ? state.status : "unsupported",
      error: isSupported ? state.error : "UNSUPPORTED",
      isSupported,
    }),
    [isSupported, manager, state.error, state.status],
  );
}

interface TKMotionSensorApi<S extends TelegramMotionSensor = TelegramMotionSensor>
  extends TKTelegramAsyncState<TelegramMotionSensorError> {
  sensor: S | undefined;
  /** `needAbsolute` maps to `need_absolute` and is honoured by `DeviceOrientation` only. */
  start: (refreshRate?: number, options?: { needAbsolute?: boolean }) => Promise<boolean>;
  stop: () => Promise<boolean>;
  isSupported: boolean;
}

function sensorApi<S extends TelegramMotionSensor>(
  sensor: S | undefined,
  state: TKTelegramAsyncState<TelegramMotionSensorError>,
  setState: (state: TKTelegramAsyncState<TelegramMotionSensorError>) => void,
  supported: boolean,
): TKMotionSensorApi<S> {
  const isSupported = !!sensor && supported;
  return {
    sensor,
    start: (refreshRate?: number, options?: { needAbsolute?: boolean }) => {
      setState({ status: "pending" });
      return new Promise<boolean>((resolve) => {
        if (!isSupported || !sensor?.start) {
          setState({ status: "error", error: "UNSUPPORTED" });
          resolve(false);
          return;
        }
        const params: { refresh_rate?: number; need_absolute?: boolean } = {};
        if (refreshRate) params.refresh_rate = refreshRate;
        if (options?.needAbsolute != null) params.need_absolute = options.needAbsolute;
        try {
          sensor.start(Object.keys(params).length > 0 ? params : undefined, (ok) => {
            setState(ok ? { status: "success" } : { status: "error", error: "START_FAILED" });
            resolve(!!ok);
          });
        } catch {
          setState({ status: "error", error: "UNSUPPORTED" });
          resolve(false);
        }
      });
    },
    stop: () => {
      setState({ status: "pending" });
      return new Promise<boolean>((resolve) => {
        if (!isSupported || !sensor?.stop) {
          setState({ status: "error", error: "UNSUPPORTED" });
          resolve(false);
          return;
        }
        try {
          sensor.stop((ok) => {
            setState(ok ? { status: "success" } : { status: "error", error: "STOP_FAILED" });
            resolve(!!ok);
          });
        } catch {
          setState({ status: "error", error: "UNSUPPORTED" });
          resolve(false);
        }
      });
    },
    status: isSupported ? state.status : "unsupported",
    error: isSupported ? state.error : "UNSUPPORTED",
    isSupported,
  };
}

type TKSensorKey = "accelerometer" | "deviceOrientation" | "gyroscope";
type TKSensorStates = Record<TKSensorKey, TKTelegramAsyncState<TelegramMotionSensorError>>;

export function useMotionSensors() {
  const wa = useWebApp();
  // One status PER sensor — a single shared state made starting/erroring one
  // sensor overwrite the others' status (any per-sensor spinner/badge lied).
  const [states, setStates] = useState<TKSensorStates>(() => ({
    accelerometer: { status: "idle" },
    deviceOrientation: { status: "idle" },
    gyroscope: { status: "idle" },
  }));
  // All three sensors are Bot API 8.0; gate on version, not method presence.
  const supported = tkSupports(wa, TK_MIN_VERSION.sensors);
  useEffect(() => {
    return () => {
      try {
        wa?.Accelerometer?.stop?.();
        wa?.DeviceOrientation?.stop?.();
        wa?.Gyroscope?.stop?.();
      } catch {
        /* sensors not available on this client version */
      }
    };
  }, [wa]);
  const setAccelerometer = useCallback(
    (s: TKTelegramAsyncState<TelegramMotionSensorError>) => setStates((p) => ({ ...p, accelerometer: s })),
    [],
  );
  const setDeviceOrientation = useCallback(
    (s: TKTelegramAsyncState<TelegramMotionSensorError>) => setStates((p) => ({ ...p, deviceOrientation: s })),
    [],
  );
  const setGyroscope = useCallback(
    (s: TKTelegramAsyncState<TelegramMotionSensorError>) => setStates((p) => ({ ...p, gyroscope: s })),
    [],
  );
  return useMemo(
    () => ({
      accelerometer: sensorApi(wa?.Accelerometer, states.accelerometer, setAccelerometer, supported),
      deviceOrientation: sensorApi(wa?.DeviceOrientation, states.deviceOrientation, setDeviceOrientation, supported),
      gyroscope: sensorApi(wa?.Gyroscope, states.gyroscope, setGyroscope, supported),
    }),
    [states, supported, wa, setAccelerometer, setDeviceOrientation, setGyroscope],
  );
}

export function useVerticalSwipes(): {
  /** Mirrors `WebApp.isVerticalSwipesEnabled` (swipes are enabled by default). */
  isEnabled: boolean;
  enable: () => boolean;
  disable: () => boolean;
  isSupported: boolean;
} {
  const wa = useWebApp();
  const [isEnabled, setIsEnabled] = useState(() => wa?.isVerticalSwipesEnabled ?? true);
  useEffect(() => setIsEnabled(wa?.isVerticalSwipesEnabled ?? true), [wa]);
  return useMemo(
    () => ({
      isEnabled,
      enable: () => {
        if (!wa?.enableVerticalSwipes) return false;
        wa.enableVerticalSwipes();
        setIsEnabled(wa.isVerticalSwipesEnabled ?? true);
        return true;
      },
      disable: () => {
        if (!wa?.disableVerticalSwipes) return false;
        wa.disableVerticalSwipes();
        setIsEnabled(wa.isVerticalSwipesEnabled ?? false);
        return true;
      },
      isSupported: !!(wa?.enableVerticalSwipes || wa?.disableVerticalSwipes),
    }),
    [isEnabled, wa],
  );
}

export function useOrientationLock(): {
  /** Mirrors `WebApp.isOrientationLocked`. */
  isLocked: boolean;
  lock: () => boolean;
  unlock: () => boolean;
  isSupported: boolean;
} {
  const wa = useWebApp();
  const [isLocked, setIsLocked] = useState(() => wa?.isOrientationLocked ?? false);
  useEffect(() => setIsLocked(wa?.isOrientationLocked ?? false), [wa]);
  return useMemo(
    () => ({
      isLocked,
      lock: () => {
        if (!wa?.lockOrientation) return false;
        wa.lockOrientation();
        setIsLocked(wa.isOrientationLocked ?? true);
        return true;
      },
      unlock: () => {
        if (!wa?.unlockOrientation) return false;
        wa.unlockOrientation();
        setIsLocked(wa.isOrientationLocked ?? false);
        return true;
      },
      isSupported: !!(wa?.lockOrientation || wa?.unlockOrientation),
    }),
    [isLocked, wa],
  );
}
