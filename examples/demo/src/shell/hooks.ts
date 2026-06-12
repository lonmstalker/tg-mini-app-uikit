import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = () => setMatches(mq.matches);
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

/** Scale factor that fits the device frame into the viewport. */
export function useFrameScale(frameWidth: number, frameHeight: number): number {
  const calc = () =>
    Math.max(
      0.55,
      Math.min(1, (window.innerHeight - 150) / frameHeight, (window.innerWidth - 600) / frameWidth),
    );
  const [scale, setScale] = useState(calc);
  useEffect(() => {
    const onResize = () => setScale(calc());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameWidth, frameHeight]);
  return scale;
}
