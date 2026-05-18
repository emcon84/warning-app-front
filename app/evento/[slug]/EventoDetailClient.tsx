"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth, useUser } from "@clerk/nextjs";
import { Calendar, MapPin, Ticket, ArrowLeft, Share2, Check, MessageCircle, Send, Pencil, Heart, Download, Bell, BellOff } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import Navbar from "@/components/Navbar";
import type { Evento, EventoComentario } from "@/lib/types/evento";
import { CATEGORIA_EMOJI } from "@/lib/types/evento";
import { resolvePhotoUrl } from "@/lib/utils/photo";
import { API_URL } from "@/lib/api/client";
import { EventoEditSheet } from "./EventoEditSheet";
import { EventoFotosFeed } from "./EventoFotosFeed";

function formatFechaLarga(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function EventoDetailClient({ evento: inicial }: { evento: Evento }) {
  const { isDark } = useTheme();
  const { isSignedIn } = useUser();
  const { getToken } = useAuth();
  const [evento, setEvento] = useState(inicial);
  const [shared, setShared] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [following, setFollowing] = useState(false);
  const [followCount, setFollowCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);
  const [comentarios, setComentarios] = useState<EventoComentario[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [texto, setTexto] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  const banner = evento.banner ? resolvePhotoUrl(evento.banner) : null;
  const logo   = evento.logo   ? resolvePhotoUrl(evento.logo)   : null;
  const bg     = isDark ? "bg-gray-950" : "bg-gray-50";
  const card   = isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";
  const textPri = isDark ? "text-white" : "text-gray-900";
  const textMut = isDark ? "text-gray-400" : "text-gray-500";

  useEffect(() => {
    fetch(`${API_URL}/api/eventos/${evento.slug}/likes`)
      .then(r => r.ok ? r.json() : { count: 0 })
      .then(d => setLikes(d.count ?? 0))
      .catch(() => {});
  }, [evento.slug]);

  async function handleLike() {
    setLiked(true);
    setLikes(l => l + 1);
    try {
      const res = await fetch(`${API_URL}/api/eventos/${evento.slug}/like`, { method: "POST" });
      const d = await res.json();
      setLikes(d.count ?? likes);
      if (d.already) setLiked(true);
    } catch {}
  }

  async function handleDownloadFlyer() {
    setDownloading(true);
    try {
      const params = new URLSearchParams({
        nombre:      evento.nombre,
        categoria:   evento.categoria,
        lugar:       evento.lugar ?? "",
        fecha:       evento.fecha,
        organizador: evento.organizador,
        ...(evento.precio  ? { precio:  evento.precio  } : {}),
        ...(evento.banner  ? { banner:  evento.banner  } : {}),
        ...(evento.logo    ? { logo:    evento.logo    } : {}),
      });
      const url = `${window.location.origin}/share/evento?${params}`;
      const res  = await fetch(url);
      const blob = await res.blob();
      const file = new File([blob], `evento-${evento.slug}.jpg`, { type: blob.type });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: evento.nombre });
      } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `evento-${evento.slug}.jpg`;
        a.click();
      }
    } catch {}
    finally { setDownloading(false); }
  }

  useEffect(() => {
    fetch(`${API_URL}/api/eventos/${evento.slug}/comentarios`)
      .then(r => r.ok ? r.json() : [])
      .then(setComentarios)
      .catch(() => setComentarios([]))
      .finally(() => setLoadingComments(false));
  }, [evento.slug]);

  useEffect(() => {
    if (!isSignedIn) return;
    getToken().then(token => {
      if (!token) return;
      fetch(`${API_URL}/api/eventos/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : [])
        .then((mis: Evento[]) => setIsOwner(mis.some(e => e.slug === evento.slug)))
        .catch(() => {});
    });
  }, [isSignedIn, evento.slug]);

  useEffect(() => {
    const fetchFollow = async () => {
      const token = isSignedIn ? await getToken().catch(() => null) : null;
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_URL}/api/eventos/${evento.slug}/follow`, { headers }).catch(() => null);
      if (!res?.ok) return;
      const d = await res.json();
      setFollowing(d.subscribed ?? false);
      setFollowCount(d.count ?? 0);
    };
    fetchFollow();
  }, [isSignedIn, evento.slug]);

  async function handleFollow() {
    if (!isSignedIn) return;
    setFollowLoading(true);
    const token = await getToken().catch(() => null);
    const method = following ? "DELETE" : "POST";
    try {
      const res = await fetch(`${API_URL}/api/eventos/${evento.slug}/follow`, {
        method,
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      if (res.ok) {
        setFollowing(!following);
        setFollowCount(c => following ? c - 1 : c + 1);
      }
    } catch {}
    finally { setFollowLoading(false); }
  }

  async function handleShare() {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: evento.nombre, url });
      else await navigator.clipboard.writeText(url);
    } catch { await navigator.clipboard.writeText(url).catch(() => {}); }
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!texto.trim() || sending) return;
    setSending(true);
    setSendError("");
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/eventos/${evento.slug}/comentarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
        body: JSON.stringify({ texto, autorNombre: "Usuario" }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Error al comentar");
      const nuevo = await res.json();
      setComentarios(prev => [nuevo, ...prev]);
      setTexto("");
    } catch (err: any) {
      setSendError(err.message);
    } finally {
      setSending(false);
    }
  }

  const diasRestantes = Math.ceil((new Date(evento.fecha).getTime() - Date.now()) / 86400000);

  return (
    <div className={`min-h-screen ${bg}`}>
      <Navbar />

      {/* Banner hero */}
      <div className="relative w-full h-64 md:h-96">
        {banner ? (
          <Image src={banner} alt={evento.nombre} fill className="object-cover" priority />
        ) : (
          <div className={`w-full h-full flex items-center justify-center text-8xl ${isDark ? "bg-gray-900" : "bg-gradient-to-br from-indigo-100 to-purple-200"}`}>
            {CATEGORIA_EMOJI[evento.categoria] ?? "📌"}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Nav actions */}
        <div className="absolute top-16 left-4 right-4 flex items-center justify-between">
          <Link href="/eventos" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 text-white text-sm backdrop-blur-sm hover:bg-black/60 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Eventos
          </Link>
          <div className="flex items-center gap-2">
            {isOwner && (
              <button onClick={() => setShowEdit(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 text-white text-sm backdrop-blur-sm hover:bg-black/60 transition-colors">
                <Pencil className="w-4 h-4" /> Editar
              </button>
            )}
            <button onClick={handleShare} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 text-white text-sm backdrop-blur-sm hover:bg-black/60 transition-colors">
              {shared ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              {shared ? "Copiado" : "Compartir"}
            </button>
          </div>
        </div>

        {/* Countdown badge */}
        {diasRestantes >= 0 && (
          <div className="absolute bottom-4 right-4">
            <span className={`text-sm font-bold px-3 py-1.5 rounded-full text-white ${diasRestantes === 0 ? "bg-red-500" : diasRestantes <= 3 ? "bg-amber-500" : "bg-indigo-500"}`}>
              {diasRestantes === 0 ? "Hoy" : diasRestantes === 1 ? "Mañana" : `En ${diasRestantes} días`}
            </span>
          </div>
        )}
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* Info principal */}
        <div className={`rounded-2xl border p-5 ${card}`}>
          <div className="flex items-start gap-3 mb-4">
            {logo && (
              <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-700">
                <Image src={logo} alt="logo" width={56} height={56} className="object-cover w-full h-full" />
              </div>
            )}
            <div className="flex-1">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mb-2 inline-block ${isDark ? "bg-indigo-500/20 text-indigo-300" : "bg-indigo-50 text-indigo-600"}`}>
                {CATEGORIA_EMOJI[evento.categoria]} {evento.categoria}
              </span>
              <h1 className={`text-xl font-black leading-tight ${textPri}`}>{evento.nombre}</h1>
              <p className={`text-sm mt-0.5 ${textMut}`}>por {evento.organizador}</p>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className={`flex items-center gap-2.5 text-sm ${textMut}`}>
              <Calendar className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <span>{formatFechaLarga(evento.fecha)}</span>
            </div>
            {evento.fechaFin && (
              <div className={`flex items-center gap-2.5 text-sm ${textMut} ml-6`}>
                <span>hasta {formatFechaLarga(evento.fechaFin)}</span>
              </div>
            )}
            <div className={`flex items-center gap-2.5 text-sm ${textMut}`}>
              <MapPin className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{evento.lugar}{evento.barrio ? ` · ${evento.barrio}` : ""}{evento.direccion ? ` · ${evento.direccion}` : ""}</span>
            </div>
            {evento.precio && (
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-lg ${isDark ? "bg-green-500/15 text-green-400 border border-green-500/30" : "bg-green-50 text-green-600 border border-green-200"}`}>
                  <Ticket className="w-5 h-5 flex-shrink-0" />
                  {evento.precio}
                </div>
              </div>
            )}
          </div>

          {evento.descripcion && (
            <p className={`mt-4 pt-4 border-t text-sm leading-relaxed whitespace-pre-wrap ${isDark ? "border-gray-800 text-gray-300" : "border-gray-100 text-gray-600"}`}>
              {evento.descripcion}
            </p>
          )}

          {/* Seguir evento */}
          <div className={`mt-4 pt-4 border-t ${isDark ? "border-gray-800" : "border-gray-100"}`}>
            <button
              onClick={handleFollow}
              disabled={followLoading || !isSignedIn}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all ${
                following
                  ? isDark ? "bg-indigo-500/20 border border-indigo-500/40 text-indigo-300" : "bg-indigo-50 border border-indigo-200 text-indigo-600"
                  : "bg-indigo-500 hover:bg-indigo-600 text-white"
              } disabled:opacity-50`}
            >
              {following ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
              {following
                ? `Siguiendo · ${followCount} ${followCount === 1 ? "seguidor" : "seguidores"}`
                : isSignedIn
                  ? `Seguir evento · ${followCount > 0 ? followCount : ""}`
                  : "Iniciá sesión para seguir"
              }
            </button>
            {!following && isSignedIn && (
              <p className={`text-xs text-center mt-1.5 ${isDark ? "text-gray-600" : "text-gray-400"}`}>
                Recibís una notificacion por cada actualizacion
              </p>
            )}
          </div>

          {/* Like + Compartir flyer */}
          <div className={`mt-4 pt-4 border-t flex items-center gap-3 ${isDark ? "border-gray-800" : "border-gray-100"}`}>
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all flex-1 justify-center ${
                liked
                  ? "bg-rose-500/20 border-rose-500/40 text-rose-400"
                  : isDark ? "border-gray-700 text-gray-400 hover:bg-gray-800 hover:border-rose-500/40 hover:text-rose-400" : "border-gray-200 text-gray-500 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-500"
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
              {likes > 0 ? `${likes} Me gusta` : "Me gusta"}
            </button>
            <button
              onClick={handleDownloadFlyer}
              disabled={downloading}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all flex-1 justify-center ${
                isDark ? "border-gray-700 text-gray-400 hover:bg-gray-800" : "border-gray-200 text-gray-500 hover:bg-gray-50"
              } disabled:opacity-60`}
            >
              <Download className={`w-4 h-4 ${downloading ? "animate-bounce" : ""}`} />
              {downloading ? "Generando..." : "Compartir flyer"}
            </button>
          </div>
        </div>

        {/* Feed social de fotos */}
        <EventoFotosFeed slug={evento.slug} isDark={isDark} />

        {/* Comentarios */}
        <div className={`rounded-2xl border p-5 ${card}`}>
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-4 h-4 text-indigo-400" />
            <h2 className={`text-sm font-bold ${textPri}`}>Comentarios ({comentarios.length})</h2>
          </div>

          {isSignedIn ? (
            <form onSubmit={handleComment} className="flex gap-2 mb-4">
              <input
                value={texto}
                onChange={e => setTexto(e.target.value)}
                placeholder="¿Qué te parece el evento?"
                maxLength={500}
                className={`flex-1 text-sm px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-400 ${isDark ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500" : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"}`}
              />
              <button
                type="submit"
                disabled={!texto.trim() || sending}
                className="px-3 py-2 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-50 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <Link href="/sign-in" className={`block text-center text-xs py-3 rounded-xl border mb-4 ${isDark ? "border-gray-700 text-gray-400 hover:bg-gray-800" : "border-gray-200 text-gray-500 hover:bg-gray-50"} transition-colors`}>
              Iniciá sesión para comentar
            </Link>
          )}

          {sendError && <p className="text-xs text-red-400 mb-3">{sendError}</p>}

          {loadingComments ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className={`h-12 rounded-xl animate-pulse ${isDark ? "bg-gray-800" : "bg-gray-100"}`} />)}
            </div>
          ) : comentarios.length === 0 ? (
            <p className={`text-sm text-center py-6 ${textMut}`}>Sé el primero en comentar</p>
          ) : (
            <div className="space-y-3">
              {comentarios.map(c => (
                <div key={c.id} className={`p-3 rounded-xl ${isDark ? "bg-gray-800" : "bg-gray-50"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold ${textPri}`}>{c.autorNombre}</span>
                    <span className={`text-xs ${textMut}`}>{new Date(c.createdAt).toLocaleDateString("es-AR")}</span>
                  </div>
                  <p className={`text-sm leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"}`}>{c.texto}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showEdit && (
        <EventoEditSheet
          evento={evento}
          getToken={getToken}
          isDark={isDark}
          onClose={() => setShowEdit(false)}
          onSaved={(updated) => { setEvento(updated); setShowEdit(false); }}
        />
      )}
    </div>
  );
}
