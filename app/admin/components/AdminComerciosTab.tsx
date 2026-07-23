"use client";

import Link from "next/link";
import { Instagram } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import type { Comercio } from "../types";

interface Props {
  comercios: Comercio[];
  deletingId: string | null;
  onDelete: (id: string) => void;
  onTogglePremium: (com: Comercio) => void;
  onToggleFounder: (com: Comercio) => void;
  onShare: (com: Comercio) => void;
}

export function AdminComerciosTab({ comercios, deletingId, onDelete, onTogglePremium, onToggleFounder, onShare }: Props) {
  const { isDark } = useTheme();
  const bgCard = isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";
  const bgBtn = isDark ? "bg-gray-800 text-gray-400 border-gray-700 hover:text-white hover:bg-gray-700" : "bg-white text-gray-600 border-gray-300 hover:text-gray-900 hover:bg-gray-50";
  const btnRed = isDark ? "bg-red-900/30 text-red-400 border-red-800/50 hover:bg-red-900/60" : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100";
  const btnAmber = isDark ? "bg-amber-900/30 text-amber-400 border-amber-800/50 hover:bg-amber-900/60" : "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100";
  const btnIndigo = isDark ? "bg-indigo-900/30 text-indigo-400 border-indigo-800/50 hover:bg-indigo-900/60" : "bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100";
  const btnGreen = isDark ? "bg-green-900/30 text-green-400 border-green-800/50 hover:bg-green-900/60" : "bg-green-50 text-green-600 border-green-200 hover:bg-green-100";
  const badgeRed = isDark ? "bg-red-900/40 text-red-400 border-red-800" : "bg-red-50 text-red-600 border-red-200";
  const badgeAmber = isDark ? "bg-amber-900/40 text-amber-400 border-amber-800/50" : "bg-amber-50 text-amber-600 border-amber-200";
  const badgeIndigo = isDark ? "bg-indigo-900/40 text-indigo-400 border-indigo-800/50" : "bg-indigo-50 text-indigo-600 border-indigo-200";
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textSecondary = isDark ? "text-gray-400" : "text-gray-500";
  const textMuted = isDark ? "text-gray-600" : "text-gray-500";

  if (comercios.length === 0) {
    return <p className={`text-sm ${textMuted} text-center py-8`}>No hay comercios.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {comercios.map(com => (
        <div key={com.id} className={`flex items-center gap-3 p-4 rounded-2xl border ${bgCard}`}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Link href={`/comercio/${com.slug}`} className={`font-semibold text-sm ${textPrimary} hover:underline`}>
                {com.nombre}
              </Link>
              {!com.activo && (
                <span className={`text-xs border px-1.5 py-0.5 rounded-full ${badgeRed}`}>Inactivo</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className={`text-xs ${textSecondary}`}>{com.rubro} · {com.barrio}</p>
              {com.isFounder && (
                <span className={`text-[10px] font-bold px-1 py-0.5 rounded border ${badgeAmber}`}>FOUNDER</span>
              )}
              {com.isPremium && !com.isFounder && (
                <span className={`text-[10px] font-bold px-1 py-0.5 rounded border ${badgeIndigo}`}>PREMIUM</span>
              )}
            </div>
            <p className={`text-xs ${textMuted} mt-0.5`}>
              {new Date(com.createdAt).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onToggleFounder(com)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 border ${
                com.isFounder
                  ? `${btnAmber}`
                  : bgBtn
              }`}
            >
              {com.isFounder ? "★ Founder" : "Founder"}
            </button>
            <button
              onClick={() => onTogglePremium(com)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 border ${
                com.isPremium
                  ? `${btnIndigo}`
                  : bgBtn
              }`}
            >
              {com.isPremium ? "✦ Premium" : "Premium"}
            </button>
            <button
              onClick={() => onShare(com)}
              className={`px-3 py-1.5 rounded-xl border ${btnGreen} text-xs font-medium transition-colors flex items-center gap-1.5`}
            >
              <Instagram className="w-3.5 h-3.5" />
              Compartir
            </button>
            <button
              onClick={() => onDelete(com.id)}
              disabled={deletingId === com.id}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl border ${btnRed} text-xs font-medium transition-colors disabled:opacity-40`}
            >
              {deletingId === com.id ? "..." : "Eliminar"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
