"use client";

import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

interface Props {
  permission: NotificationPermission;
  isSupported: boolean;
  requestPermission: () => Promise<boolean>;
  createdId: string;
  onFinish: () => void;
  onGoPanel: () => void;
  isDark: boolean;
}

export function StepNotificaciones({
  permission,
  isSupported,
  requestPermission,
  createdId,
  onFinish,
  onGoPanel,
}: Props) {
  const { isDark } = useTheme();
  const textPri = isDark ? "text-white" : "text-gray-900";
  const textSec = isDark ? "text-gray-400" : "text-gray-500";

  const [activating, setActivating] = useState(false);
  const [status, setStatus] = useState<"idle" | "denied" | "error">("idle");

  useEffect(() => {
    if (permission === "granted") {
      const t = setTimeout(onFinish, 1200);
      return () => clearTimeout(t);
    }
  }, [permission, onFinish]);

  async function handleActivar() {
    setActivating(true);
    setStatus("idle");
    try {
      const success = await requestPermission();
      if (!success) {
        setStatus("denied");
        setTimeout(onFinish, 2000);
      }
    } catch (error) {
      console.error("Error al activar notificaciones:", error);
      setStatus("error");
      setTimeout(onFinish, 2000);
    } finally {
      setActivating(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {permission === "granted" ? (
        <div className="flex flex-col items-center justify-center py-12 gap-6">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center"
          >
            <Check className="w-12 h-12 text-green-400" />
          </motion.div>
          <p className={`font-bold text-xl ${textPri}`}>Notificaciones activadas</p>
          <p className={`text-sm text-center ${textSec}`}>
            Te vamos a avisar cuando un cliente te contacte.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {!isSupported && (
            <p className={`text-xs text-center ${textSec}`}>
              Tu navegador no soporta notificaciones push. Podrás activarlas después desde tu perfil.
            </p>
          )}

          {status === "denied" && (
            <div className="text-center p-4 rounded-2xl bg-yellow-900/30 border border-yellow-800">
              <p className="text-sm text-yellow-400">
                Las notificaciones fueron denegadas. Podrás activarlas luego desde tu perfil.
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="text-center p-4 rounded-2xl bg-red-900/30 border border-red-800">
              <p className="text-sm text-red-400">
                Hubo un error al activar las notificaciones. Podrás intentarlo luego desde tu perfil.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {isSupported && (
              <motion.button
                onClick={handleActivar}
                disabled={activating}
                whileTap={{ scale: 0.97 }}
                className="w-full py-4 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-base transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {activating ? "Activando..." : "Activar notificaciones"}
              </motion.button>
            )}
            <button
              onClick={onFinish}
              className={`w-full py-2 text-sm ${textSec} transition-colors`}
            >
              Ahora no
            </button>
          </div>
        </div>
      )}

      {createdId && (
        <div className={`rounded-2xl border p-4 ${isDark ? "bg-blue-950/40 border-blue-800/50" : "bg-blue-50 border-blue-200"}`}>
          <p className={`text-sm font-semibold mb-1 ${isDark ? "text-blue-300" : "text-blue-700"}`}>
            Tu perfil ya esta publicado
          </p>
          <p className={`text-xs mb-3 ${isDark ? "text-blue-400/70" : "text-blue-600/70"}`}>
            Desde el panel podes subir fotos de tus trabajos, actualizar tu info y activar o pausar tu disponibilidad.
            Para entrar usas tu WhatsApp + el PIN que elegiste.
          </p>
          <button
            onClick={onGoPanel}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
          >
            Ir a mi panel
          </button>
        </div>
      )}
    </div>
  );
}
