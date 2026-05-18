import { apiFetch, jsonHeader } from "./client";
import type { Doctor, TurnoDisponibilidad, DoctorFilters, CreateDoctorData } from "../types/doctor";

export async function getDoctors(filters?: DoctorFilters): Promise<Doctor[]> {
  const params = new URLSearchParams();
  if (filters?.especialidad) params.append("especialidad", filters.especialidad);
  if (filters?.obraSocial) params.append("obraSocial", filters.obraSocial);
  if (filters?.ciudad) params.append("ciudad", filters.ciudad);
  const qs = params.toString();
  return apiFetch<Doctor[]>(`/api/doctors${qs ? `?${qs}` : ""}`);
}

export async function getDoctor(id: string): Promise<Doctor> {
  return apiFetch<Doctor>(`/api/doctors/${id}`);
}

export async function createDoctor(data: CreateDoctorData): Promise<Doctor> {
  return apiFetch<Doctor>("/api/doctors", {
    method: "POST",
    headers: jsonHeader(),
    body: JSON.stringify(data),
  });
}

export async function updateDoctor(id: string, data: Partial<CreateDoctorData>): Promise<Doctor> {
  return apiFetch<Doctor>(`/api/doctors/${id}`, {
    method: "PUT",
    headers: jsonHeader(),
    body: JSON.stringify(data),
  });
}

export async function deleteDoctor(id: string): Promise<void> {
  await apiFetch<void>(`/api/doctors/${id}`, { method: "DELETE" });
}

export async function confirmDoctor(id: string, obraSocial: string, acepta: boolean): Promise<Doctor> {
  return apiFetch<Doctor>(`/api/doctors/${id}/confirmaciones`, {
    method: "POST",
    headers: jsonHeader(),
    body: JSON.stringify({ obraSocial, acepta }),
  });
}

export async function getAvailability(doctorId: string): Promise<TurnoDisponibilidad[]> {
  return apiFetch<TurnoDisponibilidad[]>(`/api/doctors/${doctorId}/disponibilidad`);
}

export async function reportAvailability(doctorId: string, data: {
  dias: string[];
  horario: string;
  tipoTurno: string;
  obraSocial: string;
  nota?: string;
}): Promise<TurnoDisponibilidad> {
  return apiFetch<TurnoDisponibilidad>(`/api/doctors/${doctorId}/disponibilidad`, {
    method: "POST",
    headers: jsonHeader(),
    body: JSON.stringify(data),
  });
}

export const confirmarDoctor = confirmDoctor;
export const getDisponibilidad = getAvailability;
export const reportarDisponibilidad = reportAvailability;
