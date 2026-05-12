"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";
import { X, ImageIcon, Camera, Sparkles } from "lucide-react";
import type { Producto } from "../../../types";
import { compressImageForAi } from "../../../lib/utils/imageUtils";

import { API_URL } from "../../../lib/api/client";

interface Props {
  isDark: boolean;
  onClose: () => void;
  onSaved: (p: Producto) => void;
  editing?: Producto;
}

export function StoreProductModal({ isDark, onClose, onSaved, editing }: Props) {
  const { getToken } = useAuth();
  const [nombre, setNombre] = useState(editing?.nombre ?? "");
  const [tipo, setTipo] = useState<"producto" | "servicio">(editing?.tipo ?? "producto");
  const [descripcion, setDescripcion] = useState(editing?.descripcion ?? "");
  const [precio, setPrecio] = useState(editing?.precio ?? "");
  const [stock, setStock] = useState<string>(editing?.stock?.toString() ?? "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    editing?.foto ? (editing.foto.startsWith("/uploads/") ? `${editing.foto}` : editing.foto) : null
  );
  const [clearPhoto, setClearPhoto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [generatingImg, setGeneratingImg] = useState(false);
  const [imgGenError, setImgGenError] = useState("");
  const [aiGeneratedUrl, setAiGeneratedUrl] = useState("");
  const [error, setError] = useState("");
  const photoRef = useRef<HTMLInputElement>(null);
  const aiPhotoRef = useRef<HTMLInputElement>(null);

  const bg = isDark ? "bg-gray-900" : "bg-white";
  const inputCls = isDark
    ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400";
  const labelCls = isDark ? "text-gray-400" : "text-gray-500";

  function setSelectedPhoto(file: File) {
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setClearPhoto(false);
  }

  async function handleSmartPhoto(file: File) {
    setAiLoading(true);
    setAiMessage("");
    setError("");
    try {
      const preparedFile = await compressImageForAi(file);
      setSelectedPhoto(preparedFile);
      const token = await getToken();
      const fd = new FormData();
      fd.append("photo", preparedFile);
      const res = await fetch(`/api/comercios/me/productos/autocompletar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = (await res.json()) as {
        nombre?: string;
        precio?: string;
        descripcion?: string;
        tipo?: "producto" | "servicio";
        confianza?: number;
        notas?: string;
        error?: string;
        message?: string;
      };
      if (!res.ok) throw new Error(data.message || data.error || "No se pudo analizar la foto");

      const extractedTipo = (data.tipo === "servicio" || data.tipo === "producto") ? data.tipo : tipo;
      const extractedNombre = data.nombre || "";
      const extractedDescripcion = data.descripcion || "";

      if (data.tipo === "servicio" || data.tipo === "producto") setTipo(data.tipo);
      if (extractedNombre) setNombre(extractedNombre);
      if (data.precio) setPrecio(data.precio);
      if (extractedDescripcion) setDescripcion(extractedDescripcion);

      const confidence = typeof data.confianza === "number" ? data.confianza : 0;
      const foundSomething = extractedNombre || data.precio || extractedDescripcion;
      if (!foundSomething) {
        setAiMessage("No se detectaron datos claros. Podés completar los campos manualmente.");
      } else if (confidence < 0.55) {
        setAiMessage("Datos completados con baja confianza. Revisalos antes de publicar.");
      } else {
        setAiMessage("Datos completados. Revisalos y usá el botón ✨ para generar la imagen de catálogo.");
      }
      void extractedTipo;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "No se pudo analizar la foto");
    } finally {
      setAiLoading(false);
    }
  }

  async function handleGenerateImage(
    nombreVal = nombre,
    descripcionVal = descripcion,
    tipoVal = tipo,
    photoFileVal: File | null = photoFile,
  ) {
    if (!nombreVal.trim() || generatingImg) return;
    if (!photoFileVal) {
      setImgGenError("Necesitás subir una foto del producto primero.");
      return;
    }
    setGeneratingImg(true);
    setImgGenError("");
    try {
      const token = await getToken();
      const fd = new FormData();
      fd.append("photo", photoFileVal);
      fd.append("nombre", nombreVal.trim());
      fd.append("descripcion", descripcionVal);
      fd.append("tipo", tipoVal);
      const res = await fetch(`/api/comercios/me/productos/generar-imagen`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const text = await res.text();
      let data: { url?: string; error?: string; message?: string } = {};
      try { data = JSON.parse(text); } catch { /**/ }
      if (!res.ok) {
        if (data.error === "CREDITS_EXHAUSTED") {
          setImgGenError("⚡ Créditos de IA agotados. Activá el plan Premium para seguir generando imágenes de catálogo.");
          return;
        }
        throw new Error(data.message || data.error || "No se pudo generar la imagen");
      }
      const fullUrl = data.url!.startsWith("http") ? data.url! : `${data.url}`;
      setPhotoPreview(fullUrl);
      setPhotoFile(null);
      setClearPhoto(false);
      setAiGeneratedUrl(fullUrl);
      setAiMessage("Imagen de catálogo generada. Revisá los datos y publicá.");
    } catch (e: unknown) {
      setImgGenError(e instanceof Error ? e.message : "No se pudo generar la imagen");
    } finally {
      setGeneratingImg(false);
    }
  }

  async function handleSubmit() {
    if (!nombre.trim()) { setError("El nombre es obligatorio"); return; }
    setLoading(true);
    setError("");
    try {
      const token = await getToken();
      const fd = new FormData();
      fd.append("nombre", nombre.trim());
      fd.append("tipo", tipo);
      if (descripcion.trim()) fd.append("descripcion", descripcion.trim());
      if (precio.trim()) fd.append("precio", precio.trim());
      if (stock !== "") fd.append("stock", stock);
      if (photoFile) fd.append("photo", photoFile);
      else if (aiGeneratedUrl) fd.append("generatedPhotoUrl", aiGeneratedUrl);
      if (clearPhoto && !photoFile && !aiGeneratedUrl) fd.append("clearPhoto", "1");

      const url = editing
        ? `/api/comercios/me/productos/${editing.id}`
        : `/api/comercios/me/productos`;
      const res = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Error al guardar");
      }
      onSaved(await res.json());
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
          <h2 className={`font-bold text-base ${isDark ? "text-white" : "text-gray-900"}`}>
            {editing ? "Editar producto" : "Nuevo producto"}
          </h2>
          <button onClick={onClose} className={`p-1.5 rounded-lg ${isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"}`}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto p-5">
          {!editing && (
            <div className={`rounded-xl border p-3 ${isDark ? "border-blue-900/60 bg-blue-950/25" : "border-blue-100 bg-blue-50"}`}>
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 h-9 w-9 rounded-lg flex items-center justify-center ${isDark ? "bg-blue-500/15 text-blue-300" : "bg-blue-100 text-blue-700"}`}>
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-semibold ${isDark ? "text-blue-100" : "text-blue-950"}`}>Autocompletar con IA</p>
                  <p className={`text-xs mt-0.5 ${isDark ? "text-blue-200/75" : "text-blue-800/80"}`}>Sacá una foto del producto, etiqueta o cartel de precio.</p>
                  <button
                    type="button"
                    onClick={() => aiPhotoRef.current?.click()}
                    disabled={aiLoading}
                    className={`mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${
                      isDark ? "bg-blue-400 text-blue-950 hover:bg-blue-300" : "bg-blue-700 text-white hover:bg-blue-800"
                    }`}
                  >
                    <Camera className="w-4 h-4" />
                    {aiLoading ? "Analizando..." : "Abrir cámara"}
                  </button>
                </div>
              </div>
              <input
                ref={aiPhotoRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.currentTarget.value = "";
                  if (!f) return;
                  handleSmartPhoto(f);
                }}
              />
            </div>
          )}

          <div>
            <label className={`text-xs mb-1.5 block ${labelCls}`}>Tipo *</label>
            <div className={`flex rounded-xl border overflow-hidden ${isDark ? "border-gray-700" : "border-gray-200"}`}>
              {(["producto", "servicio"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTipo(t)}
                  className={`flex-1 py-2.5 text-sm font-medium capitalize transition-colors ${
                    tipo === t
                      ? isDark ? "bg-white text-gray-900" : "bg-gray-900 text-white"
                      : isDark ? "text-gray-400 hover:bg-gray-800" : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={`text-xs mb-1.5 block ${labelCls}`}>Nombre *</label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder={tipo === "servicio" ? "Ej: Desarrollo de aplicaciones web" : "Ej: Medialunas de manteca"}
              className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none ${inputCls}`}
            />
          </div>

          <div>
            <label className={`text-xs mb-1.5 block ${labelCls}`}>Descripcion</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value.slice(0, 500))}
              placeholder="Ingredientes, características, detalles..."
              rows={3}
              className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none resize-none ${inputCls}`}
            />
          </div>

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
            <label className={`text-xs mb-1.5 block ${labelCls}`}>Stock disponible</label>
            <input
              type="number"
              min="0"
              placeholder="Sin limite"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none ${inputCls}`}
            />
            <p className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              Dejar vacio para producto sin limite de stock
            </p>
          </div>

          <div>
            <label className={`text-xs mb-1.5 block ${labelCls}`}>Foto del producto</label>
            <div className="flex items-center gap-3 flex-wrap">
              {/* blob: or R2 preview — keep plain img since state can hold either */}
              <button
                type="button"
                onClick={() => photoRef.current?.click()}
                className={`w-16 h-16 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-colors flex-shrink-0 ${
                  isDark ? "border-gray-700 hover:border-gray-500 bg-gray-800" : "border-gray-300 hover:border-gray-400 bg-gray-50"
                }`}
              >
                {photoPreview
                  ? <Image src={photoPreview} alt="preview" fill className="object-cover" unoptimized />
                  : <ImageIcon className={`w-5 h-5 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
                }
              </button>
              <div className="flex flex-col gap-1.5">
                {nombre.trim() && (
                  <button
                    type="button"
                    onClick={() => handleGenerateImage()}
                    disabled={generatingImg || aiLoading}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${
                      isDark
                        ? "bg-purple-500/20 text-purple-300 border border-purple-700 hover:bg-purple-500/30"
                        : "bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {generatingImg ? "Generando..." : "Generar imagen IA"}
                  </button>
                )}
                {photoPreview && (
                  <button
                    type="button"
                    onClick={() => { setPhotoFile(null); setPhotoPreview(null); setClearPhoto(true); setImgGenError(""); setAiGeneratedUrl(""); }}
                    className={`text-xs ${isDark ? "text-red-400 hover:text-red-300" : "text-red-500"}`}
                  >
                    Quitar foto
                  </button>
                )}
              </div>
            </div>
            <input
              ref={photoRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; setSelectedPhoto(f); }}
            />
            {imgGenError && (
              imgGenError.startsWith("⚡") ? (
                <div className={`mt-2 px-3 py-2 rounded-lg border text-xs ${isDark ? "bg-amber-900/20 border-amber-700 text-amber-300" : "bg-amber-50 border-amber-200 text-amber-800"}`}>
                  <p className="font-semibold">{imgGenError}</p>
                  <a
                    href="/comercio/gestionar?upgrade=1"
                    className={`mt-1 inline-block underline font-bold ${isDark ? "text-amber-400" : "text-amber-600"}`}
                  >
                    Ver planes →
                  </a>
                </div>
              ) : (
                <p className={`mt-2 text-xs px-2 py-1.5 rounded-lg border ${isDark ? "text-red-400 bg-red-900/20 border-red-800" : "text-red-600 bg-red-50 border-red-200"}`}>
                  {imgGenError}
                </p>
              )
            )}
          </div>

          {aiMessage && (
            <p className={`text-sm px-3 py-2 rounded-xl border ${isDark ? "text-blue-200 bg-blue-950/30 border-blue-900" : "text-blue-800 bg-blue-50 border-blue-100"}`}>
              {aiMessage}
            </p>
          )}
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
            disabled={loading || aiLoading || !nombre.trim()}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-white text-gray-900 hover:bg-gray-100 transition-colors disabled:opacity-40"
          >
            {loading ? "Guardando..." : editing ? "Guardar cambios" : `Publicar ${tipo}`}
          </button>
        </div>
      </div>
    </div>
  );
}
