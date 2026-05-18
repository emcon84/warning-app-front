import { API_URL, apiFetch, authHeader } from "./client";
import type { ComercioPost, Comercio } from "../types/store";

export interface StoreReview {
  id: string;
  score: number;
  createdAt: string;
}

export interface StorePosts {
  posts: ComercioPost[];
  total: number;
  page: number;
  pages: number;
}

export async function getStoreReviews(slug: string): Promise<StoreReview[]> {
  return apiFetch<StoreReview[]>(`/api/comercios/${slug}/reviews`);
}

export async function getStorePosts(slug: string, limit = 10): Promise<StorePosts> {
  return apiFetch<StorePosts>(`/api/comercios/${slug}/posts?limit=${limit}`);
}

export async function recommendStore(slug: string): Promise<{ ok: boolean; already?: boolean; count: number }> {
  return apiFetch(`/api/comercios/${slug}/recommend`, { method: "POST" });
}

export async function submitStoreReview(slug: string, score: number, token: string): Promise<StoreReview> {
  return apiFetch<StoreReview>(`/api/comercios/${slug}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader(token) },
    body: JSON.stringify({ score }),
  });
}

export function trackStoreEvent(slug: string, type: string): void {
  fetch(`${API_URL}/api/comercios/${slug}/track`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type }),
  }).catch(() => {});
}

async function formFetch<T>(url: string, token: string, method: string, body: FormData | string, contentType?: string): Promise<T> {
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  if (contentType) headers["Content-Type"] = contentType;
  const res = await fetch(url, { method, headers, body });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error((d as { error?: string }).error ?? `${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function createStore(token: string, formData: FormData): Promise<Comercio> {
  return formFetch<Comercio>(`${API_URL}/api/comercios`, token, "POST", formData);
}

export async function updateStore(token: string, formData: FormData): Promise<Comercio> {
  return formFetch<Comercio>(`${API_URL}/api/comercios/me`, token, "PUT", formData);
}

export async function deleteStorePhoto(token: string, url: string): Promise<void> {
  await fetch(`${API_URL}/api/comercios/me/fotos`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
}

export async function createStorePost(slug: string, token: string, formData: FormData): Promise<ComercioPost> {
  return formFetch<ComercioPost>(`${API_URL}/api/comercios/${slug}/posts`, token, "POST", formData);
}

export async function deleteStorePost(slug: string, token: string, postId: string): Promise<void> {
  await fetch(`${API_URL}/api/comercios/${slug}/posts/${postId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createStoreProduct(token: string, formData: FormData): Promise<unknown> {
  return formFetch<unknown>(`${API_URL}/api/comercios/me/products`, token, "POST", formData);
}

export async function updateStoreProduct(token: string, id: string, formData: FormData): Promise<unknown> {
  return formFetch<unknown>(`${API_URL}/api/comercios/me/products/${id}`, token, "PUT", formData);
}

export async function deleteStoreProduct(token: string, id: string): Promise<void> {
  await fetch(`${API_URL}/api/comercios/me/products/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createStoreOffer(token: string, formData: FormData): Promise<unknown> {
  return formFetch<unknown>(`${API_URL}/api/comercios/me/offers`, token, "POST", formData);
}

export async function updateStoreOffer(token: string, id: string, formData: FormData): Promise<unknown> {
  return formFetch<unknown>(`${API_URL}/api/comercios/me/offers/${id}`, token, "PATCH", formData);
}

export async function deleteStoreOffer(token: string, id: string): Promise<void> {
  await fetch(`${API_URL}/api/comercios/me/offers/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function uploadStoreProductPhoto(token: string, productId: string, formData: FormData): Promise<unknown> {
  return formFetch<unknown>(`${API_URL}/api/comercios/me/products/${productId}/photos`, token, "POST", formData);
}
