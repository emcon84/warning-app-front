"use client";

import { useEffect, useState } from "react";

export function useNotifications() {
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

  useEffect(() => {
    // Registrar el service worker
    if (isSupported) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("Service Worker registrado:", reg);
          setRegistration(reg);
        })
        .catch((error) => {
          console.error("Error al registrar Service Worker:", error);
        });
    }
  }, [isSupported]);

  const requestPermission = async () => {
    if (!isSupported) {
      console.log("Notificaciones no soportadas");
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
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
    requestPermission,
    showNotification,
    registration,
  };
}
