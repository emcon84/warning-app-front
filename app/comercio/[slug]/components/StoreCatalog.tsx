"use client";

import { Pencil, ShoppingBag, Package } from "lucide-react";
import type { Comercio } from "@/types";
import type { ThemeClasses } from "./types";
import { StoreProductCard } from "./StoreProductCard";

interface Props {
  comercio: Comercio;
  theme: ThemeClasses;
  isOwner?: boolean;
  onManage: () => void;
}

export function StoreCatalog({ comercio, theme, isOwner, onManage }: Props) {
  const { isDark, textPrimary, textMuted, cardBg } = theme;
  const activeProductos = comercio.productos ?? [];

  if (activeProductos.length === 0 && !isOwner) return null;

  const cartComercio = {
    id: comercio.id,
    nombre: comercio.nombre,
    slug: comercio.slug,
    whatsapp: comercio.whatsapp,
    aceptaEnvios: comercio.aceptaEnvios ?? false,
    zonaEnvio: comercio.zonaEnvio ?? null,
    costoEnvio: comercio.costoEnvio ?? null,
  };

  return (
    <div className="mx-4 mt-4 mb-2">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className={`text-base font-bold ${textPrimary}`}>
            Catálogo
            {activeProductos.length > 0 && <span className={`ml-2 text-sm font-normal ${textMuted}`}>({activeProductos.length})</span>}
          </p>
          <p className={`text-xs mt-0.5 ${textMuted}`}>Consultá por precio o disponibilidad via WhatsApp</p>
        </div>
        {isOwner && (
          <button
            onClick={onManage}
            className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl border transition-colors ${isDark ? "border-gray-700 text-gray-400 hover:bg-gray-800" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
          >
            <Pencil className="w-3 h-3" /> Gestionar
          </button>
        )}
      </div>

      {comercio.aceptaEnvios && (
        <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-xl mb-3 ${isDark ? "bg-green-900/20 text-green-400" : "bg-green-50 text-green-700"}`}>
          <Package className="w-4 h-4 flex-shrink-0" />
          <span>
            Envios a domicilio
            {comercio.zonaEnvio ? ` · ${comercio.zonaEnvio}` : ""}
            {comercio.costoEnvio ? ` · ${comercio.costoEnvio}` : ""}
          </span>
        </div>
      )}

      {activeProductos.length === 0 ? (
        <div className={`py-8 text-center rounded-2xl border ${cardBg}`}>
          <ShoppingBag className={`w-8 h-8 mx-auto mb-2 ${textMuted}`} />
          <p className={`text-sm ${textMuted}`}>No hay items en el catálogo aun.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {activeProductos.map((p) => (
            <StoreProductCard
              key={p.id}
              producto={p}
              whatsapp={comercio.whatsapp}
              comercioNombre={comercio.nombre}
              comercioSlug={comercio.slug}
              cartComercio={cartComercio}
              theme={theme}
            />
          ))}
        </div>
      )}
    </div>
  );
}
