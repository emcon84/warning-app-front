import { apiFetch, authHeader } from "./client";
import type { Empleado } from "../types/employee";

export async function getEmployees(filters?: { barrio?: string; habilidad?: string }): Promise<Empleado[]> {
  const params = new URLSearchParams();
  if (filters?.barrio) params.append("barrio", filters.barrio);
  if (filters?.habilidad) params.append("habilidad", filters.habilidad);
  const qs = params.toString();
  return apiFetch<Empleado[]>(`/api/empleados${qs ? `?${qs}` : ""}`);
}

export async function getEmployee(slug: string): Promise<Empleado> {
  return apiFetch<Empleado>(`/api/empleados/${slug}`);
}

export async function getMyEmployee(token: string): Promise<Empleado> {
  return apiFetch<Empleado>("/api/empleados/me", {
    headers: authHeader(token),
  });
}

export async function createEmployee(data: FormData, token: string): Promise<Empleado> {
  return apiFetch<Empleado>("/api/empleados", {
    method: "POST",
    headers: authHeader(token),
    body: data,
  });
}

export async function updateEmployee(data: FormData, token: string): Promise<Empleado> {
  return apiFetch<Empleado>("/api/empleados/me", {
    method: "PUT",
    headers: authHeader(token),
    body: data,
  });
}

export async function startEmployeeConversation(slug: string, data: {
  clientToken: string;
  clientName?: string;
  mensaje: string;
}): Promise<unknown> {
  return apiFetch<unknown>(`/api/empleados/${slug}/conversaciones`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}
