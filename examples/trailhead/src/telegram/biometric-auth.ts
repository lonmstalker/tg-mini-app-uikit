import type { TKBiometrics } from "tg-mini-app-uikit";

export async function authenticateWithBiometrics(biometrics: TKBiometrics, reason: string): Promise<boolean> {
  const manager = biometrics.manager;
  if (!biometrics.isSupported || !manager) return false;

  if (!manager.isInited) {
    const inited = await biometrics.init();
    if (!inited) return false;
  }
  if (manager.isBiometricAvailable === false) return false;
  if (!manager.isAccessGranted) {
    const granted = await biometrics.requestAccess(reason);
    if (!granted) return false;
  }

  const result = await biometrics.authenticate(reason);
  return result.ok;
}
