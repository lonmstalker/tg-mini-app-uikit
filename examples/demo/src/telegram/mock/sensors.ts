import type { TelegramDeviceOrientation } from "tg-mini-app-uikit";
import { SENSOR_READINGS } from "./theme";
import type { MockSensorKey, MockSensorState, MockTelegramState } from "./types";

interface SensorContext {
  log: (text: string) => void;
  getState: () => MockTelegramState;
  commit: (next: Partial<MockTelegramState>, events?: string[]) => void;
}

export function syncSensor(target: TelegramDeviceOrientation, s: MockSensorState) {
  target.isStarted = s.isStarted;
  target.x = s.values.x;
  target.y = s.values.y;
  target.z = s.values.z;
  target.alpha = s.values.alpha;
  target.beta = s.values.beta;
  target.gamma = s.values.gamma;
  if (s.absolute != null) target.absolute = s.absolute;
}

export function makeSensor(
  key: MockSensorKey,
  label: string,
  ctx: SensorContext,
): TelegramDeviceOrientation {
  return {
    start: (params, cb) => {
      const absolute = key === "deviceOrientation" && !!params?.need_absolute;
      ctx.log(`${label}.start(${params?.refresh_rate ?? "default"}${absolute ? ", absolute" : ""})`);
      ctx.commit(
        {
          sensors: {
            ...ctx.getState().sensors,
            [key]: {
              isStarted: true,
              refreshRate: params?.refresh_rate ?? null,
              ...(key === "deviceOrientation" ? { absolute } : {}),
              values: SENSOR_READINGS[key],
            },
          },
        },
        [`${key}Started`, `${key}Changed`],
      );
      cb?.(true);
    },
    stop: (cb) => {
      ctx.log(`${label}.stop()`);
      ctx.commit(
        { sensors: { ...ctx.getState().sensors, [key]: { ...ctx.getState().sensors[key], isStarted: false } } },
        [`${key}Stopped`],
      );
      cb?.(true);
    },
  };
}
