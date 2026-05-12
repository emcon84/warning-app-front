import { API_URL, apiFetch, authHeader, jsonHeader } from "./client";

export async function createConversation(token: string, professionalId: string, message: string): Promise<{ id: string }> {
  return apiFetch<{ id: string }>("/api/conversations", {
    method: "POST",
    headers: { ...authHeader(token), ...jsonHeader() } as HeadersInit,
    body: JSON.stringify({ professionalId, message }),
  });
}

export async function deleteConversation(token: string, conversationId: string, params?: string): Promise<void> {
  const url = `${API_URL}/api/conversations/${conversationId}${params ? params : ""}`;
  await fetch(url, {
    method: "DELETE",
    headers: authHeader(token) as HeadersInit,
  });
}
