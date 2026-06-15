import type { TelegramBiometricManager } from "../types";

interface BiometricsContext {
  log: (text: string) => void;
  dispatch: (event: string, payload?: unknown, quiet?: boolean) => void;
}

export function makeBiometricManager(ctx: BiometricsContext): TelegramBiometricManager {
  const biometricManager: TelegramBiometricManager = {
    isInited: true,
    isBiometricAvailable: true,
    biometricType: "face",
    isAccessRequested: true,
    isAccessGranted: true,
    isBiometricTokenSaved: false,
    deviceId: "demo-device-01",
    init: (cb) => {
      ctx.log("BiometricManager.init()");
      ctx.dispatch("biometricManagerUpdated");
      cb?.();
    },
    requestAccess: (_params, cb) => {
      ctx.log("BiometricManager.requestAccess()");
      cb?.(true);
    },
    authenticate: (_params, cb) => {
      ctx.log("BiometricManager.authenticate()");
      ctx.dispatch("biometricAuthRequested", { isAuthenticated: true, biometricToken: "demo-token" });
      cb?.(true, "demo-token");
    },
    updateBiometricToken: (token, cb) => {
      ctx.log("BiometricManager.updateBiometricToken()");
      biometricManager.isBiometricTokenSaved = !!token;
      ctx.dispatch("biometricTokenUpdated", { isUpdated: true });
      cb?.(true);
    },
    openSettings: () => ctx.log("BiometricManager.openSettings()"),
  };
  return biometricManager;
}
