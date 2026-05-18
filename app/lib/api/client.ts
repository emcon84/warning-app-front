export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const BASE_URL = API_URL;

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export function authHeader(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

export function jsonHeader(): Record<string, string> {
  return { "Content-Type": "application/json" };
}
