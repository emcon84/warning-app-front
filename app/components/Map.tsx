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
import { getCategoryLabel } from "../utils/categoryHelpers";

// Crear iconos personalizados para cada categoría
const createCustomIcon = (category: ReportCategory) => {
  const icons = {
    basura: "🗑️",
    alumbrado: "💡",
    baches: "🚧",
    pastizales: "🌿",
  };

  const colors = {
    basura: "#f97316", // orange-500
    alumbrado: "#eab308", // yellow-500
    baches: "#ef4444", // red-500
    pastizales: "#22c55e", // green-500
  };

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
        <span style="
          transform: rotate(45deg);
          font-size: 20px;
        ">${icons[category]}</span>
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
              {report.photo && (
                <img
                  src={report.photo}
                  alt="Foto"
                  className="w-full h-24 object-cover rounded mb-2"
                />
              )}
              <div className="mb-2">
                <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-gray-100">
                  {getCategoryLabel(report.category)}
                </span>
              </div>
              <p className="font-semibold text-base mb-1">
                {report.description}
              </p>
              <div className="text-xs text-gray-600 space-y-1">
                <p>
                  <strong>📍 Barrio:</strong> {report.barrio}
                </p>
                <p>
                  <strong>🏠 Dirección:</strong> {report.direccion}
                </p>
                <p className="text-gray-500 mt-1">
                  {new Date(report.createdAt).toLocaleString("es-AR")}
                </p>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
