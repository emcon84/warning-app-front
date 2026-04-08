"use client";

import { useState, useEffect } from "react";
import { Report, ReportCategory } from "../types";
import { MapPin, X, AlertTriangle } from "lucide-react";

interface EditReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    category: ReportCategory;
    description: string;
    barrio: string;
    direccion: string;
    photos?: File[];
    isUrgent?: boolean;
  }) => void;
  report: Report;
}

const CATEGORIES: { value: ReportCategory; label: string }[] = [
  { value: "basura", label: "🗑️ Recolección de basura" },
  { value: "alumbrado", label: "💡 Alumbrado público" },
  { value: "baches", label: "🕳️ Baches" },
  { value: "pastizales", label: "🌿 Pastizales" },
  { value: "robo", label: "🚨 Robo" },
  { value: "personas_sospechosas", label: "👥 Personas sospechosas" },
  { value: "fugas_agua", label: "💧 Fugas de agua" },
  { value: "drenaje", label: "🚿 Drenaje" },
  { value: "banquetas", label: "🚶 Banquetas dañadas" },
  { value: "semaforos", label: "🚦 Semáforos" },
  { value: "limpieza", label: "🧹 Limpieza" },
  { value: "graffiti", label: "🎨 Graffiti" },
  { value: "escombros", label: "🏗️ Escombros" },
  { value: "arboles", label: "🌳 Árboles caídos" },
  { value: "vandalismo", label: "⚠️ Vandalismo" },
  { value: "vehiculos_abandonados", label: "🚗 Vehículos abandonados" },
  { value: "iluminacion", label: "🔦 Iluminación" },
  { value: "animales_callejeros", label: "🐕 Animales callejeros" },
  { value: "plagas", label: "🐀 Plagas" },
  { value: "senalizacion", label: "🛑 Señalización" },
  { value: "estacionamiento", label: "🅿️ Estacionamiento" },
  { value: "transporte", label: "🚌 Transporte público" },
  { value: "voz", label: "🎙️ Reporte de voz" },
];

const inputClass = "w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";
const labelClass = "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5";

export default function EditReportModal({ isOpen, onClose, onSubmit, report }: EditReportModalProps) {
  const [category, setCategory] = useState<ReportCategory>(report.category);
  const [description, setDescription] = useState(report.description);
  const [barrio, setBarrio] = useState(report.barrio);
  const [direccion, setDireccion] = useState(report.direccion);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [isUrgent, setIsUrgent] = useState(report.isUrgent || false);
  const [keepExistingPhotos, setKeepExistingPhotos] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setCategory(report.category);
      setDescription(report.description);
      setBarrio(report.barrio);
      setDireccion(report.direccion);
      setIsUrgent(report.isUrgent || false);
      setPhotos([]);
      setPhotoPreviews([]);
      setKeepExistingPhotos(true);
    }
  }, [isOpen, report]);

  if (!isOpen) return null;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setPhotos(files);
    setKeepExistingPhotos(false);
    const previews: string[] = [];
    let loaded = 0;
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result as string);
        if (++loaded === files.length) setPhotoPreviews([...previews]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim() && barrio.trim() && direccion.trim()) {
      onSubmit({
        category,
        description,
        barrio,
        direccion,
        photos: photos.length > 0 ? photos : undefined,
        isUrgent: (category === "robo" || category === "personas_sospechosas") ? isUrgent : false,
      });
    }
  };

  const existingPhotos = report.photos || (report.photo ? [report.photo] : []);
  const isSecurityCat = category === "robo" || category === "personas_sospechosas";

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-3"
      style={{ zIndex: 10000, backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Editar Reporte</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">

          {/* Ubicación */}
          <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span>Lat: {report.lat.toFixed(6)}, Lng: {report.lng.toFixed(6)}</span>
          </div>

          {/* Categoría */}
          <div>
            <label className={labelClass}>Categoría <span className="text-red-500">*</span></label>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value as ReportCategory); setIsUrgent(false); }}
              className={inputClass}
              required
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Seguridad */}
          {isSecurityCat && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                <h3 className="font-bold text-red-900 dark:text-red-300 text-sm">
                  {category === "robo" ? "¿Robo en ejecución?" : "¿Situación en curso?"}
                </h3>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isUrgent} onChange={(e) => setIsUrgent(e.target.checked)} className="w-4 h-4 text-red-600 rounded" />
                <span className="text-xs text-red-800 dark:text-red-300">
                  {category === "robo" ? "Este robo está sucediendo ahora" : "Esta situación está ocurriendo ahora"}
                </span>
              </label>
            </div>
          )}

          {/* Barrio */}
          <div>
            <label className={labelClass}>Barrio <span className="text-red-500">*</span></label>
            <input type="text" value={barrio} onChange={(e) => setBarrio(e.target.value)} placeholder="Ej: Centro, San Martín..." className={inputClass} required />
          </div>

          {/* Dirección */}
          <div>
            <label className={labelClass}>Dirección <span className="text-red-500">*</span></label>
            <input type="text" value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Ej: Belgrano 1234" className={inputClass} required />
          </div>

          {/* Descripción */}
          <div>
            <label className={labelClass}>Descripción <span className="text-red-500">*</span></label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Describí el problema..." className={`${inputClass} resize-none`} required />
          </div>

          {/* Fotos existentes */}
          {keepExistingPhotos && existingPhotos.length > 0 && (
            <div>
              <label className={labelClass}>Fotos actuales</label>
              <div className="grid grid-cols-3 gap-2">
                {existingPhotos.map((photo, i) => (
                  <img key={i} src={photo.startsWith("http") ? photo : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}${photo}`} alt={`Foto ${i + 1}`} className="w-full h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
                ))}
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Se mantienen salvo que subas nuevas</p>
            </div>
          )}

          {/* Nuevas fotos */}
          <div>
            <label className={labelClass}>{keepExistingPhotos ? "Reemplazar fotos (opcional)" : "Nuevas fotos"}</label>
            <input type="file" accept="image/*" multiple onChange={handlePhotoChange} className="w-full text-xs text-gray-600 dark:text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/30 file:text-blue-700 dark:file:text-blue-400" />
            {photoPreviews.length > 0 && (
              <div className="mt-2 grid grid-cols-3 gap-2">
                {photoPreviews.map((preview, i) => (
                  <div key={i} className="relative">
                    <img src={preview} alt={`Preview ${i + 1}`} className="w-full h-20 object-cover rounded-lg" />
                    <button type="button" onClick={() => { setPhotos(photos.filter((_, j) => j !== i)); setPhotoPreviews(photoPreviews.filter((_, j) => j !== i)); }} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold text-sm transition-colors">
              Cancelar
            </button>
            <button type="submit" className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-colors">
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
