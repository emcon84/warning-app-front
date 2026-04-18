"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import { useTheme } from "../../contexts/ThemeContext";
import Navbar from "../../components/Navbar";
import { Comercio, ComercioOffer } from "../../types";
import {
  Store, ImageIcon, Tag, ChevronRight,
  Plus, Trash2, ToggleLeft, ToggleRight,
  X, Check, Pencil, ExternalLink,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const RUBROS = [
  "Almacén/Despensa", "Restaurante/Comida", "Indumentaria", "Calzado",
  "Electrónica", "Ferretería", "Farmacia", "Peluquería/Estética",
  "Librería/Papelería", "Veterinaria", "Deportes", "Mueblería",
  "Joyería/Relojería", "Otro",
];

const BARRIOS = [
  "Centro", "Barrio Norte", "Barrio Sur", "Barrio Oeste", "Villa del Parque",
  "Las Lomas", "Parque Industrial", "Barrio Newbery", "Villa Ocampo",
  "Los Lapachos", "San Cayetano", "Otro",
];

function photoUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return url.startsWith("/uploads/") ? `${API}${url}` : url;
}

type Tab = "datos" | "fotos" | "ofertas";

interface Props {
  comercio: Comercio & { offers?: ComercioOffer[] };
}

// ─── Oferta Form Modal ───────────────────────────────────────────────────────

function OfertaModal({
  isDark,
  onClose,
  onSaved,
}: {
  isDark: boolean;
  onClose: () => void;
  onSaved: (offer: ComercioOffer) => void;
}) {
  const { getToken } = useAuth();
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [validaHasta, setValidaHasta] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
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
      if (precio.trim()) fd.append("precio", precio.trim());
      if (validaHasta) fd.append("validaHasta", validaHasta);
      if (photoFile) fd.append("photo", photoFile);

      const res = await fetch(`${API}/api/comercios/me/offers`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Error al crear la oferta");
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4">
      <div className={`w-full max-w-lg rounded-2xl ${bg} p-5 shadow-xl max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between mb-5">
          <h2 className={`font-bold text-base ${isDark ? "text-white" : "text-gray-900"}`}>Nueva oferta</h2>
          <button onClick={onClose} className={`p-1.5 rounded-lg ${isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"}`}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
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
              onChange={(e) => setDescripcion(e.target.value.slice(0, 300))}
              placeholder="Mas detalles de la oferta..."
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
                  onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
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

          <div className="flex gap-3 pt-1">
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
              {loading ? "Guardando..." : "Publicar oferta"}
            </button>
          </div>
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
  const [tab, setTab] = useState<Tab>("datos");
  const [comercio, setComercio] = useState(initial);
  const [offers, setOffers] = useState<ComercioOffer[]>(initial.offers ?? []);
  const [showOfertaModal, setShowOfertaModal] = useState(false);

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

  // Fotos
  const [newMainFile, setNewMainFile] = useState<File | null>(null);
  const [newMainPreview, setNewMainPreview] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [savingFotos, setSavingFotos] = useState(false);
  const [fotosError, setFotosError] = useState("");
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
    if (!newMainFile && galleryFiles.length === 0) return;
    setSavingFotos(true);
    setFotosError("");
    try {
      const token = await getToken();
      const fd = new FormData();
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

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "datos",   label: "Datos",   icon: <Store className="w-4 h-4" /> },
    { id: "fotos",   label: "Fotos",   icon: <ImageIcon className="w-4 h-4" /> },
    { id: "ofertas", label: "Ofertas", icon: <Tag className="w-4 h-4" /> },
  ];

  const existingFotos = comercio.fotos ?? [];
  const canAddGallery = galleryFiles.length + existingFotos.length < 6;

  return (
    <div className={`min-h-screen ${bg} ${textPri} flex flex-col`}>
      <Navbar sidebarDisabled />

      {showOfertaModal && (
        <OfertaModal
          isDark={isDark}
          onClose={() => setShowOfertaModal(false)}
          onSaved={(offer) => {
            setOffers((prev) => [offer, ...prev]);
            setShowOfertaModal(false);
          }}
        />
      )}

      <div className="flex-1 max-w-xl mx-auto w-full px-4 pt-20 pb-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={`text-xl font-black ${textPri}`}>{comercio.nombre}</h1>
            <p className={`text-sm ${textSec}`}>{comercio.rubro} · {comercio.barrio}</p>
          </div>
          <button
            onClick={() => router.push(`/comercio/${comercio.slug}`)}
            className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border transition-colors ${isDark ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Ver perfil
          </button>
        </div>

        {/* Tabs */}
        <div className={`flex gap-1 p-1 rounded-2xl mb-6 ${isDark ? "bg-gray-900" : "bg-gray-100"}`}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-sm font-semibold transition-colors ${
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

            {/* Foto principal */}
            <div className={`rounded-2xl border p-5 ${cardBg}`}>
              <p className={`text-sm font-semibold mb-4 ${textPri}`}>Foto principal / logo</p>
              <div className="flex items-center gap-4">
                <div
                  onClick={() => mainPhotoRef.current?.click()}
                  className="w-20 h-20 rounded-full overflow-hidden border-2 cursor-pointer flex-shrink-0 relative group"
                >
                  {newMainPreview ? (
                    <img src={newMainPreview} alt="preview" className="w-full h-full object-cover" />
                  ) : photoUrl(comercio.foto) ? (
                    <Image
                      src={photoUrl(comercio.foto)!}
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
                  <p className={`text-sm font-medium ${textPri}`}>{newMainPreview ? "Nueva foto seleccionada" : "Foto actual"}</p>
                  <p className={`text-xs mt-1 ${textMuted}`}>Clic para cambiar · circular, 400x400px</p>
                  {newMainPreview && (
                    <button
                      onClick={() => { setNewMainFile(null); setNewMainPreview(null); }}
                      className={`text-xs mt-1 ${isDark ? "text-red-400" : "text-red-500"}`}
                    >
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
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  setNewMainFile(f);
                  setNewMainPreview(URL.createObjectURL(f));
                }}
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

            {(newMainFile || galleryFiles.length > 0) && (
              <button
                onClick={handleSaveFotos}
                disabled={savingFotos}
                className="w-full py-3 rounded-2xl bg-white text-gray-900 font-semibold text-sm hover:bg-gray-100 transition-colors disabled:opacity-40"
              >
                {savingFotos ? "Subiendo..." : `Subir ${newMainFile && galleryFiles.length > 0 ? "fotos" : newMainFile ? "foto principal" : `${galleryFiles.length} foto${galleryFiles.length > 1 ? "s" : ""}`}`}
              </button>
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
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function inicial(val: string | null | undefined): string {
  return val ?? "";
}

function OfertaRow({
  offer, isDark, cardBg, textPri, textSec, textMuted, onToggle, onDelete,
}: {
  offer: ComercioOffer;
  isDark: boolean;
  cardBg: string;
  textPri: string;
  textSec: string;
  textMuted: string;
  onToggle: () => void;
  onDelete: () => void;
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
