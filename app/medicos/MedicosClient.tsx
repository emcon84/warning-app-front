"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Doctor } from "../types";
import Navbar from "../components/Navbar";
import { useTheme } from "../contexts/ThemeContext";
import { Stethoscope, MapPin, Phone, ChevronRight, Search, X } from "lucide-react";

interface Props {
  doctors: Doctor[];
}

const OBRAS_SOCIALES_COMUNES = [
  "IAPOS", "OSDE", "Swiss Medical", "Galeno", "Medicus", "PAMI",
  "IOMA", "OSPAT", "OSFATUN", "Particular",
];

export default function MedicosClient({ doctors }: Props) {
  const router = useRouter();
  const { isDark } = useTheme();

  const [search, setSearch] = useState("");
  const [selectedEspecialidad, setSelectedEspecialidad] = useState<string | null>(null);
  const [selectedOS, setSelectedOS] = useState<string | null>(null);

  const bg         = isDark ? "bg-gray-950" : "bg-gray-50";
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textSec    = isDark ? "text-gray-400" : "text-gray-500";
  const textMuted  = isDark ? "text-gray-500" : "text-gray-400";
  const cardBg     = isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";
  const inputCls   = isDark
    ? "bg-gray-900 border-gray-700 text-white placeholder-gray-600"
    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400";
  const pillActive  = "bg-blue-600 text-white border-blue-600";
  const pillInactive = isDark
    ? "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
    : "bg-white border-gray-200 text-gray-600 hover:border-gray-400";

  const especialidades = useMemo(
    () => [...new Set(doctors.map((d) => d.especialidad))].sort(),
    [doctors]
  );

  const filtered = useMemo(() => {
    return doctors.filter((d) => {
      if (!d.activo) return false;
      if (selectedEspecialidad && d.especialidad !== selectedEspecialidad) return false;
      if (selectedOS) {
        const osLower = selectedOS.toLowerCase();
        const hasOS = d.obrasSociales.some((os) => os.toLowerCase().includes(osLower));
        const hasIapos = selectedOS === "IAPOS" && d.iapos;
        if (!hasOS && !hasIapos) return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const match =
          d.nombre.toLowerCase().includes(q) ||
          d.especialidad.toLowerCase().includes(q) ||
          d.barrio.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [doctors, selectedEspecialidad, selectedOS, search]);

  function clearFilters() {
    setSelectedEspecialidad(null);
    setSelectedOS(null);
    setSearch("");
  }

  const hasFilters = !!(selectedEspecialidad || selectedOS || search.trim());

  return (
    <div className={`min-h-screen ${bg} ${textPrimary}`}>
      <Navbar sidebarDisabled mapView="doctors" />

      <div className="max-w-xl mx-auto px-4 pt-20 pb-32">

        {/* Header */}
        <div className="mb-5">
          <h1 className={`text-2xl font-black ${textPrimary}`}>Medicos</h1>
          <p className={`text-sm mt-1 ${textMuted}`}>
            {filtered.length} {filtered.length === 1 ? "profesional" : "profesionales"} en Reconquista
          </p>
        </div>

        {/* Buscador */}
        <div className="relative mb-4">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textMuted}`} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, especialidad o barrio..."
            className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors ${inputCls}`}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className={`absolute right-3 top-1/2 -translate-y-1/2 ${textMuted} hover:${textPrimary}`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filtro especialidad */}
        <div className="mb-3">
          <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${textMuted}`}>Especialidad</p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {especialidades.map((esp) => (
              <button
                key={esp}
                onClick={() => setSelectedEspecialidad(selectedEspecialidad === esp ? null : esp)}
                className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                  selectedEspecialidad === esp ? pillActive : pillInactive
                }`}
              >
                {esp}
              </button>
            ))}
          </div>
        </div>

        {/* Filtro obra social */}
        <div className="mb-5">
          <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${textMuted}`}>Obra Social</p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {OBRAS_SOCIALES_COMUNES.map((os) => (
              <button
                key={os}
                onClick={() => setSelectedOS(selectedOS === os ? null : os)}
                className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                  selectedOS === os ? pillActive : pillInactive
                }`}
              >
                {os}
              </button>
            ))}
          </div>
        </div>

        {/* Limpiar filtros */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className={`mb-4 text-xs flex items-center gap-1.5 ${isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"} transition-colors`}
          >
            <X className="w-3 h-3" />
            Limpiar filtros
          </button>
        )}

        {/* Lista */}
        {filtered.length === 0 ? (
          <div className={`py-16 text-center rounded-2xl border ${cardBg}`}>
            <Stethoscope className={`w-10 h-10 mx-auto mb-3 ${textMuted}`} />
            <p className={`text-sm font-medium ${textSec}`}>No se encontraron medicos</p>
            <p className={`text-xs mt-1 ${textMuted}`}>Proba con otros filtros</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((doctor) => (
              <button
                key={doctor.id}
                onClick={() => router.push(`/medico/${doctor.id}`)}
                className={`w-full text-left p-4 rounded-2xl border transition-colors ${cardBg} ${
                  isDark ? "hover:border-gray-700" : "hover:border-gray-300"
                } active:scale-[0.99]`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    isDark ? "bg-blue-900/40 border border-blue-800" : "bg-blue-50 border border-blue-100"
                  }`}>
                    <Stethoscope className={`w-5 h-5 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className={`font-bold text-sm leading-tight truncate ${textPrimary}`}>
                          Dr/a. {doctor.nombre}
                        </p>
                        <p className={`text-xs mt-0.5 ${isDark ? "text-blue-400" : "text-blue-600"} font-medium`}>
                          {doctor.especialidad}
                        </p>
                      </div>
                      <ChevronRight className={`w-4 h-4 flex-shrink-0 mt-0.5 ${textMuted}`} />
                    </div>

                    <div className="flex items-center gap-1.5 mt-1.5">
                      <MapPin className={`w-3 h-3 flex-shrink-0 ${textMuted}`} />
                      <span className={`text-xs truncate ${textSec}`}>{doctor.barrio}</span>
                    </div>

                    {/* Obras sociales */}
                    {(doctor.obrasSociales?.length > 0 || doctor.iapos) && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {doctor.iapos && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                            isDark
                              ? "bg-green-900/40 text-green-400 border-green-800"
                              : "bg-green-50 text-green-700 border-green-200"
                          }`}>
                            IAPOS
                          </span>
                        )}
                        {doctor.obrasSociales?.slice(0, 3).map((os) => (
                          <span key={os} className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                            isDark
                              ? "bg-gray-800 text-gray-400 border-gray-700"
                              : "bg-gray-100 text-gray-600 border-gray-200"
                          }`}>
                            {os}
                          </span>
                        ))}
                        {(doctor.obrasSociales?.length ?? 0) > 3 && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                            isDark ? "bg-gray-800 text-gray-500 border-gray-700" : "bg-gray-100 text-gray-500 border-gray-200"
                          }`}>
                            +{(doctor.obrasSociales?.length ?? 0) - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Teléfono si tiene */}
                    {doctor.telefono && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <Phone className={`w-3 h-3 flex-shrink-0 ${textMuted}`} />
                        <span className={`text-xs ${textSec}`}>{doctor.telefono}</span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
