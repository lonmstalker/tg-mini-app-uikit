import { useCallback, useState } from "react";
import { TKNavPanel, TKNavStack, useNav } from "tg-mini-app-uikit";
import { useSettingsButton } from "@tg-mini-app/telegram";
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

/*
 * Native ⋯ Settings button → Platform Lab. Lives inside the always-mounted
 * "home" panel so `useNav` sees this stack; visible only while the Profile tab
 * is the active one (the hook hides the button when `visible` flips off and on
 * unmount). No-op outside Telegram — the in-DOM "open-lab" cell stays the
 * browser path. `labOpen` guards a second push while the Lab is already up.
 */
function LabSettingsButton({ visible, labOpen }: { visible: boolean; labOpen: boolean }) {
  const nav = useNav();
  useSettingsButton(() => {
    if (!labOpen) nav.push("lab");
  }, visible);
  return null;
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
        <LabSettingsButton visible={visible} labOpen={active === "lab"} />
      </TKNavPanel>
      <TKNavPanel id="lab">
        <PlatformLab active={visible && active === "lab"} />
      </TKNavPanel>
    </TKNavStack>
  );
}
