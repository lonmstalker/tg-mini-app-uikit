import { useCallback } from "react";
import { TKNavPanel, TKNavStack } from "tg-mini-app-uikit";
import { Train } from "./Train";
import { SessionDetail } from "./SessionDetail";

/*
 * Train depth axis: the streak/leaderboard dashboard and a session-detail push,
 * so Train also rides the swipe-back spine.
 */
export function TrainStack({ onDepthChange }: { onDepthChange?: (depth: number) => void }) {
  const handleStackChange = useCallback((panels: string[]) => {
    onDepthChange?.(panels.length);
  }, [onDepthChange]);
  return (
    <TKNavStack testId="stack-train" initial="home" onStackChange={handleStackChange}>
      <TKNavPanel id="home">
        <Train />
      </TKNavPanel>
      <TKNavPanel id="session">
        <SessionDetail />
      </TKNavPanel>
    </TKNavStack>
  );
}
