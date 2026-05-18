import { apiFetch, authHeader, jsonHeader } from "./client";

export async function getFavorites(token: string): Promise<{ Professional: { slug: string } }[]> {
  return apiFetch<{ Professional: { slug: string } }[]>("/api/favorites", {
    headers: authHeader(token) as HeadersInit,
  });
}

export async function addFavorite(token: string, professionalId: string): Promise<void> {
  await apiFetch<void>("/api/favorites", {
    method: "POST",
    headers: { ...authHeader(token), ...jsonHeader() } as HeadersInit,
    body: JSON.stringify({ professionalId }),
  });
}

export async function removeFavorite(token: string, professionalId: string): Promise<void> {
  await apiFetch<void>(`/api/favorites/${professionalId}`, {
    method: "DELETE",
    headers: authHeader(token) as HeadersInit,
  });
}
