import { useEffect, useState, type RefObject } from "react";
import { useReducedMotion } from "tg-mini-app-uikit";

export type ScenarioStep =
  | "wallet"
  | "gallery"
  | "sheet-open"
  | "sheet-close"
  | "pin"
  | "success"
  | "confetti"
  | "pause";

interface ScenarioSnapshot {
  cycle: number;
  step: ScenarioStep;
}

const FIRST_PAINT_DELAY_MS = 650;
const RESET_PAUSE_MS = 900;

export const SCENARIO_TIMELINE = [
  ["gallery", 1800],
  ["sheet-open", 2300],
  ["sheet-close", 700],
  ["pin", 1800],
  ["success", 1200],
  ["confetti", 1800],
  ["pause", 3300],
] as const satisfies readonly (readonly [ScenarioStep, number])[];

export const SCENARIO_CYCLE_MS =
  SCENARIO_TIMELINE.reduce((total, [, duration]) => total + duration, 0) + RESET_PAUSE_MS;

function waitWhileVisible(duration: number, signal: AbortSignal): Promise<boolean> {
  return new Promise((resolve) => {
    let remaining = duration;
    let startedAt = 0;
    let timer: number | undefined;
    let settled = false;

    const cleanup = () => {
      if (timer !== undefined) window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      signal.removeEventListener("abort", onAbort);
    };

    const settle = (completed: boolean) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(completed);
    };

    const arm = () => {
      if (document.hidden || timer !== undefined || settled) return;
      startedAt = performance.now();
      timer = window.setTimeout(() => {
        timer = undefined;
        settle(true);
      }, remaining);
    };

    function onVisibilityChange() {
      if (document.hidden) {
        if (timer === undefined) return;
        window.clearTimeout(timer);
        timer = undefined;
        remaining = Math.max(0, remaining - (performance.now() - startedAt));
        return;
      }

      arm();
    }

    const onAbort = () => settle(false);

    if (signal.aborted) {
      settle(false);
      return;
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    signal.addEventListener("abort", onAbort, { once: true });
    arm();
  });
}

export function useScenario(frameRef: RefObject<HTMLElement | null>) {
  const reducedMotion = useReducedMotion();
  const [stopped, setStopped] = useState(false);
  const [inViewport, setInViewport] = useState(
    () => typeof IntersectionObserver === "undefined",
  );
  const [snapshot, setSnapshot] = useState<ScenarioSnapshot>({ cycle: 0, step: "wallet" });

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry?.isIntersecting ?? false;
        setInViewport(visible);
        if (!visible) {
          setSnapshot((current) =>
            current.cycle === 0 && current.step === "wallet"
              ? current
              : { cycle: 0, step: "wallet" },
          );
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(frame);
    return () => observer.disconnect();
  }, [frameRef]);

  useEffect(() => {
    const controller = new AbortController();
    const frame = frameRef.current;

    if (!reducedMotion && !stopped && inViewport) {
      frame?.addEventListener(
        "pointerdown",
        () => {
          controller.abort();
          setStopped(true);
        },
        { capture: true, once: true, signal: controller.signal },
      );

      void (async () => {
        if (!(await waitWhileVisible(FIRST_PAINT_DELAY_MS, controller.signal))) return;

        let cycle = 0;
        while (!controller.signal.aborted) {
          for (const [step, duration] of SCENARIO_TIMELINE) {
            setSnapshot({ cycle, step });
            if (!(await waitWhileVisible(duration, controller.signal))) return;
          }

          cycle += 1;
          setSnapshot({ cycle, step: "wallet" });
          if (!(await waitWhileVisible(RESET_PAUSE_MS, controller.signal))) return;
        }
      })();
    }

    return () => controller.abort();
  }, [frameRef, inViewport, reducedMotion, stopped]);

  return {
    ...snapshot,
    autoplay: !reducedMotion && !stopped && inViewport,
    reducedMotion,
    stopped,
  };
}
