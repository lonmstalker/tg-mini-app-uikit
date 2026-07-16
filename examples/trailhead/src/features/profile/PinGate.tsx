import { useEffect, useRef, useState } from "react";
import { TKPinInput, TKSheet, TKText } from "tg-mini-app-uikit";
import { useBiometrics, useOptionalHaptics } from "@tg-mini-app/telegram";
import { useT } from "../../i18n";
import { useAppDispatch, useAppState } from "../../store";
import { useBiometricAuth, useBiometricKeyAvailable } from "../../telegram/biometric-auth";

/*
 * Reusable PIN gate for sensitive actions (wallet connect). Backed by the
 * SecureStorage-persisted PIN in the store, with biometrics as the fast path.
 * Sets the PIN on first use, verifies it afterwards.
 */
export function PinGate({
  open,
  onClose,
  onSuccess,
  testId = "pin-gate",
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  testId?: string;
}) {
  const t = useT();
  const { pin } = useAppState();
  const dispatch = useAppDispatch();
  const biometrics = useBiometrics();
  const biometricAuth = useBiometricAuth(biometrics);
  const biometricKey = useBiometricKeyAvailable(biometrics);
  const haptics = useOptionalHaptics();
  const [error, setError] = useState(false);
  const errorTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(errorTimer.current), []);

  const succeed = () => {
    haptics.notification("success");
    onSuccess();
  };

  const onComplete = (entered: string) => {
    if (!pin) {
      dispatch({ type: "SET_PIN", pin: entered });
      succeed();
      return;
    }
    if (entered === pin) {
      succeed();
    } else {
      setError(true);
      haptics.notification("error");
      clearTimeout(errorTimer.current);
      errorTimer.current = setTimeout(() => setError(false), 600);
    }
  };

  const onBiometric = async () => {
    if (await biometricAuth(t("wallet.gateTitle"))) succeed();
  };

  return (
    <TKSheet open={open} onClose={onClose} title={pin ? t("wallet.gateTitle") : t("wallet.gateSetTitle")} testId={testId}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingBottom: 8 }}>
        <TKText as="div" size="footnote" tone="secondary">
          {t(pin ? "wallet.gateHelp" : "wallet.gateSetHelp")}
        </TKText>
        <TKPinInput
          testId={`${testId}-input`}
          length={4}
          maxLength={8}
          error={error}
          onBiometricRequest={biometricKey ? () => void onBiometric() : undefined}
          onComplete={onComplete}
        />
      </div>
    </TKSheet>
  );
}
