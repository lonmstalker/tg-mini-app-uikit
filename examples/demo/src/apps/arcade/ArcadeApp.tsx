import { useCallback, useEffect, useRef, useState } from "react";
import {
  TKBadge,
  TKButton,
  TKCounter,
  TKDialog,
  TKPage,
  TKProvider,
  TKSlider,
  TKTelegramProvider,
  TKToastProvider,
  useActivity,
  useFullscreen,
  useMotionSensors,
  useOrientationLock,
  useTelegramTheme,
  useTKToast,
} from "tg-mini-app-uikit";
import { createMockTelegram } from "../../telegram/mock";

/* ------------------------------------------------------------------ */
/* Mock setup — stable ref so re-renders don't recreate the mock.      */
/* ------------------------------------------------------------------ */

const FIELD_W = 280;
const FIELD_H = 280;
const BALL_R = 16;
const DOT_R = 8;
const SENSOR_SCALE = 18; // px per unit of gamma/beta

/* Deterministic initial dot positions (no Math.random in render) */
const INITIAL_DOTS: { x: number; y: number }[] = [
  { x: 60, y: 60 },
  { x: 200, y: 80 },
  { x: 120, y: 200 },
];

/* Generate next 3 dot positions from a counter — deterministic */
function dotsForRound(round: number): { x: number; y: number }[] {
  const offsets = [
    { x: 40 + (round * 37) % 200, y: 40 + (round * 53) % 200 },
    { x: 80 + (round * 71) % 160, y: 120 + (round * 29) % 120 },
    { x: 140 + (round * 19) % 120, y: 60 + (round * 61) % 180 },
  ];
  return offsets;
}

