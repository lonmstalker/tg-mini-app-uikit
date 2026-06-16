/*
 * Honest runtime label (Principle V, FR-014, D4). Internal — never exported from
 * any package. The order matters: a mock injects a `webApp` whose
 * `isSupported === true`, so we must check the mock handle BEFORE trusting the
 * bridge, or a mock would masquerade as native.
 */
import { useWebApp } from "@tg-mini-app/telegram";
import type { RuntimeMode } from "../app/composerReducer";
import { useMockHandle } from "./mockContext";

export function useRuntimeMode(): RuntimeMode {
  const wa = useWebApp();
  const mock = useMockHandle();
  if (mock) return "mock";
  if (wa?.initData) return "native-mirror";
  return "browser-fallback";
}
