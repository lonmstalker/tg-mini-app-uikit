import { useCallback, useState } from "react";
import { TKNavPanel, TKNavStack } from "tg-mini-app-uikit";
import { Profile } from "./Profile";
import { PlatformLab } from "./PlatformLab";

/*
 * Profile depth axis: the wallet + settings home, and the Platform Lab push that
 * re-skins the whole app live (accent, radius, motion, type scale, light/dark,
 * device cutouts, RTL, language) — every choice persists via DeviceStorage.
 */
interface ProfileStackProps {
  visible?: boolean;
  onDepthChange?: (depth: number) => void;
}

export function ProfileStack({ visible = true, onDepthChange }: ProfileStackProps) {
  const [panels, setPanels] = useState<string[]>(["home"]);
  const active = panels[panels.length - 1];
  const handleStackChange = useCallback((nextPanels: string[]) => {
    setPanels(nextPanels);
    onDepthChange?.(nextPanels.length);
  }, [onDepthChange]);
  return (
    <TKNavStack testId="stack-profile" initial="home" onStackChange={handleStackChange}>
      <TKNavPanel id="home">
        <Profile />
      </TKNavPanel>
      <TKNavPanel id="lab">
        <PlatformLab active={visible && active === "lab"} />
      </TKNavPanel>
    </TKNavStack>
  );
}
