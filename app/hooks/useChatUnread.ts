"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const POLL_MS = 30_000;

export function useChatUnread() {
  const { isLoaded, isSignedIn, getToken, userId } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isLoaded) return;

    async function fetchCount() {
      let total = 0;

      try {
        if (isSignedIn) {
          const token = await getToken();

          // Mensajes no leídos como profesional (clientes que escribieron)
          if (token) {
            const res = await fetch(`${API}/api/conversations/unread-count`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
              const data = await res.json();
              total += data.count ?? 0;
            }
          }

          // Mensajes no leídos como cliente (profesionales que respondieron)
          if (userId) {
            const res = await fetch(`${API}/api/conversations/client/${userId}`);
            if (res.ok) {
              const convs: { Message?: { senderType: string; read: boolean }[] }[] = await res.json();
              for (const conv of convs) {
                total += (conv.Message ?? []).filter(
                  (m) => m.senderType === "professional" && !m.read
                ).length;
              }
            }
          }
        } else {
          // Usuario anónimo
          const clientToken = typeof window !== "undefined" ? localStorage.getItem("clientToken") : null;
          if (clientToken) {
            const res = await fetch(`${API}/api/conversations/client/${clientToken}`);
            if (res.ok) {
              const convs: { Message?: { senderType: string; read: boolean }[] }[] = await res.json();
              for (const conv of convs) {
                total += (conv.Message ?? []).filter(
                  (m) => m.senderType === "professional" && !m.read
                ).length;
              }
            }
          }
        }
      } catch {
        // silencioso — no romper la UI si falla el poll
      }

      setCount(total);
    }

    fetchCount();
    const interval = setInterval(fetchCount, POLL_MS);

    // Re-fetch inmediato cuando el usuario vuelve a la pestaña/app
    const onVisible = () => { if (!document.hidden) fetchCount(); };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [isLoaded, isSignedIn, userId]);

  return count;
}
