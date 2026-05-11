import { apiFetch } from "./client";
import type { Professional } from "../types/professional";

export interface ProfessionalFilters {
  oficio?: string;
  barrio?: string;
  tipo?: string;
}

export async function getProfessionals(filters?: ProfessionalFilters): Promise<Professional[]> {
  const params = new URLSearchParams();
  if (filters?.oficio) params.append("oficio", filters.oficio);
  if (filters?.barrio) params.append("barrio", filters.barrio);
  if (filters?.tipo) params.append("tipo", filters.tipo);
  const qs = params.toString();
  return apiFetch<Professional[]>(`/api/professionals${qs ? `?${qs}` : ""}`);
}

export async function getProfessional(slug: string): Promise<Professional> {
  return apiFetch<Professional>(`/api/professionals/${slug}`);
}
