"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { UtensilsCrossed, ExternalLink } from "lucide-react";
import { API_URL } from "@/lib/api/client";
import { resolvePhotoUrl } from "@/lib/utils/photo";

interface BarraProduct {
  id:          string;
  nombre:      string;
  descripcion: string | null;
  precio:      string;
  foto:        string | null;
  disponible:  boolean;
}

interface Props {
  slug:   string;
  isDark: boolean;
}

function detectEmoji(nombre: string): string | null {
  const n = nombre.toLowerCase();
  if (/cerveza|birra|beer|chopp|lager|stout/.test(n))             return "🍺";
  if (/fernet|aperol|campari|bitter/.test(n))                     return "🥃";
  if (/gin|vodka|whisky|whiskey|ron|tequila|vino|espumante|champag|prosecco/.test(n)) return "🥂";
  if (/agua|gaseosa|jugo|coca|pepsi|sprite|seven|fanta|limonada|bebida|refresco/.test(n)) return "🥤";
  if (/choripan|chori/.test(n))                                   return "🌭";
  if (/sandwich|sangwich|pancho|lomito/.test(n))                  return "🥪";
  if (/hamburguesa|burger|burguer/.test(n))                       return "🍔";
  if (/pizza/.test(n))                                            return "🍕";
  if (/empanada/.test(n))                                         return "🥟";
  if (/papa|fritas/.test(n))                                      return "🍟";
  if (/helado/.test(n))                                           return "🍦";
  if (/cafe|coffee|capuccino|cortado/.test(n))                    return "☕";
  if (/combo|menu|paquete/.test(n))                               return "🍽️";
  return null;
}

export function EventoBarraMenu({ slug, isDark }: Props) {
  const [productos, setProductos] = useState<BarraProduct[]>([]);
  const [mpAlias,   setMpAlias]   = useState<string | null>(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/eventos/${slug}/barra`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        setProductos(data.productos ?? []);
        setMpAlias(data.mpAlias ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return null;
  if (productos.length === 0) return null;

  const card    = isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";
  const divider = isDark ? "border-gray-800" : "border-gray-100";
  const textPri = isDark ? "text-white" : "text-gray-900";
  const textMut = isDark ? "text-gray-400" : "text-gray-500";

  return (
    <div className={`rounded-2xl border overflow-hidden ${card}`}>

      {/* Header */}
      <div className={`px-5 pt-4 pb-3 border-b ${divider} flex items-center gap-2`}>
        <UtensilsCrossed className="w-4 h-4 text-indigo-400" />
        <h2 className={`text-sm font-bold ${textPri}`}>Menú de la barra</h2>
        <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${isDark ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"}`}>
          {productos.length} {productos.length === 1 ? "producto" : "productos"}
        </span>
      </div>

      {/* Products */}
      <div className="divide-y divide-gray-800/50">
        {productos.map((p, i) => (
          <div
            key={p.id}
            className={`flex items-center gap-4 px-4 py-3.5 transition-opacity ${
              !p.disponible ? "opacity-50" : ""
            } ${i === 0 ? "" : isDark ? "border-gray-800" : "border-gray-100"}`}
          >
            {/* Foto o emoji detectado */}
            {p.foto ? (
              <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                <Image
                  src={resolvePhotoUrl(p.foto)}
                  alt={p.nombre}
                  width={48}
                  height={48}
                  className="object-cover w-full h-full"
                />
              </div>
            ) : detectEmoji(p.nombre) ? (
              <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-xl ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
                {detectEmoji(p.nombre)}
              </div>
            ) : null}

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className={`text-sm font-bold truncate ${textPri}`}>{p.nombre}</p>
                {!p.disponible && (
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md flex-shrink-0 ${isDark ? "bg-gray-700 text-gray-500" : "bg-gray-200 text-gray-400"}`}>
                    Agotado
                  </span>
                )}
              </div>
              {p.descripcion && (
                <p className={`text-xs mt-0.5 truncate ${textMut}`}>{p.descripcion}</p>
              )}
            </div>

            {/* Precio */}
            <div className={`flex-shrink-0 text-right`}>
              <span className={`text-lg font-black tabular-nums ${
                p.disponible
                  ? isDark ? "text-green-400" : "text-green-600"
                  : textMut
              }`}>
                {p.precio}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* MP Button */}
      {mpAlias && (
        <div className={`p-4 border-t ${divider}`}>
          <a
            href={`https://link.mercadopago.com.ar/${mpAlias}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-[#009ee3] hover:bg-[#008dcf] text-white font-bold text-sm transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Pagar con Mercado Pago
          </a>
        </div>
      )}
    </div>
  );
}
