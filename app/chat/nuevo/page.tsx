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

  const [professional, setProfessional] = useState<{ nombre: string; apellido: string; oficios: string[]; foto?: string } | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

      if (isSignedIn && userId) {
        clientToken = userId;
        const token = await getToken();
        if (token) authHeaders = { Authorization: `Bearer ${token}` };
      } else {
        clientToken = getOrCreateAnonymousToken();
      }

      const res = await fetch(`${API}/api/conversations`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ professionalId, clientToken, firstMessage: message.trim() }),
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

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-700 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Navbar sidebarDisabled mapView="profesionales" />

      <div className="flex-1 flex flex-col max-w-xl mx-auto w-full px-4 pt-24 pb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </button>

        {professional && (
          <div className="flex items-center gap-3 mb-8 p-4 rounded-2xl bg-gray-900 border border-gray-800">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-700 flex-shrink-0 flex items-center justify-center text-xl font-bold text-gray-300">
              {professional.foto
                ? <img src={professional.foto} alt="" className="w-full h-full object-cover" />
                : professional.nombre[0].toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-white">{professional.nombre} {professional.apellido}</p>
              <p className="text-sm text-gray-400 capitalize">{professional.oficios[0]}</p>
            </div>
          </div>
        )}

        <h1 className="text-xl font-bold mb-1">Iniciar contacto</h1>
        <p className="text-sm text-gray-400 mb-6">
          Tu mensaje es privado. El profesional no ve tu teléfono ni datos de contacto hasta que acordés trabajar juntos.
        </p>

        <form onSubmit={handleStart} className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">
              ¿Qué necesitás? <span className="text-gray-600">({message.length}/500)</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 500))}
              placeholder="Ej: Necesito un plomero para arreglar una pérdida de agua en la cocina..."
              rows={5}
              autoFocus
              style={{ color: "#f9fafb" }}
              className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 placeholder-gray-600 text-sm focus:outline-none focus:border-gray-500 resize-none"
            />
          </div>

          <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-950/40 border border-blue-900/50">
            <svg className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-blue-300">
              Tu privacidad está protegida. El número de teléfono y datos de contacto se comparten solo cuando ambos acuerdan.
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-xl px-4 py-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={message.trim().length < 10 || loading}
            className="w-full py-3.5 rounded-2xl bg-white text-gray-950 font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
          >
            {loading ? "Iniciando..." : "Enviar mensaje"}
          </button>
        </form>
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
