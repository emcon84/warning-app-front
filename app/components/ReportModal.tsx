"use client";

import { useState } from "react";
import { ReportCategory } from "../types";
import { MapPin, Calendar, Trash2, Construction, Phone, AlertTriangle, Share2, ChevronRight, ChevronLeft, Camera } from "lucide-react";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    category: ReportCategory;
    description: string;
    barrio: string;
    direccion: string;
    photo?: File;
    photos?: File[];
    fecha?: string;
    isUrgent?: boolean;
  }) => void;
  lat: number;
  lng: number;
}

const CATEGORIES: { value: ReportCategory; label: string }[] = [
  { value: "basura", label: "Falta de recolección de basura" },
  { value: "alumbrado", label: "Falta de alumbrado público" },
  { value: "baches", label: "Baches en vía pública" },
  { value: "pastizales", label: "Falta de limpieza de pastizales" },
  { value: "robo", label: "Robo" },
  { value: "personas_sospechosas", label: "Personas sospechosas" },
  { value: "fugas_agua", label: "Fugas de agua" },
  { value: "drenaje", label: "Problemas de alcantarillado/drenaje" },
  { value: "banquetas", label: "Banquetas dañadas/obstruidas" },
  { value: "semaforos", label: "Semáforos descompuestos" },
  { value: "limpieza", label: "Falta de limpieza en áreas públicas" },
  { value: "graffiti", label: "Vandalismo/grafiti" },
  { value: "escombros", label: "Escombros o residuos voluminosos" },
  { value: "arboles", label: "Árboles caídos/peligrosos" },
  { value: "vandalismo", label: "Daños a propiedad pública" },
  { value: "vehiculos_abandonados", label: "Vehículos abandonados" },
  { value: "iluminacion", label: "Falta de iluminación" },
  { value: "animales_callejeros", label: "Animales callejeros" },
  { value: "plagas", label: "Plagas urbanas" },
  { value: "senalizacion", label: "Señalización dañada" },
  { value: "estacionamiento", label: "Problemas de estacionamiento" },
  { value: "transporte", label: "Problemas de transporte público" },
];

const SERVICIOS_PUBLICOS_CATS = ["basura", "alumbrado", "pastizales", "fugas_agua", "drenaje", "limpieza", "escombros", "baches", "banquetas"];

