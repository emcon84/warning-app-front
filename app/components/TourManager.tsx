"use client";

import { useEffect, useRef } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

type MapView = "doctors" | "reports";

interface TourManagerProps {
  mapView: MapView;
}

const STORAGE_KEYS = {
  doctors: "tour_doctors_done",
  reports: "tour_reports_done",
};

function buildDoctorsTour(onDone: () => void) {
  return driver({
    showProgress: true,
    progressText: "{{current}} de {{total}}",
    nextBtnText: "Siguiente →",
    prevBtnText: "← Anterior",
    doneBtnText: "¡Entendido!",
    allowClose: true,
    overlayOpacity: 0.55,
    onDestroyed: onDone,
    steps: [
      {
        element: "[data-tour='view-pills']",
        popover: {
          title: "🗺️ Cambiá de vista",
          description: "Desde acá podés alternar entre el mapa de <strong>Médicos</strong> y el de <strong>Reportes ciudadanos</strong>.",
          side: "bottom",
          align: "center",
        },
      },
      {
        element: "[data-tour='filter-btn']",
        popover: {
          title: "🔍 Filtrá por especialidad",
          description: "Tocá acá para ver solo los médicos de la especialidad que necesitás: cardiólogos, pediatras, kinesiólogos y más.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "[data-tour='map-container']",
        popover: {
          title: "📍 Los médicos en el mapa",
          description: "Cada pin es un médico. Cuando hay varios juntos se agrupan en un número verde — tocá el grupo para separarlos.<br/><br/><strong>Tocá cualquier pin</strong> para ver la info completa.",
          side: "top",
          align: "center",
        },
      },
      {
        element: "[data-tour='map-container']",
        popover: {
          title: "✏️ Completá la info",
          description: "Al abrir un médico vas a ver tres pestañas:<br/><br/>• <strong>Info</strong> — agregá teléfono, dirección o corregí la ubicación del pin<br/>• <strong>Obras Sociales</strong> — confirmá si acepta la tuya<br/>• <strong>Turnos</strong> — reportá si hay turnos disponibles",
          side: "top",
          align: "center",
        },
      },
      {
        element: "[data-tour='map-container']",
        popover: {
          title: "➕ Agregá un médico",
          description: "¿No encontrás a tu médico? <strong>Tocá cualquier punto del mapa</strong> y podés agregar uno nuevo con su nombre, especialidad y dirección.",
          side: "top",
          align: "center",
        },
      },
    ],
  });
}

function buildReportsTour(onDone: () => void) {
  return driver({
    showProgress: true,
    progressText: "{{current}} de {{total}}",
    nextBtnText: "Siguiente →",
    prevBtnText: "← Anterior",
    doneBtnText: "¡Entendido!",
    allowClose: true,
    overlayOpacity: 0.55,
    onDestroyed: onDone,
    steps: [
      {
        element: "[data-tour='view-pills']",
        popover: {
          title: "🗺️ Cambiá de vista",
          description: "Desde acá alternás entre el mapa de <strong>Reportes</strong> y el de <strong>Médicos</strong>.",
          side: "bottom",
          align: "center",
        },
      },
      {
        element: "[data-tour='map-container']",
        popover: {
          title: "📍 Cargá un reporte",
          description: "¿Ves un problema en la ciudad? <strong>Tocá el mapa</strong> en el lugar exacto y completá el formulario: categoría, descripción y barrio.",
          side: "top",
          align: "center",
        },
      },
      {
        element: "[data-tour='emergency-buttons']",
        popover: {
          title: "🚨 Botones de emergencia",
          description: "Acceso rápido al <strong>911</strong> y a <strong>Policía</strong> desde cualquier parte del mapa. También podés reportar robos urgentes directamente.",
          side: "top",
          align: "center",
        },
      },
      {
        element: "[data-tour='map-container']",
        popover: {
          title: "🔎 Ver detalle de un reporte",
          description: "<strong>Tocá cualquier pin</strong> del mapa para ver la descripción completa, fotos y opciones para compartirlo o enviar un reclamo a Servicios Públicos.",
          side: "top",
          align: "center",
        },
      },
      {
        element: "[data-tour='sidebar-toggle']",
        popover: {
          title: "📋 Lista de reportes",
          description: "Desde el menú podés ver todos los reportes recientes, filtrar por fecha y acceder al detalle de cada uno.",
          side: "bottom",
          align: "start",
        },
      },
    ],
  });
}

export default function TourManager({ mapView }: TourManagerProps) {
  const hasRunRef = useRef(false);

  useEffect(() => {
    hasRunRef.current = false;
  }, [mapView]);

  useEffect(() => {
    if (hasRunRef.current) return;

    const storageKey = STORAGE_KEYS[mapView];
    const alreadyDone = localStorage.getItem(storageKey);
    if (alreadyDone) return;

    // Pequeño delay para que el mapa termine de renderizar
    const timeout = setTimeout(() => {
      hasRunRef.current = true;
      const onDone = () => localStorage.setItem(storageKey, "1");
      const tourInstance = mapView === "doctors" ? buildDoctorsTour(onDone) : buildReportsTour(onDone);
      tourInstance.drive();
    }, 800);

    return () => clearTimeout(timeout);
  }, [mapView]);

  return null;
}

// Hook para relanzar el tour manualmente
export function useReplayTour(mapView: MapView) {
  return () => {
    const storageKey = STORAGE_KEYS[mapView];
    localStorage.removeItem(storageKey);
    const onDone = () => localStorage.setItem(storageKey, "1");
    const tourInstance = mapView === "doctors" ? buildDoctorsTour(onDone) : buildReportsTour(onDone);
    tourInstance.drive();
  };
}
