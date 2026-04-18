"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, BellOff, CheckCircle, XCircle, AlertCircle, ChevronLeft, RefreshCw } from "lucide-react";
import { useNotifications } from "../hooks/useNotifications";
import Navbar from "../components/Navbar";
import { useTheme } from "../contexts/ThemeContext";

export default function SettingsPage() {
  const router = useRouter();
  const { permission, isSupported, isSubscribed, requestPermission, subscribeToPush, unsubscribeFromPush } = useNotifications();

  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [swVersion, setSwVersion] = useState<string | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        setSwVersion(reg ? "activo" : "no registrado");
      });
    }
  }, []);

  function showFeedback(type: "ok" | "err", msg: string) {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 4000);
  }

  async function handleEnable() {
    if (!isSupported) return;
    setLoading(true);
    try {
      if (permission === "granted") {
        await subscribeToPush();
        showFeedback("ok", "Notificaciones activadas");
      } else if (permission === "default") {
        localStorage.removeItem("notificationPromptSeen");
        const ok = await requestPermission();
        showFeedback(ok ? "ok" : "err", ok ? "Notificaciones activadas" : "Permiso denegado");
      } else {
        showFeedback("err", "El permiso está bloqueado. Habilitalo desde la configuración del browser.");
      }
    } catch (err: any) {
      const msg = err?.message || err?.toString() || "Error desconocido";
      showFeedback("err", `Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleDisable() {
    setLoading(true);
    try {
      const ok = await unsubscribeFromPush();
      showFeedback(ok ? "ok" : "err", ok ? "Notificaciones desactivadas" : "No estabas suscripto");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetSW() {
    setLoading(true);
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister()));
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
      localStorage.removeItem("notificationPromptSeen");
      showFeedback("ok", "Service Worker y cache reseteados. Recargá la página.");
    } catch {
      showFeedback("err", "Error al resetear");
    } finally {
      setLoading(false);
    }
  }

  // Theme
  const bg         = isDark ? "bg-gray-950" : "bg-gray-50";
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textSec    = isDark ? "text-gray-400" : "text-gray-500";
  const cardBg     = isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";
  const divider    = isDark ? "border-gray-800" : "border-gray-100";

  // Estado visual de permisos
  const permStatus = !isSupported
    ? { icon: XCircle, color: "text-red-400", label: "No soportado en este browser" }
    : permission === "granted"
    ? { icon: CheckCircle, color: "text-green-400", label: "Permiso concedido" }
    : permission === "denied"
    ? { icon: XCircle, color: "text-red-400", label: "Permiso bloqueado" }
    : { icon: AlertCircle, color: "text-yellow-400", label: "Sin respuesta aún" };

  const PermIcon = permStatus.icon;

  return (
    <div className={`min-h-screen ${bg} ${textPrimary}`}>
      <Navbar sidebarDisabled mapView="profesionales" />

      <div className="max-w-xl mx-auto px-4 pt-20 pb-40">

        {/* Header */}
        <button
          onClick={() => router.back()}
          className={`flex items-center gap-1.5 text-sm mb-6 transition-colors ${isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}
        >
          <ChevronLeft className="w-4 h-4" />
          Volver
        </button>

        <h1 className={`text-xl font-bold mb-6 ${textPrimary}`}>Configuración</h1>

        {/* Feedback toast */}
        {feedback && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium border ${
            feedback.type === "ok"
              ? "bg-green-900/30 border-green-700 text-green-400"
              : "bg-red-900/30 border-red-700 text-red-400"
          }`}>
            {feedback.msg}
          </div>
        )}

        {/* Sección Notificaciones */}
        <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
          <div className={`px-5 py-4 border-b ${divider}`}>
            <p className={`text-xs font-semibold uppercase tracking-wider ${textSec}`}>Notificaciones</p>
          </div>

          {/* Estado actual */}
          <div className={`flex items-center gap-4 px-5 py-4 border-b ${divider}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
              <Bell className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${textPrimary}`}>Estado del permiso</p>
              <div className={`flex items-center gap-1.5 mt-0.5`}>
                <PermIcon className={`w-3.5 h-3.5 ${permStatus.color}`} />
                <p className={`text-xs ${permStatus.color}`}>{permStatus.label}</p>
              </div>
            </div>
          </div>

          {/* Suscripción activa */}
          <div className={`flex items-center gap-4 px-5 py-4 border-b ${divider}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
              {isSubscribed
                ? <CheckCircle className="w-5 h-5 text-green-400" />
                : <BellOff className="w-5 h-5 text-gray-500" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${textPrimary}`}>Suscripción push</p>
              <p className={`text-xs mt-0.5 ${isSubscribed ? "text-green-400" : textSec}`}>
                {isSubscribed ? "Activa — vas a recibir notificaciones" : "No activa"}
              </p>
            </div>
          </div>

          {/* Service worker */}
          <div className={`flex items-center gap-4 px-5 py-4 border-b ${divider}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
              <RefreshCw className={`w-5 h-5 ${swVersion === "activo" ? "text-green-400" : "text-gray-500"}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${textPrimary}`}>Service Worker</p>
              <p className={`text-xs mt-0.5 ${swVersion === "activo" ? "text-green-400" : textSec}`}>
                {swVersion ?? "verificando..."}
              </p>
            </div>
          </div>

          {/* Acciones */}
          <div className="px-5 py-4 flex flex-col gap-3">
            {isSupported && !isSubscribed && permission !== "denied" && (
              <button
                onClick={handleEnable}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {loading ? "Procesando..." : "Activar notificaciones"}
              </button>
            )}

            {isSupported && isSubscribed && (
              <button
                onClick={handleDisable}
                disabled={loading}
                className={`w-full py-3 rounded-xl border text-sm font-semibold transition-colors disabled:opacity-50 ${isDark ? "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200" : "border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700"}`}
              >
                {loading ? "Procesando..." : "Desactivar notificaciones"}
              </button>
            )}

            {permission === "denied" && (
              <p className={`text-xs text-center ${textSec}`}>
                Permiso bloqueado. Para reactivarlo, andá a la configuración de tu browser y habilitá las notificaciones para este sitio.
              </p>
            )}
          </div>
        </div>

        {/* Sección Debug / Reset */}
        <div className={`mt-4 rounded-2xl border overflow-hidden ${cardBg}`}>
          <div className={`px-5 py-4 border-b ${divider}`}>
            <p className={`text-xs font-semibold uppercase tracking-wider ${textSec}`}>Avanzado</p>
          </div>
          <div className="px-5 py-4">
            <p className={`text-sm mb-3 ${textSec}`}>
              Si las notificaciones no funcionan, reseteá el Service Worker. Esto borra el cache y te vuelve a pedir el permiso.
            </p>
            <button
              onClick={handleResetSW}
              disabled={loading}
              className={`w-full py-3 rounded-xl border text-sm font-semibold transition-colors disabled:opacity-50 ${isDark ? "border-red-900 text-red-400 hover:bg-red-900/20" : "border-red-200 text-red-500 hover:bg-red-50"}`}
            >
              {loading ? "Procesando..." : "Resetear Service Worker y cache"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
