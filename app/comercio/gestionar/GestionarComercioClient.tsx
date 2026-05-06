"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTheme } from "../../contexts/ThemeContext";
import Navbar from "../../components/Navbar";
import { Comercio, ComercioOffer, Producto } from "../../types";
import {
  Store, ImageIcon, Tag, ShoppingBag, QrCode, BarChart2,
  Plus, Trash2, ToggleLeft, ToggleRight,
  X, Check, Pencil, ExternalLink, Share2,
  Eye, MessageCircle, Package, Camera, Sparkles, Megaphone,
  ArrowLeft,
} from "lucide-react";
import ComercioPostCard from "../../components/ComercioPostCard";
import type { ComercioPost } from "../../types";
import KitDigitalizacion from "./KitDigitalizacion";
import NuevoProductoWizard from "./NuevoProductoWizard";
import NuevoPostWizard from "./NuevoPostWizard";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const RUBROS = [
  "Almacén/Despensa", "Restaurante/Comida", "Indumentaria", "Calzado",
  "Electrónica", "Tecnología/Informática", "Ferretería", "Materiales/Construcción",
  "Farmacia", "Salud/Bienestar", "Peluquería/Estética",
  "Librería/Papelería", "Veterinaria", "Deportes", "Mueblería",
  "Joyería/Relojería", "Automotriz/Mecánica", "Inmobiliaria",
  "Seguros/Finanzas", "Educación/Clases", "Fotografía/Arte",
  "Contaduría/Administración", "Agro/Cerealista", "Otro",
];

const BARRIOS = [
  "Reconquista (toda la ciudad)",
  "Centro", "Barrio Norte", "Barrio Sur", "Barrio Oeste", "Villa del Parque",
  "Las Lomas", "Parque Industrial", "Barrio Newbery", "Villa Ocampo",
  "Los Lapachos", "San Cayetano", "Otro",
];

function photoUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return url.startsWith("/uploads/") ? `${API}${url}` : url;
}

async function compressImageForAi(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  const imageUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = document.createElement("img");
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = imageUrl;
    });
    const maxSide = 1600;
    const ratio = Math.min(1, maxSide / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * ratio));
    const height = Math.max(1, Math.round(image.height * ratio));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(image, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.78);
    });
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

type Tab = "datos" | "fotos" | "ofertas" | "productos" | "kit" | "stats" | "comunidad";

interface AnalyticsData {
  thisMonth: Record<string, number>;
  lastMonth: Record<string, number>;
  last30: Record<string, number>;
  dailyLast30: Record<string, Record<string, number>>;
}

interface Props {
  comercio: Comercio & { offers?: ComercioOffer[]; productos?: Producto[] };
}

// ─── Oferta Form Modal ───────────────────────────────────────────────────────

