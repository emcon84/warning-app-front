"use client";

import { useState, useEffect } from "react";
import { Report, ReportCategory } from "../types";
import { MapPin, Calendar, Trash2, X, AlertTriangle } from "lucide-react";

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

export default function EditReportModal({
  isOpen,
  onClose,
  onSubmit,
  report,
}: EditReportModalProps) {
  const [category, setCategory] = useState<ReportCategory>(report.category);
  const [description, setDescription] = useState(report.description);
  const [barrio, setBarrio] = useState(report.barrio);
  const [direccion, setDireccion] = useState(report.direccion);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [isUrgent, setIsUrgent] = useState(report.isUrgent || false);
  const [keepExistingPhotos, setKeepExistingPhotos] = useState(true);

  // Resetear estado cuando cambia el reporte
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
    if (files.length > 0) {
      setPhotos(files);
      setKeepExistingPhotos(false);

      const previews: string[] = [];
      let loadedCount = 0;

      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          previews.push(reader.result as string);
          loadedCount++;
          if (loadedCount === files.length) {
            setPhotoPreviews(previews);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotoPreviews(photoPreviews.filter((_, i) => i !== index));
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
        isUrgent:
          category === "robo" || category === "personas_sospechosas"
            ? isUrgent
            : false,
      });
    }
  };

  const existingPhotos = report.photos || (report.photo ? [report.photo] : []);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-2 sm:p-4"
      style={{
        zIndex: 10000,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-lg w-full p-4 sm:p-6 max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Editar Reporte
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-3 sm:mb-4 text-xs sm:text-sm text-gray-600 bg-gray-50 p-2 sm:p-3 rounded">
          <p className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            <strong>Ubicación:</strong>
          </p>
          <p className="break-all">
            Lat: {report.lat.toFixed(6)}, Lng: {report.lng.toFixed(6)}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3 sm:mb-4">
            <label
              htmlFor="category"
              className="block text-gray-700 font-medium mb-1 sm:mb-2 text-sm sm:text-base"
            >
              Categoría: <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ReportCategory)}
              className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm sm:text-base"
              required
            >
              <option value="basura">🗑️ Recolección de basura</option>
              <option value="alumbrado">💡 Alumbrado público</option>
              <option value="baches">🕳️ Baches</option>
              <option value="pastizales">🌿 Limpieza de pastizales</option>
              <option value="robo">🚨 Robo</option>
              <option value="personas_sospechosas">
                👥 Personas sospechosas
              </option>
              <option value="fugas_agua">💧 Fugas de agua</option>
              <option value="drenaje">🚿 Drenaje</option>
              <option value="banquetas">🚶 Banquetas dañadas</option>
              <option value="semaforos">🚦 Semáforos</option>
              <option value="limpieza">🧹 Limpieza de espacios públicos</option>
              <option value="graffiti">🎨 Graffiti</option>
              <option value="escombros">🏗️ Escombros</option>
              <option value="arboles">🌳 Árboles caídos</option>
              <option value="vandalismo">⚠️ Vandalismo</option>
              <option value="vehiculos_abandonados">
                🚗 Vehículos abandonados
              </option>
              <option value="iluminacion">🔦 Iluminación deficiente</option>
              <option value="animales_callejeros">
                🐕 Animales callejeros
              </option>
              <option value="plagas">🐀 Plagas</option>
              <option value="senalizacion">🛑 Señalización</option>
              <option value="estacionamiento">🅿️ Estacionamiento ilegal</option>
              <option value="transporte">
                🚌 Problemas de transporte público
              </option>
            </select>
          </div>

          {(category === "robo" || category === "personas_sospechosas") && (
            <div className="mb-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-bold text-red-900 mb-2">
                    {category === "robo"
                      ? "¿Robo en ejecución?"
                      : "¿Situación en curso?"}
                  </h3>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isUrgent}
                      onChange={(e) => setIsUrgent(e.target.checked)}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                    />
                    <span className="text-sm text-red-800">
                      {category === "robo"
                        ? "Este robo está sucediendo ahora"
                        : "Esta situación está ocurriendo ahora"}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          <div className="mb-3 sm:mb-4">
            <label
              htmlFor="barrio"
              className="block text-gray-700 font-medium mb-1 sm:mb-2 text-sm sm:text-base"
            >
              Barrio: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="barrio"
              value={barrio}
              onChange={(e) => setBarrio(e.target.value)}
              className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm sm:text-base"
              placeholder="Ej: Centro, Villa Ocampo, etc."
              required
            />
          </div>

          <div className="mb-3 sm:mb-4">
            <label
              htmlFor="direccion"
              className="block text-gray-700 font-medium mb-1 sm:mb-2 text-sm sm:text-base"
            >
              Dirección: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="direccion"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm sm:text-base"
              placeholder="Ej: Calle Falsa 123"
              required
            />
          </div>

          <div className="mb-3 sm:mb-4">
            <label
              htmlFor="description"
              className="block text-gray-700 font-medium mb-1 sm:mb-2 text-sm sm:text-base"
            >
              Descripción del problema: <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm sm:text-base"
              placeholder="Describe el problema que quieres reportar..."
              required
            />
          </div>

          {/* Fotos existentes */}
          {keepExistingPhotos && existingPhotos.length > 0 && (
            <div className="mb-3 sm:mb-4">
              <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                Fotos actuales:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {existingPhotos.map((photo, index) => (
                  <div key={index} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        photo.startsWith("http")
                          ? photo
                          : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}${photo}`
                      }
                      alt={`Foto ${index + 1}`}
                      className="w-full h-24 object-cover rounded border border-gray-300"
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Las fotos actuales se mantendrán a menos que subas nuevas
              </p>
            </div>
          )}

          {/* Nuevas fotos */}
          <div className="mb-3 sm:mb-4">
            <label
              htmlFor="photo"
              className="block text-gray-700 font-medium mb-1 sm:mb-2 text-sm sm:text-base"
            >
              {keepExistingPhotos
                ? "Reemplazar fotos (opcional):"
                : "Nuevas fotos:"}
            </label>
            <input
              type="file"
              id="photo"
              accept="image/*"
              multiple
              onChange={handlePhotoChange}
              className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            />
            {photoPreviews.length > 0 && (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {photoPreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:flex-1 px-4 py-2 sm:py-2.5 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold text-sm sm:text-base"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full sm:flex-1 px-4 py-2 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm sm:text-base"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
