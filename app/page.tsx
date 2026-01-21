"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import ReportModal from "./components/ReportModal";
import ReportDetailModal from "./components/ReportDetailModal";
import ReportsTableModal from "./components/ReportsTableModal";
import { Report, ReportCategory } from "./types";
import Sidebar from "./components/Sidebar";
import { getReports, createReport } from "./utils/api";

// Cargar el mapa dinámicamente para evitar errores de SSR
const MapComponent = dynamic(() => import("./components/Map"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-100">
      <p className="text-gray-600">Cargando mapa...</p>
    </div>
  ),
});

type FilterPeriod = "today" | "week";

export default function Home() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>("today");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar reportes al montar el componente
  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getReports();
      setReports(data);
    } catch (err) {
      console.error("Error loading reports:", err);
      setError(
        "Error al cargar los reportes. Asegurate de que la API esté corriendo.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    console.log("Mapa clickeado:", lat, lng);
    setSelectedLocation({ lat, lng });
    setIsModalOpen(true);
  };

  const handleSubmitReport = async (data: {
    category: string;
    description: string;
    barrio: string;
    direccion: string;
    photo?: string;
    fecha?: string;
  }) => {
    console.log("handleSubmitReport llamado con:", data);
    console.log("selectedLocation:", selectedLocation);

    if (selectedLocation) {
      try {
        const newReport = await createReport({
          lat: selectedLocation.lat,
          lng: selectedLocation.lng,
          category: data.category as ReportCategory,
          description: data.description,
          barrio: data.barrio,
          direccion: data.direccion,
          photo: data.photo,
          fecha: data.fecha,
        });

        console.log("Reporte creado exitosamente:", newReport);

        // Actualizar la lista local
        setReports([...reports, newReport]);

        console.log("Reporte agregado, cerrando modal...");
        setIsModalOpen(false);
        setSelectedLocation(null);
      } catch (error) {
        console.error("Error al crear reporte:", error);
        alert(
          "Error al crear el reporte. Asegurate de que la API esté corriendo.",
        );
      }
    } else {
      console.log("ERROR: No hay selectedLocation");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLocation(null);
  };

  const handleReportClick = (report: Report) => {
    setSelectedReport(report);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedReport(null);
  };

  const handleViewAll = () => {
    setIsTableModalOpen(true);
  };

  const getFilteredReports = () => {
    const now = new Date();
    return reports.filter((report) => {
      const reportDate = new Date(report.createdAt);
      switch (filterPeriod) {
        case "today":
          return reportDate.toDateString() === now.toDateString();
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return reportDate >= weekAgo;
        default:
          return true;
      }
    });
  };

  const filteredReports = getFilteredReports();

  // Mostrar estado de carga
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando reportes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Mensaje de error si la API no está disponible */}
      {error && (
        <div className="absolute top-4 right-4 z-[1000] bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg max-w-md">
          <div className="flex items-start">
            <span className="text-xl mr-2">⚠️</span>
            <div>
              <p className="font-semibold">Error de conexión</p>
              <p className="text-sm">{error}</p>
              <button
                onClick={loadReports}
                className="mt-2 text-sm underline hover:no-underline"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar
        reports={filteredReports}
        filterPeriod={filterPeriod}
        onFilterChange={setFilterPeriod}
        totalReports={reports.length}
        onReportClick={handleReportClick}
        onViewAll={handleViewAll}
      />

      {/* Mapa */}
      <div className="flex-1 relative">
        {/* Indicador de instrucción */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[999] bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg">
          📍 Tocá el mapa para crear un reporte
        </div>

        <MapComponent onMapClick={handleMapClick} reports={filteredReports} />
      </div>

      {/* Modal de reporte - fuera del contenedor del mapa */}
      {selectedLocation && (
        <ReportModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmitReport}
          lat={selectedLocation.lat}
          lng={selectedLocation.lng}
        />
      )}

      {/* Modal de detalle del reporte */}
      {selectedReport && (
        <ReportDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          report={selectedReport}
        />
      )}

      {/* Modal de tabla de todos los reportes */}
      <ReportsTableModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        reports={reports}
        onReportClick={(report) => {
          setIsTableModalOpen(false);
          setSelectedReport(report);
          setIsDetailModalOpen(true);
        }}
      />
    </div>
  );
}
