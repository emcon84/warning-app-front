export type ReportCategory =
  | "basura"
  | "alumbrado"
  | "baches"
  | "pastizales"
  | "robo"
  | "personas_sospechosas"
  | "fugas_agua"
  | "drenaje"
  | "banquetas"
  | "semaforos"
  | "limpieza"
  | "graffiti"
  | "escombros"
  | "arboles"
  | "vandalismo"
  | "vehiculos_abandonados"
  | "iluminacion"
  | "animales_callejeros"
  | "plagas"
  | "senalizacion"
  | "estacionamiento"
  | "transporte"
  | "voz";

export interface Doctor {
  id: string
  nombre: string
  especialidad: string
  direccion: string
  barrio: string
  ciudad: string
  telefono: string | null
  whatsapp: string | null
  lat: number
  lng: number
  obrasSociales: string[]
  iapos: boolean
  activo: boolean
  confirmaciones?: Confirmacion[]
  createdAt: string
  updatedAt: string
}

export interface Confirmacion {
  id: string
  doctorId: string
  obraSocial: string
  acepta: boolean
  createdAt: string
}

export interface TurnoDisponibilidad {
  id: string
  doctorId: string
  dias: string[]
  horario: string
  tipoTurno: string
  obraSocial: string
  nota: string | null
  createdAt: string
  expiresAt: string
}

export interface Farmacia {
  id: string
  nombre: string
  direccion: string
  telefono: string | null
  lat: number
  lng: number
  activo: boolean
  createdAt: string
  esDeturno?: boolean
}

export interface TurnoResponse {
  fecha: string
  farmacias: Farmacia[]
  raw: string[]
}

export interface Report {
  id: string;
  lat: number;
  lng: number;
  category: ReportCategory;
  description: string;
  barrio: string;
  direccion: string;
  photo?: string;
  photos?: string[]; // Múltiples fotos
  createdAt: Date;
  isUrgent?: boolean;
}

export interface Supermarket {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  logo?: string;
  createdAt: string;
  offerCount?: number;
}

export interface Offer {
  id: string;
  supermarketId: string;
  description: string;
  price?: string;
  photo?: string;
  validUntil?: string;
  createdAt: string;
}

// ─── Profesionales de Oficio ─────────────────────────────────────────────────
export type ProfessionalType = "profesion" | "oficio";

export interface Professional {
  id: string;
  nombre: string;
  apellido: string;
  slug: string;
  tipo?: ProfessionalType | null;
  oficios: string[];
  barrio: string;
  foto?: string | null;
  fotos?: string[];
  disponible: boolean;
  ratingAvg: number;
  ratingCount: number;
  descripcion?: string | null;
}

export interface ProfessionalRating {
  scoreByClient: number;
  commentByClient?: string | null;
  createdAt: string;
}

export interface ProfessionalDetail extends Professional {
  ratings: ProfessionalRating[];
}

export interface PublicReview {
  id: string;
  professionalId: string;
  reviewerName: string;
  score: number;
  comment: string;
  createdAt: string;
}

// ─── Empleados / CV ──────────────────────────────────────────────────────────

export interface Empleado {
  id: string;
  nombre: string;
  apellido: string;
  slug: string;
  habilidades: string[];
  barrio?: string | null;
  whatsapp?: string | null;
  foto?: string | null;
  descripcion?: string | null;
  disponible: boolean;
  activo: boolean;
  createdAt: string;
}

// ─── Vacantes ────────────────────────────────────────────────────────────────

export interface Vacante {
  id: string;
  comercioId: string;
  titulo: string;
  descripcion: string;
  habilidades: string[];
  barrio?: string | null;
  horario?: string | null;
  salario?: string | null;
  modalidad?: string | null;
  activa: boolean;
  createdAt: string;
  comercio: {
    nombre: string;
    slug: string;
    foto?: string | null;
    rubro: string;
    barrio?: string;
    whatsapp?: string;
  };
}

// ─── Comercios ───────────────────────────────────────────────────────────────

export interface ComercioOffer {
  id: string;
  comercioId: string;
  titulo: string;
  descripcion?: string | null;
  terminos?: string | null;
  precio?: string | null;
  foto?: string | null;
  validaHasta?: string | null;
  activa: boolean;
  createdAt: string;
}

export interface Producto {
  id: string;
  comercioId: string;
  nombre: string;
  tipo: "producto" | "servicio";
  descripcion?: string | null;
  precio?: string | null;
  foto?: string | null;
  activo: boolean;
  createdAt: string;
}

export interface Comercio {
  id: string;
  nombre: string;
  slug: string;
  rubro: string;
  barrio: string;
  direccion?: string | null;
  horario?: string | null;
  whatsapp: string;
  telefono?: string | null;
  descripcion?: string | null;
  foto?: string | null;
  logo?: string | null;
  fotos?: string[];
  activo: boolean;
  isPremium?: boolean;
  createdAt: string;
  offers?: ComercioOffer[];
  productos?: Producto[];
}
