"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays, MapPin, Plus, Eye, EyeOff, Pencil, Loader2, CalendarClock, Trash2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { useTheme } from "@/contexts/ThemeContext";
import { API_URL } from "@/lib/api/client";
import { resolvePhotoUrl } from "@/lib/utils/photo";
import { CATEGORIA_EMOJI } from "@/lib/types/evento";
import type { Evento } from "@/lib/types/evento";

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });
}

export default function MisEventosPage() {
  const { isDark } = useTheme();
  const { isSignedIn, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();

  const [eventos,   setEventos]   = useState<Evento[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [toggling,  setToggling]  = useState<string | null>(null);
  const [deleting,  setDeleting]  = useState<string | null>(null);

  const bg      = isDark ? "bg-gray-950" : "bg-gray-50";
  const card    = isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";
  const textPri = isDark ? "text-white" : "text-gray-900";
  const textMut = isDark ? "text-gray-400" : "text-gray-500";

  const loadEventos = useCallback(async () => {
    const token = await getToken().catch(() => null);
    if (!token) return;
    const res = await fetch(`${API_URL}/api/eventos/me`, {
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => null);
    if (res?.ok) setEventos(await res.json());
    setLoading(false);
  }, [getToken]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) { router.push("/sign-in"); return; }
    loadEventos();
  }, [isLoaded, isSignedIn, loadEventos, router]);

  async function handleToggleEstado(evento: Evento) {
    setToggling(evento.id);
    const token = await getToken().catch(() => null);
    const res = await fetch(`${API_URL}/api/eventos/${evento.slug}/estado`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
      body: JSON.stringify({ borrador: !evento.borrador }),
    }).catch(() => null);
    if (res?.ok) {
      setEventos(prev => prev.map(e =>
        e.id === evento.id ? { ...e, borrador: !e.borrador } : e
      ));
    }
    setToggling(null);
  }

  async function handleDelete(evento: Evento) {
    if (!confirm(`¿Eliminar "${evento.nombre}"? Esta acción no se puede deshacer.`)) return;
    setDeleting(evento.id);
    const token = await getToken().catch(() => null);
    const res = await fetch(`${API_URL}/api/eventos/${evento.slug}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token ?? ""}` },
    }).catch(() => null);
    if (res?.ok) setEventos(prev => prev.filter(e => e.id !== evento.id));
    setDeleting(null);
  }

  const publicados = eventos.filter(e => !e.borrador);
  const borradores = eventos.filter(e => e.borrador);

  return (
    <div className={`min-h-screen ${bg}`}>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 pt-20 pb-10 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-xl font-black ${textPri}`}>Mis eventos</h1>
            <p className={`text-sm mt-0.5 ${textMut}`}>{eventos.length} evento{eventos.length !== 1 ? "s" : ""} en total</p>
          </div>
          <Link
            href="/evento/nuevo"
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold transition-colors"
          >
            <Plus className="w-4 h-4" /> Crear evento
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
        ) : eventos.length === 0 ? (
          <div className={`rounded-3xl border p-12 text-center ${card}`}>
            <CalendarClock className={`w-12 h-12 mx-auto mb-3 ${textMut}`} />
            <p className={`text-base font-bold ${textPri}`}>Todavía no creaste ningún evento</p>
            <p className={`text-sm mt-1 mb-6 ${textMut}`}>Creá tu primer evento y publicalo cuando esté listo</p>
            <Link
              href="/evento/nuevo"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-sm transition-colors"
            >
              <Plus className="w-4 h-4" /> Crear primer evento
            </Link>
          </div>
        ) : (
          <>
            {/* Borradores */}
            {borradores.length > 0 && (
              <section className="space-y-3">
                <p className={`text-xs font-bold uppercase tracking-wider ${textMut}`}>
                  Borradores ({borradores.length})
                </p>
                {borradores.map(e => (
                  <EventoCard
                    key={e.id}
                    evento={e}
                    isDark={isDark}
                    card={card}
                    textPri={textPri}
                    textMut={textMut}
                    toggling={toggling}
                    deleting={deleting}
                    onToggle={handleToggleEstado}
                    onDelete={handleDelete}
                  />
                ))}
              </section>
            )}

            {/* Publicados */}
            {publicados.length > 0 && (
              <section className="space-y-3">
                <p className={`text-xs font-bold uppercase tracking-wider ${textMut}`}>
                  Publicados ({publicados.length})
                </p>
                {publicados.map(e => (
                  <EventoCard
                    key={e.id}
                    evento={e}
                    isDark={isDark}
                    card={card}
                    textPri={textPri}
                    textMut={textMut}
                    toggling={toggling}
                    deleting={deleting}
                    onToggle={handleToggleEstado}
                    onDelete={handleDelete}
                  />
                ))}
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function EventoCard({
  evento, isDark, card, textPri, textMut, toggling, deleting, onToggle, onDelete,
}: {
  evento: Evento;
  isDark: boolean;
  card: string;
  textPri: string;
  textMut: string;
  toggling: string | null;
  deleting: string | null;
  onToggle: (e: Evento) => void;
  onDelete: (e: Evento) => void;
}) {
  const banner = evento.banner ? resolvePhotoUrl(evento.banner) : null;
  const isBorrador = evento.borrador ?? true;
  const isToggling = toggling === evento.id;
  const isDeleting = deleting === evento.id;

  return (
    <div className={`rounded-2xl border overflow-hidden ${card}`}>
      <div className="flex gap-3 p-4">
        {/* Thumbnail */}
        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
          {banner ? (
            <Image src={banner} alt={evento.nombre} width={64} height={64} className="object-cover w-full h-full" />
          ) : (
            <div className={`w-full h-full flex items-center justify-center text-2xl ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
              {CATEGORIA_EMOJI[evento.categoria] ?? "📌"}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            <h3 className={`text-sm font-bold flex-1 min-w-0 truncate ${textPri}`}>{evento.nombre}</h3>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
              isBorrador
                ? isDark ? "bg-amber-500/20 text-amber-400" : "bg-amber-50 text-amber-600"
                : isDark ? "bg-green-500/20 text-green-400" : "bg-green-50 text-green-600"
            }`}>
              {isBorrador ? "Borrador" : "Publicado"}
            </span>
          </div>
          <div className={`flex items-center gap-1.5 text-xs mt-1 ${textMut}`}>
            <CalendarDays className="w-3.5 h-3.5 flex-shrink-0" />
            {formatFecha(evento.fecha)}
          </div>
          <div className={`flex items-center gap-1.5 text-xs mt-0.5 ${textMut}`}>
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{evento.lugar}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className={`flex border-t ${isDark ? "border-gray-800" : "border-gray-100"}`}>
        <Link
          href={`/evento/${evento.slug}`}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors ${isDark ? "text-gray-400 hover:bg-gray-800" : "text-gray-500 hover:bg-gray-50"}`}
        >
          <Eye className="w-3.5 h-3.5" /> Ver
        </Link>
        <div className={`w-px ${isDark ? "bg-gray-800" : "bg-gray-100"}`} />
        <Link
          href={`/evento/${evento.slug}?editar=1`}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors ${isDark ? "text-gray-400 hover:bg-gray-800" : "text-gray-500 hover:bg-gray-50"}`}
        >
          <Pencil className="w-3.5 h-3.5" /> Editar
        </Link>
        <div className={`w-px ${isDark ? "bg-gray-800" : "bg-gray-100"}`} />
        <button
          onClick={() => onToggle(evento)}
          disabled={isToggling}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold transition-colors disabled:opacity-50 ${
            isBorrador
              ? "text-indigo-400 hover:bg-indigo-500/10"
              : isDark ? "text-gray-400 hover:bg-gray-800" : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          {isToggling
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : isBorrador
              ? <><Eye className="w-3.5 h-3.5" /> Publicar</>
              : <><EyeOff className="w-3.5 h-3.5" /> Despublicar</>
          }
        </button>
        {isBorrador && (
          <>
            <div className={`w-px ${isDark ? "bg-gray-800" : "bg-gray-100"}`} />
            <button
              onClick={() => onDelete(evento)}
              disabled={isDeleting}
              className={`flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold transition-colors disabled:opacity-50 ${isDark ? "text-red-500/70 hover:bg-red-500/10 hover:text-red-400" : "text-red-400 hover:bg-red-50 hover:text-red-500"}`}
            >
              {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
