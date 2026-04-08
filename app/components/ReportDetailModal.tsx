"use client";

import React, { useState, useEffect } from "react";
import { Report, ReportCategory } from "../types";
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
  Pencil,
} from "lucide-react";
import ConfirmDialog from "./ConfirmDialog";
import EditReportModal from "./EditReportModal";
import { updateReport } from "../utils/api";

interface ReportDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: Report;
  onDelete?: (reportId: string) => void;
  onUpdate?: (updatedReport: Report) => void;
}

export default function ReportDetailModal({
  isOpen,
  onClose,
  report,
  onDelete,
  onUpdate,
}: ReportDetailModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
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

  const handleUpdate = async (data: {
    category: ReportCategory;
    description: string;
    barrio: string;
    direccion: string;
    photos?: File[];
    isUrgent?: boolean;
  }) => {
    try {
      const updatedReport = await updateReport(report.id, data);
      setShowEditModal(false);
      if (onUpdate) {
        onUpdate(updatedReport);
      }
    } catch (error) {
      console.error("Error al actualizar:", error);
      alert("Error al actualizar el reporte. Intenta nuevamente.");
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

🗺️ Ver en mapa: https://www.google.com/maps?q=${report.lat},${report.lng}

🌐 *Reporta incidentes en:* https://reportesreconquista.com`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank");
  };

  const alertOjosEnAlerta = () => {
    const alertTitle =
      report.category === "robo"
        ? "ALERTA DE ROBO EN EJECUCIÓN"
        : "ALERTA DE PERSONAS SOSPECHOSAS";
    const message = `🚨 *${alertTitle}*

⚠️ *URGENTE - Reconquista, Santa Fe*

📝 *Descripción:* ${report.description}

📍 *Ubicación:*
• Barrio: ${report.barrio}
• Dirección: ${report.direccion}

🗺️ Ver ubicación exacta: https://www.google.com/maps?q=${report.lat},${report.lng}

📅 *Reportado:* ${formatDate(report.createdAt)}

🌐 *Reporta incidentes en:* https://reportesreconquista.com`;

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
          backgroundColor: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(6px)",
        }}
        onClick={onClose}
      >
        <div
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-linear-to-r from-gray-50 dark:from-gray-800 to-white dark:to-gray-900 shrink-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Detalle del Reporte
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full p-2 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content - Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6 overflow-y-auto flex-1">
            {/* Left Column - Image and Category */}
            <div className="space-y-4">
              {photos.length > 0 && (
                <div className="relative rounded-xl overflow-hidden bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      photos[currentImageIndex].startsWith("http")
                        ? photos[currentImageIndex]
                        : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}${photos[currentImageIndex]}`
                    }
                    alt={`Foto ${currentImageIndex + 1} del reporte`}
                    className="w-full h-80 object-cover"
                  />

                  {/* Controles del carrusel */}
                  {hasMultiplePhotos && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2.5 transition-all backdrop-blur-sm"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2.5 transition-all backdrop-blur-sm"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>

                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                        {photos.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`h-2 rounded-full transition-all ${
                              index === currentImageIndex
                                ? "bg-white w-8"
                                : "bg-white/60 w-2 hover:bg-white/80"
                            }`}
                          />
                        ))}
                      </div>

                      <div className="absolute top-3 right-3 bg-black/60 text-white px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm">
                        {currentImageIndex + 1} / {photos.length}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Category Badge */}
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
                  Categoría
                </label>
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border-2 ${getCategoryColor(report.category)}`}
                >
                  {React.createElement(getCategoryIcon(report.category), {
                    className: "w-5 h-5",
                  })}
                  {getCategoryLabel(report.category)}
                </div>
              </div>
            </div>

            {/* Right Column - Details and Actions */}
            <div className="space-y-4">
              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
                  Descripción
                </label>
                <p className="text-base text-gray-900 dark:text-gray-100 leading-relaxed bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  {report.description}
                </p>
              </div>

              {/* Location Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    Barrio
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white font-medium">
                    {report.barrio}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Home className="w-4 h-4" />
                    Dirección
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white font-medium">
                    {report.direccion}
                  </p>
                </div>
              </div>

              {/* Coordinates */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Navigation className="w-4 h-4" />
                  Coordenadas
                </label>
                <p className="text-gray-700 dark:text-gray-300 font-mono text-xs bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded border border-gray-200 dark:border-gray-700">
                  {report.lat.toFixed(6)}, {report.lng.toFixed(6)}
                </p>
              </div>

              {/* Date */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  Fecha y Hora
                </label>
                <p className="text-sm text-gray-900 font-medium">
                  {formatDate(report.createdAt)}
                </p>
              </div>

              {/* Emergency Actions */}
              {(report.category === "robo" ||
                report.category === "personas_sospechosas") &&
                report.isUrgent && (
                  <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <h3 className="text-sm font-bold text-red-900 uppercase">
                        {report.category === "robo"
                          ? "Robo en Ejecución - Acción Urgente"
                          : "Personas Sospechosas - Acción Urgente"}
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={callPolice}
                        className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm flex items-center justify-center gap-2"
                      >
                        <Phone className="w-4 h-4" />
                        911
                      </button>
                      <button
                        onClick={alertOjosEnAlerta}
                        className="px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold text-sm flex items-center justify-center gap-2"
                      >
                        <Share2 className="w-4 h-4" />
                        Ojos en Alerta
                      </button>
                    </div>
                  </div>
                )}

              {/* Public Services */}
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
                <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Construction className="w-5 h-5 text-blue-600" />
                    <h3 className="text-sm font-bold text-blue-900 uppercase">
                      Servicios Públicos
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

📅 *Fecha:* ${formatDate(report.createdAt)}

🌐 *Reporta incidentes en:* https://reportesreconquista.com`;

                      const encodedMessage = encodeURIComponent(message);
                      const whatsappUrl = `https://wa.me/5493482519279?text=${encodedMessage}`;
                      window.open(whatsappUrl, "_blank");
                    }}
                    className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Enviar Reclamo
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-4 py-3 sm:py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shrink-0">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2 text-sm"
                >
                  <Pencil className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center justify-center gap-2 text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={shareOnWhatsApp}
                  className="w-full sm:w-auto px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center gap-2 text-sm"
                >
                  <Share2 className="w-4 h-4" />
                  Compartir
                </button>
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors font-semibold text-sm"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditReportModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleUpdate}
        report={report}
      />

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
