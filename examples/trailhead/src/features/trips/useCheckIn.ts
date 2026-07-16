import { useRef, useState } from "react";
import { useBiometrics, useLocation, useOptionalHaptics, useOrientationLock, useQrScanner } from "@tg-mini-app/telegram";
import { useT } from "../../i18n";
import { useAppDispatch } from "../../store";

export type CheckInPhase = "idle" | "scanning" | "verifying" | "locating" | "done" | "error";

/** XP awarded for completing a trail check-in — feeds the Train dashboard + leaderboard. */
export const CHECKIN_XP = 120;

/**
 * The signature device chain: scan the trailhead QR, verify with biometrics,
 * confirm the location, then flip the booking to "checked in" (persisted by the
 * store). A synchronous latch blocks a double run. In the demo's mock mode each
 * device step resolves to a scripted success; inside Telegram they call the real
 * QR/biometric/location bridges.
 */
export function useCheckIn() {
  const t = useT();
  const qr = useQrScanner();
  const biometrics = useBiometrics();
  const location = useLocation();
  const orientation = useOrientationLock();
  const dispatch = useAppDispatch();
  const haptics = useOptionalHaptics();
  const [phase, setPhase] = useState<CheckInPhase>("idle");
  const running = useRef(false);

  const complete = (bookingId: string) => {
    dispatch({ type: "SET_BOOKING_STATUS", id: bookingId, status: "checkedIn" });
    // Close the signature loop: a completed check-in feeds Train XP + the
    // leaderboard. Only reached from the not-yet-checked-in CTA, so it awards once.
    dispatch({ type: "ADD_XP", amount: CHECKIN_XP });
    haptics.notification("success");
    setPhase("done");
  };

  /** `manualCode` skips the camera: a pasted trailhead code stands in for the QR scan. */
  const run = async (bookingId: string, manualCode?: string) => {
    if (running.current) return;
    running.current = true;
    // Camera scanning is a portrait flow — hold the orientation for its
    // duration (no-op on clients without the lock API).
    orientation.lock();
    try {
      setPhase("scanning");
      const scanned = manualCode ?? (await qr.open({ text: t("checkin.scanning") }, () => true));
      if (!scanned) throw new Error("qr");

      setPhase("verifying");
      await biometrics.init();
      const auth = await biometrics.authenticate(t("checkin.verifying"));
      if (!auth.ok) throw new Error("biometric");

      setPhase("locating");
      await location.init();
      const where = await location.getLocation();
      if (!where) throw new Error("location");

      complete(bookingId);
    } catch {
      haptics.notification("error");
      setPhase("error");
    } finally {
      orientation.unlock();
      running.current = false;
    }
  };

  const runDemo = async (bookingId: string) => {
    if (running.current) return;
    running.current = true;
    try {
      for (const next of ["scanning", "verifying", "locating"] as const) {
        setPhase(next);
        await new Promise((resolve) => window.setTimeout(resolve, 180));
      }
      complete(bookingId);
    } catch {
      haptics.notification("error");
      setPhase("error");
    } finally {
      running.current = false;
    }
  };

  return { phase, run, runDemo };
}
