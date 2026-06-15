import { useCallback, useState } from "react";
import { TKNavPanel, TKNavStack } from "tg-mini-app-uikit";
import { TripsList } from "./TripsList";
import { TripDetail } from "./TripDetail";
import { RescheduleSlot } from "./RescheduleSlot";

/*
 * Trips depth axis: the booking list and the trail check-in push. The check-in
 * (QR → biometric → location) is the signature chain's final beat — it flips the
 * booking to "checked in" and persists it.
 */
interface TripsStackProps {
  visible?: boolean;
  onDepthChange?: (depth: number) => void;
}

export function TripsStack({ visible = true, onDepthChange }: TripsStackProps) {
  const [panels, setPanels] = useState<string[]>(["list"]);
  const active = panels[panels.length - 1];
  const handleStackChange = useCallback((nextPanels: string[]) => {
    setPanels(nextPanels);
    onDepthChange?.(nextPanels.length);
  }, [onDepthChange]);
  return (
    <TKNavStack testId="stack-trips" initial="list" onStackChange={handleStackChange}>
      <TKNavPanel id="list">
        <TripsList />
      </TKNavPanel>
      <TKNavPanel id="detail">
        <TripDetail active={visible && active === "detail"} />
      </TKNavPanel>
      <TKNavPanel id="reschedule">
        <RescheduleSlot active={visible && active === "reschedule"} />
      </TKNavPanel>
    </TKNavStack>
  );
}
