"use client";

import { useState } from "react";
import { ReportCategory } from "../types";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    category: ReportCategory;
    description: string;
    barrio: string;
    direccion: string;
    photo?: string;
    fecha?: string;
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
  const [photo, setPhoto] = useState<string | undefined>(undefined);
  const [fecha, setFecha] = useState<string>("");

  if (!isOpen) return null;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Formulario enviado");
    console.log("Valores:", {
      category,
      description,
      barrio,
      direccion,
      photo,
      fecha,
    });

    if (description.trim() && barrio.trim() && direccion.trim()) {
      console.log("Validación pasada, enviando reporte...");
      onSubmit({
        category,
        description,
        barrio,
        direccion,
        photo,
        fecha: fecha || undefined,
      });
      setCategory("basura");
      setDescription("");
      setBarrio("");
      setDireccion("");
      setPhoto(undefined);
      setFecha("");
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
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{
        zIndex: 9999,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          Crear Reporte Ciudadano
        </h2>

        <div className="mb-4 text-sm text-gray-600 bg-gray-50 p-3 rounded">
          <p>
            <strong>📍 Ubicación:</strong>
          </p>
          <p>
            Lat: {lat.toFixed(6)}, Lng: {lng.toFixed(6)}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="category"
              className="block text-gray-700 font-medium mb-2"
            >
              Categoría del reporte: <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ReportCategory)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              required
            >
              <option value="basura">🗑️ Falta de recolección de basura</option>
              <option value="alumbrado">💡 Falta de alumbrado público</option>
              <option value="baches">🚧 Baches en vía pública</option>
              <option value="pastizales">
                🌿 Falta de limpieza de pastizales
              </option>
            </select>
          </div>

          <div className="mb-4">
            <label
              htmlFor="barrio"
              className="block text-gray-700 font-medium mb-2"
            >
              Barrio: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="barrio"
              value={barrio}
              onChange={(e) => setBarrio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Ej: Centro, Villa Ocampo, etc."
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="direccion"
              className="block text-gray-700 font-medium mb-2"
            >
              Dirección: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="direccion"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Ej: Calle Falsa 123"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="fecha"
              className="block text-gray-700 font-medium mb-2"
            >
              📅 Fecha (opcional):
            </label>
            <input
              type="date"
              id="fecha"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
            <p className="text-xs text-gray-500 mt-1">
              Si no seleccionas una fecha, se usará la fecha de hoy
            </p>
          </div>

          <div className="mb-4">
            <label
              htmlFor="description"
              className="block text-gray-700 font-medium mb-2"
            >
              Descripción del problema: <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              rows={3}
              placeholder="Describe qué sucedió (ej: La basura lleva 3 días sin recoger)"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="photo"
              className="block text-gray-700 font-medium mb-2"
            >
              📷 Foto (opcional):
            </label>
            <input
              type="file"
              id="photo"
              accept="image/*"
              onChange={handlePhotoChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {photo && (
              <div className="mt-2">
                <img
                  src={photo}
                  alt="Preview"
                  className="max-h-40 rounded-lg"
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Crear Reporte
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
