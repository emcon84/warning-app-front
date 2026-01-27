"use client";

import { Report } from "../types";
import {
  getCategoryLabel,
  getCategoryColor,
  getCategoryIcon,
} from "../utils/categoryHelpers";
import {
  Calendar,
  CalendarDays,
  BarChart3,
  MapPin,
  Home,
  Navigation,
  Clock,
} from "lucide-react";

type FilterPeriod = "today" | "week";

interface SidebarProps {
  reports: Report[];
  filterPeriod: FilterPeriod;
  onFilterChange: (period: FilterPeriod) => void;
  totalReports: number;
  onReportClick: (report: Report) => void;
  onViewAll: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  reports,
  filterPeriod,
  onFilterChange,
  totalReports,
  onReportClick,
  onViewAll,
  isOpen,
  onClose,
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
    <div
      className={`
        fixed md:relative
        inset-y-0 left-0
        w-full md:w-80 lg:w-96
        bg-white shadow-lg 
        flex flex-col 
        h-full
        z-[1000]
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}        pt-[60px] md:pt-0      `}
    >
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
              Reportes Ciudadanos
            </h1>
            <p className="text-xs md:text-sm text-gray-600">
              Reconquista, Santa Fe
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Haz clic en el mapa para reportar
            </p>
          </div>
          {/* Botón cerrar solo en mobile */}
          <button
            onClick={onClose}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Cerrar menú"
          >
            <svg
              className="w-6 h-6 text-gray-600"
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
      </div>

      {/* Filtros */}
      <div className="p-3 md:p-4 border-b bg-gray-50">
        <h3 className="text-xs md:text-sm font-semibold text-gray-700 mb-2">
          Filtrar por período
        </h3>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              onClick={() => onFilterChange("today")}
              className={`flex-1 px-2 md:px-3 py-2 rounded-lg text-xs md:text-sm transition-colors font-medium flex items-center justify-center gap-1.5 ${
                filterPeriod === "today"
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
              }`}
            >
              <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4" />
              Hoy
            </button>
            <button
              onClick={() => onFilterChange("week")}
              className={`flex-1 px-2 md:px-3 py-2 rounded-lg text-xs md:text-sm transition-colors font-medium flex items-center justify-center gap-1.5 ${
                filterPeriod === "week"
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5 md:w-4 md:h-4" />
              Semana
            </button>
          </div>

          <button
            onClick={onViewAll}
            className="w-full px-2 md:px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all text-xs md:text-sm font-medium shadow-md flex items-center justify-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Ver Todos los Reportes
          </button>
        </div>
        <div className="mt-3 text-xs md:text-sm text-gray-600">
          <span className="font-semibold">{reports.length}</span> reporte(s) en
          este período
          {totalReports !== reports.length && (
            <span className="text-gray-500"> de {totalReports} total</span>
          )}
        </div>
      </div>

      {/* Lista de reportes */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4">
        {reports.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p className="text-xs md:text-sm">
              No hay reportes en este período
            </p>
          </div>
        ) : (
          <ul className="space-y-2 md:space-y-3">
            {reports.map((report) => (
              <li
                key={report.id}
                className="bg-gray-50 rounded-lg p-2 md:p-3 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  onReportClick(report);
                  onClose();
                }}
              >
                {(() => {
                  const photos =
                    report.photos || (report.photo ? [report.photo] : []);
                  if (photos.length > 0) {
                    const firstPhoto = photos[0];
                    return (
                      <div className="relative mb-2">
                        <img
                          src={
                            firstPhoto.startsWith("http")
                              ? firstPhoto
                              : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}${firstPhoto}`
                          }
                          alt="Foto del reporte"
                          className="w-full h-24 md:h-32 object-cover rounded-lg"
                        />
                        {photos.length > 1 && (
                          <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-semibold">
                            +{photos.length - 1}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                })()}
                <div
                  className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-semibold mb-2 border ${getCategoryColor(report.category)}`}
                >
                  {(() => {
                    const Icon = getCategoryIcon(report.category);
                    return <Icon className="w-3.5 h-3.5" />;
                  })()}
                  {getCategoryLabel(report.category)}
                </div>
                <p className="text-gray-900 font-medium text-xs md:text-sm mb-2 line-clamp-2">
                  {report.description}
                </p>
                <div className="text-xs text-gray-600 space-y-1 bg-white p-2 rounded">
                  <p className="truncate flex items-center gap-1">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <strong>Barrio:</strong> {report.barrio}
                  </p>
                  <p className="truncate flex items-center gap-1">
                    <Home className="w-3 h-3 flex-shrink-0" />
                    <strong>Dirección:</strong> {report.direccion}
                  </p>
                  <p className="text-gray-500 text-[10px] md:text-xs truncate flex items-center gap-1">
                    <Navigation className="w-3 h-3 flex-shrink-0" />
                    {report.lat.toFixed(4)}, {report.lng.toFixed(4)}
                  </p>
                  <p className="text-gray-500 text-[10px] md:text-xs flex items-center gap-1">
                    <Clock className="w-3 h-3 flex-shrink-0" />
                    {formatDate(report.createdAt)}
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
