import { API_URL, apiFetch, authHeader, jsonHeader } from "./client";
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

export async function createProfessional(token: string | null, data: Record<string, unknown>): Promise<Professional> {
  const headers: Record<string, string> = { ...jsonHeader() };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return apiFetch<Professional>("/api/professionals", {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
}

export async function recommendProfessional(slug: string): Promise<{ count: number }> {
  return apiFetch<{ count: number }>(`/api/professionals/${slug}/recommend`, { method: "POST" });
}

export async function submitProfessionalReview(
  slug: string,
  token: string | null,
  score: number,
  clientToken?: string,
): Promise<unknown> {
  const headers: Record<string, string> = { ...jsonHeader() };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return apiFetch<unknown>(`/api/professionals/${slug}/reviews`, {
    method: "POST",
    headers,
    body: JSON.stringify({ score, clientToken }),
  });
}

export async function reportProfessionalReview(
  slug: string,
  token: string | null,
  reviewId: string,
): Promise<void> {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  await fetch(`${API_URL}/api/professionals/${slug}/reviews/${reviewId}/report`, {
    method: "POST",
    headers,
  });
}
