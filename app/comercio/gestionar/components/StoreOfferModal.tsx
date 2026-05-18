"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";
import { X, ImageIcon } from "lucide-react";
import type { ComercioOffer } from "@/types";
import { resolvePhotoUrl } from "@/lib/utils/photo";

import { API_URL } from "@/lib/api/client";

interface Props {
  isDark: boolean;
  onClose: () => void;
  onSaved: (offer: ComercioOffer) => void;
  editing?: ComercioOffer;
}

export function StoreOfferModal({ isDark, onClose, onSaved, editing }: Props) {
  const { getToken } = useAuth();
  const [titulo, setTitulo] = useState(editing?.titulo ?? "");
  const [descripcion, setDescripcion] = useState(editing?.descripcion ?? "");
  const [terminos, setTerminos] = useState(editing?.terminos ?? "");
  const [precio, setPrecio] = useState(editing?.precio ?? "");
  const [validaHasta, setValidaHasta] = useState(
    editing?.validaHasta ? new Date(editing.validaHasta).toISOString().split("T")[0] : ""
  );
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    editing?.foto ? resolvePhotoUrl(editing.foto) : null
  );
  const [clearPhoto, setClearPhoto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const photoRef = useRef<HTMLInputElement>(null);

  const bg = isDark ? "bg-gray-900" : "bg-white";
  const inputCls = isDark
    ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400";
  const labelCls = isDark ? "text-gray-400" : "text-gray-500";

  async function handleSubmit() {
    if (!titulo.trim()) { setError("El titulo es obligatorio"); return; }
    setLoading(true);
    setError("");
    try {
      const token = await getToken();
      const fd = new FormData();
      fd.append("titulo", titulo.trim());
      if (descripcion.trim()) fd.append("descripcion", descripcion.trim());
      if (terminos.trim()) fd.append("terminos", terminos.trim());
      if (precio.trim()) fd.append("precio", precio.trim());
      if (validaHasta) fd.append("validaHasta", validaHasta);
      if (photoFile) fd.append("photo", photoFile);
      if (clearPhoto && !photoFile) fd.append("clearPhoto", "1");

      const url = editing
        ? `/api/comercios/me/offers/${editing.id}`
        : `/api/comercios/me/offers`;
      const res = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Error al guardar la oferta");
      }
      const offer = await res.json();
      onSaved(offer);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 px-4 pt-20 pb-24 sm:p-4">
      <div className={`w-full max-w-lg rounded-2xl ${bg} shadow-xl flex flex-col`} style={{ maxHeight: "calc(100dvh - 10rem)" }}>
        <div className="flex items-center justify-between p-5 pb-0 flex-shrink-0">
          <h2 className={`font-bold text-base ${isDark ? "text-white" : "text-gray-900"}`}>{editing ? "Editar oferta" : "Nueva oferta"}</h2>
          <button onClick={onClose} className={`p-1.5 rounded-lg ${isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"}`}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto p-5">
          <div>
            <label className={`text-xs mb-1.5 block ${labelCls}`}>Titulo *</label>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: 2x1 en medialunas"
              className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none ${inputCls}`}
            />
          </div>

          <div>
            <label className={`text-xs mb-1.5 block ${labelCls}`}>Descripcion</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value.slice(0, 500))}
              placeholder="Mas detalles de la oferta..."
              rows={3}
              className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none resize-none ${inputCls}`}
            />
          </div>

          <div>
            <label className={`text-xs mb-1.5 block ${labelCls}`}>Términos y condiciones</label>
            <textarea
              value={terminos}
              onChange={(e) => setTerminos(e.target.value.slice(0, 1000))}
              placeholder="Ej: Válido solo para clientes nuevos. No acumulable con otras promociones..."
              rows={3}
              className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none resize-none ${inputCls}`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`text-xs mb-1.5 block ${labelCls}`}>Precio</label>
              <input
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                placeholder="Ej: $1.500"
                className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none ${inputCls}`}
              />
            </div>
            <div>
              <label className={`text-xs mb-1.5 block ${labelCls}`}>Valida hasta</label>
              <input
                type="date"
                value={validaHasta}
                onChange={(e) => setValidaHasta(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none ${inputCls}`}
              />
            </div>
          </div>

          <div>
            <label className={`text-xs mb-1.5 block ${labelCls}`}>Foto del producto</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => photoRef.current?.click()}
                className={`w-16 h-16 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-colors ${
                  isDark ? "border-gray-700 hover:border-gray-500 bg-gray-800" : "border-gray-300 hover:border-gray-400 bg-gray-50"
                }`}
              >
                {photoPreview ? (
                  <Image src={photoPreview} alt="preview" fill className="object-cover" unoptimized />
                ) : (
                  <ImageIcon className={`w-5 h-5 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
                )}
              </button>
              {photoPreview && (
                <button
                  type="button"
                  onClick={() => { setPhotoFile(null); setPhotoPreview(null); setClearPhoto(true); }}
                  className={`text-xs ${isDark ? "text-red-400 hover:text-red-300" : "text-red-500"}`}
                >
                  Quitar foto
                </button>
              )}
            </div>
            <input
              ref={photoRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                setPhotoFile(f);
                setPhotoPreview(URL.createObjectURL(f));
              }}
            />
          </div>

          {error && (
            <p className={`text-sm px-3 py-2 rounded-xl border ${isDark ? "text-red-400 bg-red-900/20 border-red-800" : "text-red-600 bg-red-50 border-red-200"}`}>
              {error}
            </p>
          )}
        </div>

        <div className={`flex gap-3 p-5 pt-3 flex-shrink-0 border-t ${isDark ? "border-gray-800" : "border-gray-100"}`}>
          <button
            onClick={onClose}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${isDark ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !titulo.trim()}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-white text-gray-900 hover:bg-gray-100 transition-colors disabled:opacity-40"
          >
            {loading ? "Guardando..." : editing ? "Guardar cambios" : "Publicar oferta"}
          </button>
        </div>
      </div>
    </div>
  );
}
