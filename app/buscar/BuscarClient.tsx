"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  X,
  MapPin,
  Star,
  ChevronLeft,
  Stethoscope,
} from "lucide-react";
import { Professional, Comercio, Doctor } from "../types";
import Navbar from "../components/Navbar";
import MobileBottomNav from "../components/MobileBottomNav";
import { useTheme } from "../contexts/ThemeContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function photoUrl(url?: string | null): string | null {
  if (!url) return null;
  return url.startsWith("/uploads/") ? `${API_URL}${url}` : url;
}

interface Props {
  professionals: Professional[];
  comercios: Comercio[];
  doctors: Doctor[];
  initialQuery: string;
}

type Tab = "todos" | "oficios" | "comercios" | "medicos";

const SUGGESTIONS = ["plomero", "electricista", "médico IAPOS", "farmacia", "kinesiólogo", "carpintero"];

export default function BuscarClient({ professionals, comercios, doctors, initialQuery }: Props) {
  const router = useRouter();
  const { isDark } = useTheme();
  const [query, setQuery] = useState(initialQuery);
  const [tab, setTab] = useState<Tab>("todos");
  const inputRef = useRef<HTMLInputElement>(null);

  const bg          = isDark ? "bg-gray-950"   : "bg-gray-50";
  const textPrimary = isDark ? "text-white"    : "text-gray-900";
  const textSec     = isDark ? "text-gray-400" : "text-gray-500";
  const textMuted   = isDark ? "text-gray-500" : "text-gray-400";
  const cardBg      = isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // ── Filtering logic ───────────────────────────────────────────────────────
  const q = query.toLowerCase().trim();

  const filteredProfessionals = q === ""
    ? []
    : professionals.filter((p) => {
        if (!p.disponible) return false;
        return (
          (p.nombre ?? "").toLowerCase().includes(q) ||
          (p.apellido ?? "").toLowerCase().includes(q) ||
          (p.oficios ?? []).some((o) => o.toLowerCase().includes(q)) ||
          (p.barrio ?? "").toLowerCase().includes(q)
        );
      });

  const filteredComercios = q === ""
    ? []
    : comercios.filter((c) => {
        if (!c.activo) return false;
        return (
          (c.nombre ?? "").toLowerCase().includes(q) ||
          (c.rubro ?? "").toLowerCase().includes(q) ||
          (c.barrio ?? "").toLowerCase().includes(q) ||
          (c.descripcion ?? "").toLowerCase().includes(q)
        );
      });

  const filteredDoctors = q === ""
    ? []
    : doctors.filter((d) => {
        if (!d.activo) return false;
        return (
          (d.nombre ?? "").toLowerCase().includes(q) ||
          (d.especialidad ?? "").toLowerCase().includes(q) ||
          (d.barrio ?? "").toLowerCase().includes(q) ||
          (d.obrasSociales ?? []).some((os) => os.toLowerCase().includes(q))
        );
      });

  const countOficios   = filteredProfessionals.length;
  const countComercios = filteredComercios.length;
  const countMedicos   = filteredDoctors.length;
  const countTodos     = countOficios + countComercios + countMedicos;

  // ── Tab visibility helpers ────────────────────────────────────────────────
  const showProfessionals = tab === "todos" || tab === "oficios";
  const showComercios     = tab === "todos" || tab === "comercios";
  const showMedicos       = tab === "todos" || tab === "medicos";

  // ── Tab pills config ──────────────────────────────────────────────────────
  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "todos",     label: "Todos",     count: countTodos     },
    { key: "oficios",   label: "Oficios",   count: countOficios   },
    { key: "comercios", label: "Comercios", count: countComercios },
    { key: "medicos",   label: "Médicos",   count: countMedicos   },
  ];

  return (
    <div className={`min-h-screen ${bg} ${textPrimary}`}>
      <Navbar />

      <div className="max-w-xl md:max-w-4xl mx-auto px-4 pt-20 pb-32">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => router.back()}
            className={`p-1.5 rounded-full transition-colors ${isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"}`}
            aria-label="Volver"
          >
            <ChevronLeft className={`w-5 h-5 ${textMuted}`} />
          </button>
          <span className={`text-sm font-semibold ${textSec}`}>Buscar</span>
        </div>

        {/* ── Search input ───────────────────────────────────────────────── */}
        <div className="relative mb-4 md:max-w-2xl md:mx-auto">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${textMuted}`} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscá un plomero, médico, comercio..."
            autoFocus
            className={`w-full pl-11 pr-11 py-3.5 rounded-full border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
              isDark
                ? "bg-gray-900 border-gray-700 text-white placeholder-gray-600"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 shadow-sm"
            }`}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${textMuted} hover:text-gray-400`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ── Tab pills ──────────────────────────────────────────────────── */}
        {q !== "" && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-4 md:max-w-2xl md:mx-auto">
            {tabs.map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                  tab === key
                    ? "bg-blue-600 text-white border-blue-600"
                    : `${cardBg} ${textSec}`
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>
        )}

        {/* ── Empty state ────────────────────────────────────────────────── */}
        {q === "" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center justify-center gap-6 pt-12"
          >
            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
              <Search className={`w-9 h-9 ${textMuted}`} />
            </div>
            <p className={`text-base font-medium ${textSec}`}>
              Buscá un plomero, médico, comercio...
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setQuery(s)}
                  className={`px-3.5 py-1.5 rounded-full text-sm border font-medium transition-all ${cardBg} ${textSec} ${isDark ? "hover:border-gray-600" : "hover:border-gray-300"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── No results ─────────────────────────────────────────────────── */}
        {q !== "" && countTodos === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center pt-16"
          >
            <p className={`text-base ${textSec}`}>
              Sin resultados para <span className="font-semibold">&ldquo;{query}&rdquo;</span>
            </p>
          </motion.div>
        )}

        {/* ── Results ────────────────────────────────────────────────────── */}
        {q !== "" && countTodos > 0 && (
          <div className="space-y-1">

            {/* Profesionales / Oficios */}
            {showProfessionals && filteredProfessionals.length > 0 && (
              <>
                {tab === "todos" && (
                  <p className={`text-xs font-bold uppercase tracking-wide mt-4 mb-2 ${textMuted}`}>
                    Oficios y Profesionales
                  </p>
                )}
                {(tab === "todos" ? filteredProfessionals.slice(0, 5) : filteredProfessionals).map((pro) => {
                  const photo = photoUrl(pro.foto);
                  return (
                    <Link
                      key={pro.id}
                      href={`/profesional/${pro.slug}`}
                      className={`flex items-center gap-3 p-3 rounded-2xl border transition-all active:scale-[0.98] ${cardBg} ${isDark ? "hover:border-gray-700" : "hover:border-gray-300"}`}
                    >
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-blue-500/15 flex items-center justify-center">
                        {photo ? (
                          <img src={photo} alt={pro.nombre} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg font-bold text-blue-500">
                            {(pro.nombre?.[0] ?? "?").toUpperCase()}
                          </span>
                        )}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${textPrimary}`}>
                          {pro.nombre} {pro.apellido}
                        </p>
                        <p className={`text-xs capitalize truncate ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                          {(pro.oficios ?? [])[0] ?? ""}
                        </p>
                        <div className={`flex items-center gap-2 mt-0.5 ${textMuted}`}>
                          <div className="flex items-center gap-0.5">
                            <MapPin className="w-3 h-3" />
                            <span className="text-xs">{pro.barrio}</span>
                          </div>
                          {pro.ratingCount > 0 && (
                            <div className="flex items-center gap-0.5">
                              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                              <span className="text-xs text-yellow-400">{pro.ratingAvg.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
                {tab === "todos" && filteredProfessionals.length > 5 && (
                  <button
                    onClick={() => setTab("oficios")}
                    className="text-xs text-blue-500 mt-1 px-1"
                  >
                    Ver los {filteredProfessionals.length} resultados
                  </button>
                )}
              </>
            )}

            {/* Comercios */}
            {showComercios && filteredComercios.length > 0 && (
              <>
                {tab === "todos" && (
                  <p className={`text-xs font-bold uppercase tracking-wide mt-4 mb-2 ${textMuted}`}>
                    Comercios
                  </p>
                )}
                {(tab === "todos" ? filteredComercios.slice(0, 5) : filteredComercios).map((comercio) => {
                  const logo = photoUrl(comercio.logo || comercio.foto);
                  return (
                    <Link
                      key={comercio.id}
                      href={`/comercio/${comercio.slug}`}
                      className={`flex items-center gap-3 p-3 rounded-2xl border transition-all active:scale-[0.98] ${cardBg} ${isDark ? "hover:border-gray-700" : "hover:border-gray-300"}`}
                    >
                      {/* Logo */}
                      <div className={`w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
                        {logo ? (
                          <img src={logo} alt={comercio.nombre} className="w-full h-full object-cover" />
                        ) : (
                          <span className={`text-lg font-bold ${isDark ? "text-purple-400" : "text-purple-600"}`}>
                            {comercio.nombre[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-semibold truncate ${textPrimary}`}>{comercio.nombre}</p>
                          {comercio.isFounder && (
                            <span className="flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-500/15 text-blue-500">
                              FOUNDER
                            </span>
                          )}
                          {!comercio.isFounder && comercio.isPremium && (
                            <span className="flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-500">
                              PREMIUM
                            </span>
                          )}
                        </div>
                        <p className={`text-xs truncate ${isDark ? "text-purple-400" : "text-purple-600"}`}>
                          {comercio.rubro}
                        </p>
                        <div className={`flex items-center gap-0.5 mt-0.5 ${textMuted}`}>
                          <MapPin className="w-3 h-3" />
                          <span className="text-xs">{comercio.barrio}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
                {tab === "todos" && filteredComercios.length > 5 && (
                  <button
                    onClick={() => setTab("comercios")}
                    className="text-xs text-blue-500 mt-1 px-1"
                  >
                    Ver los {filteredComercios.length} resultados
                  </button>
                )}
              </>
            )}

            {/* Médicos */}
            {showMedicos && filteredDoctors.length > 0 && (
              <>
                {tab === "todos" && (
                  <p className={`text-xs font-bold uppercase tracking-wide mt-4 mb-2 ${textMuted}`}>
                    Médicos
                  </p>
                )}
                {(tab === "todos" ? filteredDoctors.slice(0, 5) : filteredDoctors).map((doc) => (
                  <Link
                    key={doc.id}
                    href="/medicos"
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all active:scale-[0.98] ${cardBg} ${isDark ? "hover:border-gray-700" : "hover:border-gray-300"}`}
                  >
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-xl flex-shrink-0 bg-red-500/15 flex items-center justify-center">
                      <Stethoscope className="w-6 h-6 text-red-500" />
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${textPrimary}`}>
                        Dr/a. {doc.nombre}
                      </p>
                      <p className={`text-xs truncate ${isDark ? "text-red-400" : "text-red-600"}`}>
                        {doc.especialidad}
                      </p>
                      <div className={`flex items-center gap-0.5 mt-0.5 ${textMuted}`}>
                        <MapPin className="w-3 h-3" />
                        <span className="text-xs">{doc.barrio}</span>
                      </div>
                      {/* Obras sociales */}
                      {(doc.obrasSociales ?? []).length > 0 && (
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          {(doc.obrasSociales ?? []).slice(0, 2).map((os) => (
                            <span
                              key={os}
                              className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${isDark ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"}`}
                            >
                              {os}
                            </span>
                          ))}
                          {(doc.obrasSociales ?? []).length > 2 && (
                            <span className={`text-[10px] ${textMuted}`}>
                              +{(doc.obrasSociales ?? []).length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
                {tab === "todos" && filteredDoctors.length > 5 && (
                  <button
                    onClick={() => setTab("medicos")}
                    className="text-xs text-blue-500 mt-1 px-1"
                  >
                    Ver los {filteredDoctors.length} resultados
                  </button>
                )}
              </>
            )}

          </div>
        )}

      </div>

      <MobileBottomNav />
    </div>
  );
}
