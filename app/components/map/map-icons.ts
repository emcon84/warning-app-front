import L from "leaflet";
import type { Doctor } from "../../types";
import { getCategoryIconSvg } from "../../utils/categoryHelpers";
import { getDoctorIconSvg } from "../../utils/doctorHelpers";

export type ReportCategory =
  | "basura" | "alumbrado" | "baches" | "pastizales" | "robo"
  | "personas_sospechosas" | "fugas_agua" | "drenaje" | "banquetas"
  | "semaforos" | "limpieza" | "graffiti" | "escombros" | "arboles"
  | "vandalismo" | "vehiculos_abandonados" | "iluminacion"
  | "animales_callejeros" | "plagas" | "senalizacion"
  | "estacionamiento" | "transporte" | "voz";

export const DEFAULT_CENTER: [number, number] = [-29.15, -59.65];

const STADIA_KEY = "d6bd2b17-af70-48aa-a66a-307000a65550";

export const TILE_LAYERS = {
  light: {
    url: `https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png?api_key=${STADIA_KEY}`,
    attribution:
      '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  dark: {
    url: `https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=${STADIA_KEY}`,
    attribution:
      '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
} as const;

const CATEGORY_COLORS: Record<ReportCategory, string> = {
  basura: "#f97316",
  alumbrado: "#eab308",
  baches: "#ef4444",
  pastizales: "#22c55e",
  robo: "#dc2626",
  personas_sospechosas: "#dc2626",
  fugas_agua: "#3b82f6",
  drenaje: "#06b6d4",
  banquetas: "#78716c",
  semaforos: "#f59e0b",
  limpieza: "#0ea5e9",
  graffiti: "#ec4899",
  escombros: "#6b7280",
  arboles: "#10b981",
  vandalismo: "#f43f5e",
  vehiculos_abandonados: "#64748b",
  iluminacion: "#fbbf24",
  animales_callejeros: "#fb923c",
  plagas: "#dc2626",
  senalizacion: "#6366f1",
  estacionamiento: "#8b5cf6",
  transporte: "#3b82f6",
  voz: "#a855f7",
};

export function createCustomIcon(category: ReportCategory): L.DivIcon {
  const color = CATEGORY_COLORS[category] ?? "#6b7280";
  const iconSvg = getCategoryIconSvg(category as any);
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 40px; height: 40px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 3px 10px rgba(0,0,0,0.3);
        display: flex; align-items: center; justify-content: center;
      ">
        <div style="transform: rotate(45deg); color: white; display: flex; align-items: center; justify-content: center;">
          ${iconSvg}
        </div>
      </div>
    `,
    className: "custom-marker",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
}

export function createDoctorIcon(doctor: Doctor): L.DivIcon {
  return L.divIcon({
    html: getDoctorIconSvg(doctor),
    className: "",
    iconSize: [38, 44],
    iconAnchor: [19, 44],
    popupAnchor: [0, -44],
  });
}

export function createRelocateIcon(): L.DivIcon {
  return L.divIcon({
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
}

export function createFarmaciaIcon(esDeturno: boolean): L.DivIcon {
  const size = esDeturno ? 44 : 36;
  const half = size / 2;
  return L.divIcon({
    html: `<div style="
      width: ${size}px; height: ${size}px; border-radius: 50%;
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
    iconSize: [size, size],
    iconAnchor: [half, half],
    popupAnchor: [0, -half],
  });
}
