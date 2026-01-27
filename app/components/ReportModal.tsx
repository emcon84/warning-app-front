"use client";

import { useState } from "react";
import { ReportCategory } from "../types";
import {
  MapPin,
  Calendar,
  Trash2,
  Lightbulb,
  Construction,
  Trees,
  Phone,
  AlertTriangle,
  Share2,
} from "lucide-react";

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

export default function ReportModal({
  isOpen,
  onClose,
  onSubmit,
  lat,
  lng,
}: ReportModalProps) {
  const [category, setCategory] = useState<ReportCategory>("basura");
  const [description, setDescription] = useState("");
  const [barrio, setBarrio] = useState("");
  const [direccion, setDireccion] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [fecha, setFecha] = useState<string>("");
  const [isUrgent, setIsUrgent] = useState(false);

  if (!isOpen) return null;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setPhotos(files);

      // Crear previews para todas las imágenes
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
    console.log("Formulario enviado");
    console.log("Valores:", {
      category,
      description,
      barrio,
      direccion,
      photos,
      fecha,
      isUrgent,
    });

    if (description.trim() && barrio.trim() && direccion.trim()) {
      console.log("Validación pasada, enviando reporte...");
      onSubmit({
        category,
        description,
        barrio,
        direccion,
        photos: photos.length > 0 ? photos : undefined,
        fecha: fecha || undefined,
        isUrgent: category === "robo" ? isUrgent : false,
      });
      setCategory("basura");
      setDescription("");
      setBarrio("");
      setDireccion("");
      setPhotos([]);
      setPhotoPreviews([]);
      setFecha("");
      setIsUrgent(false);
    } else {
      console.log("Validación fallida:", {
        description: description.trim(),
        barrio: barrio.trim(),
        direccion: direccion.trim(),
      });
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-2 sm:p-4"
      style={{
        zIndex: 9999,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-lg w-full p-4 sm:p-6 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-900">
          Crear Reporte Ciudadano
        </h2>

        <div className="mb-3 sm:mb-4 text-xs sm:text-sm text-gray-600 bg-gray-50 p-2 sm:p-3 rounded">
          <p className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            <strong>Ubicación:</strong>
          </p>
          <p className="break-all">
            Lat: {lat.toFixed(6)}, Lng: {lng.toFixed(6)}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3 sm:mb-4">
            <label
              htmlFor="category"
              className="block text-gray-700 font-medium mb-1 sm:mb-2 text-sm sm:text-base"
            >
              Categoría del reporte: <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as ReportCategory);
                setIsUrgent(false); // Reset urgent flag when changing category
              }}
              className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm sm:text-base"
              required
            >
              <option value="basura">Falta de recolección de basura</option>
              <option value="alumbrado">Falta de alumbrado público</option>
              <option value="baches">Baches en vía pública</option>
              <option value="pastizales">
                Falta de limpieza de pastizales
              </option>
              <option value="robo">Robo</option>
              <option value="fugas_agua">Fugas de agua</option>
              <option value="drenaje">
                Problemas de alcantarillado/drenaje
              </option>
              <option value="banquetas">Banquetas dañadas/obstruidas</option>
              <option value="semaforos">Semáforos descompuestos</option>
              <option value="limpieza">
                Falta de limpieza en áreas públicas
              </option>
              <option value="graffiti">Vandalismo/grafiti</option>
              <option value="escombros">
                Escombros o residuos voluminosos
              </option>
              <option value="arboles">Árboles caídos/peligrosos</option>
              <option value="vandalismo">Daños a propiedad pública</option>
              <option value="vehiculos_abandonados">
                Vehículos abandonados
              </option>
              <option value="iluminacion">Falta de iluminación</option>
              <option value="animales_callejeros">Animales callejeros</option>
              <option value="plagas">Plagas urbanas</option>
              <option value="senalizacion">Señalización dañada</option>
              <option value="estacionamiento">
                Problemas de estacionamiento
              </option>
              <option value="transporte">
                Problemas de transporte público
              </option>
            </select>
          </div>

          {/* Alerta especial para robo */}
          {category === "robo" && (
            <div className="mb-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-bold text-red-900 mb-2">
                    ¿Robo en ejecución?
                  </h3>
                  <label className="flex items-center gap-2 mb-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isUrgent}
                      onChange={(e) => setIsUrgent(e.target.checked)}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                    />
                    <span className="text-sm text-red-800">
                      Este robo está sucediendo ahora
                    </span>
                  </label>

                  {isUrgent && (
                    <div className="space-y-2">
                      {/* Advertencia si faltan datos */}
                      {(!description.trim() ||
                        !barrio.trim() ||
                        !direccion.trim()) && (
                        <div className="bg-yellow-50 border border-yellow-300 rounded p-2 mb-2">
                          <p className="text-xs text-yellow-800 font-medium">
                            ⚠️ Completa todos los campos obligatorios antes de
                            enviar la alerta
                          </p>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          window.location.href = "tel:911";
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 animate-pulse"
                      >
                        <Phone className="w-5 h-5" />
                        LLAMAR AL 911 AHORA
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          // Validar que todos los campos estén completos
                          if (
                            !description.trim() ||
                            !barrio.trim() ||
                            !direccion.trim()
                          ) {
                            alert(
                              "⚠️ Por favor completa todos los campos obligatorios antes de enviar la alerta:\n\n• Descripción del problema\n• Barrio\n• Dirección",
                            );
                            return;
                          }

                          const message = `🚨 *ALERTA DE ROBO EN EJECUCIÓN*

⚠️ *URGENTE - Reconquista, Santa Fe*

📝 *Descripción:* ${description}

📍 *Ubicación:*
• Barrio: ${barrio}
• Dirección: ${direccion}

🗺️ Ver ubicación exacta: https://www.google.com/maps?q=${lat},${lng}

⏰ *Ahora mismo*`;

                          const encodedMessage = encodeURIComponent(message);
                          const whatsappUrl = `https://wa.me/5493482730030?text=${encodedMessage}`;
                          window.open(whatsappUrl, "_blank");
                        }}
                        disabled={
                          !description.trim() ||
                          !barrio.trim() ||
                          !direccion.trim()
                        }
                        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold transition-all duration-200 shadow-md ${
                          !description.trim() ||
                          !barrio.trim() ||
                          !direccion.trim()
                            ? "bg-gray-400 cursor-not-allowed opacity-60"
                            : "bg-orange-600 hover:bg-orange-700 hover:shadow-lg active:scale-95"
                        }`}
                      >
                        <Share2 className="w-5 h-5" />
                        Avisar a Ojos en Alerta
                      </button>
                    </div>
                  )}

                  <p className="text-xs text-red-700 mt-2">
                    Si el robo está en curso, llama al 911 primero. El reporte
                    se guardará de todas formas.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Botón para Servicios Públicos */}
          {[
            "basura",
            "alumbrado",
            "pastizales",
            "fugas_agua",
            "drenaje",
            "limpieza",
            "escombros",
            "baches",
            "banquetas",
          ].includes(category) && (
            <div className="mb-3 sm:mb-4 bg-blue-50 border-2 border-blue-300 rounded-lg p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <Construction className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm sm:text-base font-bold text-blue-900">
                  Contacto Rápido - Servicios Públicos
                </h3>
              </div>

              {/* Advertencia si faltan datos */}
              {(!description.trim() || !barrio.trim() || !direccion.trim()) && (
                <div className="bg-yellow-50 border border-yellow-300 rounded p-2 mb-2">
                  <p className="text-xs text-yellow-800 font-medium">
                    ⚠️ Completa todos los campos obligatorios antes de enviar el
                    reclamo
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  // Validar que todos los campos estén completos
                  if (
                    !description.trim() ||
                    !barrio.trim() ||
                    !direccion.trim()
                  ) {
                    alert(
                      "⚠️ Por favor completa todos los campos obligatorios antes de enviar el reclamo:\n\n• Descripción del problema\n• Barrio\n• Dirección",
                    );
                    return;
                  }

                  const categoryLabels: { [key: string]: string } = {
                    basura: "Basura sin recolectar",
                    alumbrado: "Problema de alumbrado público",
                    pastizales: "Pastizales altos",
                    fugas_agua: "Fuga de agua",
                    drenaje: "Problema de drenaje",
                    limpieza: "Falta de limpieza",
                    escombros: "Escombros",
                    baches: "Baches",
                    banquetas: "Banquetas dañadas",
                  };

                  const message = `🏛️ *RECLAMO DE SERVICIOS PÚBLICOS*

📋 *Tipo de Reclamo:* ${categoryLabels[category] || category}

📝 *Descripción:* ${description}

📍 *Ubicación:*
• Barrio: ${barrio}
• Dirección: ${direccion}

🗺️ Ver ubicación: https://www.google.com/maps?q=${lat},${lng}

📅 *Fecha:* ${new Date().toLocaleDateString("es-AR")}`;

                  const encodedMessage = encodeURIComponent(message);
                  const whatsappUrl = `https://wa.me/5493482519279?text=${encodedMessage}`;
                  window.open(whatsappUrl, "_blank");
                }}
                disabled={
                  !description.trim() || !barrio.trim() || !direccion.trim()
                }
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md ${
                  !description.trim() || !barrio.trim() || !direccion.trim()
                    ? "bg-gray-400 cursor-not-allowed opacity-60"
                    : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:scale-95 text-white"
                }`}
              >
                <Share2 className="w-5 h-5" />
                Enviar Reclamo a Servicios Públicos
              </button>

              <p className="text-xs text-blue-700 mt-2">
                Este botón enviará tu reclamo directamente a la oficina de
                Servicios Públicos.
              </p>
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
              htmlFor="fecha"
              className="flex items-center gap-1.5 text-gray-700 font-medium mb-1 sm:mb-2 text-sm sm:text-base"
            >
              <Calendar className="w-4 h-4" />
              Fecha (opcional):
            </label>
            <input
              type="date"
              id="fecha"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm sm:text-base"
            />
            <p className="text-xs text-gray-500 mt-1">
              Si no seleccionas una fecha, se usará la fecha de hoy
            </p>
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
              className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm sm:text-base"
              rows={3}
              placeholder="Describe qué sucedió (ej: La basura lleva 3 días sin recoger)"
              required
            />
          </div>

          <div className="mb-4 sm:mb-6">
            <label
              htmlFor="photo"
              className="block text-gray-700 font-medium mb-1 sm:mb-2 text-sm sm:text-base"
            >
              📷 Fotos (opcional):
            </label>
            <input
              type="file"
              id="photo"
              accept="image/*"
              multiple
              onChange={handlePhotoChange}
              className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-xs sm:text-sm file:mr-2 sm:file:mr-4 file:py-1 sm:file:py-2 file:px-2 sm:file:px-4 file:rounded-full file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {photoPreviews.length > 0 && (
              <div className="mt-2 grid grid-cols-3 gap-2">
                {photoPreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 sm:gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-3 sm:px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm sm:text-base"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-3 sm:px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm sm:text-base"
            >
              Crear Reporte
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
