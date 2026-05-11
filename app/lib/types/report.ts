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

export interface Report {
  id: string;
  lat: number;
  lng: number;
  category: ReportCategory;
  description: string;
  barrio: string;
  direccion: string;
  photo?: string;
  photos?: string[];
  createdAt: Date;
  isUrgent?: boolean;
}

export interface CreateReportData {
  lat: number;
  lng: number;
  category: ReportCategory;
  description: string;
  barrio: string;
  direccion: string;
  photo?: File | string;
  photos?: File[];
  fecha?: string;
  isUrgent?: boolean;
}

export interface ReportFilters {
  category?: ReportCategory;
  barrio?: string;
  startDate?: string;
  endDate?: string;
}
