/*
 * Demo-only origin marker (D2). A single committed-accent point pinned to the
 * surface origin (--sc-origin-x/y) from which the whole surface is born. Purely
 * decorative — aria-hidden — and animated only via transform/opacity in CSS.
 */
export function Seed() {
  return <div className="sc-seed" data-seed aria-hidden="true" />;
}
