import type { ReactNode } from "react";
import { TKAvatarStack, TKBadge, TKRating, type TKAvatarStackItem } from "tg-mini-app-uikit";

export interface BuyerTrustStripProps {
  avatars: TKAvatarStackItem[];
  rating: number;
  badge: ReactNode;
}

export function BuyerTrustStrip({ avatars, rating, badge }: BuyerTrustStripProps) {
  return (
    <div className="sc-buyer-proof" data-testid="buyer-proof-strip" role="group" aria-label="Buyer proof">
      <TKAvatarStack avatars={avatars} size={24} />
      <TKRating value={rating} readonly allowHalf />
      <TKBadge tone="gray" soft>
        {badge}
      </TKBadge>
    </div>
  );
}
