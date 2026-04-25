"use client";

import { useState, useMemo, useEffect, useRef, useCallback, Fragment } from "react";
import { useRouter } from "next/navigation";
import { Empleado, Vacante } from "../types";
import Navbar from "../components/Navbar";
import { useTheme } from "../contexts/ThemeContext";
import { UserCheck, Briefcase, MapPin, Search, X, ChevronRight, Plus, Tag, Clock } from "lucide-react";

interface Props { empleados: Empleado[]; vacantes: Vacante[] }

const PAGE_SIZE = 20;

export default function EmpleosClient({ empleados, vacantes }: Props) {
  const router = useRouter();
  const { isDark } = useTheme();
  const [tab, setTab] = useState<"empleados" | "vacantes">("vacantes");
  const [search, setSearch] = useState("");
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

  const filteredEmpleados = useMemo(() => {
    return empleados.filter((e) => {
      if (!e.disponible || !e.activo) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        e.nombre.toLowerCase().includes(q) ||
        e.apellido.toLowerCase().includes(q) ||
        e.habilidades.some((h) => h.toLowerCase().includes(q)) ||
        (e.barrio?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [empleados, search]);

  const filteredVacantes = useMemo(() => {
    return vacantes.filter((v) => {
      if (!v.activa) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        v.titulo.toLowerCase().includes(q) ||
        v.descripcion.toLowerCase().includes(q) ||
        v.comercio.nombre.toLowerCase().includes(q) ||
        v.habilidades.some((h) => h.toLowerCase().includes(q)) ||
        (v.barrio?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [vacantes, search]);

  const filtered = tab === "empleados" ? filteredEmpleados : filteredVacantes;

  useEffect(() => { setVisibleCount(PAGE_SIZE); setSearch(""); }, [tab]);
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [search]);

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

        {/* Sub-tabs */}
        <div className={`flex p-1 rounded-2xl mb-5 mt-2 ${isDark ? "bg-gray-900 border border-gray-800" : "bg-gray-100"}`}>
          {([
            { key: "vacantes",  label: "Empleos",  Icon: Briefcase  },
            { key: "empleados", label: "Busco trabajo", Icon: UserCheck },
          ] as const).map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === key
                  ? "bg-white text-gray-900 shadow"
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
            {filtered.length} {tab === "vacantes" ? "empleos disponibles" : "perfiles buscando trabajo"}
          </p>
        </div>

        {/* Buscador */}
        <div className="relative mb-5 md:max-w-2xl md:mx-auto">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textMuted}`} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tab === "vacantes" ? "Buscar puesto, empresa, habilidad..." : "Buscar nombre, habilidad, barrio..."}
            className={`w-full pl-9 pr-9 py-2.5 rounded-xl border text-sm focus:outline-none ${inputCls}`}
          />
          {search && (
            <button onClick={() => setSearch("")} className={`absolute right-3 top-1/2 -translate-y-1/2 ${textMuted}`}>
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Lista */}
        {filtered.length === 0 ? (
          <div className={`py-16 text-center rounded-2xl border ${cardBg}`}>
            <Briefcase className={`w-10 h-10 mx-auto mb-3 ${textMuted}`} />
            <p className={`text-sm ${textSec}`}>No se encontraron resultados</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {tab === "vacantes"
              ? (visible as Vacante[]).map((v) => {
                  const photo = photoUrl(v.comercio.foto);
                  return (
                    <button
                      key={v.id}
                      onClick={() => router.push(`/comercio/${v.comercio.slug}`)}
                      className={`w-full text-left p-4 rounded-2xl border transition-colors ${cardBg} ${
                        isDark ? "hover:border-gray-700" : "hover:border-gray-300"
                      } active:scale-[0.99]`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 mt-0.5 ${
                          isDark ? "bg-gray-800" : "bg-gray-100"
                        }`}>
                          {photo ? (
                            <img src={photo} alt={v.comercio.nombre} className="w-full h-full object-cover" />
                          ) : (
                            <div className={`w-full h-full flex items-center justify-center text-base font-bold ${textMuted}`}>
                              {v.comercio.nombre[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-bold text-sm ${textPrimary}`}>{v.titulo}</p>
                          <p className={`text-xs ${isDark ? "text-blue-400" : "text-blue-600"} mt-0.5`}>{v.comercio.nombre}</p>
                          <p className={`text-xs ${textSec} mt-1 line-clamp-2`}>{v.descripcion}</p>
                          <div className="flex items-center gap-3 mt-2 flex-wrap">
                            {v.barrio && (
                              <div className="flex items-center gap-1">
                                <MapPin className={`w-3 h-3 ${textMuted}`} />
                                <span className={`text-xs ${textSec}`}>{v.barrio}</span>
                              </div>
                            )}
                            {v.modalidad && (
                              <div className="flex items-center gap-1">
                                <Tag className={`w-3 h-3 ${textMuted}`} />
                                <span className={`text-xs ${textSec}`}>{v.modalidad}</span>
                              </div>
                            )}
                            {v.horario && (
                              <div className="flex items-center gap-1">
                                <Clock className={`w-3 h-3 ${textMuted}`} />
                                <span className={`text-xs ${textSec}`}>{v.horario}</span>
                              </div>
                            )}
                          </div>
                          {v.salario && (
                            <p className={`text-xs font-semibold mt-1.5 ${isDark ? "text-green-400" : "text-green-600"}`}>
                              {v.salario}
                            </p>
                          )}
                        </div>
                        <ChevronRight className={`w-4 h-4 flex-shrink-0 mt-1 ${textMuted}`} />
                      </div>
                    </button>
                  );
                })
              : (visible as Empleado[]).map((e) => {
                  const photo = photoUrl(e.foto);
                  return (
                    <button
                      key={e.id}
                      onClick={() => router.push(`/empleo/${e.slug}`)}
                      className={`w-full text-left p-4 rounded-2xl border transition-colors ${cardBg} ${
                        isDark ? "hover:border-gray-700" : "hover:border-gray-300"
                      } active:scale-[0.99]`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 ${
                          isDark ? "bg-gray-800" : "bg-gray-100"
                        }`}>
                          {photo ? (
                            <img src={photo} alt={e.nombre} className="w-full h-full object-cover" />
                          ) : (
                            <div className={`w-full h-full flex items-center justify-center text-lg font-bold ${textMuted}`}>
                              {e.nombre[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-bold text-sm truncate ${textPrimary}`}>
                            {e.nombre} {e.apellido}
                          </p>
                          <p className={`text-xs capitalize truncate ${isDark ? "text-blue-400" : "text-blue-600"} mt-0.5`}>
                            {e.habilidades.slice(0, 3).join(", ")}
                          </p>
                          {e.barrio && (
                            <div className="flex items-center gap-1 mt-1">
                              <MapPin className={`w-3 h-3 ${textMuted}`} />
                              <span className={`text-xs ${textSec}`}>{e.barrio}</span>
                            </div>
                          )}
                        </div>
                        <ChevronRight className={`w-4 h-4 flex-shrink-0 ${textMuted}`} />
                      </div>
                    </button>
                  );
                })
            }
          </div>
        )}

        {hasMore && (
          <div ref={sentinelRef} className="flex justify-center py-6">
            <div className={`w-6 h-6 rounded-full border-2 border-t-transparent animate-spin ${isDark ? "border-gray-600" : "border-gray-300"}`} />
          </div>
        )}

        {/* FAB: publicar CV */}
        {tab === "empleados" && (
          <button
            onClick={() => router.push("/empleo/nuevo")}
            className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center hover:bg-blue-500 transition-colors z-30"
            title="Publicar mi CV"
          >
            <Plus className="w-6 h-6" />
          </button>
        )}

      </div>
    </div>
  );
}
