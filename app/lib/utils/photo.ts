import { API_URL } from "../api/client";

export function resolvePhotoUrl(url?: string | null): string {
  if (!url) return "";
  return url.startsWith("/uploads/") ? `${url}` : url;
}
