"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth, useUser, SignInButton } from "@clerk/nextjs";
import { Ticket, ArrowRight, Loader2 } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useConfetti } from "@/hooks/useConfetti";
import { API_URL } from "@/lib/api/client";

function padNum(n: number) {
  return n.toString().padStart(3, "0");
}

type Phase = "loading" | "needs-login" | "registering" | "done" | "error";

export default function CheckInPage() {
  const params   = useParams();
  const router   = useRouter();
  const slug     = params.slug as string;
  const { isDark } = useTheme();
  const { isSignedIn, isLoaded, user } = useUser();
  const { getToken }  = useAuth();
  const { fire }      = useConfetti();

  const [phase,   setPhase]   = useState<Phase>("loading");
  const [numero,  setNumero]  = useState<number | null>(null);
  const [nombre,  setNombre]  = useState("");
  const [yaEra,   setYaEra]   = useState(false);
  const [errMsg,  setErrMsg]  = useState("");
  const [shared,  setShared]  = useState(false);

  const bg      = isDark ? "bg-gray-950" : "bg-gray-50";
  const card    = isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";
  const textPri = isDark ? "text-white" : "text-gray-900";
  const textMut = isDark ? "text-gray-400" : "text-gray-500";

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) { setPhase("needs-login"); return; }
    registrar();
  }, [isLoaded, isSignedIn]);

  async function registrar() {
    setPhase("registering");
    try {
      const token = await getToken();
      const nombre = user?.firstName ?? user?.username ?? "Asistente";
      const res = await fetch(`${API_URL}/api/eventos/${slug}/sorteo/participar`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
        body: JSON.stringify({ nombre }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        const msg = (d as any).error ?? "";
        if (msg.includes("no tiene sorteo")) {
          setErrMsg("Este evento no tiene sorteo activo.");
        } else if (msg.includes("ya fue ejecutado")) {
          setErrMsg("El sorteo ya fue ejecutado. Llegaste tarde!");
        } else {
          setErrMsg(msg || "Error al registrarte.");
        }
        setPhase("error");
        return;
      }

      const d = await res.json();
      setNumero(d.numero);
      setNombre(nombre);
      setYaEra(d.yaParticipaba ?? false);
      setPhase("done");
      if (!d.yaParticipaba) setTimeout(() => fire(), 400);
    } catch {
      setErrMsg("No se pudo conectar. Revisá tu conexión.");
      setPhase("error");
    }
  }

  async function handleShare() {
    if (!numero) return;
    const url  = `${window.location.origin}/evento/${slug}`;
    const text = `Estoy en el evento y participo en el sorteo con el número *${padNum(numero)}*! ${url}`;
    try {
      if (navigator.share) await navigator.share({ text, url });
      else await navigator.clipboard.writeText(text);
    } catch { await navigator.clipboard.writeText(text).catch(() => {}); }
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  }

  return (
    <div className={`min-h-screen ${bg} flex items-center justify-center px-4`}>
      <div className={`w-full max-w-sm rounded-3xl border p-8 text-center ${card}`}>

        {/* Loading */}
        {(phase === "loading" || phase === "registering") && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
            <p className={`text-sm font-medium ${textMut}`}>
              {phase === "loading" ? "Cargando..." : "Registrando tu asistencia..."}
            </p>
          </div>
        )}

        {/* Needs login */}
        {phase === "needs-login" && (
          <div className="flex flex-col items-center gap-5">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isDark ? "bg-indigo-500/20" : "bg-indigo-50"}`}>
              <Ticket className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h1 className={`text-xl font-black mb-1 ${textPri}`}>Participar en el sorteo</h1>
              <p className={`text-sm ${textMut}`}>Iniciá sesión para obtener tu número y participar en el sorteo del evento.</p>
            </div>
            <SignInButton mode="modal" forceRedirectUrl={`/evento/${slug}/check-in`}>
              <button className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-sm transition-colors">
                Iniciar sesión para participar <ArrowRight className="w-4 h-4" />
              </button>
            </SignInButton>
          </div>
        )}

        {/* Done */}
        {phase === "done" && numero !== null && (
          <div className="flex flex-col items-center gap-5">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isDark ? "bg-amber-500/20" : "bg-amber-50"}`}>
              <Ticket className="w-8 h-8 text-amber-400" />
            </div>

            {yaEra ? (
              <p className={`text-sm font-semibold ${textMut}`}>Ya estabas registrado. Tu número es:</p>
            ) : (
              <div>
                <h1 className={`text-xl font-black mb-1 ${textPri}`}>Estás dentro!</h1>
                <p className={`text-sm ${textMut}`}>Tu número para el sorteo es:</p>
              </div>
            )}

            {/* Número grande */}
            <div className={`w-full py-6 rounded-2xl ${isDark ? "bg-indigo-500/10 border border-indigo-500/20" : "bg-indigo-50 border border-indigo-100"}`}>
              <p className="text-7xl font-black text-indigo-400 tracking-widest tabular-nums">
                {padNum(numero)}
              </p>
              <p className={`text-xs mt-2 font-semibold ${isDark ? "text-indigo-400" : "text-indigo-500"}`}>
                Tu número de sorteo
              </p>
            </div>

            <p className={`text-sm ${textMut}`}>Guardá este número. El organizador sortea en vivo durante el evento.</p>

            <button
              onClick={handleShare}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl border font-semibold text-sm transition-all ${
                shared
                  ? isDark ? "border-green-500/40 bg-green-500/10 text-green-400" : "border-green-200 bg-green-50 text-green-600"
                  : isDark ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {shared ? "Copiado!" : `Compartir mi número (${padNum(numero)})`}
            </button>

            <button
              onClick={() => router.push(`/evento/${slug}`)}
              className={`text-xs ${textMut} hover:underline`}
            >
              Ver el evento
            </button>
          </div>
        )}

        {/* Error */}
        {phase === "error" && (
          <div className="flex flex-col items-center gap-4">
            <p className={`text-4xl`}>😅</p>
            <p className={`text-base font-bold ${textPri}`}>{errMsg}</p>
            <button
              onClick={() => router.push(`/evento/${slug}`)}
              className="px-6 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-semibold"
            >
              Ver el evento
            </button>
          </div>
        )}

        {/* Branding */}
        <p className={`text-xs mt-6 ${isDark ? "text-gray-700" : "text-gray-300"}`}>
          reportesreconquista.com
        </p>
      </div>
    </div>
  );
}
