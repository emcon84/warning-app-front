"use client";

import { useState } from "react";
import Image from "next/image";
import { Pencil, Share2, Check, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import type { Producto } from "../../../types";
import { resolvePhotoUrl } from "../../../lib/utils/photo";

interface Props {
  producto: Producto;
  slug: string;
  isDark: boolean;
  cardBg: string;
  textPri: string;
  textSec: string;
  textMuted: string;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

export function StoreProductRow({ producto, slug, isDark, cardBg, textPri, textSec, onToggle, onDelete, onEdit }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  function handleShareProducto() {
    const link = `${window.location.origin}/comercio/${slug}/producto/${producto.id}`;
    navigator.clipboard.writeText(link).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }).catch(() => { /**/ });
  }

  return (
    <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
      <div className="flex gap-0">
        {producto.foto && (
          <div className="relative w-24 flex-shrink-0 self-stretch">
            <Image
              src={resolvePhotoUrl(producto.foto)}
              alt={producto.nombre}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="flex-1 p-4 flex flex-col gap-1.5 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-1 min-w-0">
              <p className={`font-bold text-sm leading-snug ${textPri}`}>{producto.nombre}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full border self-start capitalize ${
                producto.tipo === "servicio"
                  ? isDark ? "bg-blue-900/40 text-blue-400 border-blue-800" : "bg-blue-100 text-blue-700 border-blue-300"
                  : isDark ? "bg-amber-900/40 text-amber-400 border-amber-800" : "bg-amber-100 text-amber-700 border-amber-300"
              }`}>
                {producto.tipo ?? "producto"}
              </span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${
              producto.activo
                ? isDark ? "bg-green-900/40 text-green-400 border-green-800" : "bg-green-100 text-green-700 border-green-300"
                : isDark ? "bg-gray-800 text-gray-500 border-gray-700" : "bg-gray-100 text-gray-400 border-gray-200"
            }`}>
              {producto.activo ? "Activo" : "Inactivo"}
            </span>
          </div>

          {producto.descripcion && (
            <p className={`text-xs leading-relaxed line-clamp-2 ${textSec}`}>{producto.descripcion}</p>
          )}
          {producto.precio && (
            <span className={`text-sm font-black ${isDark ? "text-green-400" : "text-green-600"}`}>{producto.precio}</span>
          )}

          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            <button
              onClick={onToggle}
              className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border transition-colors ${isDark ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
            >
              {producto.activo
                ? <ToggleRight className="w-3.5 h-3.5 text-green-500" />
                : <ToggleLeft className="w-3.5 h-3.5" />
              }
              {producto.activo ? "Desactivar" : "Activar"}
            </button>
            <button
              onClick={onEdit}
              className={`p-1.5 rounded-lg border transition-colors ${isDark ? "border-gray-700 text-gray-500 hover:text-blue-400 hover:border-blue-800" : "border-gray-200 text-gray-400 hover:text-blue-500 hover:border-blue-200"}`}
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleShareProducto}
              title={shareCopied ? "¡Copiado!" : "Copiar link del producto"}
              className={`p-1.5 rounded-lg border transition-colors ${
                shareCopied
                  ? isDark ? "border-green-700 text-green-400" : "border-green-300 text-green-600"
                  : isDark ? "border-gray-700 text-gray-500 hover:text-purple-400 hover:border-purple-800" : "border-gray-200 text-gray-400 hover:text-purple-500 hover:border-purple-200"
              }`}
            >
              {shareCopied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>
            {confirmDelete ? (
              <div className="flex gap-1">
                <button onClick={onDelete} className="text-xs px-2.5 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors whitespace-nowrap">Confirmar</button>
                <button onClick={() => setConfirmDelete(false)} className={`text-xs px-2.5 py-1 rounded-lg border transition-colors whitespace-nowrap ${isDark ? "border-gray-700 text-gray-400 hover:bg-gray-800" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>Cancelar</button>
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
