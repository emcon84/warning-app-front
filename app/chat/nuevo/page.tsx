"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import Navbar from "../../components/Navbar";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function getOrCreateAnonymousToken(): string {
  const existing = localStorage.getItem("clientToken");
  if (existing) return existing;
  const token = crypto.randomUUID();
  localStorage.setItem("clientToken", token);
  return token;
}

function NuevoChat() {
  const router = useRouter();
  const params = useSearchParams();
  const professionalId = params.get("professionalId");

  const { isLoaded, isSignedIn } = useUser();
  const { getToken, userId } = useAuth();

  const [isDark, setIsDark] = useState(true);
  const [professional, setProfessional] = useState<{ nombre: string; apellido: string; oficios: string[]; foto?: string } | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    setIsDark(stored !== "light");

    function onStorage(e: StorageEvent) {
      if (e.key === "theme") setIsDark(e.newValue !== "light");
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!professionalId) return;
    fetch(`${API}/api/professionals/id/${professionalId}`)
      .then((r) => r.json())
      .then((d) => { if (d.nombre) setProfessional(d); })
      .catch(() => {});
  }, [professionalId]);

  async function handleStart(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || !professionalId) return;
    setLoading(true);
    setError("");
    try {
      let clientToken: string;
      let authHeaders: Record<string, string> = {};

      let clientName: string | undefined;
      if (isSignedIn && userId) {
        clientToken = userId;
        const token = await getToken();
        if (token) authHeaders = { Authorization: `Bearer ${token}` };
        // Nombre del usuario logueado
        const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();
        if (fullName) clientName = fullName;
      } else {
        clientToken = getOrCreateAnonymousToken();
      }

      const res = await fetch(`${API}/api/conversations`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ professionalId, clientToken, firstMessage: message.trim(), clientName }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Error al iniciar conversacion");
      }
      const conv = await res.json();
      router.push(`/chat/${conv.id}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  // Theme helpers
  const bg         = isDark ? "bg-gray-950" : "bg-gray-50";
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textSec    = isDark ? "text-gray-400" : "text-gray-500";
  const textMuted  = isDark ? "text-gray-600" : "text-gray-400";
  const cardBg     = isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";
  const inputCls   = isDark
    ? "bg-gray-900 border-gray-700 placeholder-gray-600 focus:border-gray-500"
    : "bg-white border-gray-200 placeholder-gray-400 focus:border-gray-400";
  const inputColor = isDark ? "#f9fafb" : "#111827";
  const inputBg    = isDark ? "#111827" : "#ffffff";
  const infoBg     = isDark ? "bg-blue-950/40 border-blue-900/50" : "bg-blue-50 border-blue-200";
  const infoText   = isDark ? "text-blue-300" : "text-blue-700";
  const infoIcon   = isDark ? "text-blue-400" : "text-blue-500";
  const errorCls   = isDark
    ? "text-red-400 bg-red-900/20 border-red-800"
    : "text-red-600 bg-red-50 border-red-300";
  const backBtn    = isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900";

  if (!isLoaded) {
    return (
      <div className={`min-h-screen ${bg} flex items-center justify-center`}>
        <div className={`w-6 h-6 border-2 rounded-full animate-spin ${isDark ? "border-gray-700 border-t-white" : "border-gray-200 border-t-gray-700"}`} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bg} ${textPrimary}`}>
      <Navbar sidebarDisabled mapView="profesionales" />

      {/* Área scrolleable */}
      <div className="px-4 pt-20 pb-[5.5rem]">
        <div className="max-w-xl mx-auto">
          <button
            onClick={() => router.back()}
            className={`flex items-center gap-1.5 text-sm mb-6 transition-colors ${backBtn}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </button>

          {professional && (
            <div className={`flex items-center gap-3 mb-8 p-4 rounded-2xl border ${cardBg}`}>
              <div className={`w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center text-xl font-bold ${isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"}`}>
                {professional.foto
                  ? <img src={professional.foto} alt="" className="w-full h-full object-cover" />
                  : professional.nombre[0].toUpperCase()}
              </div>
              <div>
                <p className={`font-semibold ${textPrimary}`}>{professional.nombre} {professional.apellido}</p>
                <p className={`text-sm capitalize ${textSec}`}>{professional.oficios[0]}</p>
              </div>
            </div>
          )}

          <h1 className={`text-xl font-bold mb-1 ${textPrimary}`}>Iniciar contacto</h1>
          <p className={`text-sm mb-6 ${textSec}`}>
            Tu mensaje es privado. El profesional no ve tu telefono ni datos de contacto hasta que acordes trabajar juntos.
          </p>

          <form id="nuevo-chat-form" onSubmit={handleStart} className="flex flex-col gap-4">
            <div>
              <label className={`text-xs mb-1.5 block ${textSec}`}>
                Que necesitas? <span className={textMuted}>({message.length}/500)</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 500))}
                placeholder="Ej: Necesito un plomero para arreglar una perdida de agua en la cocina..."
                rows={5}
                autoFocus
                style={{ color: inputColor, backgroundColor: inputBg }}
                className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none resize-none ${inputCls}`}
              />
            </div>

            <div className={`flex items-start gap-2 p-3 rounded-xl border ${infoBg}`}>
              <svg className={`w-4 h-4 mt-0.5 flex-shrink-0 ${infoIcon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className={`text-xs ${infoText}`}>
                Tu privacidad esta protegida. El numero de telefono y datos de contacto se comparten solo cuando ambos acuerdan.
              </p>
            </div>

            {error && (
              <p className={`text-sm border rounded-xl px-4 py-3 ${errorCls}`}>{error}</p>
            )}
          </form>
        </div>
      </div>

      {/* Botón fijo arriba del teclado — igual que el input del chat */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 px-4 py-3 border-t ${isDark ? "bg-gray-950 border-gray-800" : "bg-gray-50 border-gray-200"}`}
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="max-w-xl mx-auto">
          <button
            type="submit"
            form="nuevo-chat-form"
            disabled={message.trim().length < 10 || loading}
            className="w-full py-3.5 rounded-2xl bg-white text-gray-950 font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
          >
            {loading ? "Iniciando..." : "Enviar mensaje"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NuevoChatPage() {
  return (
    <Suspense>
      <NuevoChat />
    </Suspense>
  );
}
