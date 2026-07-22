export interface Farmacia {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string | null;
  googleMapsUrl?: string;
  lat: number;
  lng: number;
  activo: boolean;
  createdAt: string;
  esDeturno?: boolean;
}

export interface TurnoResponse {
  fecha: string;
  farmacias: Farmacia[];
  raw: string[];
}
