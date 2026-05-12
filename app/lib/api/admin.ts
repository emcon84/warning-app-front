import { API_URL, apiFetch, authHeader, jsonHeader } from "./client";

export async function adminDeleteProfessional(token: string, id: string): Promise<void> {
  await fetch(`${API_URL}/api/admin/professionals/${id}`, {
    method: "DELETE",
    headers: authHeader(token) as HeadersInit,
  });
}

export async function adminDeleteReport(token: string, id: string): Promise<void> {
  await fetch(`${API_URL}/api/admin/reports/${id}`, {
    method: "DELETE",
    headers: authHeader(token) as HeadersInit,
  });
}

export async function adminDeleteReview(token: string, id: string): Promise<void> {
  await fetch(`${API_URL}/api/admin/reviews/${id}`, {
    method: "DELETE",
    headers: authHeader(token) as HeadersInit,
  });
}

export async function adminDeleteStore(token: string, id: string): Promise<void> {
  await fetch(`${API_URL}/api/admin/comercios/${id}`, {
    method: "DELETE",
    headers: authHeader(token) as HeadersInit,
  });
}

export async function adminTogglePremium(token: string, id: string, isPremium: boolean): Promise<void> {
  await apiFetch<void>(`/api/admin/comercios/${id}`, {
    method: "PATCH",
    headers: { ...authHeader(token), ...jsonHeader() } as HeadersInit,
    body: JSON.stringify({ isPremium }),
  });
}

export async function adminToggleFounder(token: string, id: string, isFounder: boolean): Promise<void> {
  await apiFetch<void>(`/api/admin/comercios/${id}`, {
    method: "PATCH",
    headers: { ...authHeader(token), ...jsonHeader() } as HeadersInit,
    body: JSON.stringify({ isFounder }),
  });
}

export async function adminSetPin(token: string, professionalId: string, pin: string): Promise<void> {
  await apiFetch<void>(`/api/admin/professionals/${professionalId}/pin`, {
    method: "PATCH",
    headers: { ...authHeader(token), ...jsonHeader() } as HeadersInit,
    body: JSON.stringify({ pin }),
  });
}
