"use client";

import { useState } from "react";
import { Doctor } from "../types";
import { ESPECIALIDADES, OBRAS_SOCIALES } from "../utils/doctorHelpers";
import { createDoctor } from "../utils/api";
import { X, Stethoscope } from "lucide-react";

interface AddDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  lat: number;
  lng: number;
  onDoctorCreated: (doctor: Doctor) => void;
}

export default function AddDoctorModal({
  isOpen,
  onClose,
  lat,
  lng,
  onDoctorCreated,
}: AddDoctorModalProps) {
  const [nombre, setNombre] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [direccion, setDireccion] = useState("");
  const [barrio, setBarrio] = useState("");
  const [telefono, setTelefono] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [obrasSociales, setObrasSociales] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleObraSocial = (os: string) => {
    setObrasSociales((prev) =>
      prev.includes(os) ? prev.filter((o) => o !== os) : [...prev, os]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !especialidad || !direccion.trim()) {
      alert("Nombre, especialidad y dirección son obligatorios");
      return;
    }

    setIsSubmitting(true);
    try {
      const doctor = await createDoctor({
        nombre: nombre.trim(),
        especialidad,
        direccion: direccion.trim(),
        barrio: barrio.trim() || undefined,
        telefono: telefono.trim() || undefined,
        whatsapp: whatsapp.trim() || undefined,
        lat,
        lng,
        obrasSociales,
      });
      onDoctorCreated(doctor);
      onClose();
      // Reset form
      setNombre(""); setEspecialidad(""); setDireccion("");
      setBarrio(""); setTelefono(""); setWhatsapp(""); setObrasSociales([]);
    } catch (error) {
      console.error("Error al crear médico:", error);
      alert("Error al guardar. Intentá de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-green-600" />
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">Agregar Médico</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Ubicación: {lat.toFixed(5)}, {lng.toFixed(5)}
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Dr. Juan Pérez"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Especialidad *
            </label>
            <select
              value={especialidad}
              onChange={(e) => setEspecialidad(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800"
              required
            >
              <option value="">Seleccionar especialidad</option>
              {ESPECIALIDADES.map((esp) => (
                <option key={esp} value={esp}>{esp}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Dirección *
            </label>
            <input
              type="text"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Av. San Martín 123"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Barrio (opcional)
            </label>
            <input
              type="text"
              value={barrio}
              onChange={(e) => setBarrio(e.target.value)}
              placeholder="Centro"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Teléfono (opcional)
            </label>
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="03482-123456"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              WhatsApp (opcional)
            </label>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="5493482123456"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Obras Sociales que acepta
            </label>
            <div className="space-y-1">
              {OBRAS_SOCIALES.map((os) => (
                <label key={os} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={obrasSociales.includes(os)}
                    onChange={() => toggleObraSocial(os)}
                    className="w-4 h-4 text-green-600 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{os}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Guardando..." : "Guardar Médico"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
