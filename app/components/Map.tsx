"use client";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import L from "leaflet";
import "leaflet.markercluster";
import { useState, useEffect } from "react";
import { Report, Doctor, Farmacia } from "../types";
import { DEFAULT_CENTER, TILE_LAYERS, createCustomIcon, createFarmaciaIcon } from "./map/map-icons";
import { DoctorClusterLayer } from "./map/DoctorClusterLayer";
import { ReportPopup } from "./map/ReportPopup";

interface MapComponentProps {
  onMapClick: (lat: number, lng: number) => void;
  reports: Report[];
  doctors?: Doctor[];
  farmacias?: Farmacia[];
  showDoctors?: boolean;
  showReports?: boolean;
  showFarmacias?: boolean;
  onDoctorClick?: (doctor: Doctor) => void;
  relocatingDoctorId?: string | null;
  onDoctorRelocated?: (doctorId: string, lat: number, lng: number) => void;
  onFarmaciaClick?: (farmacia: Farmacia) => void;
  relocatingFarmaciaId?: string | null;
  onFarmaciaRelocated?: (farmaciaId: string, lat: number, lng: number) => void;
  theme?: "light" | "dark";
}

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => { onMapClick(e.latlng.lat, e.latlng.lng); },
  });
  return null;
}

export default function MapComponent({
  onMapClick,
  reports,
  doctors = [],
  farmacias = [],
  showDoctors = true,
  showReports = true,
  showFarmacias = false,
  onDoctorClick,
  relocatingDoctorId,
  onDoctorRelocated,
  onFarmaciaClick,
  relocatingFarmaciaId,
  onFarmaciaRelocated,
  theme = "light",
}: MapComponentProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={13}
      style={{ width: "100%", height: "100%", minHeight: "100vh" }}
      className="z-0"
    >
      <TileLayer key={theme} attribution={TILE_LAYERS[theme].attribution} url={TILE_LAYERS[theme].url} />
      <MapClickHandler onMapClick={onMapClick} />

      {showDoctors && (
        <DoctorClusterLayer
          doctors={doctors}
          relocatingDoctorId={relocatingDoctorId}
          onDoctorClick={onDoctorClick}
          onDoctorRelocated={onDoctorRelocated}
        />
      )}

      {showFarmacias && farmacias.map((f) => (
        <Marker
          key={`farmacia-${f.id}`}
          position={[f.lat, f.lng]}
          icon={createFarmaciaIcon(!!f.esDeturno)}
          draggable={relocatingFarmaciaId === f.id}
          eventHandlers={{
            click: () => relocatingFarmaciaId !== f.id && onFarmaciaClick?.(f),
            dragend: (e) => {
              const { lat, lng } = (e.target as L.Marker).getLatLng();
              onFarmaciaRelocated?.(f.id, lat, lng);
            },
          }}
        >
          <Popup closeButton={false} autoPan={false}>
            <div style={{ minWidth: "150px", fontFamily: "sans-serif", pointerEvents: "none" }}>
              {f.esDeturno && (
                <p style={{ color: "#16a34a", fontWeight: 700, fontSize: "10px", margin: "0 0 4px", textTransform: "uppercase" }}>
                  De turno hoy
                </p>
              )}
              <p style={{ fontWeight: 700, fontSize: "13px", margin: "0 0 2px" }}>{f.nombre}</p>
              <p style={{ color: "#6b7280", fontSize: "11px", margin: "0 0 2px" }}>{f.direccion}</p>
              {f.telefono && (
                <p style={{ color: "#9ca3af", fontSize: "11px", margin: 0 }}>{f.telefono}</p>
              )}
              <p style={{ color: "#9ca3af", fontSize: "10px", margin: "6px 0 0", fontStyle: "italic" }}>Tocá para ver más info</p>
            </div>
          </Popup>
        </Marker>
      ))}

      {showReports && reports.filter((r) => r.category !== "voz").map((report) => (
        <Marker
          key={report.id}
          position={[report.lat, report.lng]}
          icon={createCustomIcon(report.category as any)}
        >
          <Popup>
            <ReportPopup report={report} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
