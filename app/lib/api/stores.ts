import { apiFetch, authHeader } from "./client";
import type { ComercioPost } from "../types/store";

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
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  fetch(`${BASE_URL}/api/comercios/${slug}/track`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type }),
  }).catch(() => {});
}
