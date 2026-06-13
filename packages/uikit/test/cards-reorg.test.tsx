import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import * as kit from "../src";
import {
  TKBannerCard,
  TKBookingCard,
  TKCard,
  TKCardCell,
  TKCardChip,
  TKProductCardA,
  TKProductCardB,
  TKStatTile,
} from "../src/composites/cards";
import { TKCard as ModuleTKCard } from "../src/composites/cards/primitives";
import { TKProductCardA as ModuleTKProductCardA } from "../src/composites/cards/product";
import { TKBannerCard as ModuleTKBannerCard } from "../src/composites/cards/promotional";

describe("cards module reorganization", () => {
  it("publishes card composites from the composite category and root package", () => {
    expect(TKBannerCard).toBe(kit.TKBannerCard);
    expect(TKBookingCard).toBe(kit.TKBookingCard);
    expect(TKCard).toBe(kit.TKCard);
    expect(TKCardCell).toBe(kit.TKCardCell);
    expect(TKCardChip).toBe(kit.TKCardChip);
    expect(TKProductCardA).toBe(kit.TKProductCardA);
    expect(TKProductCardB).toBe(kit.TKProductCardB);
    expect(TKStatTile).toBe(kit.TKStatTile);
  });

  it("keeps card implementation modules under the composite category", () => {
    expect(ModuleTKCard).toBe(TKCard);
    expect(ModuleTKProductCardA).toBe(TKProductCardA);
    expect(ModuleTKBannerCard).toBe(TKBannerCard);
  });

  it("renders representative card composites from the new category", () => {
    render(
      <div>
        <TKCard>
          <TKCardCell title="Wallet" subtitle="Main balance" />
          <TKCardChip selected>Primary</TKCardChip>
        </TKCard>
        <TKProductCardA title="Camera" price="$199" />
        <TKProductCardB title="Tripod" price="$49" rating="4.8" />
        <TKBannerCard title="Weekend bonus" text="Double rewards" cta="Open" />
        <TKBookingCard name="Anna" subtitle="Dentist" date="13 Jun" time="18:30" />
        <TKStatTile label="Revenue" value="$12.4k" delta="+8%" />
      </div>,
    );

    expect(screen.getByText("Wallet")).toBeVisible();
    expect(screen.getByText("Camera")).toBeVisible();
    expect(screen.getByText("Tripod")).toBeVisible();
    expect(screen.getByText("Weekend bonus")).toBeVisible();
    expect(screen.getByText("Anna")).toBeVisible();
    expect(screen.getByText("Revenue")).toBeVisible();
  });
});
