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
