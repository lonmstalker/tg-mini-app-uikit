import { useCallback, useState } from "react";
import { TKNavPanel, TKNavStack } from "tg-mini-app-uikit";
import { Feed } from "./Feed";
import { ExperienceDetail } from "./ExperienceDetail";
import { DateSlot } from "./DateSlot";
import { Checkout } from "./Checkout";

/*
 * Discover's depth axis: the feed root and the three-panel booking funnel
 * (Detail → Date/Slot → Summary). Tracking the active (top) panel lets each
 * funnel screen own the single native MainButton only while it is on top, so
 * the mounted-but-hidden lower panels never fight over it. The in-progress
 * booking lives in the store (above this stack), so a mid-funnel swipe-back
 * keeps the chosen slot.
 */
interface DiscoverStackProps {
  visible?: boolean;
  onDepthChange?: (depth: number) => void;
}

export function DiscoverStack({ visible = true, onDepthChange }: DiscoverStackProps) {
  const [panels, setPanels] = useState<string[]>(["feed"]);
  const active = panels[panels.length - 1];
  const handleStackChange = useCallback((nextPanels: string[]) => {
    setPanels(nextPanels);
    onDepthChange?.(nextPanels.length);
  }, [onDepthChange]);
  return (
    <TKNavStack testId="stack-discover" initial="feed" onStackChange={handleStackChange}>
      <TKNavPanel id="feed">
        <Feed />
      </TKNavPanel>
      <TKNavPanel id="detail">
        <ExperienceDetail active={visible && active === "detail"} />
      </TKNavPanel>
      <TKNavPanel id="datetime">
        <DateSlot active={visible && active === "datetime"} />
      </TKNavPanel>
      <TKNavPanel id="summary">
        <Checkout active={visible && active === "summary"} />
      </TKNavPanel>
    </TKNavStack>
  );
}
