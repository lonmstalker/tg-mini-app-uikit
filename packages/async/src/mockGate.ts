/**
 * A configurable async "gate" for mock data layers: it waits `delayMs`, then
 * either resolves or throws (when `fail`). Flip the config at runtime (a demo
 * toggle, an e2e hook) to exercise loading, success, and failure paths. Pure —
 * no network, no globals.
 */
export interface MockGateConfig {
  delayMs: number;
  fail: boolean;
}

export class MockGateError extends Error {
  constructor(message = "MOCK_GATE_FAILURE") {
    super(message);
    this.name = "MockGateError";
  }
}

export interface MockGate {
  (): Promise<void>;
  configure: (next: Partial<MockGateConfig>) => void;
  getConfig: () => MockGateConfig;
}

export function createMockGate(initial: Partial<MockGateConfig> = {}): MockGate {
  let config: MockGateConfig = { delayMs: 0, fail: false, ...initial };
  const gate = (async () => {
    if (config.delayMs > 0) await new Promise<void>((resolve) => setTimeout(resolve, config.delayMs));
    if (config.fail) throw new MockGateError();
  }) as MockGate;
  gate.configure = (next) => {
    config = { ...config, ...next };
  };
  gate.getConfig = () => ({ ...config });
  return gate;
}
