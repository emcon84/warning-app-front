"use client";

import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { useNotifications } from "../hooks/useNotifications";
import { useTheme } from "../contexts/ThemeContext";

export default function NotificationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [loading, setLoading] = useState(false);
  const { permission, isSupported, isSubscribed, requestPermission, subscribeToPush } = useNotifications();
  const { isDark } = useTheme();

  useEffect(() => {
    if (!isSupported) return;

    // Mostrar si:
    // 1. Nunca pidió permiso (default) → pedir permiso + suscribir
    // 2. Permiso concedido pero sin suscripción activa → re-suscribir silenciosamente o mostrar prompt
    const shouldShow =
      permission === "default" ||
      (permission === "granted" && !isSubscribed);

    if (!shouldShow) return;

    const hasSeenPrompt = localStorage.getItem("notificationPromptSeen");
    if (hasSeenPrompt) return;

    const timer = setTimeout(() => setShowPrompt(true), 3000);
    return () => clearTimeout(timer);
  }, [isSupported, permission, isSubscribed]);

  const handleAccept = async () => {
    setLoading(true);
    try {
      if (permission === "granted") {
        await subscribeToPush();
      } else {
        await requestPermission();
      }
      localStorage.setItem("notificationPromptSeen", "true");
      setShowPrompt(false);
    } catch {
      // silencioso — el usuario puede ir a configuración
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("notificationPromptSeen", "true");
    setShowPrompt(false);
  };

  if (!showPrompt || !isSupported || permission === "denied") {
    return null;
  }

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-[500]">
      <div className={`rounded-2xl shadow-2xl border p-4 ${isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}>
        <div className="flex items-start gap-3">
          <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isDark ? "bg-indigo-900/40" : "bg-indigo-100"}`}>
            <Bell className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-bold mb-0.5 ${isDark ? "text-white" : "text-gray-900"}`}>
              Activá las alertas
            </p>
            <p className={`text-xs mb-3 leading-snug ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Recibí notificaciones cuando haya reportes, nuevos contactos o mensajes.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleAccept}
                disabled={loading}
                className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {loading ? "Activando..." : "Activar"}
              </button>
              <button
                onClick={handleDismiss}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${isDark ? "text-gray-400 hover:text-white hover:bg-gray-800" : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"}`}
              >
                Ahora no
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className={`shrink-0 transition-colors ${isDark ? "text-gray-600 hover:text-gray-400" : "text-gray-300 hover:text-gray-500"}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
