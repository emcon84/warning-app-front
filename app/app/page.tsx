"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import ReportModal from "../components/ReportModal";
import ReportDetailModal from "../components/ReportDetailModal";
import ReportsTableModal from "../components/ReportsTableModal";
import DoctorDetailModal from "../components/DoctorDetailModal";
import AddDoctorModal from "../components/AddDoctorModal";
import FarmaciaDetailModal from "../components/FarmaciaDetailModal";
import OfertasView from "../components/OfertasView";
import { Report, ReportCategory, Doctor, Farmacia, TurnoResponse } from "../types";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import FloatingBottomNav from "../components/FloatingBottomNav";
import VoiceReportButton from "../components/VoiceReportButton";
import ReportsTicker from "../components/ReportsTicker";
import { getReports, createReport, deleteReport, getDoctors, updateDoctor, getFarmacias, getFarmaciasTurno } from "../utils/api";
import { MapPin, AlertTriangle, Stethoscope, Pill, Sun, Moon } from "lucide-react";
import WelcomeTutorial from "../components/WelcomeTutorial";
import { useNotifications } from "../hooks/useNotifications";
import { getCategoryLabel } from "../utils/categoryHelpers";
import { trackSection } from "../utils/tracking";

// Cargar el mapa dinámicamente para evitar errores de SSR
const MapComponent = dynamic(() => import("../components/Map"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-100">
      <p className="text-gray-600">Cargando mapa...</p>
    </div>
  ),
});

