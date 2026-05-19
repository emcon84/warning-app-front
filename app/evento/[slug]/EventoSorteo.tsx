"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { Ticket, Users, Sparkles, Trophy, Share2, Loader2, Play } from "lucide-react";
import { API_URL } from "@/lib/api/client";
import { useConfetti } from "@/hooks/useConfetti";

interface SorteoStatus {
  tieneSorteo:          boolean;
  sorteoEjecutado:      boolean;
  sorteoGanadorNum:     number | null;
  sorteoGanadorNombre:  string | null;
  totalParticipantes:   number;
  miNumero:             number | null;
}

interface Props {
  slug:        string;
  eventoNombre: string;
  isOwner:     boolean;
  isDark:      boolean;
}

function padNum(n: number) {
  return n.toString().padStart(3, "0");
}

// ── Slot Machine Animation ────────────────────────────────────────────────────

function SlotMachineModal({
  total,
  ganador,
  onClose,
  isDark,
}: {
  total:   number;
  ganador: { numero: number; nombre: string } | null;
  onClose: () => void;
  isDark:  boolean;
}) {
  const { fire } = useConfetti();
  const [phase, setPhase]     = useState<"spinning" | "slowing" | "done">("spinning");
  const [display, setDisplay] = useState("000");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!ganador) return;

    let speed = 60;
    let elapsed = 0;
    const duration = 4000;

    function tick() {
      const rand = Math.floor(Math.random() * Math.max(total, 10)) + 1;
      setDisplay(padNum(rand));
      elapsed += speed;

      if (elapsed < duration * 0.5) {
        speed = 60;
      } else if (elapsed < duration * 0.75) {
        speed = 120;
        setPhase("slowing");
      } else if (elapsed < duration) {
        speed = 220;
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setDisplay(padNum(ganador.numero));
        setPhase("done");
        setTimeout(() => fire(), 300);
        return;
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(tick, speed);
    }

    intervalRef.current = setInterval(tick, speed);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current)  clearTimeout(timeoutRef.current);
    };
  }, [ganador, total, fire]);

  return (
    <div className="fixed inset-0 z-[3500] flex items-center justify-center bg-black/90">
      <div className="flex flex-col items-center gap-8 px-8 text-center">

        {/* Titulo */}
        <div className="flex flex-col items-center gap-2">
          <Sparkles className="w-10 h-10 text-amber-400 animate-pulse" />
          <h2 className="text-white text-2xl font-black">
            {phase === "done" ? "El numero ganador es..." : "Sorteando..."}
          </h2>
        </div>

        {/* Numero en pantalla */}
        <div className={`relative flex items-center justify-center w-64 h-64 rounded-3xl border-4 ${
          phase === "done"
            ? "border-amber-400 bg-amber-500/20 shadow-[0_0_80px_rgba(251,191,36,0.5)]"
            : "border-indigo-500 bg-indigo-500/10 shadow-[0_0_40px_rgba(99,102,241,0.3)]"
        } transition-all duration-500`}>
          <span className={`font-black tracking-widest tabular-nums transition-all duration-300 ${
            phase === "done" ? "text-9xl text-amber-400" : "text-8xl text-white"
          }`} style={{ fontVariantNumeric: "tabular-nums" }}>
            {display}
          </span>

          {/* Líneas decorativas del slot */}
          {phase !== "done" && (
            <>
              <div className="absolute top-0 left-0 right-0 h-12 rounded-t-3xl bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 h-12 rounded-b-3xl bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
            </>
          )}
        </div>

        {/* Ganador reveal */}
        {phase === "done" && ganador && (
          <div className="flex flex-col items-center gap-3 animate-bounce">
            <Trophy className="w-12 h-12 text-amber-400" />
            <p className="text-white text-3xl font-black">{ganador.nombre}</p>
            <p className="text-amber-400 text-lg font-semibold">Felicitaciones!</p>
          </div>
        )}

        {phase !== "done" && (
          <p className="text-white/50 text-sm">{total} participantes en el sorteo</p>
        )}

        {phase === "done" && (
          <button
            onClick={onClose}
            className="mt-4 px-8 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-colors"
          >
            Cerrar
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function EventoSorteo({ slug, eventoNombre, isOwner, isDark }: Props) {
  const { isSignedIn, user } = useUser();
  const { getToken }         = useAuth();

  const [status,      setStatus]      = useState<SorteoStatus | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [joining,     setJoining]     = useState(false);
  const [running,     setRunning]     = useState(false);
  const [showSlot,    setShowSlot]    = useState(false);
  const [ganador,     setGanador]     = useState<{ numero: number; nombre: string } | null>(null);
  const [shared,      setShared]      = useState(false);

  const card    = isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";
  const textPri = isDark ? "text-white" : "text-gray-900";
  const textMut = isDark ? "text-gray-400" : "text-gray-500";

  useEffect(() => {
    const load = async () => {
      const token = isSignedIn ? await getToken().catch(() => null) : null;
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_URL}/api/eventos/${slug}/sorteo`, { headers }).catch(() => null);
      if (!res?.ok) { setLoading(false); return; }
      setStatus(await res.json());
      setLoading(false);
    };
    load();
  }, [slug, isSignedIn]);

  async function handleParticiparYCompartir() {
    if (!isSignedIn || joining) return;
    setJoining(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/eventos/${slug}/sorteo/participar`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
        body: JSON.stringify({ nombre: user?.firstName ?? user?.username ?? "Participante" }),
      });
      if (!res.ok) return;
      const d = await res.json();
      const numero = d.numero as number;
      setStatus(prev => prev ? { ...prev, miNumero: numero, totalParticipantes: prev.totalParticipantes + (d.yaParticipaba ? 0 : 1) } : prev);

      // Inmediatamente abre el share con el número
      const url   = `${window.location.origin}/evento/${slug}`;
      const texto = `Participé en el sorteo de "${eventoNombre}" con el número *${padNum(numero)}*! Compartí este link para participar vos también: ${url}`;
      try {
        if (navigator.share) await navigator.share({ text: texto, url });
        else await navigator.clipboard.writeText(texto);
      } catch { await navigator.clipboard.writeText(texto).catch(() => {}); }
    } catch {}
    finally { setJoining(false); }
  }

  async function handleEjecutar() {
    if (!isOwner || running) return;
    setRunning(true);
    setShowSlot(true);
    setGanador(null);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/eventos/${slug}/sorteo/ejecutar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      if (!res.ok) { setShowSlot(false); return; }
      const d = await res.json();
      setGanador({ numero: d.numero, nombre: d.nombre });
      setStatus(prev => prev ? { ...prev, sorteoEjecutado: true, sorteoGanadorNum: d.numero, sorteoGanadorNombre: d.nombre } : prev);
    } catch { setShowSlot(false); }
    finally { setRunning(false); }
  }

  async function handleCompartirConCodigo() {
    if (!status?.miNumero) return;
    const url   = `${window.location.origin}/evento/${slug}`;
    const texto = `Participé en el sorteo de "${eventoNombre}" con el número *${padNum(status.miNumero)}*!\nParticipá vos también: ${url}`;
    try {
      if (navigator.share) await navigator.share({ text: texto, url });
      else await navigator.clipboard.writeText(texto);
    } catch { await navigator.clipboard.writeText(texto).catch(() => {}); }
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  }

  if (loading || !status?.tieneSorteo) return null;

  return (
    <>
      <div className={`rounded-2xl border p-5 ${card}`}>
        <div className="flex items-center gap-2 mb-4">
          <Ticket className="w-4 h-4 text-amber-400" />
          <h2 className={`text-sm font-bold ${textPri}`}>Sorteo del evento</h2>
          <span className={`ml-auto text-xs flex items-center gap-1 ${textMut}`}>
            <Users className="w-3.5 h-3.5" /> {status.totalParticipantes} participantes
          </span>
        </div>

        {/* Resultado si ya se ejecutó */}
        {status.sorteoEjecutado && status.sorteoGanadorNum && (
          <div className={`rounded-2xl p-5 text-center mb-4 ${isDark ? "bg-amber-500/10 border border-amber-500/30" : "bg-amber-50 border border-amber-200"}`}>
            <Trophy className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? "text-amber-500" : "text-amber-600"}`}>Ganador</p>
            <p className={`text-5xl font-black text-amber-400 mb-1`}>{padNum(status.sorteoGanadorNum)}</p>
            <p className={`text-base font-bold ${textPri}`}>{status.sorteoGanadorNombre}</p>
            {status.miNumero === status.sorteoGanadorNum && (
              <div className={`mt-3 px-4 py-2 rounded-xl font-bold text-sm ${isDark ? "bg-green-500/20 text-green-400" : "bg-green-50 text-green-600"}`}>
                Sos el ganador!
              </div>
            )}
          </div>
        )}

        {/* Mi numero */}
        {status.miNumero && !status.sorteoEjecutado && (
          <div className={`rounded-2xl p-4 mb-4 text-center ${isDark ? "bg-indigo-500/10 border border-indigo-500/20" : "bg-indigo-50 border border-indigo-100"}`}>
            <p className={`text-xs font-semibold mb-1 ${isDark ? "text-indigo-400" : "text-indigo-500"}`}>Tu numero de participacion</p>
            <p className={`text-6xl font-black text-indigo-400 tracking-widest`}>{padNum(status.miNumero)}</p>
          </div>
        )}

        {/* Acciones */}
        {!status.sorteoEjecutado && (
          <div className="space-y-2">
            {!status.miNumero && isSignedIn && (
              <button
                onClick={handleParticiparYCompartir}
                disabled={joining}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-colors disabled:opacity-60"
              >
                {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ticket className="w-4 h-4" />}
                {joining ? "Participando..." : "Participar en el sorteo"}
              </button>
            )}

            {!status.miNumero && !isSignedIn && (
              <p className={`text-center text-sm py-3 rounded-2xl border ${isDark ? "border-gray-700 text-gray-500" : "border-gray-200 text-gray-400"}`}>
                Iniciá sesión para participar en el sorteo
              </p>
            )}

            {status.miNumero && (
              <button
                onClick={handleCompartirConCodigo}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl border text-sm font-semibold transition-all ${
                  shared
                    ? isDark ? "border-green-500/40 bg-green-500/10 text-green-400" : "border-green-200 bg-green-50 text-green-600"
                    : isDark ? "border-gray-700 text-gray-400 hover:bg-gray-800" : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                <Share2 className="w-4 h-4" />
                {shared ? "Link copiado!" : `Compartir mi numero (${padNum(status.miNumero)})`}
              </button>
            )}

            {isOwner && (
              <button
                onClick={handleEjecutar}
                disabled={running || status.totalParticipantes === 0}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-colors ${
                  status.totalParticipantes === 0
                    ? isDark ? "bg-gray-800 text-gray-600 cursor-not-allowed" : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                }`}
              >
                <Play className="w-4 h-4" />
                Ejecutar sorteo
                {status.totalParticipantes === 0 && " (sin participantes)"}
              </button>
            )}
          </div>
        )}
      </div>

      {showSlot && (
        <SlotMachineModal
          total={status.totalParticipantes}
          ganador={ganador}
          isDark={isDark}
          onClose={() => setShowSlot(false)}
        />
      )}
    </>
  );
}
