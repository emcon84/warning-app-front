"use client";

import Link from "next/link";
import type { Vacante } from "@/types";
import { ProfessionalAvatar } from "./ProfessionalAvatar";
import { resolvePhotoUrl } from "@/lib/utils/photo";

interface Props {
  vacante: Vacante;
  dark: boolean;
}

export function VacancyResultCard({ vacante, dark }: Props) {
  return (
    <Link href={`/vacante/${vacante.id}`}>
      <div className={`flex items-center gap-4 p-5 rounded-2xl border transition-all cursor-pointer ${dark ? "bg-gray-900 border-gray-800 hover:border-gray-600 hover:bg-gray-800" : "bg-white border-gray-100 hover:border-gray-300 shadow-sm hover:shadow-md"}`}>
        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow">
          <ProfessionalAvatar
            foto={vacante.comercio.foto ? resolvePhotoUrl(vacante.comercio.foto) : null}
            nombre={vacante.comercio.nombre}
            gradient="from-emerald-700 to-emerald-900"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`font-semibold ${dark ? "text-white" : "text-gray-900"}`}>
              {vacante.titulo}
            </p>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${dark ? "bg-emerald-900/40 text-emerald-400 border-emerald-800" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
              Vacante
            </span>
          </div>
          <p className={`text-sm mt-0.5 ${dark ? "text-gray-400" : "text-gray-500"}`}>
            {vacante.comercio.nombre} · {vacante.comercio.rubro}
          </p>
          {vacante.barrio && (
            <p className={`text-xs mt-0.5 ${dark ? "text-gray-500" : "text-gray-400"}`}>
              {vacante.barrio}
            </p>
          )}
          {vacante.habilidades.length > 0 && (
            <p className={`text-xs mt-1 ${dark ? "text-gray-600" : "text-gray-400"}`}>
              {vacante.habilidades.slice(0, 3).join(", ")}
            </p>
          )}
        </div>
        <svg className={`w-5 h-5 shrink-0 ${dark ? "text-gray-600" : "text-gray-300"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}
