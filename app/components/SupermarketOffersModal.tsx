"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { Supermarket, Offer } from "../types";
import { getOffers } from "../utils/api";
import AddOfferModal from "./AddOfferModal";

interface SupermarketOffersModalProps {
  supermarket: Supermarket | null;
  onClose: () => void;
}

export default function SupermarketOffersModal({ supermarket, onClose }: SupermarketOffersModalProps) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  useEffect(() => {
    if (!supermarket) return;
    setLoading(true);
    setOffers([]);
    getOffers(supermarket.id)
      .then(setOffers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [supermarket]);

  if (!supermarket) return null;

  const handleOfferAdded = (offer: Offer) => {
    setOffers((prev) => [offer, ...prev]);
    setIsAddOpen(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-[1100] bg-gray-50 dark:bg-gray-950 flex flex-col">
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
              {supermarket.logo ? (
                <img src={supermarket.logo} alt={supermarket.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-base font-bold text-gray-400 dark:text-gray-500">
                  {supermarket.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">{supermarket.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors text-sm font-medium"
            aria-label="Volver"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
        </div>

        <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 w-full justify-center px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Agregar oferta
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
            </div>
          ) : offers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2 text-gray-400 dark:text-gray-600 text-center px-6">
              <p className="text-sm font-medium">No hay ofertas cargadas.</p>
              <p className="text-xs">Se el primero en agregar una!</p>
            </div>
          ) : (
            offers.map((offer) => (
              <div
                key={offer.id}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm"
              >
                {offer.photo && (
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}${offer.photo}`}
                    alt={offer.description}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-3 space-y-1.5">
                  <p className="text-sm font-medium text-gray-900 dark:text-white leading-snug">{offer.description}</p>
                  {offer.price && (
                    <span className="inline-block bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold px-2.5 py-1 rounded-full">
                      {offer.price}
                    </span>
                  )}
                  {offer.validUntil && (
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Hasta: {new Date(offer.validUntil).toLocaleDateString("es-AR")}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <AddOfferModal
        supermarketId={supermarket.id}
        supermarketName={supermarket.name}
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onOfferAdded={handleOfferAdded}
      />
    </>
  );
}
