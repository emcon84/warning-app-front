"use client";

import { Plus, Tag } from "lucide-react";
import type { ComercioOffer } from "@/types";
import { StoreOfferRow } from "./StoreOfferRow";

interface Props {
  offers: ComercioOffer[];
  isDark: boolean;
  cardBg: string;
  textPri: string;
  textSec: string;
  textMuted: string;
  onAddClick: () => void;
  onEditClick: (offer: ComercioOffer) => void;
  onToggle: (offer: ComercioOffer) => void;
  onDelete: (id: string) => void;
}

export function StoreOffersTab({
  offers, isDark, cardBg, textPri, textSec, textMuted,
  onAddClick, onEditClick, onToggle, onDelete,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={onAddClick}
        className="w-full py-3 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm bg-white text-gray-900 hover:bg-gray-100 transition-colors"
      >
        <Plus className="w-4 h-4" /> Nueva oferta
      </button>

      {offers.length === 0 ? (
        <div className={`py-12 text-center rounded-2xl border ${cardBg}`}>
          <Tag className={`w-8 h-8 mx-auto mb-3 ${textMuted}`} />
          <p className={`text-sm ${textMuted}`}>No hay ofertas cargadas aun.</p>
          <p className={`text-xs mt-1 ${isDark ? "text-gray-700" : "text-gray-300"}`}>Crea tu primera oferta con el boton de arriba.</p>
        </div>
      ) : (
        offers.map((offer) => (
          <StoreOfferRow
            key={offer.id}
            offer={offer}
            isDark={isDark}
            cardBg={cardBg}
            textPri={textPri}
            textSec={textSec}
            textMuted={textMuted}
            onToggle={() => onToggle(offer)}
            onDelete={() => onDelete(offer.id)}
            onEdit={() => onEditClick(offer)}
          />
        ))
      )}
    </div>
  );
}
