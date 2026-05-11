export interface Doctor {
  id: string;
  nombre: string;
  especialidad: string;
  direccion: string;
  barrio: string;
  ciudad: string;
  telefono: string | null;
  whatsapp: string | null;
  lat: number;
  lng: number;
  obrasSociales: string[];
  iapos: boolean;
  activo: boolean;
  confirmaciones?: Confirmacion[];
  createdAt: string;
  updatedAt: string;
}

export interface Confirmacion {
  id: string;
  doctorId: string;
  obraSocial: string;
  acepta: boolean;
  createdAt: string;
}

export interface TurnoDisponibilidad {
  id: string;
  doctorId: string;
  dias: string[];
  horario: string;
  tipoTurno: string;
  obraSocial: string;
  nota: string | null;
  createdAt: string;
  expiresAt: string;
}

export interface DoctorFilters {
  especialidad?: string;
  obraSocial?: string;
  ciudad?: string;
}

export interface CreateDoctorData {
  nombre: string;
  especialidad: string;
  direccion: string;
  barrio?: string;
  ciudad?: string;
  telefono?: string;
  whatsapp?: string;
  lat: number;
  lng: number;
  obrasSociales?: string[];
}
