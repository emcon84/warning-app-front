"use client";

import { useState, useMemo, useEffect, useRef, useCallback, Fragment } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Professional } from "../types";
import Navbar from "../components/Navbar";
import { useTheme } from "../contexts/ThemeContext";
import { Wrench, GraduationCap, MapPin, Star, Search, X, ChevronRight, Plus } from "lucide-react";

const TAGS_OFICIO = [
  "plomero", "electricista", "albañil", "pintor", "gasista", "jardinero",
  "herrero", "carpintero", "climatización", "cerrajero", "techista", "soldador",
  "fumigador", "limpieza", "flete", "mecánico", "yesero", "instalador",
];

const TAGS_PROFESION = [
  "desarrollador de software", "contador", "abogado", "arquitecto", "ingeniero",
  "diseñador gráfico", "marketing digital", "administración", "docente",
  "psicólogo", "community manager", "analista de datos", "traductor",
  "consultor", "escribano",
];

interface Props {
  professionals: Professional[];
  initialCategoria?: string | null;
  initialTipo?: string | null;
}

const PAGE_SIZE = 20;

function StarRow({ score, count }: { score: number; count: number }) {
  return (
    <div className="flex items-center gap-1">
      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
      <span className="text-xs text-yellow-400">{score.toFixed(1)}</span>
      {count > 0 && <span className="text-xs text-gray-500">({count})</span>}
    </div>
  );
}

