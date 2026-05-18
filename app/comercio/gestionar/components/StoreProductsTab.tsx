"use client";

import { Plus, ShoppingBag } from "lucide-react";
import type { Producto } from "../../../types";
import { StoreProductRow } from "./StoreProductRow";

interface Props {
  productos: Producto[];
  slug: string;
  isPremium: boolean;
  isDark: boolean;
  cardBg: string;
  textPri: string;
  textSec: string;
  textMuted: string;
  onAddClick: () => void;
  onEditClick: (producto: Producto) => void;
  onToggle: (producto: Producto) => void;
  onDelete: (id: string) => void;
}

export function StoreProductsTab({
  productos, slug, isPremium, isDark, cardBg, textPri, textSec, textMuted,
  onAddClick, onEditClick, onToggle, onDelete,
}: Props) {
  const atLimit = !isPremium && productos.length >= 10;

  return (
    <div className="flex flex-col gap-3">
      {atLimit ? (
        <div className={`rounded-2xl border p-4 flex flex-col gap-2 ${isDark ? "bg-yellow-900/10 border-yellow-800/40" : "bg-yellow-50 border-yellow-200"}`}>
          <p className={`text-sm font-bold ${isDark ? "text-yellow-400" : "text-yellow-700"}`}>★ Límite del plan gratuito alcanzado</p>
          <p className={`text-xs ${isDark ? "text-yellow-600" : "text-yellow-600"}`}>Tenés 10 items en tu catálogo. Pasate al plan Premium para agregar más.</p>
          <a
            href={`https://wa.me/3482445015?text=${encodeURIComponent("Hola! Quiero activar el plan Premium para mi comercio en Reportes Reconquista.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 py-2.5 rounded-xl text-sm font-semibold bg-yellow-500 hover:bg-yellow-400 text-gray-900 text-center transition-colors"
          >
            Consultar plan Premium
          </a>
        </div>
      ) : (
        <button
          onClick={onAddClick}
          className="w-full py-3 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm bg-white text-gray-900 hover:bg-gray-100 transition-colors"
        >
          <Plus className="w-4 h-4" /> Agregar al catálogo
        </button>
      )}

      {productos.length === 0 ? (
        <div className={`py-12 text-center rounded-2xl border ${cardBg}`}>
          <ShoppingBag className={`w-8 h-8 mx-auto mb-3 ${textMuted}`} />
          <p className={`text-sm ${textMuted}`}>No hay items en el catálogo aun.</p>
          <p className={`text-xs mt-1 ${isDark ? "text-gray-700" : "text-gray-300"}`}>Agregá productos o servicios con el boton de arriba.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {productos.map((p) => (
            <StoreProductRow
              key={p.id}
              producto={p}
              slug={slug}
              isDark={isDark}
              cardBg={cardBg}
              textPri={textPri}
              textSec={textSec}
              textMuted={textMuted}
              onToggle={() => onToggle(p)}
              onDelete={() => onDelete(p.id)}
              onEdit={() => onEditClick(p)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
