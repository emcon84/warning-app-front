"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { Report, ReportCategory, Doctor, Farmacia } from "../types";
import L from "leaflet";
import "leaflet.markercluster";
import { useState, useEffect, useRef } from "react";
import {
  getCategoryLabel,
  getCategoryIconSvg,
  getCategoryIcon,
} from "../utils/categoryHelpers";
import { getDoctorPinColor, getDoctorIconSvg } from "../utils/doctorHelpers";
import { Share2, Phone, AlertTriangle } from "lucide-react";

// Crear iconos personalizados para cada categoría
const createCustomIcon = (category: ReportCategory) => {
  const colors = {
    basura: "#f97316", // orange-500
    alumbrado: "#eab308", // yellow-500
    baches: "#ef4444", // red-500
    pastizales: "#22c55e", // green-500
    robo: "#dc2626", // red-600
    personas_sospechosas: "#dc2626", // red-600
    fugas_agua: "#3b82f6", // blue-500
    drenaje: "#06b6d4", // cyan-500
    banquetas: "#78716c", // stone-500
    semaforos: "#f59e0b", // amber-500
    limpieza: "#0ea5e9", // sky-500
    graffiti: "#ec4899", // pink-500
    escombros: "#6b7280", // gray-500
    arboles: "#10b981", // emerald-500
    vandalismo: "#f43f5e", // rose-500
    vehiculos_abandonados: "#64748b", // slate-500
    iluminacion: "#fbbf24", // yellow-400
    animales_callejeros: "#fb923c", // orange-400
    plagas: "#dc2626", // red-600
    senalizacion: "#6366f1", // indigo-500
    estacionamiento: "#8b5cf6", // violet-500
    transporte: "#3b82f6", // blue-500
  };

  const iconSvg = getCategoryIconSvg(category);

  return L.divIcon({
    html: `
      <div style="
        background-color: ${colors[category]};
        width: 40px;
        height: 40px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 3px 10px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        ">${iconSvg}</div>
      </div>
    `,
    className: "custom-marker",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

// Crear icono para doctor
const createDoctorIcon = (doctor: Doctor) => {
  return L.divIcon({
    html: getDoctorIconSvg(doctor),
    className: "",
    iconSize: [38, 44],
    iconAnchor: [19, 44],
    popupAnchor: [0, -44],
  });
};

// Centro en Reconquista, Santa Fe, Argentina
const defaultCenter: [number, number] = [-29.15, -59.65];

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
}

function MapClickHandler({
  onMapClick,
}: {
  onMapClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click: (e) => {
      console.log("Click en mapa detectado:", e.latlng);
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Icono especial para el pin en modo relocalización
const createRelocateIcon = () => L.divIcon({
  html: `<div style="
    width: 44px; height: 44px; border-radius: 50%;
    background: #f59e0b; border: 3px solid white;
    box-shadow: 0 0 0 3px #f59e0b, 0 4px 12px rgba(0,0,0,0.4);
    display: flex; align-items: center; justify-content: center;
    animation: pulse 1s infinite;
  ">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/>
    </svg>
  </div>`,
  className: "",
  iconSize: [44, 44],
  iconAnchor: [22, 44],
  popupAnchor: [0, -44],
});

// ─── Cluster layer para doctores ─────────────────────────────────────────────
interface DoctorClusterLayerProps {
  doctors: Doctor[];
  relocatingDoctorId: string | null | undefined;
  onDoctorClick?: (doctor: Doctor) => void;
  onDoctorRelocated?: (doctorId: string, lat: number, lng: number) => void;
}

function DoctorClusterLayer({ doctors, relocatingDoctorId, onDoctorClick, onDoctorRelocated }: DoctorClusterLayerProps) {
  const map = useMap();
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    // Crear cluster group con estilo personalizado
    const clusterGroup = (L as any).markerClusterGroup({
      maxClusterRadius: 50,
      iconCreateFunction: (cluster: any) => {
        const count = cluster.getChildCount();
        return L.divIcon({
          html: `<div style="
            background: #16a34a;
            color: white;
            border-radius: 50%;
            width: 38px; height: 38px;
            display: flex; align-items: center; justify-content: center;
            font-size: 13px; font-weight: 700;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          ">${count}</div>`,
          className: "",
          iconSize: [38, 38],
          iconAnchor: [19, 19],
        });
      },
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
    });

    clusterGroupRef.current = clusterGroup;
    map.addLayer(clusterGroup);

    return () => {
      map.removeLayer(clusterGroup);
    };
  }, [map]);

  useEffect(() => {
    const clusterGroup = clusterGroupRef.current;
    if (!clusterGroup) return;

    clusterGroup.clearLayers();

    doctors.forEach((doctor) => {
      const isRelocating = relocatingDoctorId === doctor.id;
      const marker = L.marker([doctor.lat, doctor.lng], {
        icon: isRelocating ? createRelocateIcon() : createDoctorIcon(doctor),
        draggable: isRelocating,
      });

      if (!isRelocating) {
        const popup = L.popup({ closeButton: false, autoPan: false }).setContent(`
          <div style="min-width:150px;font-family:sans-serif;pointer-events:none">
            <p style="font-weight:700;font-size:13px;margin:0 0 2px">${doctor.nombre}</p>
            <p style="color:#6b7280;font-size:11px;margin:0 0 2px">${doctor.especialidad}</p>
            ${doctor.direccion ? `<p style="color:#9ca3af;font-size:11px;margin:0 0 6px">${doctor.direccion}</p>` : "<div style='margin-bottom:6px'></div>"}
            <p style="color:#16a34a;font-size:10px;margin:0;font-weight:600">👆 Tocá para ver info completa</p>
          </div>
        `);
        marker.bindPopup(popup);
        marker.on("mouseover", () => marker.openPopup());
        marker.on("mouseout", () => marker.closePopup());
        marker.on("click", () => { marker.closePopup(); onDoctorClick?.(doctor); });
      }

      if (isRelocating) {
        marker.on("dragend", (e) => {
          const { lat, lng } = e.target.getLatLng();
          onDoctorRelocated?.(doctor.id, lat, lng);
        });
      }

      clusterGroup.addLayer(marker);
    });
  }, [doctors, relocatingDoctorId, onDoctorClick, onDoctorRelocated]);

  return null;
}

const createFarmaciaIcon = (esDeturno: boolean) => L.divIcon({
  html: `<div style="
    width: ${esDeturno ? 44 : 36}px;
    height: ${esDeturno ? 44 : 36}px;
    border-radius: 50%;
    background: ${esDeturno ? "#16a34a" : "#6b7280"};
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3)${esDeturno ? ", 0 0 0 3px #16a34a55" : ""};
    display: flex; align-items: center; justify-content: center;
    ${esDeturno ? "animation: pulse 2s infinite;" : ""}
  ">
    <svg xmlns="http://www.w3.org/2000/svg" width="${esDeturno ? 20 : 16}" height="${esDeturno ? 20 : 16}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 5v14M5 12h14"/>
    </svg>
  </div>`,
  className: "",
  iconSize: [esDeturno ? 44 : 36, esDeturno ? 44 : 36],
  iconAnchor: [esDeturno ? 22 : 18, esDeturno ? 22 : 18],
  popupAnchor: [0, esDeturno ? -22 : -18],
});

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
}: MapComponentProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return (
    <MapContainer
      center={defaultCenter}
      zoom={13}
      style={{ width: "100%", height: "100%", minHeight: "100vh" }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <MapClickHandler onMapClick={onMapClick} />

      {/* Marcadores de doctores con clustering */}
      {showDoctors && (
        <DoctorClusterLayer
          doctors={doctors}
          relocatingDoctorId={relocatingDoctorId}
          onDoctorClick={onDoctorClick}
          onDoctorRelocated={onDoctorRelocated}
        />
      )}

      {/* Marcadores de farmacias */}
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
                  🟢 De turno hoy
                </p>
              )}
              <p style={{ fontWeight: 700, fontSize: "13px", margin: "0 0 2px" }}>{f.nombre}</p>
              <p style={{ color: "#6b7280", fontSize: "11px", margin: "0 0 2px" }}>{f.direccion}</p>
              {f.telefono && (
                <p style={{ color: "#9ca3af", fontSize: "11px", margin: 0 }}>📞 {f.telefono}</p>
              )}
              <p style={{ color: "#9ca3af", fontSize: "10px", margin: "6px 0 0", fontStyle: "italic" }}>
                Tocá para ver más info
              </p>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Marcadores de reportes */}
      {showReports && reports.map((report) => (
        <Marker
          key={report.id}
          position={[report.lat, report.lng]}
          icon={createCustomIcon(report.category)}
        >
          <Popup>
            <div className="text-sm">
              {(() => {
                const photos =
                  report.photos || (report.photo ? [report.photo] : []);
                if (photos.length > 0) {
                  return (
                    <div className="relative mb-2">
                      <img
                        src={photos[0]}
                        alt="Foto"
                        className="w-full h-24 object-cover rounded"
                      />
                      {photos.length > 1 && (
                        <div className="absolute top-1 right-1 bg-black/60 text-white px-2 py-0.5 rounded text-xs">
                          +{photos.length - 1}
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              })()}
              <div className="mb-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-semibold bg-gray-100">
                  {(() => {
                    const Icon = getCategoryIcon(report.category);
                    return <Icon className="w-3 h-3" />;
                  })()}
                  {getCategoryLabel(report.category)}
                </span>
              </div>
              <p className="font-semibold text-base mb-1">
                {report.description}
              </p>
              <div className="text-xs text-gray-600 space-y-1">
                <p className="flex items-center gap-1">
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
                  <strong>Barrio:</strong> {report.barrio}
                </p>
                <p className="flex items-center gap-1">
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
                  <strong>Dirección:</strong> {report.direccion}
                </p>
                <p className="text-gray-500 mt-1">
                  {new Date(report.createdAt).toLocaleString("es-AR")}
                </p>
              </div>

              {/* Botones de emergencia para robos urgentes */}
              {report.category === "robo" && report.isUrgent && (
                <div className="mt-3 p-2 bg-red-50 border border-red-300 rounded">
                  <div className="flex items-center gap-1 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="text-xs font-bold text-red-900">
                      ROBO EN EJECUCIÓN
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => {
                        window.location.href = "tel:911";
                      }}
                      className="w-full px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 flex items-center justify-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      Llamar al 911
                    </button>
                    <button
                      onClick={() => {
                        const formatDate = (date: Date) => {
                          return new Date(date).toLocaleString("es-AR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          });
                        };
                        const message = `🚨 *ALERTA DE ROBO EN EJECUCIÓN*

⚠️ *URGENTE - Reconquista, Santa Fe*

📝 *Descripción:* ${report.description}

📍 *Ubicación:*
• Barrio: ${report.barrio}
• Dirección: ${report.direccion}

🗺️ Ver ubicación exacta: https://www.google.com/maps?q=${report.lat},${report.lng}

📅 *Reportado:* ${formatDate(report.createdAt)}

🌐 *Reporta incidentes en:* https://reportesreconquista.com`;

                        const encodedMessage = encodeURIComponent(message);
                        window.open(
                          `https://wa.me/5493482730030?text=${encodedMessage}`,
                          "_blank",
                        );
                      }}
                      className="w-full px-3 py-1.5 bg-orange-600 text-white rounded text-xs font-semibold hover:bg-orange-700 flex items-center justify-center gap-1"
                    >
                      <Share2 className="w-3 h-3" />
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
                <button
                  onClick={() => {
                    const formatDate = (date: Date) => {
                      return new Date(date).toLocaleString("es-AR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                    };

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
                    window.open(
                      `https://wa.me/5493482519279?text=${encodedMessage}`,
                      "_blank",
                    );
                  }}
                  className="w-full mt-2 px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 flex items-center justify-center gap-1"
                >
                  <Share2 className="w-3 h-3" />
                  Reclamo a Servicios Públicos
                </button>
              )}

              {/* Botón de compartir general */}
              <button
                onClick={() => {
                  const formatDate = (date: Date) => {
                    return new Date(date).toLocaleString("es-AR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                  };
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
                  window.open(
                    `https://wa.me/?text=${encodedMessage}`,
                    "_blank",
                  );
                }}
                className="w-full mt-2 px-3 py-1.5 bg-green-600 text-white rounded text-xs font-semibold hover:bg-green-700 flex items-center justify-center gap-1"
              >
                <Share2 className="w-3 h-3" />
                Compartir
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
