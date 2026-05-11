const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export function resolvePhotoUrl(url: string): string {
  if (!url) return url;
  return url.startsWith("/uploads/") ? `${API}${url}` : url;
}
