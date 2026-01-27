"use client";

import React, { useState, useEffect } from "react";
import { Report } from "../types";
import {
  getCategoryLabel,
  getCategoryColor,
  getCategoryIcon,
} from "../utils/categoryHelpers";
import {
  MapPin,
  Home,
  Navigation,
  Clock,
  Share2,
  Phone,
  AlertTriangle,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Construction,
} from "lucide-react";
import ConfirmDialog from "./ConfirmDialog";

interface ReportDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: Report;
  onDelete?: (reportId: string) => void;
}

export default function ReportDetailModal({
  isOpen,
  onClose,
  report,
  onDelete,
}: ReportDetailModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Obtener todas las fotos (compatibilidad con photo y photos)
  const photos = report.photos || (report.photo ? [report.photo] : []);
  const hasMultiplePhotos = photos.length > 1;

  // Autoplay del carrusel
  useEffect(() => {
    if (!hasMultiplePhotos) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % photos.length);
    }, 3000); // Cambia cada 3 segundos

    return () => clearInterval(interval);
  }, [hasMultiplePhotos, photos.length]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % photos.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  if (!isOpen) return null;

  const handleDelete = async () => {
    try {
      if (onDelete) {
        await onDelete(report.id);
        setShowDeleteConfirm(false);
        onClose();
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("Error al eliminar el reporte. Intenta nuevamente.");
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const shareOnWhatsApp = () => {
    const message = `🚨 *Reporte Ciudadano - Reconquista*

📌 *Categoría:* ${getCategoryLabel(report.category)}
📝 *Descripción:* ${report.description}

📍 *Ubicación:*
• Barrio: ${report.barrio}
• Dirección: ${report.direccion}

📅 *Fecha:* ${formatDate(report.createdAt)}

🗺️ Ver en mapa: https://www.google.com/maps?q=${report.lat},${report.lng}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank");
  };

  const alertOjosEnAlerta = () => {
    const message = `🚨 *ALERTA DE ROBO EN EJECUCIÓN*

⚠️ *URGENTE - Reconquista, Santa Fe*

📝 *Descripción:* ${report.description}

📍 *Ubicación:*
• Barrio: ${report.barrio}
• Dirección: ${report.direccion}

🗺️ Ver ubicación exacta: https://www.google.com/maps?q=${report.lat},${report.lng}

📅 *Reportado:* ${formatDate(report.createdAt)}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/5493482730030?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank");
  };

  const callPolice = () => {
    window.location.href = "tel:911";
  };

  return (
    <>
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
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 sm:p-6">
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Detalle del Reporte
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-2xl sm:text-3xl font-bold ml-2"
              >
                ×
              </button>
            </div>

            {photos.length > 0 && (
              <div className="mb-3 sm:mb-4 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    photos[currentImageIndex].startsWith("http")
                      ? photos[currentImageIndex]
                      : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}${photos[currentImageIndex]}`
                  }
                  alt={`Foto ${currentImageIndex + 1} del reporte`}
                  className="w-full max-h-64 sm:max-h-96 object-cover rounded-lg"
                />

                {/* Controles del carrusel */}
                {hasMultiplePhotos && (
                  <>
                    {/* Botones de navegación */}
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>

                    {/* Indicadores */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                      {photos.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === currentImageIndex
                              ? "bg-white w-6"
                              : "bg-white/50"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Contador */}
                    <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                      {currentImageIndex + 1} / {photos.length}
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="space-y-3 sm:space-y-4">
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-500 mb-1">
                  CATEGORÍA
                </h3>
                <div
                  className={`inline-flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-semibold border ${getCategoryColor(report.category)}`}
                >
                  {React.createElement(getCategoryIcon(report.category), {
                    className: "w-4 h-4",
                  })}
                  {getCategoryLabel(report.category)}
                </div>
              </div>

              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-500 mb-1">
                  DESCRIPCIÓN
                </h3>
                <p className="text-sm sm:text-lg text-gray-900">
                  {report.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-500 mb-1 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    BARRIO
                  </h3>
                  <p className="text-sm sm:text-base text-gray-900 truncate">
                    {report.barrio}
                  </p>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-500 mb-1 flex items-center gap-1.5">
                    <Home className="w-4 h-4" />
                    DIRECCIÓN
                  </h3>
                  <p className="text-sm sm:text-base text-gray-900 truncate">
                    {report.direccion}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-500 mb-1 flex items-center gap-1.5">
                  <Navigation className="w-4 h-4" />
                  COORDENADAS
                </h3>
                <p className="text-gray-900 font-mono text-xs sm:text-sm break-all">
                  Lat: {report.lat.toFixed(6)}, Lng: {report.lng.toFixed(6)}
                </p>
              </div>

              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-500 mb-1 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  FECHA Y HORA
                </h3>
                <p className="text-sm sm:text-base text-gray-900">
                  {formatDate(report.createdAt)}
                </p>
              </div>
            </div>

            {/* Botones de emergencia para robos en ejecución */}
            {report.category === "robo" && report.isUrgent && (
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <h3 className="text-sm sm:text-base font-bold text-red-900">
                    ROBO EN EJECUCIÓN - ACCIÓN URGENTE
                  </h3>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={callPolice}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2"
                  >
                    <Phone className="w-5 h-5" />
                    Llamar a la Policía (911)
                  </button>
                  <button
                    onClick={alertOjosEnAlerta}
                    className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-5 h-5" />
                    Avisar a Ojos en Alerta
                  </button>
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
            ].includes(report.category) && (
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Construction className="w-5 h-5 text-blue-600" />
                  <h3 className="text-sm sm:text-base font-bold text-blue-900">
                    Contacto Rápido - Servicios Públicos
                  </h3>
                </div>
                <button
                  onClick={() => {
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

📋 *Tipo de Reclamo:* ${categoryLabels[report.category] || report.category}

📝 *Descripción:* ${report.description}

📍 *Ubicación:*
• Barrio: ${report.barrio}
• Dirección: ${report.direccion}

🗺️ Ver ubicación: https://www.google.com/maps?q=${report.lat},${report.lng}

📅 *Fecha:* ${formatDate(report.createdAt)}`;

                    const encodedMessage = encodeURIComponent(message);
                    const whatsappUrl = `https://wa.me/5493482519279?text=${encodedMessage}`;
                    window.open(whatsappUrl, "_blank");
                  }}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <Share2 className="w-5 h-5" />
                  Enviar Reclamo a Servicios Públicos
                </button>
              </div>
            )}

            <div className="mt-4 sm:mt-6 flex justify-between gap-2">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 sm:px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </button>
              <div className="flex gap-2">
                <button
                  onClick={shareOnWhatsApp}
                  className="px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Compartir
                </button>
                <button
                  onClick={onClose}
                  className="px-4 sm:px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm sm:text-base"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Eliminar Reporte"
        message="¿Estás seguro de que quieres eliminar este reporte? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}
