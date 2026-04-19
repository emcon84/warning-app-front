"use client";

import { useState, useMemo, useEffect, useRef, useCallback, Fragment } from "react";
import { useRouter } from "next/navigation";
import { Comercio } from "../types";
import Navbar from "../components/Navbar";
import { useTheme } from "../contexts/ThemeContext";
import { Store, MapPin, Search, X, ChevronRight, Plus, Tag } from "lucide-react";

interface Props { comercios: Comercio[] }

const PAGE_SIZE = 20;

export default function ComerciosClient({ comercios }: Props) {
  const router = useRouter();
  const { isDark } = useTheme();
  const [search, setSearch] = useState("");
  const [selectedRubro, setSelectedRubro] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const bg          = isDark ? "bg-gray-950" : "bg-gray-50";
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textSec     = isDark ? "text-gray-400" : "text-gray-500";
  const textMuted   = isDark ? "text-gray-500" : "text-gray-400";
  const cardBg      = isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";
  const inputCls    = isDark
    ? "bg-gray-900 border-gray-700 text-white placeholder-gray-600"
    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400";
  const pillActive   = "bg-blue-600 text-white border-blue-600";
  const pillInactive = isDark
    ? "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500"
    : "bg-white border-gray-200 text-gray-600 hover:border-gray-400";

  const rubros = useMemo(() => {
    const set = new Set<string>();
    comercios.forEach((c) => c.rubro && set.add(c.rubro));
    return [...set].sort();
  }, [comercios]);

  const filtered = useMemo(() => {
    return comercios.filter((c) => {
      if (!c.activo) return false;
      if (selectedRubro && c.rubro !== selectedRubro) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          c.nombre.toLowerCase().includes(q) ||
          c.rubro.toLowerCase().includes(q) ||
          (c.barrio?.toLowerCase().includes(q) ?? false) ||
          (c.descripcion?.toLowerCase().includes(q) ?? false)
        );
      }
      return true;
    });
  }, [comercios, selectedRubro, search]);

  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [selectedRubro, search]);

  const loadMore = useCallback(() => {
    setVisibleCount((v) => Math.min(v + PAGE_SIZE, filtered.length));
  }, [filtered.length]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  function photoUrl(url?: string | null) {
    if (!url) return null;
    return url.startsWith("/uploads/") ? `${API_URL}${url}` : url;
  }

  return (
    <div className={`min-h-screen ${bg} ${textPrimary}`}>
      <Navbar sidebarDisabled />

      <div className="max-w-xl mx-auto px-4 pt-20 pb-32">

        {/* Header */}
        <div className="mb-4 mt-2">
          <p className={`text-sm ${textMuted}`}>
            {filtered.length} comercios disponibles
          </p>
        </div>

        {/* Buscador */}
        <div className="relative mb-4">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textMuted}`} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar panaderia, ferreteria, ropa..."
            className={`w-full pl-9 pr-9 py-2.5 rounded-xl border text-sm focus:outline-none ${inputCls}`}
          />
          {search && (
            <button onClick={() => setSearch("")} className={`absolute right-3 top-1/2 -translate-y-1/2 ${textMuted}`}>
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Rubros */}
        {rubros.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {rubros.slice(0, 20).map((rubro) => (
              <button
                key={rubro}
                onClick={() => setSelectedRubro(selectedRubro === rubro ? null : rubro)}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium capitalize transition-colors ${
                  selectedRubro === rubro ? pillActive : pillInactive
                }`}
              >
                {rubro}
              </button>
            ))}
          </div>
        )}

        {/* Lista */}
        {filtered.length === 0 ? (
          <div className={`py-16 text-center rounded-2xl border ${cardBg}`}>
            <Store className={`w-10 h-10 mx-auto mb-3 ${textMuted}`} />
            <p className={`text-sm ${textSec}`}>No se encontraron comercios</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {visible.map((comercio) => {
              const photo = photoUrl(comercio.logo || comercio.foto);
              return (
                <button
                  key={comercio.id}
                  onClick={() => router.push(`/comercio/${comercio.slug}`)}
                  className={`w-full text-left p-4 rounded-2xl border transition-colors ${cardBg} ${
                    isDark ? "hover:border-gray-700" : "hover:border-gray-300"
                  } active:scale-[0.99]`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 ${
                      isDark ? "bg-gray-800" : "bg-gray-100"
                    }`}>
                      {photo ? (
                        <img src={photo} alt={comercio.nombre} className="w-full h-full object-cover" />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center text-lg font-bold ${textMuted}`}>
                          {comercio.nombre[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-sm truncate ${textPrimary}`}>
                        {comercio.nombre}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Tag className={`w-3 h-3 flex-shrink-0 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
                        <p className={`text-xs capitalize truncate ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                          {comercio.rubro}
                        </p>
                      </div>
                      {comercio.barrio && (
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className={`w-3 h-3 ${textMuted}`} />
                          <span className={`text-xs ${textSec}`}>{comercio.barrio}</span>
                        </div>
                      )}
                    </div>
                    <ChevronRight className={`w-4 h-4 flex-shrink-0 ${textMuted}`} />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {hasMore && (
          <div ref={sentinelRef} className="flex justify-center py-6">
            <div className={`w-6 h-6 rounded-full border-2 border-t-transparent animate-spin ${isDark ? "border-gray-600" : "border-gray-300"}`} />
          </div>
        )}

        {/* FAB: registrar comercio */}
        <button
          onClick={() => router.push("/comercio/nuevo")}
          className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center hover:bg-blue-500 transition-colors z-30"
          title="Registrar mi comercio"
        >
          <Plus className="w-6 h-6" />
        </button>

      </div>
    </div>
  );
}
