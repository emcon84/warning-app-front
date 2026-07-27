export interface Professional {
  id: string;
  nombre: string;
  apellido: string;
  slug: string;
  oficios: string[];
  barrio: string;
  foto?: string | null;
  activo: boolean;
  ratingAvg: number;
  ratingCount: number;
  createdAt: string;
}

export interface Report {
  id: string;
  category: string;
  description: string;
  barrio: string;
  direccion: string;
  isUrgent: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  reviewerName: string;
  score: number;
  comment: string;
  createdAt: string;
  professional: { nombre: string; apellido: string; slug: string };
}

export interface Comercio {
  id: string;
  nombre: string;
  rubro: string;
  slug: string;
  barrio: string;
  foto?: string | null;
  logo?: string | null;
  activo: boolean;
  isPremium: boolean;
  isFounder: boolean;
  plan?: string;
  createdAt: string;
}

export type Tab = "professionals" | "reports" | "reviews" | "comercios" | "outreach" | "slides";
export type ShareFormat = "story" | "feed";

export interface ShareTarget {
  type: "comercio" | "profesional";
  shareUrl: string;
  profileUrl: string;
  label: string;
}

export interface HeroSlideItem {
  id: string;
  slideType: "professional" | "comercio" | "promo";
  refId: string | null;
  title: string;
  subtitle: string | null;
  ctaText: string | null;
  ctaUrl: string | null;
  imageUrl: string | null;
  imagePosition: string;
  isPinned: boolean;
  sortOrder: number;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
}