function ArcadeInner() {
  const theme = useTelegramTheme();
  const toast = useTKToast();
  const fullscreen = useFullscreen();
  const orientLock = useOrientationLock();
  const activity = useActivity();
  const sensors = useMotionSensors();
  const still = new URLSearchParams(window.location.search).get("still") === "1";

  // Ball position
  const ballPos = useRef({ x: FIELD_W / 2, y: FIELD_H / 2 });
  const [ballDisplay, setBallDisplay] = useState({ x: FIELD_W / 2, y: FIELD_H / 2 });

  // Score
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);

  // Dots (current targets)
  const [round, setRound] = useState(0);
  const [dots, setDots] = useState(INITIAL_DOTS);

  // Slider overrides for desktop / e2e testing
  const [tiltX, setTiltX] = useState(0); // -1..1 mapped from gamma
  const [tiltY, setTiltY] = useState(0); // -1..1 mapped from beta

  // Pause state
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);

  const rafRef = useRef<number | null>(null);

  // Start sensors on mount
  useEffect(() => {
    if (still) return;
    sensors.deviceOrientation.start(60);
    return () => {
      sensors.deviceOrientation.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [still]);

  // Pause when app goes inactive (Telegram deactivated event)
  useEffect(() => {
    if (!activity.isActive) {
      pausedRef.current = true;
      setPaused(true);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    }
  }, [activity.isActive]);

  // Game loop
  const startLoop = useCallback(() => {
    if (still) return;
    if (rafRef.current !== null) return;
    const tick = () => {
      if (pausedRef.current) return;

      const sensor = sensors.deviceOrientation.sensor;
      // gamma = left/right tilt (x-axis), beta = forward/back (y-axis)
      // Use slider overrides when sensor reads zero (desktop / mock fallback)
      const rawGamma = sensor?.gamma ?? 0;
      const rawBeta = sensor?.beta ?? 0;

      // Prefer slider if sensor is effectively zero (desktop) else use sensor
      const useSlider = rawGamma === 0 && rawBeta === 0;
      const gx = useSlider ? tiltX : Math.max(-1, Math.min(1, rawGamma / 45));
      const gy = useSlider ? tiltY : Math.max(-1, Math.min(1, rawBeta / 45));

      const speed = SENSOR_SCALE;
      const dt = 1 / 60;

      const nx = Math.max(BALL_R, Math.min(FIELD_W - BALL_R, ballPos.current.x + gx * speed * dt * 60));
      const ny = Math.max(BALL_R, Math.min(FIELD_H - BALL_R, ballPos.current.y + gy * speed * dt * 60));
      ballPos.current = { x: nx, y: ny };

      setBallDisplay({ x: nx, y: ny });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [sensors.deviceOrientation.sensor, still, tiltX, tiltY]);

  // Restart loop when unpaused or tilt values change
  useEffect(() => {
    if (!paused) {
      startLoop();
    }
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [paused, startLoop]);

  // Collision detection: check if ball overlaps any dot
  useEffect(() => {
    const bx = ballDisplay.x;
    const by = ballDisplay.y;
    const remaining = dots.filter((d) => {
      const dx = d.x - bx;
      const dy = d.y - by;
      return Math.sqrt(dx * dx + dy * dy) > BALL_R + DOT_R;
    });
    if (remaining.length < dots.length) {
      const collected = dots.length - remaining.length;
      const next = scoreRef.current + collected;
      scoreRef.current = next;
      setScore(next);

      if (remaining.length === 0) {
        // All dots collected for this round
        const nextRound = round + 1;
        setRound(nextRound);
        setDots(dotsForRound(nextRound));
        toast.success(`Round ${nextRound} complete! Score: ${next}`);
      } else {
        setDots(remaining);
      }
    }
  }, [ballDisplay, dots, round, toast]);

  const handleSimulateBg = () => {
    pausedRef.current = true;
    setPaused(true);
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const handleResume = () => {
    pausedRef.current = false;
    setPaused(false);
  };

  const moveBall = (dx: number, dy: number) => {
    if (pausedRef.current || still) return;
    const nx = Math.max(BALL_R, Math.min(FIELD_W - BALL_R, ballPos.current.x + dx));
    const ny = Math.max(BALL_R, Math.min(FIELD_H - BALL_R, ballPos.current.y + dy));
    ballPos.current = { x: nx, y: ny };
    setBallDisplay({ x: nx, y: ny });
  };

  return (
    <TKProvider theme={theme} style={{ height: "100%" }}>
      <div data-demo-app="arcade" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <TKPage
          header={
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "60px 16px 10px",
                flexWrap: "wrap",
              }}
            >
              <TKButton
                size="sm"
                variant={fullscreen.isFullscreen ? "tonal" : "filled"}
                onClick={() => (fullscreen.isFullscreen ? fullscreen.exit() : fullscreen.request())}
                testId="arcade-fullscreen"
              >
                {fullscreen.isFullscreen ? "Exit fullscreen" : "Go fullscreen"}
              </TKButton>
              <TKBadge tone={fullscreen.isFullscreen ? "green" : "gray"}>
                {fullscreen.isFullscreen ? "Fullscreen" : "Normal"}
              </TKBadge>

              <TKButton
                size="sm"
                variant={orientLock.isLocked ? "tonal" : "surface"}
                onClick={() => (orientLock.isLocked ? orientLock.unlock() : orientLock.lock())}
              >
                {orientLock.isLocked ? "Unlock orientation" : "Lock landscape"}
              </TKButton>
              <TKBadge tone={orientLock.isLocked ? "green" : "gray"}>
                {orientLock.isLocked ? "Locked" : "Free"}
              </TKBadge>
            </div>
          }
        >
          {/* Score */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "var(--tk-fz-sub)", fontWeight: 600, color: "var(--tk-text-2)" }}>Score</span>
            <TKCounter value={score} tone="red" testId="arcade-score" />
          </div>

          {/* Game field */}
          <div
            data-testid="arcade-field"
            tabIndex={0}
            onKeyDown={(e) => {
              const step = 24;
              if (e.key === "ArrowLeft") moveBall(-step, 0);
              else if (e.key === "ArrowRight") moveBall(step, 0);
              else if (e.key === "ArrowUp") moveBall(0, -step);
              else if (e.key === "ArrowDown") moveBall(0, step);
              else return;
              e.preventDefault();
            }}
            style={{
              position: "relative",
              width: FIELD_W,
              height: FIELD_H,
              background: "var(--tk-surface)",
              borderRadius: "var(--tk-r-lg)",
              overflow: "hidden",
              boxShadow: "var(--tk-shadow-md)",
              alignSelf: "center",
              outline: "none",
            }}
          >
            {/* Dots */}
            {dots.map((dot, i) => (
              <div
                key={`${round}-${i}`}
                style={{
                  position: "absolute",
                  left: dot.x - DOT_R,
                  top: dot.y - DOT_R,
                  width: DOT_R * 2,
                  height: DOT_R * 2,
                  borderRadius: "50%",
                  background: "var(--tk-accent)",
                  transition: "transform 0.2s var(--tk-spring)",
                }}
              />
            ))}
            {/* Ball — transform-only movement */}
            <div
              data-testid="arcade-ball"
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: BALL_R * 2,
                height: BALL_R * 2,
                borderRadius: "50%",
                background: "var(--tk-green)",
                boxShadow: "0 4px 12px rgba(0,0,0,.25)",
                transform: `translate(${ballDisplay.x - BALL_R}px, ${ballDisplay.y - BALL_R}px)`,
                willChange: "transform",
              }}
            />
          </div>

          <div data-testid="arcade-desktop-controls" style={{ display: "grid", gridTemplateColumns: "44px 44px 44px", gap: 8, alignSelf: "center" }}>
            <span />
            <TKButton size="sm" variant="surface" onClick={() => moveBall(0, -28)} aria-label="Move up" style={{ minWidth: 44 }}>
              ↑
            </TKButton>
            <span />
            <TKButton size="sm" variant="surface" onClick={() => moveBall(-28, 0)} testId="arcade-move-left" aria-label="Move left" style={{ minWidth: 44 }}>
              ←
            </TKButton>
            <TKButton size="sm" variant="surface" onClick={() => {
              ballPos.current = { x: FIELD_W / 2, y: FIELD_H / 2 };
              setBallDisplay({ x: FIELD_W / 2, y: FIELD_H / 2 });
            }} aria-label="Center ball" style={{ minWidth: 44 }}>
              •
            </TKButton>
            <TKButton size="sm" variant="surface" onClick={() => moveBall(28, 0)} aria-label="Move right" style={{ minWidth: 44 }}>
              →
            </TKButton>
            <span />
            <TKButton size="sm" variant="surface" onClick={() => moveBall(0, 28)} aria-label="Move down" style={{ minWidth: 44 }}>
              ↓
            </TKButton>
            <span />
          </div>

          {/* Tilt overrides for desktop + e2e */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: "var(--tk-fz-caption)", color: "var(--tk-text-3)" }}>
              On-screen tilt override (desktop / e2e)
            </span>
            <TKSlider
              label="Tilt X (left–right)"
              min={-1}
              max={1}
              step={0.01}
              value={tiltX}
              onChange={setTiltX}
              suffix=""
              testId="arcade-tilt-x"
            />
            <TKSlider
              label="Tilt Y (forward–back)"
              min={-1}
              max={1}
              step={0.01}
              value={tiltY}
              onChange={setTiltY}
              suffix=""
            />
          </div>

          {/* Simulate background button for e2e */}
          <TKButton variant="surface" size="sm" onClick={handleSimulateBg} testId="arcade-bg">
            Simulate background
          </TKButton>
        </TKPage>

        {/* Pause dialog */}
        <TKDialog
          open={paused}
          onClose={handleResume}
          onConfirm={handleResume}
          icon="pause"
          tone="accent"
          title="Game paused"
          text="The app went to background. Tap Resume to continue."
          actions={
            <TKButton onClick={handleResume} variant="filled">
              Resume
            </TKButton>
          }
          testId="arcade-paused"
        />
      </div>
    </TKProvider>
  );
}

export function ArcadeApp() {
  const mock = useRef(createMockTelegram());
  return (
    <TKTelegramProvider webApp={mock.current.webApp}>
      <TKToastProvider>
        <ArcadeInner />
      </TKToastProvider>
    </TKTelegramProvider>
  );
}
