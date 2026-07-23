"use client";

import Link from "next/link";
import { Instagram, KeyRound } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import type { Professional } from "../types";

interface Props {
  professionals: Professional[];
  deletingId: string | null;
  onDelete: (id: string) => void;
  onShare: (pro: Professional) => void;
  onSetPin: (pro: Professional) => void;
}

export function AdminProfessionalsTab({ professionals, deletingId, onDelete, onShare, onSetPin }: Props) {
  const { isDark } = useTheme();
  const bgCard = isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";
  const btnRed = isDark ? "bg-red-900/30 text-red-400 border-red-800/50 hover:bg-red-900/60" : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100";
  const btnAmber = isDark ? "bg-amber-900/30 text-amber-400 border-amber-800/50 hover:bg-amber-900/60" : "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100";
  const btnBlue = isDark ? "bg-blue-900/30 text-blue-400 border-blue-800/50 hover:bg-blue-900/60" : "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100";
  const badgeRed = isDark ? "bg-red-900/40 text-red-400 border-red-800" : "bg-red-50 text-red-600 border-red-200";
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textSecondary = isDark ? "text-gray-400" : "text-gray-500";
  const textMuted = isDark ? "text-gray-600" : "text-gray-500";

  if (professionals.length === 0) {
    return <p className={`text-sm ${textMuted} text-center py-8`}>No hay profesionales.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {professionals.map(pro => (
        <div key={pro.id} className={`flex items-center gap-3 p-4 rounded-2xl border ${bgCard}`}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Link href={`/profesional/${pro.slug}`} className={`font-semibold text-sm ${textPrimary} hover:underline`}>
                {pro.nombre} {pro.apellido}
              </Link>
              {!pro.activo && (
                <span className={`text-xs border px-1.5 py-0.5 rounded-full ${badgeRed}`}>Inactivo</span>
              )}
            </div>
            <p className={`text-xs ${textSecondary} capitalize`}>{pro.oficios.join(", ")} · {pro.barrio}</p>
            <p className={`text-xs ${textMuted} mt-0.5`}>
              {pro.ratingCount > 0 ? `★ ${pro.ratingAvg.toFixed(1)} (${pro.ratingCount})` : "Sin reseñas"} ·{" "}
              {new Date(pro.createdAt).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onSetPin(pro)}
              className={`px-3 py-1.5 rounded-xl border ${btnAmber} text-xs font-medium transition-colors flex items-center gap-1.5`}
              title="Asignar / resetear PIN"
            >
              <KeyRound className="w-3.5 h-3.5" />
              PIN
            </button>
            <button
              onClick={() => onShare(pro)}
              className={`px-3 py-1.5 rounded-xl border ${btnBlue} text-xs font-medium transition-colors flex items-center gap-1.5`}
            >
              <Instagram className="w-3.5 h-3.5" />
              Compartir
            </button>
            <button
              onClick={() => onDelete(pro.id)}
              disabled={deletingId === pro.id}
              className={`px-3 py-1.5 rounded-xl border ${btnRed} text-xs font-medium transition-colors disabled:opacity-40`}
            >
              {deletingId === pro.id ? "..." : "Eliminar"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
