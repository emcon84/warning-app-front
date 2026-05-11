import { apiFetch, jsonHeader } from "./client";
import type { Farmacia, TurnoResponse } from "../types/pharmacy";

export async function getPharmacies(): Promise<Farmacia[]> {
  return apiFetch<Farmacia[]>("/api/farmacias");
}

export async function getPharmacyOnDuty(): Promise<TurnoResponse> {
  return apiFetch<TurnoResponse>("/api/farmacias/turno");
}

export const getFarmacias = getPharmacies;
export const getFarmaciasTurno = getPharmacyOnDuty;

export async function updatePharmacy(id: string, data: {
  lat?: number;
  lng?: number;
  direccion?: string;
  nombre?: string;
  telefono?: string;
}): Promise<Farmacia> {
  return apiFetch<Farmacia>(`/api/farmacias/${id}`, {
    method: "PUT",
    headers: jsonHeader(),
    body: JSON.stringify(data),
  });
}

export const updateFarmacia = updatePharmacy;
