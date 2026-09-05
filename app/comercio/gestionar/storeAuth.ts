export const STORE_CODE_KEY = "store_panel_code";

// Build auth headers: Clerk token when signed in, X-Store-Code otherwise.
export function buildStoreHeaders(
  code: string | null,
  clerkToken: string | null,
): Record<string, string> {
  if (code) return { "X-Store-Code": code };
  if (clerkToken) return { Authorization: `Bearer ${clerkToken}` };
  return {};
}
