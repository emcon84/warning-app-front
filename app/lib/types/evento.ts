export interface Evento {
  id:          string;
  slug:        string;
  nombre:      string;
  descripcion: string | null;
  lugar:       string;
  direccion:   string | null;
  barrio:      string | null;
  fecha:       string;
  fechaFin:    string | null;
  precio:      string | null;
  categoria:   string;
  banner:      string | null;
  logo:        string | null;
  fotos:       string[];
  activo:      boolean;
  organizador: string;
  createdAt:   string;
  _count:        { comentarios: number };
  likes?:        number;
  tieneSorteo?:        boolean;
  sorteoEjecutado?:    boolean;
  sorteoGanadorNum?:   number | null;
  sorteoGanadorNombre?: string | null;
  sorteoPremio?:       string | null;
  borrador?:           boolean;
  countdownTexto?:     string | null;
}

export interface EventoComentario {
  id:          string;
  autorNombre: string;
  texto:       string;
  createdAt:   string;
}

export const CATEGORIAS_EVENTO = [
  "Música", "Gastronomía", "Deportes", "Teatro", "Arte",
  "Fiesta", "Feria", "Educación", "Solidario", "Otro",
] as const;

export type CategoriaEvento = typeof CATEGORIAS_EVENTO[number];

export const CATEGORIA_EMOJI: Record<string, string> = {
  "Música":      "🎵",
  "Gastronomía": "🍽️",
  "Deportes":    "⚽",
  "Teatro":      "🎭",
  "Arte":        "🎨",
  "Fiesta":      "🎉",
  "Feria":       "🏪",
  "Educación":   "📚",
  "Solidario":   "🤝",
  "Otro":        "📌",
};
