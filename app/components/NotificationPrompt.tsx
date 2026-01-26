"use client";

import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { useNotifications } from "../hooks/useNotifications";

export default function NotificationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const { permission, isSupported, requestPermission } = useNotifications();

  useEffect(() => {
    // Mostrar el prompt después de 3 segundos si las notificaciones están soportadas
    // y el usuario no ha dado permiso aún
    if (isSupported && permission === "default") {
      const hasSeenPrompt = localStorage.getItem("notificationPromptSeen");
      if (!hasSeenPrompt) {
        const timer = setTimeout(() => {
          setShowPrompt(true);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [isSupported, permission]);

  const handleAccept = async () => {
    const granted = await requestPermission();
    if (granted) {
      localStorage.setItem("notificationPromptSeen", "true");
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("notificationPromptSeen", "true");
    setShowPrompt(false);
  };

  if (!showPrompt || !isSupported || permission !== "default") {
    return null;
  }

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-slide-up">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4">
        <div className="flex items-start gap-3">
          <div className="shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Bell className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              Recibe notificaciones
            </h3>
            <p className="text-xs text-gray-600 mb-3">
              Mantente informado sobre nuevos reportes en tu área
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleAccept}
                className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors"
              >
                Activar
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-1.5 text-gray-600 hover:text-gray-800 text-xs font-medium transition-colors"
              >
                Ahora no
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
