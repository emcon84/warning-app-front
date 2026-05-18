import { apiFetch, authHeader, jsonHeader } from "./client";
import type { Vacante } from "../types/vacancy";

export async function getVacancies(filters?: { barrio?: string; habilidad?: string }): Promise<Vacante[]> {
  const params = new URLSearchParams();
  if (filters?.barrio) params.append("barrio", filters.barrio);
  if (filters?.habilidad) params.append("habilidad", filters.habilidad);
  const qs = params.toString();
  return apiFetch<Vacante[]>(`/api/vacantes${qs ? `?${qs}` : ""}`);
}

export async function getVacancy(id: string): Promise<Vacante> {
  return apiFetch<Vacante>(`/api/vacantes/${id}`);
}

export async function getMyVacancies(token: string): Promise<Vacante[]> {
  return apiFetch<Vacante[]>("/api/vacantes/mis", {
    headers: authHeader(token),
  });
}

export async function createVacancy(data: {
  titulo: string;
  descripcion: string;
  habilidades: string[];
  barrio?: string;
  horario?: string;
  salario?: string;
  modalidad?: string;
}, token: string): Promise<Vacante> {
  return apiFetch<Vacante>("/api/vacantes", {
    method: "POST",
    headers: { ...authHeader(token), ...jsonHeader() },
    body: JSON.stringify(data),
  });
}

export async function updateVacancy(id: string, data: Partial<{
  titulo: string;
  descripcion: string;
  habilidades: string[];
  barrio: string;
  horario: string;
  salario: string;
  modalidad: string;
  activa: boolean;
}>, token: string): Promise<Vacante> {
  return apiFetch<Vacante>(`/api/vacantes/${id}`, {
    method: "PUT",
    headers: { ...authHeader(token), ...jsonHeader() },
    body: JSON.stringify(data),
  });
}

export async function deleteVacancy(id: string, token: string): Promise<void> {
  await apiFetch<void>(`/api/vacantes/${id}`, {
    method: "DELETE",
    headers: authHeader(token),
  });
}

export async function applyToVacancy(id: string, data: {
  clientToken: string;
  clientName?: string;
  mensaje: string;
}): Promise<unknown> {
  return apiFetch<unknown>(`/api/vacantes/${id}/conversaciones`, {
    method: "POST",
    headers: jsonHeader(),
    body: JSON.stringify(data),
  });
}
