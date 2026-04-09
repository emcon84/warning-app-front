const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const SESSION_KEY = "rr_session_id";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function trackSection(section: string): void {
  const sessionId = getSessionId();
  if (!sessionId) return;
  fetch(`${API_BASE_URL}/api/track`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, section }),
  }).catch(() => {});
}
