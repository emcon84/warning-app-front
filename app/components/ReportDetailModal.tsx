"use client";

import { Report } from "../types";
import { getCategoryLabel, getCategoryColor } from "../utils/categoryHelpers";

interface ReportDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: Report;
}

export default function ReportDetailModal({
  isOpen,
  onClose,
  report,
}: ReportDetailModalProps) {
  if (!isOpen) return null;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Detalle del Reporte
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {report.photo && (
            <div className="mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={report.photo}
                alt="Foto del reporte"
                className="w-full max-h-96 object-cover rounded-lg"
              />
            </div>
          )}

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-1">
                CATEGORÍA
              </h3>
              <div
                className={`inline-block px-3 py-1 rounded font-semibold border ${getCategoryColor(report.category)}`}
              >
                {getCategoryLabel(report.category)}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-1">
                DESCRIPCIÓN
              </h3>
              <p className="text-lg text-gray-900">{report.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-1">
                  📍 BARRIO
                </h3>
                <p className="text-gray-900">{report.barrio}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-1">
                  🏠 DIRECCIÓN
                </h3>
                <p className="text-gray-900">{report.direccion}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-1">
                📐 COORDENADAS
              </h3>
              <p className="text-gray-900 font-mono text-sm">
                Lat: {report.lat.toFixed(6)}, Lng: {report.lng.toFixed(6)}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-1">
                🕒 FECHA Y HORA
              </h3>
              <p className="text-gray-900">{formatDate(report.createdAt)}</p>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
