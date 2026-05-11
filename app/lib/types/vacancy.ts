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
