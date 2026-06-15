/**
 * @tg-mini-app/async — async-interaction state machines for React.
 * `useAsync` (stale-guarded one-shot), `useTKInfiniteData` (cursor pagination
 * FSM, locale lifted to the caller's fetcher), the `Page<T>` contract, and
 * `createMockGate` for mock data layers. No UI, no i18n, no platform.
 */
export { useAsync } from "./useAsync";
export type { AsyncState } from "./useAsync";
export { useTKInfiniteData } from "./useTKInfiniteData";
export type { TKInfiniteData, TKInfiniteDataPhase, UseTKInfiniteDataOptions } from "./useTKInfiniteData";
export type { Page } from "./page";
export { createMockGate, MockGateError } from "./mockGate";
export type { MockGate, MockGateConfig } from "./mockGate";
