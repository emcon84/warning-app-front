import { apiFetch } from "./client";

export async function getStats(): Promise<Record<string, unknown>> {
  return apiFetch<Record<string, unknown>>("/api/stats");
}
