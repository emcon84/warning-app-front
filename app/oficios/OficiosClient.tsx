"use client";

import { useState, useMemo, useEffect, useRef, useCallback, Fragment } from "react";
import { useRouter } from "next/navigation";
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

interface Props { professionals: Professional[]; }

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

export default function OficiosClient({ professionals }: Props) {
  const router = useRouter();
  const { isDark } = useTheme();
  const [tab, setTab] = useState<"oficio" | "profesion">("oficio");
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
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
      tab === "oficio" ? (p.tipo === "oficio" || p.tipo == null) : p.tipo === "profesion"
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

  useEffect(() => { setVisibleCount(PAGE_SIZE); setSelectedTag(null); setSearch(""); }, [tab]);
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
      <Navbar sidebarDisabled />

      <div className="max-w-xl mx-auto px-4 pt-20 pb-32">

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

        {/* Header */}
        <div className="mb-4">
          <p className={`text-sm ${textMuted}`}>
            {filtered.length} {tab === "oficio" ? "oficios" : "profesionales"} disponibles
          </p>
        </div>

        {/* Buscador */}
        <div className="relative mb-4">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textMuted}`} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tab === "oficio" ? "Buscar plomero, electricista..." : "Buscar abogado, contador..."}
            className={`w-full pl-9 pr-9 py-2.5 rounded-xl border text-sm focus:outline-none ${inputCls}`}
          />
          {search && (
            <button onClick={() => setSearch("")} className={`absolute right-3 top-1/2 -translate-y-1/2 ${textMuted}`}>
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tags */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
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
          <div className="flex flex-col gap-3">
            {visible.map((pro) => {
              const photo = photoUrl(pro.foto);
              return (
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