export default function ReportModal({ isOpen, onClose, onSubmit, lat, lng }: ReportModalProps) {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<ReportCategory>("basura");
  const [isUrgent, setIsUrgent] = useState(false);
  const [barrio, setBarrio] = useState("");
  const [direccion, setDireccion] = useState("");
  const [fecha, setFecha] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  if (!isOpen) return null;

  const isSecurityCat = category === "robo" || category === "personas_sospechosas";
  const isServiciosCat = SERVICIOS_PUBLICOS_CATS.includes(category);

  const reset = () => {
    setStep(1);
    setCategory("basura");
    setIsUrgent(false);
    setBarrio("");
    setDireccion("");
    setFecha("");
    setDescription("");
    setPhotos([]);
    setPhotoPreviews([]);
  };

  const handleClose = () => { reset(); onClose(); };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setPhotos(files);
    const previews: string[] = [];
    let loaded = 0;
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result as string);
        if (++loaded === files.length) setPhotoPreviews([...previews]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (i: number) => {
    setPhotos(photos.filter((_, idx) => idx !== i));
    setPhotoPreviews(photoPreviews.filter((_, idx) => idx !== i));
  };

  const handleSubmit = () => {
    if (!description.trim() || !barrio.trim() || !direccion.trim()) return;
    onSubmit({
      category,
      description,
      barrio,
      direccion,
      photos: photos.length > 0 ? photos : undefined,
      fecha: fecha || undefined,
      isUrgent: isSecurityCat ? isUrgent : false,
    });
    reset();
  };

  const canGoStep2 = true; // categoría siempre tiene un valor
  const canGoStep3 = barrio.trim() && direccion.trim();
  const canSubmit = description.trim() && barrio.trim() && direccion.trim();

  // Mensaje de WhatsApp para servicios públicos
  const sendServiciosPublicos = () => {
    const labels: Record<string, string> = { basura: "Basura sin recolectar", alumbrado: "Problema de alumbrado", pastizales: "Pastizales altos", fugas_agua: "Fuga de agua", drenaje: "Problema de drenaje", limpieza: "Falta de limpieza", escombros: "Escombros", baches: "Baches", banquetas: "Banquetas dañadas" };
    const msg = `🏛️ *RECLAMO DE SERVICIOS PÚBLICOS*\n\n📋 *Tipo:* ${labels[category] || category}\n📝 *Descripción:* ${description}\n📍 *Barrio:* ${barrio}\n📍 *Dirección:* ${direccion}\n🗺️ https://www.google.com/maps?q=${lat},${lng}\n📅 ${new Date().toLocaleDateString("es-AR")}\n🌐 reportesreconquista.com`;
    window.open(`https://wa.me/5493482519279?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const sendUrgente = () => {
    const title = category === "robo" ? "ALERTA DE ROBO EN EJECUCIÓN" : "ALERTA DE PERSONAS SOSPECHOSAS";
    const msg = `🚨 *${title}*\n\n⚠️ *URGENTE - Reconquista, Santa Fe*\n📝 *Descripción:* ${description}\n📍 Barrio: ${barrio}\n📍 Dirección: ${direccion}\n🗺️ https://www.google.com/maps?q=${lat},${lng}\n⏰ Ahora mismo\n🌐 reportesreconquista.com`;
    window.open(`https://wa.me/5493482730030?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const STEP_LABELS = ["Categoría", "Lugar", "Detalle"];

  return (
    <div
      className="fixed inset-0 flex items-end sm:items-center justify-center"
      style={{ zIndex: 9999, backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={handleClose}
    >
      <div
        className="bg-white dark:bg-gray-900 w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col"
        style={{ maxHeight: "92vh" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b dark:border-gray-700 flex-shrink-0">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Crear Reporte</h2>
          <button onClick={handleClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress */}
        <div className="flex items-center px-4 py-2 gap-2 flex-shrink-0">
          {STEP_LABELS.map((label, i) => {
            const n = i + 1;
            const active = step === n;
            const done = step > n;
            return (
              <div key={n} className="flex items-center gap-2 flex-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${done ? "bg-green-500 text-white" : active ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"}`}>
                  {done ? "✓" : n}
                </div>
                <span className={`text-xs font-medium truncate ${active ? "text-blue-600 dark:text-blue-400" : done ? "text-green-600 dark:text-green-400" : "text-gray-400"}`}>{label}</span>
                {i < STEP_LABELS.length - 1 && <div className={`h-0.5 flex-1 rounded ${done ? "bg-green-400" : "bg-gray-200 dark:bg-gray-700"}`} />}
              </div>
            );
          })}
        </div>

        {/* Ubicación (siempre visible) */}
        <div className="mx-4 mb-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5 flex-shrink-0">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          {lat.toFixed(5)}, {lng.toFixed(5)}
        </div>

        {/* Contenido del paso — no scrollable salvo overflow extremo */}
        <div className="flex-1 overflow-y-auto px-4 pb-2">

          {/* ── PASO 1: Categoría ── */}
          {step === 1 && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Categoría del reporte <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={e => { setCategory(e.target.value as ReportCategory); setIsUrgent(false); }}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>

              {/* Alerta seguridad */}
              {isSecurityCat && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <h3 className="font-bold text-red-900 dark:text-red-300 text-sm">
                      {category === "robo" ? "¿Robo en ejecución?" : "¿Situación en curso?"}
                    </h3>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer mb-2">
                    <input type="checkbox" checked={isUrgent} onChange={e => setIsUrgent(e.target.checked)} className="w-4 h-4 text-red-600 rounded" />
                    <span className="text-xs text-red-800 dark:text-red-300">
                      {category === "robo" ? "Este robo está sucediendo ahora" : "Esta situación está ocurriendo ahora"}
                    </span>
                  </label>
                  {isUrgent && (
                    <button
                      type="button"
                      onClick={() => window.location.href = "tel:911"}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm animate-pulse"
                    >
                      <Phone className="w-4 h-4" /> LLAMAR AL 911 AHORA
                    </button>
                  )}
                  <p className="text-xs text-red-700 dark:text-red-400 mt-2">
                    {category === "robo" ? "Si el robo está en curso, llamá al 911 primero." : "Si la situación es peligrosa, llamá al 911 primero."}
                  </p>
                </div>
              )}

            </div>
          )}

          {/* ── PASO 2: Lugar ── */}
          {step === 2 && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Barrio <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={barrio}
                  onChange={e => setBarrio(e.target.value)}
                  placeholder="Ej: Centro, Villa Ocampo..."
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Dirección <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={direccion}
                  onChange={e => setDireccion(e.target.value)}
                  placeholder="Ej: Belgrano 1234"
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  <Calendar className="w-4 h-4" /> Fecha <span className="font-normal text-gray-400">(opcional)</span>
                </label>
                <input
                  type="date"
                  value={fecha}
                  onChange={e => setFecha(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Si no seleccionás una fecha, se usará la de hoy</p>
              </div>
            </div>
          )}

          {/* ── PASO 3: Detalle + envío ── */}
          {step === 3 && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Descripción <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe qué sucedió (ej: La basura lleva 3 días sin recoger)"
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  <Camera className="w-4 h-4" /> Fotos <span className="font-normal text-gray-400">(opcional)</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoChange}
                  className="w-full text-xs text-gray-600 dark:text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/30 file:text-blue-700 dark:file:text-blue-400 hover:file:bg-blue-100"
                />
                {photoPreviews.length > 0 && (
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {photoPreviews.map((preview, i) => (
                      <div key={i} className="relative">
                        <img src={preview} alt={`Preview ${i + 1}`} className="w-full h-20 object-cover rounded-lg" />
                        <button type="button" onClick={() => removePhoto(i)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center">
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Contacto Rápido Servicios Públicos */}
              {isServiciosCat && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Construction className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-bold text-blue-900 dark:text-blue-300 text-sm">Contacto Rápido — Servicios Públicos</h3>
                  </div>
                  {!canSubmit && (
                    <p className="text-xs text-blue-700 dark:text-blue-400 mb-2">
                      Completá la descripción para habilitar el envío directo.
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={sendServiciosPublicos}
                    disabled={!canSubmit}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg font-semibold text-sm"
                  >
                    <Share2 className="w-4 h-4" /> Enviar Reclamo a Servicios Públicos
                  </button>
                </div>
              )}

              {isSecurityCat && isUrgent && canSubmit && (
                <button
                  type="button"
                  onClick={sendUrgente}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold text-sm"
                >
                  <Share2 className="w-4 h-4" /> Avisar a Ojos en Alerta
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer con botones de navegación */}
        <div className="flex gap-2 px-4 py-3 border-t dark:border-gray-700 flex-shrink-0">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <ChevronLeft className="w-4 h-4" /> Atrás
            </button>
          ) : (
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              Cancelar
            </button>
          )}

          <div className="flex-1" />

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(s => s + 1)}
              disabled={step === 2 && !canGoStep3}
              className="flex items-center gap-1 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Siguiente <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="flex items-center gap-1 px-5 py-2.5 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Crear Reporte ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
