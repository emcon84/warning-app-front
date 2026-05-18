"use client";

import Link from "next/link";
import type { Vacante } from "@/types";
import { ProfessionalAvatar } from "./ProfessionalAvatar";
import { resolvePhotoUrl } from "@/lib/utils/photo";

interface Props {
  vacante: Vacante;
  dark: boolean;
}

export function FeaturedVacancyCard({ vacante, dark }: Props) {
  return (
    <Link href={`/vacante/${vacante.id}`} className="block">
      <div className="flex flex-col items-center gap-2 cursor-pointer group w-full">
        <div className={`w-16 h-16 rounded-full overflow-hidden shrink-0 ring-2 transition-all duration-200 ${dark ? "ring-gray-800 group-hover:ring-emerald-700" : "ring-gray-200 group-hover:ring-emerald-400 shadow-md"}`}>
          <ProfessionalAvatar
            foto={vacante.comercio.foto ? resolvePhotoUrl(vacante.comercio.foto) : null}
            nombre={vacante.comercio.nombre}
            gradient="from-emerald-700 to-emerald-900"
          />
        </div>
        <div className="text-center w-full overflow-hidden">
          <p className={`text-xs font-semibold truncate ${dark ? "text-white" : "text-gray-900"}`}>
            {vacante.titulo}
          </p>
          <p className={`text-[11px] truncate mt-0.5 ${dark ? "text-emerald-400" : "text-emerald-600"}`}>
            {vacante.comercio.nombre}
          </p>
          {vacante.barrio && (
            <p className={`text-[10px] truncate ${dark ? "text-gray-500" : "text-gray-400"}`}>
              {vacante.barrio}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
