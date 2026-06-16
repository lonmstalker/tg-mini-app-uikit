/*
 * Demo-only contact-highlight ring (D2), anchored at the last contact point
 * (--sc-contact-x/y). It gives the <100ms tactile feedback for any primary
 * touch (FR-017, SC-014) and the recognition pulse for an empty-space tap
 * (FR-006). Animated via transform/opacity only; the surface toggles
 * `data-contact` / `data-recognized` to fire it.
 */
export function TactileRing() {
  return <div className="sc-ring" data-ring aria-hidden="true" />;
}
