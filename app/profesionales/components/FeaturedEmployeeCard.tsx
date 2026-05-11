"use client";

import Link from "next/link";
import type { Empleado } from "../../types";
import { ProfessionalAvatar } from "./ProfessionalAvatar";

interface Props {
  empleado: Empleado;
  dark: boolean;
}

export function FeaturedEmployeeCard({ empleado, dark }: Props) {
  return (
    <Link href={`/empleo/${empleado.slug}`} className="block">
      <div className="flex flex-col items-center gap-2 cursor-pointer group w-full">
        <div className={`w-16 h-16 rounded-full overflow-hidden shrink-0 ring-2 transition-all duration-200 ${dark ? "ring-gray-800 group-hover:ring-blue-700" : "ring-gray-200 group-hover:ring-blue-400 shadow-md"}`}>
          <ProfessionalAvatar
            foto={empleado.foto}
            nombre={empleado.nombre}
            gradient="from-blue-700 to-blue-900"
          />
        </div>
        <div className="text-center w-full overflow-hidden">
          <p className={`text-xs font-semibold truncate ${dark ? "text-white" : "text-gray-900"}`}>
            {empleado.nombre}
          </p>
          <p className={`text-[11px] truncate mt-0.5 ${dark ? "text-blue-400" : "text-blue-600"}`}>
            {empleado.habilidades[0]}
          </p>
          <span className={`text-[10px] mt-0.5 inline-block ${empleado.disponible ? (dark ? "text-green-400" : "text-green-600") : dark ? "text-gray-500" : "text-gray-400"}`}>
            {empleado.disponible ? "Disponible" : "No disponible"}
          </span>
        </div>
      </div>
    </Link>
  );
}
