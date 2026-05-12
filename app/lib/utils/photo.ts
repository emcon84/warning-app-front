import { API_URL } from "../api/client";

export function resolvePhotoUrl(url: string): string {
  if (!url) return url;
  return url.startsWith("/uploads/") ? `${url}` : url;
}
