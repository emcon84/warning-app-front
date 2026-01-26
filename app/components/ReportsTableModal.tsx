"use client";

import { useState } from "react";
import { Report, ReportCategory } from "../types";
import {
  getCategoryLabel,
  getCategoryColor,
  getCategoryIcon,
} from "../utils/categoryHelpers";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import {
  FileText,
  Download,
  Trash2,
  Lightbulb,
  Construction,
  Trees,
} from "lucide-react";

interface ReportsTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: Report[];
  onReportClick: (report: Report) => void;
  onDelete?: (reportId: string) => void;
}

type SortField = "createdAt" | "category" | "barrio";
type SortDirection = "asc" | "desc";

export default function ReportsTableModal({
  isOpen,
  onClose,
  reports,
  onReportClick,
  onDelete,
}: ReportsTableModalProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ReportCategory | "all">(
    "all",
  );
  const [dateFilter, setDateFilter] = useState<
    "all" | "today" | "week" | "month"
  >("all");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

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

  // Filtrar reportes
  const getFilteredReports = () => {
    const now = new Date();
    return reports.filter((report) => {
      // Filtro de búsqueda
      const matchesSearch =
        searchTerm === "" ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.barrio.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.direccion.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro de categoría
      const matchesCategory =
        categoryFilter === "all" || report.category === categoryFilter;

      // Filtro de fecha
      const reportDate = new Date(report.createdAt);
      let matchesDate = true;
      switch (dateFilter) {
        case "today":
          matchesDate = reportDate.toDateString() === now.toDateString();
          break;
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = reportDate >= weekAgo;
          break;
        case "month":
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = reportDate >= monthAgo;
          break;
      }

      return matchesSearch && matchesCategory && matchesDate;
    });
  };

  // Ordenar reportes
  const getSortedReports = () => {
    const filtered = getFilteredReports();
    return [...filtered].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case "createdAt":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case "category":
          aValue = a.category;
          bValue = b.category;
          break;
        case "barrio":
          aValue = a.barrio;
          bValue = b.barrio;
          break;
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const sortedReports = getSortedReports();

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReports = sortedReports.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedReports.length / itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Exportar a PDF
  const exportToPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Reportes Ciudadanos - Reconquista, Santa Fe", 14, 20);
    doc.setFontSize(11);
    doc.text(`Generado: ${new Date().toLocaleString("es-AR")}`, 14, 28);
    doc.text(`Total de reportes: ${sortedReports.length}`, 14, 35);

    const tableData = sortedReports.map((report) => [
      formatDate(report.createdAt),
      getCategoryLabel(report.category).replace(/[^\w\s]/gi, ""),
      report.barrio,
      report.direccion,
      report.description,
    ]);

    autoTable(doc, {
      head: [["Fecha", "Categoría", "Barrio", "Dirección", "Descripción"]],
      body: tableData,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235] },
    });

    doc.save(`reportes-${new Date().toISOString().split("T")[0]}.pdf`);
  };

  // Exportar a Excel
  const exportToExcel = () => {
    const wsData = [
      [
        "Fecha",
        "Categoría",
        "Barrio",
        "Dirección",
        "Descripción",
        "Latitud",
        "Longitud",
      ],
    ];

    sortedReports.forEach((report) => {
      wsData.push([
        formatDate(report.createdAt),
        getCategoryLabel(report.category),
        report.barrio,
        report.direccion,
        report.description,
        report.lat.toString(),
        report.lng.toString(),
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reportes");

    XLSX.writeFile(
      wb,
      `reportes-${new Date().toISOString().split("T")[0]}.xlsx`,
    );
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
        className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3 sm:p-6 border-b flex justify-between items-center">
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
              Todos los Reportes
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              {sortedReports.length} reporte(s) encontrado(s)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl sm:text-3xl font-bold ml-2"
          >
            ×
          </button>
        </div>

        {/* Filtros y Búsqueda */}
        <div className="p-2 sm:p-4 border-b bg-gray-50 space-y-2 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm sm:text-base"
            />

            <select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value as ReportCategory | "all")
              }
              className="px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm sm:text-base"
            >
              <option value="all">Todas las categorías</option>
              <option value="basura">Basura</option>
              <option value="alumbrado">Alumbrado</option>
              <option value="baches">Baches</option>
              <option value="pastizales">Pastizales</option>
              <option value="robo">Robo</option>
              <option value="fugas_agua">Fugas de agua</option>
              <option value="drenaje">Drenaje</option>
              <option value="banquetas">Banquetas</option>
              <option value="semaforos">Semáforos</option>
              <option value="limpieza">Limpieza</option>
              <option value="graffiti">Grafiti</option>
              <option value="escombros">Escombros</option>
              <option value="arboles">Árboles</option>
              <option value="vandalismo">Vandalismo</option>
              <option value="vehiculos_abandonados">
                Vehículos abandonados
              </option>
              <option value="iluminacion">Iluminación</option>
              <option value="animales_callejeros">Animales callejeros</option>
              <option value="plagas">Plagas</option>
              <option value="senalizacion">Señalización</option>
              <option value="estacionamiento">Estacionamiento</option>
              <option value="transporte">Transporte</option>
            </select>

            <select
              value={dateFilter}
              onChange={(e) =>
                setDateFilter(
                  e.target.value as "all" | "today" | "week" | "month",
                )
              }
              className="px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm sm:text-base"
            >
              <option value="all">Todas las fechas</option>
              <option value="today">Hoy</option>
              <option value="week">Última semana</option>
              <option value="month">Último mes</option>
            </select>

            <div className="flex gap-1 sm:gap-2">
              <button
                onClick={exportToPDF}
                className="flex-1 px-2 sm:px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                PDF
              </button>
              <button
                onClick={exportToExcel}
                className="flex-1 px-2 sm:px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Excel
              </button>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="flex-1 overflow-auto p-2 sm:p-4">
          {/* Vista de tarjetas para mobile */}
          <div className="block lg:hidden space-y-2">
            {currentReports.map((report) => (
              <div
                key={report.id}
                className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div
                  className="cursor-pointer"
                  onClick={() => onReportClick(report)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-semibold border ${getCategoryColor(report.category)}`}
                    >
                      {(() => {
                        const Icon = getCategoryIcon(report.category);
                        return <Icon className="w-3 h-3" />;
                      })()}
                      {getCategoryLabel(report.category)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(report.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                    {report.description}
                  </p>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p className="truncate flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <strong>{report.barrio}</strong>
                    </p>
                    <p className="truncate flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                      <strong>{report.direccion}</strong>
                    </p>
                  </div>
                </div>
                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        confirm(
                          "¿Estás seguro de que quieres eliminar este reporte?",
                        )
                      ) {
                        onDelete(report.id);
                      }
                    }}
                    className="mt-2 w-full px-3 py-1.5 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Eliminar
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Vista de tabla para desktop */}
          <table className="w-full text-sm hidden lg:table">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th
                  className="px-4 py-3 text-left cursor-pointer hover:bg-gray-200"
                  onClick={() => handleSort("createdAt")}
                >
                  Fecha{" "}
                  {sortField === "createdAt" &&
                    (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="px-4 py-3 text-left cursor-pointer hover:bg-gray-200"
                  onClick={() => handleSort("category")}
                >
                  Categoría{" "}
                  {sortField === "category" &&
                    (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="px-4 py-3 text-left cursor-pointer hover:bg-gray-200"
                  onClick={() => handleSort("barrio")}
                >
                  Barrio{" "}
                  {sortField === "barrio" &&
                    (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th className="px-4 py-3 text-left">Dirección</th>
                <th className="px-4 py-3 text-left">Descripción</th>
                <th className="px-4 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentReports.map((report) => (
                <tr
                  key={report.id}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => onReportClick(report)}
                >
                  <td className="px-4 py-3 text-gray-700 text-xs">
                    {formatDate(report.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-semibold border ${getCategoryColor(report.category)}`}
                    >
                      {(() => {
                        const Icon = getCategoryIcon(report.category);
                        return <Icon className="w-3.5 h-3.5" />;
                      })()}
                      {getCategoryLabel(report.category)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{report.barrio}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {report.direccion}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {report.description.length > 50
                      ? report.description.substring(0, 50) + "..."
                      : report.description}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onReportClick(report);
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        Ver
                      </button>
                      {onDelete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (
                              confirm(
                                "¿Estás seguro de que quieres eliminar este reporte?",
                              )
                            ) {
                              onDelete(report.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-800 font-medium text-sm flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {currentReports.length === 0 && (
            <div className="text-center py-8 sm:py-12 text-gray-500 text-sm sm:text-base">
              No se encontraron reportes con los filtros seleccionados
            </div>
          )}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="p-2 sm:p-4 border-t bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
            <div className="text-xs sm:text-sm text-gray-600">
              Mostrando {indexOfFirstItem + 1} -{" "}
              {Math.min(indexOfLastItem, sortedReports.length)} de{" "}
              {sortedReports.length}
            </div>
            <div className="flex gap-1 sm:gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-2 sm:px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
              >
                Anterior
              </button>
              <span className="px-2 sm:px-3 py-1 text-gray-700 text-xs sm:text-sm">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="px-2 sm:px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
