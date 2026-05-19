"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { UtensilsCrossed, Loader2, ExternalLink } from "lucide-react";
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
  const textPri = isDark ? "text-white" : "text-gray-900";
  const textMut = isDark ? "text-gray-400" : "text-gray-500";

  return (
    <div className={`rounded-2xl border ${card}`}>
      <div className={`px-5 pt-5 pb-3 border-b ${isDark ? "border-gray-800" : "border-gray-100"} flex items-center gap-2`}>
        <UtensilsCrossed className="w-4 h-4 text-indigo-400" />
        <h2 className={`text-sm font-bold ${textPri}`}>Menú de la barra</h2>
      </div>

      <div className="p-4 space-y-2">
        {productos.map(p => (
          <div
            key={p.id}
            className={`flex items-center gap-3 p-3 rounded-xl ${
              p.disponible
                ? isDark ? "bg-gray-800" : "bg-gray-50"
                : isDark ? "bg-gray-800/40 opacity-60" : "bg-gray-50/60 opacity-60"
            }`}
          >
            {p.foto ? (
              <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                <Image
                  src={resolvePhotoUrl(p.foto)}
                  alt={p.nombre}
                  width={56}
                  height={56}
                  className="object-cover w-full h-full"
                />
              </div>
            ) : (
              <div className={`w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl ${isDark ? "bg-gray-700" : "bg-gray-200"}`}>
                🍺
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className={`text-sm font-bold ${textPri}`}>{p.nombre}</p>
                {!p.disponible && (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isDark ? "bg-gray-700 text-gray-400" : "bg-gray-200 text-gray-500"}`}>
                    Agotado
                  </span>
                )}
              </div>
              {p.descripcion && (
                <p className={`text-xs mt-0.5 line-clamp-1 ${textMut}`}>{p.descripcion}</p>
              )}
              <p className={`text-sm font-black mt-0.5 ${isDark ? "text-green-400" : "text-green-600"}`}>{p.precio}</p>
            </div>
          </div>
        ))}
      </div>

      {mpAlias && (
        <div className={`px-4 pb-4`}>
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
