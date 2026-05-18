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
  stock?: number | null;
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
  isFounder?: boolean;
  recommendations?: number;
  ratingAvg?: number;
  ratingCount?: number;
  aceptaEnvios?: boolean;
  zonaEnvio?: string | null;
  costoEnvio?: string | null;
  createdAt: string;
  offers?: ComercioOffer[];
  productos?: Producto[];
  _count?: { subscripciones: number };
}

export type PostTipo = "novedad" | "oferta" | "sorteo";

export interface ComercioPost {
  id: string;
  comercioId: string;
  tipo: PostTipo;
  contenido: string;
  foto?: string | null;
  precioAntes?: string | null;
  precioDespues?: string | null;
  fechaSorteo?: string | null;
  likes?: number;
  activo: boolean;
  createdAt: string;
  comercio?: {
    id: string;
    nombre: string;
    slug: string;
    foto?: string | null;
    logo?: string | null;
    rubro: string;
    whatsapp?: string;
  };
}
