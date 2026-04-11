"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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
  const { getToken } = useAuth();
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
    // Registrar el service worker
    if (isSupported) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("Service Worker registrado:", reg);
          setRegistration(reg);

          // Verificar si ya está suscrito
          reg.pushManager.getSubscription().then((sub) => {
            setIsSubscribed(sub !== null);
          });
        })
        .catch((error) => {
          console.error("Error al registrar Service Worker:", error);
        });
    }
  }, [isSupported]);

  const subscribeToPush = async () => {
    if (!registration) {
      console.error("Service Worker no registrado");
      return false;
    }

    try {
      // Obtener la clave pública VAPID del servidor
      const keyResponse = await fetch(`${API_URL}/api/push/vapid-public-key`);
      const { publicKey } = await keyResponse.json();

      // Suscribirse a push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      // Enviar la suscripción al servidor (con auth si está logueado)
      const token = await getToken().catch(() => null);
      const response = await fetch(`${API_URL}/api/push/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(subscription.toJSON()),
      });

      if (response.ok) {
        console.log("Suscripción guardada en el servidor");
        setIsSubscribed(true);
        return true;
      } else {
        console.error("Error guardando suscripción");
        return false;
      }
    } catch (error) {
      console.error("Error suscribiéndose a push:", error);
      return false;
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
