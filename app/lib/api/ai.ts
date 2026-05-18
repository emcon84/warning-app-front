import { API_URL } from "./client";

export async function generateDescription(
  token: string | null,
  data: Record<string, string | string[] | undefined>,
): Promise<{ descripcion: string }> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_URL}/api/ai/generate-description`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error((d as { error?: string }).error ?? "Error generando descripcion");
  }
  return res.json() as Promise<{ descripcion: string }>;
}
