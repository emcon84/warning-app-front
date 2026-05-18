"use client";

import Link from "next/link";
import { Instagram } from "lucide-react";
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
  if (comercios.length === 0) {
    return <p className="text-sm text-gray-600 text-center py-8">No hay comercios.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {comercios.map(com => (
        <div key={com.id} className="flex items-center gap-3 p-4 rounded-2xl bg-gray-900 border border-gray-800">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Link href={`/comercio/${com.slug}`} className="font-semibold text-sm text-white hover:underline">
                {com.nombre}
              </Link>
              {!com.activo && (
                <span className="text-xs bg-red-900/40 text-red-400 border border-red-800 px-1.5 py-0.5 rounded-full">Inactivo</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-xs text-gray-400">{com.rubro} · {com.barrio}</p>
              {com.isFounder && (
                <span className="text-[10px] font-bold px-1 py-0.5 rounded bg-amber-900/40 text-amber-400 border border-amber-800/50">FOUNDER</span>
              )}
              {com.isPremium && !com.isFounder && (
                <span className="text-[10px] font-bold px-1 py-0.5 rounded bg-indigo-900/40 text-indigo-400 border border-indigo-800/50">PREMIUM</span>
              )}
            </div>
            <p className="text-xs text-gray-600 mt-0.5">
              {new Date(com.createdAt).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onToggleFounder(com)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 border ${
                com.isFounder
                  ? "bg-amber-900/30 text-amber-400 border-amber-800/50 hover:bg-amber-900/60"
                  : "bg-gray-800 text-gray-500 border-gray-700 hover:bg-gray-700"
              }`}
            >
              {com.isFounder ? "★ Founder" : "Founder"}
            </button>
            <button
              onClick={() => onTogglePremium(com)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 border ${
                com.isPremium
                  ? "bg-indigo-900/30 text-indigo-400 border-indigo-800/50 hover:bg-indigo-900/60"
                  : "bg-gray-800 text-gray-500 border-gray-700 hover:bg-gray-700"
              }`}
            >
              {com.isPremium ? "✦ Premium" : "Premium"}
            </button>
            <button
              onClick={() => onShare(com)}
              className="px-3 py-1.5 rounded-xl bg-green-900/30 text-green-400 border border-green-800/50 hover:bg-green-900/60 text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <Instagram className="w-3.5 h-3.5" />
              Compartir
            </button>
            <button
              onClick={() => onDelete(com.id)}
              disabled={deletingId === com.id}
              className="flex-shrink-0 px-3 py-1.5 rounded-xl bg-red-900/30 text-red-400 border border-red-800/50 hover:bg-red-900/60 text-xs font-medium transition-colors disabled:opacity-40"
            >
              {deletingId === com.id ? "..." : "Eliminar"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
