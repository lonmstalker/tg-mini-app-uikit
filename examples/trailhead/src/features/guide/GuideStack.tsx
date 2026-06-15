import { useCallback, useState } from "react";
import { TKNavPanel, TKNavStack } from "tg-mini-app-uikit";
import { GuideDirectory } from "./GuideDirectory";
import { GuideProfile } from "./GuideProfile";
import { GuideThread } from "./GuideThread";

/*
 * Guide depth axis: directory → guide profile → DM thread. Long-press a guide
 * for the action sheet (Message / Share / Mute). The thread's write bar respects
 * the keyboard and the safe area.
 */
interface GuideStackProps {
  visible?: boolean;
  onDepthChange?: (depth: number) => void;
}

export function GuideStack({ visible = true, onDepthChange }: GuideStackProps) {
  const [panels, setPanels] = useState<string[]>(["directory"]);
  const active = panels[panels.length - 1];
  const handleStackChange = useCallback((nextPanels: string[]) => {
    setPanels(nextPanels);
    onDepthChange?.(nextPanels.length);
  }, [onDepthChange]);
  return (
    <TKNavStack testId="stack-guide" initial="directory" onStackChange={handleStackChange}>
      <TKNavPanel id="directory">
        <GuideDirectory />
      </TKNavPanel>
      <TKNavPanel id="profile">
        <GuideProfile active={visible && active === "profile"} />
      </TKNavPanel>
      <TKNavPanel id="thread">
        <GuideThread />
      </TKNavPanel>
    </TKNavStack>
  );
}
