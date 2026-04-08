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
