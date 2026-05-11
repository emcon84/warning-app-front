import { apiFetch } from "./client";

export async function getStats(): Promise<unknown> {
  return apiFetch<unknown>("/api/stats");
}
