"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Report, ReportCategory } from "../types";
import L from "leaflet";
import {
  getCategoryLabel,
  getCategoryIconSvg,
  getCategoryIcon,
} from "../utils/categoryHelpers";
import { Share2, Phone, AlertTriangle } from "lucide-react";

// Crear iconos personalizados para cada categoría
const createCustomIcon = (category: ReportCategory) => {
  const colors = {
    basura: "#f97316", // orange-500
    alumbrado: "#eab308", // yellow-500
    baches: "#ef4444", // red-500
    pastizales: "#22c55e", // green-500
    robo: "#dc2626", // red-600
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

// Centro en Reconquista, Santa Fe, Argentina
const defaultCenter: [number, number] = [-29.15, -59.65];

interface MapComponentProps {
  onMapClick: (lat: number, lng: number) => void;
  reports: Report[];
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

export default function MapComponent({
  onMapClick,
  reports,
}: MapComponentProps) {
  return (
    <MapContainer
      center={defaultCenter}
      zoom={13}
      style={{ width: "100%", height: "100%", minHeight: "100vh" }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapClickHandler onMapClick={onMapClick} />
      {reports.map((report) => (
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

📅 *Reportado:* ${formatDate(report.createdAt)}`;

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

🗺️ Ver en mapa: https://www.google.com/maps?q=${report.lat},${report.lng}`;

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
