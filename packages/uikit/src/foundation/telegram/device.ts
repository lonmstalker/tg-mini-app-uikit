import { useEffect, useMemo, useState } from "react";
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
    const sync = () => {
      const covered = Math.max(0, window.innerHeight - vv.height - (vv.offsetTop ?? 0));
      setState((prev) => {
        const next = { visible: covered > threshold, height: covered > threshold ? Math.round(covered) : 0 };
        return prev.visible === next.visible && prev.height === next.height ? prev : next;
      });
      // recipe hook: `.tk-kb-open` lets CSS lift bottom bars above the keyboard
      document.querySelectorAll(".tk").forEach((el) => el.classList.toggle("tk-kb-open", covered > threshold));
    };
    sync();
    vv.addEventListener("resize", sync);
    vv.addEventListener("scroll", sync);
    return () => {
      vv.removeEventListener("resize", sync);
      vv.removeEventListener("scroll", sync);
    };
  }, [threshold]);
  return state;
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
  const isSupported = !!manager;
  return useMemo(
    () => ({
      manager,
      init: () => {
        setState({ status: "pending" });
        return new Promise<boolean>((resolve) => {
          if (!manager?.init) {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve(false);
            return;
          }
          manager.init(() => {
            setState({ status: "success" });
            resolve(true);
          });
        });
      },
      requestAccess: (reason) => {
        setState({ status: "pending" });
        return new Promise<boolean>((resolve) => {
          if (!manager?.requestAccess) {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve(false);
            return;
          }
          manager.requestAccess(reason ? { reason } : undefined, (ok) => {
            setState(ok ? { status: "success" } : { status: "error", error: "ACCESS_DENIED" });
            resolve(!!ok);
          });
        });
      },
      authenticate: (reason) => {
        setState({ status: "pending" });
        return new Promise<{ ok: boolean; token?: string }>((resolve) => {
          if (!manager?.authenticate) {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve({ ok: false });
            return;
          }
          manager.authenticate(reason ? { reason } : undefined, (ok, token) => {
            setState(ok ? { status: "success" } : { status: "error", error: "AUTH_FAILED" });
            resolve({ ok: !!ok, token });
          });
        });
      },
      updateToken: (token) => {
        setState({ status: "pending" });
        return new Promise<boolean>((resolve) => {
          if (!manager?.updateBiometricToken) {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve(false);
            return;
          }
          manager.updateBiometricToken(token, (ok) => {
            setState(ok ? { status: "success" } : { status: "error", error: "TOKEN_UPDATE_FAILED" });
            resolve(!!ok);
          });
        });
      },
      openSettings: () => {
        if (!manager?.openSettings) {
          setState({ status: "error", error: "UNSUPPORTED" });
          return false;
        }
        manager.openSettings();
        return true;
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
  const isSupported = !!manager;
  return useMemo(
    () => ({
      manager,
      init: () => {
        setState({ status: "pending" });
        return new Promise<boolean>((resolve) => {
          if (!manager?.init) {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve(false);
            return;
          }
          manager.init(() => {
            setState({ status: "success" });
            resolve(true);
          });
        });
      },
      getLocation: () => {
        setState({ status: "pending" });
        return new Promise<TelegramLocationData | null>((resolve) => {
          if (!manager?.getLocation) {
            setState({ status: "error", error: "UNSUPPORTED" });
            resolve(null);
            return;
          }
          manager.getLocation((locationData) => {
            setState(locationData ? { status: "success" } : { status: "error", error: "LOCATION_UNAVAILABLE" });
            resolve(locationData ?? null);
          });
        });
      },
      openSettings: () => {
        if (!manager?.openSettings) {
          setState({ status: "error", error: "UNSUPPORTED" });
          return false;
        }
        manager.openSettings();
        return true;
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
): TKMotionSensorApi<S> {
  const isSupported = !!sensor;
  return {
    sensor,
    start: (refreshRate?: number, options?: { needAbsolute?: boolean }) => {
      setState({ status: "pending" });
      return new Promise<boolean>((resolve) => {
        if (!sensor?.start) {
          setState({ status: "error", error: "UNSUPPORTED" });
          resolve(false);
          return;
        }
        const params: { refresh_rate?: number; need_absolute?: boolean } = {};
        if (refreshRate) params.refresh_rate = refreshRate;
        if (options?.needAbsolute != null) params.need_absolute = options.needAbsolute;
        sensor.start(Object.keys(params).length > 0 ? params : undefined, (ok) => {
          setState(ok ? { status: "success" } : { status: "error", error: "START_FAILED" });
          resolve(!!ok);
        });
      });
    },
    stop: () => {
      setState({ status: "pending" });
      return new Promise<boolean>((resolve) => {
        if (!sensor?.stop) {
          setState({ status: "error", error: "UNSUPPORTED" });
          resolve(false);
          return;
        }
        sensor.stop((ok) => {
          setState(ok ? { status: "success" } : { status: "error", error: "STOP_FAILED" });
          resolve(!!ok);
        });
      });
    },
    status: isSupported ? state.status : "unsupported",
    error: isSupported ? state.error : "UNSUPPORTED",
    isSupported,
  };
}

export function useMotionSensors() {
  const wa = useWebApp();
  const [state, setState] = useState<TKTelegramAsyncState<TelegramMotionSensorError>>({ status: "idle" });
  useEffect(() => {
    return () => {
      wa?.Accelerometer?.stop?.();
      wa?.DeviceOrientation?.stop?.();
      wa?.Gyroscope?.stop?.();
    };
  }, [wa]);
  return useMemo(
    () => ({
      accelerometer: sensorApi(wa?.Accelerometer, state, setState),
      deviceOrientation: sensorApi(wa?.DeviceOrientation, state, setState),
      gyroscope: sensorApi(wa?.Gyroscope, state, setState),
    }),
    [state, wa],
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