export default function OficiosClient({ professionals, initialCategoria, initialTipo }: Props) {
  const router = useRouter();
  const { isDark } = useTheme();
  
  // Initialize tab from URL params (default to "oficio")
  const [tab, setTab] = useState<"oficio" | "profesion">(initialTipo === "profesion" ? "profesion" : "oficio");
  // Initialize selected tag from URL params
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(initialCategoria || null);
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

  const byTab = useMemo(() =>
    professionals.filter((p) =>
      tab === "oficio" ? p.tipo === "oficio" : p.tipo === "profesion"
    ), [professionals, tab]
  );

  const allTags = useMemo(() => {
    const predefined = tab === "oficio" ? TAGS_OFICIO : TAGS_PROFESION;
    const fromData = new Set<string>();
    byTab.forEach((p) => p.oficios.forEach((o) => fromData.add(o.toLowerCase())));
    // predefined first, then any extra from data not already in the list
    const extra = [...fromData].filter((t) => !predefined.includes(t)).sort();
    return [...predefined, ...extra];
  }, [byTab, tab]);

  const filtered = useMemo(() => {
    return byTab.filter((p) => {
      if (!p.disponible) return false;
      if (selectedTag && !p.oficios.map((o) => o.toLowerCase()).includes(selectedTag)) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          p.nombre.toLowerCase().includes(q) ||
          p.apellido.toLowerCase().includes(q) ||
          p.oficios.some((o) => o.toLowerCase().includes(q)) ||
          p.barrio.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [byTab, selectedTag, search]);

  const featured = useMemo(
    () => byTab.filter((p) => p.disponible).slice(0, 8),
    [byTab]
  );

  // Only reset when tab changes AND the current tag is not valid for the new tab
  useEffect(() => { 
    setVisibleCount(PAGE_SIZE); 
    // Check if current tag is valid for the new tab
    const currentTags = tab === "oficio" ? TAGS_OFICIO : TAGS_PROFESION;
    if (selectedTag && !currentTags.includes(selectedTag)) {
      setSelectedTag(null);
      setSearch("");
    }
  }, [tab]);
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [selectedTag, search]);

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
      <Navbar />

      <div className="max-w-xl md:max-w-5xl mx-auto px-4 md:px-8 pt-20 pb-32">

        {/* Buscador */}
        <div className="relative mb-5 mt-2 md:max-w-2xl md:mx-auto">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${textMuted}`} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tab === "oficio" ? "Buscar plomero, electricista..." : "Buscar abogado, contador..."}
            className={`w-full pl-11 pr-11 py-3 rounded-full border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${inputCls}`}
          />
          {search && (
            <button onClick={() => setSearch("")} className={`absolute right-4 top-1/2 -translate-y-1/2 ${textMuted}`}>
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sub-tabs */}
        <div className={`flex p-1 rounded-2xl mb-5 mt-2 ${isDark ? "bg-gray-900 border border-gray-800" : "bg-gray-100"}`}>
          {([
            { key: "oficio",   label: "Oficios",       Icon: Wrench },
            { key: "profesion", label: "Profesionales", Icon: GraduationCap },
          ] as const).map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === key
                  ? isDark ? "bg-white text-gray-900 shadow" : "bg-white text-gray-900 shadow"
                  : isDark ? "text-gray-500" : "text-gray-500"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Destacados */}
        {!search.trim() && !selectedTag && featured.length > 0 && (
          <div className="mb-6">
            <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${textMuted}`}>
              Destacados
            </p>
            {/* Mobile: scroll horizontal */}
            <div className="md:hidden overflow-x-auto -mx-4 px-4 scrollbar-hide py-1">
              <div className="flex gap-4 pb-1" style={{ width: "max-content" }}>
                {featured.map((pro) => {
                  const photo = photoUrl(pro.foto);
                  return (
                    <Link
                      key={pro.id}
                      href={`/profesional/${pro.slug}`}
                      className="flex flex-col items-center gap-1.5 w-20 group"
                    >
                      <div className={`w-14 h-14 rounded-full overflow-hidden ring-2 transition-all ${
                        isDark
                          ? "ring-gray-800 group-hover:ring-gray-600"
                          : "ring-gray-200 group-hover:ring-gray-400 shadow-sm"
                      }`}>
                        {photo ? (
                          <img src={photo} alt={pro.nombre} className="w-full h-full object-cover" />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center text-lg font-bold ${
                            isDark ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"
                          }`}>
                            {pro.nombre[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <p className={`text-xs font-semibold truncate w-full text-center ${textPrimary}`}>
                        {pro.nombre}
                      </p>
                      <p className={`text-[10px] capitalize truncate w-full text-center ${textMuted}`}>
                        {pro.oficios[0]}
                      </p>
                      {pro.ratingCount > 0 && (
                        <div className="flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                          <span className="text-[10px] text-yellow-400">{pro.ratingAvg.toFixed(1)}</span>
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
            {/* Desktop: grid */}
            <div className="hidden md:grid md:grid-cols-6 lg:grid-cols-8 gap-4 py-1">
              {featured.map((pro) => {
                const photo = photoUrl(pro.foto);
                return (
                  <Link
                    key={pro.id}
                    href={`/profesional/${pro.slug}`}
                    className="flex flex-col items-center gap-1.5 w-20 group"
                  >
                    <div className={`w-14 h-14 rounded-full overflow-hidden ring-2 transition-all ${
                      isDark
                        ? "ring-gray-800 group-hover:ring-gray-600"
                        : "ring-gray-200 group-hover:ring-gray-400 shadow-sm"
                    }`}>
                      {photo ? (
                        <img src={photo} alt={pro.nombre} className="w-full h-full object-cover" />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center text-lg font-bold ${
                          isDark ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"
                        }`}>
                          {pro.nombre[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <p className={`text-xs font-semibold truncate w-full text-center ${textPrimary}`}>
                      {pro.nombre}
                    </p>
                    <p className={`text-[10px] capitalize truncate w-full text-center ${textMuted}`}>
                      {pro.oficios[0]}
                    </p>
                    {pro.ratingCount > 0 && (
                      <div className="flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                        <span className="text-[10px] text-yellow-400">{pro.ratingAvg.toFixed(1)}</span>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-4">
          <p className={`text-sm ${textMuted}`}>
            {filtered.length} {tab === "oficio" ? "oficios" : "profesionales"} disponibles
          </p>
        </div>

        {/* Tags */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5 md:max-w-4xl md:mx-auto">
            {allTags.slice(0, 20).map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium capitalize transition-colors ${
                  selectedTag === tag ? pillActive : pillInactive
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Lista */}
        {filtered.length === 0 ? (
          <div className={`py-16 text-center rounded-2xl border ${cardBg}`}>
            <Wrench className={`w-10 h-10 mx-auto mb-3 ${textMuted}`} />
            <p className={`text-sm ${textSec}`}>No se encontraron resultados</p>
          </div>
        ) : (
          <div className="flex flex-col md:grid md:grid-cols-2 gap-3">
            {visible.map((pro, index) => {
              const photo = photoUrl(pro.foto);
              return (
                <motion.div
                  key={pro.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: index * 0.04, ease: "easeOut" }}
                >
                <button
                  key={pro.id}
                  onClick={() => router.push(`/profesional/${pro.slug}`)}
                  className={`w-full text-left p-4 rounded-2xl border transition-colors ${cardBg} ${
                    isDark ? "hover:border-gray-700" : "hover:border-gray-300"
                  } active:scale-[0.99]`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 ${
                      isDark ? "bg-gray-800" : "bg-gray-100"
                    }`}>
                      {photo ? (
                        <img src={photo} alt={pro.nombre} className="w-full h-full object-cover" />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center text-lg font-bold ${textMuted}`}>
                          {pro.nombre[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-sm truncate ${textPrimary}`}>
                        {pro.nombre} {pro.apellido}
                      </p>
                      <p className={`text-xs capitalize truncate ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                        {pro.oficios.slice(0, 2).join(", ")}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1">
                          <MapPin className={`w-3 h-3 ${textMuted}`} />
                          <span className={`text-xs ${textSec}`}>{pro.barrio}</span>
                        </div>
                        {pro.ratingCount > 0 && (
                          <StarRow score={pro.ratingAvg} count={pro.ratingCount} />
                        )}
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 flex-shrink-0 ${textMuted}`} />
                  </div>
                </button>
                </motion.div>
              );
            })}
          </div>
        )}

        {hasMore && (
          <div ref={sentinelRef} className="flex justify-center py-6">
            <div className={`w-6 h-6 rounded-full border-2 border-t-transparent animate-spin ${isDark ? "border-gray-600" : "border-gray-300"}`} />
          </div>
        )}

        {/* FAB: publicar */}
        <button
          onClick={() => router.push("/profesional/nuevo")}
          className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center hover:bg-blue-500 transition-colors z-30"
          title="Publicar mi perfil"
        >
          <Plus className="w-6 h-6" />
        </button>

      </div>
    </div>
  );
}
