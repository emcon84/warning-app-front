"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Store, ShoppingCart } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { resolvePhotoUrl } from "../../lib/utils/photo";

import { API_URL } from "../../lib/api/client";

interface RecentProduct {
  id: string;
  nombre: string;
  tipo: string;
  precio?: string;
  foto?: string;
  comercio: { nombre: string; slug: string; logo?: string; foto?: string };
}

export function HomeRecentProducts() {
  const { isDark } = useTheme();
  const [products, setProducts] = useState<RecentProduct[]>([]);

  const cardBg = isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";

  useEffect(() => {
    fetch(`${API_URL}/api/productos/recientes?limit=16`)
      .then(r => r.json())
      .then(d => Array.isArray(d) && setProducts(d))
      .catch(() => {});
  }, []);

  if (products.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15, ease: "easeOut" }}
      className="mb-8"
    >
      <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
        Novedades
      </p>
      <div className="-mx-4 px-4 overflow-x-auto scrollbar-hide">
        <div className="flex gap-3 pb-1" style={{ width: "max-content" }}>

          <Link
            href="/para-comercios"
            className="flex-shrink-0 w-44 rounded-2xl overflow-hidden relative shadow-lg"
            style={{ height: 180 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600" />
            <div className="absolute inset-0 flex flex-col justify-between p-4">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-black text-sm leading-tight">¿Tenés un comercio?</p>
                <p className="text-white/80 text-[10px] mt-1 leading-snug">Mostralo en Reconquista. Gratis.</p>
                <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-white bg-white/20 px-2 py-1 rounded-full">
                  Registrate →
                </span>
              </div>
            </div>
          </Link>

          {products.map((p) => {
            const fotoSrc = p.foto ? resolvePhotoUrl(p.foto) : null;
            const logoRaw = p.comercio.logo || p.comercio.foto;
            const logoSrc = logoRaw ? resolvePhotoUrl(logoRaw) : null;
            return (
              <Link
                key={p.id}
                href={`/comercio/${p.comercio.slug}`}
                className={`flex-shrink-0 w-36 rounded-2xl border overflow-hidden flex flex-col transition-transform active:scale-[0.97] hover:scale-[1.02] ${cardBg}`}
                style={{ height: 180 }}
              >
                <div className={`w-full flex-1 relative flex items-center justify-center ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
                  {fotoSrc ? (
                    <Image src={fotoSrc} alt={p.nombre} fill className="object-cover" unoptimized />
                  ) : (
                    <ShoppingCart className={`w-7 h-7 ${isDark ? "text-gray-600" : "text-gray-300"}`} />
                  )}
                </div>
                <div className="p-2.5 flex-shrink-0">
                  <p className={`text-[11px] font-bold line-clamp-2 leading-snug ${isDark ? "text-white" : "text-gray-900"}`}>{p.nombre}</p>
                  {p.precio && <p className="text-[11px] font-black text-green-500 mt-0.5">{p.precio}</p>}
                  <div className="flex items-center gap-1 mt-1.5">
                    {logoSrc ? (
                      <div className="relative w-3.5 h-3.5 rounded-full overflow-hidden flex-shrink-0">
                        <Image src={logoSrc} alt="" fill className="object-cover" unoptimized />
                      </div>
                    ) : (
                      <div className={`w-3.5 h-3.5 rounded-full flex-shrink-0 flex items-center justify-center text-[7px] font-black ${isDark ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-600"}`}>
                        {p.comercio.nombre[0]}
                      </div>
                    )}
                    <p className={`text-[9px] truncate ${isDark ? "text-gray-500" : "text-gray-400"}`}>{p.comercio.nombre}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
