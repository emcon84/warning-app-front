"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Plus, X, Pencil } from "lucide-react";
import type { Comercio } from "@/types";
import { resolvePhotoUrl } from "@/lib/utils/photo";

import { API_URL } from "@/lib/api/client";

interface Props {
  comercio: Comercio;
  isDark: boolean;
  getHeaders: () => Record<string, string>;
  onComercioUpdate: (updated: Partial<Comercio>) => void;
}

export function StorePhotosTab({ comercio, isDark, getHeaders, onComercioUpdate }: Props) {
  const [newLogoFile, setNewLogoFile] = useState<File | null>(null);
  const [newLogoPreview, setNewLogoPreview] = useState<string | null>(null);
  const [newMainFile, setNewMainFile] = useState<File | null>(null);
  const [newMainPreview, setNewMainPreview] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const logoRef = useRef<HTMLInputElement>(null);
  const mainPhotoRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const cardBg = isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";
  const textPri = isDark ? "text-white" : "text-gray-900";
  const textMuted = isDark ? "text-gray-600" : "text-gray-400";

  const existingFotos = comercio.fotos ?? [];
  const canAddGallery = galleryFiles.length + existingFotos.length < 6;

  async function handleSave() {
    if (!newLogoFile && !newMainFile && galleryFiles.length === 0) return;
    setSaving(true);
    setError("");
    try {
      const fd = new FormData();
      if (newLogoFile) fd.append("logo", newLogoFile);
      if (newMainFile) fd.append("photo", newMainFile);
      galleryFiles.forEach((f, i) => fd.append(`photo${i}`, f));

      const res = await fetch(`${API_URL}/api/comercios/me`, {
        method: "PUT",
        headers: getHeaders(),
        body: fd,
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Error al guardar fotos");
      }
      const updated = await res.json();
      onComercioUpdate(updated);
      setNewLogoFile(null);
      setNewLogoPreview(null);
      setNewMainFile(null);
      setNewMainPreview(null);
      setGalleryFiles([]);
      setGalleryPreviews([]);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteFoto(url: string) {
    try {
      await fetch(`${API_URL}/api/comercios/me/fotos`, {
        method: "DELETE",
        headers: { ...getHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      onComercioUpdate({ fotos: existingFotos.filter((f) => f !== url) });
    } catch { /**/ }
  }

  const logoSrc = comercio.logo || comercio.foto;

  return (
    <div className="flex flex-col gap-4">
      {/* Logo */}
      <div className={`rounded-2xl border p-5 ${cardBg}`}>
        <p className={`text-sm font-semibold mb-1 ${textPri}`}>Logo del comercio</p>
        <p className={`text-xs mb-4 ${textMuted}`}>Aparece como avatar circular en el perfil y en el listado</p>
        <div className="flex items-center gap-4">
          <div
            onClick={() => logoRef.current?.click()}
            className="w-20 h-20 rounded-full overflow-hidden border-2 cursor-pointer flex-shrink-0 relative group"
          >
            {newLogoPreview ? (
              <Image src={newLogoPreview} alt="logo preview" fill className="object-cover" unoptimized />
            ) : logoSrc ? (
              <Image
                src={resolvePhotoUrl(logoSrc)}
                alt={comercio.nombre}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center text-3xl font-bold ${isDark ? "bg-gray-800 text-gray-500" : "bg-gray-100 text-gray-400"}`}>
                {comercio.nombre[0].toUpperCase()}
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Pencil className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <p className={`text-sm font-medium ${textPri}`}>{newLogoPreview ? "Nuevo logo seleccionado" : "Logo actual"}</p>
            <p className={`text-xs mt-1 ${textMuted}`}>Clic para cambiar · cuadrado o circular, min 200x200px</p>
            {newLogoPreview && (
              <button onClick={() => { setNewLogoFile(null); setNewLogoPreview(null); }} className={`text-xs mt-1 ${isDark ? "text-red-400" : "text-red-500"}`}>
                Descartar
              </button>
            )}
          </div>
        </div>
        <input
          ref={logoRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; setNewLogoFile(f); setNewLogoPreview(URL.createObjectURL(f)); }}
        />
      </div>

      {/* Portada */}
      <div className={`rounded-2xl border p-5 ${cardBg}`}>
        <p className={`text-sm font-semibold mb-1 ${textPri}`}>Foto de portada</p>
        <p className={`text-xs mb-4 ${textMuted}`}>Imagen de fondo del hero en el perfil del comercio</p>
        <div className="flex items-center gap-4">
          <div
            onClick={() => mainPhotoRef.current?.click()}
            className={`w-32 h-20 rounded-xl overflow-hidden border-2 cursor-pointer flex-shrink-0 relative group ${isDark ? "border-gray-700" : "border-gray-200"}`}
          >
            {newMainPreview ? (
              <Image src={newMainPreview} alt="portada preview" fill className="object-cover" unoptimized />
            ) : comercio.foto ? (
              <Image
                src={resolvePhotoUrl(comercio.foto)}
                alt={comercio.nombre}
                width={128}
                height={80}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center text-xs ${textMuted}`}>Sin portada</div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Pencil className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <p className={`text-sm font-medium ${textPri}`}>{newMainPreview ? "Nueva portada seleccionada" : "Portada actual"}</p>
            <p className={`text-xs mt-1 ${textMuted}`}>Clic para cambiar · landscape, min 800x400px</p>
            {newMainPreview && (
              <button onClick={() => { setNewMainFile(null); setNewMainPreview(null); }} className={`text-xs mt-1 ${isDark ? "text-red-400" : "text-red-500"}`}>
                Descartar
              </button>
            )}
          </div>
        </div>
        <input
          ref={mainPhotoRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; setNewMainFile(f); setNewMainPreview(URL.createObjectURL(f)); }}
        />
      </div>

      {/* Galería */}
      <div className={`rounded-2xl border p-5 ${cardBg}`}>
        <div className="flex items-center justify-between mb-4">
          <p className={`text-sm font-semibold ${textPri}`}>
            Galeria <span className={`font-normal text-xs ${textMuted}`}>({existingFotos.length + galleryFiles.length}/6)</span>
          </p>
          {canAddGallery && (
            <button
              onClick={() => galleryRef.current?.click()}
              className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl border transition-colors ${isDark ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
            >
              <Plus className="w-3.5 h-3.5" /> Agregar
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {existingFotos.map((url, i) => (
            <div key={i} className="relative aspect-square">
              <div className={`w-full h-full rounded-xl overflow-hidden border ${isDark ? "border-gray-800" : "border-gray-200"}`}>
                <Image
                  src={resolvePhotoUrl(url)}
                  alt={`Foto ${i + 1}`}
                  width={120}
                  height={120}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={() => handleDeleteFoto(url)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {/* blob: previews for newly selected files */}
          {galleryPreviews.map((src, i) => (
            <div key={`new-${i}`} className="relative aspect-square">
              <div className={`w-full h-full rounded-xl overflow-hidden border-2 border-dashed ${isDark ? "border-blue-700" : "border-blue-300"}`}>
                <Image src={src} alt={`Nueva ${i + 1}`} fill className="object-cover" unoptimized />
              </div>
              <button
                onClick={() => {
                  setGalleryFiles((prev) => prev.filter((_, j) => j !== i));
                  setGalleryPreviews((prev) => prev.filter((_, j) => j !== i));
                }}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {existingFotos.length + galleryFiles.length === 0 && (
            <button
              onClick={() => galleryRef.current?.click()}
              className={`aspect-square col-span-3 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors ${
                isDark ? "border-gray-700 text-gray-600 hover:border-gray-500" : "border-gray-300 text-gray-400 hover:border-gray-400"
              }`}
            >
              <Plus className="w-6 h-6" />
              <span className="text-xs">Agregar fotos del local</span>
            </button>
          )}
        </div>

        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (!e.target.files) return;
            const remaining = 6 - existingFotos.length - galleryFiles.length;
            const newFiles = Array.from(e.target.files).slice(0, remaining);
            setGalleryFiles((prev) => [...prev, ...newFiles]);
            setGalleryPreviews((prev) => [...prev, ...newFiles.map((f) => URL.createObjectURL(f))]);
          }}
        />
      </div>

      {error && (
        <p className={`text-sm px-4 py-3 rounded-xl border ${isDark ? "text-red-400 bg-red-900/20 border-red-800" : "text-red-600 bg-red-50 border-red-200"}`}>
          {error}
        </p>
      )}

      {(newLogoFile || newMainFile || galleryFiles.length > 0) && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 rounded-2xl bg-white text-gray-900 font-semibold text-sm hover:bg-gray-100 transition-colors disabled:opacity-40"
        >
          {saving ? "Subiendo..." : "Guardar fotos"}
        </button>
      )}
    </div>
  );
}