type FilterPeriod = "today" | "week";
type MapView = "doctors" | "reports" | "farmacias" | "ofertas";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [reports, setReports] = useState<Report[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [farmacias, setFarmacias] = useState<Farmacia[]>([]);
  const [turno, setTurno] = useState<TurnoResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>("week");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isDoctorDetailOpen, setIsDoctorDetailOpen] = useState(false);
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const mapView = (["doctors", "reports", "farmacias", "ofertas"].includes(searchParams.get("view") ?? "")
    ? searchParams.get("view")
    : "reports") as MapView;

  function setMapView(view: MapView) {
    router.replace(`/app?view=${view}`, { scroll: false });
  }
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [filterIapos, setFilterIapos] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [relocatingDoctorId, setRelocatingDoctorId] = useState<string | null>(null);
  const [selectedFarmacia, setSelectedFarmacia] = useState<Farmacia | null>(null);
  const [isFarmaciaDetailOpen, setIsFarmaciaDetailOpen] = useState(false);
  const [relocatingFarmaciaId, setRelocatingFarmaciaId] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("map_theme") as "light" | "dark") || "light";
    }
    return "light";
  });

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("map_theme", next);
      return next;
    });
  };

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const { showNotification, permission } = useNotifications();

  // Trackear sección activa
  useEffect(() => {
    trackSection(mapView);
  }, [mapView]);

  // Cargar reportes y médicos al montar el componente
  useEffect(() => {
    loadReports();
    loadDoctors();
    loadFarmacias();
  }, []);

  const loadDoctors = async () => {
    try {
      const data = await getDoctors();
      setDoctors(data);
    } catch (err) {
      console.error("Error loading doctors:", err);
    }
  };

  const loadFarmacias = async () => {
    try {
      const [todas, turnoData] = await Promise.all([getFarmacias(), getFarmaciasTurno()]);
      setTurno(turnoData);
      const turnoIds = new Set(turnoData.farmacias.map((f: Farmacia) => f.id));
      setFarmacias(todas.map((f: Farmacia) => ({ ...f, esDeturno: turnoIds.has(f.id) })));
    } catch (err) {
      console.error("Error loading farmacias:", err);
    }
  };

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
    if (relocatingDoctorId) return;
    if (mapView === "farmacias" || mapView === "ofertas") return;
    setSelectedLocation({ lat, lng });
    if (mapView === "doctors") {
      setIsAddDoctorOpen(true);
    } else {
      setIsModalOpen(true);
    }
  };

  const handleDoctorClick = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsDoctorDetailOpen(true);
  };

  const handleDoctorCreated = (doctor: Doctor) => {
    setDoctors([...doctors, doctor]);
  };

  const handleStartRelocate = (doctorId: string) => {
    setIsDoctorDetailOpen(false);
    setSelectedDoctor(null);
    setRelocatingDoctorId(doctorId);
    setMapView("doctors");
  };

  const handleDoctorRelocated = async (doctorId: string, lat: number, lng: number) => {
    try {
      const updated = await updateDoctor(doctorId, { lat, lng });
      setDoctors(doctors.map((d) => d.id === doctorId ? updated : d));
      setRelocatingDoctorId(null);
    } catch {
      alert("Error al guardar la ubicación. Intentá de nuevo.");
    }
  };

  const handleDoctorUpdate = (updatedDoctor: Doctor) => {
    setDoctors(doctors.map((d) => (d.id === updatedDoctor.id ? updatedDoctor : d)));
    if (selectedDoctor?.id === updatedDoctor.id) {
      setSelectedDoctor(updatedDoctor);
    }
  };

  const handleDoctorDelete = (doctorId: string) => {
    setDoctors(doctors.filter((d) => d.id !== doctorId));
    setIsDoctorDetailOpen(false);
    setSelectedDoctor(null);
  };

  const handleFarmaciaClick = (farmacia: Farmacia) => {
    setSelectedFarmacia(farmacia);
    setIsFarmaciaDetailOpen(true);
  };

  const handleFarmaciaUpdate = (updated: Farmacia) => {
    setFarmacias(prev => prev.map(f => f.id === updated.id ? { ...f, ...updated } : f));
    setSelectedFarmacia(prev => prev?.id === updated.id ? { ...prev, ...updated } : prev);
  };

  const handleStartFarmaciaRelocate = (farmaciaId: string) => {
    setIsFarmaciaDetailOpen(false);
    setSelectedFarmacia(null);
    setRelocatingFarmaciaId(farmaciaId);
    setMapView("farmacias");
  };

  const handleFarmaciaRelocated = async (farmaciaId: string, lat: number, lng: number) => {
    try {
      const { updateFarmacia } = await import("../utils/api");
      const updated = await updateFarmacia(farmaciaId, { lat, lng });
      setFarmacias(prev => prev.map(f => f.id === farmaciaId ? { ...f, ...updated } : f));
      setRelocatingFarmaciaId(null);
    } catch {
      alert("Error al guardar la ubicación. Intentá de nuevo.");
    }
  };

  const handleSubmitReport = async (data: {
    category: string;
    description: string;
    barrio: string;
    direccion: string;
    photo?: File;
    photos?: File[];
    fecha?: string;
    isUrgent?: boolean;
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
          photos: data.photos,
          fecha: data.fecha,
          isUrgent: data.isUrgent,
        });

        console.log("Reporte creado exitosamente:", newReport);

        // Actualizar la lista local
        setReports([...reports, newReport]);
        // Enviar notificación push
        if (permission === "granted") {
          const categoryLabel = getCategoryLabel(newReport.category);
          const isUrgent = newReport.category === "robo" && newReport.isUrgent;

          await showNotification(
            isUrgent
              ? "🚨 ALERTA: Robo en ejecución"
              : `🚨 Nuevo Reporte: ${categoryLabel}`,
            {
              body: `${newReport.description}\nBarrio: ${newReport.barrio}`,
              tag: newReport.id,
              requireInteraction: isUrgent,
              data: {
                reportId: newReport.id,
                lat: newReport.lat,
                lng: newReport.lng,
              },
            },
          );
        }

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

  const handleDeleteReport = async (reportId: string) => {
    try {
      await deleteReport(reportId);
      // Actualizar la lista local eliminando el reporte
      setReports(reports.filter((r) => r.id !== reportId));
    } catch (error) {
      console.error("Error al eliminar reporte:", error);
      throw error;
    }
  };

  const handleUpdateReport = (updatedReport: Report) => {
    // Actualizar la lista local con el reporte actualizado
    setReports(
      reports.map((r) => (r.id === updatedReport.id ? updatedReport : r)),
    );
    // Actualizar el reporte seleccionado si es el mismo
    if (selectedReport?.id === updatedReport.id) {
      setSelectedReport(updatedReport);
    }
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

  const allSpecialties = [...new Set(doctors.map((d) => d.especialidad))].sort();

  const toggleSpecialty = (esp: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(esp) ? prev.filter((s) => s !== esp) : [...prev, esp]
    );
  };

  const filteredDoctors = doctors
    .filter((d) => selectedSpecialties.length === 0 || selectedSpecialties.includes(d.especialidad))
    .filter((d) => !filterIapos || d.iapos);

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
    <div className="flex flex-col h-screen overflow-hidden dark:bg-gray-950">
      {/* Mensaje de error si la API no está disponible */}
      {error && (
        <div className="absolute top-20 right-4 z-[1000] bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg max-w-md">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
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

      {/* Navbar */}
      {/* Navbar */}
      <div data-tour="view-pills">
        <Navbar
          totalReports={reports.length}
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          mapView={mapView}
          onMapViewChange={(v) => { setMapView(v as MapView); if (v === "doctors" || v === "farmacias" || v === "ofertas") setIsSidebarOpen(false); }}
          sidebarDisabled={mapView === "doctors" || mapView === "farmacias" || mapView === "ofertas"}
        />
      </div>

      {/* Contenedor principal con navbar */}
      <div className="flex flex-1 overflow-hidden mt-[60px]">
        {/* Overlay para cerrar sidebar - solo mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-[999] sm:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <Sidebar
          reports={filteredReports}
          filterPeriod={filterPeriod}
          onFilterChange={setFilterPeriod}
          totalReports={reports.length}
          onReportClick={handleReportClick}
          onViewAll={handleViewAll}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Mapa */}
        <div className="flex-1 relative w-full h-full" data-tour="map-container">
          {/* Instrucción contextual — solo al relocalizar */}
          {relocatingDoctorId && (
            <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-[999] bg-amber-500 text-white px-3 py-1.5 rounded-full shadow-lg text-xs flex items-center gap-2 font-semibold">
              <MapPin className="w-3.5 h-3.5" />
              Arrastrá el pin amarillo a la posición correcta
              <button onClick={() => setRelocatingDoctorId(null)} className="ml-1 hover:text-amber-100">✕</button>
            </div>
          )}

          {relocatingFarmaciaId && (
            <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-[999] bg-amber-500 text-white px-3 py-1.5 rounded-full shadow-lg text-xs flex items-center gap-2 font-semibold">
              <MapPin className="w-3.5 h-3.5" />
              Arrastrá el pin de la farmacia a la posición correcta
              <button onClick={() => setRelocatingFarmaciaId(null)} className="ml-1 hover:text-amber-100">✕</button>
            </div>
          )}

          {/* Hint "tocá para agregar" — solo en vista médicos */}
          {mapView === "doctors" && !relocatingDoctorId && (
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-[999] bg-white/90 backdrop-blur-sm border border-green-200 text-green-700 px-4 py-2 rounded-full shadow text-xs font-semibold flex items-center gap-1.5 pointer-events-none">
              <Stethoscope className="w-3.5 h-3.5" />
              Tocá el mapa para agregar un médico
            </div>
          )}

          {/* Card farmacia de turno */}
          {mapView === "farmacias" && turno && (
            <div className="absolute top-3 left-3 right-3 z-[999] bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-green-200 dark:border-green-800 p-3 max-w-sm mx-auto">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0">
                  <Pill className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">Farmacia de turno — {turno.fecha}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Solo recetas y medicamentos de emergencia · 8h a 8h</p>
                </div>
              </div>
              {turno.farmacias.length > 0 ? (
                <div className="space-y-1.5">
                  {turno.farmacias.map(f => (
                    <div key={f.id} className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 rounded-xl px-3 py-2">
                      <div>
                        <p className="text-sm font-bold text-green-800 dark:text-green-400">{f.nombre}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{f.direccion}</p>
                      </div>
                      {f.telefono && (
                        <a href={`tel:${f.telefono}`} className="ml-2 flex-shrink-0 p-1.5 bg-green-600 text-white rounded-lg">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                          </svg>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 dark:text-gray-500 italic text-center py-1">No se encontró farmacia de turno para hoy</p>
              )}
            </div>
          )}

          {/* Botón filtrar especialidades */}
          {mapView === "doctors" && allSpecialties.length > 0 && (
            <button
              data-tour="filter-btn"
              onClick={() => setShowFilterSheet(true)}
              className={`absolute top-3 left-3 z-[999] flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-md transition-colors ${
                selectedSpecialties.length > 0
                  ? "bg-green-500 text-white"
                  : "bg-white text-gray-700 border border-gray-300"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M7 8h10M11 12h2" />
              </svg>
              {selectedSpecialties.length > 0 ? `${selectedSpecialties.length} filtro${selectedSpecialties.length > 1 ? "s" : ""}` : "Filtrar"}
            </button>
          )}

          {/* Bottom sheet de filtros */}
          {showFilterSheet && (
            <>
              <div className="fixed inset-0 z-[1500] bg-black/40" onClick={() => setShowFilterSheet(false)} />
              <div className="fixed bottom-0 left-0 right-0 z-[1501] bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl max-h-[70vh] flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b dark:border-gray-700 flex-shrink-0">
                  <h3 className="font-bold text-gray-900 dark:text-white">Filtrar médicos</h3>
                  <div className="flex items-center gap-2">
                    {(selectedSpecialties.length > 0 || filterIapos) && (
                      <button onClick={() => { setSelectedSpecialties([]); setFilterIapos(false); }} className="text-xs text-red-500 font-semibold">
                        Limpiar
                      </button>
                    )}
                    <button onClick={() => setShowFilterSheet(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                      <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="overflow-y-auto p-4 space-y-4">
                  {/* Filtro obra social */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Obra Social</p>
                    <button
                      onClick={() => setFilterIapos(prev => !prev)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        filterIapos ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      <Stethoscope className="w-3.5 h-3.5 inline mr-1" />Solo IAPOS
                    </button>
                  </div>
                  {/* Filtro especialidad */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Especialidad</p>
                  <div className="flex flex-wrap gap-2">
                    {allSpecialties.map((esp) => (
                      <button
                        key={esp}
                        onClick={() => toggleSpecialty(esp)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          selectedSpecialties.includes(esp)
                            ? "bg-green-500 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                        }`}
                      >
                        {esp}
                      </button>
                    ))}
                  </div>
                  </div>
                </div>
              </div>
            </>
          )}

          <MapComponent
            onMapClick={handleMapClick}
            reports={filteredReports}
            doctors={filteredDoctors}
            farmacias={farmacias}
            showDoctors={mapView === "doctors"}
            showReports={mapView === "reports"}
            showFarmacias={mapView === "farmacias"}
            onDoctorClick={handleDoctorClick}
            relocatingDoctorId={relocatingDoctorId}
            onDoctorRelocated={handleDoctorRelocated}
            onFarmaciaClick={handleFarmaciaClick}
            relocatingFarmaciaId={relocatingFarmaciaId}
            onFarmaciaRelocated={handleFarmaciaRelocated}
            theme={theme}
          />
        </div>
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
          onDelete={handleDeleteReport}
          onUpdate={handleUpdateReport}
        />
      )}

      {/* Modal de detalle del médico */}
      {selectedDoctor && (
        <DoctorDetailModal
          isOpen={isDoctorDetailOpen}
          onClose={() => { setIsDoctorDetailOpen(false); setSelectedDoctor(null); }}
          doctor={selectedDoctor}
          onDoctorUpdate={handleDoctorUpdate}
          onRelocate={handleStartRelocate}
          onDelete={handleDoctorDelete}
        />
      )}

      {/* Modal de detalle de farmacia */}
      {selectedFarmacia && (
        <FarmaciaDetailModal
          isOpen={isFarmaciaDetailOpen}
          onClose={() => { setIsFarmaciaDetailOpen(false); setSelectedFarmacia(null); }}
          farmacia={selectedFarmacia}
          onFarmaciaUpdate={handleFarmaciaUpdate}
          onStartDrag={handleStartFarmaciaRelocate}
        />
      )}

      {/* Modal para agregar médico */}
      {selectedLocation && isAddDoctorOpen && (
        <AddDoctorModal
          isOpen={isAddDoctorOpen}
          onClose={() => { setIsAddDoctorOpen(false); setSelectedLocation(null); }}
          lat={selectedLocation.lat}
          lng={selectedLocation.lng}
          onDoctorCreated={handleDoctorCreated}
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
        onDelete={handleDeleteReport}
      />

      {/* Botones de emergencia — solo en vista reportes/todo */}
      {mapView === "reports" && (
        <div data-tour="emergency-buttons">
          <FloatingBottomNav />
        </div>
      )}




      {/* Vista de ofertas de supermercados */}
      <OfertasView isVisible={mapView === "ofertas"} />

      {/* Ticker de reportes recientes */}
      {mapView === "reports" && (
        <ReportsTicker
          reports={reports}
          onReportClick={(r) => setSelectedReport(r)}
        />
      )}

      {/* Botón crear reporte por voz */}
      <VoiceReportButton
        onReportCreated={(report) => setReports((prev) => [...prev, report])}
      />

      {/* Botón tema claro/oscuro */}
      <button
        onClick={toggleTheme}
        title={theme === "light" ? "Cambiar a tema oscuro" : "Cambiar a tema claro"}
        className={`fixed bottom-44 right-4 z-[1000] w-11 h-11 rounded-full shadow-lg flex items-center justify-center transition-all hover:shadow-xl ${
          theme === "dark"
            ? "bg-gray-800 border border-gray-600 text-yellow-300 hover:bg-gray-700"
            : "bg-white border border-gray-200 text-gray-600 hover:text-gray-900"
        }`}
      >
        {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* Tutorial de bienvenida */}
      <WelcomeTutorial />

    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}
