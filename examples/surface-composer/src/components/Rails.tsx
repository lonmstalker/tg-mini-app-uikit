/*
 * Demo-only construction rails (D2): a token grid + safe-area frame that grow
 * OUT of the seed during the `rails` state, mapping the system concepts (token
 * grid, safe area) the surface is built on. Decorative (aria-hidden); the whole
 * SVG scales from the seed origin (transform only, FR-013). `non-scaling-stroke`
 * keeps the hairlines constant under the scale.
 */
export function Rails() {
  return (
    <svg className="sc-rails" data-rails aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none">
      <rect className="sc-rail sc-rail--safe" x="3" y="2" width="94" height="96" rx="5" vectorEffect="non-scaling-stroke" />
      <line className="sc-rail" x1="0" y1="25" x2="100" y2="25" vectorEffect="non-scaling-stroke" />
      <line className="sc-rail" x1="0" y1="50" x2="100" y2="50" vectorEffect="non-scaling-stroke" />
      <line className="sc-rail" x1="0" y1="75" x2="100" y2="75" vectorEffect="non-scaling-stroke" />
      <line className="sc-rail" x1="25" y1="0" x2="25" y2="100" vectorEffect="non-scaling-stroke" />
      <line className="sc-rail" x1="50" y1="0" x2="50" y2="100" vectorEffect="non-scaling-stroke" />
      <line className="sc-rail" x1="75" y1="0" x2="75" y2="100" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
