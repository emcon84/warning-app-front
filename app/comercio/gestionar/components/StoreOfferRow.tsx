"use client";

import { useState } from "react";
import Image from "next/image";
import { Pencil, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import type { ComercioOffer } from "@/types";
import { resolvePhotoUrl } from "@/lib/utils/photo";

interface Props {
  offer: ComercioOffer;
  isDark: boolean;
  cardBg: string;
  textPri: string;
  textSec: string;
  textMuted: string;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

export function StoreOfferRow({ offer, isDark, cardBg, textPri, textSec, textMuted, onToggle, onDelete, onEdit }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const validaHasta = offer.validaHasta
    ? new Date(offer.validaHasta).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
      <div className="flex gap-0">
        {offer.foto && (
          <div className="relative w-24 flex-shrink-0 self-stretch">
            <Image
              src={resolvePhotoUrl(offer.foto)}
              alt={offer.titulo}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="flex-1 p-4 flex flex-col gap-1.5 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`font-bold text-sm leading-snug ${textPri}`}>{offer.titulo}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${
              offer.activa
                ? isDark ? "bg-green-900/40 text-green-400 border-green-800" : "bg-green-100 text-green-700 border-green-300"
                : isDark ? "bg-gray-800 text-gray-500 border-gray-700" : "bg-gray-100 text-gray-400 border-gray-200"
            }`}>
              {offer.activa ? "Activa" : "Inactiva"}
            </span>
          </div>

          {offer.descripcion && (
            <p className={`text-xs leading-relaxed line-clamp-2 ${textSec}`}>{offer.descripcion}</p>
          )}

          <div className="flex items-center gap-3 flex-wrap mt-1">
            {offer.precio && (
              <span className={`text-sm font-black ${isDark ? "text-yellow-300" : "text-yellow-600"}`}>{offer.precio}</span>
            )}
            {validaHasta && (
              <span className={`text-xs ${textMuted}`}>Hasta {validaHasta}</span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={onToggle}
              className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                isDark ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {offer.activa
                ? <ToggleRight className="w-3.5 h-3.5 text-green-500" />
                : <ToggleLeft className="w-3.5 h-3.5" />
              }
              {offer.activa ? "Desactivar" : "Activar"}
            </button>

            <button
              onClick={onEdit}
              className={`p-1.5 rounded-lg border transition-colors ${isDark ? "border-gray-700 text-gray-500 hover:text-blue-400 hover:border-blue-800" : "border-gray-200 text-gray-400 hover:text-blue-500 hover:border-blue-200"}`}
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>

            {confirmDelete ? (
              <div className="flex gap-1">
                <button onClick={onDelete} className="text-xs px-2.5 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors">
                  Confirmar
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${isDark ? "border-gray-700 text-gray-400 hover:bg-gray-800" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className={`p-1.5 rounded-lg border transition-colors ${isDark ? "border-gray-700 text-gray-500 hover:text-red-400 hover:border-red-800" : "border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200"}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
