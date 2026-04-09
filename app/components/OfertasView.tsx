"use client";

import { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import { Supermarket } from "../types";
import { getSupermarkets } from "../utils/api";
import SupermarketOffersModal from "./SupermarketOffersModal";

interface OfertasViewProps {
  isVisible: boolean;
}

export default function OfertasView({ isVisible }: OfertasViewProps) {
  const [supermarkets, setSupermarkets] = useState<Supermarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSupermarket, setSelectedSupermarket] = useState<Supermarket | null>(null);

  useEffect(() => {
    if (!isVisible) return;
    setLoading(true);
    getSupermarkets()
      .then(setSupermarkets)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[900] bg-gray-50 dark:bg-gray-950 flex flex-col" style={{ top: 60 }}>
      <div className="flex-shrink-0 px-4 pt-4 pb-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Ofertas del día</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Reconquista</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
          </div>
        ) : supermarkets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3 text-gray-400 dark:text-gray-600">
            <ShoppingCart className="w-12 h-12" />
            <p className="text-sm font-medium">Próximamente...</p>
            <p className="text-xs text-center">Los supermercados locales agregarán sus ofertas aquí.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {supermarkets.map((supermarket) => (
              <button
                key={supermarket.id}
                onClick={() => setSelectedSupermarket(supermarket)}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm text-left flex flex-col items-center gap-3 hover:border-green-400 dark:hover:border-green-600 transition-colors active:scale-95"
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                  {supermarket.logo ? (
                    <img
                      src={supermarket.logo}
                      alt={supermarket.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-gray-400 dark:text-gray-500">
                      {supermarket.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{supermarket.name}</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">Ver ofertas →</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <SupermarketOffersModal
        supermarket={selectedSupermarket}
        onClose={() => setSelectedSupermarket(null)}
      />
    </div>
  );
}
