import { useEffect } from "react";
import type { TKBiometrics } from "@tg-mini-app/telegram";
import { useTKToast } from "tg-mini-app-uikit";
import { useT } from "../i18n";

export type BiometricAuthStatus = "ok" | "unavailable" | "denied" | "failed";

async function authenticateWithBiometrics(biometrics: TKBiometrics, reason: string): Promise<BiometricAuthStatus> {
  const manager = biometrics.manager;
  if (!biometrics.isSupported || !manager) return "unavailable";

  if (!manager.isInited) {
    const inited = await biometrics.init();
    if (!inited) return "unavailable";
  }
  if (manager.isBiometricAvailable === false) return "unavailable";
  if (!manager.isAccessGranted) {
    const granted = await biometrics.requestAccess(reason);
    if (!granted) return "denied";
  }

  const result = await biometrics.authenticate(reason);
  return result.ok ? "ok" : "failed";
}

/**
 * Whether the biometric key should be RENDERED at all. `isSupported` is a
 * trap — the official bridge creates BiometricManager on every platform
 * (desktop included) — so this inits the manager once and gates on the
 * device-level `isAvailable`. Until availability is known the key stays
 * hidden (progressive reveal beats a dead control).
 */
export function useBiometricKeyAvailable(biometrics: TKBiometrics): boolean {
  const { isSupported, manager } = biometrics;
  useEffect(() => {
    if (isSupported && manager && !manager.isInited) void biometrics.init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSupported, manager]);
  return isSupported && biometrics.isAvailable === true;
}

/**
 * Biometric auth with user-visible failure feedback: every non-ok outcome
 * toasts a localized reason (instead of the tap silently doing nothing), and
 * a denied grant also opens Telegram's biometric settings for this app.
 */
export function useBiometricAuth(biometrics: TKBiometrics): (reason: string) => Promise<boolean> {
  const toast = useTKToast();
  const t = useT();
  return async (reason) => {
    const status = await authenticateWithBiometrics(biometrics, reason);
    if (status === "ok") return true;
    toast.error(t(`biometry.${status}`));
    if (status === "denied") biometrics.openSettings();
    return false;
  };
}
