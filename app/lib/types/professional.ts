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
  recommendations?: number;
  descripcion?: string | null;
  whatsapp?: string | null;
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
