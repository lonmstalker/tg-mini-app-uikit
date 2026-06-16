/*
 * The seven named surface slots (data-model §Surface), composed ONLY from
 * existing public exports (Principle II). Slot identity is stable across remix
 * (each carries a fixed `data-slot` + `data-flip-id`); only the content rebinds,
 * which is what lets the surface morph in place instead of swapping pages (D2).
 *
 * The live switcher (US1) and the primary action bar are injected as children so
 * the scenes own their behaviour while the layout/motion identity lives here.
 */
import type { CSSProperties, ReactNode } from "react";
import {
  TKAvatarStack,
  TKBadge,
  TKCell,
  TKHeader,
  TKImage,
  TKListGroup,
  TKRating,
  TKStatTile,
  type TKAvatarStackItem,
  type TKIconName,
} from "tg-mini-app-uikit";

export interface SurfaceRow {
  id: string;
  icon?: TKIconName;
  title: ReactNode;
  subtitle?: ReactNode;
  value?: ReactNode;
}

export interface SurfaceContent {
  header: { title: ReactNode; subtitle?: ReactNode };
  media: { src?: string; alt?: string; fallbackLabel?: string };
  hero: { title: ReactNode; text?: ReactNode };
  primaryMetric: { label: ReactNode; value: ReactNode; delta?: ReactNode; up?: boolean; bars?: number[] };
  supportingList: { title?: ReactNode; rows: SurfaceRow[] };
  trustStrip: { avatars: TKAvatarStackItem[]; rating: number; badge: ReactNode };
}

type SlotStyle = CSSProperties & { "--sc-slot-index"?: number };

function Slot({
  id,
  index,
  meaningful,
  children,
}: {
  id: string;
  index: number;
  /** Content slots are "meaningful": touching them opens the inspector (FR-017). */
  meaningful?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className="sc-slot"
      data-slot={id}
      data-flip-id={id}
      data-meaningful={meaningful ? "" : undefined}
      style={{ "--sc-slot-index": index } as SlotStyle}
    >
      {children}
    </div>
  );
}

export interface SurfaceSlotsProps {
  content: SurfaceContent;
  /** Live business-context switcher (US1) placed under the header. */
  switcher?: ReactNode;
  /** The single primary commitment action (PrimaryActionBar) — pinned footer. */
  primaryAction?: ReactNode;
  /** Extra content rendered in the scroll region below the surface (e.g. proof strip). */
  belowContent?: ReactNode;
}

export function SurfaceSlots({ content, switcher, primaryAction, belowContent }: SurfaceSlotsProps) {
  const { header, media, hero, primaryMetric, supportingList, trustStrip } = content;
  return (
    <div className="sc-slots">
      <div className="sc-slots__scroll">
      <Slot id="header" index={0}>
        <TKHeader title={header.title} subtitle={header.subtitle} back={false} />
      </Slot>

      {switcher ? (
        <Slot id="switcher" index={1}>
          {switcher}
        </Slot>
      ) : null}

      <Slot id="media" index={2} meaningful>
        <TKImage src={media.src} alt={media.alt} fallbackLabel={media.fallbackLabel} ratio="16 / 9" radius="var(--tk-r3, 16px)" />
      </Slot>

      <Slot id="hero" index={3} meaningful>
        <div className="sc-promo">
          <strong className="sc-promo__title">{hero.title}</strong>
          <p className="sc-promo__text">{hero.text}</p>
        </div>
      </Slot>

      <Slot id="primaryMetric" index={4} meaningful>
        <TKStatTile
          label={primaryMetric.label}
          value={primaryMetric.value}
          delta={primaryMetric.delta}
          up={primaryMetric.up}
          bars={primaryMetric.bars}
        />
      </Slot>

      <Slot id="supportingList" index={5} meaningful>
        <TKListGroup title={supportingList.title}>
          {supportingList.rows.map((row) => (
            <TKCell key={row.id} icon={row.icon} title={row.title} subtitle={row.subtitle} value={row.value} />
          ))}
        </TKListGroup>
      </Slot>

        <Slot id="trustStrip" index={6} meaningful>
          <div className="sc-trust">
            <TKAvatarStack avatars={trustStrip.avatars} size={28} />
            <TKRating value={trustStrip.rating} readonly allowHalf />
            <TKBadge tone="accent" soft>
              {trustStrip.badge}
            </TKBadge>
          </div>
        </Slot>

        {belowContent}
      </div>

      {primaryAction ? (
        <div className="sc-slots__footer">
          <Slot id="primaryAction" index={7}>
            {primaryAction}
          </Slot>
        </div>
      ) : null}
    </div>
  );
}
