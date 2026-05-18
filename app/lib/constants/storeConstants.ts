export const RUBROS = [
  "Almacén/Despensa", "Restaurante/Comida", "Indumentaria", "Calzado",
  "Electrónica", "Tecnología/Informática", "Ferretería", "Materiales/Construcción",
  "Farmacia", "Salud/Bienestar", "Peluquería/Estética",
  "Librería/Papelería", "Veterinaria", "Deportes", "Mueblería",
  "Joyería/Relojería", "Automotriz/Mecánica", "Inmobiliaria",
  "Seguros/Finanzas", "Educación/Clases", "Fotografía/Arte",
  "Contaduría/Administración", "Agro/Cerealista", "Otro",
];

export const BARRIOS = [
  "Reconquista (toda la ciudad)",
  "Centro", "Barrio Norte", "Barrio Sur", "Barrio Oeste", "Villa del Parque",
  "Las Lomas", "Parque Industrial", "Barrio Newbery", "Villa Ocampo",
  "Los Lapachos", "San Cayetano", "Otro",
];

export type Tab = "datos" | "fotos" | "ofertas" | "productos" | "kit" | "stats" | "comunidad";

export interface AnalyticsData {
  thisMonth: Record<string, number>;
  lastMonth: Record<string, number>;
  last30: Record<string, number>;
  dailyLast30: Record<string, Record<string, number>>;
}

export interface PlanInfo {
  plan: string;
  planName: string;
  limits: { dailyAi: number; totalProducts: number | "ilimitado" };
  usage: { productos: number; aiHoy: number; aiGlobalHoy: number };
  canUpgrade: boolean;
  upgradeUrl: string | null;
}
