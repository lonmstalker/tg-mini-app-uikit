import { useEffect, useRef, useState, type CSSProperties } from "react";
import { tkZ } from "./internal/dom";

/* ---------------- Confetti burst (M7.3) ---------------- */

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
 * One-shot canvas confetti for micro-rewards (level-up, paid invoice).
 * Compositor-friendly (one canvas, no DOM churn), removes itself when the
 * burst ends; renders nothing under prefers-reduced-motion.
 */
export function TKConfetti({ count = 150, duration = 1800, colors = DEFAULT_COLORS, onDone, testId, style }: TKConfettiProps) {
  const [alive, setAlive] = useState(() => !prefersReducedMotion());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  // reduced motion: skip the show, but resolve the flow immediately
  useEffect(() => {
    if (!alive) doneRef.current?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      const w = (canvas.width = canvas.offsetWidth || 360);
      const h = (canvas.height = canvas.offsetHeight || 640);
      interface P { x: number; y: number; vx: number; vy: number; r: number; c: string; a: number; va: number; }
      const parts: P[] = Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + (i % 7) * 0.13;
        const speed = 4 + (i % 5) * 1.7;
        return {
          x: w / 2,
          y: h * 0.42,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 5,
          r: 3 + (i % 4),
          c: colors[i % colors.length],
          a: (i % 360) * (Math.PI / 180),
          va: 0.1 + (i % 3) * 0.07,
        };
      });
      const tick = () => {
        ctx.clearRect(0, 0, w, h);
        for (const p of parts) {
          p.vy += 0.22; // gravity
          p.x += p.vx;
          p.y += p.vy;
          p.a += p.va;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.a);
          ctx.fillStyle = p.c;
          ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
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
