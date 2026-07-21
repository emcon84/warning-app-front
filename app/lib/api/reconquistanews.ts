import { apiFetch } from "./client";
import type { NewsArticle } from "../types/reconquistanews";

export async function getNews(portal?: string): Promise<NewsArticle[]> {
  const params = portal ? `?portal=${portal}` : "";
  return apiFetch<NewsArticle[]>(`/api/news${params}`);
}
