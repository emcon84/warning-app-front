"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function getClientToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("clientToken");
}

async function sendSubscriptionToServer(sub: PushSubscription, token: string | null) {
  const clientToken = getClientToken();
  const res = await fetch(`${API_URL}/api/push/subscribe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ ...sub.toJSON(), clientToken }),
  });
  if (!res.ok) throw new Error(`Server error: ${res.status}`);
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function useNotifications() {
  const { getToken, isSignedIn } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      return Notification.permission;
    }
    return "default";
  });
  const [isSupported] = useState(() => {
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      "serviceWorker" in navigator
    ) {
      return true;
    }
    return false;
  });
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!isSupported) return;

    // Usamos el SW que registra next-pwa (sw.js), que incluye el push handler
    // compilado desde worker/index.js. No registramos un SW separado.
    navigator.serviceWorker.ready
      .then(async (reg) => {
        setRegistration(reg);

        const sub = await reg.pushManager.getSubscription();
        setIsSubscribed(sub !== null);

        // Re-registrar la suscripción en el servidor.
        // Esto actualiza el endpoint si lo rotó el browser Y asocia el clerkUserId
        // correcto cuando el usuario acaba de loguearse.
        if (sub) {
          const token = await getToken().catch(() => null);
          sendSubscriptionToServer(sub, token).catch(() => {});
        }
      })
      .catch((error) => {
        console.error("Error al obtener Service Worker:", error);
      });
  // isSignedIn como dependencia: cuando el usuario se loguea, re-registra
  // la suscripción con su clerkUserId real (antes podía estar guardada como null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSupported, isSignedIn]);

  const subscribeToPush = async () => {
    try {
      const reg = registration ?? await navigator.serviceWorker.ready;

      // Obtener la clave pública VAPID del servidor
      const keyResponse = await fetch(`${API_URL}/api/push/vapid-public-key`);
      const { publicKey } = await keyResponse.json();
      if (!publicKey) throw new Error("VAPID key no disponible");

      // Cancelar suscripción vieja si existe (puede ser incompatible con el nuevo SW)
      const existing = await reg.pushManager.getSubscription();
      if (existing) {
        await existing.unsubscribe();
      }

      // Nueva suscripción
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      // Enviar la suscripción al servidor (con auth si está logueado)
      const token = await getToken().catch(() => null);
      await sendSubscriptionToServer(subscription, token);
      setIsSubscribed(true);
      return true;
    } catch (error: any) {
      console.error("[push] Error al suscribirse:", error);
      throw error;
    }
  };

  const unsubscribeFromPush = async () => {
    if (!registration) {
      return false;
    }

    try {
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        // Eliminar del servidor
        await fetch(`${API_URL}/api/push/unsubscribe`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });

        // Desuscribirse localmente
        await subscription.unsubscribe();
        setIsSubscribed(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error desuscribiéndose:", error);
      return false;
    }
  };

  const requestPermission = async () => {
    if (!isSupported) {
      console.log("Notificaciones no soportadas");
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      // Si se otorga el permiso, suscribirse automáticamente a push
      if (result === "granted") {
        await subscribeToPush();
      }

      return result === "granted";
    } catch (error) {
      console.error("Error al solicitar permisos:", error);
      return false;
    }
  };

  const showNotification = async (
    title: string,
    options?: NotificationOptions,
  ) => {
    if (permission !== "granted") {
      console.log("Permisos de notificación no otorgados");
      return;
    }

    if (registration) {
      try {
        await registration.showNotification(title, {
          icon: "/icon-192x192.png",
          badge: "/icon-192x192.png",
          ...options,
        });
      } catch (error) {
        console.error("Error al mostrar notificación:", error);
      }
    }
  };

  return {
    permission,
    isSupported,
    isSubscribed,
    requestPermission,
    showNotification,
    subscribeToPush,
    unsubscribeFromPush,
    registration,
  };
}
