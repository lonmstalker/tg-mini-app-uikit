import { useEffect, useRef, useState, type CSSProperties } from "react";
import { tkZ } from "../internal/dom";

export interface TKConfettiProps {
  /** Particle count (default 150). */
  count?: number;
  /** Burst lifetime, ms (default 1800). */
  duration?: number;
  /** Particle colors; defaults to the accent + festive palette. */
  colors?: string[];
  onDone?: () => void;
  testId?: string;
  style?: CSSProperties;
}

const DEFAULT_COLORS = ["#3390ec", "#7c5cff", "#1fab66", "#ff7a45", "#e5484d", "#ffb224"];

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

/**
 * One-shot canvas confetti for micro-rewards. It uses one canvas, removes
 * itself when the burst ends, and renders nothing under prefers-reduced-motion.
 */
export function TKConfetti({ count = 150, duration = 1800, colors = DEFAULT_COLORS, onDone, testId, style }: TKConfettiProps) {
  const [alive, setAlive] = useState(() => !prefersReducedMotion());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (!alive) doneRef.current?.();
  }, []);

  useEffect(() => {
    if (!alive) return;
    const timer = window.setTimeout(() => {
      setAlive(false);
      doneRef.current?.();
    }, duration);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext?.("2d");
    let raf = 0;
    if (canvas && ctx) {
      const width = (canvas.width = canvas.offsetWidth || 360);
      const height = (canvas.height = canvas.offsetHeight || 640);
      interface Particle {
        x: number;
        y: number;
        vx: number;
        vy: number;
        r: number;
        c: string;
        a: number;
        va: number;
      }
      const parts: Particle[] = Array.from({ length: count }, (_, index) => {
        const angle = (index / count) * Math.PI * 2 + (index % 7) * 0.13;
        const speed = 4 + (index % 5) * 1.7;
        return {
          x: width / 2,
          y: height * 0.42,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 5,
          r: 3 + (index % 4),
          c: colors[index % colors.length],
          a: (index % 360) * (Math.PI / 180),
          va: 0.1 + (index % 3) * 0.07,
        };
      });
      const tick = () => {
        ctx.clearRect(0, 0, width, height);
        for (const part of parts) {
          part.vy += 0.22;
          part.x += part.vx;
          part.y += part.vy;
          part.a += part.va;
          ctx.save();
          ctx.translate(part.x, part.y);
          ctx.rotate(part.a);
          ctx.fillStyle = part.c;
          ctx.fillRect(-part.r, -part.r / 2, part.r * 2, part.r);
          ctx.restore();
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }
    return () => {
      window.clearTimeout(timer);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [alive, colors, count, duration]);

  if (!alive) return null;
  return (
    <div
      data-testid={testId}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, zIndex: tkZ.toast, pointerEvents: "none", ...style }}
    >
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
