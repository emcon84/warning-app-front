"use client";

import { Report } from "../types";
import { getCategoryLabel, getCategoryColor } from "../utils/categoryHelpers";

type FilterPeriod = "today" | "week";

interface SidebarProps {
  reports: Report[];
  filterPeriod: FilterPeriod;
  onFilterChange: (period: FilterPeriod) => void;
  totalReports: number;
  onReportClick: (report: Report) => void;
  onViewAll: () => void;
}

export default function Sidebar({
  reports,
  filterPeriod,
  onFilterChange,
  totalReports,
  onReportClick,
  onViewAll,
}: SidebarProps) {
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
    <div className="w-80 bg-white shadow-lg flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Reportes Ciudadanos
        </h1>
        <p className="text-sm text-gray-600">Reconquista, Santa Fe</p>
        <p className="text-xs text-gray-500 mt-1">
          Haz clic en el mapa para reportar
        </p>
      </div>

      {/* Filtros */}
      <div className="p-4 border-b bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          Filtrar por período
        </h3>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              onClick={() => onFilterChange("today")}
              className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors font-medium ${
                filterPeriod === "today"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
              }`}
            >
              📅 Hoy
            </button>
            <button
              onClick={() => onFilterChange("week")}
              className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors font-medium ${
                filterPeriod === "week"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
              }`}
            >
              📆 Semana
            </button>
          </div>

          <button
            onClick={onViewAll}
            className="w-full px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all text-sm font-medium shadow-md"
          >
            📊 Ver Todos los Reportes
          </button>
        </div>
        <div className="mt-3 text-sm text-gray-600">
          <span className="font-semibold">{reports.length}</span> reporte(s) en
          este período
          {totalReports !== reports.length && (
            <span className="text-gray-500"> de {totalReports} total</span>
          )}
        </div>
      </div>

      {/* Lista de reportes */}
      <div className="flex-1 overflow-y-auto p-4">
        {reports.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p className="text-sm">No hay reportes en este período</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {reports.map((report) => (
              <li
                key={report.id}
                className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer hover:bg-gray-100"
                onClick={() => onReportClick(report)}
              >
                {report.photo && (
                  <img
                    src={report.photo}
                    alt="Foto del reporte"
                    className="w-full h-32 object-cover rounded-lg mb-2"
                  />
                )}
                <div
                  className={`inline-block px-2 py-1 rounded text-xs font-semibold mb-2 border ${getCategoryColor(report.category)}`}
                >
                  {getCategoryLabel(report.category)}
                </div>
                <p className="text-gray-900 font-medium text-sm mb-2">
                  {report.description}
                </p>
                <div className="text-xs text-gray-600 space-y-1 bg-white p-2 rounded">
                  <p>
                    <strong>📍 Barrio:</strong> {report.barrio}
                  </p>
                  <p>
                    <strong>🏠 Dirección:</strong> {report.direccion}
                  </p>
                  <p className="text-gray-500">
                    📐 {report.lat.toFixed(4)}, {report.lng.toFixed(4)}
                  </p>
                  <p className="text-gray-500">
                    🕒 {formatDate(report.createdAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
