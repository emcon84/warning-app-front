"use client";

import type { ComercioOffer } from "@/types";
import type { ThemeClasses } from "./types";
import { StoreOfferCard } from "./StoreOfferCard";

interface Props {
  offers: ComercioOffer[];
  whatsapp: string;
  theme: ThemeClasses;
  isOwner?: boolean;
  comercioNombre: string;
  comercioLogo?: string;
  comercioSlug: string;
  onEdit: () => void;
}

export function StoreOffers({ offers, whatsapp, theme, isOwner, comercioNombre, comercioLogo, comercioSlug, onEdit }: Props) {
  const { textPrimary, textMuted, cardBg } = theme;

  return (
    <div className="mx-4 mt-4 mb-4">
      <div className="mb-3">
        <p className={`text-base font-bold ${textPrimary}`}>
          Ofertas activas
          {offers.length > 0 && (
            <span className={`ml-2 text-sm font-normal ${textMuted}`}>({offers.length})</span>
          )}
        </p>
        <p className={`text-xs mt-0.5 ${textMuted}`}>Productos y promociones disponibles ahora</p>
      </div>

      {offers.length === 0 ? (
        <div className={`py-8 text-center rounded-2xl border ${cardBg}`}>
          <p className={`text-sm ${textMuted}`}>No hay ofertas activas por ahora.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {offers.map((offer) => (
            <StoreOfferCard
              key={offer.id}
              offer={offer}
              whatsapp={whatsapp}
              theme={theme}
              comercioNombre={comercioNombre}
              comercioLogo={comercioLogo}
              comercioSlug={comercioSlug}
              isOwner={isOwner}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
}
