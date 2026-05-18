"use client";

import Link from "next/link";
import type { Empleado } from "@/types";
import { ProfessionalAvatar } from "./ProfessionalAvatar";

interface Props {
  empleado: Empleado;
  dark: boolean;
}

export function EmployeeResultCard({ empleado, dark }: Props) {
  return (
    <Link href={`/empleo/${empleado.slug}`}>
      <div className={`flex items-center gap-4 p-5 rounded-2xl border transition-all cursor-pointer ${dark ? "bg-gray-900 border-gray-800 hover:border-gray-600 hover:bg-gray-800" : "bg-white border-gray-100 hover:border-gray-300 shadow-sm hover:shadow-md"}`}>
        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow">
          <ProfessionalAvatar
            foto={empleado.foto}
            nombre={empleado.nombre}
            gradient="from-blue-700 to-blue-900"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`font-semibold ${dark ? "text-white" : "text-gray-900"}`}>
              {empleado.nombre} {empleado.apellido}
            </p>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${empleado.disponible ? "bg-green-900/40 text-green-400 border-green-800" : dark ? "bg-gray-800 text-gray-500 border-gray-700" : "bg-gray-100 text-gray-400 border-gray-200"}`}>
              {empleado.disponible ? "Disponible" : "No disponible"}
            </span>
          </div>
          <p className={`text-sm mt-0.5 ${dark ? "text-gray-400" : "text-gray-500"}`}>
            {empleado.habilidades.slice(0, 3).join(", ")}
          </p>
          {empleado.barrio && (
            <p className={`text-xs mt-0.5 ${dark ? "text-gray-500" : "text-gray-400"}`}>
              {empleado.barrio}
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