function OfertaModal({
  isDark,
  onClose,
  onSaved,
  editing,
}: {
  isDark: boolean;
  onClose: () => void;
  onSaved: (offer: ComercioOffer) => void;
  editing?: ComercioOffer;
}) {
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
    editing?.foto ? photoUrl(editing.foto) : null
  );
  const [clearPhoto, setClearPhoto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const photoRef = useRef<HTMLInputElement>(null);

  const bg      = isDark ? "bg-gray-900"  : "bg-white";
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
        ? `${API}/api/comercios/me/offers/${editing.id}`
        : `${API}/api/comercios/me/offers`;
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

          {/* Foto */}
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
                  <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
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

// ─── Producto Form Modal ─────────────────────────────────────────────────────

function ProductoModal({
  isDark,
  onClose,
  onSaved,
  editing,
}: {
  isDark: boolean;
  onClose: () => void;
  onSaved: (p: Producto) => void;
  editing?: Producto;
}) {
  const { getToken } = useAuth();
  const [nombre, setNombre] = useState(editing?.nombre ?? "");
  const [tipo, setTipo] = useState<"producto" | "servicio">(editing?.tipo ?? "producto");
  const [descripcion, setDescripcion] = useState(editing?.descripcion ?? "");
  const [precio, setPrecio] = useState(editing?.precio ?? "");
  const [stock, setStock] = useState<string>(editing?.stock?.toString() ?? "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(editing?.foto ? photoUrl(editing.foto) : null);
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
      const res = await fetch(`${API}/api/comercios/me/productos/autocompletar`, {
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
      const res = await fetch(`${API}/api/comercios/me/productos/generar-imagen`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const text = await res.text();
      let data: { url?: string; error?: string; message?: string } = {};
      try { data = JSON.parse(text); } catch {}
      if (!res.ok) {
        if (data.error === "CREDITS_EXHAUSTED") {
          setImgGenError("⚡ Créditos de IA agotados. Activá el plan Premium para seguir generando imágenes de catálogo.");
          return;
        }
        throw new Error(data.message || data.error || "No se pudo generar la imagen");
      }
      const fullUrl = data.url!.startsWith("http") ? data.url! : `${API}${data.url}`;
      // Usamos la URL de R2 directamente — sin re-descargar (evita CORS)
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
        ? `${API}/api/comercios/me/productos/${editing.id}`
        : `${API}/api/comercios/me/productos`;
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
          <h2 className={`font-bold text-base ${isDark ? "text-white" : "text-gray-900"}`}>{editing ? "Editar producto" : "Nuevo producto"}</h2>
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
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder={tipo === "servicio" ? "Ej: Desarrollo de aplicaciones web" : "Ej: Medialunas de manteca"} className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none ${inputCls}`} />
          </div>
          <div>
            <label className={`text-xs mb-1.5 block ${labelCls}`}>Descripcion</label>
            <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value.slice(0, 500))} placeholder="Ingredientes, características, detalles..." rows={3} className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none resize-none ${inputCls}`} />
          </div>
          <div>
            <label className={`text-xs mb-1.5 block ${labelCls}`}>Precio</label>
            <input value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="Ej: $1.500" className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none ${inputCls}`} />
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
            <p className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>Dejar vacio para producto sin limite de stock</p>
          </div>
          <div>
            <label className={`text-xs mb-1.5 block ${labelCls}`}>Foto del producto</label>
            <div className="flex items-center gap-3 flex-wrap">
              <button type="button" onClick={() => photoRef.current?.click()} className={`w-16 h-16 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-colors flex-shrink-0 ${isDark ? "border-gray-700 hover:border-gray-500 bg-gray-800" : "border-gray-300 hover:border-gray-400 bg-gray-50"}`}>
                {photoPreview ? <img src={photoPreview} alt="preview" className="w-full h-full object-cover" /> : <ImageIcon className={`w-5 h-5 ${isDark ? "text-gray-600" : "text-gray-400"}`} />}
              </button>
              <div className="flex flex-col gap-1.5">
                {nombre.trim() && (
                  <button
                    type="button"
                    onClick={() => handleGenerateImage()}
                    disabled={generatingImg || aiLoading}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${
                      isDark ? "bg-purple-500/20 text-purple-300 border border-purple-700 hover:bg-purple-500/30" : "bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {generatingImg ? "Generando..." : "Generar imagen IA"}
                  </button>
                )}
                {photoPreview && (
                  <button type="button" onClick={() => { setPhotoFile(null); setPhotoPreview(null); setClearPhoto(true); setImgGenError(""); setAiGeneratedUrl(""); }} className={`text-xs ${isDark ? "text-red-400 hover:text-red-300" : "text-red-500"}`}>Quitar foto</button>
                )}
              </div>
            </div>
            <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; setSelectedPhoto(f); }} />
            {imgGenError && (
              imgGenError.startsWith("⚡") ? (
                <div className={`mt-2 px-3 py-2 rounded-lg border text-xs ${isDark ? "bg-amber-900/20 border-amber-700 text-amber-300" : "bg-amber-50 border-amber-200 text-amber-800"}`}>
                  <p className="font-semibold">{imgGenError}</p>
                  <a href="/comercio/gestionar?upgrade=1" className={`mt-1 inline-block underline font-bold ${isDark ? "text-amber-400" : "text-amber-600"}`}>
                    Ver planes →
                  </a>
                </div>
              ) : (
                <p className={`mt-2 text-xs px-2 py-1.5 rounded-lg border ${isDark ? "text-red-400 bg-red-900/20 border-red-800" : "text-red-600 bg-red-50 border-red-200"}`}>{imgGenError}</p>
              )
            )}
          </div>
          {aiMessage && <p className={`text-sm px-3 py-2 rounded-xl border ${isDark ? "text-blue-200 bg-blue-950/30 border-blue-900" : "text-blue-800 bg-blue-50 border-blue-100"}`}>{aiMessage}</p>}
          {error && <p className={`text-sm px-3 py-2 rounded-xl border ${isDark ? "text-red-400 bg-red-900/20 border-red-800" : "text-red-600 bg-red-50 border-red-200"}`}>{error}</p>}
        </div>
        <div className={`flex gap-3 p-5 pt-3 flex-shrink-0 border-t ${isDark ? "border-gray-800" : "border-gray-100"}`}>
          <button onClick={onClose} className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${isDark ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>Cancelar</button>
          <button onClick={handleSubmit} disabled={loading || aiLoading || !nombre.trim()} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-white text-gray-900 hover:bg-gray-100 transition-colors disabled:opacity-40">
            {loading ? "Guardando..." : editing ? "Guardar cambios" : `Publicar ${tipo}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function GestionarComercioClient({ comercio: initial }: Props) {
  const router = useRouter();
  const { getToken } = useAuth();
  const { isDark } = useTheme();
  const searchParams = useSearchParams();
  const sectionParam = searchParams.get("section");
  const tabParam = searchParams.get("tab") as Tab | null;
  // section takes precedence over tab for backward compat
  const activeSection = sectionParam || tabParam;
  const [tab, setTab] = useState<Tab>((searchParams.get("tab") as Tab) ?? "datos");
  const [comercio, setComercio] = useState(initial);
  const [offers, setOffers] = useState<ComercioOffer[]>(initial.offers ?? []);
  const [showOfertaModal, setShowOfertaModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<ComercioOffer | undefined>(undefined);
  const [productos, setProductos] = useState<Producto[]>(initial.productos ?? []);
  const [showProductoModal, setShowProductoModal] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | undefined>(undefined);
  const [showWizard, setShowWizard] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Comunidad
  const [comunidadPosts, setComunidadPosts] = useState<ComercioPost[]>([]);
  const [loadingComunidad, setLoadingComunidad] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [showPostWizard, setShowPostWizard] = useState(false);
  const [postTipo, setPostTipo] = useState<"novedad" | "oferta" | "sorteo">("novedad");
  const [postContenido, setPostContenido] = useState("");
  const [postFoto, setPostFoto] = useState<File | null>(null);
  const [postFotoPreview, setPostFotoPreview] = useState<string | null>(null);
  const [postPrecioAntes, setPostPrecioAntes] = useState("");
  const [postPrecioDespues, setPostPrecioDespues] = useState("");
  const [postFechaSorteo, setPostFechaSorteo] = useState("");
  const [savingPost, setSavingPost] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  // Plan info
  const [planInfo, setPlanInfo] = useState<{
    plan: string;
    planName: string;
    limits: { dailyAi: number; totalProducts: number | "ilimitado" };
    usage: { productos: number; aiHoy: number; aiGlobalHoy: number };
    canUpgrade: boolean;
    upgradeUrl: string | null;
  } | null>(null);
  const [planLoading, setPlanLoading] = useState(true);
  const [showPlanModal, setShowPlanModal] = useState(false);

  // Fetch plan info on mount
  useEffect(() => {
    async function fetchPlan() {
      const token = await getToken();
      const res = await fetch(`${API}/api/comercios/me/plan`, {
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPlanInfo(data);
      }
      setPlanLoading(false);
    }
    fetchPlan();
  }, [getToken]);

  // Datos form state
  const [form, setForm] = useState({
    nombre: inicial(comercio.nombre),
    rubro: inicial(comercio.rubro),
    barrio: inicial(comercio.barrio),
    whatsapp: inicial(comercio.whatsapp),
    telefono: inicial(comercio.telefono ?? ""),
    direccion: inicial(comercio.direccion ?? ""),
    horario: inicial(comercio.horario ?? ""),
    descripcion: inicial(comercio.descripcion ?? ""),
  });
  const [savingDatos, setSavingDatos] = useState(false);
  const [datosSaved, setDatosSaved] = useState(false);
  const [datosError, setDatosError] = useState("");
  const [aceptaEnvios, setAceptaEnvios] = useState(comercio.aceptaEnvios ?? false);
  const [zonaEnvio, setZonaEnvio] = useState(comercio.zonaEnvio ?? "");
  const [costoEnvio, setCostoEnvio] = useState(comercio.costoEnvio ?? "");

  // Fotos
  const [newLogoFile, setNewLogoFile] = useState<File | null>(null);
  const [newLogoPreview, setNewLogoPreview] = useState<string | null>(null);
  const [newMainFile, setNewMainFile] = useState<File | null>(null);
  const [newMainPreview, setNewMainPreview] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [savingFotos, setSavingFotos] = useState(false);
  const [fotosError, setFotosError] = useState("");
  const logoRef = useRef<HTMLInputElement>(null);
  const mainPhotoRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  // Theme
  const bg         = isDark ? "bg-gray-950" : "bg-gray-50";
  const cardBg     = isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";
  const textPri    = isDark ? "text-white" : "text-gray-900";
  const textSec    = isDark ? "text-gray-400" : "text-gray-500";
  const textMuted  = isDark ? "text-gray-600" : "text-gray-400";
  const inputCls   = isDark
    ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-gray-500"
    : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-400";
  const inputColor = isDark ? "#f9fafb" : "#111827";
  const inputBg    = isDark ? "#1f2937" : "#ffffff";

  // ── Guardar datos ──────────────────────────────────────────────────────────
  async function handleSaveDatos() {
    setSavingDatos(true);
    setDatosError("");
    try {
      const token = await getToken();
      const fd = new FormData();
      fd.append("nombre", form.nombre.trim());
      fd.append("rubro", form.rubro);
      fd.append("barrio", form.barrio);
      fd.append("whatsapp", form.whatsapp.trim());
      fd.append("telefono", form.telefono.trim());
      fd.append("direccion", form.direccion.trim());
      fd.append("horario", form.horario.trim());
      fd.append("descripcion", form.descripcion.trim());
      fd.append("aceptaEnvios", String(aceptaEnvios));
      if (zonaEnvio) fd.append("zonaEnvio", zonaEnvio);
      if (costoEnvio) fd.append("costoEnvio", costoEnvio);

      const res = await fetch(`${API}/api/comercios/me`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Error al guardar");
      }
      const updated = await res.json();
      setComercio((prev) => ({ ...prev, ...updated }));
      setDatosSaved(true);
      setTimeout(() => setDatosSaved(false), 2500);
    } catch (e: any) {
      setDatosError(e.message);
    } finally {
      setSavingDatos(false);
    }
  }

  // ── Guardar fotos ──────────────────────────────────────────────────────────
  async function handleSaveFotos() {
    if (!newLogoFile && !newMainFile && galleryFiles.length === 0) return;
    setSavingFotos(true);
    setFotosError("");
    try {
      const token = await getToken();
      const fd = new FormData();
      if (newLogoFile) fd.append("logo", newLogoFile);
      if (newMainFile) fd.append("photo", newMainFile);
      galleryFiles.forEach((f, i) => fd.append(`photo${i}`, f));

      const res = await fetch(`${API}/api/comercios/me`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Error al guardar fotos");
      }
      const updated = await res.json();
      setComercio((prev) => ({ ...prev, ...updated }));
      setNewLogoFile(null);
      setNewLogoPreview(null);
      setNewMainFile(null);
      setNewMainPreview(null);
      setGalleryFiles([]);
      setGalleryPreviews([]);
    } catch (e: any) {
      setFotosError(e.message);
    } finally {
      setSavingFotos(false);
    }
  }

  // ── Eliminar foto galería ──────────────────────────────────────────────────
  async function handleDeleteFoto(url: string) {
    try {
      const token = await getToken();
      await fetch(`${API}/api/comercios/me/fotos`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      setComercio((prev) => ({ ...prev, fotos: (prev.fotos ?? []).filter((f) => f !== url) }));
    } catch {/* silent */}
  }

  // ── Toggle oferta ──────────────────────────────────────────────────────────
  async function handleToggleOffer(offer: ComercioOffer) {
    try {
      const token = await getToken();
      const res = await fetch(`${API}/api/comercios/me/offers/${offer.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ activa: !offer.activa }),
      });
      if (!res.ok) return;
      const updated = await res.json();
      setOffers((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    } catch {/* silent */}
  }

  // ── Eliminar oferta ────────────────────────────────────────────────────────
  async function handleDeleteOffer(offerId: string) {
    try {
      const token = await getToken();
      await fetch(`${API}/api/comercios/me/offers/${offerId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setOffers((prev) => prev.filter((o) => o.id !== offerId));
    } catch {/* silent */}
  }

  async function handleToggleProducto(p: Producto) {
    try {
      const token = await getToken();
      const res = await fetch(`${API}/api/comercios/me/productos/${p.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ activo: !p.activo }),
      });
      if (!res.ok) return;
      const updated = await res.json();
      setProductos((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    } catch {/* silent */}
  }

  async function handleDeleteProducto(id: string) {
    try {
      const token = await getToken();
      await fetch(`${API}/api/comercios/me/productos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setProductos((prev) => prev.filter((p) => p.id !== id));
    } catch {/* silent */}
  }

  useEffect(() => {
    if (tab !== "stats" || analytics) return;
    setAnalyticsLoading(true);
    getToken()
      .then((token) =>
        fetch(`${API}/api/comercios/me/analytics`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      )
      .then((r) => r.json())
      .then((d: AnalyticsData) => setAnalytics(d))
      .catch(() => {})
      .finally(() => setAnalyticsLoading(false));
  }, [tab, analytics, getToken]);

  useEffect(() => {
    if (tab !== "comunidad") return;
    setLoadingComunidad(true);
    fetch(`${API}/api/comercios/${comercio.slug}/posts?limit=20`)
      .then(r => r.json())
      .then(d => { if (d.posts) setComunidadPosts(d.posts); })
      .catch(() => {})
      .finally(() => setLoadingComunidad(false));
  }, [tab, comercio.slug]);

  async function handlePublicarPost() {
    if (!postContenido.trim()) return;
    setSavingPost(true);
    setPostError(null);
    try {
      const token = await getToken();
      const fd = new FormData();
      fd.append("tipo", postTipo);
      fd.append("contenido", postContenido.trim());
      if (postFoto) fd.append("photo", postFoto);
      if (postTipo === "oferta") {
        if (postPrecioAntes) fd.append("precioAntes", postPrecioAntes);
        if (postPrecioDespues) fd.append("precioDespues", postPrecioDespues);
      }
      if (postTipo === "sorteo" && postFechaSorteo) fd.append("fechaSorteo", postFechaSorteo);
      const res = await fetch(`${API}/api/comercios/${comercio.slug}/posts`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) throw new Error("error");
      const newPost = await res.json();
      setComunidadPosts(prev => [newPost, ...prev]);
      setPostContenido("");
      setPostFoto(null);
      setPostFotoPreview(null);
      setPostPrecioAntes("");
      setPostPrecioDespues("");
      setPostFechaSorteo("");
      setShowPostForm(false);
    } catch {
      setPostError("No se pudo publicar. Intenta de nuevo.");
    } finally {
      setSavingPost(false);
    }
  }

  async function handleDeletePost(postId: string) {
    const token = await getToken();
    await fetch(`${API}/api/comercios/${comercio.slug}/posts/${postId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setComunidadPosts(prev => prev.filter(p => p.id !== postId));
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "datos",     label: "Datos",     icon: <Store className="w-4 h-4" /> },
    { id: "fotos",     label: "Fotos",     icon: <ImageIcon className="w-4 h-4" /> },
    { id: "productos", label: "Catálogo",  icon: <ShoppingBag className="w-4 h-4" /> },
    { id: "ofertas",   label: "Ofertas",   icon: <Tag className="w-4 h-4" /> },
    { id: "comunidad", label: "Comunidad", icon: <Megaphone className="w-4 h-4" /> },
    { id: "stats",     label: "Stats",     icon: <BarChart2 className="w-4 h-4" /> },
    { id: "kit",       label: "Mi Kit",    icon: <QrCode className="w-4 h-4" /> },
  ];

  // Section mapping for dashboard cards
  const SECTION_TABS: { id: Tab; section: string; icon: React.ReactNode; title: string; badge: string }[] = [
    { id: "datos", section: "datos", icon: <Store className="w-6 h-6" />, title: "Datos", badge: "" },
    { id: "fotos", section: "fotos", icon: <ImageIcon className="w-6 h-6" />, title: "Fotos", badge: `${comercio.fotos?.length ?? 0} fotos` },
    { id: "productos", section: "productos", icon: <ShoppingBag className="w-6 h-6" />, title: "Catálogo", badge: `${productos.length} items` },
    { id: "ofertas", section: "ofertas", icon: <Tag className="w-6 h-6" />, title: "Ofertas", badge: `${offers.length} ofertas` },
    { id: "comunidad", section: "comunidad", icon: <Megaphone className="w-6 h-6" />, title: "Comunidad", badge: `${comunidadPosts.length} posts` },
    { id: "stats", section: "stats", icon: <BarChart2 className="w-6 h-6" />, title: "Estadísticas", badge: "" },
    { id: "kit", section: "kit", icon: <QrCode className="w-6 h-6" />, title: "Mi Kit", badge: "" },
  ];

  const existingFotos = comercio.fotos ?? [];
  const canAddGallery = galleryFiles.length + existingFotos.length < 6;

  return (
    <div className={`min-h-screen ${bg} ${textPri} flex flex-col`}>
      <Navbar sidebarDisabled />

      {showOfertaModal && (
        <OfertaModal
          isDark={isDark}
          editing={editingOffer}
          onClose={() => { setShowOfertaModal(false); setEditingOffer(undefined); }}
          onSaved={(offer) => {
            setOffers((prev) =>
              editingOffer
                ? prev.map((o) => (o.id === offer.id ? offer : o))
                : [offer, ...prev]
            );
            setShowOfertaModal(false);
            setEditingOffer(undefined);
          }}
        />
      )}

      {showProductoModal && (
        <ProductoModal
          isDark={isDark}
          editing={editingProducto}
          onClose={() => { setShowProductoModal(false); setEditingProducto(undefined); }}
          onSaved={(p) => {
            setProductos((prev) =>
              editingProducto
                ? prev.map((x) => (x.id === p.id ? p : x))
                : [p, ...prev]
            );
            setShowProductoModal(false);
            setEditingProducto(undefined);
          }}
        />
      )}

      {showWizard && (
        <NuevoProductoWizard
          comercio={{
            id: comercio.id,
            nombre: comercio.nombre,
            slug: comercio.slug,
            logo: comercio.logo,
            whatsapp: comercio.whatsapp,
          }}
          getToken={getToken}
          onComplete={(prod) => {
            setProductos(prev => [{ ...prod, tipo: "producto", activo: true, comercioId: comercio.id, createdAt: new Date().toISOString(), stock: null } as any, ...prev]);
            setShowWizard(false);
          }}
          onClose={() => setShowWizard(false)}
        />
      )}

      <div className="flex-1 max-w-xl mx-auto w-full px-4 pt-20 pb-40">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 gap-3">
          <div className="min-w-0 flex-1 flex items-center gap-3">
            {activeSection && (
              <button
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.search = "";
                  router.replace(url.pathname);
                }}
                className={`flex-shrink-0 flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border transition-colors ${isDark ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Volver
              </button>
            )}
            <div className="min-w-0 flex-1">
              <h1 className={`text-xl font-black truncate ${textPri}`}>{comercio.nombre}</h1>
              <p className={`text-sm truncate ${textSec}`}>{comercio.rubro} · {comercio.barrio}</p>
            </div>
          </div>
          {!activeSection && (
            <button
              onClick={() => router.push(`/comercio/${comercio.slug}`)}
              className={`flex-shrink-0 flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border transition-colors ${isDark ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Ver perfil
            </button>
          )}
        </div>

        {/* Banner de plan con límites y uso */}
        {planLoading ? (
          <div className={`mb-6 h-20 rounded-2xl animate-pulse ${isDark ? "bg-gray-800" : "bg-gray-100"}`} />
        ) : planInfo?.plan === "master" ? (
          <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-2xl border border-amber-500/30 bg-amber-500/10">
            <span className="text-amber-400 text-lg">★</span>
            <div className="flex-1">
              <p className="text-xs font-bold text-amber-400">Plan Master</p>
              <p className={`text-xs ${textMuted}`}>Ilimitado · Soporte prioritario · Posición destacada</p>
            </div>
            <button
              onClick={() => setShowPlanModal(true)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-amber-500 text-amber-400 hover:bg-amber-500/20 transition-colors flex-shrink-0"
            >
              Ver planes
            </button>
          </div>
        ) : planInfo?.plan === "premium" ? (
          <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-2xl border border-indigo-500/30 bg-indigo-500/10">
            <span className="text-indigo-400 text-lg">✦</span>
            <div className="flex-1">
              <p className="text-xs font-bold text-indigo-400">Plan Premium</p>
              <p className={`text-xs ${textMuted}`}>
                {planInfo.usage.productos}/{planInfo.limits.totalProducts} productos · {planInfo.limits.dailyAi}/día IA
              </p>
            </div>
            <button
              onClick={() => setShowPlanModal(true)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-indigo-500 text-indigo-400 hover:bg-indigo-500/20 transition-colors flex-shrink-0"
            >
              Ver planes
            </button>
          </div>
        ) : (
          <div className={`mb-6 flex flex-col gap-2 px-4 py-3 rounded-2xl border ${isDark ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50"}`}>
            <div className="flex items-center gap-3">
              <span className={`text-lg ${textMuted}`}>○</span>
              <div className="flex-1">
                <p className={`text-xs font-bold ${textPri}`}>Plan Gratuito</p>
                <p className={`text-xs ${textMuted}`}>
                  {planInfo?.usage.productos ?? 0}/{planInfo?.limits.totalProducts ?? 50} productos
                </p>
              </div>
              <button
                onClick={() => setShowPlanModal(true)}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 transition-colors flex-shrink-0"
              >
                Upgrade
              </button>
            </div>
            {planInfo?.canUpgrade && planInfo.usage.productos >= (planInfo.limits.totalProducts as number) - 3 && (
              <p className="text-xs text-amber-500">¡Casi alcanzás el límite! Considerá pasar a Premium.</p>
            )}
          </div>
        )}

        {/* Tabs or Dashboard Grid */}
        {!activeSection && (
          <>
            <div className={`flex gap-1 p-1 rounded-2xl mb-6 overflow-x-auto ${isDark ? "bg-gray-900" : "bg-gray-100"}`}>
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex-shrink-0 flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl text-sm font-semibold transition-colors ${
                    tab === t.id
                      ? isDark ? "bg-white text-gray-900" : "bg-white text-gray-900 shadow-sm"
                      : isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>

            {/* Dashboard Card Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {SECTION_TABS.map((item) => (
                  <button
                    key={item.section}
                    onClick={() => {
                      const url = new URL(window.location.href);
                      url.searchParams.set("section", item.section);
                      router.replace(url.search);
                    }}
                    className={`rounded-2xl border p-5 flex flex-col items-center justify-center gap-3 text-center transition-all hover:scale-[1.02] ${
                      isDark ? "bg-gray-900 border-gray-800 hover:border-gray-600" : "bg-white border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <div className={`p-3 rounded-xl ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
                      {item.icon}
                    </div>
                    <div>
                      <p className={`font-bold ${textPri}`}>{item.title}</p>
                      {item.badge && <p className={`text-xs mt-1 ${textMuted}`}>{item.badge}</p>}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}

        {/* ── Tab: Datos ─────────────────────────────────────────────── */}
        {tab === "datos" && (
          <div className={`rounded-2xl border p-5 ${cardBg}`}>
            <div className="flex flex-col gap-4">
              {[
                { label: "Nombre del comercio", key: "nombre", placeholder: "Ej: Almacén El Cruce" },
                { label: "WhatsApp", key: "whatsapp", placeholder: "Ej: 3482123456" },
                { label: "Telefono", key: "telefono", placeholder: "Ej: 03482-XXXXXX", optional: true },
                { label: "Direccion", key: "direccion", placeholder: "Ej: San Martín 1234", optional: true },
                { label: "Horario", key: "horario", placeholder: "Ej: Lunes a Viernes 9 a 18hs", optional: true },
              ].map(({ label, key, placeholder, optional }) => (
                <div key={key}>
                  <label className={`text-xs mb-1.5 block ${textSec}`}>
                    {label} {optional && <span className={textMuted}>(opcional)</span>}
                  </label>
                  <input
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    style={{ color: inputColor, backgroundColor: inputBg }}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none ${inputCls}`}
                  />
                </div>
              ))}

              <div>
                <label className={`text-xs mb-1.5 block ${textSec}`}>Rubro</label>
                <select
                  value={form.rubro}
                  onChange={(e) => setForm((f) => ({ ...f, rubro: e.target.value }))}
                  style={{ color: inputColor, backgroundColor: inputBg }}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none ${inputCls}`}
                >
                  {RUBROS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div>
                <label className={`text-xs mb-1.5 block ${textSec}`}>Barrio</label>
                <select
                  value={form.barrio}
                  onChange={(e) => setForm((f) => ({ ...f, barrio: e.target.value }))}
                  style={{ color: inputColor, backgroundColor: inputBg }}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none ${inputCls}`}
                >
                  {BARRIOS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              <div>
                <label className={`text-xs mb-1.5 block ${textSec}`}>
                  Descripcion <span className={textMuted}>({form.descripcion.length}/500)</span>
                </label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value.slice(0, 500) }))}
                  placeholder="Que venden, horarios especiales, delivery, etc."
                  rows={4}
                  style={{ color: inputColor, backgroundColor: inputBg }}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none resize-none ${inputCls}`}
                />
              </div>

              {/* Envios */}
              <div className={`rounded-2xl border p-4 ${isDark ? "border-gray-800 bg-gray-900/50" : "border-gray-200 bg-gray-50"}`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Envios a domicilio</p>
                    <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>Tus clientes veran si hacen envios al armar el pedido</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAceptaEnvios(!aceptaEnvios)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${aceptaEnvios ? "bg-amber-500" : isDark ? "bg-gray-700" : "bg-gray-300"}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${aceptaEnvios ? "translate-x-5" : ""}`} />
                  </button>
                </div>
                {aceptaEnvios && (
                  <div className="flex flex-col gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Zona de envio (ej: Toda la ciudad, Centro)"
                      value={zonaEnvio}
                      onChange={(e) => setZonaEnvio(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none ${inputCls}`}
                    />
                    <input
                      type="text"
                      placeholder="Costo de envio (ej: Gratis, $500, A coordinar)"
                      value={costoEnvio}
                      onChange={(e) => setCostoEnvio(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none ${inputCls}`}
                    />
                  </div>
                )}
              </div>

              {datosError && (
                <p className={`text-sm px-3 py-2 rounded-xl border ${isDark ? "text-red-400 bg-red-900/20 border-red-800" : "text-red-600 bg-red-50 border-red-200"}`}>
                  {datosError}
                </p>
              )}

              <button
                onClick={handleSaveDatos}
                disabled={savingDatos}
                className="w-full py-3 rounded-2xl bg-white text-gray-900 font-semibold text-sm hover:bg-gray-100 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {datosSaved ? <><Check className="w-4 h-4 text-green-600" /> Guardado</> : savingDatos ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </div>
        )}

        {/* ── Tab: Fotos ─────────────────────────────────────────────── */}
        {tab === "fotos" && (
          <div className="flex flex-col gap-4">

            {/* Logo del comercio */}
            <div className={`rounded-2xl border p-5 ${cardBg}`}>
              <p className={`text-sm font-semibold mb-1 ${textPri}`}>Logo del comercio</p>
              <p className={`text-xs mb-4 ${textMuted}`}>Aparece como avatar circular en el perfil y en el listado</p>
              <div className="flex items-center gap-4">
                <div
                  onClick={() => logoRef.current?.click()}
                  className="w-20 h-20 rounded-full overflow-hidden border-2 cursor-pointer flex-shrink-0 relative group"
                >
                  {newLogoPreview ? (
                    <img src={newLogoPreview} alt="logo preview" className="w-full h-full object-cover" />
                  ) : photoUrl(comercio.logo || comercio.foto) ? (
                    <Image
                      src={photoUrl(comercio.logo || comercio.foto)!}
                      alt={comercio.nombre}
                      width={80} height={80}
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
              <input ref={logoRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; setNewLogoFile(f); setNewLogoPreview(URL.createObjectURL(f)); }}
              />
            </div>

            {/* Foto de portada */}
            <div className={`rounded-2xl border p-5 ${cardBg}`}>
              <p className={`text-sm font-semibold mb-1 ${textPri}`}>Foto de portada</p>
              <p className={`text-xs mb-4 ${textMuted}`}>Imagen de fondo del hero en el perfil del comercio</p>
              <div className="flex items-center gap-4">
                <div
                  onClick={() => mainPhotoRef.current?.click()}
                  className={`w-32 h-20 rounded-xl overflow-hidden border-2 cursor-pointer flex-shrink-0 relative group ${isDark ? "border-gray-700" : "border-gray-200"}`}
                >
                  {newMainPreview ? (
                    <img src={newMainPreview} alt="portada preview" className="w-full h-full object-cover" />
                  ) : photoUrl(comercio.foto) ? (
                    <Image
                      src={photoUrl(comercio.foto)!}
                      alt={comercio.nombre}
                      width={128} height={80}
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
              <input ref={mainPhotoRef} type="file" accept="image/*" className="hidden"
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
                        src={photoUrl(url)!}
                        alt={`Foto ${i + 1}`}
                        width={120} height={120}
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

                {galleryPreviews.map((src, i) => (
                  <div key={`new-${i}`} className="relative aspect-square">
                    <div className={`w-full h-full rounded-xl overflow-hidden border-2 border-dashed ${isDark ? "border-blue-700" : "border-blue-300"}`}>
                      <img src={src} alt={`Nueva ${i + 1}`} className="w-full h-full object-cover" />
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

            {fotosError && (
              <p className={`text-sm px-4 py-3 rounded-xl border ${isDark ? "text-red-400 bg-red-900/20 border-red-800" : "text-red-600 bg-red-50 border-red-200"}`}>
                {fotosError}
              </p>
            )}

            {(newLogoFile || newMainFile || galleryFiles.length > 0) && (
              <button
                onClick={handleSaveFotos}
                disabled={savingFotos}
                className="w-full py-3 rounded-2xl bg-white text-gray-900 font-semibold text-sm hover:bg-gray-100 transition-colors disabled:opacity-40"
              >
                {savingFotos ? "Subiendo..." : "Guardar fotos"}
              </button>
            )}
          </div>
        )}

        {/* ── Tab: Productos ─────────────────────────────────────────── */}
        {tab === "productos" && (
          <div className="flex flex-col gap-3">
            {!initial.isPremium && productos.length >= 10 ? (
              <div className={`rounded-2xl border p-4 flex flex-col gap-2 ${isDark ? "bg-yellow-900/10 border-yellow-800/40" : "bg-yellow-50 border-yellow-200"}`}>
                <p className={`text-sm font-bold ${isDark ? "text-yellow-400" : "text-yellow-700"}`}>★ Límite del plan gratuito alcanzado</p>
                <p className={`text-xs ${isDark ? "text-yellow-600" : "text-yellow-600"}`}>Tenés 10 items en tu catálogo. Pasate al plan Premium para agregar más.</p>
                <a
                  href={`https://wa.me/3482445015?text=${encodeURIComponent(`Hola! Quiero activar el plan Premium para mi comercio en Reportes Reconquista.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 py-2.5 rounded-xl text-sm font-semibold bg-yellow-500 hover:bg-yellow-400 text-gray-900 text-center transition-colors"
                >
                  Consultar plan Premium
                </a>
              </div>
            ) : (
              <button
                onClick={() => setShowWizard(true)}
                className="w-full py-3 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm bg-white text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <Plus className="w-4 h-4" /> Agregar al catálogo
              </button>
            )}

            {productos.length === 0 ? (
              <div className={`py-12 text-center rounded-2xl border ${cardBg}`}>
                <ShoppingBag className={`w-8 h-8 mx-auto mb-3 ${textMuted}`} />
                <p className={`text-sm ${textMuted}`}>No hay items en el catálogo aun.</p>
                <p className={`text-xs mt-1 ${isDark ? "text-gray-700" : "text-gray-300"}`}>Agregá productos o servicios con el boton de arriba.</p>
              </div>
            ) : (
              productos.map((p) => (
                <ProductoRow
                  key={p.id}
                  producto={p}
                  slug={comercio.slug}
                  isDark={isDark}
                  cardBg={cardBg}
                  textPri={textPri}
                  textSec={textSec}
                  textMuted={textMuted}
                  onToggle={() => handleToggleProducto(p)}
                  onDelete={() => handleDeleteProducto(p.id)}
                  onEdit={() => { setEditingProducto(p); setShowProductoModal(true); }}
                />
              ))
            )}
          </div>
        )}

        {/* ── Tab: Stats ─────────────────────────────────────────────── */}
        {tab === "stats" && (
          <div className="px-4 py-5 space-y-6">
            <div>
              <p className={`text-base font-bold ${textPri}`}>Estadísticas</p>
              <p className={`text-xs mt-0.5 ${textMuted}`}>Rendimiento de tu comercio este mes</p>
            </div>

            {analyticsLoading && (
              <div className="flex justify-center py-12">
                <div className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin ${isDark ? "border-gray-600" : "border-gray-300"}`} />
              </div>
            )}

            {!analyticsLoading && analytics && (
              <>
                {/* 4 Metric Cards */}
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { key: "profile_view",   label: "Visitas al perfil",    Icon: Eye,            color: "text-indigo-400" },
                    { key: "whatsapp_click", label: "Clicks en WhatsApp",   Icon: MessageCircle,  color: "text-green-400" },
                    { key: "product_view",   label: "Vistas de productos",  Icon: Package,        color: "text-blue-400" },
                    { key: "offer_view",     label: "Vistas de ofertas",    Icon: Tag,            color: "text-amber-400" },
                  ] as const).map(({ key, label, Icon, color }) => {
                    const current = analytics.thisMonth[key] ?? 0;
                    const prev = analytics.lastMonth[key] ?? 0;
                    const pct = prev === 0 ? null : Math.round(((current - prev) / prev) * 100);
                    const up = pct !== null && pct >= 0;
                    return (
                      <div key={key} className={`rounded-2xl border p-4 ${cardBg}`}>
                        <Icon className={`w-5 h-5 mb-2 ${color}`} />
                        <p className={`text-2xl font-black ${textPri}`}>{current}</p>
                        <p className={`text-xs ${textMuted} mt-0.5`}>{label}</p>
                        {pct !== null && (
                          <p className={`text-xs font-semibold mt-1 ${up ? "text-green-500" : "text-red-400"}`}>
                            {up ? "+" : ""}{pct}% vs mes anterior
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Bar chart últimos 30 días */}
                <div className={`rounded-2xl border p-4 ${cardBg}`}>
                  <p className={`text-sm font-semibold mb-4 ${textPri}`}>Últimos 30 días</p>
                  <AnalyticsBarChart data={analytics.dailyLast30} isDark={isDark} />
                </div>
              </>
            )}

            {!analyticsLoading && !analytics && (
              <div className={`py-12 text-center rounded-2xl border ${cardBg}`}>
                <BarChart2 className={`w-8 h-8 mx-auto mb-2 ${textMuted}`} />
                <p className={`text-sm ${textMuted}`}>No hay datos aún.</p>
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Kit ───────────────────────────────────────────────── */}
        {tab === "kit" && (
          <KitDigitalizacion
            comercio={comercio}
            isDark={isDark}
            cardBg={cardBg}
            textPri={textPri}
            textSec={textSec}
            textMuted={textMuted}
          />
        )}

        {/* ── Tab: Comunidad ─────────────────────────────────────────── */}
        {tab === "comunidad" && (
          <div className="space-y-4 pb-10">
            {/* Header */}
            <div className={`rounded-2xl border p-4 ${isDark ? "border-gray-800 bg-gray-900/50" : "border-gray-200 bg-gray-50"}`}>
              <p className={`text-sm font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>Tu comunidad</p>
              <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                Publica novedades, ofertas y sorteos. Tus suscriptores reciben una notificacion.
              </p>
              <button
                onClick={() => setShowPostWizard(true)}
                className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-sm transition-colors"
              >
                <Megaphone className="w-4 h-4" />
                Nueva publicacion
              </button>
            </div>

            {/* Form de nuevo post */}
            {showPostForm && (
              <div className={`rounded-2xl border p-4 space-y-3 ${isDark ? "border-gray-800 bg-gray-900" : "border-gray-200 bg-white"}`}>
                {/* Tipo selector */}
                <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                  {([
                    { id: "novedad", label: "Novedad" },
                    { id: "oferta", label: "Oferta" },
                    { id: "sorteo", label: "Sorteo" },
                  ] as const).map(t => (
                    <button
                      key={t.id}
                      onClick={() => setPostTipo(t.id)}
                      className={`flex-1 py-2 text-xs font-semibold transition-colors ${
                        postTipo === t.id
                          ? "bg-amber-500 text-white"
                          : isDark ? "text-gray-400 hover:bg-gray-800" : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Contenido */}
                <textarea
                  value={postContenido}
                  onChange={e => setPostContenido(e.target.value)}
                  placeholder={
                    postTipo === "oferta" ? "Describe la oferta..." :
                    postTipo === "sorteo" ? "Describe el sorteo y como participar..." :
                    "Contale algo a tu comunidad..."
                  }
                  rows={4}
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none resize-none ${inputCls}`}
                />

                {/* Campos condicionales oferta */}
                {postTipo === "oferta" && (
                  <div className="flex gap-2">
                    <input type="text" value={postPrecioAntes} onChange={e => setPostPrecioAntes(e.target.value)}
                      placeholder="Precio antes" className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none flex-1 ${inputCls}`} />
                    <input type="text" value={postPrecioDespues} onChange={e => setPostPrecioDespues(e.target.value)}
                      placeholder="Precio oferta" className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none flex-1 ${inputCls}`} />
                  </div>
                )}

                {/* Fecha sorteo */}
                {postTipo === "sorteo" && (
                  <input type="datetime-local" value={postFechaSorteo} onChange={e => setPostFechaSorteo(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none ${inputCls}`} />
                )}

                {/* Foto */}
                <div>
                  {postFotoPreview ? (
                    <div className="relative">
                      <img src={postFotoPreview} className="w-full h-40 object-cover rounded-xl" alt="preview" />
                      <button
                        onClick={() => { setPostFoto(null); setPostFotoPreview(null); }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed cursor-pointer text-xs transition-colors ${isDark ? "border-gray-700 text-gray-500 hover:bg-gray-800" : "border-gray-300 text-gray-400 hover:bg-gray-50"}`}>
                      <ImageIcon className="w-4 h-4" />
                      Agregar foto (opcional)
                      <input type="file" accept="image/*" className="hidden" onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setPostFoto(file);
                          const reader = new FileReader();
                          reader.onload = ev => setPostFotoPreview(ev.target?.result as string);
                          reader.readAsDataURL(file);
                        }
                      }} />
                    </label>
                  )}
                </div>

                {postError && <p className="text-xs text-red-500">{postError}</p>}

                <button
                  onClick={handlePublicarPost}
                  disabled={!postContenido.trim() || savingPost}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-gray-950 font-bold text-sm transition-colors"
                >
                  {savingPost ? "Publicando..." : "Publicar"}
                </button>
              </div>
            )}

            {/* Lista de posts */}
            {loadingComunidad ? (
              <p className={`text-xs text-center py-4 ${isDark ? "text-gray-600" : "text-gray-400"}`}>Cargando...</p>
            ) : comunidadPosts.length === 0 ? (
              <p className={`text-xs text-center py-8 ${isDark ? "text-gray-600" : "text-gray-400"}`}>
                No hay publicaciones aun. Crea la primera!
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {comunidadPosts.map(post => (
                  <div key={post.id} className="relative">
                    <ComercioPostCard post={post} variant="feed" isDark={isDark} />
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500/90 flex items-center justify-center text-white"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Ofertas ───────────────────────────────────────────── */}
        {tab === "ofertas" && (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setShowOfertaModal(true)}
              className="w-full py-3 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm bg-white text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <Plus className="w-4 h-4" /> Nueva oferta
            </button>

            {offers.length === 0 ? (
              <div className={`py-12 text-center rounded-2xl border ${cardBg}`}>
                <Tag className={`w-8 h-8 mx-auto mb-3 ${textMuted}`} />
                <p className={`text-sm ${textMuted}`}>No hay ofertas cargadas aun.</p>
                <p className={`text-xs mt-1 ${isDark ? "text-gray-700" : "text-gray-300"}`}>Crea tu primera oferta con el boton de arriba.</p>
              </div>
            ) : (
              offers.map((offer) => (
                <OfertaRow
                  key={offer.id}
                  offer={offer}
                  isDark={isDark}
                  cardBg={cardBg}
                  textPri={textPri}
                  textSec={textSec}
                  textMuted={textMuted}
                  onToggle={() => handleToggleOffer(offer)}
                  onDelete={() => handleDeleteOffer(offer.id)}
                  onEdit={() => { setEditingOffer(offer); setShowOfertaModal(true); }}
                />
              ))
            )}
          </div>
        )}
      </div>

      {showPlanModal && planInfo && (
        <PlanModal
          isDark={isDark}
          currentPlan={planInfo.plan}
          planInfo={planInfo}
          onClose={() => setShowPlanModal(false)}
        />
      )}

      {showPostWizard && (
        <NuevoPostWizard
          comercio={{ id: comercio.id, nombre: comercio.nombre, slug: comercio.slug }}
          getToken={getToken}
          onComplete={(post) => {
            setComunidadPosts(prev => [post as ComercioPost, ...prev]);
            setShowPostWizard(false);
          }}
          onClose={() => setShowPostWizard(false)}
        />
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function inicial(val: string | null | undefined): string {
  return val ?? "";
}

function ProductoRow({
  producto, slug, isDark, cardBg, textPri, textSec, textMuted, onToggle, onDelete, onEdit,
}: {
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
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const fotoResolved = photoUrl(producto.foto);

  function handleShareProducto() {
    const link = `${window.location.origin}/comercio/${slug}/producto/${producto.id}`;
    navigator.clipboard.writeText(link).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }).catch(() => {/* silent */});
  }

  return (
    <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
      <div className="flex gap-0">
        {fotoResolved && (
          <div className="w-24 flex-shrink-0">
            <img src={fotoResolved} alt={producto.nombre} className="w-full h-full object-cover" />
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
          {producto.descripcion && <p className={`text-xs leading-relaxed line-clamp-2 ${textSec}`}>{producto.descripcion}</p>}
          {producto.precio && <span className={`text-sm font-black ${isDark ? "text-green-400" : "text-green-600"}`}>{producto.precio}</span>}
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            <button onClick={onToggle} className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border transition-colors ${isDark ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
              {producto.activo ? <ToggleRight className="w-3.5 h-3.5 text-green-500" /> : <ToggleLeft className="w-3.5 h-3.5" />}
              {producto.activo ? "Desactivar" : "Activar"}
            </button>
            <button onClick={onEdit} className={`p-1.5 rounded-lg border transition-colors ${isDark ? "border-gray-700 text-gray-500 hover:text-blue-400 hover:border-blue-800" : "border-gray-200 text-gray-400 hover:text-blue-500 hover:border-blue-200"}`}>
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
              <button onClick={() => setConfirmDelete(true)} className={`p-1.5 rounded-lg border transition-colors ${isDark ? "border-gray-700 text-gray-500 hover:text-red-400 hover:border-red-800" : "border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200"}`}>
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticsBarChart({
  data,
  isDark,
}: {
  data: Record<string, Record<string, number>>;
  isDark: boolean;
}) {
  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    days.push(d.toISOString().slice(0, 10));
  }

  const values = days.map((d) => {
    const day = data[d] ?? {};
    return Object.values(day).reduce((a, b) => a + b, 0);
  });

  const maxVal = Math.max(...values, 1);

  return (
    <div className="flex items-end gap-[2px] h-24 w-full">
      {values.map((v, i) => (
        <div
          key={i}
          title={`${days[i]}: ${v}`}
          className="flex-1 rounded-sm transition-all"
          style={{
            height: `${Math.max((v / maxVal) * 100, v > 0 ? 8 : 2)}%`,
            backgroundColor: v > 0
              ? isDark ? "rgb(99,102,241)" : "rgb(79,70,229)"
              : isDark ? "rgb(31,41,55)" : "rgb(229,231,235)",
          }}
        />
      ))}
    </div>
  );
}

function OfertaRow({
  offer, isDark, cardBg, textPri, textSec, textMuted, onToggle, onDelete, onEdit,
}: {
  offer: ComercioOffer;
  isDark: boolean;
  cardBg: string;
  textPri: string;
  textSec: string;
  textMuted: string;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fotoResolved = photoUrl(offer.foto);
  const validaHasta = offer.validaHasta
    ? new Date(offer.validaHasta).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
      <div className="flex gap-0">
        {fotoResolved && (
          <div className="w-24 flex-shrink-0">
            <img src={fotoResolved} alt={offer.titulo} className="w-full h-full object-cover" />
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
                : <ToggleLeft className="w-3.5 h-3.5" />}
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
                <button
                  onClick={onDelete}
                  className="text-xs px-2.5 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
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

function PlanModal({
  isDark,
  currentPlan,
  planInfo,
  onClose,
}: {
  isDark: boolean;
  currentPlan: string;
  planInfo: { limits: { dailyAi: number; totalProducts: number | "ilimitado" }; usage: { productos: number } } | null;
  onClose: () => void;
}) {
  const bg = isDark ? "bg-gray-900" : "bg-white";
  const textPri = isDark ? "text-white" : "text-gray-900";
  const textSec = isDark ? "text-gray-400" : "text-gray-600";
  const textMuted = isDark ? "text-gray-500" : "text-gray-400";
  const border = isDark ? "border-gray-700" : "border-gray-200";

  const plans = [
    {
      id: "free",
      name: "Gratis",
      price: "0",
      features: [
        "Hasta 50 productos",
        "2 fotos con IA por día",
        "Perfil básico",
        "Posición estándar",
      ],
      current: currentPlan === "free",
    },
    {
      id: "premium",
      name: "Premium",
      price: "U$5/mes",
      features: [
        "Hasta 100 productos",
        "20 fotos con IA por día",
        "Perfil destacado",
        "Posición preferente",
        "Más visibilidad en el listado",
      ],
      popular: true,
    },
    {
      id: "master",
      name: "Master",
      price: "U$10/mes",
      features: [
        "Productos ilimitados",
        "IA ilimitada",
        "Perfil premium",
        "Posición primera garantizada",
        "Insignia Founder permanente",
        "Soporte prioritario",
      ],
    },
  ];

  const getUsageText = () => {
    if (!planInfo) return "";
    const { usage, limits } = planInfo;
    if (typeof limits.totalProducts === "number") {
      return `${usage.productos}/${limits.totalProducts} productos`;
    }
    return `${usage.productos} productos`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-2 py-20">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className={`relative rounded-3xl ${bg} max-w-lg w-full max-h-[75vh] overflow-y-auto p-4`}>
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full ${isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"}`}
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className={`text-lg font-black mb-1 ${textPri}`}>Elegí tu plan</h2>
        <p className={`text-xs mb-3 ${textSec}`}>
          Tu uso actual: {getUsageText()}
        </p>

        <div className="flex flex-col gap-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl border-2 p-3 ${
                plan.current
                  ? "border-indigo-500 bg-indigo-500/10"
                  : plan.popular
                  ? "border-indigo-500 shadow-lg shadow-indigo-500/20"
                  : border
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-2 right-3 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500 text-white">
                  Más popular
                </span>
              )}
              {plan.current && (
                <span className="absolute -top-2 right-3 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-500 text-white">
                  Tu plan
                </span>
              )}

              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className={`font-bold text-base ${textPri}`}>{plan.name}</h3>
                  <p className={`text-lg font-black ${plan.id === "free" ? textMuted : "text-indigo-500"}`}>
                    {plan.price}
                  </p>
                </div>
                {!plan.current && (
                  <a
                    href={`https://wa.me/3482445015?text=${encodeURIComponent(
                      plan.id === "premium"
                        ? "Hola! Quiero activar el plan Premium para mi comercio en Reportes Reconquista."
                        : "Hola! Quiero información sobre el plan Master para mi comercio."
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
                  >
                    Elegir
                  </a>
                )}
              </div>

              <ul className="space-y-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className={`flex items-center gap-2 text-xs ${textSec}`}>
                    <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className={`text-xs mt-3 text-center ${textMuted}`}>
          ¿Necesitás algo diferente? Escribinos y armamos un plan a tu medida.
        </p>
      </div>
    </div>
  );
}
